import { useEffect, useCallback, useRef } from "react";

import { useRealtimeStore, useChatStore, useEmergencyStore } from "../../store";
import { LocationData } from "../../types/type";
import { chatService } from "../services/chatService";
import { websocketService } from "../services/websocketService";

export const useWebSocket = (userId: string, token: string) => {
  const isConnectedRef = useRef(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const {
    connectionStatus,
    setConnectionStatus,
    updateRideStatus,
    updateDriverLocation,
  } = useRealtimeStore();

  const { addMessage, setTyping } = useChatStore();

  const { triggerEmergency } = useEmergencyStore();

  // Connect to WebSocket on mount
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await websocketService.connect(userId, token);
        isConnectedRef.current = true;
      } catch (error) {
        console.error("[useWebSocket] Failed to connect:", error);
        isConnectedRef.current = false;
        scheduleReconnect();
      }
    };

    if (userId && token) {
      connectWebSocket();
    }

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [userId, token]);

  // Handle connection status updates
  useEffect(() => {
    const updateConnection = () => {
      const status = {
        isConnected: websocketService.isConnected,
        connectionType: "wifi" as "none" | "wifi" | "cellular", // This would be determined by NetInfo
        websocketConnected: websocketService.isConnected,
        lastPing: new Date(),
      };
      setConnectionStatus(status);
    };

    updateConnection();

    // Update connection status periodically
    const interval = setInterval(updateConnection, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [setConnectionStatus]);

  // Schedule reconnection
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(async () => {
      try {
        if (!isConnectedRef.current) {
          await websocketService.connect(userId, token);
          isConnectedRef.current = true;
        }
      } catch (error) {
        console.error("[useWebSocket] Reconnection failed:", error);
        scheduleReconnect(); // Retry again
      }
    }, 5000); // Retry after 5 seconds
  }, [userId, token]);

  // Join ride room
  const joinRideRoom = useCallback((rideId: number) => {
    websocketService.joinRideRoom(rideId);
  }, []);

  // Leave ride room
  const leaveRideRoom = useCallback((rideId: number) => {
    websocketService.leaveRideRoom(rideId);
  }, []);

  // Send message
  const sendMessage = useCallback(async (rideId: number, message: string) => {
    await chatService.sendMessage(rideId, message);
  }, []);

  // Send typing indicator
  const sendTypingIndicator = useCallback(
    (rideId: number, isTyping: boolean) => {
      chatService.sendTypingIndicator(rideId, isTyping);
    },
    [],
  );

  // Send location update
  const sendLocationUpdate = useCallback(
    (rideId: number, location: LocationData) => {
      websocketService.updateDriverLocation(rideId, location);
    },
    [],
  );

  // Send emergency alert
  const sendEmergency = useCallback((emergencyData: any) => {
    websocketService.triggerEmergency(emergencyData);
  }, []);

  // Connection utilities
  const isConnected = websocketService.isConnected;
  const connectionState = websocketService.connectionState;

  // Force reconnect
  const forceReconnect = useCallback(async () => {
    try {
      await websocketService.connect(userId, token);
      isConnectedRef.current = true;
    } catch (error) {
      console.error("[useWebSocket] Force reconnect failed:", error);
      throw error;
    }
  }, [userId, token]);

  // Get connection info
  const getConnectionInfo = useCallback(() => {
    return {
      isConnected: websocketService.isConnected,
      connectionState: websocketService.connectionState,
      connectionStatus,
    };
  }, [connectionStatus]);

  return {
    // Connection status
    isConnected,
    connectionState,
    connectionStatus,

    // Room management
    joinRideRoom,
    leaveRideRoom,

    // Messaging
    sendMessage,
    sendTypingIndicator,

    // Location updates
    sendLocationUpdate,

    // Emergency
    sendEmergency,

    // Utilities
    forceReconnect,
    getConnectionInfo,
  };
};

export default useWebSocket;
