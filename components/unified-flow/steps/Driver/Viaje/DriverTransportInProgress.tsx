import React from "react";
import { View, Text } from "react-native";

import chatService from "@/app/services/chatService";
import { driverTransportService } from "@/app/services/driverTransportService";
import ChatModal from "@/components/ChatModal";
import CustomButton from "@/components/CustomButton";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useMapNavigation } from "@/hooks/useMapNavigation";
import { generateIdempotencyKey } from "@/lib/utils";
import { useRealtimeStore } from "@/store";
import { useChatStore } from "@/store";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";

const DriverTransportInProgress: React.FC = () => {
  const { goTo } = useMapFlow();
  const [chatOpen, setChatOpen] = React.useState(false);
  const chatStore = useChatStore();
  const { startNavigation, distanceText, etaText, currentInstruction } =
    useMapNavigation();

  const handleStart = async () => {
    try {
      const active = useRealtimeStore.getState().activeRide as any;
      const id = active?.ride_id || 0;
      if (id) await driverTransportService.start(id, generateIdempotencyKey());
      const dest = {
        latitude: active?.destination_latitude || 0,
        longitude: active?.destination_longitude || 0,
        address: active?.destination_address || "Destino",
      };
      startNavigation({ destination: dest, rideId: id });
    } catch {}
  };

  const handleEndRide = () => {
    goTo(FLOW_STEPS.DRIVER_TRANSPORT.COMPLETAR_VIAJE);
  };

  React.useEffect(() => {
    const id = (useRealtimeStore.getState().activeRide as any)?.ride_id || 0;
    if (chatOpen && id) {
      chatService.loadMessageHistory(id).finally(() => {
        chatService.setActiveChat(id);
        chatService.markMessagesRead(id);
      });
    }
    return () => {
      if (id) chatService.clearChat(id);
    };
  }, [chatOpen]);

  const mappedMessages = React.useMemo(() => {
    const id = (useRealtimeStore.getState().activeRide as any)?.ride_id || 0;
    const msgs = chatService.getMessagesForRide(id) || [];
    return msgs.map((m: any) => ({
      id: m.id,
      senderId: m.senderId,
      senderName: m.senderType === "driver" ? "Tú" : "Pasajero",
      message: m.message,
      timestamp: new Date(m.timestamp),
      isOwnMessage: m.senderType === "driver",
      messageType: m.messageType || "text",
    }));
  }, [chatStore.messages, chatOpen]);

  return (
    <View className="flex-1">
      <FlowHeader title="Viaje en Curso" />
      <View className="p-6">
        <Text className="font-Jakarta text-base text-gray-600 mb-1">
          Sigue la ruta hacia el destino
        </Text>
        <Text className="font-Jakarta text-sm text-gray-500 mb-3">
          {currentInstruction} • {distanceText} • {etaText}
        </Text>
        <CustomButton
          title="Iniciar seguimiento"
          bgVariant="primary"
          onPress={handleStart}
          className="w-full mb-3"
        />
        <CustomButton
          title="Abrir chat"
          bgVariant="outline"
          onPress={() => setChatOpen(true)}
          className="w-full mb-3"
        />
        <CustomButton
          title="Finalizar viaje"
          bgVariant="danger"
          onPress={handleEndRide}
          className="w-full"
        />
      </View>
      <ChatModal
        visible={chatOpen}
        onClose={() => setChatOpen(false)}
        driverName={"Pasajero"}
        rideId={String(
          (useRealtimeStore.getState().activeRide as any)?.ride_id || "",
        )}
        onSendMessage={(msg) => {
          const id =
            (useRealtimeStore.getState().activeRide as any)?.ride_id || 0;
          if (id) chatService.sendMessage(id, msg);
        }}
        messages={mappedMessages as any}
      />
    </View>
  );
};

export default DriverTransportInProgress;
