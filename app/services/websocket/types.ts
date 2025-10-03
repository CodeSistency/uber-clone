// WebSocket Service - Shared Types and Interfaces

export interface WebSocketConfig {
  connection: ConnectionConfig;
  queue: QueueConfig;
  events: EventConfig;
  metrics: MetricsConfig;
}

export interface ConnectionConfig {
  url: string;
  timeout: number;
  maxRetries: number;
  reconnectDelay: number;
  heartbeatInterval: number;
  authTimeout: number;
}

export interface QueueConfig {
  maxSize: number;
  processingInterval: number;
  rateLimitMs: number;
  maxRetries: number;
}

export interface EventConfig {
  maxListeners: number;
  emitTimeout: number;
}

export interface MetricsConfig {
  enableMetrics: boolean;
  metricsInterval: number;
  retentionPeriod: number;
}

export interface BaseModule {
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  getHealthStatus(): HealthStatus;
}

export interface HealthStatus {
  healthy: boolean;
  lastCheck: Date;
  error?: string;
  details?: Record<string, any>;
}

export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  lastConnected?: Date;
  lastDisconnected?: Date;
  reconnectAttempts: number;
  connectionId?: string;
}

export interface QueuedMessage {
  id: string;
  event: string;
  data: any;
  timestamp: number;
  priority: "low" | "normal" | "high" | "critical";
  retryCount: number;
  maxRetries: number;
}

export interface RoomState {
  roomId: string;
  joinedAt: Date;
  memberCount: number;
  lastActivity: Date;
  isActive: boolean;
}

export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: Date;
  roomId?: string;
  userId?: string;
}

export interface PerformanceMetrics {
  messagesSent: number;
  messagesReceived: number;
  connectionUptime: number;
  averageResponseTime: number;
  errorRate: number;
  lastUpdated: Date;
}

export interface EventListener {
  id: string;
  event: string;
  callback: (data: any) => void;
  once: boolean;
  priority: number;
}

// Default configurations
export const DEFAULT_CONFIG: WebSocketConfig = {
  connection: {
    url: "",
    timeout: 10000,
    maxRetries: 5,
    reconnectDelay: 1000,
    heartbeatInterval: 30000,
    authTimeout: 5000,
  },
  queue: {
    maxSize: 50,
    processingInterval: 100,
    rateLimitMs: 100,
    maxRetries: 3,
  },
  events: {
    maxListeners: 100,
    emitTimeout: 5000,
  },
  metrics: {
    enableMetrics: true,
    metricsInterval: 60000, // 1 minute
    retentionPeriod: 3600000, // 1 hour
  },
};

// Connection events
export type ConnectionEvent =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "reconnected"
  | "connect_error"
  | "auth_error"
  | "timeout";

// Message events
export type MessageEvent =
  | "message"
  | "message_sent"
  | "message_failed"
  | "queue_full"
  | "rate_limited";

// Room events
export type RoomEvent =
  | "room_joined"
  | "room_left"
  | "room_error"
  | "member_joined"
  | "member_left";

// Business events (from original service)
export type BusinessEvent =
  | "rideStatusUpdate"
  | "driverLocationUpdate"
  | "newMessage"
  | "typingStart"
  | "typingStop"
  | "earningsUpdate"
  | "performanceUpdate"
  | "rideNotification"
  | "emergencyTriggered"
  | "vehicleUpdate";

export type WebSocketEventType =
  | ConnectionEvent
  | MessageEvent
  | RoomEvent
  | BusinessEvent;
