import { ConnectionManager } from "./connection";
import { EventManager } from "./events";
import { MetricsMonitor } from "./metrics";
import { MessageQueue } from "./queue";
import { RoomManager } from "./rooms";
import { WebSocketConfig, DEFAULT_CONFIG, HealthStatus } from "./types";

// Re-export types for convenience
export * from "./types";

/**
 * Refactored WebSocket Service using modular architecture
 * Maintains backward compatibility with the original WebSocketService interface
 */
export class WebSocketService {
  // Singleton instance (maintains original pattern)
  private static instance: WebSocketService | null = null;

  // Modular components
  private connectionManager: ConnectionManager;
  private eventManager: EventManager;
  private metricsMonitor: MetricsMonitor;
  private messageQueue: MessageQueue;
  private roomManager: RoomManager;

  // Configuration
  private config: WebSocketConfig;

  // Legacy state (for backward compatibility)
  private userId: string | null = null;
  private isDestroyed = false;

  private constructor(config: Partial<WebSocketConfig> = {}) {
    // Merge with defaults
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize modules
    this.connectionManager = new ConnectionManager(this.config.connection);
    this.eventManager = new EventManager(this.config.events);
    this.metricsMonitor = new MetricsMonitor(this.config.metrics);
    this.messageQueue = new MessageQueue(this.config.queue);
    this.roomManager = new RoomManager();

    // Setup inter-module communication
    this.setupModuleCommunication();

    
  }

  // Singleton pattern (maintains original interface)
  static getInstance(config?: Partial<WebSocketConfig>): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService(config);
    }
    return WebSocketService.instance;
  }

  // Legacy singleton method (backward compatibility)

  // Initialize all modules
  async initialize(): Promise<void> {
    if (this.isDestroyed) {
      throw new Error("WebSocket service has been destroyed");
    }

    

    try {
      await Promise.all([
        this.connectionManager.initialize(),
        this.eventManager.initialize(),
        this.metricsMonitor.initialize(),
        this.messageQueue.initialize(),
        this.roomManager.initialize(),
      ]);

      
    } catch (error) {
      
      throw error;
    }
  }

  // Destroy service and clean up
  async destroy(): Promise<void> {
    

    try {
      await Promise.all([
        this.connectionManager.destroy(),
        this.eventManager.destroy(),
        this.metricsMonitor.destroy(),
        this.messageQueue.destroy(),
        this.roomManager.destroy(),
      ]);

      this.isDestroyed = true;
      WebSocketService.instance = null;

      
    } catch (error) {
      
      throw error;
    }
  }

  // Setup communication between modules
  private setupModuleCommunication(): void {
    // Connection events -> Event manager
    this.connectionManager.on("connected", (data) => {
      this.eventManager.emit("connect", data);
      this.metricsMonitor.recordConnectionStart();
    });

    this.connectionManager.on("disconnected", (data) => {
      this.eventManager.emit("disconnect", data);
      this.metricsMonitor.recordConnectionEnd();
    });

    this.connectionManager.on("connect_error", (data) => {
      this.eventManager.emit("connect_error", data);
      this.metricsMonitor.recordError("connection_error");
    });

    this.connectionManager.on("reconnecting", (data) => {
      this.eventManager.emit("reconnecting", data);
    });

    this.connectionManager.on("reconnected", (data) => {
      this.eventManager.emit("reconnected", data);
    });

    // Message queue -> Connection manager
    this.messageQueue.setMessageEmitter((message) => {
      if (this.connectionManager.isConnected()) {
        const socket = this.connectionManager.getSocket();
        if (socket) {
          socket.emit(message.event, message.data);
          this.metricsMonitor.recordMessageSent();
        }
      }
    });

    // Room manager -> Message queue
    this.roomManager.setRoomEmitter((event, roomId, data) => {
      switch (event) {
        case "room_joined":
          this.messageQueue.sendMessage("join_room", { roomId });
          break;
        case "room_left":
          this.messageQueue.sendMessage("leave_room", { roomId });
          break;
        case "broadcast":
          if (data?.event && data?.data) {
            this.messageQueue.sendMessage(data.event, { ...data.data, roomId });
          }
          break;
      }
    });
  }

  // ===== PUBLIC API (Maintains backward compatibility) =====

  // Connection management
  async connect(userId: string, token: string): Promise<void> {
    this.userId = userId;
    const success = await this.connectionManager.connect(userId, token);

    if (!success) {
      throw new Error("Failed to establish WebSocket connection");
    }
  }

  disconnect(): void {
    this.connectionManager.disconnect();
  }

  forceReconnect(): Promise<boolean> {
    return this.connectionManager.forceReconnect();
  }

  // Room management
  joinRideRoom(rideId: number): void {
    this.roomManager.joinRideRoom(rideId);
  }

  leaveRideRoom(rideId: number): void {
    this.roomManager.leaveRideRoom(rideId);
  }

  leaveAllRooms(): void {
    this.roomManager.leaveAllRooms();
  }

  // Message sending
  sendMessage(rideId: number, message: string): void {
    this.messageQueue.sendMessage("sendMessage", { rideId, message });
  }

  sendTypingStart(rideId: number): void {
    this.messageQueue.sendMessage("typingStart", { rideId });
  }

  sendTypingStop(rideId: number): void {
    this.messageQueue.sendMessage("typingStop", { rideId });
  }

  // Emergency handling
  triggerEmergency(emergencyData: any): void {
    this.messageQueue.sendCriticalMessage("triggerEmergency", emergencyData);
  }

  // Driver status updates
  updateDriverStatus(statusData: any): void {
    this.messageQueue.sendMessage("updateDriverStatus", statusData);
  }

  // Earnings and performance
  requestEarningsUpdate(driverId: string): void {
    this.messageQueue.sendMessage("requestEarningsUpdate", { driverId });
  }

  requestPerformanceData(driverId: string): void {
    this.messageQueue.sendMessage("requestPerformanceData", { driverId });
  }

  // Vehicle management
  updateVehicleChecklist(vehicleData: any): void {
    this.messageQueue.sendMessage("updateVehicleChecklist", vehicleData);
  }

  // ===== BUSINESS EVENT HANDLERS =====
  // These would be called by the connection manager when receiving events

  private handleRideStatusUpdate(data: any): void {
    this.eventManager.emit("rideStatusUpdate", data);
    this.metricsMonitor.recordEvent("rideStatusUpdate");
  }

  private handleDriverLocationUpdate(data: any): void {
    this.eventManager.emit("driverLocationUpdate", data);
    this.metricsMonitor.recordEvent("driverLocationUpdate");
  }

  private handleNewMessage(data: any): void {
    this.eventManager.emit("newMessage", data);
    this.metricsMonitor.recordMessageReceived();

    // Update room activity
    if (data.rideId) {
      this.roomManager.updateRoomActivity(`ride_${data.rideId}`);
    }
  }

  private handleTypingEvent(type: "start" | "stop", data: any): void {
    const event = type === "start" ? "typingStart" : "typingStop";
    this.eventManager.emit(event, data);
    this.metricsMonitor.recordEvent(event);
  }

  // ===== MONITORING AND HEALTH =====

  getHealthStatus(): HealthStatus {
    // Aggregate health from all modules
    const moduleHealth = [
      this.connectionManager.getHealthStatus(),
      this.eventManager.getHealthStatus(),
      this.metricsMonitor.getHealthStatus(),
      { healthy: true, lastCheck: new Date() }, // Queue and Room managers are always healthy
      this.roomManager.getHealthStatus(),
    ];

    const allHealthy = moduleHealth.every((h) => h.healthy);
    const latestCheck = new Date(
      Math.max(...moduleHealth.map((h) => h.lastCheck.getTime())),
    );

    return {
      healthy: allHealthy,
      lastCheck: latestCheck,
      error: allHealthy ? undefined : "One or more modules are unhealthy",
      details: {
        modules: moduleHealth,
        overall: {
          connected: this.connectionManager.isConnected(),
          activeRooms: this.roomManager.getActiveRooms().length,
          queueSize: this.messageQueue.getQueueSize(),
          totalEvents: this.eventManager.getStats().totalListeners,
        },
      },
    };
  }

  // Get comprehensive service status
  getServiceStatus(): {
    connected: boolean;
    userId: string | null;
    activeRooms: number;
    queueSize: number;
    metrics: any;
    health: HealthStatus;
  } {
    return {
      connected: this.connectionManager.isConnected(),
      userId: this.userId,
      activeRooms: this.roomManager.getActiveRooms().length,
      queueSize: this.messageQueue.getQueueSize(),
      metrics: this.metricsMonitor.getDetailedStats(),
      health: this.getHealthStatus(),
    };
  }

  // ===== LEGACY COMPATIBILITY METHODS =====
  // These maintain the exact same interface as the original service

  // Legacy getters
  get isConnected(): boolean {
    return this.connectionManager.isConnected();
  }

  get connectionStatus(): string {
    return this.connectionManager.isConnected() ? "connected" : "disconnected";
  }

  // Legacy performance metrics (mapped to new system)
  get performanceMetrics(): any {
    const metrics = this.metricsMonitor.getMetrics();
    return {
      messagesSent: metrics.messagesSent,
      messagesReceived: metrics.messagesReceived,
      connectionUptime: Math.floor(metrics.connectionUptime / 1000), // Convert to seconds
      averageResponseTime: metrics.averageResponseTime,
      errorRate: metrics.errorRate,
      lastUpdated: metrics.lastUpdated,
    };
  }

  // Legacy message queue access
  get queuedMessages(): any[] {
    // Return a read-only view of the queue for backward compatibility
    return this.messageQueue.getQueuedMessages().map((msg) => ({
      event: msg.event,
      data: msg.data,
      timestamp: msg.timestamp,
      priority: msg.priority,
    }));
  }

  // Legacy reset method
  resetPerformanceMetrics(): void {
    this.metricsMonitor.resetMetrics();
  }
}
