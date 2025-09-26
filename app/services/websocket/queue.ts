import { BaseModule, QueueConfig, HealthStatus, QueuedMessage } from './types';

export class MessageQueue implements BaseModule {
  private config: QueueConfig;
  private queue: QueuedMessage[] = [];
  private processingTimer: number | null = null;
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
    console.log('[MessageQueue] Initializing message queue');
    this.startProcessing();
  }

  async destroy(): Promise<void> {
    console.log('[MessageQueue] Destroying message queue');
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
      error: !isHealthy ? `Queue size exceeded: ${queueSize}/${this.config.maxSize}` : undefined,
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
      priority?: 'low' | 'normal' | 'high' | 'critical';
      maxRetries?: number;
    } = {}
  ): boolean {
    const { priority = 'normal', maxRetries = this.config.maxRetries } = options;

    if (this.queue.length >= this.config.maxSize) {
      console.warn(`[MessageQueue] Queue full (${this.config.maxSize}), message dropped: ${event}`);
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
    const insertIndex = this.queue.findIndex(msg => priorityOrder[msg.priority] < priorityOrder[priority]);

    if (insertIndex === -1) {
      this.queue.push(queuedMessage);
    } else {
      this.queue.splice(insertIndex, 0, queuedMessage);
    }

    console.log(`[MessageQueue] Message queued: ${event} (priority: ${priority}, queue size: ${this.queue.length})`);
    return true;
  }

  // Set message emitter (called when message should be sent)
  setMessageEmitter(emitter: (message: QueuedMessage) => void): void {
    this.messageEmitter = emitter;
    console.log('[MessageQueue] Message emitter set');
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
    console.log(`[MessageQueue] Queue cleared (${clearedCount} messages removed)`);
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
    console.log(`[MessageQueue] Starting queue processing (interval: ${this.config.processingInterval}ms)`);

    this.processingTimer = setInterval(() => {
      this.processQueue();
    }, this.config.processingInterval);
  }

  private stopProcessing(): void {
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = null;
      console.log('[MessageQueue] Stopped queue processing');
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
      console.log(`[MessageQueue] Rate limited, waiting... (${timeSinceLastMessage}ms since last message)`);
      this.stats.rateLimited++;
      return;
    }

    if (!this.messageEmitter) {
      console.warn('[MessageQueue] No message emitter set, skipping message');
      return;
    }

    try {
      console.log(`[MessageQueue] Processing message: ${message.event} (id: ${message.id})`);

      // Emit message
      await this.emitMessage(message);

      // Remove from queue
      const index = this.queue.findIndex(m => m.id === message.id);
      if (index !== -1) {
        this.queue.splice(index, 1);
      }

      this.lastMessageTime = now;
      this.stats.processed++;

      console.log(`[MessageQueue] Message processed successfully: ${message.event}`);

    } catch (error) {
      console.error(`[MessageQueue] Error processing message ${message.id}:`, error);

      message.retryCount++;

      if (message.retryCount >= message.maxRetries) {
        console.error(`[MessageQueue] Message failed permanently after ${message.maxRetries} retries: ${message.id}`);

        // Remove from queue
        const index = this.queue.findIndex(m => m.id === message.id);
        if (index !== -1) {
          this.queue.splice(index, 1);
        }

        this.stats.failed++;
      } else {
        console.log(`[MessageQueue] Message will be retried (attempt ${message.retryCount}/${message.maxRetries}): ${message.id}`);
      }
    }
  }

  private async emitMessage(message: QueuedMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.messageEmitter) {
        reject(new Error('No message emitter set'));
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
    return this.addMessage(event, data, { priority: 'normal' });
  }

  sendHighPriorityMessage(event: string, data: any): boolean {
    return this.addMessage(event, data, { priority: 'high' });
  }

  sendCriticalMessage(event: string, data: any): boolean {
    return this.addMessage(event, data, { priority: 'critical' });
  }

  // Batch operations
  addMessages(messages: Array<{ event: string; data: any; priority?: QueuedMessage['priority'] }>): number {
    let addedCount = 0;

    for (const msg of messages) {
      if (this.addMessage(msg.event, msg.data, { priority: msg.priority })) {
        addedCount++;
      }
    }

    console.log(`[MessageQueue] Batch added ${addedCount}/${messages.length} messages`);
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
    const oldestMessage = this.queue.length > 0 ? new Date(this.queue[0].timestamp) : undefined;
    const newestMessage = this.queue.length > 0 ? new Date(this.queue[this.queue.length - 1].timestamp) : undefined;

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
