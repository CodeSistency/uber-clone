import { io, Socket } from 'socket.io-client';
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

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  async connect(userId: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log("[WebSocketService] Connecting to server...", { userId });

        // Initialize socket connection (temporarily commented for development)
        this.socket = io(`${process.env.EXPO_PUBLIC_WS_URL || "wss://gnuhealth-back.alcaravan.com.ve"}/rides`, {
          auth: {
            token,
            userId,
          },
          transports: ['websocket'],
          upgrade: false,
          timeout: 5000,
          reconnection: false, // We'll handle reconnection manually
        });

        // Connection events
        this.socket.on("connect", () => {
          console.log("[WebSocketService] Connected successfully");
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.updateConnectionStatus(true);
          resolve();
        });

        this.socket.on("disconnect", (reason: any) => {
          console.log("[WebSocketService] Disconnected:", reason);
          this.handleDisconnect();
        });

        this.socket.on("connect_error", (error: any) => {
          console.error("[WebSocketService] Connection error:", error);
          reject(error);
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

  // Message sending
  sendMessage(rideId: number, message: string): void {
    if (this.socket && this.socket.connected) {
      const messageData = {
        rideId,
        message,
        timestamp: new Date(),
      };

      console.log("[WebSocketService] Sending message:", messageData);
      this.socket.emit("sendMessage", messageData);
    } else {
      console.warn("[WebSocketService] Cannot send message: not connected");
    }
  }

  // Location updates
  updateDriverLocation(rideId: number, location: LocationData): void {
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

  // Connection status
  private updateConnectionStatus(connected: boolean): void {
    const connectionStatus = {
      isConnected: connected,
      connectionType: "wifi" as "none" | "wifi" | "cellular", // This would be determined by NetInfo
      websocketConnected: connected,
      lastPing: new Date(),
    };

    useRealtimeStore.getState().setConnectionStatus(connectionStatus);
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

  // Utility methods
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit("ping", { timestamp: Date.now() });
      }
    }, 30000); // Ping every 30 seconds
  }

  private handleDisconnect(): void {
    console.log("[WebSocketService] Handling disconnect...");

    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Update connection status
    this.updateConnectionStatus(false);

    // Attempt reconnection
    this.attemptReconnection();
  }

  private attemptReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay =
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

      console.log(
        `[WebSocketService] Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`,
      );

      setTimeout(() => {
        if (this.socket && !this.socket.connected) {
          this.socket.connect();
        }
      }, delay);
    } else {
      console.error("[WebSocketService] Max reconnection attempts reached");
    }
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

  // Cleanup
  cleanup(): void {
    console.log("[WebSocketService] Cleaning up...");
    this.disconnect();
    this.messageHandlers.clear();
  }
}

// Export singleton instance
export const websocketService = WebSocketService.getInstance();
