import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  ActivityIndicator,
} from "react-native";

import {
  driverMatchingService,
  MatchingRequest,
} from "@/app/services/driverMatchingService";
import { Button, Card, Badge } from "@/components/ui";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useRealtimeStore, useLocationStore } from "@/store";

import FlowHeader from "../../../FlowHeader";

const DriverMatching: React.FC = () => {
  const {
    next,
    back,
    startMatching,
    stopMatching,
    setMatchedDriver,
    rideId,
    isMatching,
    matchingTimeout,
    matchingStartTime,
    confirmedOrigin,
    selectedTierId,
    selectedVehicleTypeId,
  } = useMapFlow() as any;
  const { showError, showSuccess } = useUI();
  const realtime = useRealtimeStore();
  const locationStore = useLocationStore();

  // Estados locales
  const [timeLeft, setTimeLeft] = useState(matchingTimeout);
  const [dots, setDots] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Animaciones
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Efecto para iniciar matching cuando se monta el componente
  useEffect(() => {
    const startDriverMatching = async () => {
      console.log("[DriverMatching] Starting driver matching...");

      // Validar que tenemos los datos necesarios
      if (
        !selectedTierId ||
        !locationStore.userLatitude ||
        !locationStore.userLongitude
      ) {
        console.error("[DriverMatching] Missing required data for matching");
        showError("Error", "Faltan datos necesarios para buscar conductores");
        back();
        return;
      }

      startMatching();

      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseAnimation.start();

      // Hacer la llamada real al backend
      try {
        const matchingRequest: MatchingRequest = {
          lat: locationStore.userLatitude,
          lng: locationStore.userLongitude,
          tierId: selectedTierId,
          vehicleTypeId: selectedVehicleTypeId || 1,
          radiusKm: 5,
        };

        console.log(
          "[DriverMatching] Making backend call with request:",
          matchingRequest,
        );

        const response =
          await driverMatchingService.findBestDriver(matchingRequest);

        if (response.success && response.driver) {
          console.log("[DriverMatching] Driver found:", response.driver);
          handleDriverFound(response.driver);
        } else {
          console.log("[DriverMatching] No driver found:", response.message);
          handleNoDriversAvailable();
        }
      } catch (error: any) {
        console.error("[DriverMatching] Error during matching:", error);
        if (error.statusCode === 404) {
          handleNoDriversAvailable();
        } else {
          showError("Error", error.message || "Error al buscar conductores");
          back();
        }
      }

      return () => {
        pulseAnimation.stop();
        stopMatching();
      };
    };

    startDriverMatching();
  }, [selectedTierId, selectedVehicleTypeId]);

  // Efecto para countdown del timer
  useEffect(() => {
    if (!isMatching || !matchingStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - matchingStartTime.getTime()) / 1000,
      );
      const remaining = Math.max(0, matchingTimeout - elapsed);

      setTimeLeft(remaining);

      // Timeout alcanzado - buscar otro conductor automáticamente
      if (remaining === 0) {
        handleTimeout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isMatching, matchingStartTime, matchingTimeout]);

  // Efecto para animación de dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleDriverFound = (driver: any) => {
    console.log("[DriverMatching] Driver found:", driver);

    setMatchedDriver(driver);
    stopMatching();

    showSuccess(
      "¡Conductor encontrado!",
      `${driver.firstName} está disponible`,
    );

    // Avanzar al siguiente paso
    setTimeout(() => {
      next();
    }, 1500);
  };

  const handleNoDriversAvailable = () => {
    console.log("[DriverMatching] No drivers available");

    stopMatching();

    showError(
      "Sin conductores disponibles",
      "No hay conductores disponibles en este momento. ¿Quieres intentar con diferentes opciones?",
    );

    // Retroceder para que el usuario pueda cambiar opciones
    setTimeout(() => {
      back();
    }, 3000);
  };

  const handleTimeout = () => {
    console.log("[DriverMatching] Matching timeout reached");

    stopMatching();

    showError(
      "Sin conductores disponibles",
      "No se encontraron conductores disponibles en este momento. ¿Quieres intentar nuevamente?",
    );

    // Retroceder o mostrar opciones
    setTimeout(() => {
      back();
    }, 2000);
  };

  const handleCancelMatching = async () => {
    if (isCancelling) return;

    setIsCancelling(true);

    try {
      console.log("[DriverMatching] Cancelling matching...");
      stopMatching();

      showSuccess(
        "Búsqueda cancelada",
        "Puedes modificar tu pedido o intentar nuevamente",
      );

      // Retroceder al paso anterior
      back();
    } catch (error) {
      showError("Error", "No se pudo cancelar la búsqueda");
    } finally {
      setIsCancelling(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View className="flex-1">
      <FlowHeader
        title="Buscando conductor"
        subtitle="Estamos encontrando el mejor conductor para ti"
        onBack={handleCancelMatching}
      />

      <View className="flex-1 justify-center items-center px-6">
        {/* Animated Search Icon */}
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
            opacity: fadeAnim,
          }}
          className="mb-8"
        >
          <View className="w-32 h-32 bg-primary-100 rounded-full items-center justify-center">
            <View className="w-24 h-24 bg-primary-500 rounded-full items-center justify-center">
              <Text className="text-4xl">🔍</Text>
            </View>
          </View>
        </Animated.View>

        {/* Status Text */}
        <Animated.Text
          style={{ opacity: fadeAnim }}
          className="text-2xl font-JakartaBold text-gray-800 text-center mb-4"
        >
          Buscando conductor{dots}
        </Animated.Text>

        {/* Progress Info */}
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="bg-gray-50 rounded-xl p-6 w-full max-w-sm mb-8"
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text className="font-JakartaMedium text-gray-600">
              Tiempo restante
            </Text>
            <Text className="font-JakartaBold text-primary-600 text-lg">
              {formatTime(timeLeft)}
            </Text>
          </View>

          <View className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <View
              className="bg-primary-500 h-2 rounded-full"
              style={{
                width: `${((matchingTimeout - timeLeft) / matchingTimeout) * 100}%`,
              }}
            />
          </View>

          <Text className="font-Jakarta text-sm text-gray-500 text-center">
            Buscando conductores disponibles en tu área
          </Text>
        </Animated.View>

        {/* Tips */}
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="bg-blue-50 rounded-xl p-4 w-full max-w-sm mb-8"
        >
          <Text className="font-JakartaBold text-blue-800 mb-2">
            💡 Consejos
          </Text>
          <Text className="font-Jakarta text-blue-700 text-sm">
            • Más conductores estarán disponibles pronto{"\n"}• Puedes cancelar
            y modificar tu pedido{"\n"}• Te notificaremos cuando encontremos uno
          </Text>
        </Animated.View>

        {/* Cancel Button */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Button
            variant="secondary"
            title={isCancelling ? "Cancelando..." : "Cancelar búsqueda"}
            onPress={handleCancelMatching}
            disabled={isCancelling}
            className="rounded-xl px-8 py-4"
            loading={isCancelling}
          />
        </Animated.View>
      </View>
    </View>
  );
};

export default DriverMatching;
