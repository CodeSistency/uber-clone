import React, { useEffect, useMemo, useState } from "react";
import { View, Text } from "react-native";

import chatService from "@/app/services/chatService";
import ChatModal from "@/components/ChatModal";
import CustomButton from "@/components/CustomButton";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useMapNavigation } from "@/hooks/useMapNavigation";
import { useChatStore, useRealtimeStore } from "@/store";
import { FLOW_STEPS } from "@/lib/unified-flow/constants";

const DriverMandadoNavigateToOriginChat: React.FC = () => {
  const { goTo } = useMapFlow();
  const [chatOpen, setChatOpen] = useState(false);
  const { startNavigation, distanceText, etaText, currentInstruction } =
    useMapNavigation();
  const { messages: storeMessages, isTyping } = useChatStore();
  const active = useRealtimeStore.getState().activeRide as any;
  const rideId = (active?.id ||
    active?.ride_id ||
    active?.orderId ||
    0) as number;

  // Map store messages to ChatModal format
  const mappedMessages = storeMessages
    .filter((m: any) => m.rideId === rideId)
    .map((m: any) => ({
      id: m.id,
      senderId: m.senderId,
      senderName: m.senderType === "driver" ? "Tú" : "Cliente",
      message: m.message,
      timestamp: new Date(m.timestamp),
      isOwnMessage: m.senderType === "driver",
      messageType: (m.messageType || "text") as "text" | "system",
    }));

  const handleStartNavigation = () => {
    const dest = {
      latitude: active?.origin_latitude || active?.pickupLatitude || 0,
      longitude: active?.origin_longitude || active?.pickupLongitude || 0,
      address: active?.origin_address || "Punto de recogida",
    };
    startNavigation({ destination: dest, rideId });
  };

  const handleOpenChat = () => setChatOpen(true);
  const handleCloseChat = () => setChatOpen(false);

  useEffect(() => {
    if (chatOpen && rideId) {
      chatService.setActiveChat(rideId);
      chatService.loadMessageHistory(rideId).finally(() => {
        chatService.markMessagesRead(rideId);
      });
    }
  }, [chatOpen, rideId]);

  const handleSendMessage = (message: string) => {
    if (rideId) chatService.sendMessage(rideId, message);
  };

  const handleArrived = () => {
    goTo(FLOW_STEPS.DRIVER_MANDADO_RECOGER_PRODUCTOS);
  };

  return (
    <View className="flex-1">
      <FlowHeader title="Ir al Origen (Mandado)" />
      <View className="p-6">
        <Text className="font-Jakarta text-base text-gray-600 mb-3">
          Ruta hacia el punto de recogida. Puedes chatear con el cliente.
        </Text>
        <Text className="font-Jakarta text-sm text-gray-500 mb-2">
          {currentInstruction} • {distanceText} • {etaText}
        </Text>
        <CustomButton
          title="Iniciar navegación"
          bgVariant="primary"
          onPress={handleStartNavigation}
          className="w-full mb-3"
        />
        <CustomButton
          title="Abrir chat"
          bgVariant="outline"
          onPress={handleOpenChat}
          className="w-full mb-3"
        />
        <CustomButton
          title="Estoy en el punto de recogida"
          bgVariant="success"
          onPress={handleArrived}
          className="w-full"
        />
      </View>

      <ChatModal
        visible={chatOpen}
        onClose={handleCloseChat}
        driverName={"Cliente"}
        rideId={String(rideId)}
        onSendMessage={handleSendMessage}
        messages={mappedMessages as any}
        isTyping={isTyping}
      />
    </View>
  );
};

export default DriverMandadoNavigateToOriginChat;
