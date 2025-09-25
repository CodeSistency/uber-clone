import React, { useMemo } from "react";
import { View, Text } from "react-native";

import {
  transportClient,
  deliveryClient,
  errandClient,
  parcelClient,
} from "@/app/services/flowClientService";
import Map, { MapHandle } from "@/components/Map";
import InlineBottomSheet from "@/components/ui/InlineBottomSheet";
import { useUI } from "@/components/UIWrapper";
import { loadNearbyRestaurants, Restaurant } from "@/constants/dummyData";
import { MapFlowProvider } from "@/context/MapFlowContext";
import { useMapController } from "@/hooks/useMapController";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useRealtimeStore, useLocationStore } from "@/store";
import { useDevStore } from "@/store/dev/dev";
import { MapFlowStep } from "@/store/mapFlow/mapFlow";

interface UnifiedFlowWrapperProps {
  role?: "customer" | "driver";
  renderStep: (step: MapFlowStep) => React.ReactNode;
  children?: React.ReactNode;
}

const UnifiedFlowWrapper: React.FC<UnifiedFlowWrapperProps> = ({
  role = "customer",
  renderStep,
  children,
}) => {
  const flow = useMapFlow();
  const map = useMapController();

  // Auto-start si no está activo
  React.useEffect(() => {
    // No longer auto-starting flow here since it's handled by the parent component
  }, [flow.isActive, flow, role]);

  const sheetVisible = flow.bottomSheetVisible;
  const minH = flow.bottomSheetMinHeight;
  const maxH = flow.bottomSheetMaxHeight;
  const initH = flow.bottomSheetInitialHeight;
  const allowDrag = flow.bottomSheetAllowDrag;
  const className = flow.bottomSheetClassName || "px-5 pb-5";
  const transitionType = flow.transitionType;
  const transitionDuration = flow.transitionDuration;
  const snapPoints = flow.bottomSheetSnapPoints;
  const handleHeight = flow.bottomSheetHandleHeight;

  const content = useMemo(() => {
    return renderStep(flow.step);
  }, [renderStep, flow.step]);

  // Toast on step transitions (demo visibility)
  const ui = useUI();
  React.useEffect(() => {
    const pretty = String(flow.step).replace(/_/g, " ").toLowerCase();
    ui.showSnackbar({
      type: "info",
      message: `Paso: ${pretty}`,
      position: "top-right",
      duration: 1400,
      showCloseButton: false,
    });
  }, [flow.step]);

  // Polling for backend status during tracking-related steps
  React.useEffect(() => {
    let timer: any = null;
    const pollable =
      (flow.service === "transport" &&
        (flow.step === "CUSTOMER_TRANSPORT_GESTION_CONFIRMACION" ||
          flow.step === "CUSTOMER_TRANSPORT_DURANTE_FINALIZACION" ||
          flow.step === "CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION") &&
        (flow as any).rideId) ||
      (flow.service === "delivery" &&
        flow.step === "CUSTOMER_DELIVERY_SEGUIMIENTO_DELIVERY" &&
        (flow as any).orderId) ||
      (flow.service === "mandado" &&
        flow.step === "CUSTOMER_MANDADO_COMUNICACION_CONFIRMACION" &&
        (flow as any).errandId) ||
      (flow.service === "envio" &&
        flow.step === "CUSTOMER_ENVIO_SEGUIMIENTO_PAQUETE" &&
        (flow as any).parcelId);

    const doPoll = async () => {
      try {
        if (flow.service === "transport" && (flow as any).rideId) {
          const rideId = (flow as any).rideId as number;

          // 🆕 Usar nuevo endpoint de estado de pagos para transport
          const paymentStatus = await transportClient.getPaymentStatus(rideId);

          // Actualizar estado de pagos si existe grupo
          if (paymentStatus.data.hasPaymentGroup && paymentStatus.data.groupId) {
            const { usePaymentStore } = await import("@/store");
            usePaymentStore.getState().updateGroupStatus(
              paymentStatus.data.groupId,
              paymentStatus.data
            );
          }

          // Obtener estado del viaje
          const res = await transportClient.getStatus(rideId);
          const status = res?.data?.status || res?.status;

          if (status) {
            // Mapeo de estados del backend a estados del frontend
            const statusMap: any = {
              pending: "requested",
              driver_confirmed: "accepted",
              accepted: "accepted",
              arriving: "arriving",
              arrived: "arrived",
              in_progress: "in_progress",
              completed: "completed",
              cancelled: "cancelled",
              rejected: "cancelled"
            };
            const mappedStatus = statusMap[status] || "requested";

            console.log(`[UnifiedFlowWrapper] Polling status for ride ${rideId}: ${status} -> ${mappedStatus}`);
            useRealtimeStore.getState().updateRideStatus(rideId, mappedStatus);

            // Mostrar notificación solo para cambios importantes
            if (status === "accepted") {
              ui.showSuccess("¡Conductor aceptado!", "Tu viaje comenzará pronto");
            } else if (status === "arriving") {
              ui.showInfo("Conductor llegando", "Tu conductor está cerca");
            } else if (status === "arrived") {
              ui.showSuccess("¡Conductor llegó!", "Tu conductor te está esperando");
            } else if (status === "rejected") {
              ui.showError("Viaje rechazado", "El conductor no pudo aceptar tu solicitud");
            }
          }
        } else if (flow.service === "delivery" && (flow as any).orderId) {
          const orderId = (flow as any).orderId as number;
          const res = await deliveryClient.getStatus(orderId);
          const status = res?.data?.status || res?.status;
          if (status) ui.showInfo("Delivery", String(status));
        } else if (flow.service === "mandado" && (flow as any).errandId) {
          const id = (flow as any).errandId as number;
          const res = await errandClient.getStatus(id);
          const status = res?.data?.status || res?.status;
          if (status) ui.showInfo("Mandado", String(status));
        } else if (flow.service === "envio" && (flow as any).parcelId) {
          const id = (flow as any).parcelId as number;
          const res = await parcelClient.getStatus(id);
          const status = res?.data?.status || res?.status;
          if (status) ui.showInfo("Paquete", String(status));
        }
      } catch (e) {
        // Silent poll errors
        console.warn("[UnifiedFlowWrapper] Polling error:", e);
      }
    };

    if (pollable) {
      doPoll();
      // Polling más frecuente durante matching (cada 3 segundos vs 5)
      const intervalMs = flow.step === "CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION" ? 3000 : 5000;
      timer = setInterval(doPoll, intervalMs);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [
    flow.service,
    flow.step,
    (flow as any).rideId,
    (flow as any).orderId,
    (flow as any).errandId,
    (flow as any).parcelId,
  ]);

  // Simple simulation control: when in confirmation or in-progress, animate a dummy driver location
  React.useEffect(() => {
    const {
      updateDriverLocation,
      startTracking,
      stopTracking,
      simulationEnabled,
    } = useRealtimeStore.getState();
    const { developerMode } = useDevStore.getState();
    let timer: any = null;

    const simulate =
      flow.step === "CUSTOMER_TRANSPORT_GESTION_CONFIRMACION" ||
      flow.step === "CUSTOMER_TRANSPORT_DURANTE_FINALIZACION" ||
      flow.step === "CUSTOMER_DELIVERY_SEGUIMIENTO_DELIVERY" ||
      flow.step === "CUSTOMER_ENVIO_SEGUIMIENTO_PAQUETE" ||
      flow.step === "CUSTOMER_MANDADO_COMUNICACION_CONFIRMACION";

    if (simulate && (simulationEnabled || developerMode)) {
      startTracking(1);
      let t = 0;
      timer = setInterval(() => {
        t += 1;
        // Simple parametric path near user location
        const { userLatitude, userLongitude } = useLocationStore.getState();
        const baseLat = userLatitude || 40.7128;
        const baseLng = userLongitude || -74.006;
        const lat = baseLat + Math.sin(t / 20) * 0.0015;
        const lng = baseLng + Math.cos(t / 20) * 0.0015;
        updateDriverLocation({
          latitude: lat,
          longitude: lng,
          timestamp: new Date(),
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
      stopTracking();
    };
  }, [flow.step]);

  // Camera control according to mapInteraction
  React.useEffect(() => {
    const {
      userLatitude,
      userLongitude,
      destinationLatitude,
      destinationLongitude,
    } = useLocationStore.getState();
    const { driverLocation } = useRealtimeStore.getState();

    if (!map) return;

    if (flow.mapInteraction === "pan_to_confirm") {
      if (userLatitude && userLongitude) {
        map.panTo({ latitude: userLatitude, longitude: userLongitude }, 600);
      }
    } else if (flow.mapInteraction === "follow_driver") {
      if (driverLocation) {
        map.panTo(
          {
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
          },
          600,
        );
      }
    } else if (flow.mapInteraction === "follow_route") {
      const points: { latitude: number; longitude: number }[] = [];
      if (userLatitude && userLongitude)
        points.push({ latitude: userLatitude, longitude: userLongitude });
      if (destinationLatitude && destinationLongitude)
        points.push({
          latitude: destinationLatitude,
          longitude: destinationLongitude,
        });
      if (driverLocation)
        points.push({
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
        });
      if (points.length >= 2) {
        map.fitBounds(points);
      }
    }
  }, [flow.mapInteraction, flow.step]);

  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = React.useState(false);

  // Load restaurants when service is delivery
  React.useEffect(() => {
    let active = true;
    const load = async () => {
      if (flow.service === "delivery") {
        setLoadingRestaurants(true);
        try {
          const data = await loadNearbyRestaurants();
          if (active) setRestaurants(data);
        } catch (e) {
          ui.showWarning("Delivery", "No se pudieron cargar restaurantes");
        } finally {
          if (active) setLoadingRestaurants(false);
        }
      } else {
        setRestaurants([]);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [flow.service]);

  // Toast on rideStatus change
  React.useEffect(() => {
    const { rideStatus } = useRealtimeStore.getState();
    if (rideStatus) {
      const msg = String(rideStatus).replace(/_/g, " ");
      if (
        rideStatus === "accepted" ||
        rideStatus === "arriving" ||
        rideStatus === "arrived"
      ) {
        ui.showInfo("Ride", msg);
      } else if (rideStatus === "in_progress") {
        ui.showSuccess("Ride", msg);
      } else if (rideStatus === "completed") {
        ui.showSuccess("Ride", msg);
      } else if (rideStatus === "cancelled") {
        ui.showWarning("Ride", msg);
      }
    }
  }, [flow.step]);

  return (
    <MapFlowProvider value={{ flow, map }}>
      <View className="flex-1">
        <Map
          ref={map.setRef as unknown as React.Ref<MapHandle>}
          serviceType={(flow.service as any) || "transport"}
          restaurants={restaurants}
          isLoadingRestaurants={loadingRestaurants}
        />

        {/* Debug Info - Remove in production */}
        <View
          style={{
            position: "absolute",
            top: 50,
            left: 10,
            backgroundColor: "rgba(0,0,0,0.7)",
            padding: 8,
            borderRadius: 4,
            zIndex: 1000,
          }}
        >
          <Text style={{ color: "white", fontSize: 12 }}>
            Step: {flow.step}
          </Text>
          <Text style={{ color: "white", fontSize: 12 }}>
            Service: {flow.service || "None"}
          </Text>
          <Text style={{ color: "white", fontSize: 12 }}>
            Role: {flow.role}
          </Text>
        </View>

        {sheetVisible ? (
          <InlineBottomSheet
            visible={sheetVisible}
            minHeight={minH}
            maxHeight={maxH}
            initialHeight={initH}
            allowDrag={allowDrag}
            snapPoints={snapPoints}
            className={className}
            // Gradient background like services-hub.tsx
            useGradient
            gradientColors={
              ui.theme === "dark"
                ? ([
                    "rgba(0,0,0,0.92)",
                    "rgba(0,0,0,0.78)",
                    "rgba(18,18,18,0.66)",
                    "rgba(30,30,30,0.64)",
                  ] as const)
                : ([
                    "rgba(20,20,20,0.9)",
                    "rgba(50,50,50,0.75)",
                    "rgba(160,160,160,0.55)",
                    "rgba(235,235,235,0.55)",
                  ] as const)
            }
          >
            {content}
          </InlineBottomSheet>
        ) : (
          // When bottom sheet is hidden, render content directly over the full screen
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
            }}
          >
            {content}
          </View>
        )}
      </View>
      {/* Overlay children rendered above everything (e.g., simulation panel) */}
      {children}
    </MapFlowProvider>
  );
};

export default UnifiedFlowWrapper;
