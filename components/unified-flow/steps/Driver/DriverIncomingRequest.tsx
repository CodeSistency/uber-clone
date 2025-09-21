import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";

import { driverDeliveryService } from "@/app/services/driverDeliveryService";
import { driverErrandService } from "@/app/services/driverErrandService";
import { driverParcelService } from "@/app/services/driverParcelService";
import { driverTransportService } from "@/app/services/driverTransportService";
import { websocketService } from "@/app/services/websocketService";
import CustomButton from "@/components/CustomButton";
import { useUI } from "@/components/UIWrapper";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useRealtimeStore } from "@/store";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";

const COUNTDOWN_SECONDS = 30;

const DriverIncomingRequest: React.FC = () => {
  const { goTo, startWithDriverStep } = useMapFlow();
  const [remaining, setRemaining] = useState<number>(COUNTDOWN_SECONDS);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000) as unknown as number;

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (remaining === 0) {
      // Auto-decline to availability
      startWithDriverStep(FLOW_STEPS.DRIVER_DISPONIBILIDAD);
    }
  }, [remaining]);

  const { showSuccess, showError } = useUI();
  const [processing, setProcessing] = React.useState<
    "accept" | "reject" | null
  >(null);

  const onAccept = async () => {
    if (processing) return;
    setProcessing("accept");
    const active = useRealtimeStore.getState().activeRide as any;
    const svc = (active?.service || "transport").toString().toLowerCase();
    const id = active?.ride_id || active?.orderId || active?.id || 0;

    try {
      if (svc === "transport") await driverTransportService.accept(id);
      else if (svc === "delivery") await driverDeliveryService.accept(id);
      else if (svc === "mandado" || svc === "errand")
        await driverErrandService.accept(id);
      else if (svc === "envio" || svc === "parcel")
        await driverParcelService.accept(id);
      // Join room for realtime updates
      if (id) websocketService.joinRideRoom(id);
      showSuccess("Solicitud aceptada", `Servicio: ${svc}`);
    } catch (e) {
      showError("No se pudo aceptar", "Intenta de nuevo");
    } finally {
      if (svc === "transport")
        goTo(FLOW_STEPS.DRIVER_TRANSPORT.EN_CAMINO_ORIGEN);
      else if (svc === "delivery")
        goTo(FLOW_STEPS.DRIVER_DELIVERY.PREPARAR_PEDIDO);
      else if (svc === "mandado" || svc === "errand")
        goTo(FLOW_STEPS.DRIVER_MANDADO.EN_CAMINO_ORIGEN);
      else if (svc === "envio" || svc === "parcel")
        goTo(FLOW_STEPS.DRIVER_ENVIO.EN_CAMINO_ORIGEN);
      setProcessing(null);
    }
  };

  const onReject = async () => {
    if (processing) return;
    setProcessing("reject");
    try {
      // TODO: notify backend decline if endpoint exists
      showSuccess("Rechazado", "Buscando otro servicio");
      try {
        (useRealtimeStore.getState() as any).setActiveRide(null);
      } catch {}
      startWithDriverStep(FLOW_STEPS.DRIVER_DISPONIBILIDAD);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <View className="flex-1">
      <FlowHeader title="Nueva Solicitud" />
      <View className="p-6">
        <Text className="font-JakartaBold text-lg mb-2">Transporte</Text>
        <Text className="font-Jakarta text-base text-gray-600 mb-1">
          Origen: Av. Principal 123
        </Text>
        <Text className="font-Jakarta text-base text-gray-600 mb-3">
          Destino: Calle Secundaria 456
        </Text>
        <Text className="font-Jakarta text-base text-gray-800 mb-6">
          Precio estimado: $7.80
        </Text>

        <Text className="font-Jakarta text-sm text-gray-500 mb-4">
          Tiempo restante: {remaining}s
        </Text>

        <CustomButton
          title={processing === "accept" ? "Aceptando..." : "Aceptar"}
          loading={processing === "accept"}
          bgVariant="success"
          onPress={onAccept}
          className="w-full mb-3"
        />
        <CustomButton
          title={processing === "reject" ? "Rechazando..." : "Rechazar"}
          loading={processing === "reject"}
          bgVariant="danger"
          onPress={onReject}
          className="w-full"
        />
      </View>
    </View>
  );
};

export default DriverIncomingRequest;
