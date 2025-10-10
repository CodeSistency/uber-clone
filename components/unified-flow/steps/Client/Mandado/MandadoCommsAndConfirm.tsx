import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { Button, TextField, Card } from "@/components/ui";
import { errandClient } from "@/app/services/flowClientService";
import ChatModal from "@/components/ChatModal";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import { FLOW_STEPS } from "@/store/mapFlow/constants";

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
        <Card className="bg-white">
          <Text className="font-JakartaMedium text-gray-700">
            Detalles del conductor
          </Text>
          <Text className="font-Jakarta text-gray-600 mt-1">
            (Demo) Datos y estado del conductor asignado.
          </Text>
        </Card>

        <Button
          variant="primary"
          title="Abrir chat"
          onPress={() => setChatOpen(true)}
          className="rounded-xl p-4"
        />

        <Button
          variant="success"
          title="Confirmar mandado"
          onPress={handleConfirm}
          className="rounded-xl p-4"
        />
      </View>

      <ChatModal
        visible={chatOpen}
        onClose={() => setChatOpen(false)}
        driverName="Juan Pérez"
        rideId="demo-ride-123"
        onSendMessage={(message) => {
          console.log('Sending message:', message);
        }}
        messages={[]}
      />

      <View className="px-5 pb-4 mt-2">
        <Button
          variant="danger"
          title="Cancelar mandado"
          onPress={async () => {
            const id = errandId || 301;
            await errandClient.cancel(id);
            showSuccess("Mandado cancelado", "Se canceló tu mandado");
          }}
          className="rounded-xl p-4"
        />
      </View>
    </View>
  );
};

export default MandadoCommsAndConfirm;
