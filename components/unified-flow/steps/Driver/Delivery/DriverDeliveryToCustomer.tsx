import React, { useEffect, useMemo, useState } from "react";
import { View, Text } from "react-native";

import chatService from "@/app/services/chatService";
import ChatModal from "@/components/ChatModal";
import CustomButton from "@/components/CustomButton";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useMapNavigation } from "@/hooks/useMapNavigation";
import { useChatStore, useRealtimeStore } from "@/store";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";

const DriverDeliveryToCustomer: React.FC = () => {
  const { goTo } = useMapFlow();
  const [chatOpen, setChatOpen] = useState(false);
  const { startNavigation, distanceText, etaText, currentInstruction } =
    useMapNavigation();
  const { messages: storeMessages, isTyping } = useChatStore();

  const active = useRealtimeStore.getState().activeRide as any;
  const rideId = (active?.orderId ||
    active?.ride_id ||
    active?.id ||
    0) as number;

  const mappedMessages = useMemo(
    () =>
      storeMessages
        .filter((m: any) => m.rideId === rideId)
        .map((m: any) => ({
          id: m.id,
          senderId: m.senderId,
          senderName: m.senderType === "driver" ? "Tú" : "Cliente",
          message: m.message,
          timestamp: new Date(m.timestamp),
          isOwnMessage: m.senderType === "driver",
          messageType: (m.messageType || "text") as "text" | "system",
        })),
    [storeMessages, rideId],
  );

  useEffect(() => {
    if (chatOpen && rideId) {
      chatService.setActiveChat(rideId);
      chatService.loadMessageHistory(rideId).finally(() => {
        chatService.markMessagesRead(rideId);
      });
    }
  }, [chatOpen, rideId]);

  const handleStartNavigation = () => {
    const activeRide = useRealtimeStore.getState().activeRide as any;
    const dest = {
      latitude:
        activeRide?.deliveryLatitude || activeRide?.dropoffLatitude || 0,
      longitude:
        activeRide?.deliveryLongitude || activeRide?.dropoffLongitude || 0,
      address: activeRide?.deliveryAddress || "Cliente",
    };
    startNavigation({ destination: dest, rideId });
  };

  const handleDelivered = () => {
    goTo(FLOW_STEPS.DRIVER_DELIVERY.ENTREGAR_PEDIDO);
  };

  return (
    <View className="flex-1">
      <FlowHeader title="En Camino al Cliente" />
      <View className="p-6">
        <Text className="font-Jakarta text-base text-gray-600 mb-3">
          Ruta hacia el cliente
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
          onPress={() => setChatOpen(true)}
          className="w-full mb-3"
        />
        <CustomButton
          title="He llegado"
          bgVariant="success"
          onPress={handleDelivered}
          className="w-full"
        />
      </View>
      <ChatModal
        visible={chatOpen}
        onClose={() => setChatOpen(false)}
        driverName={"Cliente"}
        rideId={String(rideId || "")}
        onSendMessage={(msg) => {
          if (rideId) chatService.sendMessage(rideId, msg);
        }}
        messages={mappedMessages as any}
        isTyping={isTyping}
      />
    </View>
  );
};

export default DriverDeliveryToCustomer;
