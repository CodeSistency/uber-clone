import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { transportClient } from "@/app/services/flowClientService";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useRealtimeStore } from "@/store";
import { useDriverStore } from "@/store";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";

import FlowHeader from "../../FlowHeader";

const DriverConfirmation: React.FC = () => {
  const { back, goTo, rideId } = useMapFlow() as any;
  const { withUI } = useUI();
  const { rideStatus } = useRealtimeStore();
  const { drivers, selectedDriver } = useDriverStore();

  const driver = React.useMemo(
    () => drivers.find((d) => d.id === selectedDriver) || null,
    [drivers, selectedDriver],
  );

  return (
    <View className="flex-1">
      <FlowHeader
        title="Conductor en camino"
        subtitle={
          driver
            ? `${driver.first_name} ${driver.last_name} está en camino a tu ubicación`
            : "Buscando conductor..."
        }
        onBack={back}
      />

      <View className="px-5 py-4">
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <Text className="font-JakartaBold text-lg text-gray-800 mb-2">
            Detalles del conductor
          </Text>
          {driver ? (
            <>
              <Text className="font-JakartaMedium text-gray-700">
                Nombre: {driver.first_name} {driver.last_name}
              </Text>
              <Text className="font-Jakarta text-gray-600 mt-1">
                Tipo: {driver.title || "Básico"}
              </Text>
              <Text className="font-Jakarta text-gray-600">
                Asientos: {driver.car_seats}
              </Text>
              <Text className="font-Jakarta text-gray-600">
                ETA: {driver.time ? `${driver.time} min` : "—"}
              </Text>
            </>
          ) : (
            <Text className="font-Jakarta text-gray-600">
              Asignando conductor...
            </Text>
          )}
        </View>
      </View>

      <View className="px-5">
        <View className="bg-gray-50 rounded-xl p-4 mb-2">
          <Text className="font-JakartaMedium text-gray-700">
            Estado del viaje
          </Text>
          <Text className="font-JakartaBold text-gray-800 mt-1">
            {String(rideStatus || "requested").replace(/_/g, " ")}
          </Text>
        </View>
      </View>

      <View className="px-5 mt-2">
        <View className="bg-blue-50 rounded-xl p-4">
          <Text className="font-JakartaMedium text-blue-600">Estado</Text>
          <Text className="font-Jakarta text-blue-700 mt-1">
            El conductor se dirige a tu origen. Te notificaremos cuando llegue.
          </Text>
        </View>
      </View>

      <View className="px-5 pb-4 mt-4">
        <TouchableOpacity
          onPress={async () => {
            const id = rideId || 101;
            await withUI(() => transportClient.join(id), {
              loadingMessage: "Uniéndote al tracking...",
            });
            goTo(FLOW_STEPS.CUSTOMER_TRANSPORT.DURANTE_FINALIZACION);
          }}
          className="rounded-xl p-4 bg-primary-500"
          activeOpacity={0.8}
        >
          <Text className="text-white font-JakartaBold text-center">
            Iniciar viaje
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DriverConfirmation;
