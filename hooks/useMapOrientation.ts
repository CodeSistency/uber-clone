import Geolocation from "@react-native-community/geolocation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useLocationStore } from "@/store";

import { useMapController } from "./useMapController";

interface MapOrientationConfig {
  autoRotate: boolean;
  bearingOffset: number;
  animationDuration: number;
  minSpeedThreshold: number; // km/h
  updateInterval: number; // ms
}

const DEFAULT_CONFIG: MapOrientationConfig = {
  autoRotate: true,
  bearingOffset: 0,
  animationDuration: 300,
  minSpeedThreshold: 5, // 5 km/h
  updateInterval: 1000, // 1 second
};

interface UseMapOrientationOptions {
  config?: Partial<MapOrientationConfig>;
  enabled?: boolean;
}

export const useMapOrientation = (options: UseMapOrientationOptions = {}) => {
  const { config: userConfig = {}, enabled = true } = options;

  const config = { ...DEFAULT_CONFIG, ...userConfig };
  const controller = useMapController();
  const { userLatitude, userLongitude } = useLocationStore();

  // State
  const [currentBearing, setCurrentBearing] = useState<number>(0);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(
    config.autoRotate,
  );
  const [lastHeading, setLastHeading] = useState<number>(0);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [previousCoords, setPreviousCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Refs
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Utility function to calculate distance between coordinates
  const getDistance = useCallback(
    (
      coord1: { latitude: number; longitude: number },
      coord2: { latitude: number; longitude: number },
    ): number => {
      const R = 6371000; // Earth's radius in meters
      const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
      const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((coord1.latitude * Math.PI) / 180) *
          Math.cos((coord2.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in meters
    },
    [],
  );

  // Calculate bearing from GPS coordinates (advanced algorithm)
  const calculateBearingFromGPS = useCallback(
    (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      // Input validation
      if (
        !isFinite(lat1) ||
        !isFinite(lng1) ||
        !isFinite(lat2) ||
        !isFinite(lng2)
      ) {
        
        return 0;
      }

      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const lat1Rad = (lat1 * Math.PI) / 180;
      const lat2Rad = (lat2 * Math.PI) / 180;

      const y = Math.sin(dLng) * Math.cos(lat2Rad);
      const x =
        Math.cos(lat1Rad) * Math.sin(lat2Rad) -
        Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

      let bearing = (Math.atan2(y, x) * 180) / Math.PI;
      bearing = (bearing + 360) % 360; // Normalize to 0-360

      // Additional validation
      if (!isFinite(bearing) || bearing < 0 || bearing > 360) {
        
        return 0;
      }

      return bearing;
    },
    [],
  );

  // Calculate bearing from movement vector (velocity-based)
  const calculateBearingFromVelocity = useCallback(
    (speed: number, course: number, accuracy?: number): number => {
      // Use GPS course if available and accurate
      if (course !== null && course !== undefined && isFinite(course)) {
        // Validate course range (0-360)
        if (course >= 0 && course <= 360) {
          return course;
        }
      }

      // Fallback: if we have previous position, calculate from movement
      // This would be enhanced with position history tracking

      

      return course || 0;
    },
    [],
  );

  // Smooth bearing transitions to prevent jerky movements
  const smoothBearingTransition = useCallback(
    (
      currentBearing: number,
      targetBearing: number,
      smoothingFactor: number = 0.3,
    ): number => {
      // Handle bearing wraparound (e.g., 350° to 10°)
      let bearingDiff = targetBearing - currentBearing;

      if (Math.abs(bearingDiff) > 180) {
        if (targetBearing > currentBearing) {
          bearingDiff = targetBearing - currentBearing - 360;
        } else {
          bearingDiff = targetBearing - currentBearing + 360;
        }
      }

      // Apply smoothing
      const smoothedBearing = currentBearing + bearingDiff * smoothingFactor;
      return ((smoothedBearing % 360) + 360) % 360; // Normalize to 0-360
    },
    [],
  );

  // Advanced bearing calculation with multiple fallbacks
  const calculateOptimalBearing = useCallback(
    (
      gpsData: {
        heading?: number;
        speed?: number;
        accuracy?: number;
        coords?: { latitude: number; longitude: number };
      },
      previousCoords?: { latitude: number; longitude: number },
    ): number => {
      const { heading, speed, accuracy, coords } = gpsData;

      // Priority 1: Direct GPS heading (most accurate)
      if (
        heading !== null &&
        heading !== undefined &&
        accuracy &&
        accuracy < 50
      ) {
        return calculateBearingFromVelocity(speed || 0, heading, accuracy);
      }

      // Priority 2: Calculate from coordinate changes
      if (
        coords &&
        previousCoords &&
        speed &&
        speed > config.minSpeedThreshold
      ) {
        const bearing = calculateBearingFromGPS(
          previousCoords.latitude,
          previousCoords.longitude,
          coords.latitude,
          coords.longitude,
        );

        // Only use if movement is significant
        const distance = getDistance(previousCoords, coords);
        if (distance > 10) {
          // 10 meters minimum movement
          return bearing;
        }
      }

      // Priority 3: Fallback to last known bearing
      return lastHeading;
    },
    [
      calculateBearingFromGPS,
      calculateBearingFromVelocity,
      config.minSpeedThreshold,
      lastHeading,
      getDistance,
    ],
  );

  // Update map bearing with smooth animation
  const updateMapBearing = useCallback(
    (
      bearing: number,
      options?: {
        animated?: boolean;
        duration?: number;
        easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
      },
    ) => {
      if (!enabled) return;

      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateRef.current;

      // Throttle updates to prevent excessive animations
      if (timeSinceLastUpdate < (options?.duration || config.animationDuration))
        return;

      lastUpdateRef.current = now;

      // Apply bearing offset and normalize
      const adjustedBearing = (bearing + config.bearingOffset) % 360;

      setCurrentBearing(adjustedBearing);

      // Only update camera if auto-rotating or manual bearing set
      if (isAutoRotating || options) {
        // Use react-native-maps animateToRegion for smooth transitions
        const camera = {
          center: {
            latitude: userLatitude || 0,
            longitude: userLongitude || 0,
          },
          heading: adjustedBearing,
          pitch: 0, // Keep map flat for navigation
          zoom: 18, // Close zoom for navigation
          altitude: 1000, // Fixed altitude for consistent view
        };

        // Use controller to animate camera changes
        if (controller.setCamera) {
          controller.setCamera(camera);
        }

        
      }
    },
    [
      controller,
      isAutoRotating,
      enabled,
      config.bearingOffset,
      config.animationDuration,
      userLatitude,
      userLongitude,
      currentSpeed,
    ],
  );

  // Advanced animation system with multiple easing options
  const animateToBearing = useCallback(
    (
      targetBearing: number,
      animationConfig?: {
        duration?: number;
        easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
        steps?: number;
      },
    ) => {
      const config = {
        duration: animationConfig?.duration || 300,
        easing: animationConfig?.easing || "ease-out",
        steps: animationConfig?.steps || 10,
      };

      const startBearing = currentBearing;
      const bearingDiff = targetBearing - startBearing;
      const normalizedDiff = ((bearingDiff % 360) + 360) % 360;
      const shortestDiff =
        normalizedDiff > 180 ? normalizedDiff - 360 : normalizedDiff;

      const stepDuration = config.duration / config.steps;
      let currentStep = 0;

      const animateStep = () => {
        currentStep++;
        const progress = currentStep / config.steps;

        // Apply easing function
        let easedProgress: number;
        switch (config.easing) {
          case "ease-in":
            easedProgress = progress * progress;
            break;
          case "ease-out":
            easedProgress = 1 - Math.pow(1 - progress, 2);
            break;
          case "ease-in-out":
            easedProgress =
              progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            break;
          default: // linear
            easedProgress = progress;
        }

        const currentBearingValue = startBearing + shortestDiff * easedProgress;
        const normalizedBearing = ((currentBearingValue % 360) + 360) % 360;

        updateMapBearing(normalizedBearing, {
          animated: false, // Prevent recursive animation
          duration: stepDuration,
        });

        if (currentStep < config.steps) {
          setTimeout(animateStep, stepDuration);
        }
      };

      animateStep();

      
    },
    [currentBearing, updateMapBearing],
  );

  // Start GPS watching for orientation
  const startOrientationTracking = useCallback(() => {
    if (!enabled) return;

    

    // Configure high accuracy for better heading data
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: "whenInUse",
      enableBackgroundLocationUpdates: true,
      locationProvider: "auto",
    });

    watchIdRef.current = Geolocation.watchPosition(
      (position) => {
        const { heading, speed, accuracy, latitude, longitude } =
          position.coords;
        const speedKmh = (speed || 0) * 3.6; // Convert m/s to km/h

        setCurrentSpeed(speedKmh);

        // Only update bearing if moving at minimum speed
        if (speedKmh >= config.minSpeedThreshold) {
          // Use advanced bearing calculation with multiple fallbacks
          const gpsData = {
            heading: heading ?? undefined,
            speed: speedKmh,
            accuracy,
            coords: { latitude, longitude },
          };

          const optimalBearing = calculateOptimalBearing(
            gpsData,
            previousCoords || undefined,
          );

          // Apply smooth transition to prevent jerky movements
          const smoothedBearing = smoothBearingTransition(
            lastHeading,
            optimalBearing,
            0.3,
          );

          setLastHeading(smoothedBearing);
          updateMapBearing(smoothedBearing);

          // Update previous coordinates for next calculation
          setPreviousCoords({ latitude, longitude });

          
        }
      },
      (error) => {
        
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 5, // Update every 5 meters
        interval: config.updateInterval,
        fastestInterval: config.updateInterval / 2,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  }, [
    enabled,
    config.minSpeedThreshold,
    config.updateInterval,
    lastHeading,
    updateMapBearing,
    calculateOptimalBearing,
    previousCoords,
    smoothBearingTransition,
  ]);

  // Stop GPS watching
  const stopOrientationTracking = useCallback(() => {
    

    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Toggle auto-rotation
  const toggleAutoRotate = useCallback(() => {
    const newState = !isAutoRotating;
    setIsAutoRotating(newState);

    if (newState) {
      startOrientationTracking();
    } else {
      stopOrientationTracking();
      // Reset to north-up
      updateMapBearing(0);
    }

    
  }, [
    isAutoRotating,
    startOrientationTracking,
    stopOrientationTracking,
    updateMapBearing,
  ]);

  // Set manual bearing (for north-up mode)
  const setManualBearing = useCallback(
    (bearing: number) => {
      if (isAutoRotating) return; // Ignore if auto-rotating

      setCurrentBearing(bearing);
      updateMapBearing(bearing);
    },
    [isAutoRotating, updateMapBearing],
  );

  // Lifecycle
  useEffect(() => {
    if (enabled && isAutoRotating) {
      startOrientationTracking();
    }

    return () => {
      stopOrientationTracking();
    };
  }, [
    enabled,
    isAutoRotating,
    startOrientationTracking,
    stopOrientationTracking,
  ]);

  // Public API
  return {
    // State
    currentBearing,
    isAutoRotating,
    currentSpeed,
    previousCoords,

    // Methods
    toggleAutoRotate,
    setManualBearing,
    startOrientationTracking,
    stopOrientationTracking,
    animateToBearing, // Nueva función de animación avanzada
    updateMapBearing, // Para acceso directo

    // Utility functions (exposed for advanced usage)
    calculateBearingFromGPS,
    calculateBearingFromVelocity,
    smoothBearingTransition,
    calculateOptimalBearing,

    // Config
    config,
  };
};
