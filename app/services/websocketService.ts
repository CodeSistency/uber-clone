import { io, Socket } from "socket.io-client";

import { driverDeliveryService } from "@/app/services/driverDeliveryService";
import { driverErrandService } from "@/app/services/driverErrandService";
import { driverParcelService } from "@/app/services/driverParcelService";
import { driverTransportService } from "@/app/services/driverTransportService";
import { locationTrackingService } from "@/app/services/locationTrackingService";
import { endpoints } from "@/lib/endpoints";
import { log, LogLevel } from "@/lib/logger";
import { generateIdempotencyKey } from "@/lib/utils";
import { websocketEventManager } from "@/lib/websocketEventManager";
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
  private eventListeners: Map<string, Function[]> = new Map();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  // Performance optimizations
  private messageQueue: { event: string; data: any; timestamp: number }[] = [];
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
    const startTime = Date.now();
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // PRODUCTION-READY: No more development bypass
    // The WebSocket will always attempt real connection
    log.info("WebSocketService", "Production WebSocket connection initiated", {
      connectionId,
      environment: __DEV__ ? "development" : "production",
      wsUrl: endpoints.websocket.url(),
    });

    return new Promise((resolve, reject) => {
      try {
        log.debug("WebSocketService", "Initializing socket connection", {
          connectionId,
          userId: userId.substring(0, 8) + "...",
          timeout: 10000,
        });

        // Initialize socket connection with enhanced configuration
        // Updated to use /uber-realtime namespace according to API documentation
        const wsUrl = endpoints.websocket.url();

        // Check if the URL already includes the namespace to avoid duplication
        const finalWsUrl = wsUrl.endsWith("/uber-realtime")
          ? wsUrl
          : `${wsUrl}/uber-realtime`;

        console.log("[WebSocketService] 🔧 Initializing WebSocket connection", {
          connectionId,
          wsUrl,
          finalWsUrl,
          userId: userId.substring(0, 8) + "...",
          tokenLength: token.length,
          hasNamespace: finalWsUrl.includes("/uber-realtime"),
          timestamp: new Date().toISOString(),
        });

        log.info("WebSocketService", "Connection attempt initiated", {
          connectionId,
          userId: userId.substring(0, 8) + "...", // Log partial userId for privacy
          wsUrl: endpoints.websocket.url(),
          finalWsUrl,
          devMode: useDevStore.getState().developerMode,
          wsBypass: useDevStore.getState().wsBypass,
        });

        this.socket = io(finalWsUrl, {
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
        });

        // Add debugging events before the main connection events
        this.socket.on("connecting", () => {
          console.log(
            "[WebSocketService] 🔄 CONNECTING - Socket.IO handshake started",
            {
              connectionId,
              socketId: this.socket?.id,
              timestamp: new Date().toISOString(),
            },
          );
        });

        this.socket.on("connect_attempt", () => {
          console.log(
            "[WebSocketService] 🎯 CONNECT_ATTEMPT - Attempting to establish connection",
            {
              connectionId,
              attemptNumber: this.reconnectAttempts + 1,
              timestamp: new Date().toISOString(),
            },
          );
        });

        this.socket.on("reconnect_attempt", () => {
          console.log("[WebSocketService] 🔄 RECONNECT_ATTEMPT", {
            connectionId,
            attemptNumber: this.reconnectAttempts + 1,
            timestamp: new Date().toISOString(),
          });
        });

        // Enhanced connection events with detailed logging
        this.socket.on("connect", () => {
          const connectionTime = Date.now() - startTime;

          console.log("[WebSocketService] 🟢 CONNECT SUCCESS!", {
            connectionId,
            connectionTime,
            socketId: this.socket?.id,
            transport: this.socket?.io?.engine?.transport?.name,
            readyState: this.socket?.io?.engine?.readyState,
            reconnectAttempts: this.reconnectAttempts,
            queuedMessages: this.messageQueue.length,
            auth: {
              tokenLength: token.length,
              userIdLength: userId.length,
            },
          });

          log.info("WebSocketService", "Successfully connected to server", {
            connectionId,
            connectionTime,
            socketId: this.socket?.id,
            transport: this.socket?.io?.engine?.transport?.name,
            readyState: this.socket?.io?.engine?.readyState,
            reconnectAttempts: this.reconnectAttempts,
            queuedMessages: this.messageQueue.length,
          });

          this.reconnectAttempts = 0;
          this.performanceMetrics.connectionTime = Date.now();
          this.startHeartbeat();
          this.updateConnectionStatus(true);

          // Process any queued messages
          if (this.messageQueue.length > 0) {
            log.info("WebSocketService", "Processing queued messages", {
              connectionId,
              messageCount: this.messageQueue.length,
            });
            this.processMessageQueue();
          }

          // Set up location tracking callback to break circular dependency
          try {
            locationTrackingService.setWebSocketUpdateCallback(
              (rideId: number, location: any) => {
                log.debug(
                  "WebSocketService",
                  "Location tracking callback triggered",
                  {
                    connectionId,
                    rideId,
                    location: {
                      lat: location?.latitude,
                      lng: location?.longitude,
                    },
                  },
                );
                this.updateDriverLocation(rideId, location);
              },
            );
            log.debug(
              "WebSocketService",
              "Location tracking callback registered",
              { connectionId },
            );
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            log.error(
              "WebSocketService",
              "Failed to register location tracking callback",
              {
                connectionId,
                error: errorMessage,
              },
              error instanceof Error ? error : undefined,
            );
          }

          log.performance(
            "WebSocketService",
            "WebSocket connection established",
            startTime,
            {
              connectionId,
              userId: userId.substring(0, 8) + "...",
            },
          );

          resolve();
        });

        this.socket.on("disconnect", (reason: any) => {
          log.websocket(
            "WebSocketService",
            "disconnected",
            {
              connectionId,
              reason,
              wasConnected: true,
            },
            reason instanceof Error ? reason : undefined,
          );
          this.handleDisconnect(reason);
        });

        this.socket.on("connect_error", (error: any) => {
          log.websocket(
            "WebSocketService",
            "connection_error",
            {
              connectionId,
              error: error.message,
              errorType: error.type,
              errorDescription: error.description,
              attemptNumber: this.reconnectAttempts + 1,
              socketState: this.socket?.connected
                ? "connected"
                : "disconnected",
              socketId: this.socket?.id,
              ioEngine: this.socket?.io?.engine?.transport?.name,
            },
            error,
          );

          console.error("[WebSocketService] 🔴 CONNECT_ERROR Details:", {
            message: error.message,
            type: error.type,
            description: error.description,
            context: error.context,
            stack: error.stack,
            socket: {
              connected: this.socket?.connected,
              id: this.socket?.id,
              io: {
                engine: {
                  transport: this.socket?.io?.engine?.transport?.name,
                  readyState: this.socket?.io?.engine?.readyState,
                },
              },
            },
          });

          this.handleConnectionError(error);
          reject(error);
        });

        // Additional error handling events
        this.socket.on("error", (error: any) => {
          log.websocket(
            "WebSocketService",
            "socket_error",
            {
              connectionId,
              error: error.message,
            },
            error,
          );
          this.handleSocketError(error);
        });

        this.socket.on("reconnect_error", (error: any) => {
          log.websocket(
            "WebSocketService",
            "reconnect_error",
            {
              connectionId,
              error: error.message,
              attemptNumber: this.reconnectAttempts,
            },
            error,
          );
          this.handleReconnectionError(error);
        });

        this.socket.on("reconnect_failed", () => {
          log.critical(
            "WebSocketService",
            "Reconnection failed after all attempts",
            {
              connectionId,
              maxAttempts: this.maxReconnectAttempts,
              totalAttempts: this.reconnectAttempts,
            },
          );
          this.handleReconnectionFailed();
        });

        this.socket.on("ping", () => {
          log.debug("WebSocketService", "Ping received from server", {
            connectionId,
          });
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
          if (
            eventName !== "ping" &&
            eventName !== "pong" &&
            eventName !== "connect" &&
            eventName !== "disconnect"
          ) {
            this.performanceMetrics.messagesReceived++;
          }
        });

        // Set up message handlers
        this.setupMessageHandlers();

        // Initiate the actual connection
        console.log("[WebSocketService] 🚀 Calling socket.connect() now", {
          connectionId,
          finalWsUrl,
          socketExists: !!this.socket,
          timestamp: new Date().toISOString(),
        });

        this.socket.connect();

        console.log(
          "[WebSocketService] ⏳ Socket.connect() called, waiting for events...",
          {
            connectionId,
            timestamp: new Date().toISOString(),
          },
        );
      } catch (error) {
        console.error("[WebSocketService] Connection failed:", error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    console.log("[WebSocketService] Disconnecting... (intentional disconnect)");

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.updateConnectionStatus(false, "intentional_disconnect");
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
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    log.debug("WebSocketService", "Send message initiated", {
      messageId,
      rideId,
      messageLength: message.length,
      isConnected: this.socket?.connected,
      environment: __DEV__ ? "development" : "production",
    });

    // PRODUCTION-READY: Always attempt to send messages
    // No development bypass for messaging

    const messageData = {
      rideId,
      senderId: "current_user", // TODO: Get from auth context
      message,
      timestamp: Date.now(),
    };

    // Rate limiting
    const now = Date.now();
    const timeSinceLastMessage = now - this.lastMessageTime;

    if (timeSinceLastMessage < this.messageRateLimit) {
      log.warn("WebSocketService", "Message rate limited, queuing", {
        messageId,
        rideId,
        timeSinceLast: timeSinceLastMessage,
        rateLimit: this.messageRateLimit,
        queueSize: this.messageQueue.length + 1,
      });
      this.queueMessage("chat:message", messageData);
      return;
    }

    if (this.socket && this.socket.connected) {
      try {
        this.socket.emit("chat:message", messageData);
        this.lastMessageTime = now;
        this.performanceMetrics.messagesSent++;

        log.info("WebSocketService", "Message sent successfully", {
          messageId,
          rideId,
          messageLength: message.length,
          timeSinceLast: timeSinceLastMessage,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        log.error(
          "WebSocketService",
          "Failed to send message",
          {
            messageId,
            rideId,
            error: errorMessage,
          },
          error instanceof Error ? error : undefined,
        );
        this.queueMessage("chat:message", messageData);
      }
    } else {
      log.warn("WebSocketService", "Socket not connected, queuing message", {
        messageId,
        rideId,
        queueSize: this.messageQueue.length + 1,
      });
      this.queueMessage("chat:message", messageData);
    }
  }

  // Queue message for later sending
  private queueMessage(event: string, data: any): void {
    if (this.messageQueue.length >= this.maxQueueSize) {
      console.warn(
        "[WebSocketService] Message queue full, dropping oldest message",
      );
      this.messageQueue.shift(); // Remove oldest message
    }

    this.messageQueue.push({
      event,
      data,
      timestamp: Date.now(),
    });

    console.log(
      `[WebSocketService] Message queued: ${this.messageQueue.length} in queue`,
    );
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
          console.log(
            "[WebSocketService] Sending queued message:",
            queuedMessage.event,
          );
          this.socket.emit(queuedMessage.event, queuedMessage.data);
          this.lastMessageTime = now;
          this.performanceMetrics.messagesSent++;

          // Process next message after rate limit
          setTimeout(processNext, this.messageRateLimit);
        } else {
          // Re-queue if still not connected
          console.log(
            "[WebSocketService] Still not connected, re-queuing message",
          );
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
    console.log("[WebSocketService] 📡 updateDriverLocation called:", {
      rideId,
      location,
      isConnected: this.socket?.connected,
      developerMode: useDevStore.getState().developerMode,
      wsBypass: useDevStore.getState().wsBypass,
      timestamp: new Date().toISOString(),
    });

    if (
      useDevStore.getState().developerMode &&
      useDevStore.getState().wsBypass
    ) {
      console.log("[WebSocketService] 🚫 WS bypass: updateDriverLocation noop");
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

      console.log(
        "[WebSocketService] 📤 Emitting updateDriverLocation:",
        locationData,
      );
      this.socket.emit("updateDriverLocation", locationData);
      console.log(
        "[WebSocketService] ✅ updateDriverLocation emitted successfully",
      );
    } else {
      console.warn(
        "[WebSocketService] ⚠️ Cannot update driver location - WebSocket not connected",
      );
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
      attempts: this.reconnectAttempts,
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
    this.socket.on("chat:new-message", (data: any) => {
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

    // Matching-specific events
    this.socket.on("ride:accepted", (data: any) => {
      console.log("[WebSocketService] Ride accepted event:", data);
      websocketEventManager.emit("ride:accepted", data);
      this.handleRideAccepted(data);
    });

    this.socket.on("ride:rejected", (data: any) => {
      console.log("[WebSocketService] Ride rejected event:", data);
      websocketEventManager.emit("ride:rejected", data);
      this.handleRideRejected(data);
    });

    // New ride lifecycle events
    this.socket.on("ride:arrived", (data: any) => {
      console.log("[WebSocketService] Ride arrived event:", data);
      websocketEventManager.emit("ride:arrived", data);
      this.handleRideArrived(data);
    });

    this.socket.on("ride:started", (data: any) => {
      console.log("[WebSocketService] Ride started event:", data);
      websocketEventManager.emit("ride:started", data);
      this.handleRideStarted(data);
    });

    this.socket.on("ride:completed", (data: any) => {
      console.log("[WebSocketService] Ride completed event:", data);
      websocketEventManager.emit("ride:completed", data);
      this.handleRideCompleted(data);
    });

    this.socket.on("ride:cancelled", (data: any) => {
      console.log("[WebSocketService] Ride cancelled event:", data);
      websocketEventManager.emit("ride:cancelled", data);
      this.handleRideCancelled(data);
    });

    // New event for ride requests (broadcast to drivers) - OPTIMIZED
    this.socket.on("ride:requested", (data: any) => {
      console.log(
        "[WebSocketService] 🚨 Ride requested - broadcasting to drivers (optimized):",
        {
          rideId: data.rideId || data.id,
          area: data.area || "unknown",
          timestamp: data.timestamp || new Date().toISOString(),
        },
      );

      // ✅ OPTIMIZED: Emitir solo datos mínimos de notificación
      const notificationData = {
        rideId: data.rideId || data.id,
        area: data.area || this.extractAreaFromLocation(data), // Área aproximada
        timestamp: data.timestamp || new Date().toISOString(),
        expiresAt: data.expiresAt,
        // ❌ REMOVED: No enviar datos calculados específicos del conductor
        // (farePrice, distance, passenger, originAddress, destinationAddress)
      };

      websocketEventManager.emit("ride:requested", notificationData);

      // Mantener notificación push con datos completos (viene del backend)
      this.createDriverNotification(data);
    });

    this.socket.on("driver:ride-request", (data: any) => {
      console.log("[WebSocketService] Driver ride request event:", data);
      websocketEventManager.emit("driverIncomingRequest", data);
      this.handleDriverRideRequest(data);
    });
  }

  /**
   * Crear notificación push para conductores cuando llega una nueva solicitud
   */
  private createDriverNotification(data: any): void {
    try {
      const notification = {
        id: `ride_requested_${data.rideId || data.id}_${Date.now()}`,
        type: "RIDE_REQUEST" as NotificationType,
        title: "¡Nueva solicitud de viaje!",
        message: `${data.originAddress || "Nueva solicitud"} → ${data.destinationAddress || "Destino"}`,
        data: {
          rideId: data.rideId || data.id,
          origin: data.originAddress,
          destination: data.destinationAddress,
          fare: data.farePrice,
          distance: data.distance,
          expiresAt: data.expiresAt,
          passenger: data.passenger,
        },
        priority: "high" as const,
        sound: true,
        vibrate: true,
        timestamp: new Date(),
        isRead: false,
      };

      // Agregar notificación al store
      useNotificationStore.getState().addNotification(notification);

      log.info(
        "WebSocketService",
        "Driver notification created for ride request",
        {
          rideId: data.rideId,
          notificationId: notification.id,
        },
      );
    } catch (error) {
      log.error(
        "WebSocketService",
        "Error creating driver notification:",
        error,
      );
    }
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
    log.debug("WebSocketService", "Handling new message from WebSocket", {
      messageId: data.id,
      rideId: data.rideId,
      orderId: data.orderId,
      senderId: data.senderId,
      messageLength: data.message?.length || data.messageText?.length || 0,
    });

    // Convert WebSocket data to ChatMessage format
    const chatMessage = {
      id: data.id,
      rideId: data.rideId,
      orderId: data.orderId,
      senderId: data.senderId,
      messageText: data.message || data.messageText, // Support both formats during transition
      messageType: data.type || data.messageType || "text",
      createdAt: data.createdAt || data.timestamp,
      isRead: false, // New messages are unread by default
      timestamp: new Date(data.timestamp || data.createdAt),
      sender: data.sender || undefined,
    };

    // Add to chat store
    useChatStore.getState().addMessage(chatMessage);

    // Create notification if not from current user and not in active chat
    const currentChatId = useChatStore.getState().activeChat;
    const chatId = data.rideId || data.orderId; // Support both ride and order chats

    if (chatId !== currentChatId) {
      const messageText = data.message || data.messageText;
      useNotificationStore.getState().addNotification({
        id: `message_${data.id}`,
        type: "CHAT_MESSAGE",
        title: "New Message",
        message:
          messageText.length > 50
            ? `${messageText.substring(0, 50)}...`
            : messageText,
        data: {
          rideId: data.rideId,
          orderId: data.orderId,
          messageId: data.id,
        },
        timestamp: new Date(),
        isRead: false,
        priority: "normal",
      });

      log.info("WebSocketService", "Notification created for new message", {
        messageId: data.id,
        chatId,
        currentChatId,
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
      message: `Pedido en ${store?.name || "tienda"} • ${items?.length || 0} items`,
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

    console.log(
      "[WebSocketService] Order modified notification sent:",
      orderId,
    );
  }

  private handleErrandCreated(data: any): void {
    const { errandId, description, pickupAddress, dropoffAddress } = data;

    // Update notification store
    useNotificationStore.getState().addNotification({
      id: `errand_${errandId}_${Date.now()}`,
      type: "RIDE_REQUEST" as any,
      title: "Nuevo Encargo",
      message: `${description?.substring(0, 30) || "Nuevo encargo"}...`,
      data: { errandId, type: "errand" },
      timestamp: new Date(),
      isRead: false,
      priority: "normal",
    });

    console.log(
      "[WebSocketService] Errand created notification sent:",
      errandId,
    );
  }

  private handleParcelCreated(data: any): void {
    const { parcelId, type, pickupAddress, dropoffAddress } = data;

    // Update notification store
    useNotificationStore.getState().addNotification({
      id: `parcel_${parcelId}_${Date.now()}`,
      type: "RIDE_REQUEST" as any,
      title: "Nuevo Envío",
      message: `Paquete ${type || "estándar"} • ${pickupAddress || "Origen"} → ${dropoffAddress || "Destino"}`,
      data: { parcelId, type: "parcel" },
      timestamp: new Date(),
      isRead: false,
      priority: "normal",
    });

    console.log(
      "[WebSocketService] Parcel created notification sent:",
      parcelId,
    );
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
    usePaymentStore
      .getState()
      .updatePaymentStatus(groupId, paymentId, "confirmed", { confirmedAt });

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
      status: "completed",
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
      status: "cancelled",
    });

    // Notification
    useNotificationStore.getState().addNotification({
      id: `payment_cancelled_${groupId}_${Date.now()}`,
      type: "SYSTEM_UPDATE" as any,
      title: "Pagos Cancelados",
      message: `Grupo ${groupId.slice(-8)} cancelado${reason ? `: ${reason}` : ""}`,
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

    console.log(
      "[WebSocketService] Payment status updated:",
      paymentId,
      status,
    );
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
    const disconnectId = `disconnect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Enhanced disconnect logging with more context
    const disconnectContext = {
      disconnectId,
      reason,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      wasConnected: this.socket?.connected || false,
      socketId: this.socket?.id,
      queuedMessages: this.messageQueue.length,
      isDevMode: __DEV__,
      performanceMetrics: {
        disconnects: this.performanceMetrics.disconnects + 1,
        connectionTime: this.performanceMetrics.connectionTime,
        uptime: this.performanceMetrics.connectionTime
          ? Date.now() - this.performanceMetrics.connectionTime
          : 0,
      },
    };

    console.log("[WebSocketService] 🔌 DISCONNECT EVENT:", disconnectContext);

    log.info(
      "WebSocketService",
      "Handling WebSocket disconnect",
      disconnectContext,
    );

    // Track disconnect in performance metrics
    this.performanceMetrics.disconnects++;

    // Stop heartbeat with logging
    if (this.heartbeatInterval) {
      log.debug("WebSocketService", "Stopping heartbeat interval", {
        disconnectId,
        hadHeartbeat: true,
      });
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Update connection status with reason and detailed logging
    this.updateConnectionStatus(false, reason);

    // Determine reconnection strategy
    const shouldReconnect = this.shouldAttemptReconnection(reason);

    log.info("WebSocketService", "Reconnection strategy determined", {
      disconnectId,
      reason,
      shouldReconnect,
      reconnectCriteria: {
        isValidReason:
          !reason ||
          ![
            "io server disconnect",
            "io client disconnect",
            "ping timeout",
          ].includes(reason),
        underMaxAttempts: this.reconnectAttempts < this.maxReconnectAttempts,
        hasValidToken: true, // Token validation handled in connect method
      },
    });

    // Only attempt reconnection for certain disconnect reasons
    if (shouldReconnect) {
      log.info("WebSocketService", "Initiating reconnection attempt", {
        disconnectId,
        attemptNumber: this.reconnectAttempts + 1,
      });
      this.attemptReconnection();
    } else {
      log.warn("WebSocketService", "Skipping reconnection", {
        disconnectId,
        reason,
        finalReconnectAttempts: this.reconnectAttempts,
      });

      // Notify user about permanent disconnection
      if (this.reconnectAttempts > 0) {
        useNotificationStore.getState().addNotification({
          id: `ws_permanent_disconnect_${Date.now()}`,
          type: "SYSTEM_UPDATE" as any,
          title: "Conexión Perdida",
          message:
            "No se pudo reconectar al servidor. Verifica tu conexión a internet.",
          data: { reason, finalAttempt: true },
          timestamp: new Date(),
          isRead: false,
          priority: "high",
        });
      }
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
    // Don't attempt reconnection for these reasons (production)
    const noReconnectReasons = [
      "io server disconnect", // Server intentionally disconnected
      "ping timeout", // Keep-alive failed
      "intentional_disconnect", // Our own disconnect() method was called
    ];

    // Context-aware reconnection logic
    const context = {
      isDev: __DEV__,
      reason,
      reconnectAttempts: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      hasQueuedMessages: this.messageQueue.length > 0,
      wasConnected: this.socket?.connected || false,
    };

    console.log("[WebSocketService] Evaluating reconnection", context);

    // Don't reconnect if we've exceeded max attempts
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("[WebSocketService] ❌ Max reconnection attempts exceeded");
      return false;
    }

    // Always allow reconnection in development for these reasons (handles hot reloads)
    if (__DEV__) {
      const devReconnectReasons = [
        "io client disconnect", // Hot reload disconnections
        "transport close", // Transport layer issues
        "transport error", // Transport errors
      ];

      if (reason && devReconnectReasons.includes(reason)) {
        console.log(
          "[WebSocketService] 🔄 DEV MODE: Allowing reconnection for development scenario",
        );
        return true;
      }
    }

    // In production, be more conservative
    if (!__DEV__) {
      // Don't reconnect for client-initiated disconnects
      if (
        reason === "io client disconnect" ||
        reason === "intentional_disconnect"
      ) {
        console.log(
          "[WebSocketService] 🛑 PROD MODE: Skipping reconnection for client-initiated disconnect",
        );
        return false;
      }

      // Don't reconnect if we have no queued messages and connection was stable
      if (
        !context.hasQueuedMessages &&
        this.performanceMetrics.disconnects < 3
      ) {
        console.log(
          "[WebSocketService] 🛑 PROD MODE: Skipping reconnection (no pending work)",
        );
        return false;
      }
    }

    // Default: attempt reconnection unless explicitly excluded
    const shouldReconnect = !reason || !noReconnectReasons.includes(reason);
    console.log(
      `[WebSocketService] ${shouldReconnect ? "✅" : "❌"} Final reconnection decision: ${shouldReconnect}`,
    );

    return shouldReconnect;
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
      message:
        "No se pudo reconectar al servidor. Verifica tu conexión a internet.",
      data: { type: "reconnection_failed" },
      timestamp: new Date(),
      isRead: false,
      priority: "critical",
    });

    // Update connection status
    this.updateConnectionStatus(false, "Reconnection failed");
  }

  private attemptReconnection(): void {
    const reconnectAttemptId = `reconnect_attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check if we've exceeded max attempts
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      log.critical(
        "WebSocketService",
        "Maximum reconnection attempts exceeded",
        {
          reconnectAttemptId,
          maxAttempts: this.maxReconnectAttempts,
          totalAttempts: this.reconnectAttempts,
          reason: "Reconnection limit reached",
        },
      );
      this.handleReconnectionFailed();
      return;
    }

    this.reconnectAttempts++;

    // Enhanced exponential backoff with jitter and max delay
    const baseDelay =
      this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
    const jitter = Math.random() * 0.3 * baseDelay; // Add up to 30% jitter
    const delay = Math.min(baseDelay + jitter, 30000); // Max 30 seconds

    log.info("WebSocketService", "Scheduling reconnection attempt", {
      reconnectAttemptId,
      attemptNumber: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      delayMs: Math.round(delay),
      baseDelayMs: Math.round(baseDelay),
      jitterMs: Math.round(jitter),
      exponentialFactor: 1.5 ** (this.reconnectAttempts - 1),
      nextAttemptDelay:
        this.reconnectAttempts < this.maxReconnectAttempts
          ? Math.min(
              this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts),
              30000,
            )
          : null,
    });

    // Create reconnection notification for user awareness (after 2 attempts)
    if (this.reconnectAttempts > 2) {
      log.info(
        "WebSocketService",
        "Creating user notification for reconnection attempt",
        {
          reconnectAttemptId,
          attemptNumber: this.reconnectAttempts,
          notificationId: `ws_reconnecting_${this.reconnectAttempts}_${Date.now()}`,
        },
      );

      useNotificationStore.getState().addNotification({
        id: `ws_reconnecting_${this.reconnectAttempts}_${Date.now()}`,
        type: "SYSTEM_UPDATE" as any,
        title: "Reconectando...",
        message: `Intento ${this.reconnectAttempts}/${this.maxReconnectAttempts}`,
        data: {
          attempt: this.reconnectAttempts,
          maxAttempts: this.maxReconnectAttempts,
          reconnectAttemptId,
        },
        timestamp: new Date(),
        isRead: false,
        priority: "normal",
      });
    }

    // Schedule the reconnection attempt
    setTimeout(() => {
      // Double-check conditions before attempting reconnection
      const shouldAttempt =
        this.socket &&
        !this.socket.connected &&
        this.reconnectAttempts <= this.maxReconnectAttempts;

      if (shouldAttempt) {
        log.info(
          "WebSocketService",
          "Executing scheduled reconnection attempt",
          {
            reconnectAttemptId,
            attemptNumber: this.reconnectAttempts,
            socketExists: !!this.socket,
            socketConnected: this.socket?.connected || false,
            withinAttemptLimit:
              this.reconnectAttempts <= this.maxReconnectAttempts,
          },
        );

        try {
          if (this.socket) {
            this.socket.connect();
          } else {
            log.warn("WebSocketService", "Cannot reconnect - socket is null", {
              reconnectAttemptId,
            });
            return;
          }
          log.debug("WebSocketService", "Reconnection attempt initiated", {
            reconnectAttemptId,
            attemptNumber: this.reconnectAttempts,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          log.error(
            "WebSocketService",
            "Failed to execute reconnection attempt",
            {
              reconnectAttemptId,
              attemptNumber: this.reconnectAttempts,
              error: errorMessage,
            },
            error instanceof Error ? error : undefined,
          );
        }
      } else {
        log.warn(
          "WebSocketService",
          "Skipping reconnection attempt - conditions not met",
          {
            reconnectAttemptId,
            attemptNumber: this.reconnectAttempts,
            reason: {
              socketExists: !!this.socket,
              socketConnected: this.socket?.connected || false,
              withinAttemptLimit:
                this.reconnectAttempts <= this.maxReconnectAttempts,
            },
          },
        );
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

  // Helper method to extract area from location data
  private extractAreaFromLocation(data: any): string {
    // Try to extract area from various location fields
    if (data.originAddress) {
      // Extract city/area from address (simple heuristic)
      const parts = data.originAddress.split(",");
      if (parts.length > 1) {
        return parts[parts.length - 1].trim(); // Last part is usually city/area
      }
    }

    if (
      data.originLocation &&
      data.originLocation.lat &&
      data.originLocation.lng
    ) {
      // Fallback: return coordinates as area identifier
      return `${data.originLocation.lat.toFixed(2)},${data.originLocation.lng.toFixed(2)}`;
    }

    return "unknown";
  }

  // Public methods for performance monitoring
  getMetrics() {
    return this.getPerformanceMetrics();
  }

  // Matching event handlers
  private handleRideAccepted(data: any): void {
    const { rideId, driverId, estimatedArrivalMinutes } = data;

    console.log("[WebSocketService] Processing ride accepted:", {
      rideId,
      driverId,
      estimatedArrivalMinutes,
    });

    // Update real-time store
    useRealtimeStore.getState().updateRideStatus(rideId, "accepted");

    // Emit event to notify WaitingForAcceptance component
    this.emit("rideAccepted", {
      rideId,
      driverId,
      estimatedArrivalMinutes,
      timestamp: new Date(),
    });

    // Create notification
    useNotificationStore.getState().addNotification({
      id: `ride_accepted_${rideId}_${Date.now()}`,
      type: "RIDE_ACCEPTED",
      title: "¡Conductor aceptado!",
      message: "Tu conductor está en camino",
      data: { rideId, driverId, estimatedArrivalMinutes },
      timestamp: new Date(),
      isRead: false,
      priority: "high",
    });
  }

  private handleRideRejected(data: any): void {
    const { rideId, driverId, reason } = data;

    console.log("[WebSocketService] Processing ride rejected:", {
      rideId,
      driverId,
      reason,
    });

    // Update real-time store
    useRealtimeStore.getState().updateRideStatus(rideId, "cancelled");

    // Emit event to notify WaitingForAcceptance component
    this.emit("rideRejected", {
      rideId,
      driverId,
      reason,
      timestamp: new Date(),
    });

    // Create notification
    useNotificationStore.getState().addNotification({
      id: `ride_rejected_${rideId}_${Date.now()}`,
      type: "RIDE_CANCELLED",
      title: "Viaje rechazado",
      message: reason || "El conductor no pudo aceptar tu solicitud",
      data: { rideId, driverId, reason },
      timestamp: new Date(),
      isRead: false,
      priority: "normal",
    });
  }

  // New ride lifecycle event handlers
  private handleRideArrived(data: any): void {
    const { rideId, driverId, driverName, vehicleInfo, timestamp } = data;

    console.log("[WebSocketService] Processing ride arrived:", {
      rideId,
      driverId,
      driverName,
      vehicleInfo,
    });

    // Update real-time store
    useRealtimeStore.getState().updateRideStatus(rideId, "arrived");

    // Emit event to notify UI components
    this.emit("rideArrived", {
      rideId,
      driverId,
      driverName,
      vehicleInfo,
      timestamp: timestamp || new Date(),
    });

    // Create notification
    useNotificationStore.getState().addNotification({
      id: `ride_arrived_${rideId}_${Date.now()}`,
      type: "DRIVER_ARRIVED",
      title: "¡Conductor llegó!",
      message: `${driverName} te está esperando`,
      data: { rideId, driverId, driverName, vehicleInfo },
      timestamp: new Date(),
      isRead: false,
      priority: "high",
    });

    // Show toast notification
    this.showToastNotification("driver_arrived", {
      driverName,
      vehicleInfo,
      rideId,
    });
  }

  private handleRideStarted(data: any): void {
    const { rideId, driverId, driverName, timestamp } = data;

    console.log("[WebSocketService] Processing ride started:", {
      rideId,
      driverId,
      driverName,
    });

    // Update real-time store
    useRealtimeStore.getState().updateRideStatus(rideId, "in_progress");

    // Emit event to notify UI components
    this.emit("rideStarted", {
      rideId,
      driverId,
      driverName,
      timestamp: timestamp || new Date(),
    });

    // Create notification
    useNotificationStore.getState().addNotification({
      id: `ride_started_${rideId}_${Date.now()}`,
      type: "RIDE_STARTED",
      title: "Viaje iniciado",
      message: "¡Buen viaje!",
      data: { rideId, driverId, driverName },
      timestamp: new Date(),
      isRead: false,
      priority: "high",
    });

    // Show toast notification
    this.showToastNotification("ride_started", {
      driverName,
      rideId,
    });
  }

  private handleRideCompleted(data: any): void {
    const {
      rideId,
      driverId,
      driverName,
      fare,
      distance,
      duration,
      timestamp,
    } = data;

    console.log("[WebSocketService] Processing ride completed:", {
      rideId,
      driverId,
      driverName,
      fare,
      distance,
      duration,
    });

    // Update real-time store
    useRealtimeStore.getState().updateRideStatus(rideId, "completed");

    // Store ride summary for rating screen
    useRealtimeStore.getState().setRideSummary({
      rideId,
      driverId,
      driverName,
      fare,
      distance,
      duration,
      completedAt: timestamp || new Date(),
    });

    // Emit event to notify UI components
    this.emit("rideCompleted", {
      rideId,
      driverId,
      driverName,
      fare,
      distance,
      duration,
      timestamp: timestamp || new Date(),
    });

    // Create notification
    useNotificationStore.getState().addNotification({
      id: `ride_completed_${rideId}_${Date.now()}`,
      type: "RIDE_COMPLETED",
      title: "Viaje completado",
      message: `Tarifa: $${fare}`,
      data: { rideId, driverId, driverName, fare, distance, duration },
      timestamp: new Date(),
      isRead: false,
      priority: "high",
    });

    // Show toast notification
    this.showToastNotification("ride_completed", {
      fare,
      driverName,
      rideId,
    });
  }

  private handleRideCancelled(data: any): void {
    const { rideId, driverId, reason, cancelledBy, timestamp } = data;

    console.log("[WebSocketService] Processing ride cancelled:", {
      rideId,
      driverId,
      reason,
      cancelledBy,
    });

    // Update real-time store
    useRealtimeStore.getState().updateRideStatus(rideId, "cancelled");

    // Emit event to notify UI components
    this.emit("rideCancelled", {
      rideId,
      driverId,
      reason,
      cancelledBy,
      timestamp: timestamp || new Date(),
    });

    // Create notification
    useNotificationStore.getState().addNotification({
      id: `ride_cancelled_${rideId}_${Date.now()}`,
      type: "RIDE_CANCELLED",
      title: "Viaje cancelado",
      message: reason || "El viaje ha sido cancelado",
      data: { rideId, driverId, reason, cancelledBy },
      timestamp: new Date(),
      isRead: false,
      priority: "high",
    });

    // Show toast notification
    this.showToastNotification("ride_cancelled", {
      reason,
      rideId,
    });
  }

  private handleDriverRideRequest(data: any): void {
    const { rideId, driverId, pickupAddress, expiresAt } = data;

    console.log("[WebSocketService] Processing driver ride request:", {
      rideId,
      driverId,
      pickupAddress,
      expiresAt,
    });

    // This event is primarily for drivers, but clients might want to know
    // that their ride request was sent to a driver
    this.emit("driverRideRequest", {
      rideId,
      driverId,
      pickupAddress,
      expiresAt,
      timestamp: new Date(),
    });
  }

  // Event system methods
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `[WebSocketService] Error in event listener for ${event}:`,
            error,
          );
        }
      });
    }
  }

  // Toast notification helper
  private showToastNotification(type: string, data: any): void {
    try {
      // Import UI store dynamically to avoid circular dependencies
      const { useUIStore } = require("@/store");

      const notifications = {
        driver_arrived: {
          title: "¡Conductor llegó!",
          message: `${data.driverName} te está esperando${data.vehicleInfo ? ` con ${data.vehicleInfo}` : ""}`,
          type: "success" as const,
        },
        ride_started: {
          title: "Viaje iniciado",
          message: `¡Buen viaje con ${data.driverName}!`,
          type: "success" as const,
        },
        ride_completed: {
          title: "Viaje completado",
          message: `Tarifa final: $${data.fare}`,
          type: "success" as const,
        },
        ride_cancelled: {
          title: "Viaje cancelado",
          message: data.reason || "El viaje ha sido cancelado",
          type: "warning" as const,
        },
      };

      const notif = notifications[type as keyof typeof notifications];
      if (notif) {
        useUIStore.getState().showToast(notif.title, notif.message, notif.type);
      }
    } catch (error) {
      console.warn(
        "[WebSocketService] Could not show toast notification:",
        error,
      );
    }
  }

  // Testing methods for development
  simulateRideAccepted(
    rideId: number,
    driverId: number,
    estimatedArrivalMinutes: number = 5,
  ) {
    console.log("[WebSocketService] Simulating ride accepted for testing");
    this.emit("rideAccepted", {
      rideId,
      driverId,
      estimatedArrivalMinutes,
      timestamp: new Date(),
    });
  }

  simulateRideRejected(
    rideId: number,
    driverId: number,
    reason: string = "Conductor ocupado",
  ) {
    console.log("[WebSocketService] Simulating ride rejected for testing");
    this.emit("rideRejected", {
      rideId,
      driverId,
      reason,
      timestamp: new Date(),
    });
  }

  simulateDriverRideRequest(
    rideId: number,
    driverId: number,
    pickupAddress: string = "Dirección de prueba",
  ) {
    console.log(
      "[WebSocketService] Simulating driver ride request for testing",
    );
    this.emit("driverRideRequest", {
      rideId,
      driverId,
      pickupAddress,
      expiresAt: new Date(Date.now() + 30000), // 30 segundos
      timestamp: new Date(),
    });
  }

  // New simulation methods for the new WebSocket events
  simulateRideArrived(
    rideId: number,
    driverId: number,
    driverName: string = "Carlos Rodriguez",
    vehicleInfo: string = "Toyota Camry Negro",
  ) {
    console.log("[WebSocketService] Simulating ride arrived for testing");
    this.emit("rideArrived", {
      rideId,
      driverId,
      driverName,
      vehicleInfo,
      timestamp: new Date(),
    });
  }

  simulateRideStarted(
    rideId: number,
    driverId: number,
    driverName: string = "Carlos Rodriguez",
  ) {
    console.log("[WebSocketService] Simulating ride started for testing");
    this.emit("rideStarted", {
      rideId,
      driverId,
      driverName,
      timestamp: new Date(),
    });
  }

  simulateRideCompleted(
    rideId: number,
    driverId: number,
    driverName: string = "Carlos Rodriguez",
    fare: number = 18.5,
    distance: number = 12.5,
    duration: number = 25,
  ) {
    console.log("[WebSocketService] Simulating ride completed for testing");
    this.emit("rideCompleted", {
      rideId,
      driverId,
      driverName,
      fare,
      distance,
      duration,
      timestamp: new Date(),
    });
  }

  simulateRideCancelled(
    rideId: number,
    driverId: number,
    reason: string = "Vehículo averiado",
    cancelledBy: string = "driver",
  ) {
    console.log("[WebSocketService] Simulating ride cancelled for testing");
    this.emit("rideCancelled", {
      rideId,
      driverId,
      reason,
      cancelledBy,
      timestamp: new Date(),
    });
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

  // Test basic WebSocket connectivity (without namespace)
  async testBasicConnection(): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      try {
        console.log(
          "[WebSocketService] 🧪 Testing basic WebSocket connection (no namespace)",
        );

        const testUrl = endpoints.websocket.url().replace("/uber-realtime", "");
        console.log("[WebSocketService] 🧪 Test URL:", testUrl);

        const testSocket = io(testUrl, {
          transports: ["websocket"],
          timeout: 5000,
          forceNew: true,
        });

        const timeout = setTimeout(() => {
          testSocket.disconnect();
          console.log("[WebSocketService] 🧪 Basic connection test: TIMEOUT");
          resolve({ success: false, error: "Connection timeout" });
        }, 5000);

        testSocket.on("connect", () => {
          clearTimeout(timeout);
          console.log("[WebSocketService] 🧪 Basic connection test: SUCCESS");
          testSocket.disconnect();
          resolve({ success: true });
        });

        testSocket.on("connect_error", (error) => {
          clearTimeout(timeout);
          console.log(
            "[WebSocketService] 🧪 Basic connection test: ERROR",
            error.message,
          );
          testSocket.disconnect();
          resolve({ success: false, error: error.message });
        });
      } catch (error) {
        console.log(
          "[WebSocketService] 🧪 Basic connection test: EXCEPTION",
          error,
        );
        resolve({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
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
