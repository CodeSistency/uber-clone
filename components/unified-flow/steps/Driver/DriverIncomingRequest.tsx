import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";

import {
  driverTransportService,
  PendingRequest,
} from "@/app/services/driverTransportService";
import { websocketService } from "@/app/services/websocketService";
import { websocketEventManager } from "@/lib/websocketEventManager";
import { pendingRequestsCache } from "@/lib/PendingRequestsCache";
import { smartRequestManager, RequestState } from "@/lib/RequestStateManager";
import { Button, Card, Badge } from "@/components/ui";
import RequestStateIndicator, {
  RequestProgressBar,
} from "@/components/ui/RequestStateIndicator";
import { useUI } from "@/components/UIWrapper";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useRealtimeStore } from "@/store";
import { useDriverStateStore } from "@/store/driverState/driverState";
import { FLOW_STEPS } from "@/store/mapFlow";

const DriverIncomingRequest: React.FC = () => {
  const { goTo, startWithDriverStep } = useMapFlow();
  const { showSuccess, showError } = useUI();
  const driverState = useDriverStateStore();
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [listening, setListening] = useState(true); // 🚀 NUEVO: Estado para mostrar "escuchando"
  const [processing, setProcessing] = useState<string | null>(null);
  const [hasNewRequest, setHasNewRequest] = useState(false); // ✅ OPTIMIZED: Estado para notificación preview
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🚀 NUEVO: Reemplazo de polling con WebSocket listener
  useEffect(() => {

    const handleRideRequested = async (data: any) => {
      

      // ✅ INTEGRATED: Usar SmartRequestManager para manejar estados
      try {
        // Transición a estado NOTIFIED
        smartRequestManager.transitionTo(RequestState.NOTIFIED, {
          rideId: data.rideId,
          area: data.area,
          timestamp: data.timestamp,
        });

        setLoading(false); // Ya no estamos cargando
        setListening(false); // Ya no estamos solo escuchando
        setHasNewRequest(true); // ✅ Estado para mostrar notificación

        // Mostrar notificación visual al conductor
        showSuccess(
          "Nueva solicitud disponible",
          `Hay una solicitud en el área de ${data.area}`,
          3000,
        );

        

        // ❌ REMOVED: No llamar API automáticamente
        // La API se llamará solo cuando el conductor toque la notificación

        // Limpiar timeout ya que tenemos una notificación activa
        // Note: timeoutId is not currently used, this is for future timeout implementation
      } catch (error) {
        

        // Transición a estado ERROR
        smartRequestManager.transitionTo(RequestState.ERROR, {
          error: error instanceof Error ? error.message : String(error),
          context: "handleRideRequested",
        });

        // En caso de error, mostrar mensaje pero no fallar completamente
        showError(
          "Notificación",
          "Nueva solicitud disponible, toca para ver detalles",
        );
      }
    };

    // Suscribirse al evento ride:requested
    websocketEventManager.on("ride:requested", handleRideRequested);

    // Estado inicial: escuchando
    setLoading(true);
    setListening(true);
    

    return () => {
      // Cleanup
      websocketEventManager.off("ride:requested", handleRideRequested);
      // Note: timeoutId cleanup removed since it's not currently used
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [driverState.currentLocation?.lat, driverState.currentLocation?.lng]);

  // ✅ OPTIMIZED: Función para cargar datos completos al interactuar (con cache inteligente y state management)
  const loadFullRequestData = async () => {
    if (loading) return; // Evitar múltiples llamadas

    const lat = driverState.currentLocation?.lat || 0;
    const lng = driverState.currentLocation?.lng || 0;

    

    // ✅ INTEGRATED: Transición a estado LOADING
    smartRequestManager.transitionTo(RequestState.LOADING, {
      context: "loadFullRequestData",
      location: { lat, lng },
    });

    setLoading(true);
    setHasNewRequest(false); // Ocultar notificación preview

    try {
      // ✅ CACHE INTELIGENTE: Primero intentar obtener del cache
      let requests = pendingRequestsCache.get(lat, lng);

      if (requests) {
        // ✅ Cache hit - usar datos del cache (instantáneo)
        
        setPendingRequests(requests);

        // ✅ INTEGRATED: Transición a estado LOADED
        smartRequestManager.transitionTo(RequestState.LOADED, {
          source: "cache",
          requestsCount: requests.length,
          cacheStats: pendingRequestsCache.getStats(),
        });

        setLoading(false);
        return;
      }

      // ❌ Cache miss - hacer llamada a API
      
      showSuccess(
        "Cargando detalles...",
        "Obteniendo información actualizada",
        2000,
      );

      const response = await driverTransportService.getPendingRequests(
        lat,
        lng,
      );
      requests = response?.data || [];

      if (requests.length > 0) {
        // ✅ Guardar en cache para futuras consultas
        pendingRequestsCache.set(lat, lng, requests);
        setPendingRequests(requests);

        

        // ✅ INTEGRATED: Transición a estado LOADED
        smartRequestManager.transitionTo(RequestState.LOADED, {
          source: "api",
          requestsCount: requests.length,
          cacheStats: pendingRequestsCache.getStats(),
        });
      } else {
        // No hay solicitudes disponibles después de la interacción
        showError(
          "Sin solicitudes",
          "No hay solicitudes disponibles en este momento",
        );
        startWithDriverStep(FLOW_STEPS.DRIVER_DISPONIBILIDAD);

        // ✅ INTEGRATED: Reset a estado IDLE
        smartRequestManager.transitionTo(RequestState.IDLE, {
          reason: "no_requests_available",
        });
      }
    } catch (error) {
      

      // ✅ INTEGRATED: Transición a estado ERROR
      smartRequestManager.transitionTo(RequestState.ERROR, {
        error: error instanceof Error ? error.message : String(error),
        context: "loadFullRequestData",
      });

      // En caso de error, intentar usar datos del cache como fallback (aunque expirados)
      const cachedFallback = pendingRequestsCache.get(lat, lng);
      if (cachedFallback && cachedFallback.length > 0) {
        
        setPendingRequests(cachedFallback);
        showError(
          "Error de conexión",
          "Mostrando datos anteriores. Verifica tu conexión.",
        );

        // ✅ INTEGRATED: Transición a LOADED con datos de fallback
        smartRequestManager.transitionTo(RequestState.LOADED, {
          source: "cache_fallback",
          requestsCount: cachedFallback.length,
        });
      } else {
        showError(
          "Error",
          "No se pudieron cargar los detalles de la solicitud",
        );
        setHasNewRequest(true); // Volver a mostrar notificación si falla completamente

        // ✅ INTEGRATED: Reset a estado IDLE en error completo
        setTimeout(() => {
          smartRequestManager.transitionTo(RequestState.IDLE, {
            reason: "complete_failure",
          });
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (request: PendingRequest) => {
    if (processing) return;
    setProcessing(`accept-${request.rideId}`);

    try {
      

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
      
      showError("Error", "No se pudo aceptar la solicitud. Intenta de nuevo.");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (request: PendingRequest, reason?: string) => {
    if (processing) return;
    setProcessing(`reject-${request.rideId}`);

    try {
      

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

  // ✅ OPTIMIZED: Mostrar notificación preview cuando hay nueva solicitud
  if (hasNewRequest && !loading) {
    return (
      <View className="flex-1">
        <FlowHeader title="Nueva solicitud disponible" />
        <View className="flex-1 justify-center items-center p-6">
          {/* ✅ ENHANCED: Indicador de estado visual */}
          <RequestStateIndicator className="mb-4" size="lg" showLabels={true} />
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-6 w-full max-w-sm mb-6">
            <View className="items-center mb-4">
              <Text className="text-4xl mb-2">🔔</Text>
              <Text className="font-JakartaBold text-lg text-blue-800 text-center mb-2">
                ¡Nueva solicitud de viaje!
              </Text>
              <Text className="font-Jakarta text-sm text-blue-700 text-center">
                Hay una solicitud disponible cerca de tu ubicación
              </Text>
            </View>

            <Button
              variant="primary"
              title="Ver detalles"
              onPress={loadFullRequestData}
              className="w-full"
            />

            <Text className="font-Jakarta text-xs text-blue-600 text-center mt-3">
              Toca para cargar los detalles completos
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (loading && listening) {
    return (
      <View className="flex-1">
        <FlowHeader title="Escuchando solicitudes..." />
        <View className="flex-1 justify-center items-center p-6">
          <View className="flex-row items-center mb-4">
            <Text className="text-4xl mr-3">📡</Text>
            <View className="flex-row">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></View>
              <View className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></View>
              <View className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></View>
            </View>
          </View>
          <Text className="font-JakartaMedium text-lg text-gray-600 text-center mb-2">
            Escuchando nuevas solicitudes en tiempo real
          </Text>
          <Text className="font-Jakarta text-sm text-gray-500 text-center">
            Las solicitudes aparecerán automáticamente cuando estén disponibles
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
      <Card key={request.rideId} className="mb-4">
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
