import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";

import DriverDiagnostics from "@/components/debug/DriverDiagnostics";
import { useWebSocketDebug } from "@/hooks/useWebSocketDebug";
import { useDriverStateStore } from "@/store/driverState/driverState";
import { websocketService } from "@/app/services/websocketService";

export default function DriverDebugScreen() {
  const debugInfo = useWebSocketDebug();
  const driverState = useDriverStateStore();

  const handleTestRideRequest = () => {
    debugInfo.testEvent("ride:requested", {
      rideId: Math.floor(Math.random() * 1000),
      area: "Test Area",
      timestamp: new Date().toISOString(),
      origin: {
        latitude: 10.4806,
        longitude: -66.9036,
        address: "Caracas, Venezuela"
      },
      destination: {
        latitude: 10.5000,
        longitude: -66.9000,
        address: "Destino de prueba"
      },
      passenger: {
        name: "Usuario de Prueba",
        phone: "+584121234567",
        rating: 4.8
      },
      farePrice: 15.50,
      tier: {
        name: "Económico",
        vehicleType: "car"
      }
    });
    
    Alert.alert(
      "Evento de Prueba Enviado",
      "Se ha enviado un evento de prueba. Revisa la consola y el historial de eventos."
    );
  };

  const handleReconnectWebSocket = async () => {
    try {
      if (driverState.driverId) {
        // Obtener token del store o de donde esté almacenado
        const token = "your-token-here"; // Necesitarás obtener el token real
        await websocketService.connect(driverState.driverId.toString(), token);
        Alert.alert("WebSocket", "Reconectando...");
      } else {
        Alert.alert("Error", "No hay ID de conductor disponible");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo reconectar el WebSocket");
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-4 shadow-sm">
        <Text className="text-xl font-JakartaBold text-center">
          🔧 Debug del Conductor
        </Text>
        <Text className="text-sm text-gray-600 text-center mt-1">
          Diagnóstico completo del sistema de viajes
        </Text>
      </View>

      <ScrollView className="flex-1">
        <DriverDiagnostics />

        {/* Acciones de Debug */}
        <View className="p-4 space-y-3">
          <TouchableOpacity
            onPress={handleTestRideRequest}
            className="bg-blue-500 rounded-lg p-4"
          >
            <Text className="text-white font-JakartaBold text-center text-lg">
              🚨 Simular Solicitud de Viaje
            </Text>
            <Text className="text-white/80 font-Jakarta text-center text-sm mt-1">
              Enviar evento de prueba para verificar recepción
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleReconnectWebSocket}
            className="bg-green-500 rounded-lg p-4"
          >
            <Text className="text-white font-JakartaBold text-center text-lg">
              🔄 Reconectar WebSocket
            </Text>
            <Text className="text-white/80 font-Jakarta text-center text-sm mt-1">
              Forzar reconexión del WebSocket
            </Text>
          </TouchableOpacity>

          {/* Estado de Conexión */}
          <View className="bg-white rounded-lg p-4">
            <Text className="font-JakartaBold text-lg mb-3">
              Estado de Conexión
            </Text>
            <Text className="font-Jakarta text-sm text-gray-600 mb-1">
              WebSocket: {debugInfo.isConnected ? "✅ Conectado" : "❌ Desconectado"}
            </Text>
            <Text className="font-Jakarta text-sm text-gray-600 mb-1">
              Estado: {debugInfo.connectionStatus}
            </Text>
            <Text className="font-Jakarta text-sm text-gray-600">
              Eventos recibidos: {debugInfo.eventHistory.length}
            </Text>
          </View>

          {/* Historial de Eventos */}
          {debugInfo.eventHistory.length > 0 && (
            <View className="bg-white rounded-lg p-4">
              <Text className="font-JakartaBold text-lg mb-3">
                Historial de Eventos
              </Text>
              {debugInfo.eventHistory.slice(0, 5).map((event, index) => (
                <View key={index} className="bg-gray-50 rounded-lg p-2 mb-2">
                  <Text className="font-JakartaMedium text-sm text-gray-800">
                    {event.event}
                  </Text>
                  <Text className="font-Jakarta text-xs text-gray-600">
                    {event.timestamp.toLocaleTimeString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
