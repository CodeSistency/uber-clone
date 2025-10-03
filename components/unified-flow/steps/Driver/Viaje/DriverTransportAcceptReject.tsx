import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";

import { driverTransportService } from "@/app/services/driverTransportService";
import { Button, Card, Badge } from "@/components/ui";
import { useUI } from "@/components/UIWrapper";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useRealtimeStore, useDriverStateStore } from "@/store";
import { FLOW_STEPS } from "@/lib/unified-flow/constants";

const COUNTDOWN_SECONDS = 30;

interface RideRequest {
  rideId: number;
  originAddress: string;
  destinationAddress: string;
  farePrice: number;
  estimatedDistance: number;
  passenger: {
    name: string;
    phone: string;
  };
  tier: { name: string };
  requestedAt: string;
  expiresAt: string;
}

const DriverTransportAcceptReject: React.FC = () => {
  const { goTo, startWithDriverStep } = useMapFlow();
  const { showSuccess, showError } = useUI();
  const [remaining, setRemaining] = useState<number>(COUNTDOWN_SECONDS);
  const [request, setRequest] = useState<RideRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingRequest, setFetchingRequest] = useState(true);
  const driverState = useDriverStateStore();

  // Obtener la solicitud pendiente más reciente
  useEffect(() => {
    const fetchPendingRequest = async () => {
      try {
        setFetchingRequest(true);
        // For now, call without driverId - backend should know from auth token
        const response = await driverTransportService.getPendingRequests(
          driverState.currentLocation?.lat || 0,
          driverState.currentLocation?.lng || 0,
        );
        const pendingRequests = response?.data || [];

        if (pendingRequests && pendingRequests.length > 0) {
          // Tomar la primera solicitud pendiente
          setRequest(pendingRequests[0]);
        } else {
          // No hay solicitudes pendientes, volver a disponibilidad
          console.log(
            "[DriverTransportAcceptReject] No pending requests, returning to availability",
          );
          startWithDriverStep(FLOW_STEPS.DRIVER_DISPONIBILIDAD);
        }
      } catch (error) {
        console.error(
          "[DriverTransportAcceptReject] Error fetching pending requests:",
          error,
        );
        showError("Error", "No se pudieron cargar las solicitudes pendientes");
        startWithDriverStep(FLOW_STEPS.DRIVER_DISPONIBILIDAD);
      } finally {
        setFetchingRequest(false);
      }
    };

    fetchPendingRequest();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!request || remaining <= 0) return;

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          // Auto-rechazar cuando llegue a 0
          handleAutoReject();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [request, remaining]);

  const handleAccept = async () => {
    if (!request || loading) return;

    setLoading(true);
    try {
      console.log(
        "[DriverTransportAcceptReject] Accepting ride:",
        request.rideId,
      );

      // ✅ Calcular tiempo estimado de llegada basado en ubicación real
      const driverLat = driverState.currentLocation?.lat || 0;
      const driverLng = driverState.currentLocation?.lng || 0;
      const pickupLat = (request as any).pickupLocation?.lat || 0;
      const pickupLng = (request as any).pickupLocation?.lng || 0;

      // Calcular distancia aproximada en línea recta (Haversine)
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distancia en km
      };

      const distanceKm = calculateDistance(driverLat, driverLng, pickupLat, pickupLng);
      // Estimar 30 km/h promedio en ciudad
      const estimatedArrivalMinutes = Math.round((distanceKm / 30) * 60);

      await driverTransportService.respondToRequest(
        request.rideId,
        "accept",
        estimatedArrivalMinutes,
      );

      console.log("[DriverTransportAcceptReject] Fetching full ride details...");

      // ✅ Obtener detalles completos del ride desde el endpoint
      const rideDetails = await driverTransportService.getRideDetails(request.rideId);

      console.log("[DriverTransportAcceptReject] Full ride details received:", rideDetails);

      showSuccess("¡Viaje aceptado!", "Dirígete al punto de recogida");

      // ✅ Actualizar el store con datos reales del endpoint
      useRealtimeStore.getState().setActiveRide({
        ride_id: rideDetails.rideId,
        origin_address: rideDetails.route.origin.address,
        destination_address: rideDetails.route.destination.address,
        origin_latitude: rideDetails.route.origin.lat, // ✅ Dinámico
        origin_longitude: rideDetails.route.origin.lng, // ✅ Dinámico
        destination_latitude: rideDetails.route.destination.lat, // ✅ Dinámico
        destination_longitude: rideDetails.route.destination.lng, // ✅ Dinámico
        fare_price: rideDetails.pricing.fare,
        user_id: 0, // El passenger no tiene ID en la respuesta actual
        driver_id: driverState.driverId || 0, // ✅ ID real del conductor
        created_at: rideDetails.timestamps.created,
        ride_time: rideDetails.pricing.estimatedDuration, // ✅ Dinámico
        payment_status: "pending",
        driver: {
          first_name: driverState.firstName || "Conductor", // ✅ Datos reales
          last_name: driverState.lastName || "",
          car_seats: 4, // TODO: Agregar datos de vehículo al driverState
        },
      } as any); // ✅ Usar 'as any' para extender el tipo Ride con passenger

      // ✅ Agregar datos del pasajero al objeto extendido
      const extendedRide = useRealtimeStore.getState().activeRide as any;
      if (extendedRide) {
        extendedRide.passenger = {
          name: rideDetails.passenger.name,
          phone: rideDetails.passenger.phone,
          email: rideDetails.passenger.email,
        };
      }

      // Ir a navegación hacia el origen
      goTo(FLOW_STEPS.DRIVER_TRANSPORT_EN_CAMINO_ORIGEN);
    } catch (error) {
      console.error(
        "[DriverTransportAcceptReject] Error accepting ride:",
        error,
      );
      showError("Error", "No se pudo aceptar el viaje. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (reason?: string) => {
    if (!request || loading) return;

    setLoading(true);
    try {
      console.log(
        "[DriverTransportAcceptReject] Rejecting ride:",
        request.rideId,
      );

      if (reason) {
        await driverTransportService.rejectRequest(request.rideId, reason);
      } else {
        await driverTransportService.respondToRequest(request.rideId, "reject");
      }

      showSuccess("Viaje rechazado", "Buscando otro servicio");

      // Limpiar ride activo y volver a disponibilidad
      useRealtimeStore.getState().setActiveRide(null);
      startWithDriverStep(FLOW_STEPS.DRIVER_DISPONIBILIDAD);
    } catch (error) {
      console.error(
        "[DriverTransportAcceptReject] Error rejecting ride:",
        error,
      );
      showError("Error", "No se pudo rechazar el viaje.");
      // Aun así volver a disponibilidad
      startWithDriverStep(FLOW_STEPS.DRIVER_DISPONIBILIDAD);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoReject = async () => {
    console.log("[DriverTransportAcceptReject] Auto-rejecting due to timeout");
    await handleReject("Tiempo de respuesta agotado");
  };

  const showRejectReasonDialog = () => {
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
        .map((reason, index) => ({
          text: reason,
          onPress: () => handleReject(reason),
        }))
        .concat([
          {
            text: "Cancelar",
            onPress: async () => {
              // Simply close the alert without action
            },
          },
        ]),
    );
  };

  if (fetchingRequest) {
    return (
      <View className="flex-1">
        <FlowHeader title="Cargando solicitud..." />
        <View className="flex-1 justify-center items-center p-6">
          <Text className="font-JakartaMedium text-lg text-gray-600">
            Buscando solicitudes disponibles...
          </Text>
        </View>
      </View>
    );
  }

  if (!request) {
    return (
      <View className="flex-1">
        <FlowHeader title="Sin solicitudes" />
        <View className="flex-1 justify-center items-center p-6">
          <Text className="font-JakartaMedium text-lg text-gray-600 mb-4">
            No hay solicitudes disponibles en este momento
          </Text>
          <Button
            variant="primary"
            title="Volver a disponibilidad"
            onPress={() =>
              startWithDriverStep(FLOW_STEPS.DRIVER_DISPONIBILIDAD)
            }
            className="w-full"
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlowHeader title="Nueva Solicitud de Viaje" />

      <ScrollView className="flex-1 p-6">
        {/* Información del viaje */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="font-JakartaBold text-lg mb-2">
            Detalles del viaje
          </Text>

          <View className="flex-row items-center mb-2">
            <Text className="font-JakartaMedium text-gray-600 mr-2">
              Desde:
            </Text>
            <Text className="font-Jakarta text-gray-800 flex-1">
              {request.originAddress}
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Text className="font-JakartaMedium text-gray-600 mr-2">
              Hasta:
            </Text>
            <Text className="font-Jakarta text-gray-800 flex-1">
              {request.destinationAddress}
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Text className="font-JakartaMedium text-gray-600 mr-2">
              Distancia:
            </Text>
            <Text className="font-Jakarta text-gray-800">
              {request.estimatedDistance} km
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Text className="font-JakartaMedium text-gray-600 mr-2">
              Tarifa:
            </Text>
            <Text className="font-JakartaBold text-green-600 text-lg">
              ${request.farePrice}
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Text className="font-JakartaMedium text-gray-600 mr-2">Tipo:</Text>
            <Text className="font-Jakarta text-gray-800">
              {request.tier.name}
            </Text>
          </View>
        </View>

        {/* Información del pasajero */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="font-JakartaBold text-lg mb-2">
            Información del pasajero
          </Text>

          <View className="flex-row items-center mb-2">
            <Text className="font-JakartaMedium text-gray-600 mr-2">
              Nombre:
            </Text>
            <Text className="font-Jakarta text-gray-800">
              {request.passenger.name}
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Text className="font-JakartaMedium text-gray-600 mr-2">
              Teléfono:
            </Text>
            <Text className="font-Jakarta text-gray-800">
              {request.passenger.phone}
            </Text>
          </View>
        </View>

        {/* Temporizador */}
        <View className="bg-orange-50 rounded-lg p-4 mb-6 border border-orange-200">
          <Text className="font-JakartaBold text-lg text-center text-orange-800 mb-2">
            Tiempo restante para responder
          </Text>
          <Text className="font-JakartaBold text-3xl text-center text-orange-600">
            {remaining}s
          </Text>
          <Text className="font-Jakarta text-sm text-center text-orange-700 mt-2">
            El viaje se rechazará automáticamente si no respondes
          </Text>
        </View>

        {/* Botones de acción */}
        <View className="space-y-3">
          <Button
            variant="success"
            title={loading ? "Aceptando..." : "Aceptar viaje"}
            onPress={handleAccept}
            loading={loading}
            className="w-full"
            disabled={loading}
          />

          <Button
            variant="danger"
            title={loading ? "Rechazando..." : "Rechazar viaje"}
            onPress={showRejectReasonDialog}
            loading={loading}
            className="w-full"
            disabled={loading}
          />
        </View>

        {/* Información adicional */}
        <Card className="mt-6 bg-gray-50">
          <Text className="font-JakartaMedium text-sm text-gray-600 text-center">
            Recuerda que al aceptar un viaje te comprometes a recoger al
            pasajero. Si no puedes completar el viaje, cancélalo lo antes
            posible.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
};

export default DriverTransportAcceptReject;
