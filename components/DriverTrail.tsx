import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { View } from "react-native";
import { Polyline } from "react-native-maps";

import { useRealtimeStore } from "@/store";

interface TrailPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  speed?: number;
}

interface DriverTrailProps {
  driverId?: string;
  maxPoints?: number; // Default: 100
  fadeTime?: number; // Default: 30 seconds
  color?: string; // Default: '#FFE014' (neón amarillo)
  width?: number; // Default: 4
  opacity?: number; // Default: 0.8
  minDistance?: number; // Minimum distance between points (meters)
  minTimeInterval?: number; // Minimum time between points (ms)
}

const DEFAULT_CONFIG: Required<Omit<DriverTrailProps, "driverId">> = {
  maxPoints: 100,
  fadeTime: 30000, // 30 seconds
  color: "#FFE014", // Neón amarillo del tema
  width: 4,
  opacity: 0.8,
  minDistance: 10, // 10 meters
  minTimeInterval: 2000, // 2 seconds
};

const DriverTrail: React.FC<DriverTrailProps> = ({
  driverId,
  ...userConfig
}) => {
  const config = { ...DEFAULT_CONFIG, ...userConfig };

  // Get driver location from realtime store
  const driverLocation = useRealtimeStore((state) => state.driverLocation);

  // State for trail points
  const [trailPoints, setTrailPoints] = useState<TrailPoint[]>([]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = useMemo(
    () =>
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

  // Performance optimization: Use refs for throttling
  const lastAddTimeRef = useRef<number>(0);
  const lastLocationRef = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Add new point to trail with advanced throttling and distance filtering
  const addTrailPoint = useCallback(
    (location: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      speed?: number;
    }) => {
      const now = Date.now();
      const timeSinceLastAdd = now - lastAddTimeRef.current;

      // Basic time throttling
      if (timeSinceLastAdd < config.minTimeInterval) {
        return; // Skip if too soon
      }

      // Distance-based throttling (don't add points if barely moved)
      if (lastLocationRef.current) {
        const distance = calculateDistance(lastLocationRef.current, location);
        if (distance < config.minDistance) {
          return; // Skip if didn't move enough
        }
      }

      const newPoint: TrailPoint = {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: now,
        accuracy: location.accuracy,
        speed: location.speed,
      };

      // Update refs
      lastAddTimeRef.current = now;
      lastLocationRef.current = location;

      setTrailPoints((prevPoints) => {
        // If no previous points, add the first one
        if (prevPoints.length === 0) {
          
          return [newPoint];
        }

        // Add new point and limit array size
        const newTrail = [...prevPoints, newPoint];

        // Remove oldest points if exceeding maxPoints (more efficient)
        if (newTrail.length > config.maxPoints) {
          newTrail.splice(0, newTrail.length - config.maxPoints);
          
        }

        // Log only occasionally to reduce console spam
        if (newTrail.length % 10 === 0) {
          
        }

        return newTrail;
      });
    },
    [
      config.minTimeInterval,
      config.minDistance,
      config.maxPoints,
      calculateDistance,
    ],
  );

  // Update trail when driver location changes
  useEffect(() => {
    if (driverLocation && driverLocation.latitude && driverLocation.longitude) {
      // Validate coordinates are reasonable
      if (
        Math.abs(driverLocation.latitude) > 90 ||
        Math.abs(driverLocation.longitude) > 180
      ) {
        
        return;
      }

      // Only add point if we have meaningful movement
      addTrailPoint({
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        accuracy: driverLocation.accuracy,
        speed: driverLocation.speed ?? 0,
      });
    }
  }, [driverLocation, addTrailPoint]);

  // Advanced cleanup system: Remove old points and manage memory
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();

      setTrailPoints((prevPoints) => {
        let cleanedPoints = prevPoints;

        // 1. Remove points older than fadeTime
        const timeFiltered = cleanedPoints.filter(
          (point) => now - point.timestamp < config.fadeTime,
        );

        // 2. If still too many points, remove oldest ones (keep maxPoints)
        let finalPoints = timeFiltered;
        if (finalPoints.length > config.maxPoints) {
          // Sort by timestamp (oldest first) and keep only the most recent
          finalPoints.sort((a, b) => a.timestamp - b.timestamp);
          finalPoints = finalPoints.slice(-config.maxPoints);
          
        }

        // 3. Remove points with poor accuracy (if too many points)
        if (finalPoints.length > config.maxPoints * 0.8) {
          finalPoints = finalPoints.filter(
            (point) => !point.accuracy || point.accuracy < 100, // Keep only accurate points
          );
        }

        const removedCount = prevPoints.length - finalPoints.length;
        if (removedCount > 0) {
          
        }

        return finalPoints;
      });
    }, 15000); // Check every 15 seconds (less frequent for better performance)

    return () => clearInterval(cleanupInterval);
  }, [config.fadeTime, config.maxPoints]);

  // Create gradient opacity for trail (newer points more opaque)
  const trailCoordinates = useMemo(() => {
    if (trailPoints.length < 2) return [];

    return trailPoints.map((point) => ({
      latitude: point.latitude,
      longitude: point.longitude,
    }));
  }, [trailPoints]);

  // Don't render if no trail points
  if (trailCoordinates.length < 2) {
    return null;
  }

  

  return (
    <View pointerEvents="none">
      {/* Main trail polyline with neon effect */}
      <Polyline
        coordinates={trailCoordinates}
        strokeColor={config.color}
        strokeWidth={config.width}
        lineDashPattern={[0]} // Solid line
        geodesic={true}
        zIndex={1}
      />

      {/* Glow effect - slightly wider, more transparent */}
      <Polyline
        coordinates={trailCoordinates}
        strokeColor={config.color}
        strokeWidth={config.width * 2.5} // Wider for glow
        lineDashPattern={[0]}
        geodesic={true}
        zIndex={0}
        // Apply opacity for glow effect
        {...({ opacity: config.opacity * 0.3 } as any)}
      />

      {/* Inner core - more opaque */}
      <Polyline
        coordinates={trailCoordinates}
        strokeColor={config.color}
        strokeWidth={config.width * 0.8} // Slightly thinner core
        lineDashPattern={[0]}
        geodesic={true}
        zIndex={2}
        // Apply full opacity for core
        {...({ opacity: config.opacity } as any)}
      />
    </View>
  );
};

export default DriverTrail;
