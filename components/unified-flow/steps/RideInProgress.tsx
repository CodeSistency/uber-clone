import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";

import CustomButton from "@/components/CustomButton";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useAutoNavigation } from "@/hooks/useAutoNavigation";
import { useRealtimeStore } from "@/store/realtime/realtime";
import { websocketService } from "@/app/services/websocketService";
import { websocketEventManager } from "@/lib/websocketEventManager";
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
  const {
    back,
    matchedDriver,
    rideId: storeRideId,
    confirmedDestination,
  } = useMapFlow();
  const { navigationState } = useAutoNavigation(); // 🚀 NUEVO: Hook de navegación automática
  const activeRide = useRealtimeStore((state) => state.activeRide);

  // Usar selectores del hook de Zustand para obtener datos en tiempo real
  const driverLocation = useRealtimeStore((state) => state.driverLocation);
  const connectionStatus = useRealtimeStore((state) => state.connectionStatus);

  // Usar datos reales del store
  const actualRideId = rideId || storeRideId;
  const actualDriverName = matchedDriver?.title || driverName || "Conductor";
  const actualDestination =
    confirmedDestination?.address || destination || "Destino";

  // Estado local para información en tiempo real
  const [dynamicEta, setDynamicEta] = useState<number>(estimatedTime);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [etaAccuracy, setEtaAccuracy] = useState<"high" | "medium" | "low">(
    "medium",
  );
  const [gpsUpdatesCount, setGpsUpdatesCount] = useState<number>(0);

  // Función para calcular distancia entre dos puntos GPS usando fórmula de Haversine
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Función para calcular ETA dinámico basado en distancia y velocidad estimada
  const calculateDynamicEta = (
    driverLat: number,
    driverLng: number,
    destinationLat?: number,
    destinationLng?: number,
    currentSpeedKmh: number = 30, // Velocidad promedio estimada
  ): { eta: number; accuracy: "high" | "medium" | "low" } => {
    if (!destinationLat || !destinationLng) {
      // Sin coordenadas de destino, usar lógica simple
      return {
        eta: Math.max(1, Math.floor(dynamicEta * 0.9)),
        accuracy: "low",
      };
    }

    const distance = calculateDistance(
      driverLat,
      driverLng,
      destinationLat,
      destinationLng,
    );

    // Estimar velocidad basada en condiciones (esto sería más complejo en producción)
    const estimatedSpeed = currentSpeedKmh; // km/h
    const timeHours = distance / estimatedSpeed;
    const timeMinutes = Math.round(timeHours * 60);

    // Determinar precisión basada en la edad de la ubicación y distancia
    const timeSinceLastUpdate = Date.now() - lastUpdate.getTime();
    let accuracy: "high" | "medium" | "low" = "medium";

    if (timeSinceLastUpdate < 30000 && distance > 0.1) {
      // Menos de 30s y distancia razonable
      accuracy = "high";
    } else if (timeSinceLastUpdate < 60000) {
      accuracy = "medium";
    } else {
      accuracy = "low";
    }

    return {
      eta: Math.max(1, timeMinutes),
      accuracy,
    };
  };

  // Actualizar estado cuando cambie la ubicación del conductor
  useEffect(() => {
    if (!actualRideId) {
      console.warn(
        "[RideInProgress] No rideId available for real-time updates",
      );
      return;
    }

    console.log("[RideInProgress] Setting up real-time ride tracking", {
      actualRideId,
    });
  }, [actualRideId]);

  // 🚀 NUEVO: Listener WebSocket para actualizaciones de ubicación del conductor
  useEffect(() => {
    if (!actualRideId) {
      console.warn("[RideInProgress] No rideId available for GPS tracking");
      return;
    }

    console.log(
      "[RideInProgress] Setting up WebSocket GPS tracking for ride:",
      actualRideId,
    );

    const handleDriverLocationUpdate = (data: any) => {
      console.log(
        "[RideInProgress] 🚨 WebSocket driverLocationUpdate received:",
        data,
      );

      // Validar que el evento corresponde a este viaje
      if (data.rideId !== actualRideId) {
        console.log(
          "[RideInProgress] Ignoring location update for different ride",
        );
        return;
      }

      // Validar coordenadas GPS
      if (!data.latitude || !data.longitude) {
        console.warn("[RideInProgress] Invalid GPS coordinates received");
        return;
      }

      const newLocation: LocationData = {
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy || 10,
        timestamp: new Date(data.timestamp || Date.now()),
      };

      // Actualizar ubicación en el store
      useRealtimeStore.getState().updateDriverLocation(newLocation);

      // Actualizar estado local
      setLastUpdate(new Date());
      setGpsUpdatesCount((prev) => prev + 1);

      // Calcular ETA dinámico con coordenadas reales del destino
      const destinationCoords = confirmedDestination?.location || {
        latitude: confirmedDestination?.latitude,
        longitude: confirmedDestination?.longitude,
      };

      const etaResult = calculateDynamicEta(
        newLocation.latitude,
        newLocation.longitude,
        destinationCoords?.latitude,
        destinationCoords?.longitude,
        data.speed || 30, // Velocidad del conductor si está disponible
      );

      setDynamicEta(etaResult.eta);
      setEtaAccuracy(etaResult.accuracy);

      console.log(
        `[RideInProgress] ETA updated: ${etaResult.eta}min (accuracy: ${etaResult.accuracy})`,
      );
    };

    // Suscribirse al evento driverLocationUpdate
    websocketEventManager.on(
      "driverLocationUpdate",
      handleDriverLocationUpdate,
    );

    console.log("[RideInProgress] ✅ GPS tracking active via WebSocket");

    return () => {
      websocketEventManager.off(
        "driverLocationUpdate",
        handleDriverLocationUpdate,
      );
      console.log("[RideInProgress] 🧹 GPS tracking cleaned up");
    };
  }, [actualRideId, confirmedDestination]);

  // 🚀 NUEVO: Listeners para eventos del viaje en progreso
  useEffect(() => {
    if (!actualRideId) {
      console.warn("[RideInProgress] No rideId available for ride events");
      return;
    }

    console.log("[RideInProgress] Setting up ride lifecycle event listeners", {
      actualRideId,
    });

    const handleRideArrived = (data: any) => {
      console.log("[RideInProgress] 🚨 ride:arrived received:", data);

      if (data.rideId === actualRideId) {
        // El conductor ha llegado al punto de recogida
        // La navegación automática la maneja useAutoNavigation
        console.log("[RideInProgress] Driver has arrived at pickup location");
      }
    };

    const handleRideStarted = (data: any) => {
      console.log("[RideInProgress] 🚨 ride:started received:", data);

      if (data.rideId === actualRideId) {
        // El viaje ha comenzado oficialmente
        console.log("[RideInProgress] Ride has officially started");
        // Actualizar estado local si es necesario
      }
    };

    const handleRideCompleted = (data: any) => {
      console.log("[RideInProgress] 🚨 ride:completed received:", data);

      if (data.rideId === actualRideId) {
        // El viaje ha finalizado
        console.log("[RideInProgress] Ride has been completed");
        // La navegación automática la maneja useAutoNavigation
      }
    };

    const handleRideCancelled = (data: any) => {
      console.log("[RideInProgress] 🚨 ride:cancelled received:", data);

      if (data.rideId === actualRideId) {
        // El viaje ha sido cancelado
        console.log("[RideInProgress] Ride has been cancelled");
        // La navegación automática la maneja useAutoNavigation
      }
    };

    // Suscribirse a eventos del ciclo de vida del viaje
    websocketEventManager.on("ride:arrived", handleRideArrived);
    websocketEventManager.on("ride:started", handleRideStarted);
    websocketEventManager.on("ride:completed", handleRideCompleted);
    websocketEventManager.on("ride:cancelled", handleRideCancelled);

    console.log("[RideInProgress] ✅ Ride lifecycle listeners active");

    return () => {
      websocketEventManager.off("ride:arrived", handleRideArrived);
      websocketEventManager.off("ride:started", handleRideStarted);
      websocketEventManager.off("ride:completed", handleRideCompleted);
      websocketEventManager.off("ride:cancelled", handleRideCancelled);
      console.log("[RideInProgress] 🧹 Ride lifecycle listeners cleaned up");
    };
  }, [actualRideId]);

  return (
    <View className="flex-1">
      <FlowHeader title="Viaje en Curso" onBack={back} />

      <View className="p-6">
        {/* 🚀 NUEVO: Estado de conexión WebSocket mejorado */}
        <View className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <View
                className={`w-3 h-3 rounded-full mr-2 ${
                  connectionStatus.websocketConnected
                    ? "bg-green-500"
                    : "bg-red-500"
                } ${connectionStatus.websocketConnected ? "animate-pulse" : ""}`}
              />
              <Text
                className={`text-sm font-JakartaMedium ${
                  connectionStatus.websocketConnected
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {connectionStatus.websocketConnected
                  ? "🟢 GPS en tiempo real activo"
                  : "🔴 GPS desconectado"}
              </Text>
            </View>
            {actualRideId && (
              <Text className="text-xs text-gray-500 font-Jakarta">
                Viaje #{actualRideId}
              </Text>
            )}
          </View>

          {/* Información detallada de GPS */}
          <View className="flex-row items-center justify-between text-xs">
            <Text className="text-gray-600 font-Jakarta">
              📡 {gpsUpdatesCount} actualizaciones GPS
            </Text>
            <Text className="text-gray-600 font-Jakarta">
              ⏰ Última: {lastUpdate.toLocaleTimeString()}
            </Text>
          </View>
        </View>

        {/* Información principal del viaje */}
        <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <Text className="font-JakartaBold text-green-800 mb-1">
            Viaje activo
          </Text>
          <Text className="font-Jakarta text-green-700">
            Con {actualDriverName} hacia {actualDestination}
          </Text>

          {/* 🚀 NUEVO: ETA dinámico con precisión */}
          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row items-center">
              <Text className="font-Jakarta text-green-600 text-sm">
                Tiempo estimado: {dynamicEta} min
              </Text>
              {/* Indicador de precisión del ETA */}
              <View
                className={`ml-2 px-2 py-1 rounded-full ${
                  etaAccuracy === "high"
                    ? "bg-green-100"
                    : etaAccuracy === "medium"
                      ? "bg-yellow-100"
                      : "bg-red-100"
                }`}
              >
                <Text
                  className={`text-xs font-Jakarta ${
                    etaAccuracy === "high"
                      ? "text-green-700"
                      : etaAccuracy === "medium"
                        ? "text-yellow-700"
                        : "text-red-700"
                  }`}
                >
                  {etaAccuracy === "high"
                    ? "🔵 Alta"
                    : etaAccuracy === "medium"
                      ? "🟡 Media"
                      : "🔴 Baja"}
                </Text>
              </View>
            </View>
            {dynamicEta !== estimatedTime && (
              <Text className="font-Jakarta text-green-600 text-xs bg-green-100 px-2 py-1 rounded">
                GPS actualizado
              </Text>
            )}
          </View>

          {/* 🚀 NUEVO: Ubicación del conductor en tiempo real mejorada */}
          {driverLocation && (
            <View className="mt-2 p-3 bg-white/70 rounded border border-green-300">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="font-JakartaBold text-green-800 text-xs">
                  📍 Ubicación del conductor
                </Text>
                <Text className="font-Jakarta text-green-700 text-xs">
                  Precisión: ±{driverLocation.accuracy || 10}m
                </Text>
              </View>
              <Text className="font-Jakarta text-green-800 text-xs mb-1">
                📌 Coordenadas: {driverLocation.latitude.toFixed(4)},{" "}
                {driverLocation.longitude.toFixed(4)}
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="font-Jakarta text-green-700 text-xs">
                  ⏰ Actualizado: {lastUpdate.toLocaleTimeString()}
                </Text>
                {driverLocation.timestamp && (
                  <Text className="font-Jakarta text-green-600 text-xs">
                    GPS activo
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* 🚀 NUEVO: Advertencia cuando no hay conexión GPS */}
          {!connectionStatus.websocketConnected && (
            <View className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <Text className="font-Jakarta text-yellow-800 text-xs">
                ⚠️ Sin conexión en tiempo real. La información puede no estar
                actualizada.
              </Text>
            </View>
          )}
        </View>

        {/* Información adicional */}

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
