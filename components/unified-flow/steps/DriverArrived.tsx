import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";

import CustomButton from "@/components/CustomButton";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { websocketService } from "@/app/services/websocketService";
import { useRealtimeStore } from "@/store/realtime/realtime";
import { useUI } from "@/components/UIWrapper";

export interface DriverArrivedProps {
  driverName?: string;
  vehicleInfo?: string;
  rideId?: number;
  onReady: () => void;
  onCallDriver: () => void;
}

const DriverArrived: React.FC<DriverArrivedProps> = ({
  driverName,
  vehicleInfo,
  rideId,
  onReady,
  onCallDriver,
}) => {
  const { back, matchedDriver, rideId: storeRideId } = useMapFlow();
  const connectionStatus = useRealtimeStore((state) => state.connectionStatus);
  const { showSuccess, showError } = useUI();

  // Usar datos reales del store
  const actualRideId = rideId || storeRideId;
  const actualDriverName = matchedDriver?.title || driverName || "Conductor";
  const actualVehicleInfo = matchedDriver?.car_seats
    ? `${matchedDriver.car_seats} asientos`
    : vehicleInfo || "";

  // Estado para confirmación bidireccional
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  // Función para confirmar llegada con WebSocket
  const handleConfirmArrival = async () => {
    if (isConfirming) return;

    setIsConfirming(true);

    try {
      console.log("[DriverArrived] Confirming driver arrival", {
        actualRideId,
      });

      if (actualRideId && connectionStatus.websocketConnected) {
        // Enviar notificación de confirmación vía WebSocket
        websocketService.sendMessage(actualRideId, "passenger_ready");
        setConfirmationSent(true);
        showSuccess("Confirmación enviada", "El conductor ha sido notificado");
      } else {
        console.warn(
          "[DriverArrived] No rideId or not connected, using fallback",
        );
      }

      // Esperar un momento para feedback visual
      setTimeout(() => {
        onReady();
      }, 1000);
    } catch (error) {
      console.error("[DriverArrived] Error confirming arrival:", error);
      showError("Error", "No se pudo confirmar la llegada");

      // Fallback: continuar de todas formas
      setTimeout(() => {
        onReady();
      }, 500);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <View className="flex-1">
      <FlowHeader title="Conductor Llegó" onBack={back} />

      {/* Estado de conexión WebSocket */}
      <View className="px-6 pt-4">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View
              className={`w-2 h-2 rounded-full mr-2 ${connectionStatus.websocketConnected ? "bg-green-500" : "bg-red-500"}`}
            />
            <Text
              className={`text-xs font-JakartaMedium ${connectionStatus.websocketConnected ? "text-green-700" : "text-red-700"}`}
            >
              {connectionStatus.websocketConnected
                ? "Conectado"
                : "Desconectado"}
            </Text>
          </View>
          {confirmationSent && (
            <View className="flex-row items-center">
              <Text className="text-xs text-green-700 font-JakartaMedium mr-1">
                ✓ Confirmado
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-6xl mb-6">🚗</Text>

        <Text className="font-JakartaBold text-xl text-gray-800 mb-2 text-center">
          ¡Tu conductor llegó!
        </Text>

        <Text className="font-Jakarta text-gray-600 text-center mb-4">
          {actualDriverName} te está esperando
          {actualVehicleInfo ? ` con ${actualVehicleInfo}` : ""}
        </Text>

        {/* Información adicional sobre confirmación */}
        {confirmationSent && (
          <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 w-full">
            <Text className="font-Jakarta text-green-800 text-sm text-center">
              ✅ Confirmación enviada al conductor
            </Text>
          </View>
        )}

        {!connectionStatus.websocketConnected && (
          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 w-full">
            <Text className="font-Jakarta text-yellow-800 text-sm text-center">
              ⚠️ Sin conexión. El conductor puede no recibir notificaciones.
            </Text>
          </View>
        )}

        <View className="w-full">
          <CustomButton
            title={
              isConfirming
                ? "Confirmando..."
                : confirmationSent
                  ? "✓ Confirmado"
                  : "Estoy listo"
            }
            bgVariant={confirmationSent ? "success" : "success"}
            onPress={handleConfirmArrival}
            className="w-full mb-3"
            loading={isConfirming}
          />

          <CustomButton
            title="Llamar conductor"
            bgVariant="outline"
            onPress={onCallDriver}
            className="w-full"
          />
        </View>
      </View>
    </View>
  );
};

export default DriverArrived;
