import { useCallback, useEffect, useRef, useState } from "react";
import { RoutePrediction, getRoutePredictor } from "@/lib/routePredictor";
import { useRealtimeStore } from "@/store";

interface UseRoutePredictionConfig {
  enabled?: boolean;
  updateInterval?: number; // Default: 2000ms
  minSpeedThreshold?: number; // Default: 5 km/h
  minAccuracy?: number; // Default: 50 meters
}

const DEFAULT_CONFIG: Required<UseRoutePredictionConfig> = {
  enabled: true,
  updateInterval: 2000,
  minSpeedThreshold: 5,
  minAccuracy: 50,
};

export const useRoutePrediction = (config: UseRoutePredictionConfig = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // State
  const [currentPrediction, setCurrentPrediction] =
    useState<RoutePrediction | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);

  // Refs
  const predictorRef = useRef(getRoutePredictor());
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Get current driver location from store
  const driverLocation = useRealtimeStore((state) => state.driverLocation);

  // Update predictor with current driver data
  const updatePredictorState = useCallback(() => {
    if (!driverLocation || !finalConfig.enabled) return;

    const { latitude, longitude, accuracy, speed, bearing } = driverLocation;

    // Set default values for optional properties
    const finalSpeed = speed ?? 0;
    const finalBearing = bearing ?? 0;

    // Validate data quality
    if (accuracy && accuracy > finalConfig.minAccuracy) {
      
      return;
    }

    if (finalSpeed < finalConfig.minSpeedThreshold) {
      
      return;
    }

    // Update predictor with current state
    predictorRef.current.updateCurrentState(
      { latitude, longitude },
      finalSpeed,
      finalBearing,
    );

    
  }, [
    driverLocation,
    finalConfig.enabled,
    finalConfig.minAccuracy,
    finalConfig.minSpeedThreshold,
  ]);

  // Generate new prediction
  const generatePrediction =
    useCallback(async (): Promise<RoutePrediction | null> => {
      if (!finalConfig.enabled) return null;

      try {
        setIsPredicting(true);

        // Update predictor state first
        updatePredictorState();

        // Generate prediction
        const prediction = predictorRef.current.generatePrediction();

        if (prediction) {
          setCurrentPrediction(prediction);
          setLastUpdateTime(Date.now());

          
        } else {
          
        }

        return prediction;
      } catch (error) {
        
        return null;
      } finally {
        setIsPredicting(false);
      }
    }, [finalConfig.enabled, updatePredictorState]);

  // Schedule next prediction update
  const scheduleNextUpdate = useCallback(() => {
    if (!finalConfig.enabled || !isMountedRef.current) return;

    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Schedule next update
    updateTimeoutRef.current = setTimeout(async () => {
      await generatePrediction();
      scheduleNextUpdate(); // Schedule next one
    }, finalConfig.updateInterval);
  }, [finalConfig.enabled, finalConfig.updateInterval, generatePrediction]);

  // Force refresh prediction
  const refreshPrediction = useCallback(async () => {
    
    return await generatePrediction();
  }, [generatePrediction]);

  // Clear current prediction
  const clearPrediction = useCallback(() => {
    setCurrentPrediction(null);
    setLastUpdateTime(0);
    
  }, []);

  // Initialize and start prediction loop
  useEffect(() => {
    if (!finalConfig.enabled) return;

    

    // Initial prediction
    generatePrediction();

    // Start update loop
    scheduleNextUpdate();

    return () => {
      // Cleanup
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      isMountedRef.current = false;
      
    };
  }, [finalConfig.enabled, generatePrediction, scheduleNextUpdate]);

  // Update prediction when driver location changes significantly
  useEffect(() => {
    if (!driverLocation || !finalConfig.enabled) return;

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime;

    // Only update if enough time has passed and we have valid data
    if (timeSinceLastUpdate > finalConfig.updateInterval / 2) {
      // Check if this is a significant location change
      const shouldUpdate = true; // Could add more sophisticated logic here

      if (shouldUpdate) {
        generatePrediction();
      }
    }
  }, [
    driverLocation,
    finalConfig.enabled,
    lastUpdateTime,
    finalConfig.updateInterval,
    generatePrediction,
  ]);

  // Public API
  return {
    // State
    prediction: currentPrediction,
    isPredicting,
    lastUpdateTime,

    // Actions
    refreshPrediction,
    clearPrediction,

    // Utilities
    getPredictorStats: () => predictorRef.current.getCacheStats(),
    resetPredictor: () => predictorRef.current.reset(),

    // Configuration
    config: finalConfig,
  };
};
