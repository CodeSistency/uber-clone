import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";

import {
  driverTransportService,
  PendingRequest,
} from "@/app/services/driverTransportService";
import { websocketService } from "@/app/services/websocketService";
import { Button, Card, Badge } from "@/components/ui";
import { useUI } from "@/components/UIWrapper";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useRealtimeStore } from "@/store";
import { useDriverStateStore } from "@/store/driverState/driverState";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";

const DriverIncomingRequest: React.FC = () => {
  const { goTo, startWithDriverStep } = useMapFlow();
  const { showSuccess, showError } = useUI();
  const driverState = useDriverStateStore();
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadPendingRequests = async () => {
      try {
        console.log("[DriverIncomingRequest] Loading pending requests...");
        const response = await driverTransportService.getPendingRequests(
          driverState.currentLocation?.lat || 0,
          driverState.currentLocation?.lng || 0,
        );
        const requests = response?.data || [];

        if (requests.length > 0) {
          setPendingRequests(requests);
          console.log(
            "[DriverIncomingRequest] Pending requests loaded:",
            requests.length,
          );
        } else {
          console.log("[DriverIncomingRequest] No pending requests found");
          // If no requests, go back to availability after a short delay
          setTimeout(() => {
            startWithDriverStep(FLOW_STEPS.DRIVER_DISPONIBILIDAD);
          }, 2000);
        }
      } catch (error) {
        console.error(
          "[DriverIncomingRequest] Error loading pending requests:",
          error,
        );
        showError("Error", "No se pudieron cargar las solicitudes pendientes");
        setTimeout(() => {
          startWithDriverStep(FLOW_STEPS.DRIVER_DISPONIBILIDAD);
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    loadPendingRequests();

    // Refresh requests every 10 seconds
    intervalRef.current = setInterval(loadPendingRequests, 10000) as any;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleAccept = async (request: PendingRequest) => {
    if (processing) return;
    setProcessing(`accept-${request.rideId}`);

    try {
      console.log("[DriverIncomingRequest] Accepting request:", request.rideId);

      // Calculate estimated arrival time (simplified)
      const estimatedArrivalMinutes = 5;

      await driverTransportService.respondToRequest(
        request.rideId,
        "accept",
        estimatedArrivalMinutes,
      );

      // Join room for realtime updates
      websocketService.joinRideRoom(request.rideId);

      // Store the active ride in realtime store
      useRealtimeStore.getState().setActiveRide({
        ride_id: request.rideId,
        service: "transport",
        status: "accepted",
        passenger: request.passenger,
        originAddress: request.originAddress,
        destinationAddress: request.destinationAddress,
        farePrice: request.farePrice,
        tier: request.tier,
        pickupLocation: request.pickupLocation,
      } as any);

      showSuccess("¡Solicitud aceptada!", "Dirígete al punto de recogida");
      goTo(FLOW_STEPS.DRIVER_TRANSPORT.EN_CAMINO_ORIGEN);
    } catch (error) {
      console.error("[DriverIncomingRequest] Error accepting request:", error);
      showError("Error", "No se pudo aceptar la solicitud. Intenta de nuevo.");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (request: PendingRequest, reason?: string) => {
    if (processing) return;
    setProcessing(`reject-${request.rideId}`);

    try {
      console.log("[DriverIncomingRequest] Rejecting request:", request.rideId);

      if (reason) {
        await driverTransportService.rejectRequest(request.rideId, reason);
      } else {
        await driverTransportService.respondToRequest(request.rideId, "reject");
      }

      showSuccess("Solicitud rechazada", "Buscando otras oportunidades");
      // Remove the rejected request from the list
      setPendingRequests((prev) =>
        prev.filter((r) => r.rideId !== request.rideId),
      );
    } catch (error) {
      console.error("[DriverIncomingRequest] Error rejecting request:", error);
      showError("Error", "No se pudo rechazar la solicitud");
    } finally {
      setProcessing(null);
    }
  };

  const showRejectDialog = (request: PendingRequest) => {
    const reasons = [
      "Estoy muy lejos del punto de recogida",
      "Estoy ocupado con otro pasajero",
      "Problemas técnicos con la app",
      "No puedo atender este tipo de servicio",
      "Otro motivo",
    ];

    Alert.alert(
      "Motivo del rechazo",
      "Selecciona el motivo por el cual rechazas este viaje:",
      reasons
        .map((reason) => ({
          text: reason,
          onPress: () => handleReject(request, reason),
        }))
        .concat([
          {
            text: "Cancelar",
            onPress: () => Promise.resolve(),
          },
        ]),
    );
  };

  if (loading) {
    return (
      <View className="flex-1">
        <FlowHeader title="Buscando solicitudes..." />
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-4xl mb-4">🔍</Text>
          <Text className="font-JakartaMedium text-lg text-gray-600 text-center">
            Buscando solicitudes de viaje disponibles
          </Text>
        </View>
      </View>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <View className="flex-1">
        <FlowHeader title="Sin solicitudes disponibles" />
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-4xl mb-4">📭</Text>
          <Text className="font-JakartaMedium text-lg text-gray-600 text-center">
            No hay solicitudes pendientes en este momento
          </Text>
          <Text className="font-Jakarta text-sm text-gray-500 text-center mt-2">
            Las solicitudes aparecerán automáticamente cuando estén disponibles
          </Text>
        </View>
      </View>
    );
  }

  const renderRequestCard = (request: PendingRequest) => {
    const isProcessing =
      processing === `accept-${request.rideId}` ||
      processing === `reject-${request.rideId}`;

    return (
      <Card
        key={request.rideId}
        className="mb-4"
      >
        {/* Header with service type and rating */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-JakartaBold text-lg">{request.tier.name}</Text>
          <View className="flex-row items-center">
            <Text className="text-yellow-500 mr-1">★</Text>
            <Text className="font-Jakarta text-sm text-gray-600">
              {request.passenger.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Passenger Info */}
        <Card className="bg-gray-50 mb-3">
          <Text className="font-JakartaBold text-gray-800 mb-1">
            {request.passenger.name}
          </Text>
          <Text className="font-Jakarta text-sm text-gray-600">
            📞 {request.passenger.phone}
          </Text>
        </Card>

        {/* Route Info */}
        <View className="mb-3">
          <View className="flex-row items-start mb-2">
            <Text className="text-green-500 mr-2 mt-1">●</Text>
            <View className="flex-1">
              <Text className="font-Jakarta text-sm text-gray-500 mb-1">
                Origen
              </Text>
              <Text className="font-Jakarta text-base text-gray-800">
                {request.originAddress}
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <Text className="text-red-500 mr-2 mt-1">■</Text>
            <View className="flex-1">
              <Text className="font-Jakarta text-sm text-gray-500 mb-1">
                Destino
              </Text>
              <Text className="font-Jakarta text-base text-gray-800">
                {request.destinationAddress}
              </Text>
            </View>
          </View>
        </View>

        {/* Trip Details */}
        <View className="bg-gray-50 rounded-lg p-3 mb-4">
          <View className="flex-row justify-between mb-1">
            <Text className="font-Jakarta text-sm text-gray-600">
              Distancia
            </Text>
            <Text className="font-JakartaBold text-sm text-gray-800">
              {request.estimatedDistance.toFixed(1)} km
            </Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="font-Jakarta text-sm text-gray-600">Duración</Text>
            <Text className="font-JakartaBold text-sm text-gray-800">
              {request.duration} min
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="font-Jakarta text-sm text-gray-600">Tarifa</Text>
            <Text className="font-JakartaBold text-green-600">
              ${request.farePrice.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row space-x-2">
          <Button
            variant="success"
            title={
              processing === `accept-${request.rideId}`
                ? "Aceptando..."
                : "✅ Aceptar"
            }
            loading={processing === `accept-${request.rideId}`}
            onPress={() => handleAccept(request)}
            className="flex-1"
            disabled={isProcessing}
          />
          <Button
            variant="danger"
            title={
              processing === `reject-${request.rideId}`
                ? "Rechazando..."
                : "❌ Rechazar"
            }
            loading={processing === `reject-${request.rideId}`}
            onPress={() => showRejectDialog(request)}
            className="flex-1"
            disabled={isProcessing}
          />
        </View>
    </Card>
    );
  };

  return (
    <View className="flex-1">
      <FlowHeader
        title={`Solicitudes disponibles (${pendingRequests.length})`}
      />
      <ScrollView className="flex-1 p-4">
        <Text className="font-Jakarta text-sm text-gray-600 mb-4 text-center">
          Selecciona una solicitud para aceptar o rechazar
        </Text>

        {pendingRequests.map(renderRequestCard)}

        <View className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Text className="font-JakartaMedium text-sm text-blue-800 text-center">
            💡 Tip: Las solicitudes se actualizan automáticamente cada 10
            segundos
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default DriverIncomingRequest;
