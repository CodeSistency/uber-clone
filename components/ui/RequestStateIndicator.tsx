import React, { useEffect, useState } from "react";
import { View, Text, Animated } from "react-native";

import {
  RequestState,
  SmartRequestManager,
  smartRequestManager,
} from "@/lib/RequestStateManager";

interface RequestStateIndicatorProps {
  manager?: SmartRequestManager;
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const RequestStateIndicator: React.FC<RequestStateIndicatorProps> = ({
  manager = smartRequestManager,
  showLabels = true,
  size = "md",
  className = "",
}) => {
  const [currentState, setCurrentState] = useState<RequestState>(
    manager.getCurrentState(),
  );
  const [pulseAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Suscribirse a cambios de estado
    const handleStateChange = (newState: RequestState) => {
      setCurrentState(newState);
      animateStateChange(newState);
    };

    manager.onStateChange(handleStateChange);

    return () => {
      manager.offStateChange(handleStateChange);
    };
  }, [manager]);

  const animateStateChange = (state: RequestState) => {
    // Reset animations
    pulseAnim.setValue(1);
    fadeAnim.setValue(1);

    switch (state) {
      case RequestState.NOTIFIED:
        // Pulse animation for notifications
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.3,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
        ).start();
        break;

      case RequestState.LOADING:
        // Fade animation for loading
        Animated.loop(
          Animated.sequence([
            Animated.timing(fadeAnim, {
              toValue: 0.5,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ).start();
        break;

      case RequestState.ERROR:
        // Error shake animation
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
        break;
    }
  };

  const getStateConfig = (state: RequestState) => {
    const configs = {
      [RequestState.IDLE]: {
        color: "bg-gray-400",
        icon: "⏸️",
        label: "Inactivo",
        description: "Sin solicitudes activas",
      },
      [RequestState.NOTIFIED]: {
        color: "bg-blue-500",
        icon: "🔔",
        label: "Nueva Solicitud",
        description: "Toca para ver detalles",
      },
      [RequestState.LOADING]: {
        color: "bg-yellow-500",
        icon: "⏳",
        label: "Cargando",
        description: "Obteniendo datos...",
      },
      [RequestState.LOADED]: {
        color: "bg-green-500",
        icon: "✅",
        label: "Listo",
        description: "Datos disponibles",
      },
      [RequestState.EXPIRED]: {
        color: "bg-orange-500",
        icon: "⏰",
        label: "Expirado",
        description: "Solicitud expiró",
      },
      [RequestState.OFFLINE]: {
        color: "bg-red-500",
        icon: "📶",
        label: "Sin Conexión",
        description: "Revisa tu conexión",
      },
      [RequestState.ERROR]: {
        color: "bg-red-600",
        icon: "❌",
        label: "Error",
        description: "Error al cargar",
      },
    };

    return configs[state] || configs[RequestState.IDLE];
  };

  const config = getStateConfig(currentState);
  const sizeStyles = {
    sm: { icon: "text-lg", indicator: "w-8 h-8", container: "px-2 py-1" },
    md: { icon: "text-2xl", indicator: "w-12 h-12", container: "px-3 py-2" },
    lg: { icon: "text-4xl", indicator: "w-16 h-16", container: "px-4 py-3" },
  };

  const styles = sizeStyles[size];

  return (
    <Animated.View
      className={`flex-row items-center ${styles.container} ${className}`}
      style={{
        opacity: fadeAnim,
        transform: [{ scale: pulseAnim }],
      }}
    >
      {/* Indicador circular */}
      <View
        className={`
        ${styles.indicator}
        ${config.color}
        rounded-full
        items-center justify-center
        shadow-lg
        border-2 border-white
      `}
      >
        <Text className={styles.icon}>{config.icon}</Text>
      </View>

      {/* Labels opcionales */}
      {showLabels && (
        <View className="ml-3 flex-1">
          <Text className="font-JakartaBold text-gray-800 text-sm">
            {config.label}
          </Text>
          <Text className="font-Jakarta text-gray-600 text-xs">
            {config.description}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

// Hook personalizado para usar el state indicator
export const useRequestStateIndicator = (manager?: SmartRequestManager) => {
  const [state, setState] = useState<RequestState>(
    manager?.getCurrentState() || RequestState.IDLE,
  );

  useEffect(() => {
    const mgr = manager || smartRequestManager;
    const handleStateChange = (newState: RequestState) => {
      setState(newState);
    };

    mgr.onStateChange(handleStateChange);

    return () => {
      mgr.offStateChange(handleStateChange);
    };
  }, [manager]);

  return state;
};

// Componente de barra de progreso para estados con tiempo
interface RequestProgressBarProps {
  manager?: SmartRequestManager;
  showTimeRemaining?: boolean;
  className?: string;
}

export const RequestProgressBar: React.FC<RequestProgressBarProps> = ({
  manager = smartRequestManager,
  showTimeRemaining = true,
  className = "",
}) => {
  const [stats, setStats] = useState(manager.getStats());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateStats = () => {
      const newStats = manager.getStats();
      setStats(newStats);

      // Calcular progreso basado en el estado
      switch (newStats.currentState) {
        case RequestState.NOTIFIED:
          // Progreso basado en tiempo restante hasta expirar
          const notifiedTime = 30000; // 30 segundos
          const remaining = Math.max(
            0,
            notifiedTime - newStats.timeInCurrentState,
          );
          setProgress((remaining / notifiedTime) * 100);
          break;

        case RequestState.LOADING:
          // Progreso indefinido (animado)
          setProgress(50 + Math.sin(Date.now() / 200) * 20);
          break;

        default:
          setProgress(100);
      }
    };

    const interval = setInterval(updateStats, 100);
    updateStats(); // Initial call

    return () => clearInterval(interval);
  }, [manager]);

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <View className={`bg-gray-100 rounded-full h-2 ${className}`}>
      <View
        className={`h-2 rounded-full transition-all duration-300 ${
          stats.currentState === RequestState.NOTIFIED
            ? "bg-blue-500"
            : stats.currentState === RequestState.LOADING
              ? "bg-yellow-500"
              : stats.currentState === RequestState.LOADED
                ? "bg-green-500"
                : "bg-gray-400"
        }`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />

      {showTimeRemaining && stats.timeInCurrentState > 0 && (
        <Text className="text-xs text-gray-600 mt-1 text-center">
          {formatTime(stats.timeInCurrentState)}
        </Text>
      )}
    </View>
  );
};

export default RequestStateIndicator;
