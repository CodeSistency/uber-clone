import { useEffect, useState } from "react";
import { websocketService } from "@/app/services/websocketService";
import { websocketEventManager } from "@/lib/websocketEventManager";

interface WebSocketDebugInfo {
  isConnected: boolean;
  connectionStatus: string;
  eventListeners: string[];
  lastEvent: any;
  eventHistory: Array<{ event: string; timestamp: Date; data: any }>;
}

export const useWebSocketDebug = () => {
  const [debugInfo, setDebugInfo] = useState<WebSocketDebugInfo>({
    isConnected: false,
    connectionStatus: "unknown",
    eventListeners: [],
    lastEvent: null,
    eventHistory: []
  });

  useEffect(() => {
    const updateConnectionStatus = () => {
      setDebugInfo(prev => ({
        ...prev,
        isConnected: websocketService.isConnected,
        connectionStatus: websocketService.isConnected ? "connected" : "disconnected"
      }));
    };

    // Verificar estado inicial
    updateConnectionStatus();

    // Actualizar cada segundo
    const interval = setInterval(updateConnectionStatus, 1000);

    // Escuchar todos los eventos para debugging
    const handleAnyEvent = (event: string, data: any) => {
      
      
      setDebugInfo(prev => ({
        ...prev,
        lastEvent: { event, data, timestamp: new Date() },
        eventHistory: [
          { event, timestamp: new Date(), data },
          ...prev.eventHistory.slice(0, 9) // Mantener solo los últimos 10
        ]
      }));
    };

    // Registrar listeners para eventos comunes
    const events = [
      "ride:requested",
      "driver:ride-request", 
      "driverIncomingRequest",
      "ride:accepted",
      "ride:rejected",
      "driverLocationUpdate",
      "chat:new-message"
    ];

    events.forEach(event => {
      websocketEventManager.on(event, (data: any) => handleAnyEvent(event, data));
    });

    return () => {
      clearInterval(interval);
      events.forEach(event => {
        websocketEventManager.off(event, handleAnyEvent);
      });
    };
  }, []);

  const testEvent = (eventName: string, testData: any) => {
    
    websocketEventManager.emit(eventName, testData);
  };

  const getEventStats = () => {
    const stats: Record<string, number> = {};
    debugInfo.eventHistory.forEach(item => {
      stats[item.event] = (stats[item.event] || 0) + 1;
    });
    return stats;
  };

  return {
    ...debugInfo,
    testEvent,
    getEventStats,
    clearHistory: () => setDebugInfo(prev => ({ ...prev, eventHistory: [] }))
  };
};
