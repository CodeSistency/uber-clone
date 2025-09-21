import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { errandClient } from "@/app/services/flowClientService";
import ChatModal from "@/components/ChatModal";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";

import FlowHeader from "../../../FlowHeader";

const MandadoCommsAndConfirm: React.FC = () => {
  const { back, goTo, errandId } = useMapFlow() as any;
  const [chatOpen, setChatOpen] = React.useState(false);
  const { showSuccess } = useUI();

  const handleConfirm = () => {
    showSuccess("Mandado confirmado", "El conductor irá por los productos");
    goTo(FLOW_STEPS.CUSTOMER_MANDADO.FINALIZACION);
  };

  return (
    <View className="flex-1">
      <FlowHeader
        title="Comunicación y confirmación"
        subtitle="Alinea detalles con el conductor"
        onBack={back}
      />

      <View className="px-5 mt-4 space-y-3">
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <Text className="font-JakartaMedium text-gray-700">
            Detalles del conductor
          </Text>
          <Text className="font-Jakarta text-gray-600 mt-1">
            (Demo) Datos y estado del conductor asignado.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setChatOpen(true)}
          className="bg-primary-500 rounded-xl p-4"
        >
          <Text className="text-white font-JakartaBold text-center">
            Abrir chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleConfirm}
          className="bg-green-500 rounded-xl p-4"
        >
          <Text className="text-white font-JakartaBold text-center">
            Confirmar mandado
          </Text>
        </TouchableOpacity>
      </View>

      <ChatModal
        visible={chatOpen}
        onClose={() => setChatOpen(false)}
        driverName="Juan Pérez"
        rideId="demo-ride-123"
        onSendMessage={(message) => console.log("Message sent:", message)}
        messages={[]}
      />

      <View className="px-5 pb-4 mt-2">
        <TouchableOpacity
          className="rounded-xl p-4 bg-red-500"
          onPress={async () => {
            const id = errandId || 301;
            await errandClient.cancel(id);
            showSuccess("Mandado cancelado", "Se canceló tu mandado");
          }}
        >
          <Text className="text-white font-JakartaBold text-center">
            Cancelar mandado
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MandadoCommsAndConfirm;
