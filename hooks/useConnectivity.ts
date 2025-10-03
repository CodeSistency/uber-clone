import { useEffect, useState, useCallback } from "react";
import { useRealtimeStore } from "@/store";
import {
  connectivityManager,
  ExtendedConnectionStatus,
} from "@/lib/connectivity";
import { offlineQueue } from "@/lib/offline/OfflineQueue";

export interface ConnectivityState {
  isOnline: boolean;
  connectionType: "wifi" | "cellular" | "none";
  connectionSpeed: number;
  isInternetReachable: boolean;
  connectionQuality: "excellent" | "good" | "fair" | "poor";
  pendingSyncCount: number;
  lastSyncTime: Date | null;
  shouldAttemptNetworkOp: boolean;
}

export const useConnectivity = () => {
  const { connectionStatus } = useRealtimeStore();
  const [connectivityState, setConnectivityState] = useState<ConnectivityState>(
    {
      isOnline: false,
      connectionType: "none",
      connectionSpeed: 0,
      isInternetReachable: false,
      connectionQuality: "poor",
      pendingSyncCount: 0,
      lastSyncTime: null,
      shouldAttemptNetworkOp: false,
    },
  );

  // Update connectivity state when connection status changes
  useEffect(() => {
    const currentState = connectivityManager.getCurrentState();
    const connectionSpeed = connectivityManager["extractConnectionSpeed"](
      (currentState as any) || ({} as any),
    );
    const connectionQuality = connectivityManager.getConnectionQuality();
    const shouldAttemptNetworkOp =
      connectivityManager.shouldAttemptNetworkOperation();

    setConnectivityState((prev) => ({
      ...prev,
      isOnline: connectionStatus.isConnected,
      connectionType: connectionStatus.connectionType,
      connectionSpeed,
      isInternetReachable: connectivityManager.isNetworkReachable(),
      connectionQuality,
      shouldAttemptNetworkOp,
    }));
  }, [connectionStatus]);

  // Update pending sync count periodically
  useEffect(() => {
    const updateSyncCount = () => {
      const pendingCount = offlineQueue.getQueueSize();
      setConnectivityState((prev) => ({
        ...prev,
        pendingSyncCount: pendingCount,
      }));
    };

    // Update immediately
    updateSyncCount();

    // Update every 5 seconds
    const interval = setInterval(updateSyncCount, 5000);

    return () => clearInterval(interval);
  }, []);

  // Initialize connectivity manager
  useEffect(() => {
    const initializeConnectivity = async () => {
      try {
        await connectivityManager.initialize();
        console.log("[useConnectivity] ConnectivityManager initialized");
      } catch (error) {
        console.error(
          "[useConnectivity] Failed to initialize connectivity:",
          error,
        );
      }
    };

    initializeConnectivity();

    // Cleanup on unmount
    return () => {
      connectivityManager.destroy();
    };
  }, []);

  // Process offline queue when coming back online
  useEffect(() => {
    if (connectivityState.isOnline && connectivityState.pendingSyncCount > 0) {
      console.log("[useConnectivity] Back online, processing offline queue");
      offlineQueue.processQueue().then(() => {
        setConnectivityState((prev) => ({
          ...prev,
          lastSyncTime: new Date(),
        }));
      });
    }
  }, [connectivityState.isOnline, connectivityState.pendingSyncCount]);

  const syncNow = useCallback(async () => {
    if (connectivityState.isOnline) {
      console.log("[useConnectivity] Manual sync requested");
      await offlineQueue.processQueue();
      setConnectivityState((prev) => ({
        ...prev,
        lastSyncTime: new Date(),
      }));
    } else {
      console.warn("[useConnectivity] Cannot sync - no internet connection");
    }
  }, [connectivityState.isOnline]);

  const isFeatureAvailable = useCallback(
    (feature: string) => {
      const featureRequirements = {
        realtime: connectivityState.isInternetReachable,
        maps: connectivityState.isOnline,
        payments: connectivityState.isOnline,
        chat: connectivityState.isInternetReachable,
        location: connectivityState.isOnline,
        rides: connectivityState.isOnline,
        delivery: connectivityState.isOnline,
        mandado: connectivityState.isOnline,
        envio: connectivityState.isOnline,
      };

      const requirement =
        featureRequirements[feature as keyof typeof featureRequirements];

      if (requirement === undefined) {
        console.warn(`[useConnectivity] Unknown feature: ${feature}`);
        return true; // Default to available for unknown features
      }

      if (!requirement) {
        console.log(
          `[useConnectivity] Feature '${feature}' not available - connectivity requirement not met`,
        );
      }

      return requirement;
    },
    [connectivityState],
  );

  const getOfflineActions = useCallback(() => {
    return {
      queueRequest: async (request: {
        endpoint: string;
        method: "GET" | "POST" | "PUT" | "DELETE";
        data?: any;
        priority?: "low" | "medium" | "high" | "critical";
      }) => {
        if (connectivityState.isOnline) {
          throw new Error("Cannot queue request when online");
        }

        const priority = request.priority || "medium";
        await offlineQueue.add({
          endpoint: request.endpoint,
          method: request.method,
          data: request.data,
          priority,
        });

        setConnectivityState((prev) => ({
          ...prev,
          pendingSyncCount: prev.pendingSyncCount + 1,
        }));

        console.log(
          `[useConnectivity] Request queued with priority: ${priority}`,
        );
      },

      getPendingCount: () => connectivityState.pendingSyncCount,

      canUseFeature: (feature: string) => isFeatureAvailable(feature),

      getConnectionInfo: () => ({
        type: connectivityState.connectionType,
        speed: connectivityState.connectionSpeed,
        quality: connectivityState.connectionQuality,
        isReachable: connectivityState.isInternetReachable,
      }),
    };
  }, [connectivityState, isFeatureAvailable]);

  return {
    // State
    ...connectivityState,

    // Actions
    syncNow,
    isFeatureAvailable,
    getOfflineActions,

    // Utilities
    connectivityManager,
    offlineQueue,
  };
};
