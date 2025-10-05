import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";

import { Button, TextField, Card } from "@/components/ui";
import { driverMatchingService } from "@/app/services/driverMatchingService";
import { websocketService } from "@/app/services/websocketService";
import { websocketEventManager } from "@/lib/websocketEventManager";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useAutoNavigation } from "@/hooks/useAutoNavigation";
import { useRealtimeStore } from "@/store";

import FlowHeader from "../../../FlowHeader";

const WaitingForAcceptance: React.FC = () => {
  const {
    next,
    back,
    matchedDriver,
    startAcceptanceTimer,
    stopAcceptanceTimer,
    acceptanceTimeout,
    acceptanceStartTime,
    rideId,
  } = useMapFlow() as any;
  const { showError, showSuccess } = useUI();
  const realtime = useRealtimeStore();
  const { navigationState } = useAutoNavigation(); // 🚀 NUEVO: Hook de navegación automática
  const [confirmationResponse, setConfirmationResponse] = useState<any>(null);

  // Estados locales
  const [timeLeft, setTimeLeft] = useState(acceptanceTimeout);
  const [isCancelling, setIsCancelling] = useState(false);

  // 🚀 NUEVO: Estados para feedback en tiempo real
  const [driversContacted, setDriversContacted] = useState(0);
  const [totalDrivers, setTotalDrivers] = useState(5); // Estimado inicial
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected"
  >("connected");

  // Animaciones
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Efecto para iniciar timer de aceptación y confirmar conductor
  useEffect(() => {
    const initializeAcceptance = async () => {
      

      if (!rideId || !matchedDriver) {
        
        showError(
          "Error",
          "Faltan datos necesarios para confirmar el conductor",
        );
        back();
        return;
      }

      try {
        // Confirmar conductor con el backend
        const confirmRequest = {
          driverId: matchedDriver.id,
          notes: "Confirmación automática desde app móvil",
        };

        

        const response = await driverMatchingService.confirmDriver(
          rideId,
          confirmRequest,
        );
        

        setConfirmationResponse(response);
        startAcceptanceTimer();

        showSuccess(
          "Conductor notificado",
          `Esperando respuesta de ${matchedDriver.firstName}`,
        );

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
          ]),
        );
        scaleAnimation.start();

        return () => {
          scaleAnimation.stop();
          stopAcceptanceTimer();
        };
      } catch (error: any) {
        
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
      const elapsed = Math.floor(
        (Date.now() - acceptanceStartTime.getTime()) / 1000,
      );
      const remaining = Math.max(0, acceptanceTimeout - elapsed);

      setTimeLeft(remaining);

      // Timeout alcanzado - conductor no aceptó
      if (remaining === 0) {
        handleTimeout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [acceptanceStartTime, acceptanceTimeout]);

  // 🚀 NUEVO: Escuchar eventos WebSocket en tiempo real usando WebSocketEventManager
  useEffect(() => {
    if (!rideId) return;

    

    // 🚀 NUEVO: Listeners simplificados - navegación automática manejada por useAutoNavigation
    const handleRideAccepted = (data: any) => {
      

      if (data.rideId === rideId) {
        setConnectionStatus("connected");
        // La navegación automática la maneja useAutoNavigation
        // Solo mostrar feedback visual aquí
        showSuccess("¡Conductor aceptado!", "Preparando tu viaje...");
      }
    };

    const handleRideRejected = (data: any) => {
      

      if (data.rideId === rideId) {
        setConnectionStatus("connected");
        setDriversContacted((prev) => prev + 1); // Incrementar contador de conductores contactados
        // La navegación automática la maneja useAutoNavigation
        showError("Conductor no disponible", "Buscando otro conductor...");
      }
    };

    // Listener para estado de conexión WebSocket
    const handleConnectionStatus = (status: any) => {
      setConnectionStatus(
        status.websocketConnected ? "connected" : "disconnected",
      );
    };

    // Suscribirse a los eventos usando WebSocketEventManager
    websocketEventManager.on("ride:accepted", handleRideAccepted);
    websocketEventManager.on("ride:rejected", handleRideRejected);

    // Escuchar estado de conexión (si está disponible en el store)
    const connectionState = useRealtimeStore.getState().connectionStatus;
    setConnectionStatus(
      connectionState.websocketConnected ? "connected" : "disconnected",
    );

    

    return () => {
      // Limpiar listeners
      websocketEventManager.off("ride:accepted", handleRideAccepted);
      websocketEventManager.off("ride:rejected", handleRideRejected);
      
    };
  }, [rideId]);

  // 🚀 NUEVO: Handlers simplificados - navegación automática manejada por useAutoNavigation
  const handleDriverAccepted = (data?: any) => {
    

    stopAcceptanceTimer();

    // Actualizar estado del ride a "accepted"
    useRealtimeStore.getState().updateRideStatus(rideId, "accepted");

    // La navegación automática la maneja useAutoNavigation
    // Solo feedback visual aquí
    showSuccess("¡Conductor aceptado!", "Tu viaje comenzará pronto");
  };

  const handleDriverRejected = (data: any) => {
    

    stopAcceptanceTimer();

    const reason = data.reason || "El conductor no pudo aceptar tu solicitud";
    showError("Conductor no disponible", reason);

    // La navegación automática la maneja useAutoNavigation
    // Solo feedback visual aquí
  };

  const handleTimeout = () => {
    

    stopAcceptanceTimer();

    showError(
      "Conductor no disponible",
      "El conductor no pudo aceptar tu solicitud. Buscaremos otro conductor automáticamente.",
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
      
      stopAcceptanceTimer();

      showSuccess(
        "Solicitud cancelada",
        "Puedes buscar otro conductor o modificar tu pedido",
      );

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
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!matchedDriver) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">
          Error: No hay conductor seleccionado
        </Text>
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

      {/* 🚀 NUEVO: Indicador de conexión y progreso */}
      <View className="bg-white border-b border-gray-100 px-6 py-3">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View
              className={`w-2 h-2 rounded-full mr-2 ${
                connectionStatus === "connected" ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <Text
              className={`text-sm font-JakartaMedium ${
                connectionStatus === "connected"
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {connectionStatus === "connected"
                ? "🟢 Conectado"
                : "🔴 Desconectado"}
            </Text>
          </View>
          <Text className="text-sm text-gray-500 font-Jakarta">
            ⏱️ {formatTime(timeLeft)}
          </Text>
        </View>

        {/* Barra de progreso de conductores contactados */}
        <View className="bg-gray-200 rounded-full h-2 mb-1">
          <View
            className="bg-blue-500 h-2 rounded-full"
            style={{
              width: `${Math.min((driversContacted / totalDrivers) * 100, 100)}%`,
            }}
          />
        </View>
        <Text className="text-xs text-gray-600 font-Jakarta text-center">
          Buscando conductores... {driversContacted}/{totalDrivers}
        </Text>
      </View>

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
              <Text className="font-JakartaMedium text-gray-800">
                Centro, Medellín
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="font-Jakarta text-gray-600">Distancia</Text>
              <Text className="font-JakartaMedium text-gray-800">15.2 km</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="font-Jakarta text-gray-600">Tarifa</Text>
              <Text className="font-JakartaMedium text-green-600">
                {matchedDriver.price}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Message */}
        <View className="bg-blue-50 rounded-xl p-4 w-full max-w-sm mb-8">
          <Text className="font-JakartaBold text-blue-800 mb-2 text-center">
            ℹ️ Información
          </Text>
          <Text className="font-Jakarta text-blue-700 text-sm text-center">
            El conductor tiene 30 segundos para aceptar tu solicitud. Si no
            responde, buscaremos automáticamente otro conductor disponible.
          </Text>
        </View>

        {/* Cancel Button */}
        <Button
          variant="secondary"
          title={isCancelling ? "Cancelando..." : "Cancelar solicitud"}
          onPress={handleCancelRide}
          disabled={isCancelling}
          className="bg-gray-100 rounded-xl px-8 py-4"
          loading={isCancelling}
        />
      </View>
    </View>
  );
};

export default WaitingForAcceptance;
