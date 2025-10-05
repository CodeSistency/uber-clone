import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useRealtimeStore } from "@/store";

export interface ExtendedConnectionStatus {
  isConnected: boolean;
  connectionType: "wifi" | "cellular" | "none";
  connectionSpeed: number;
  isInternetReachable: boolean;
  websocketConnected: boolean;
  lastPing: Date;
}

export class ConnectivityManager {
  private unsubscribe: (() => void) | null = null;
  private isInitialized = false;
  private lastKnownState: NetInfoState | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      
      return;
    }

    try {
      

      // Get initial state
      const initialState = await NetInfo.fetch();
      this.lastKnownState = initialState;
      this.updateConnectionStatus(initialState);

      // Set up listener for network changes
      this.unsubscribe = NetInfo.addEventListener((state) => {
        

        this.lastKnownState = state;
        this.updateConnectionStatus(state);
      });

      this.isInitialized = true;
      
    } catch (error) {
      
      throw error;
    }
  }

  private updateConnectionStatus(state: NetInfoState): void {
    try {
      // Extract connection details
      const connectionSpeed = this.extractConnectionSpeed(state);
      const isInternetReachable = state.isInternetReachable ?? false;

      const extendedStatus: ExtendedConnectionStatus = {
        isConnected: state.isConnected ?? false,
        connectionType: this.mapConnectionType(state.type),
        connectionSpeed,
        isInternetReachable,
        websocketConnected:
          useRealtimeStore.getState().connectionStatus.websocketConnected,
        lastPing: new Date(),
      };

      // Update realtime store
      useRealtimeStore.getState().setConnectionStatus({
        isConnected: extendedStatus.isConnected,
        connectionType: extendedStatus.connectionType,
        websocketConnected: extendedStatus.websocketConnected,
        lastPing: extendedStatus.lastPing,
      });

      
    } catch (error) {
      
    }
  }

  private mapConnectionType(
    type: string | null | undefined,
  ): "wifi" | "cellular" | "none" {
    if (!type) return "none";

    switch (type.toLowerCase()) {
      case "wifi":
      case "ethernet":
        return "wifi";
      case "cellular":
      case "mobile":
        return "cellular";
      default:
        return "none";
    }
  }

  private extractConnectionSpeed(state: NetInfoState): number {
    const details = state.details as any;

    // Try to get connection strength/speed from different sources
    if (typeof details?.strength === "number") {
      // Convert WiFi strength percentage to approximate Mbps
      return Math.round(details.strength * 0.3); // Rough estimate
    }

    if (details?.linkSpeed) {
      // Direct link speed in Mbps
      return details.linkSpeed as number;
    }

    // Default fallback
    return state.type === "wifi" ? 10 : 5; // Mbps estimates
  }

  getCurrentState(): NetInfoState | null {
    return this.lastKnownState;
  }

  isNetworkReachable(): boolean {
    return this.lastKnownState?.isInternetReachable ?? false;
  }

  getConnectionQuality(): "excellent" | "good" | "fair" | "poor" {
    const speed = this.extractConnectionSpeed(
      (this.lastKnownState as any) || ({} as any),
    );

    if (speed >= 20) return "excellent";
    if (speed >= 10) return "good";
    if (speed >= 5) return "fair";
    return "poor";
  }

  destroy(): void {
    

    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    this.isInitialized = false;
    this.lastKnownState = null;

    
  }

  // Utility method to check if we should attempt network operations
  shouldAttemptNetworkOperation(): boolean {
    const state = this.lastKnownState;
    if (!state) return false;

    // Don't attempt if not connected
    if (!state.isConnected) return false;

    // Don't attempt if internet is not reachable
    if (!state.isInternetReachable) return false;

    return true;
  }
}

// Singleton instance
export const connectivityManager = new ConnectivityManager();

// Hook for React components
export const useConnectivityManager = () => {
  const { connectionStatus } = useRealtimeStore();

  const isOnline = connectionStatus.isConnected;
  const connectionType = connectionStatus.connectionType;
  const connectionSpeed = connectivityManager["extractConnectionSpeed"](
    (connectivityManager.getCurrentState() as any) || ({} as any),
  );
  const isInternetReachable = connectivityManager.isNetworkReachable();
  const connectionQuality = connectivityManager.getConnectionQuality();
  const shouldAttemptNetworkOp =
    connectivityManager.shouldAttemptNetworkOperation();

  return {
    isOnline,
    connectionType,
    connectionSpeed,
    isInternetReachable,
    connectionQuality,
    shouldAttemptNetworkOp,
    connectivityManager,
    currentState: connectivityManager.getCurrentState(),
  };
};
