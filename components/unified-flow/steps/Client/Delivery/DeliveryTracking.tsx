import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { deliveryClient } from "@/app/services/flowClientService";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";

import FlowHeader from "../../../FlowHeader";

const DeliveryTracking: React.FC = () => {
  const { back, orderId } = useMapFlow() as any;
  const { withUI, showSuccess } = useUI();
  const [status, setStatus] = React.useState<
    "preparing" | "searching" | "assigned" | "on_the_way"
  >("preparing");

  React.useEffect(() => {
    const sequence: any[] = [
      "preparing",
      "searching",
      "assigned",
      "on_the_way",
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = Math.min(i + 1, sequence.length - 1);
      setStatus(sequence[i]);
      if (i === sequence.length - 1) clearInterval(interval);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const statusText: Record<typeof status, string> = {
    preparing: "En preparación",
    searching: "Buscando conductor...",
    assigned: "Conductor asignado",
    on_the_way: "En camino",
  } as any;

  return (
    <View className="flex-1">
      <FlowHeader
        title="Seguimiento del pedido"
        subtitle="Te avisaremos cada actualización"
        onBack={back}
      />

      <View className="px-5 mt-4">
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <Text className="font-JakartaMedium text-gray-700">Estado</Text>
          <Text className="font-JakartaBold text-lg text-gray-800 mt-1">
            {statusText[status]}
          </Text>
        </View>
      </View>

      <View className="px-5 pb-4 mt-4">
        <TouchableOpacity
          className="rounded-xl p-4 bg-red-500"
          onPress={async () => {
            const id = orderId || 201;
            await withUI(() => deliveryClient.cancel(id), {
              loadingMessage: "Cancelando pedido...",
            });
            showSuccess("Pedido cancelado", "Tu pedido fue cancelado");
          }}
        >
          <Text className="text-white font-JakartaBold text-center">
            Cancelar pedido
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DeliveryTracking;
