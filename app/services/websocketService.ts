import { io, Socket } from "socket.io-client";

import { driverDeliveryService } from "@/app/services/driverDeliveryService";
import { driverErrandService } from "@/app/services/driverErrandService";
import { driverParcelService } from "@/app/services/driverParcelService";
import { driverTransportService } from "@/app/services/driverTransportService";
import { locationTrackingService } from "@/app/services/locationTrackingService";
import { generateIdempotencyKey } from "@/lib/utils";
import { useDevStore } from "@/store/dev/dev";
import { useDriverConfigStore } from "@/store/driverConfig/driverConfig";
import { useMapFlowStore, FLOW_STEPS } from "@/store/mapFlow/mapFlow";

import {
  useRealtimeStore,
  useChatStore,
  useNotificationStore,
} from "../../store";
import { LocationData, NotificationType } from "../../types/type";

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, Function[]> = new Map();
  private heartbeatInterval: number | null = null;

  // Performance optimizations
  private messageQueue: Array<{ event: string; data: any; timestamp: number }> = [];
  private isProcessingQueue = false;
  private lastMessageTime = 0;
  private messageRateLimit = 100; // ms between messages
  private maxQueueSize = 50;
  private performanceMetrics = {
    messagesSent: 0,
    messagesReceived: 0,
    connectionTime: 0,
    disconnects: 0,
    avgResponseTime: 0,
  };

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  async connect(userId: string, token: string): Promise<void> {
    if (
      useDevStore.getState().developerMode &&
      useDevStore.getState().wsBypass
    ) {
      console.log(
        "[WebSocketService] WS bypass enabled (developerMode), skipping connect",
      );
      useRealtimeStore.getState().setConnectionStatus({
        isConnected: true,
        connectionType: "wifi",
        websocketConnected: false,
        lastPing: new Date(),
      } as any);
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      try {
        console.log("[WebSocketService] Connecting to server...", { userId });

        // Initialize socket connection with enhanced configuration
        this.socket = io(
          `${process.env.EXPO_PUBLIC_WS_URL || "wss://gnuhealth-back.alcaravan.com.ve"}/rides`,
          {
            auth: {
              token,
              userId,
            },
            transports: ["websocket"],
            upgrade: false,
            timeout: 10000, // Increased timeout for better reliability
            reconnection: false, // We'll handle reconnection manually for better control
            forceNew: false, // Reuse connection if possible
            multiplex: true, // Enable multiplexing for better performance
            // Performance optimizations
            perMessageDeflate: { threshold: 1024 }, // Enable compression for messages > 1KB
            // Error handling
            autoConnect: false, // We'll connect manually
          },
        );

        // Enhanced connection events
        this.socket.on("connect", () => {
          console.log("[WebSocketService] Connected successfully");
          this.reconnectAttempts = 0;
          this.performanceMetrics.connectionTime = Date.now();
          this.startHeartbeat();
          this.updateConnectionStatus(true);

          // Process any queued messages
          if (this.messageQueue.length > 0) {
            console.log(`[WebSocketService] Processing ${this.messageQueue.length} queued messages`);
            this.processMessageQueue();
          }

          // Set up location tracking callback to break circular dependency
          locationTrackingService.setWebSocketUpdateCallback(
            (rideId: number, location: any) => {
              this.updateDriverLocation(rideId, location);
            }
          );

          resolve();
        });

        this.socket.on("disconnect", (reason: any) => {
          console.log("[WebSocketService] Disconnected:", reason);
          this.handleDisconnect(reason);
        });

        this.socket.on("connect_error", (error: any) => {
          console.error("[WebSocketService] Connection error:", error);
          this.handleConnectionError(error);
          reject(error);
        });

        // Additional error handling events
        this.socket.on("error", (error: any) => {
          console.error("[WebSocketService] Socket error:", error);
          this.handleSocketError(error);
        });

        this.socket.on("reconnect_error", (error: any) => {
          console.error("[WebSocketService] Reconnection error:", error);
          this.handleReconnectionError(error);
        });

        this.socket.on("reconnect_failed", () => {
          console.error("[WebSocketService] Reconnection failed after all attempts");
          this.handleReconnectionFailed();
        });

        this.socket.on("ping", () => {
          console.debug("[WebSocketService] Ping received");
        });

        this.socket.on("pong", () => {
          console.debug("[WebSocketService] Pong received");

          // Calculate response time
          if (this.lastPingTime > 0) {
            const responseTime = Date.now() - this.lastPingTime;
            this.updateResponseTime(responseTime);
            this.lastPingTime = 0;
          }
        });

        // Track incoming messages for performance metrics
        this.socket.onAny((eventName: string, ...args: any[]) => {
          if (eventName !== "ping" && eventName !== "pong" && eventName !== "connect" && eventName !== "disconnect") {
            this.performanceMetrics.messagesReceived++;
          }
        });

        // Set up message handlers
        this.setupMessageHandlers();
      } catch (error) {
        console.error("[WebSocketService] Connection failed:", error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    console.log("[WebSocketService] Disconnecting...");

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.updateConnectionStatus(false);
  }

  // Room management
  joinRideRoom(rideId: number): void {
    if (this.socket && this.socket.connected) {
      console.log("[WebSocketService] Joining ride room:", rideId);
      this.socket.emit("joinRideRoom", { rideId });
    } else {
      console.warn("[WebSocketService] Cannot join room: not connected");
    }
  }

  leaveRideRoom(rideId: number): void {
    if (this.socket && this.socket.connected) {
      console.log("[WebSocketService] Leaving ride room:", rideId);
      this.socket.emit("leaveRideRoom", { rideId });
    }
  }

  // Enhanced message sending with rate limiting and queueing
  sendMessage(rideId: number, message: string): void {
    if (
      useDevStore.getState().developerMode &&
      useDevStore.getState().wsBypass
    ) {
      console.log("[WebSocketService] WS bypass: sendMessage noop");
      return;
    }

    const messageData = {
      rideId,
      message,
      timestamp: new Date(),
    };

    // Rate limiting
    const now = Date.now();
    const timeSinceLastMessage = now - this.lastMessageTime;

    if (timeSinceLastMessage < this.messageRateLimit) {
      // Queue message if rate limited
      this.queueMessage("sendMessage", messageData);
      return;
    }

    if (this.socket && this.socket.connected) {
      console.log("[WebSocketService] Sending message:", messageData);
      this.socket.emit("sendMessage", messageData);
      this.lastMessageTime = now;
      this.performanceMetrics.messagesSent++;
    } else {
      console.warn("[WebSocketService] Cannot send message: not connected, queuing");
      this.queueMessage("sendMessage", messageData);
    }
  }

  // Queue message for later sending
  private queueMessage(event: string, data: any): void {
    if (this.messageQueue.length >= this.maxQueueSize) {
      console.warn("[WebSocketService] Message queue full, dropping oldest message");
      this.messageQueue.shift(); // Remove oldest message
    }

    this.messageQueue.push({
      event,
      data,
      timestamp: Date.now(),
    });

    console.log(`[WebSocketService] Message queued: ${this.messageQueue.length} in queue`);
  }

  // Process queued messages
  private processMessageQueue(): void {
    if (this.isProcessingQueue || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    const processNext = () => {
      if (this.messageQueue.length === 0) {
        this.isProcessingQueue = false;
        return;
      }

      const queuedMessage = this.messageQueue.shift();
      if (!queuedMessage) return;

      const now = Date.now();
      const timeSinceLastMessage = now - this.lastMessageTime;

      if (timeSinceLastMessage >= this.messageRateLimit) {
        if (this.socket && this.socket.connected) {
          console.log("[WebSocketService] Sending queued message:", queuedMessage.event);
          this.socket.emit(queuedMessage.event, queuedMessage.data);
          this.lastMessageTime = now;
          this.performanceMetrics.messagesSent++;

          // Process next message after rate limit
          setTimeout(processNext, this.messageRateLimit);
        } else {
          // Re-queue if still not connected
          console.log("[WebSocketService] Still not connected, re-queuing message");
          this.messageQueue.unshift(queuedMessage);
          this.isProcessingQueue = false;
        }
      } else {
        // Wait for rate limit
        setTimeout(processNext, this.messageRateLimit - timeSinceLastMessage);
      }
    };

    processNext();
  }

  // Location updates
  updateDriverLocation(rideId: number, location: LocationData): void {
    if (
      useDevStore.getState().developerMode &&
      useDevStore.getState().wsBypass
    ) {
      console.log("[WebSocketService] WS bypass: updateDriverLocation noop");
      return;
    }
    if (this.socket && this.socket.connected) {
      const locationData = {
        rideId,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        },
        timestamp: new Date(),
      };

      this.socket.emit("updateDriverLocation", locationData);
    }
  }

  // Typing indicators
  sendTypingStart(rideId: number): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("typingStart", { rideId });
    }
  }

  sendTypingStop(rideId: number): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("typingStop", { rideId });
    }
  }

  // Emergency
  triggerEmergency(emergencyData: any): void {
    if (this.socket && this.socket.connected) {
      console.log("[WebSocketService] Triggering emergency:", emergencyData);
      this.socket.emit("triggerEmergency", emergencyData);
    } else {
      console.warn(
        "[WebSocketService] Cannot trigger emergency: not connected",
      );
    }
  }

  // Enhanced driver methods
  updateDriverStatus(statusData: any): void {
    if (this.socket && this.socket.connected) {
      console.log("[WebSocketService] Updating driver status:", statusData);
      this.socket.emit("updateDriverStatus", statusData);
    }
  }

  requestEarningsUpdate(driverId: string): void {
    if (this.socket && this.socket.connected) {
      console.log(
        "[WebSocketService] Requesting earnings update for:",
        driverId,
      );
      this.socket.emit("requestEarningsUpdate", { driverId });
    }
  }

  requestPerformanceData(driverId: string): void {
    if (this.socket && this.socket.connected) {
      console.log(
        "[WebSocketService] Requesting performance data for:",
        driverId,
      );
      this.socket.emit("requestPerformanceData", { driverId });
    }
  }

  updateVehicleChecklist(vehicleData: any): void {
    if (this.socket && this.socket.connected) {
      console.log(
        "[WebSocketService] Updating vehicle checklist:",
        vehicleData,
      );
      this.socket.emit("updateVehicleChecklist", vehicleData);
    }
  }

  // Connection status
  private updateConnectionStatus(connected: boolean, reason?: string): void {
    const connectionStatus = {
      isConnected: connected,
      connectionType: "wifi" as "none" | "wifi" | "cellular", // This would be determined by NetInfo
      websocketConnected: connected,
      lastPing: new Date(),
      disconnectReason: reason,
      reconnectAttempts: this.reconnectAttempts,
    };

    useRealtimeStore.getState().setConnectionStatus(connectionStatus);

    console.log("[WebSocketService] Connection status updated:", {
      connected,
      reason,
      attempts: this.reconnectAttempts
    });
  }

  // Message handlers setup
  private setupMessageHandlers(): void {
    if (!this.socket) return;

    // Ride status updates
    this.socket.on("rideStatusUpdate", (data: any) => {
      console.log("[WebSocketService] Ride status update:", data);
      this.handleRideStatusUpdate(data);
    });

    // Driver location updates
    this.socket.on("driverLocationUpdate", (data: any) => {
      console.log("[WebSocketService] Driver location update:", data);
      this.handleDriverLocationUpdate(data);
    });

    // New messages
    this.socket.on("newMessage", (data: any) => {
      console.log("[WebSocketService] New message:", data);
      this.handleNewMessage(data);
    });

    // Ride created
    this.socket.on("rideCreated", (data: any) => {
      console.log("[WebSocketService] Ride created:", data);
      this.handleRideCreated(data);
    });

    // Enhanced driver events
    this.socket.on("earningsUpdate", (data: any) => {
      console.log("[WebSocketService] Earnings update:", data);
      this.handleEarningsUpdate(data);
    });

    this.socket.on("performanceUpdate", (data: any) => {
      console.log("[WebSocketService] Performance update:", data);
      this.handlePerformanceUpdate(data);
    });

    this.socket.on("rideNotification", (data: any) => {
      console.log("[WebSocketService] Ride notification:", data);
      this.handleRideNotification(data);
    });

    // Driver incoming unified-flow request event
    this.socket.on("driverIncomingRequest", async (data: any) => {
      console.log("[WebSocketService] Driver incoming request:", data);
      try {
        // Store active ride context when available
        try {
          if (data?.ride) {
            useRealtimeStore.getState().setActiveRide(data.ride);
          }
        } catch {}

        useNotificationStore.getState().addNotification({
          id: `incoming_${data?.rideId || "unknown"}_${Date.now()}`,
          type: "RIDE_REQUEST" as NotificationType,
          title: "Nueva solicitud",
          message: `${(data?.service || "Servicio").toString().toUpperCase()} • ${data?.pickup?.address || "Origen"} → ${data?.dropoff?.address || "Destino"}`,
          data,
          timestamp: new Date(),
          isRead: false,
          priority: "high",
        });

        const startDriverStep = useMapFlowStore.getState().startWithDriverStep;
        const goTo = useMapFlowStore.getState().goTo;
        const svc = (data?.service || "").toString().toLowerCase();

        const prefs = useDriverConfigStore.getState().ridePreferences;
        const driverLoc = useRealtimeStore.getState().driverLocation;
        const pickupLat = data?.pickup?.latitude ?? data?.ride?.origin_latitude;
        const pickupLng =
          data?.pickup?.longitude ?? data?.ride?.origin_longitude;

        const haversineKm = (
          lat1: number,
          lon1: number,
          lat2: number,
          lon2: number,
        ) => {
          const toRad = (v: number) => (v * Math.PI) / 180;
          const R = 6371;
          const dLat = toRad(lat2 - lat1);
          const dLon = toRad(lon2 - lon1);
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
              Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };

        let withinRadius = true;
        if (prefs?.autoAccept && driverLoc && pickupLat && pickupLng) {
          try {
            const dist = haversineKm(
              driverLoc.latitude,
              driverLoc.longitude,
              pickupLat,
              pickupLng,
            );
            withinRadius = dist <= (prefs.autoAcceptRadius || 5);
          } catch {}
        }

        const id =
          data?.ride?.ride_id || data?.rideId || data?.orderId || data?.id;

        if (prefs?.autoAccept && id && withinRadius) {
          try {
            const key = generateIdempotencyKey();
            if (svc === "transport")
              await driverTransportService.accept(id, key);
            else if (svc === "delivery")
              await driverDeliveryService.accept(id, key);
            else if (svc === "mandado")
              await driverErrandService.accept(id, key);
            else if (svc === "envio") await driverParcelService.accept(id, key);
            if (id) this.joinRideRoom(id);
            if (svc === "transport")
              goTo(FLOW_STEPS.DRIVER_TRANSPORT.EN_CAMINO_ORIGEN);
            else if (svc === "delivery")
              goTo(FLOW_STEPS.DRIVER_DELIVERY.PREPARAR_PEDIDO);
            else if (svc === "mandado")
              goTo(FLOW_STEPS.DRIVER_MANDADO.EN_CAMINO_ORIGEN);
            else if (svc === "envio")
              goTo(FLOW_STEPS.DRIVER_ENVIO.EN_CAMINO_ORIGEN);
            return;
          } catch (e) {
            // Fallback to incoming
          }
        }

        if (svc === "transport") {
          startDriverStep(FLOW_STEPS.DRIVER_TRANSPORT.RECIBIR_SOLICITUD);
        } else if (svc === "delivery") {
          startDriverStep(FLOW_STEPS.DRIVER_DELIVERY.RECIBIR_SOLICITUD);
        } else if (svc === "mandado") {
          startDriverStep(FLOW_STEPS.DRIVER_MANDADO.RECIBIR_SOLICITUD);
        } else if (svc === "envio") {
          startDriverStep(FLOW_STEPS.DRIVER_ENVIO.RECIBIR_SOLICITUD);
        } else {
          startDriverStep(FLOW_STEPS.DRIVER_TRANSPORT.RECIBIR_SOLICITUD);
        }
      } catch (e) {
        console.error(
          "[WebSocketService] Error handling driverIncomingRequest:",
          e,
        );
      }
    });

    this.socket.on("vehicleStatusUpdate", (data: any) => {
      console.log("[WebSocketService] Vehicle status update:", data);
      this.handleVehicleStatusUpdate(data);
    });

    // Delivery WS events
    this.socket.on("order:created", (data: any) => {
      console.log("[WebSocketService] order:created:", data);
      this.handleOrderCreated(data);
    });

    this.socket.on("order:modified", (data: any) => {
      console.log("[WebSocketService] order:modified:", data);
      this.handleOrderModified(data);
    });

    this.socket.on("orderAccepted", (data: any) => {
      console.log("[WebSocketService] orderAccepted:", data);
      try {
        const goTo = useMapFlowStore.getState().goTo;
        goTo(FLOW_STEPS.DRIVER_DELIVERY.PREPARAR_PEDIDO);
      } catch {}
    });
    this.socket.on("orderPickedUp", (data: any) => {
      console.log("[WebSocketService] orderPickedUp:", data);
      try {
        const goTo = useMapFlowStore.getState().goTo;
        goTo(FLOW_STEPS.DRIVER_DELIVERY.EN_CAMINO_ENTREGA);
      } catch {}
    });
    this.socket.on("orderDelivered", (data: any) => {
      console.log("[WebSocketService] orderDelivered:", data);
      try {
        const startDriverStep = useMapFlowStore.getState().startWithDriverStep;
        startDriverStep(FLOW_STEPS.DRIVER_FINALIZACION_RATING as any);
        this.leaveAllRooms();
      } catch {}
    });
    this.socket.on("orderCancelled", (data: any) => {
      console.log("[WebSocketService] orderCancelled:", data);
      try {
        const startDriverStep = useMapFlowStore.getState().startWithDriverStep;
        startDriverStep(FLOW_STEPS.DRIVER_DISPONIBILIDAD);
        this.leaveAllRooms();
      } catch {}
    });

    // Errand WS events
    this.socket.on("errand:created", (data: any) => {
      console.log("[WebSocketService] errand:created:", data);
      this.handleErrandCreated(data);
    });

    this.socket.on("errandAccepted", (data: any) => {
      console.log("[WebSocketService] errandAccepted:", data);
      try {
        const goTo = useMapFlowStore.getState().goTo;
        goTo(FLOW_STEPS.DRIVER_MANDADO.EN_CAMINO_ORIGEN);
      } catch {}
    });
    this.socket.on("errandShoppingUpdate", (data: any) => {
      console.log("[WebSocketService] errandShoppingUpdate:", data);
      try {
        const goTo = useMapFlowStore.getState().goTo;
        goTo(FLOW_STEPS.DRIVER_MANDADO.RECOGER_PRODUCTOS);
      } catch {}
    });
    this.socket.on("errandStarted", (data: any) => {
      console.log("[WebSocketService] errandStarted:", data);
      try {
        const goTo = useMapFlowStore.getState().goTo;
        goTo(FLOW_STEPS.DRIVER_MANDADO.EN_CAMINO_DESTINO);
      } catch {}
    });
    this.socket.on("errandCompleted", (data: any) => {
      console.log("[WebSocketService] errandCompleted:", data);
      try {
        const startDriverStep = useMapFlowStore.getState().startWithDriverStep;
        startDriverStep(FLOW_STEPS.DRIVER_FINALIZACION_RATING as any);
        this.leaveAllRooms();
      } catch {}
    });
    this.socket.on("errandCancelled", (data: any) => {
      console.log("[WebSocketService] errandCancelled:", data);
      try {
        const startDriverStep = useMapFlowStore.getState().startWithDriverStep;
        startDriverStep(FLOW_STEPS.DRIVER_DISPONIBILIDAD);
        this.leaveAllRooms();
      } catch {}
    });

    // Parcel WS events
    this.socket.on("parcel:created", (data: any) => {
      console.log("[WebSocketService] parcel:created:", data);
      this.handleParcelCreated(data);
    });

    this.socket.on("parcelAccepted", (data: any) => {
      console.log("[WebSocketService] parcelAccepted:", data);
      try {
        const goTo = useMapFlowStore.getState().goTo;
        goTo(FLOW_STEPS.DRIVER_ENVIO.EN_CAMINO_ORIGEN);
      } catch {}
    });
    this.socket.on("parcelPickedUp", (data: any) => {
      console.log("[WebSocketService] parcelPickedUp:", data);
      try {
        const goTo = useMapFlowStore.getState().goTo;
        goTo(FLOW_STEPS.DRIVER_ENVIO.EN_CAMINO_DESTINO);
      } catch {}
    });
    this.socket.on("parcelDelivered", (data: any) => {
      console.log("[WebSocketService] parcelDelivered:", data);
      try {
        const startDriverStep = useMapFlowStore.getState().startWithDriverStep;
        startDriverStep(FLOW_STEPS.DRIVER_FINALIZACION_RATING as any);
        this.leaveAllRooms();
      } catch {}
    });
    this.socket.on("parcelCancelled", (data: any) => {
      console.log("[WebSocketService] parcelCancelled:", data);
      try {
        const startDriverStep = useMapFlowStore.getState().startWithDriverStep;
        startDriverStep(FLOW_STEPS.DRIVER_DISPONIBILIDAD);
        this.leaveAllRooms();
      } catch {}
    });

    // Typing indicators
    this.socket.on("typingStart", (data: any) => {
      this.handleTypingStart(data.rideId);
    });

    this.socket.on("typingStop", (data: any) => {
      this.handleTypingStop(data.rideId);
    });

    // Emergency events
    this.socket.on("emergencyTriggered", (data: any) => {
      console.log("[WebSocketService] Emergency triggered:", data);
      this.handleEmergencyTriggered(data);
    });

    // Payment events (Multiple payments)
    this.socket.on("payment:group:created", (data: any) => {
      console.log("[WebSocketService] payment:group:created:", data);
      this.handlePaymentGroupCreated(data);
    });

    this.socket.on("payment:group:updated", (data: any) => {
      console.log("[WebSocketService] payment:group:updated:", data);
      this.handlePaymentGroupUpdated(data);
    });

    this.socket.on("payment:confirmed", (data: any) => {
      console.log("[WebSocketService] payment:confirmed:", data);
      this.handlePaymentConfirmed(data);
    });

    this.socket.on("payment:group:completed", (data: any) => {
      console.log("[WebSocketService] payment:group:completed:", data);
      this.handlePaymentGroupCompleted(data);
    });

    this.socket.on("payment:group:cancelled", (data: any) => {
      console.log("[WebSocketService] payment:group:cancelled:", data);
      this.handlePaymentGroupCancelled(data);
    });

    this.socket.on("payment:status", (data: any) => {
      console.log("[WebSocketService] payment:status:", data);
      this.handlePaymentStatus(data);
    });

    // Joined room confirmation
    this.socket.on("joinedRoom", (data: any) => {
      console.log("[WebSocketService] Joined room:", data);
    });

    // Error handling
    this.socket.on("error", (error: any) => {
      console.error("[WebSocketService] Socket error:", error);
    });
  }

  // Event handlers
  private handleRideStatusUpdate(data: any): void {
    const { ride, oldStatus, newStatus, rideId } = data;

    // Update real-time store
    useRealtimeStore.getState().updateRideStatus(rideId, newStatus);

    // Create notification
    const notificationContent = this.getStatusNotificationContent(
      oldStatus,
      newStatus,
      ride,
    );
    if (notificationContent) {
      useNotificationStore.getState().addNotification({
        id: `ride_${rideId}_${Date.now()}`,
        type: this.getNotificationTypeForStatus(newStatus),
        title: notificationContent.title,
        message: notificationContent.body,
        data: { rideId, status: newStatus },
        timestamp: new Date(),
        isRead: false,
        priority: this.getPriorityForStatus(newStatus),
      });
    }

    // Flow transitions for driver unified flow
    try {
      const startDriverStep = useMapFlowStore.getState().startWithDriverStep;
      const goTo = useMapFlowStore.getState().goTo;
      if (newStatus === "cancelled") {
        startDriverStep(FLOW_STEPS.DRIVER_DISPONIBILIDAD);
        this.leaveAllRooms();
        try {
          useRealtimeStore.getState().stopTracking();
        } catch {}
      }
      if (newStatus === "accepted") {
        goTo(FLOW_STEPS.DRIVER_TRANSPORT.EN_CAMINO_ORIGEN);
      }
      if (newStatus === "arrived") {
        goTo(FLOW_STEPS.DRIVER_TRANSPORT.EN_ORIGEN);
      }
      if (newStatus === "in_progress") {
        goTo(FLOW_STEPS.DRIVER_TRANSPORT.EN_VIAJE);
        try {
          useRealtimeStore.getState().startTracking(rideId);
          locationTrackingService.start(rideId);
        } catch {}
      }
      if (newStatus === "completed") {
        startDriverStep(FLOW_STEPS.DRIVER_FINALIZACION_RATING as any);
        this.leaveAllRooms();
        try {
          useRealtimeStore.getState().stopTracking();
          locationTrackingService.stop();
        } catch {}
      }
    } catch (e) {
      console.warn("[WebSocketService] Flow transition handling error:", e);
    }
  }

  private handleDriverLocationUpdate(data: any): void {
    const { rideId, location, timestamp } = data;

    // Update real-time store
    useRealtimeStore.getState().updateDriverLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      timestamp: new Date(timestamp),
    });
  }

  private handleNewMessage(data: any): void {
    // Add to chat store
    useChatStore.getState().addMessage({
      id: data.id,
      rideId: data.rideId,
      senderId: data.senderId,
      senderType: data.senderType,
      message: data.message,
      messageType: data.messageType || "text",
      timestamp: new Date(data.timestamp),
      isRead: data.isRead || false,
    });

    // Create notification if not from current user
    const currentChatId = useChatStore.getState().activeChat;
    if (data.rideId !== currentChatId) {
      useNotificationStore.getState().addNotification({
        id: `message_${data.id}`,
        type: "CHAT_MESSAGE",
        title: "New Message",
        message:
          data.message.length > 50
            ? `${data.message.substring(0, 50)}...`
            : data.message,
        data: { rideId: data.rideId, messageId: data.id },
        timestamp: new Date(),
        isRead: false,
        priority: "normal",
      });
    }
  }

  private handleRideCreated(data: any): void {
    // Update real-time store
    useRealtimeStore.getState().setActiveRide(data.ride);
  }

  private handleTypingStart(rideId: number): void {
    useChatStore.getState().setTyping(true);
  }

  private handleTypingStop(rideId: number): void {
    useChatStore.getState().setTyping(false);
  }

  private handleEmergencyTriggered(data: any): void {
    // This would trigger emergency store updates
    console.log("[WebSocketService] Emergency triggered:", data);
  }

  // New event handlers for missing WebSocket events
  private handleOrderCreated(data: any): void {
    const { orderId, store, items, deliveryAddress } = data;

    // Update notification store
    useNotificationStore.getState().addNotification({
      id: `order_${orderId}_${Date.now()}`,
      type: "RIDE_REQUEST" as any,
      title: "Nueva Orden",
      message: `Pedido en ${store?.name || 'tienda'} • ${items?.length || 0} items`,
      data: { orderId, type: "delivery" },
      timestamp: new Date(),
      isRead: false,
      priority: "normal",
    });

    console.log("[WebSocketService] Order created notification sent:", orderId);
  }

  private handleOrderModified(data: any): void {
    const { orderId, modifications, totalChange } = data;

    // Update notification store
    useNotificationStore.getState().addNotification({
      id: `order_mod_${orderId}_${Date.now()}`,
      type: "SYSTEM_UPDATE" as any,
      title: "Orden Modificada",
      message: `Pedido ${orderId} actualizado • Cambio: $${totalChange || 0}`,
      data: { orderId, modifications },
      timestamp: new Date(),
      isRead: false,
      priority: "normal",
    });

    console.log("[WebSocketService] Order modified notification sent:", orderId);
  }

  private handleErrandCreated(data: any): void {
    const { errandId, description, pickupAddress, dropoffAddress } = data;

    // Update notification store
    useNotificationStore.getState().addNotification({
      id: `errand_${errandId}_${Date.now()}`,
      type: "RIDE_REQUEST" as any,
      title: "Nuevo Encargo",
      message: `${description?.substring(0, 30) || 'Nuevo encargo'}...`,
      data: { errandId, type: "errand" },
      timestamp: new Date(),
      isRead: false,
      priority: "normal",
    });

    console.log("[WebSocketService] Errand created notification sent:", errandId);
  }

  private handleParcelCreated(data: any): void {
    const { parcelId, type, pickupAddress, dropoffAddress } = data;

    // Update notification store
    useNotificationStore.getState().addNotification({
      id: `parcel_${parcelId}_${Date.now()}`,
      type: "RIDE_REQUEST" as any,
      title: "Nuevo Envío",
      message: `Paquete ${type || 'estándar'} • ${pickupAddress || 'Origen'} → ${dropoffAddress || 'Destino'}`,
      data: { parcelId, type: "parcel" },
      timestamp: new Date(),
      isRead: false,
      priority: "normal",
    });

    console.log("[WebSocketService] Parcel created notification sent:", parcelId);
  }

  // Payment event handlers
  private handlePaymentGroupCreated(data: any): void {
    const { groupId, serviceType, serviceId, totalAmount, payments } = data;

    // Update payment store
    const { usePaymentStore } = require("../../store");
    usePaymentStore.getState().updateGroupStatus(groupId, {
      groupId,
      serviceType,
      serviceId,
      totalAmount,
      status: "active",
      payments: payments.map((p: any) => ({
        id: p.id,
        method: p.method,
        amount: p.amount,
        percentage: Math.round((p.amount / totalAmount) * 100),
        status: p.status,
        reference: p.reference,
        bankCode: p.bankCode,
        description: p.description,
      })),
      confirmedAmount: 0,
      remainingAmount: totalAmount,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: data.expiresAt,
    });

    // Notification
    useNotificationStore.getState().addNotification({
      id: `payment_group_${groupId}_${Date.now()}`,
      type: "SYSTEM_UPDATE" as any,
      title: "Pagos Configurados",
      message: `Grupo ${groupId.slice(-8)} • ${payments.length} métodos • $${totalAmount}`,
      data: { groupId, serviceType, serviceId },
      timestamp: new Date(),
      isRead: false,
      priority: "high",
    });

    console.log("[WebSocketService] Payment group created:", groupId);
  }

  private handlePaymentGroupUpdated(data: any): void {
    const { groupId, status, payments, confirmedAmount, progress } = data;

    // Update payment store
    const { usePaymentStore } = require("../../store");
    usePaymentStore.getState().updateGroupStatus(groupId, data);

    console.log("[WebSocketService] Payment group updated:", groupId, status);
  }

  private handlePaymentConfirmed(data: any): void {
    const { groupId, paymentId, amount, confirmedAt } = data;

    // Update payment store
    const { usePaymentStore } = require("../../store");
    usePaymentStore.getState().updatePaymentStatus(
      groupId,
      paymentId,
      "confirmed",
      { confirmedAt }
    );

    // Notification
    useNotificationStore.getState().addNotification({
      id: `payment_confirmed_${paymentId}_${Date.now()}`,
      type: "SYSTEM_UPDATE" as any,
      title: "Pago Confirmado",
      message: `Pago de $${amount} confirmado exitosamente`,
      data: { groupId, paymentId },
      timestamp: new Date(),
      isRead: false,
      priority: "normal",
    });

    console.log("[WebSocketService] Payment confirmed:", paymentId, amount);
  }

  private handlePaymentGroupCompleted(data: any): void {
    const { groupId, serviceType, serviceId, totalAmount } = data;

    // Update payment store
    const { usePaymentStore } = require("../../store");
    usePaymentStore.getState().updateGroupStatus(groupId, {
      ...data,
      status: "completed"
    });

    // Success notification
    useNotificationStore.getState().addNotification({
      id: `payment_completed_${groupId}_${Date.now()}`,
      type: "SYSTEM_UPDATE" as any,
      title: "¡Pagos Completados!",
      message: `Todos los pagos confirmados • $${totalAmount}`,
      data: { groupId, serviceType, serviceId },
      timestamp: new Date(),
      isRead: false,
      priority: "high",
    });

    console.log("[WebSocketService] Payment group completed:", groupId);
  }

  private handlePaymentGroupCancelled(data: any): void {
    const { groupId, reason } = data;

    // Update payment store
    const { usePaymentStore } = require("../../store");
    usePaymentStore.getState().updateGroupStatus(groupId, {
      ...data,
      status: "cancelled"
    });

    // Notification
    useNotificationStore.getState().addNotification({
      id: `payment_cancelled_${groupId}_${Date.now()}`,
      type: "SYSTEM_UPDATE" as any,
      title: "Pagos Cancelados",
      message: `Grupo ${groupId.slice(-8)} cancelado${reason ? `: ${reason}` : ''}`,
      data: { groupId },
      timestamp: new Date(),
      isRead: false,
      priority: "normal",
    });

    console.log("[WebSocketService] Payment group cancelled:", groupId, reason);
  }

  private handlePaymentStatus(data: any): void {
    const { groupId, paymentId, status, message } = data;

    // Update payment store
    const { usePaymentStore } = require("../../store");
    usePaymentStore.getState().updatePaymentStatus(groupId, paymentId, status);

    // Notification for important status changes
    if (status === "expired" || status === "cancelled") {
      useNotificationStore.getState().addNotification({
        id: `payment_status_${paymentId}_${Date.now()}`,
        type: "SYSTEM_UPDATE" as any,
        title: status === "expired" ? "Pago Expirado" : "Pago Cancelado",
        message: message || `Pago ${paymentId} ${status}`,
        data: { groupId, paymentId, status },
        timestamp: new Date(),
        isRead: false,
        priority: status === "expired" ? "high" : "normal",
      });
    }

    console.log("[WebSocketService] Payment status updated:", paymentId, status);
  }

  // Enhanced driver event handlers
  private handleEarningsUpdate(data: any): void {
    const { driverId, earnings, tripCount, todayEarnings } = data;

    // Update driver store with new earnings data
    console.log("[WebSocketService] Updating earnings for driver:", driverId);
    // This would update the driver store with real-time earnings
  }

  private handlePerformanceUpdate(data: any): void {
    const { driverId, weeklyStats, recommendations } = data;

    // Update performance analytics
    console.log(
      "[WebSocketService] Updating performance for driver:",
      driverId,
    );
    // This would update the performance dashboard with new data
  }

  private handleRideNotification(data: any): void {
    const { rideId, pickupLocation, dropoffLocation, fare, passengerInfo } =
      data;

    // Trigger ride notification system
    console.log("[WebSocketService] New ride notification:", rideId);
    // This would trigger the RideNotificationSystem component
  }

  // Generic room lifecycle helpers
  leaveAllRooms(): void {
    try {
      // No-op placeholder - server may manage membership; could track joined rooms client-side
    } catch {}
  }

  private handleVehicleStatusUpdate(data: any): void {
    const { vehicleId, status, lastChecked } = data;

    // Update vehicle status
    console.log("[WebSocketService] Vehicle status update:", vehicleId);
    // This would update vehicle checklist status
  }

  // Enhanced heartbeat with performance monitoring
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.connected) {
        const pingTime = Date.now();
        this.socket.emit("ping", { timestamp: pingTime });

        // Track ping performance (response will be tracked in pong event)
        this.lastPingTime = pingTime;
      }
    }, 30000); // Ping every 30 seconds
  }

  private lastPingTime = 0;

  // Performance monitoring
  getPerformanceMetrics(): typeof this.performanceMetrics & {
    queueSize: number;
    isConnected: boolean;
    uptime: number;
  } {
    const uptime = this.performanceMetrics.connectionTime
      ? Date.now() - this.performanceMetrics.connectionTime
      : 0;

    return {
      ...this.performanceMetrics,
      queueSize: this.messageQueue.length,
      isConnected: this.socket?.connected || false,
      uptime,
    };
  }

  // Reset performance metrics
  resetPerformanceMetrics(): void {
    this.performanceMetrics = {
      messagesSent: 0,
      messagesReceived: 0,
      connectionTime: this.performanceMetrics.connectionTime, // Keep connection time
      disconnects: 0,
      avgResponseTime: 0,
    };
    console.log("[WebSocketService] Performance metrics reset");
  }

  // Get connection health status
  getConnectionHealth(): {
    status: "excellent" | "good" | "fair" | "poor" | "critical";
    score: number;
    issues: string[];
  } {
    const metrics = this.getPerformanceMetrics();
    const issues: string[] = [];
    let score = 100;

    // Connection status (-50 if disconnected)
    if (!metrics.isConnected) {
      score -= 50;
      issues.push("Desconectado");
    }

    // Queue size (-20 if queue > 10)
    if (metrics.queueSize > 10) {
      score -= 20;
      issues.push("Mensajes en cola");
    }

    // Disconnects (-10 per disconnect)
    score -= Math.min(metrics.disconnects * 10, 30);
    if (metrics.disconnects > 0) {
      issues.push(`${metrics.disconnects} desconexiones`);
    }

    // Response time (-10 if > 500ms avg)
    if (metrics.avgResponseTime > 500) {
      score -= 10;
      issues.push("Respuesta lenta");
    }

    // Determine status
    let status: "excellent" | "good" | "fair" | "poor" | "critical";
    if (score >= 90) status = "excellent";
    else if (score >= 75) status = "good";
    else if (score >= 60) status = "fair";
    else if (score >= 40) status = "poor";
    else status = "critical";

    return { status, score: Math.max(0, score), issues };
  }

  private handleDisconnect(reason?: string): void {
    console.log("[WebSocketService] Handling disconnect...", reason);

    // Track disconnect in performance metrics
    this.performanceMetrics.disconnects++;

    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Update connection status with reason
    this.updateConnectionStatus(false, reason);

    // Only attempt reconnection for certain disconnect reasons
    if (this.shouldAttemptReconnection(reason)) {
      this.attemptReconnection();
    } else {
      console.log("[WebSocketService] Not attempting reconnection for reason:", reason);
    }
  }

  // Update average response time
  private updateResponseTime(responseTime: number): void {
    const currentAvg = this.performanceMetrics.avgResponseTime;
    const totalMeasurements = Math.max(1, this.performanceMetrics.messagesSent);

    // Weighted average to smooth out variations
    this.performanceMetrics.avgResponseTime =
      (currentAvg * (totalMeasurements - 1) + responseTime) / totalMeasurements;
  }

  private shouldAttemptReconnection(reason?: string): boolean {
    // Don't attempt reconnection for these reasons
    const noReconnectReasons = [
      "io server disconnect", // Server intentionally disconnected
      "io client disconnect", // Client intentionally disconnected
      "ping timeout", // Keep-alive failed
    ];

    return !reason || !noReconnectReasons.includes(reason);
  }

  private handleConnectionError(error: any): void {
    console.error("[WebSocketService] Handling connection error:", error);

    // Create error notification
    useNotificationStore.getState().addNotification({
      id: `ws_error_${Date.now()}`,
      type: "SYSTEM_UPDATE" as any,
      title: "Error de Conexión",
      message: "Problema conectando al servidor en tiempo real",
      data: { error: error.message },
      timestamp: new Date(),
      isRead: false,
      priority: "high",
    });
  }

  private handleSocketError(error: any): void {
    console.error("[WebSocketService] Handling socket error:", error);

    // Log error for debugging
    console.error("[WebSocketService] Socket error details:", {
      message: error.message,
      type: error.type,
      description: error.description,
    });
  }

  private handleReconnectionError(error: any): void {
    console.error("[WebSocketService] Handling reconnection error:", error);

    // Update connection status with reconnection attempt info
    this.updateConnectionStatus(false, `Reconnection failed: ${error.message}`);
  }

  private handleReconnectionFailed(): void {
    console.error("[WebSocketService] All reconnection attempts failed");

    // Create critical notification
    useNotificationStore.getState().addNotification({
      id: `ws_reconnect_failed_${Date.now()}`,
      type: "SYSTEM_UPDATE" as any,
      title: "Conexión Perdida",
      message: "No se pudo reconectar al servidor. Verifica tu conexión a internet.",
      data: { type: "reconnection_failed" },
      timestamp: new Date(),
      isRead: false,
      priority: "critical",
    });

    // Update connection status
    this.updateConnectionStatus(false, "Reconnection failed");
  }

  private attemptReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[WebSocketService] Max reconnection attempts reached");
      this.handleReconnectionFailed();
      return;
    }

    this.reconnectAttempts++;

    // Enhanced exponential backoff with jitter and max delay
    const baseDelay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
    const jitter = Math.random() * 0.3 * baseDelay; // Add up to 30% jitter
    const delay = Math.min(baseDelay + jitter, 30000); // Max 30 seconds

    console.log(
      `[WebSocketService] Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${Math.round(delay)}ms`,
    );

    // Create reconnection notification for user awareness
    if (this.reconnectAttempts > 2) {
      useNotificationStore.getState().addNotification({
        id: `ws_reconnecting_${this.reconnectAttempts}_${Date.now()}`,
        type: "SYSTEM_UPDATE" as any,
        title: "Reconectando...",
        message: `Intento ${this.reconnectAttempts}/${this.maxReconnectAttempts}`,
        data: { attempt: this.reconnectAttempts, maxAttempts: this.maxReconnectAttempts },
        timestamp: new Date(),
        isRead: false,
        priority: "normal",
      });
    }

    setTimeout(() => {
      // Check if we should still attempt reconnection
      if (this.socket && !this.socket.connected && this.reconnectAttempts <= this.maxReconnectAttempts) {
        console.log("[WebSocketService] Executing reconnection attempt");
        this.socket.connect();
      } else {
        console.log("[WebSocketService] Skipping reconnection attempt (conditions not met)");
      }
    }, delay);
  }

  // Notification utilities
  private getStatusNotificationContent(
    oldStatus: string,
    newStatus: string,
    ride: any,
  ): { title: string; body: string } | null {
    switch (newStatus) {
      case "accepted":
        return {
          title: "Driver Found!",
          body: `Your driver ${ride?.driver?.first_name || "is on the way"}`,
        };

      case "arriving":
        return {
          title: "Driver Arriving",
          body: "Your driver is almost there",
        };

      case "arrived":
        return {
          title: "Driver Arrived",
          body: "Your driver is waiting outside",
        };

      case "in_progress":
        return {
          title: "Ride Started",
          body: "Enjoy your ride!",
        };

      case "completed":
        return {
          title: "Ride Completed",
          body: `Total: $${ride?.fare_price || "0.00"}`,
        };

      case "cancelled":
        return {
          title: "Ride Cancelled",
          body: "Your ride has been cancelled",
        };

      default:
        return null;
    }
  }

  private getNotificationTypeForStatus(status: string): NotificationType {
    switch (status) {
      case "accepted":
        return "RIDE_ACCEPTED";
      case "arrived":
        return "DRIVER_ARRIVED";
      case "in_progress":
        return "RIDE_STARTED";
      case "completed":
        return "RIDE_COMPLETED";
      case "cancelled":
        return "RIDE_CANCELLED";
      default:
        return "SYSTEM_UPDATE";
    }
  }

  private getPriorityForStatus(
    status: string,
  ): "low" | "normal" | "high" | "critical" {
    switch (status) {
      case "arrived":
      case "completed":
        return "high";
      case "cancelled":
        return "critical";
      default:
        return "normal";
    }
  }

  // Public getters
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get connectionState(): string {
    if (!this.socket) return "disconnected";
    if (this.socket.connected) return "connected";
    // For socket.io-client, we can check if it's actively connecting
    // by checking the connection state or use a flag
    return "disconnected";
  }

  // Public methods for performance monitoring
  getMetrics() {
    return this.getPerformanceMetrics();
  }

  getHealth() {
    return this.getConnectionHealth();
  }

  resetMetrics() {
    this.resetPerformanceMetrics();
  }

  getQueueSize(): number {
    return this.messageQueue.length;
  }

  // Force reconnection (useful for debugging)
  forceReconnect(): void {
    console.log("[WebSocketService] Force reconnection requested");
    if (this.socket) {
      this.socket.disconnect();
      setTimeout(() => {
        if (this.socket) {
          this.socket.connect();
        }
      }, 1000);
    }
  }

  // Cleanup
  cleanup(): void {
    console.log("[WebSocketService] Cleaning up...");
    this.disconnect();
    this.messageHandlers.clear();
  }
}

// Export singleton instance
export const websocketService = WebSocketService.getInstance();

export default websocketService;
