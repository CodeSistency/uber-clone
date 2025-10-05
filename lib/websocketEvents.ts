/**
 * Type-Safe WebSocket Event System
 * 
 * Define todos los tipos de eventos WebSocket con sus payloads correspondientes
 * para garantizar type safety en toda la aplicación.
 */

// ===== EVENT PAYLOAD TYPES =====

export interface RideRequestedPayload {
  rideId: number;
  area: string;
  timestamp: string;
  expiresAt?: string;
  originAddress?: string;
  destinationAddress?: string;
  farePrice?: number;
  distance?: number;
  passenger?: {
    name: string;
    phone: string;
    rating: number;
  };
}

export interface RideAcceptedPayload {
  rideId: number;
  driverId: number;
  estimatedArrivalMinutes: number;
  timestamp: string;
}

export interface RideRejectedPayload {
  rideId: number;
  driverId: number;
  reason: string;
  timestamp: string;
}

export interface RideArrivedPayload {
  rideId: number;
  driverId: number;
  driverName: string;
  vehicleInfo: string;
  timestamp: string;
}

export interface RideStartedPayload {
  rideId: number;
  driverId: number;
  driverName: string;
  timestamp: string;
}

export interface RideCompletedPayload {
  rideId: number;
  driverId: number;
  driverName: string;
  fare: number;
  distance: number;
  duration: number;
  timestamp: string;
}

export interface RideCancelledPayload {
  rideId: number;
  driverId: number;
  reason: string;
  cancelledBy: "driver" | "passenger" | "system";
  timestamp: string;
}

export interface DriverLocationUpdatePayload {
  rideId: number;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: string;
}

export interface ChatMessagePayload {
  id: number;
  rideId?: number;
  orderId?: number;
  senderId: string;
  message: string;
  messageType: "text" | "location" | "system";
  timestamp: string;
  sender?: {
    id: number;
    name: string;
    profileImage?: string;
  };
}

export interface TypingStartPayload {
  rideId: number;
  senderId: string;
}

export interface TypingStopPayload {
  rideId: number;
  senderId: string;
}

export interface EmergencyTriggeredPayload {
  rideId: number;
  userId: string;
  type: "sos" | "accident" | "medical" | "other";
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  description?: string;
}

export interface PaymentGroupCreatedPayload {
  groupId: string;
  serviceType: "transport" | "delivery" | "errand" | "parcel";
  serviceId: number;
  totalAmount: number;
  payments: Array<{
    id: string;
    method: string;
    amount: number;
    status: "pending" | "confirmed" | "cancelled" | "expired";
    reference?: string;
    bankCode?: string;
    description?: string;
  }>;
  expiresAt: string;
}

export interface PaymentConfirmedPayload {
  groupId: string;
  paymentId: string;
  amount: number;
  confirmedAt: string;
}

export interface PaymentGroupCompletedPayload {
  groupId: string;
  serviceType: "transport" | "delivery" | "errand" | "parcel";
  serviceId: number;
  totalAmount: number;
  completedAt: string;
}

export interface OrderCreatedPayload {
  orderId: number;
  store: {
    name: string;
    address: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  deliveryAddress: string;
  totalAmount: number;
  timestamp: string;
}

export interface ErrandCreatedPayload {
  errandId: number;
  description: string;
  pickupAddress: string;
  dropoffAddress: string;
  estimatedFare: number;
  timestamp: string;
}

export interface ParcelCreatedPayload {
  parcelId: number;
  type: string;
  pickupAddress: string;
  dropoffAddress: string;
  estimatedFare: number;
  timestamp: string;
}

export interface VehicleStatusUpdatePayload {
  vehicleId: number;
  status: "online" | "offline" | "maintenance" | "inactive";
  lastChecked: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface EarningsUpdatePayload {
  driverId: number;
  earnings: number;
  tripCount: number;
  todayEarnings: number;
  period: "day" | "week" | "month";
  timestamp: string;
}

export interface PerformanceUpdatePayload {
  driverId: number;
  weeklyStats: {
    rides: number;
    earnings: number;
    rating: number;
    completionRate: number;
  };
  recommendations: string[];
  timestamp: string;
}

// ===== EVENT MAP =====

export interface WebSocketEventMap {
  // Ride lifecycle events
  "ride:requested": RideRequestedPayload;
  "ride:accepted": RideAcceptedPayload;
  "ride:rejected": RideRejectedPayload;
  "ride:arrived": RideArrivedPayload;
  "ride:started": RideStartedPayload;
  "ride:completed": RideCompletedPayload;
  "ride:cancelled": RideCancelledPayload;

  // Driver events - CORREGIDOS para coincidir con documentación
  "driverIncomingRequest": RideRequestedPayload;
  "driver:ride-request": RideRequestedPayload;
  "driver:location:updated": DriverLocationUpdatePayload; // ✅ CORREGIDO
  "driverLocationUpdate": DriverLocationUpdatePayload; // ✅ Mantener compatibilidad
  "vehicleStatusUpdate": VehicleStatusUpdatePayload;
  "earningsUpdate": EarningsUpdatePayload;
  "performanceUpdate": PerformanceUpdatePayload;

  // Chat events
  "chat:new-message": ChatMessagePayload;
  "chat:message": ChatMessagePayload;
  "typingStart": TypingStartPayload;
  "typingStop": TypingStopPayload;

  // Emergency events - CORREGIDOS para coincidir con documentación
  "emergency:sos": EmergencyTriggeredPayload; // ✅ CORREGIDO
  "emergency:sos-triggered": EmergencyTriggeredPayload; // ✅ NUEVO
  "emergencyTriggered": EmergencyTriggeredPayload; // ✅ Mantener compatibilidad

  // Payment events
  "payment:group:created": PaymentGroupCreatedPayload;
  "payment:group:updated": PaymentGroupCreatedPayload;
  "payment:confirmed": PaymentConfirmedPayload;
  "payment:group:completed": PaymentGroupCompletedPayload;
  "payment:group:cancelled": PaymentGroupCreatedPayload;
  "payment:status": {
    groupId: string;
    paymentId: string;
    status: string;
    message?: string;
  };

  // Service-specific events
  "order:created": OrderCreatedPayload;
  "order:modified": OrderCreatedPayload;
  "orderAccepted": { orderId: number; timestamp: string };
  "orderPickedUp": { orderId: number; timestamp: string };
  "orderDelivered": { orderId: number; timestamp: string };
  "orderCancelled": { orderId: number; reason: string; timestamp: string };

  "errand:created": ErrandCreatedPayload;
  "errandAccepted": { errandId: number; timestamp: string };
  "errandShoppingUpdate": { errandId: number; timestamp: string };
  "errandStarted": { errandId: number; timestamp: string };
  "errandCompleted": { errandId: number; timestamp: string };
  "errandCancelled": { errandId: number; reason: string; timestamp: string };

  "parcel:created": ParcelCreatedPayload;
  "parcelAccepted": { parcelId: number; timestamp: string };
  "parcelPickedUp": { parcelId: number; timestamp: string };
  "parcelDelivered": { parcelId: number; timestamp: string };
  "parcelCancelled": { parcelId: number; reason: string; timestamp: string };

  // Room management events - CORREGIDOS para coincidir con documentación
  "ride:join": { rideId: number; userId: string }; // ✅ CORREGIDO
  "ride:leave": { rideId: number; userId: string }; // ✅ NUEVO
  "driver:join": { driverId: number }; // ✅ NUEVO
  "driver:leave": { driverId: number }; // ✅ NUEVO

  // Matching events - NUEVOS para coincidir con documentación
  "matching-event": {
    type: "driver-found" | "search-timeout" | "search-cancelled";
    searchId: string;
    data: any;
  }; // ✅ NUEVO

  // System events
  "joinedRoom": { roomId: string; timestamp: string };
  "rideNotification": RideRequestedPayload;
  "rideCreated": { ride: any };
  "rideStatusUpdate": {
    ride: any;
    oldStatus: string;
    newStatus: string;
    rideId: number;
  };
}

// ===== TYPE-SAFE EVENT MANAGER =====

export class TypedWebSocketEventManager {
  private static instance: TypedWebSocketEventManager;
  private listeners: Map<keyof WebSocketEventMap, Function[]> = new Map();

  static getInstance(): TypedWebSocketEventManager {
    if (!TypedWebSocketEventManager.instance) {
      TypedWebSocketEventManager.instance = new TypedWebSocketEventManager();
    }
    return TypedWebSocketEventManager.instance;
  }

  /**
   * Register a type-safe event listener
   */
  on<K extends keyof WebSocketEventMap>(
    event: K,
    callback: (data: WebSocketEventMap[K]) => void
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Remove a type-safe event listener
   */
  off<K extends keyof WebSocketEventMap>(
    event: K,
    callback: (data: WebSocketEventMap[K]) => void
  ): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit a type-safe event
   */
  emit<K extends keyof WebSocketEventMap>(
    event: K,
    data: WebSocketEventMap[K]
  ): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          
        }
      });
    }
  }

  /**
   * Get all registered events
   */
  getRegisteredEvents(): (keyof WebSocketEventMap)[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Get listener count for an event
   */
  getListenerCount<K extends keyof WebSocketEventMap>(event: K): number {
    return this.listeners.get(event)?.length || 0;
  }

  /**
   * Clear all listeners
   */
  clearAllListeners(): void {
    this.listeners.clear();
  }
}

// Export singleton instance
export const typedWebSocketEventManager = TypedWebSocketEventManager.getInstance();

// ===== HELPER FUNCTIONS =====

/**
 * Type-safe event listener registration
 */
export function onWebSocketEvent<K extends keyof WebSocketEventMap>(
  event: K,
  callback: (data: WebSocketEventMap[K]) => void
): void {
  typedWebSocketEventManager.on(event, callback);
}

/**
 * Type-safe event emission
 */
export function emitWebSocketEvent<K extends keyof WebSocketEventMap>(
  event: K,
  data: WebSocketEventMap[K]
): void {
  typedWebSocketEventManager.emit(event, data);
}

/**
 * Type-safe event listener removal
 */
export function offWebSocketEvent<K extends keyof WebSocketEventMap>(
  event: K,
  callback: (data: WebSocketEventMap[K]) => void
): void {
  typedWebSocketEventManager.off(event, callback);
}

// ===== EVENT TYPE GUARDS =====

export function isRideRequestedEvent(data: any): data is RideRequestedPayload {
  return data && typeof data.rideId === 'number' && typeof data.area === 'string';
}

export function isRideAcceptedEvent(data: any): data is RideAcceptedPayload {
  return data && typeof data.rideId === 'number' && typeof data.driverId === 'number';
}

export function isChatMessageEvent(data: any): data is ChatMessagePayload {
  return data && typeof data.id === 'number' && typeof data.message === 'string';
}

export function isEmergencyEvent(data: any): data is EmergencyTriggeredPayload {
  return data && typeof data.rideId === 'number' && typeof data.type === 'string';
}
