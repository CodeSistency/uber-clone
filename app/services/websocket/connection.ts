import { io, Socket } from "socket.io-client";
import {
  BaseModule,
  ConnectionConfig,
  ConnectionState,
  HealthStatus,
  WebSocketEvent,
} from "./types";

export class ConnectionManager implements BaseModule {
  private socket: Socket | null = null;
  private config: ConnectionConfig;
  private state: ConnectionState;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private eventListeners: Map<string, (data: any) => void> = new Map();
  private authToken: string | null = null;
  private userId: string | null = null;

  constructor(config: ConnectionConfig) {
    this.config = config;
    this.state = {
      isConnected: false,
      isConnecting: false,
      reconnectAttempts: 0,
    };

    this.setupEventListeners();
  }

  async initialize(): Promise<void> {
    
    // Connection will be established when connect() is called
  }

  async destroy(): Promise<void> {
    
    await this.disconnect();
    this.clearTimers();
    this.eventListeners.clear();
  }

  getHealthStatus(): HealthStatus {
    const now = new Date();
    const isHealthy = this.state.isConnected && this.socket?.connected;

    return {
      healthy: !!isHealthy,
      lastCheck: now,
      error: !isHealthy ? "WebSocket not connected" : undefined,
      details: {
        connected: this.state.isConnected,
        socketConnected: this.socket?.connected,
        reconnectAttempts: this.state.reconnectAttempts,
        lastConnected: this.state.lastConnected,
        lastDisconnected: this.state.lastDisconnected,
      },
    };
  }

  async connect(userId: string, token: string): Promise<boolean> {
    if (this.state.isConnecting) {
      
      return false;
    }

    this.state.isConnecting = true;
    this.authToken = token;
    this.userId = userId;

    try {
      

      // Create socket connection
      this.socket = io(this.config.url, {
        transports: ["websocket"],
        timeout: this.config.timeout,
        auth: {
          token,
          userId,
        },
        autoConnect: false,
      });

      return new Promise((resolve, reject) => {
        const authTimeout = setTimeout(() => {
          
          this.state.isConnecting = false;
          reject(new Error("Authentication timeout"));
        }, this.config.authTimeout);

        this.socket!.on("connect", () => {
          clearTimeout(authTimeout);
          
          this.handleConnect();
          resolve(true);
        });

        this.socket!.on("connect_error", (error) => {
          clearTimeout(authTimeout);
          
          this.state.isConnecting = false;
          this.handleConnectionError(error);
          reject(error);
        });

        this.socket!.on("disconnect", (reason) => {
          
          this.handleDisconnect(reason);
        });

        // Connect
        this.socket!.connect();
      });
    } catch (error) {
      
      this.state.isConnecting = false;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    

    this.clearTimers();

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.state.isConnected = false;
    this.state.isConnecting = false;
    this.state.lastDisconnected = new Date();

    // Emit disconnect event
    this.emitEvent("disconnected", {
      reason: "manual",
      timestamp: new Date(),
    });
  }

  async forceReconnect(): Promise<boolean> {
    

    await this.disconnect();

    if (this.authToken && this.userId) {
      return this.connect(this.userId, this.authToken);
    }

    return false;
  }

  private handleConnect(): void {
    this.state.isConnected = true;
    this.state.isConnecting = false;
    this.state.lastConnected = new Date();
    this.state.reconnectAttempts = 0;

    
    this.startHeartbeat();

    this.emitEvent("connected", {
      timestamp: new Date(),
      connectionId: this.socket?.id,
    });
  }

  private handleDisconnect(reason: string): void {
    this.state.isConnected = false;
    this.state.lastDisconnected = new Date();

    this.clearTimers();

    // Attempt reconnection if not manual disconnect
    if (reason !== "io client disconnect") {
      this.scheduleReconnection();
    }

    this.emitEvent("disconnected", {
      reason,
      timestamp: new Date(),
    });
  }

  private handleConnectionError(error: any): void {
    

    this.state.isConnected = false;
    this.state.isConnecting = false;

    this.emitEvent("connect_error", {
      error: error.message,
      timestamp: new Date(),
    });

    // Schedule reconnection
    this.scheduleReconnection();
  }

  private scheduleReconnection(): void {
    if (this.state.reconnectAttempts >= this.config.maxRetries) {
      
      this.emitEvent("reconnect_failed", {
        attempts: this.state.reconnectAttempts,
        timestamp: new Date(),
      });
      return;
    }

    this.state.reconnectAttempts++;

    // Exponential backoff
    const delay =
      this.config.reconnectDelay *
      Math.pow(2, this.state.reconnectAttempts - 1);
    const clampedDelay = Math.min(delay, 30000); // Max 30 seconds

    

    this.reconnectTimer = setTimeout(async () => {
      this.emitEvent("reconnecting", {
        attempt: this.state.reconnectAttempts,
        timestamp: new Date(),
      });

      if (this.authToken && this.userId) {
        try {
          await this.connect(this.userId, this.authToken);
        } catch (error) {
          
        }
      }
    }, clampedDelay);
  }

  private startHeartbeat(): void {
    this.clearHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.connected) {
        const pingTime = Date.now();
        this.socket.emit("ping", { timestamp: pingTime });

        // Set timeout for pong response
        const pongTimeout = setTimeout(() => {
          
          this.socket?.disconnect();
        }, 5000);

        // Listen for pong once
        this.socket.once("pong", (data: any) => {
          clearTimeout(pongTimeout);
          const latency = Date.now() - pingTime;
          

          this.emitEvent("heartbeat", {
            latency,
            timestamp: new Date(),
          });
        });
      }
    }, this.config.heartbeatInterval);
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.clearHeartbeat();
  }

  private setupEventListeners(): void {
    // These will be set up when socket connects
  }

  // Event system for communication with other modules
  on(event: string, callback: (data: any) => void): void {
    this.eventListeners.set(event, callback);
  }

  off(event: string): void {
    this.eventListeners.delete(event);
  }

  private emitEvent(event: string, data: any): void {
    const listener = this.eventListeners.get(event);
    if (listener) {
      try {
        listener(data);
      } catch (error) {
        
      }
    }
  }

  // Public getters
  getState(): ConnectionState {
    return { ...this.state };
  }

  isConnected(): boolean {
    return this.state.isConnected && this.socket?.connected === true;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}
