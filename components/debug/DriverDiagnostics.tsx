import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

import { websocketService } from "@/app/services/websocketService";
import { websocketEventManager } from "@/lib/websocketEventManager";
import { useDriverStateStore } from "@/store/driverState/driverState";
import { useLocationStore } from "@/store/location/location";
import { useRealtimeStore } from "@/store";

const DriverDiagnostics: React.FC = () => {
  const driverState = useDriverStateStore();
  const locationState = useLocationStore();
  const realtimeStore = useRealtimeStore();
  
  const [wsConnected, setWsConnected] = useState(false);
  const [eventListeners, setEventListeners] = useState<string[]>([]);
  const [lastEvent, setLastEvent] = useState<any>(null);

  useEffect(() => {
    // Verificar conexión WebSocket
    const checkConnection = () => {
      setWsConnected(websocketService.isConnected);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 1000);

    // Escuchar eventos para debugging
    const handleTestEvent = (data: any) => {
      
      setLastEvent({ event: "ride:requested", data, timestamp: new Date() });
    };

    websocketEventManager.on("ride:requested", handleTestEvent);

    return () => {
      clearInterval(interval);
      websocketEventManager.off("ride:requested", handleTestEvent);
    };
  }, []);

  const getStatusColor = (condition: boolean) => condition ? "text-green-600" : "text-red-600";
  const getStatusIcon = (condition: boolean) => condition ? "✅" : "❌";

  const diagnostics = [
    {
      label: "WebSocket Conectado",
      value: wsConnected,
      description: "Conexión activa con el servidor"
    },
    {
      label: "Es Conductor",
      value: driverState.isDriver,
      description: "Usuario registrado como conductor"
    },
    {
      label: "Estado Online",
      value: driverState.status === "online",
      description: `Estado actual: ${driverState.status}`
    },
    {
      label: "Verificación Aprobada",
      value: driverState.verificationStatus === "approved",
      description: `Estado verificación: ${driverState.verificationStatus}`
    },
    {
      label: "Disponible",
      value: driverState.isAvailable,
      description: "Conductor disponible para viajes"
    },
    {
      label: "Ubicación Disponible",
      value: !!locationState.userLatitude && !!locationState.userLongitude,
      description: `Lat: ${locationState.userLatitude}, Lng: ${locationState.userLongitude}`
    },
    {
      label: "Puede Recibir Viajes",
      value: driverState.canReceiveRides(),
      description: "Cumple todos los requisitos"
    }
  ];

  const testEvent = () => {
    
    websocketEventManager.emit("ride:requested", {
      rideId: 999,
      area: "Test Area",
      timestamp: new Date().toISOString(),
      test: true
    });
  };

  return (
    <ScrollView className="flex-1 p-4 bg-gray-50">
      <Text className="text-2xl font-JakartaBold mb-4 text-center">
        🔧 Diagnóstico del Conductor
      </Text>

      {/* Estado General */}
      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <Text className="font-JakartaBold text-lg mb-3">Estado General</Text>
        {diagnostics.map((diag, index) => (
          <View key={index} className="flex-row items-center justify-between py-2 border-b border-gray-100">
            <View className="flex-1">
              <Text className="font-JakartaMedium text-gray-800">
                {getStatusIcon(diag.value)} {diag.label}
              </Text>
              <Text className="text-xs text-gray-500">{diag.description}</Text>
            </View>
            <Text className={`font-JakartaBold ${getStatusColor(diag.value)}`}>
              {diag.value ? "OK" : "ERROR"}
            </Text>
          </View>
        ))}
      </View>

      {/* Información de Conexión */}
      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <Text className="font-JakartaBold text-lg mb-3">Conexión WebSocket</Text>
        <Text className="font-Jakarta text-sm text-gray-600 mb-2">
          Estado: {wsConnected ? "Conectado" : "Desconectado"}
        </Text>
        <Text className="font-Jakarta text-sm text-gray-600 mb-2">
          Último ping: {realtimeStore.connectionStatus.lastPing.toLocaleTimeString()}
        </Text>
        <Text className="font-Jakarta text-sm text-gray-600">
          Tipo conexión: {realtimeStore.connectionStatus.connectionType}
        </Text>
      </View>

      {/* Información del Conductor */}
      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <Text className="font-JakartaBold text-lg mb-3">Información del Conductor</Text>
        <Text className="font-Jakarta text-sm text-gray-600 mb-1">
          ID: {driverState.driverId || "No asignado"}
        </Text>
        <Text className="font-Jakarta text-sm text-gray-600 mb-1">
          Nombre: {driverState.getFullName()}
        </Text>
        <Text className="font-Jakarta text-sm text-gray-600 mb-1">
          Email: {driverState.email || "No disponible"}
        </Text>
        <Text className="font-Jakarta text-sm text-gray-600">
          Auto-aceptar: {driverState.autoAcceptEnabled ? "Activado" : "Desactivado"}
        </Text>
      </View>

      {/* Test de Eventos */}
      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <Text className="font-JakartaBold text-lg mb-3">Test de Eventos</Text>
        <TouchableOpacity
          onPress={testEvent}
          className="bg-blue-500 rounded-lg p-3 mb-3"
        >
          <Text className="text-white font-JakartaBold text-center">
            Enviar Evento de Prueba
          </Text>
        </TouchableOpacity>
        
        {lastEvent && (
          <View className="bg-gray-50 rounded-lg p-3">
            <Text className="font-JakartaMedium text-sm text-gray-800 mb-1">
              Último evento recibido:
            </Text>
            <Text className="font-Jakarta text-xs text-gray-600">
              {lastEvent.timestamp.toLocaleTimeString()}
            </Text>
            <Text className="font-Jakarta text-xs text-gray-600">
              {JSON.stringify(lastEvent.data, null, 2)}
            </Text>
          </View>
        )}
      </View>

      {/* Recomendaciones */}
      <View className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <Text className="font-JakartaBold text-yellow-800 mb-2">
          💡 Recomendaciones
        </Text>
        <Text className="font-Jakarta text-sm text-yellow-700">
          • Asegúrate de estar online y verificado{"\n"}
          • Verifica que tu ubicación esté disponible{"\n"}
          • Si el WebSocket no está conectado, reinicia la app{"\n"}
          • Usa el botón de test para verificar que los eventos funcionan
        </Text>
      </View>
    </ScrollView>
  );
};

export default DriverDiagnostics;
