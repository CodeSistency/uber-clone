import React, { useEffect, useState } from "react";
import { View, Text, Alert, ScrollView } from "react-native";

import chatService from "@/app/services/chatService";
import { driverLocationService } from "@/app/services/driverLocationService";
import { driverTransportService } from "@/app/services/driverTransportService";
import ChatModal from "@/components/ChatModal";
import { Button, Card } from "@/components/ui";
import { useUI } from "@/components/UIWrapper";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useMapNavigation } from "@/hooks/useMapNavigation";
import { generateIdempotencyKey } from "@/lib/utils";
import { useRealtimeStore, useChatStore } from "@/store";
import { FLOW_STEPS } from "@/lib/unified-flow/constants";

const DriverTransportInProgress: React.FC = () => {
  const { goTo } = useMapFlow();
  const { showSuccess, showError } = useUI();
  const chatStore = useChatStore();
  const [chatOpen, setChatOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  const {
    startNavigation,
    distanceText,
    etaText,
    currentInstruction,
    isNavigating,
  } = useMapNavigation();

  const activeRide = useRealtimeStore.getState().activeRide as any;
  const rideId =
    activeRide?.ride_id || activeRide?.orderId || activeRide?.id || 0;

  // Auto-start ride when component mounts
  useEffect(() => {
    const autoStartRide = async () => {
      if (!rideId || started) return;

      try {
        console.log("[DriverTransportInProgress] Auto-starting ride:", rideId);

        // Start ride in backend
        await driverTransportService.start(rideId, generateIdempotencyKey());

        // Start GPS tracking
        await driverLocationService.startTracking(rideId);
        setIsTracking(true);

        // Start navigation to destination
        const dest = {
          latitude: activeRide?.destination_latitude || 0,
          longitude: activeRide?.destination_longitude || 0,
          address: activeRide?.destination_address || "Destino del cliente",
        };

        if (dest.latitude && dest.longitude) {
          startNavigation({ destination: dest, rideId });
        }

        setStarted(true);
        showSuccess("Viaje iniciado", "GPS activado y navegación comenzada");
      } catch (error) {
        console.error(
          "[DriverTransportInProgress] Error auto-starting ride:",
          error,
        );
        showError("Error", "No se pudo iniciar el viaje automáticamente");
      }
    };

    autoStartRide();
  }, [rideId, started]);

  const handleReportIssue = () => {
    const issues = [
      { key: "traffic_jam", label: "Tráfico intenso", severity: "medium" },
      { key: "accident", label: "Accidente en la ruta", severity: "high" },
      {
        key: "vehicle_issue",
        label: "Problema con el vehículo",
        severity: "critical",
      },
      {
        key: "passenger_issue",
        label: "Problema con el pasajero",
        severity: "medium",
      },
      { key: "other", label: "Otro problema", severity: "low" },
    ];

    Alert.alert(
      "Reportar Problema",
      "Selecciona el tipo de problema:",
      issues
        .map((issue) => ({
          text: issue.label,
          onPress: () => reportIssue(issue.key as any, issue.severity as any),
        }))
        .concat([
          {
            text: "Cancelar",
            onPress: () => Promise.resolve(),
          },
        ]),
    );
  };

  const reportIssue = async (
    type: string,
    severity: "low" | "medium" | "high" | "critical",
  ) => {
    if (!rideId) return;

    try {
      await driverTransportService.reportIssue(rideId, {
        type: type as any,
        description: `Problema reportado durante el viaje: ${type}`,
        severity,
        location: driverLocationService.getTrackingStatus().lastLocation?.coords
          ? {
              lat: driverLocationService.getTrackingStatus().lastLocation!
                .coords.latitude,
              lng: driverLocationService.getTrackingStatus().lastLocation!
                .coords.longitude,
            }
          : undefined,
      });

      showSuccess(
        "Problema reportado",
        "El equipo de soporte ha sido notificado",
      );
    } catch (error) {
      console.error(
        "[DriverTransportInProgress] Error reporting issue:",
        error,
      );
      showError("Error", "No se pudo reportar el problema");
    }
  };

  const handleEndRide = () => {
    goTo(FLOW_STEPS.DRIVER_TRANSPORT_COMPLETAR_VIAJE);
  };

  // Chat management
  useEffect(() => {
    if (chatOpen && rideId) {
      chatService.loadMessageHistory(rideId).finally(() => {
        chatService.setActiveChat(rideId);
        chatService.markMessagesRead(rideId);
      });
    }
    return () => {
      if (rideId) chatService.clearChat(rideId);
    };
  }, [chatOpen, rideId]);

  const mappedMessages = React.useMemo(() => {
    if (!rideId) return [];
    const msgs = chatService.getMessagesForRide(rideId) || [];
    return msgs.map((m: any) => ({
      id: m.id,
      senderId: m.senderId,
      senderName: m.senderType === "driver" ? "Tú" : "Pasajero",
      message: m.message,
      timestamp: new Date(m.timestamp),
      isOwnMessage: m.senderType === "driver",
      messageType: m.messageType || "text",
    }));
  }, [chatStore.messages, chatOpen, rideId]);

  const handleSendMessage = async (message: string) => {
    if (!rideId || !message.trim()) return;

    try {
      await driverTransportService.sendMessage(rideId, message);
      // Message will be received via WebSocket and added to chat
    } catch (error) {
      console.error(
        "[DriverTransportInProgress] Error sending message:",
        error,
      );
      showError("Error", "No se pudo enviar el mensaje");
    }
  };

  return (
    <View className="flex-1">
      <FlowHeader title="Viaje en curso" />

      <ScrollView className="flex-1 p-6">
        {/* Estado del viaje */}
        <View className="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
          <Text className="font-JakartaBold text-green-800 mb-1">
            ✅ Viaje activo
          </Text>
          <Text className="font-Jakarta text-sm text-green-700">
            GPS: {isTracking ? "Activo" : "Iniciando..."} • Navegación:{" "}
            {isNavigating ? "Activa" : "Iniciando..."}
          </Text>
        </View>

        {/* Información del pasajero y destino */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="font-JakartaBold text-lg mb-2">Destino</Text>
          <Text className="font-Jakarta text-base text-gray-600 mb-3">
            {activeRide?.destination_address || "Destino del pasajero"}
          </Text>

          <View className="flex-row justify-between">
            <View>
              <Text className="font-Jakarta text-sm text-gray-500">
                Pasajero
              </Text>
              <Text className="font-JakartaMedium text-base">
                {activeRide?.passenger?.name || "Pasajero"}
              </Text>
            </View>
            <View>
              <Text className="font-Jakarta text-sm text-gray-500">Tarifa</Text>
              <Text className="font-JakartaBold text-lg text-green-600">
                ${activeRide?.fare_price || "0.00"}
              </Text>
            </View>
          </View>
        </View>

        {/* Información de navegación */}
        {isNavigating && (
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <Text className="font-JakartaBold text-gray-800 mb-2">
              Navegación activa
            </Text>
            <Text className="font-Jakarta text-base text-gray-600 mb-1">
              {currentInstruction}
            </Text>
            <Text className="font-Jakarta text-sm text-gray-500">
              📏 {distanceText} • ⏱️ {etaText}
            </Text>
          </View>
        )}

        {/* Acciones principales */}
        <View className="space-y-3 mb-4">
          <View className="flex-row space-x-2">
            <Button
              variant="outline"
              title="💬 Chat"
              onPress={() => setChatOpen(true)}
              className="flex-1"
            />
            <Button
              variant="danger"
              title="🚨 Reportar"
              onPress={handleReportIssue}
              className="flex-1"
            />
          </View>

          <Button
            variant="success"
            title="🏁 Finalizar viaje"
            onPress={handleEndRide}
            className="w-full"
          />
        </View>

        {/* Información de seguridad */}
        <Card className="bg-blue-50 border-blue-200">
          <Text className="font-JakartaMedium text-sm text-blue-800 mb-2">
            🚨 Recordatorios de seguridad
          </Text>
          <Text className="font-Jakarta text-xs text-blue-700">
            • Mantén la distancia segura con otros vehículos{"\n"}• No uses el
            teléfono mientras conduces{"\n"}• El pasajero puede rastrear tu
            ubicación en tiempo real
          </Text>
        </Card>
      </ScrollView>

      {/* Modal de chat */}
      <ChatModal
        visible={chatOpen}
        onClose={() => setChatOpen(false)}
        driverName={activeRide?.passenger?.name || "Pasajero"}
        rideId={String(rideId)}
        onSendMessage={handleSendMessage}
        messages={mappedMessages as any}
      />
    </View>
  );
};

export default DriverTransportInProgress;
