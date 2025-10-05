import { BaseModule, QueueConfig, HealthStatus, QueuedMessage } from "./types";

export class MessageQueue implements BaseModule {
  private config: QueueConfig;
  private queue: QueuedMessage[] = [];
  private processingTimer: ReturnType<typeof setInterval> | null = null;
  private lastMessageTime = 0;
  private isProcessing = false;
  private messageEmitter: ((message: QueuedMessage) => void) | null = null;
  private stats = {
    processed: 0,
    failed: 0,
    rateLimited: 0,
    queueFull: 0,
  };

  constructor(config: QueueConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    
    this.startProcessing();
  }

  async destroy(): Promise<void> {
    
    this.stopProcessing();
    this.queue.length = 0;
    this.messageEmitter = null;
  }

  getHealthStatus(): HealthStatus {
    const queueSize = this.queue.length;
    const isHealthy = queueSize < this.config.maxSize;

    return {
      healthy: isHealthy,
      lastCheck: new Date(),
      error: !isHealthy
        ? `Queue size exceeded: ${queueSize}/${this.config.maxSize}`
        : undefined,
      details: {
        queueSize,
        maxSize: this.config.maxSize,
        isProcessing: this.isProcessing,
        processingTimer: this.processingTimer !== null,
        stats: this.stats,
      },
    };
  }

  // Add message to queue
  addMessage(
    event: string,
    data: any,
    options: {
      priority?: "low" | "normal" | "high" | "critical";
      maxRetries?: number;
    } = {},
  ): boolean {
    const { priority = "normal", maxRetries = this.config.maxRetries } =
      options;

    if (this.queue.length >= this.config.maxSize) {
      
      this.stats.queueFull++;
      return false;
    }

    const queuedMessage: QueuedMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event,
      data,
      timestamp: Date.now(),
      priority,
      retryCount: 0,
      maxRetries,
    };

    // Insert by priority (higher priority first)
    const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
    const insertIndex = this.queue.findIndex(
      (msg) => priorityOrder[msg.priority] < priorityOrder[priority],
    );

    if (insertIndex === -1) {
      this.queue.push(queuedMessage);
    } else {
      this.queue.splice(insertIndex, 0, queuedMessage);
    }

    
    return true;
  }

  // Set message emitter (called when message should be sent)
  setMessageEmitter(emitter: (message: QueuedMessage) => void): void {
    this.messageEmitter = emitter;
    
  }

  // Get queue statistics
  getStats(): {
    queueSize: number;
    processing: boolean;
    processed: number;
    failed: number;
    rateLimited: number;
    queueFull: number;
  } {
    return {
      queueSize: this.queue.length,
      processing: this.isProcessing,
      ...this.stats,
    };
  }

  // Get messages in queue (for debugging)
  getQueuedMessages(): QueuedMessage[] {
    return [...this.queue];
  }

  // Clear queue
  clearQueue(): void {
    const clearedCount = this.queue.length;
    this.queue.length = 0;
    
  }

  // Force process next message (for testing)
  forceProcessNext(): boolean {
    if (this.queue.length === 0 || !this.messageEmitter) {
      return false;
    }

    const message = this.queue.shift()!;
    this.processMessage(message);
    return true;
  }

  private startProcessing(): void {
    

    this.processingTimer = setInterval(() => {
      this.processQueue();
    }, this.config.processingInterval);
  }

  private stopProcessing(): void {
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = null;
      
    }
  }

  private processQueue(): void {
    if (this.isProcessing || this.queue.length === 0 || !this.messageEmitter) {
      return;
    }

    this.isProcessing = true;

    try {
      // Process only one message at a time to avoid overwhelming
      const message = this.queue[0];
      if (message) {
        this.processMessage(message);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processMessage(message: QueuedMessage): Promise<void> {
    const now = Date.now();
    const timeSinceLastMessage = now - this.lastMessageTime;

    // Check rate limiting
    if (timeSinceLastMessage < this.config.rateLimitMs) {
      // Too soon, will be processed in next cycle
      
      this.stats.rateLimited++;
      return;
    }

    if (!this.messageEmitter) {
      
      return;
    }

    try {
      

      // Emit message
      await this.emitMessage(message);

      // Remove from queue
      const index = this.queue.findIndex((m) => m.id === message.id);
      if (index !== -1) {
        this.queue.splice(index, 1);
      }

      this.lastMessageTime = now;
      this.stats.processed++;

      
    } catch (error) {
      

      message.retryCount++;

      if (message.retryCount >= message.maxRetries) {
        

        // Remove from queue
        const index = this.queue.findIndex((m) => m.id === message.id);
        if (index !== -1) {
          this.queue.splice(index, 1);
        }

        this.stats.failed++;
      } else {
        
      }
    }
  }

  private async emitMessage(message: QueuedMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.messageEmitter) {
        reject(new Error("No message emitter set"));
        return;
      }

      try {
        this.messageEmitter(message);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Priority-based message sending methods
  sendMessage(event: string, data: any): boolean {
    return this.addMessage(event, data, { priority: "normal" });
  }

  sendHighPriorityMessage(event: string, data: any): boolean {
    return this.addMessage(event, data, { priority: "high" });
  }

  sendCriticalMessage(event: string, data: any): boolean {
    return this.addMessage(event, data, { priority: "critical" });
  }

  // Batch operations
  addMessages(
    messages: Array<{
      event: string;
      data: any;
      priority?: QueuedMessage["priority"];
    }>,
  ): number {
    let addedCount = 0;

    for (const msg of messages) {
      if (this.addMessage(msg.event, msg.data, { priority: msg.priority })) {
        addedCount++;
      }
    }

    
    return addedCount;
  }

  // Queue management
  getQueueSize(): number {
    return this.queue.length;
  }

  isQueueEmpty(): boolean {
    return this.queue.length === 0;
  }

  isQueueFull(): boolean {
    return this.queue.length >= this.config.maxSize;
  }

  // Get queue status for monitoring
  getQueueStatus(): {
    size: number;
    capacity: number;
    utilization: number;
    isProcessing: boolean;
    oldestMessage?: Date;
    newestMessage?: Date;
  } {
    const oldestMessage =
      this.queue.length > 0 ? new Date(this.queue[0].timestamp) : undefined;
    const newestMessage =
      this.queue.length > 0
        ? new Date(this.queue[this.queue.length - 1].timestamp)
        : undefined;

    return {
      size: this.queue.length,
      capacity: this.config.maxSize,
      utilization: (this.queue.length / this.config.maxSize) * 100,
      isProcessing: this.isProcessing,
      oldestMessage,
      newestMessage,
    };
  }
}
