import React, { useState } from "react";
import { View } from "react-native";

import { ratingsService } from "@/app/services/ratingsService";
import RatingSystem from "@/components/RatingSystem";
import { useUI } from "@/components/UIWrapper";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useRealtimeStore } from "@/store";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";

const DriverFinalizationRating: React.FC = () => {
  const { startWithDriverStep } = useMapFlow();
  const { showSuccess, showError } = useUI();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (rating: number, comment: string, tip: number) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const active = useRealtimeStore.getState().activeRide as any;
      const rideId = active?.ride_id || active?.orderId || active?.id;
      if (rideId)
        await ratingsService.rateCustomer({ rideId, rating, comment, tip });
      showSuccess("Gracias", "Tu valoración fue enviada");
      startWithDriverStep(FLOW_STEPS.DRIVER_DISPONIBILIDAD);
    } catch (e) {
      showError("Error", "No se pudo enviar la valoración");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1">
      <FlowHeader title="Califica al Cliente" />
      <RatingSystem
        driverName={"Cliente"}
        vehicleInfo={"Servicio finalizado"}
        onSubmitRating={handleSubmit}
        onSkip={() => startWithDriverStep(FLOW_STEPS.DRIVER_DISPONIBILIDAD)}
        className="absolute bottom-0 left-0 right-0"
      />
    </View>
  );
};

export default DriverFinalizationRating;
