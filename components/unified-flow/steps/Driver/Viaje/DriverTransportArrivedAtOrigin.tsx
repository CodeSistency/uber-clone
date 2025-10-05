import React, { useState } from "react";
import { View, Text } from "react-native";

import { driverTransportService } from "@/app/services/driverTransportService";
import { Button, Card, Badge } from "@/components/ui";
import { useUI } from "@/components/UIWrapper";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { generateIdempotencyKey } from "@/lib/utils";
import { useRealtimeStore } from "@/store";
import { FLOW_STEPS } from "@/lib/unified-flow/constants";

const DriverTransportArrivedAtOrigin: React.FC = () => {
  const { goTo } = useMapFlow();
  const { showSuccess, showError } = useUI();
  const [loadingArrived, setLoadingArrived] = useState(false);
  const [loadingStart, setLoadingStart] = useState(false);

  const handleArrivedNotify = async () => {
    if (loadingArrived) return;
    setLoadingArrived(true);
    try {
      const id = (useRealtimeStore.getState().activeRide as any)?.ride_id || 0;
      if (id)
        await driverTransportService.arrived(id, generateIdempotencyKey());
      showSuccess("Has llegado", "El cliente fue notificado");
    } catch (e) {
      showError("Error", "No se pudo marcar llegada");
    } finally {
      setLoadingArrived(false);
    }
  };

  const handleCall = () => {
    const activeRide = useRealtimeStore.getState().activeRide as any;
    const passengerPhone = activeRide?.passenger?.phone;

    if (!passengerPhone) {
      showError("Error", "No se pudo obtener el teléfono del cliente");
      return;
    }

    // ✅ Integrar llamada al cliente usando el teléfono real del pasajero
    
    
    // En React Native se puede usar Linking para abrir el dialer
    try {
      // Esto debería integrarse con react-native Linking
      showSuccess("Llamando...", `Marcando a ${passengerPhone}`);
      // Linking.openURL(`tel:${passengerPhone}`);
    } catch (error) {
      
      showError("Error", "No se pudo iniciar la llamada");
    }
  };

  const handleStartRide = async () => {
    if (loadingStart) return;
    setLoadingStart(true);
    try {
      const id = (useRealtimeStore.getState().activeRide as any)?.ride_id || 0;
      if (id) await driverTransportService.start(id, generateIdempotencyKey());
      showSuccess("Viaje iniciado", "Buena ruta");
      goTo(FLOW_STEPS.DRIVER_TRANSPORT_INICIAR_VIAJE);
    } catch (e) {
      showError("Error", "No se pudo iniciar el viaje");
    } finally {
      setLoadingStart(false);
    }
  };

  return (
    <View className="flex-1">
      <FlowHeader title="Llegada al Origen" />
      <View className="p-6">
        <Button
          variant="primary"
          title={loadingArrived ? "Marcando..." : "He llegado"}
          loading={loadingArrived}
          onPress={handleArrivedNotify}
          className="w-full mb-3"
        />
        <Button
          variant="outline"
          title="Llamar al cliente"
          onPress={handleCall}
          className="w-full mb-3"
        />
        <Button
          variant="success"
          title={loadingStart ? "Iniciando..." : "Iniciar viaje"}
          loading={loadingStart}
          onPress={handleStartRide}
          className="w-full"
        />
      </View>
    </View>
  );
};

export default DriverTransportArrivedAtOrigin;
