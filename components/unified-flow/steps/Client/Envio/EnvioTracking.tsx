import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { parcelClient } from "@/app/services/flowClientService";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";

import FlowHeader from "../../../FlowHeader";

const EnvioTracking: React.FC = () => {
  const { back, parcelId } = useMapFlow() as any;
  const { withUI, showSuccess } = useUI();
  const [status, setStatus] = React.useState<
    "to_pickup" | "picked" | "to_destination"
  >("to_pickup");

  React.useEffect(() => {
    const sequence: any[] = ["to_pickup", "picked", "to_destination"];
    let i = 0;
    const interval = setInterval(() => {
      i = Math.min(i + 1, sequence.length - 1);
      setStatus(sequence[i]);
      if (i === sequence.length - 1) clearInterval(interval);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const statusText: Record<typeof status, string> = {
    to_pickup: "En camino a recoger",
    picked: "Paquete recogido",
    to_destination: "En ruta al destino",
  } as any;

  const statusColor = () => {
    switch (status) {
      case "to_pickup":
        return "bg-yellow-100 text-yellow-800";
      case "picked":
        return "bg-blue-100 text-blue-800";
      case "to_destination":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <View className="flex-1">
      <FlowHeader
        title="Seguimiento de paquete"
        subtitle="Estado del envío"
        onBack={back}
      />

      <View className="px-5 mt-4">
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <Text className="font-JakartaMedium text-gray-700 mb-2">Estado</Text>
          <View
            className={`self-start px-3 py-1 rounded-full ${statusColor()}`}
          >
            <Text className="font-JakartaBold text-sm">
              {statusText[status]}
            </Text>
          </View>
        </View>
      </View>

      <View className="px-5 pb-4 mt-4">
        <TouchableOpacity
          className="rounded-xl p-4 bg-red-500"
          onPress={async () => {
            const id = parcelId || 401;
            await withUI(() => parcelClient.cancel(id), {
              loadingMessage: "Cancelando envío...",
            });
            showSuccess("Envío cancelado", "Tu envío fue cancelado");
          }}
        >
          <Text className="text-white font-JakartaBold text-center">
            Cancelar envío
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EnvioTracking;
