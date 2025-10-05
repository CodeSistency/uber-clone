import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchAPI } from "../fetch";
import { connectivityManager } from "../connectivity";

export interface QueuedRequest {
  id: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  priority: "low" | "medium" | "high" | "critical";
  userId?: string;
  requiresAuth?: boolean;
}

export interface OfflineQueueStats {
  total: number;
  byPriority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  oldestRequest: number | null;
  newestRequest: number | null;
  averageAge: number;
}

export class OfflineQueue {
  private static instance: OfflineQueue;
  private queue: QueuedRequest[] = [];
  private isProcessing = false;
  private readonly STORAGE_KEY = "@offline_queue";
  private readonly MAX_QUEUE_SIZE = 1000;
  private readonly BATCH_SIZE = 5;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly BASE_RETRY_DELAY = 1000; // 1 second
  private readonly MAX_RETRY_DELAY = 30000; // 30 seconds

  // Event listeners for queue changes
  private listeners: ((queue: QueuedRequest[]) => void)[] = [];

  static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) {
      OfflineQueue.instance = new OfflineQueue();
    }
    return OfflineQueue.instance;
  }

  private constructor() {
    this.loadQueueFromStorage();
  }

  async initialize(): Promise<void> {
    
    await this.loadQueueFromStorage();
    
  }

  private async loadQueueFromStorage(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        
      }
    } catch (error) {
      
      this.queue = [];
    }
  }

  private async persistQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener([...this.queue]);
      } catch (error) {
        
      }
    });
  }

  // Public API methods
  async add(
    request: Omit<QueuedRequest, "id" | "timestamp" | "retryCount">,
  ): Promise<string> {
    const queuedRequest: QueuedRequest = {
      ...request,
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    // Remove old requests if queue is too large
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      
      this.queue = this.queue.slice(-this.MAX_QUEUE_SIZE + 1);
    }

    this.queue.push(queuedRequest);
    await this.persistQueue();
    this.notifyListeners();

    
    return queuedRequest.id;
  }

  async remove(id: string): Promise<boolean> {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter((req) => req.id !== id);

    if (this.queue.length < initialLength) {
      await this.persistQueue();
      this.notifyListeners();
      
      return true;
    }

    return false;
  }

  async clear(): Promise<void> {
    this.queue = [];
    await this.persistQueue();
    this.notifyListeners();
    
  }

  getQueue(): QueuedRequest[] {
    return [...this.queue];
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getStats(): OfflineQueueStats {
    if (this.queue.length === 0) {
      return {
        total: 0,
        byPriority: { critical: 0, high: 0, medium: 0, low: 0 },
        oldestRequest: null,
        newestRequest: null,
        averageAge: 0,
      };
    }

    const now = Date.now();
    const timestamps = this.queue.map((req) => req.timestamp);
    const oldestRequest = Math.min(...timestamps);
    const newestRequest = Math.max(...timestamps);
    const averageAge =
      timestamps.reduce((sum, ts) => sum + (now - ts), 0) / timestamps.length;

    const byPriority = this.queue.reduce(
      (acc, req) => {
        acc[req.priority]++;
        return acc;
      },
      { critical: 0, high: 0, medium: 0, low: 0 },
    );

    return {
      total: this.queue.length,
      byPriority,
      oldestRequest,
      newestRequest,
      averageAge,
    };
  }

  // Priority-based queue management
  private getPriorityWeight(priority: QueuedRequest["priority"]): number {
    switch (priority) {
      case "critical":
        return 4;
      case "high":
        return 3;
      case "medium":
        return 2;
      case "low":
        return 1;
      default:
        return 2;
    }
  }

  private sortByPriority(): void {
    this.queue.sort((a, b) => {
      // First sort by priority weight
      const priorityDiff =
        this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority);
      if (priorityDiff !== 0) return priorityDiff;

      // Then by timestamp (older first)
      return a.timestamp - b.timestamp;
    });
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      
      return;
    }

    // Check if we should attempt network operations
    if (!connectivityManager.shouldAttemptNetworkOperation()) {
      
      return;
    }

    this.isProcessing = true;
    

    // Sort queue by priority before processing
    this.sortByPriority();

    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    // Process in batches
    for (let i = 0; i < this.queue.length; i += this.BATCH_SIZE) {
      const batch = this.queue.slice(i, i + this.BATCH_SIZE);

      const batchPromises = batch.map(async (request) => {
        try {
          

          // Calculate delay based on retry count
          if (request.retryCount > 0) {
            const delay = this.calculateRetryDelay(request.retryCount - 1);
            
            await new Promise((resolve) => setTimeout(resolve, delay));
          }

          // Execute the request
          const response = await this.executeRequest(request);

          // Success - remove from queue
          await this.remove(request.id);
          successCount++;

          
          return { success: true, request };
        } catch (error) {
          

          // Check if we should retry
          if (this.shouldRetry(error, request)) {
            // Increment retry count and re-queue
            request.retryCount++;
            request.timestamp = Date.now(); // Update timestamp for sorting

            
            errorCount++;
            return { success: false, request, willRetry: true };
          } else {
            // Max retries reached or non-retryable error
            await this.remove(request.id);
            errorCount++;
            
            return { success: false, request, willRetry: false };
          }
        }
      });

      // Wait for batch to complete
      await Promise.allSettled(batchPromises);
      processedCount += batch.length;
    }

    await this.persistQueue();
    this.notifyListeners();

    
    this.isProcessing = false;
  }

  private async executeRequest(request: QueuedRequest): Promise<any> {
    const options: any = {
      method: request.method,
      requiresAuth: request.requiresAuth,
    };

    if (request.data) {
      options.body = JSON.stringify(request.data);
      options.headers = {
        "Content-Type": "application/json",
        ...request.headers,
      };
    }

    return fetchAPI(request.endpoint, options);
  }

  private shouldRetry(error: any, request: QueuedRequest): boolean {
    // Don't retry if max attempts reached
    if (request.retryCount >= this.MAX_RETRY_ATTEMPTS) {
      return false;
    }

    // Retry on network errors
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return true;
    }

    // Retry on specific HTTP status codes
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    if (error.statusCode && retryableStatusCodes.includes(error.statusCode)) {
      return true;
    }

    // Retry on token expiration (401) if authentication is required
    if (error.statusCode === 401 && request.requiresAuth) {
      return true;
    }

    return false;
  }

  private calculateRetryDelay(retryCount: number): number {
    const delay = this.BASE_RETRY_DELAY * Math.pow(2, retryCount);
    return Math.min(delay, this.MAX_RETRY_DELAY);
  }

  // Event system
  onQueueChange(listener: (queue: QueuedRequest[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Utility methods
  getRequestsByPriority(priority: QueuedRequest["priority"]): QueuedRequest[] {
    return this.queue.filter((req) => req.priority === priority);
  }

  getRequestsByEndpoint(endpoint: string): QueuedRequest[] {
    return this.queue.filter((req) => req.endpoint.includes(endpoint));
  }

  getOldestRequest(): QueuedRequest | null {
    if (this.queue.length === 0) return null;
    return this.queue.reduce((oldest, current) =>
      current.timestamp < oldest.timestamp ? current : oldest,
    );
  }

  getNewestRequest(): QueuedRequest | null {
    if (this.queue.length === 0) return null;
    return this.queue.reduce((newest, current) =>
      current.timestamp > newest.timestamp ? current : newest,
    );
  }

  // Cleanup old requests (older than 24 hours)
  async cleanupOldRequests(
    maxAge: number = 24 * 60 * 60 * 1000,
  ): Promise<number> {
    const now = Date.now();
    const initialCount = this.queue.length;

    this.queue = this.queue.filter((req) => now - req.timestamp < maxAge);

    const removedCount = initialCount - this.queue.length;
    if (removedCount > 0) {
      await this.persistQueue();
      this.notifyListeners();
      
    }

    return removedCount;
  }

  // Emergency cleanup - remove all requests of a specific priority
  async clearByPriority(priority: QueuedRequest["priority"]): Promise<number> {
    const initialCount = this.queue.length;
    this.queue = this.queue.filter((req) => req.priority !== priority);

    const removedCount = initialCount - this.queue.length;
    if (removedCount > 0) {
      await this.persistQueue();
      this.notifyListeners();
      
    }

    return removedCount;
  }
}

// Singleton instance
export const offlineQueue = OfflineQueue.getInstance();
