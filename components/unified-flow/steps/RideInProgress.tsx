import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";

import CustomButton from "@/components/CustomButton";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useRealtimeStore } from "@/store/realtime/realtime";
import { websocketService } from "@/app/services/websocketService";
import { LocationData } from "@/types/type";

export interface RideInProgressProps {
  driverName?: string;
  destination?: string;
  estimatedTime: number;
  rideId?: number;
  onCallDriver: () => void;
  onEmergency: () => void;
}

const RideInProgress: React.FC<RideInProgressProps> = ({
  driverName,
  destination,
  estimatedTime,
  rideId,
  onCallDriver,
  onEmergency,
}) => {
  const { back, matchedDriver, rideId: storeRideId, confirmedDestination } = useMapFlow();
  const activeRide = useRealtimeStore((state) => state.activeRide);

  // Usar selectores del hook de Zustand para obtener datos en tiempo real
  const driverLocation = useRealtimeStore((state) => state.driverLocation);
  const connectionStatus = useRealtimeStore((state) => state.connectionStatus);

  // Usar datos reales del store
  const actualRideId = rideId || storeRideId;
  const actualDriverName = matchedDriver?.title || driverName || "Conductor";
  const actualDestination = confirmedDestination?.address || destination || "Destino";

  // Estado local para información en tiempo real
  const [dynamicEta, setDynamicEta] = useState<number>(estimatedTime);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Actualizar estado cuando cambie la ubicación del conductor
  useEffect(() => {
    if (!actualRideId) {
      console.warn("[RideInProgress] No rideId available for real-time updates");
      return;
    }

    console.log("[RideInProgress] Setting up real-time ride tracking", { actualRideId });
  }, [actualRideId]);

  // Actualizar estado cuando cambie la ubicación del conductor
  useEffect(() => {
    if (driverLocation) {
      console.log("[RideInProgress] Driver location updated:", driverLocation);
      setLastUpdate(new Date());

      // Calcular ETA dinámico basado en la nueva ubicación
      // Esto sería más complejo en producción con APIs de rutas
      const newEta = Math.max(1, Math.floor(dynamicEta * 0.9)); // Simulación
      setDynamicEta(newEta);
    }
  }, [driverLocation, dynamicEta]);

  return (
    <View className="flex-1">
      <FlowHeader title="Viaje en Curso" onBack={back} />

      <View className="p-6">
        {/* Estado de conexión WebSocket */}
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className={`w-2 h-2 rounded-full mr-2 ${connectionStatus.websocketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text className={`text-xs font-JakartaMedium ${connectionStatus.websocketConnected ? 'text-green-700' : 'text-red-700'}`}>
              {connectionStatus.websocketConnected ? 'Conectado' : 'Desconectado'}
            </Text>
          </View>
          {actualRideId && (
            <Text className="text-xs text-gray-500 font-Jakarta">
              Viaje #{actualRideId}
            </Text>
          )}
        </View>

        {/* Información principal del viaje */}
        <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <Text className="font-JakartaBold text-green-800 mb-1">
            Viaje activo
          </Text>
          <Text className="font-Jakarta text-green-700">
            Con {actualDriverName} hacia {actualDestination}
          </Text>

          {/* ETA dinámico */}
          <View className="flex-row items-center justify-between mt-2">
            <Text className="font-Jakarta text-green-600 text-sm">
              Tiempo estimado: {dynamicEta} min
            </Text>
            {dynamicEta !== estimatedTime && (
              <Text className="font-Jakarta text-green-600 text-xs bg-green-100 px-2 py-1 rounded">
                Actualizado
              </Text>
            )}
          </View>

          {/* Ubicación del conductor en tiempo real */}
          {driverLocation && (
            <View className="mt-2 p-2 bg-white/50 rounded border border-green-300">
              <Text className="font-Jakarta text-green-800 text-xs">
                📍 Conductor: {driverLocation.latitude.toFixed(4)}, {driverLocation.longitude.toFixed(4)}
              </Text>
              <Text className="font-Jakarta text-green-700 text-xs mt-1">
                Última actualización: {lastUpdate.toLocaleTimeString()}
              </Text>
            </View>
          )}
        </View>

        {/* Información adicional */}
        {!connectionStatus.websocketConnected && (
          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <Text className="font-Jakarta text-yellow-800 text-sm">
              ⚠️ Sin conexión en tiempo real. La información puede no estar actualizada.
            </Text>
          </View>
        )}

        <View>
          <CustomButton
            title="Llamar conductor"
            bgVariant="outline"
            onPress={onCallDriver}
            className="w-full mb-3"
          />

          <CustomButton
            title="🚨 Emergencia"
            bgVariant="danger"
            onPress={onEmergency}
            className="w-full"
          />
        </View>
      </View>
    </View>
  );
};

export default RideInProgress;
