import { useCallback, useEffect, useRef, useState } from "react";
import { LatLng } from "react-native-maps";
import { getRoute } from "@/lib/directions";
import { useMapController } from "@/hooks/useMapController";
import { useLocationStore, useRealtimeStore } from "@/store";
import { websocketService } from "@/app/services/websocketService";
import { locationTrackingService } from "@/app/services/locationTrackingService";

interface StartNavParams {
  destination: { latitude: number; longitude: number; address?: string };
  rideId?: number;
}

export const useMapNavigation = () => {
  const controller = useMapController();
  const { userLatitude, userLongitude } = useLocationStore();
  const { activeRide } = useRealtimeStore();
  const [distanceText, setDistanceText] = useState<string>("");
  const [etaText, setEtaText] = useState<string>("");
  const [instruction, setInstruction] = useState<string>("");
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const rideIdRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const startNavigation = useCallback(
    async ({ destination, rideId }: StartNavParams) => {
      if (!userLatitude || !userLongitude) return;
      const origin: LatLng = {
        latitude: userLatitude,
        longitude: userLongitude,
      };
      const dest: LatLng = {
        latitude: destination.latitude,
        longitude: destination.longitude,
      };
      const route = await getRoute(origin, dest);
      // Draw route using Map controller
      controller.fitBounds(route.polyline, {
        top: 60,
        right: 60,
        bottom: 60,
        left: 60,
      } as any);
      setDistanceText(route.distanceText || "");
      setEtaText(route.durationText || "");
      setInstruction(route.firstInstruction || "Navigate");
      setIsNavigating(true);

      // Start WS updates
      const effectiveRideId =
        rideId ??
        (activeRide as any)?.ride_id ??
        (activeRide as any)?.orderId ??
        (activeRide as any)?.id ??
        null;
      rideIdRef.current = effectiveRideId;
      if (effectiveRideId) {
        try {
          locationTrackingService.start(effectiveRideId);
        } catch {}
        // Periodic WS updates as a safety net
        intervalRef.current = setInterval(() => {
          const { driverLocation } = useRealtimeStore.getState();
          const lat = driverLocation?.latitude ?? userLatitude ?? 0;
          const lng = driverLocation?.longitude ?? userLongitude ?? 0;
          websocketService.updateDriverLocation(effectiveRideId, {
            latitude: lat,
            longitude: lng,
            timestamp: new Date(),
          } as any);
        }, 5000) as unknown as number;
      }
    },
    [userLatitude, userLongitude, controller, activeRide],
  );

  const stopNavigation = useCallback(() => {
    setIsNavigating(false);
    try {
      locationTrackingService.stop();
    } catch {}
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const updateDestination = useCallback(
    async (destination: LatLng) => {
      if (!userLatitude || !userLongitude) return;
      const origin: LatLng = {
        latitude: userLatitude,
        longitude: userLongitude,
      };
      const dest: LatLng = destination;
      const route = await getRoute(origin, dest);
      controller.fitBounds(route.polyline, {
        top: 60,
        right: 60,
        bottom: 60,
        left: 60,
      } as any);
      setDistanceText(route.distanceText || "");
      setEtaText(route.durationText || "");
      setInstruction(route.firstInstruction || "Navigate");
    },
    [userLatitude, userLongitude, controller],
  );

  const recenter = useCallback(() => {
    if (userLatitude && userLongitude) {
      controller.panTo(
        { latitude: userLatitude, longitude: userLongitude },
        600,
      );
    }
  }, [userLatitude, userLongitude, controller]);

  useEffect(() => () => stopNavigation(), [stopNavigation]);

  return {
    startNavigation,
    stopNavigation,
    updateDestination,
    recenter,
    distanceText,
    etaText,
    currentInstruction: instruction,
    isNavigating,
  };
};
