import {
  BaseModule,
  EventConfig,
  HealthStatus,
  EventListener,
  WebSocketEventType,
} from "./types";

export class EventManager implements BaseModule {
  private config: EventConfig;
  private listeners: Map<string, EventListener[]> = new Map();
  private eventHistory: WebSocketEventType[] = [];
  private maxHistorySize = 100;
  private eventEmitters: Map<string, (data: any) => void> = new Map();

  constructor(config: EventConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    
    // Event system is ready to use
  }

  async destroy(): Promise<void> {
    
    this.listeners.clear();
    this.eventHistory.length = 0;
    this.eventEmitters.clear();
  }

  getHealthStatus(): HealthStatus {
    const totalListeners = Array.from(this.listeners.values()).reduce(
      (sum, listeners) => sum + listeners.length,
      0,
    );

    return {
      healthy: totalListeners <= this.config.maxListeners,
      lastCheck: new Date(),
      error:
        totalListeners > this.config.maxListeners
          ? "Too many listeners"
          : undefined,
      details: {
        totalListeners,
        maxListeners: this.config.maxListeners,
        eventTypes: this.listeners.size,
        historySize: this.eventHistory.length,
      },
    };
  }

  // Add event listener
  addListener(
    event: string,
    callback: (data: any) => void,
    options: { once?: boolean; priority?: number } = {},
  ): string {
    const { once = false, priority = 0 } = options;

    if (this.listeners.size >= this.config.maxListeners) {
      
      throw new Error("Max listeners limit reached");
    }

    const listenerId = `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const listener: EventListener = {
      id: listenerId,
      event,
      callback,
      once,
      priority,
    };

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const eventListeners = this.listeners.get(event)!;

    // Insert by priority (higher priority first)
    const insertIndex = eventListeners.findIndex((l) => l.priority < priority);
    if (insertIndex === -1) {
      eventListeners.push(listener);
    } else {
      eventListeners.splice(insertIndex, 0, listener);
    }

    
    return listenerId;
  }

  // Remove event listener
  removeListener(event: string, listenerId: string): boolean {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return false;

    const index = eventListeners.findIndex((l) => l.id === listenerId);
    if (index === -1) return false;

    eventListeners.splice(index, 1);

    // Clean up empty event arrays
    if (eventListeners.length === 0) {
      this.listeners.delete(event);
    }

    
    return true;
  }

  // Remove all listeners for an event
  removeAllListeners(event?: string): void {
    if (event) {
      const removed = this.listeners.get(event)?.length || 0;
      this.listeners.delete(event);
      
    } else {
      const totalRemoved = Array.from(this.listeners.values()).reduce(
        (sum, listeners) => sum + listeners.length,
        0,
      );
      this.listeners.clear();
      
    }
  }

  // Emit event to all listeners
  async emit(event: string, data: any): Promise<boolean> {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners || eventListeners.length === 0) {
      // No listeners for this event - not necessarily an error
      return true;
    }

    

    // Add to history
    this.addToHistory(event as WebSocketEventType);

    // Create promises for all listeners
    const promises: Promise<void>[] = [];
    const listenersToRemove: EventListener[] = [];

    for (const listener of eventListeners) {
      promises.push(
        Promise.race([
          new Promise<void>((resolve) => {
            try {
              listener.callback(data);
              resolve();
            } catch (error) {
              
              resolve(); // Don't fail the whole emit
            }
          }),
          new Promise<void>((_, reject) =>
            setTimeout(
              () => reject(new Error("Listener timeout")),
              this.config.emitTimeout,
            ),
          ),
        ]).then(() => {
          if (listener.once) {
            listenersToRemove.push(listener);
          }
        }),
      );
    }

    try {
      await Promise.allSettled(promises);

      // Remove 'once' listeners
      for (const listener of listenersToRemove) {
        this.removeListener(event, listener.id);
      }

      return true;
    } catch (error) {
      
      return false;
    }
  }

  // Register an event emitter (for external event sources like WebSocket)
  registerEmitter(event: string, emitter: (data: any) => void): void {
    if (this.eventEmitters.has(event)) {
      
    }

    this.eventEmitters.set(event, emitter);
    
  }

  // Unregister an event emitter
  unregisterEmitter(event: string): boolean {
    const removed = this.eventEmitters.delete(event);
    if (removed) {
      
    }
    return removed;
  }

  // Emit event using registered emitter (for external communication)
  emitExternal(event: string, data: any): boolean {
    const emitter = this.eventEmitters.get(event);
    if (!emitter) {
      
      return false;
    }

    try {
      emitter(data);
      
      return true;
    } catch (error) {
      
      return false;
    }
  }

  // Get listeners for an event (for debugging)
  getListeners(event: string): EventListener[] {
    return this.listeners.get(event) || [];
  }

  // Get all event types
  getEventTypes(): string[] {
    return Array.from(this.listeners.keys());
  }

  // Get event statistics
  getStats(): {
    totalListeners: number;
    eventTypes: number;
    historySize: number;
    emittersCount: number;
  } {
    const totalListeners = Array.from(this.listeners.values()).reduce(
      (sum, listeners) => sum + listeners.length,
      0,
    );

    return {
      totalListeners,
      eventTypes: this.listeners.size,
      historySize: this.eventHistory.length,
      emittersCount: this.eventEmitters.size,
    };
  }

  // Get recent event history
  getEventHistory(limit: number = 10): WebSocketEventType[] {
    return this.eventHistory.slice(-limit);
  }

  // Clear event history
  clearHistory(): void {
    this.eventHistory.length = 0;
    
  }

  private addToHistory(event: WebSocketEventType): void {
    this.eventHistory.push(event);

    // Maintain max history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  // Convenience methods for common patterns

  // Listen for an event once
  once(event: string, callback: (data: any) => void): string {
    return this.addListener(event, callback, { once: true });
  }

  // Listen with high priority
  onHighPriority(event: string, callback: (data: any) => void): string {
    return this.addListener(event, callback, { priority: 10 });
  }

  // Listen with low priority
  onLowPriority(event: string, callback: (data: any) => void): string {
    return this.addListener(event, callback, { priority: -10 });
  }
}
