import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Polyline, LatLng } from "react-native-maps";

import { RoutePrediction } from "@/lib/routePredictor";
import { useRealtimeStore } from "@/store";

interface RoutePredictionOverlayProps {
  prediction: RoutePrediction | null;
  color?: string; // Default: '#00FF88' (neón verde)
  width?: number; // Default: 3
  opacity?: number; // Default: 0.7
  dashPattern?: number[]; // Default: [10, 10] for dashed line
  animated?: boolean; // Default: true
  showConfidenceIndicators?: boolean; // Default: false
  fadeInDuration?: number; // Default: 300ms
}

const DEFAULT_PROPS = {
  color: "#00FF88", // Neón verde para predicciones
  width: 3,
  opacity: 0.7,
  dashPattern: [10, 10], // Dashed pattern
  animated: true,
  showConfidenceIndicators: false,
  fadeInDuration: 300,
};

export const RoutePredictionOverlay: React.FC<RoutePredictionOverlayProps> = ({
  prediction,
  ...props
}) => {
  const config = { ...DEFAULT_PROPS, ...props };
  const [isVisible, setIsVisible] = useState(false);
  const [animatedOpacity, setAnimatedOpacity] = useState(0);

  // Handle fade in animation
  useEffect(() => {
    if (prediction && config.animated) {
      setIsVisible(true);
      // Simple fade in (could be enhanced with react-native-reanimated)
      const fadeIn = () => {
        setAnimatedOpacity((prev) => {
          const next = prev + 0.1;
          if (next < config.opacity) {
            setTimeout(fadeIn, config.fadeInDuration / 10);
            return next;
          }
          return config.opacity;
        });
      };

      setAnimatedOpacity(0);
      setTimeout(fadeIn, 50);
    } else if (!prediction) {
      setIsVisible(false);
      setAnimatedOpacity(0);
    }
  }, [prediction, config.animated, config.opacity, config.fadeInDuration]);

  // Don't render if no prediction or not visible
  if (!prediction || !isVisible) {
    return null;
  }

  // Convert prediction points to LatLng array
  const coordinates: LatLng[] = prediction.points.map((point) => ({
    latitude: point.latitude,
    longitude: point.longitude,
  }));

  // Create confidence-based styling
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return "#00FF88"; // High confidence - bright green
    if (confidence >= 0.6) return "#88FF00"; // Medium confidence - yellow-green
    if (confidence >= 0.4) return "#FFFF00"; // Low confidence - yellow
    return "#FF8800"; // Very low confidence - orange
  };

  const getConfidenceWidth = (confidence: number): number => {
    // Width varies from 1 to 5 based on confidence
    return Math.max(1, Math.min(5, confidence * 5));
  };

  // Render multiple polylines for confidence visualization
  const renderConfidenceSegments = () => {
    if (!config.showConfidenceIndicators) {
      return (
        <Polyline
          coordinates={coordinates}
          strokeColor={config.color}
          strokeWidth={config.width}
          lineDashPattern={config.dashPattern}
        />
      );
    }

    // Render segments with different colors based on confidence
    const segments: JSX.Element[] = [];

    for (let i = 0; i < prediction.points.length - 1; i++) {
      const point = prediction.points[i];
      const nextPoint = prediction.points[i + 1];

      const segmentColor = getConfidenceColor(point.confidence);
      const segmentWidth = getConfidenceWidth(point.confidence);

      segments.push(
        <Polyline
          key={`prediction-segment-${i}`}
          coordinates={[
            { latitude: point.latitude, longitude: point.longitude },
            { latitude: nextPoint.latitude, longitude: nextPoint.longitude },
          ]}
          strokeColor={segmentColor}
          strokeWidth={segmentWidth}
          lineDashPattern={config.dashPattern}
          zIndex={2}
        />,
      );
    }

    return segments;
  };

  // Render prediction start/end markers
  const renderPredictionMarkers = () => {
    if (!prediction.points.length) return null;

    const startPoint = prediction.points[0];
    const endPoint = prediction.points[prediction.points.length - 1];

    return (
      <>
        {/* Start marker - small circle */}
        <Polyline
          coordinates={[
            { latitude: startPoint.latitude, longitude: startPoint.longitude },
            { latitude: startPoint.latitude, longitude: startPoint.longitude },
          ]}
          strokeColor={config.color}
          strokeWidth={8}
          zIndex={3}
        />

        {/* End marker - arrow or circle */}
        <Polyline
          coordinates={[
            { latitude: endPoint.latitude, longitude: endPoint.longitude },
            { latitude: endPoint.latitude, longitude: endPoint.longitude },
          ]}
          strokeColor={config.color}
          strokeWidth={6}
          zIndex={3}
        />
      </>
    );
  };

  // Calculate prediction stats for logging
  const predictionStats = {
    points: prediction.points.length,
    confidence: prediction.confidence.toFixed(2),
    distance: `${prediction.distance.toFixed(0)}m`,
    duration: `${prediction.duration.toFixed(1)}s`,
  };

  

  return (
    <View pointerEvents="none">
      {/* Main prediction polyline */}
      {renderConfidenceSegments()}

      {/* Start/End markers */}
      {renderPredictionMarkers()}

      {/* Debug info overlay (only in development) */}
      {__DEV__ && (
        <View
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: "rgba(0,0,0,0.7)",
            padding: 5,
            borderRadius: 5,
          }}
        >
          {/* Could add debug text here if needed */}
        </View>
      )}
    </View>
  );
};

export default RoutePredictionOverlay;
