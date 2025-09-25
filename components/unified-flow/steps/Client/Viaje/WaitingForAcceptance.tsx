import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, ActivityIndicator } from "react-native";

import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useRealtimeStore } from "@/store";
import { driverMatchingService } from "@/app/services/driverMatchingService";
import { websocketService } from "@/app/services/websocketService";

import FlowHeader from "../../../FlowHeader";

const WaitingForAcceptance: React.FC = () => {
  const { next, back, matchedDriver, startAcceptanceTimer, stopAcceptanceTimer, acceptanceTimeout, acceptanceStartTime, rideId } = useMapFlow() as any;
  const { showError, showSuccess } = useUI();
  const realtime = useRealtimeStore();
  const [confirmationResponse, setConfirmationResponse] = useState<any>(null);

  // Estados locales
  const [timeLeft, setTimeLeft] = useState(acceptanceTimeout);
  const [isCancelling, setIsCancelling] = useState(false);

  // Animaciones
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Efecto para iniciar timer de aceptación y confirmar conductor
  useEffect(() => {
    const initializeAcceptance = async () => {
      console.log("[WaitingForAcceptance] Starting acceptance timer and confirming driver...");

      if (!rideId || !matchedDriver) {
        console.error("[WaitingForAcceptance] Missing rideId or matchedDriver");
        showError("Error", "Faltan datos necesarios para confirmar el conductor");
        back();
        return;
      }

      try {
        // Confirmar conductor con el backend
        const confirmRequest = {
          driverId: matchedDriver.id,
          notes: "Confirmación automática desde app móvil"
        };

        console.log("[WaitingForAcceptance] Confirming driver with backend:", confirmRequest);

        const response = await driverMatchingService.confirmDriver(rideId, confirmRequest);
        console.log("[WaitingForAcceptance] Driver confirmed with backend:", response);

        setConfirmationResponse(response);
        startAcceptanceTimer();

        showSuccess("Conductor notificado", `Esperando respuesta de ${matchedDriver.firstName}`);

        // Scale animation
        const scaleAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        );
        scaleAnimation.start();

        return () => {
          scaleAnimation.stop();
          stopAcceptanceTimer();
        };
      } catch (error: any) {
        console.error("[WaitingForAcceptance] Error confirming driver:", error);
        showError("Error", error.message || "Error al confirmar el conductor");
        back();
      }
    };

    initializeAcceptance();
  }, [rideId, matchedDriver]);

  // Efecto para countdown del timer
  useEffect(() => {
    if (!acceptanceStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - acceptanceStartTime.getTime()) / 1000);
      const remaining = Math.max(0, acceptanceTimeout - elapsed);

      setTimeLeft(remaining);

      // Timeout alcanzado - conductor no aceptó
      if (remaining === 0) {
        handleTimeout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [acceptanceStartTime, acceptanceTimeout]);

  // Escuchar eventos WebSocket reales para aceptación/rechazo del conductor
  useEffect(() => {
    if (!rideId) return;

    console.log("[WaitingForAcceptance] Setting up WebSocket listeners for ride:", rideId);

    // Listener para aceptación del conductor
    const handleRideAccepted = (data: any) => {
      console.log("[WaitingForAcceptance] Ride accepted via WebSocket:", data);

      if (data.rideId === rideId) {
        handleDriverAccepted(data);
      }
    };

    // Listener para rechazo del conductor
    const handleRideRejected = (data: any) => {
      console.log("[WaitingForAcceptance] Ride rejected via WebSocket:", data);

      if (data.rideId === rideId) {
        handleDriverRejected(data);
      }
    };

    // Suscribirse a los eventos
    websocketService.on("rideAccepted", handleRideAccepted);
    websocketService.on("rideRejected", handleRideRejected);

    // Polling de respaldo para estados del backend (cada 10 segundos)
    const pollInterval = setInterval(async () => {
      if (!rideId) return;

      try {
        // Aquí podríamos hacer polling a un endpoint de estado
        // const statusResponse = await fetchAPI(`rides/${rideId}/status`);
        // const status = statusResponse.data?.status;

        // Por ahora, solo verificamos el estado local
        const currentStatus = useRealtimeStore.getState().rideStatus;

        // Si el estado cambió a accepted o rejected, manejar automáticamente
        if (currentStatus === "accepted") {
          console.log("[WaitingForAcceptance] Status changed to accepted via polling");
          handleDriverAccepted();
          clearInterval(pollInterval);
        } else if (currentStatus === "cancelled") {
          console.log("[WaitingForAcceptance] Status changed to rejected via polling");
          handleDriverRejected({ reason: "Conductor rechazó la solicitud" });
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.warn("[WaitingForAcceptance] Polling error:", error);
      }
    }, 10000); // Cada 10 segundos

    return () => {
      // Limpiar listeners y polling
      websocketService.off("rideAccepted", handleRideAccepted);
      websocketService.off("rideRejected", handleRideRejected);
      clearInterval(pollInterval);
    };
  }, [rideId]);

  const handleDriverAccepted = (data?: any) => {
    console.log("[WaitingForAcceptance] Driver accepted the ride!", data);

    stopAcceptanceTimer();
    showSuccess("¡Conductor aceptado!", "Tu viaje comenzará pronto");

    // Actualizar estado del ride a "accepted"
    useRealtimeStore.getState().updateRideStatus(rideId, "accepted");

    // Ir a DURANTE_FINALIZACION
    setTimeout(() => {
      next();
    }, 2000);
  };

  const handleDriverRejected = (data: any) => {
    console.log("[WaitingForAcceptance] Driver rejected the ride:", data);

    stopAcceptanceTimer();

    const reason = data.reason || "El conductor no pudo aceptar tu solicitud";
    showError("Conductor no disponible", reason);

    // El conductor rechazó, buscar otro automáticamente
    setTimeout(() => {
      // Volver a buscar conductor (BUSCANDO_CONDUCTOR)
      back();
    }, 3000);
  };

  const handleTimeout = () => {
    console.log("[WaitingForAcceptance] Acceptance timeout - driver didn't accept");

    stopAcceptanceTimer();

    showError(
      "Conductor no disponible",
      "El conductor no pudo aceptar tu solicitud. Buscaremos otro conductor automáticamente."
    );

    // Retroceder para buscar otro conductor
    setTimeout(() => {
      back(); // Volver a BUSCANDO_CONDUCTOR
    }, 3000);
  };

  const handleCancelRide = async () => {
    if (isCancelling) return;

    setIsCancelling(true);

    try {
      console.log("[WaitingForAcceptance] Cancelling ride request...");
      stopAcceptanceTimer();

      showSuccess("Solicitud cancelada", "Puedes buscar otro conductor o modificar tu pedido");

      // Retroceder al inicio del flujo
      setTimeout(() => {
        back();
        back(); // Dos veces para volver a selección de servicio
      }, 1500);
    } catch (error) {
      showError("Error", "No se pudo cancelar la solicitud");
    } finally {
      setIsCancelling(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!matchedDriver) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">Error: No hay conductor seleccionado</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlowHeader
        title="Esperando aceptación"
        subtitle={`Esperando respuesta de ${matchedDriver.first_name}`}
        onBack={handleCancelRide}
      />

      <View className="flex-1 justify-center items-center px-6">
        {/* Animated Driver Card */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
          className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-sm mb-8"
        >
          {/* Driver Avatar */}
          <View className="items-center mb-4">
            <View className="w-20 h-20 bg-gray-300 rounded-full overflow-hidden mb-3">
              <Animated.Image
                source={{ uri: matchedDriver.profile_image_url }}
                className="w-full h-full"
                resizeMode="cover"
                style={{ opacity: opacityAnim }}
              />
            </View>
            <Text className="font-JakartaBold text-xl text-gray-800 text-center">
              {matchedDriver.first_name} {matchedDriver.last_name}
            </Text>
            <Text className="font-Jakarta text-gray-600 text-center">
              🚗 {matchedDriver.car_model}
            </Text>
          </View>

          {/* Status Indicator */}
          <View className="items-center mb-4">
            <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-2">
              <ActivityIndicator size="large" color="#F59E0B" />
            </View>
            <Text className="font-JakartaBold text-orange-600 text-center">
              Esperando aceptación...
            </Text>
          </View>

          {/* Timer */}
          <View className="bg-orange-50 rounded-xl p-4">
            <Text className="font-JakartaMedium text-orange-800 text-center mb-2">
              Tiempo restante
            </Text>
            <Text className="font-JakartaBold text-3xl text-orange-600 text-center mb-2">
              {formatTime(timeLeft)}
            </Text>
            <View className="w-full bg-orange-200 rounded-full h-2">
              <Animated.View
                className="bg-orange-500 h-2 rounded-full"
                style={{
                  width: `${(timeLeft / acceptanceTimeout) * 100}%`,
                }}
              />
            </View>
          </View>
        </Animated.View>

        {/* Trip Details */}
        <View className="bg-gray-50 rounded-xl p-4 w-full max-w-sm mb-8">
          <Text className="font-JakartaBold text-gray-800 mb-3 text-center">
            Detalles del viaje
          </Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="font-Jakarta text-gray-600">Destino</Text>
              <Text className="font-JakartaMedium text-gray-800">Centro, Medellín</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="font-Jakarta text-gray-600">Distancia</Text>
              <Text className="font-JakartaMedium text-gray-800">15.2 km</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="font-Jakarta text-gray-600">Tarifa</Text>
              <Text className="font-JakartaMedium text-green-600">{matchedDriver.price}</Text>
            </View>
          </View>
        </View>

        {/* Info Message */}
        <View className="bg-blue-50 rounded-xl p-4 w-full max-w-sm mb-8">
          <Text className="font-JakartaBold text-blue-800 mb-2 text-center">
            ℹ️ Información
          </Text>
          <Text className="font-Jakarta text-blue-700 text-sm text-center">
            El conductor tiene 30 segundos para aceptar tu solicitud.
            Si no responde, buscaremos automáticamente otro conductor disponible.
          </Text>
        </View>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={handleCancelRide}
          disabled={isCancelling}
          className="bg-gray-100 rounded-xl px-8 py-4"
          activeOpacity={0.7}
        >
          {isCancelling ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#6B7280" />
              <Text className="font-JakartaMedium text-gray-600 ml-2">
                Cancelando...
              </Text>
            </View>
          ) : (
            <Text className="font-JakartaMedium text-gray-600">
              Cancelar solicitud
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WaitingForAcceptance;
