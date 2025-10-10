import { useCallback } from 'react';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';
import { useLocationStore } from '@/store';
import { useRealtimeStore } from '@/store';
import type { MapFlowStep } from '@/store';

/**
 * Custom hook para acciones del MapFlow store
 * Pre-captura state para evitar require() en event handlers
 */
export const useMapFlowActions = () => {
  const mapFlowStore = useMapFlowStore();
  const locationStore = useLocationStore();
  const realtimeStore = useRealtimeStore();

  // Pre-capturar actions para evitar re-creación en cada render
  const actions = {
    // MapFlow actions
    start: useCallback((role: 'customer' | 'driver') => {
      mapFlowStore.start(role);
    }, [mapFlowStore]),

    startService: useCallback((service: 'transport' | 'delivery' | 'mandado' | 'envio', role?: 'customer' | 'driver') => {
      mapFlowStore.startService(service, role);
    }, [mapFlowStore]),

    goTo: useCallback((step: string) => {
      mapFlowStore.goTo(step as MapFlowStep);
    }, [mapFlowStore]),

    next: useCallback(() => {
      mapFlowStore.next();
    }, [mapFlowStore]),

    back: useCallback(() => {
      mapFlowStore.back();
    }, [mapFlowStore]),

    stop: useCallback(() => {
      mapFlowStore.stop();
    }, [mapFlowStore]),

    reset: useCallback(() => {
      mapFlowStore.reset();
    }, [mapFlowStore]),

    // Location actions
    updateDriverLocation: useCallback((location: { latitude: number; longitude: number; timestamp: Date }) => {
      realtimeStore.updateDriverLocation(location);
    }, [realtimeStore]),

    // Helper para obtener estado actual sin re-renders
    getCurrentState: useCallback(() => ({
      location: {
        userLatitude: locationStore.userLatitude,
        userLongitude: locationStore.userLongitude,
        destinationLatitude: locationStore.destinationLatitude,
        destinationLongitude: locationStore.destinationLongitude,
      },
      realtime: {
        driverLocation: realtimeStore.driverLocation,
      },
      mapFlow: {
        step: mapFlowStore.step,
        role: mapFlowStore.role,
        service: mapFlowStore.service,
      }
    }), [locationStore, realtimeStore, mapFlowStore])
  };

  return actions;
};
