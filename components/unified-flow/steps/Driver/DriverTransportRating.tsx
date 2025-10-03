import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";

import { ratingsService } from "@/app/services/ratingsService";
import RatingSystem from "@/components/RatingSystem";
import { useUI } from "@/components/UIWrapper";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useRealtimeStore } from "@/store";
import { FLOW_STEPS } from "@/lib/unified-flow/constants";

const DriverTransportRating: React.FC = () => {
  const { goTo } = useMapFlow();
  const { showSuccess, showError } = useUI();
  const [submitting, setSubmitting] = useState(false);

  const activeRide = useRealtimeStore.getState().activeRide as any;
  const rideId = activeRide?.ride_id || activeRide?.orderId || activeRide?.id;

  const handleSubmitRating = async (rating: number, comment: string) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      console.log("[DriverTransportRating] Submitting passenger rating:", {
        rideId,
        rating,
        comment,
      });

      if (rideId) {
        // Use the new ratePassenger endpoint
        await ratingsService.ratePassenger({
          rideId: String(rideId),
          rating,
          comment, // tip is not part of the ratePassenger API
        });
      }

      showSuccess(
        "¡Gracias por tu calificación!",
        "Ayudas a mejorar el servicio",
      );

      // Go to earnings summary
      goTo(FLOW_STEPS.DRIVER_TRANSPORT_COMPLETAR_VIAJE);
    } catch (error) {
      console.error(
        "[DriverTransportRating] Error submitting passenger rating:",
        error,
      );
      showError("Error", "No se pudo enviar la calificación");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    console.log("[DriverTransportRating] Skipping rating");
    goTo(FLOW_STEPS.DRIVER_TRANSPORT_COMPLETAR_VIAJE);
  };

  const passengerName = activeRide?.passenger?.name || "el cliente";
  const tripAmount = activeRide?.fare_price || 0;

  return (
    <View className="flex-1">
      <FlowHeader title="Calificar al cliente" />

      <ScrollView className="flex-1 p-6">
        {/* Trip summary */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="font-JakartaBold text-lg mb-2">
            Viaje completado
          </Text>
          <View className="flex-row justify-between mb-1">
            <Text className="font-Jakarta text-gray-600">Cliente</Text>
            <Text className="font-JakartaMedium">{passengerName}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="font-Jakarta text-gray-600">Monto del viaje</Text>
            <Text className="font-JakartaBold text-green-600">
              ${tripAmount.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Rating explanation */}
        <View className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
          <Text className="font-JakartaMedium text-blue-800 mb-2">
            ⭐ ¿Cómo fue tu experiencia?
          </Text>
          <Text className="font-Jakarta text-sm text-blue-700">
            Tu calificación ayuda a mantener altos estándares de calidad y
            asegura que todos los clientes tengan una buena experiencia.
          </Text>
        </View>

        {/* Rating component */}
        <RatingSystem
          driverName={passengerName}
          vehicleInfo="Servicio de transporte"
          onSubmitRating={handleSubmitRating}
          onSkip={handleSkip}
          className="mb-4"
        />

        {/* Benefits explanation */}
        <View className="bg-green-50 p-4 rounded-lg border border-green-200">
          <Text className="font-JakartaMedium text-green-800 mb-2">
            🎯 Beneficios de calificar
          </Text>
          <Text className="font-Jakarta text-xs text-green-700">
            • Ayudas a mejorar la calidad del servicio{"\n"}• Los clientes con
            buenas calificaciones tienen prioridad{"\n"}• Contribuyes a una
            comunidad más segura y confiable
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default DriverTransportRating;
