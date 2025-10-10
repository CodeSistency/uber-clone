import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import type { Region, LatLng } from 'react-native-maps';
import { animationManager } from '@/lib/map/animationManager';
export const useMapAnimations = (mapRef: React.RefObject<any>) => {
  const markerScale = useRef(new Animated.Value(1)).current;
  const markerOpacity = useRef(new Animated.Value(1)).current;
  const routeProgress = useRef(new Animated.Value(0)).current;

  /**
   * Anima el zoom a una ubicación con efecto suave
   */
  const animateToLocation = useCallback(async (
    coordinate: LatLng,
    zoom?: number,
    duration: number = 800
  ) => {
    if (!mapRef.current) return;

    // Primero hacer zoom out un poco
    const currentRegion = await getCurrentRegion();
    if (currentRegion) {
      const zoomOutRegion: Region = {
        ...currentRegion,
        latitudeDelta: currentRegion.latitudeDelta * 1.5,
        longitudeDelta: currentRegion.longitudeDelta * 1.5,
      };

      mapRef.current.animateToRegion(zoomOutRegion, duration / 3);
    }

    // Luego animar a la ubicación final
    setTimeout(() => {
      if (mapRef.current) {
        if (zoom) {
          const delta = Math.pow(2, 20 - zoom) / 1000;
          const region: Region = {
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            latitudeDelta: delta,
            longitudeDelta: delta,
          };
          mapRef.current.animateToRegion(region, duration * 2 / 3);
        } else {
          mapRef.current.animateToCoordinate(coordinate, duration * 2 / 3);
        }
      }
    }, duration / 3);
  }, [mapRef]);

  /**
   * Anima el ajuste a coordenadas con padding dinámico
   */
  const animateToFitCoordinates = useCallback((
    coordinates: LatLng[],
    padding: number = 50,
    duration: number = 600
  ) => {
    if (!mapRef.current) return;

    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: {
        top: padding,
        right: padding,
        bottom: padding,
        left: padding,
      },
      animated: true,
    });
  }, [mapRef]);

  /**
   * Anima un marcador con efecto de rebote
   */
  const bounceMarker = useCallback(() => {
    animationManager.bounce(markerScale, 1.3).then(() => {
      animationManager.animate(markerScale, 1, { duration: 200 });
    });
  }, [markerScale]);

  /**
   * Anima la aparición de un marcador
   */
  const fadeInMarker = useCallback(() => {
    markerOpacity.setValue(0);
    markerScale.setValue(0.5);

    animationManager.animateParallel([
      { value: markerOpacity, toValue: 1 },
      { value: markerScale, toValue: 1 },
    ], { duration: 400, easing: 'out' });
  }, [markerOpacity, markerScale]);

  /**
   * Anima la desaparición de un marcador
   */
  const fadeOutMarker = useCallback(async () => {
    await animationManager.animateParallel([
      { value: markerOpacity, toValue: 0 },
      { value: markerScale, toValue: 0.5 },
    ], { duration: 300, easing: 'in' });
  }, [markerOpacity, markerScale]);

  /**
   * Anima el progreso de dibujo de una ruta
   */
  const animateRouteProgress = useCallback((duration: number = 1000) => {
    routeProgress.setValue(0);
    return animationManager.animate(routeProgress, 1, {
      duration,
      easing: 'inOut',
    });
  }, [routeProgress]);

  /**
   * Anima el seguimiento de un conductor en movimiento
   */
  const followDriver = useCallback((
    driverLocation: LatLng,
    smooth: boolean = true,
    duration: number = 1000
  ) => {
    if (!mapRef.current) return;

    if (smooth) {
      // Usar animación suave
      mapRef.current.animateToCoordinate(driverLocation, duration);
    } else {
      // Movimiento instantáneo
      mapRef.current.animateToCoordinate(driverLocation, 0);
    }
  }, [mapRef]);

  /**
   * Obtiene la región actual del mapa
   */
  const getCurrentRegion = useCallback(async (): Promise<Region | null> => {
    // Esta función requeriría acceso a la región actual del mapa
    // En react-native-maps no hay una forma directa, pero se puede mantener en estado
    return null;
  }, []);

  return {
    // Animaciones de cámara
    animateToLocation,
    animateToFitCoordinates,
    followDriver,

    // Animaciones de marcadores
    bounceMarker,
    fadeInMarker,
    fadeOutMarker,
    markerAnimatedStyle: {
      opacity: markerOpacity,
      transform: [{ scale: markerScale }],
    },

    // Animaciones de ruta
    animateRouteProgress,
    routeProgress,

    // Utilidades
    getCurrentRegion,
  };
};
