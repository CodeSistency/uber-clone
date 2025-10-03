import { useRouter } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";

import { Button, Card, Badge, Glass } from "@/components/ui";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useRealtimeStore, useDevStore, useNotificationStore } from "@/store";
import { FLOW_STEPS } from "@/lib/unified-flow/constants";

// Componente para manejar errores en el flujo
export const ErrorBoundaryStep: React.FC<{ error: string }> = ({ error }) => {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center px-6">
      <Text className="text-6xl mb-6">⚠️</Text>
      <Text className="font-JakartaBold text-xl text-red-600 mb-3 text-center">
        Error en el Flujo
      </Text>
      <Text className="font-Jakarta text-base text-gray-600 text-center mb-4">
        {error}
      </Text>
      <Button
        variant="danger"
        title="Volver al Inicio"
        onPress={() => router.replace("/(root)/(tabs)/home")}
        className="px-6 py-3"
      />
    </View>
  );
};

// Componente para transiciones de carga
export const LoadingTransition: React.FC<{ message: string }> = ({
  message,
}) => {
  return (
    <View className="flex-1 justify-center items-center bg-white/80">
      <ActivityIndicator size="large" color="#0286FF" />
      <Text className="mt-4 font-JakartaMedium text-gray-700">{message}</Text>
    </View>
  );
};

// Componente para mostrar estado de WebSocket
export const WebSocketStatus: React.FC = () => {
  const realtime = useRealtimeStore();

  const getStatusVariant = (): "success" | "danger" => {
    return realtime.connectionStatus.websocketConnected ? "success" : "danger";
  };

  const getStatusText = () => {
    return realtime.connectionStatus.websocketConnected
      ? "Connected"
      : "Disconnected";
  };

  return (
    <View className="flex-row items-center space-x-2">
      <Badge
        variant={getStatusVariant()}
        label="WS"
        className="w-6 h-6 rounded-full items-center justify-center p-0"
      />
      <Text className="text-white text-xs font-JakartaMedium">
        {getStatusText()}
      </Text>
    </View>
  );
};

// Componente para configuración de notificaciones
export const NotificationSettings: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const notificationStore = useNotificationStore();

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // Aquí se implementaría la lógica real para habilitar/deshabilitar notificaciones
    console.log(
      `Notifications ${!notificationsEnabled ? "enabled" : "disabled"}`,
    );
  };

  return (
    <View className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
      <Text className="font-JakartaBold text-xs text-gray-700 dark:text-gray-200 mb-2">
        🔔 Notificaciones Push
      </Text>
      <Button
        variant={notificationsEnabled ? "success" : "secondary"}
        title={`Push: ${notificationsEnabled ? "ON" : "OFF"}`}
        onPress={toggleNotifications}
        className="px-3 py-2"
      />
    </View>
  );
};

// Componente para selector de pagos venezolanos
export const VenezuelanPaymentSelector: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = React.useState<string>("");

  const paymentMethods = [
    {
      id: "cash",
      label: "💵 Efectivo",
      description: "Sin referencia bancaria",
    },
    {
      id: "transfer",
      label: "🏦 Transferencia",
      description: "Referencia 20 dígitos",
    },
    {
      id: "pago_movil",
      label: "📱 Pago Móvil",
      description: "Referencia 20 dígitos",
    },
    { id: "zelle", label: "💳 Zelle", description: "Confirmación directa" },
    { id: "bitcoin", label: "₿ Bitcoin", description: "Dirección de wallet" },
  ];

  return (
    <View className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
      <Text className="font-JakartaBold text-xs text-gray-700 dark:text-gray-200 mb-2">
        💰 Sistema de Pagos Venezolano
      </Text>
      <View className="space-y-1">
        {paymentMethods.map((method) => (
          <Button
            key={method.id}
            variant={selectedMethod === method.id ? "primary" : "outline"}
            title={`${method.label}\n${method.description}`}
            onPress={() => setSelectedMethod(method.id)}
            className="p-2 text-left"
          />
        ))}
      </View>
    </View>
  );
};

// Componente para controles del flujo de conductor
export const DriverFlowControls: React.FC = () => {
  const { startWithDriverStep } = useMapFlow();

  const driverStates = [
    {
      label: "Recibir Solicitud",
      step: FLOW_STEPS.DRIVER_TRANSPORT_RECIBIR_SOLICITUD,
      color: "bg-blue-500",
      icon: "📨",
    },
    {
      label: "En Camino al Origen",
      step: FLOW_STEPS.DRIVER_TRANSPORT_EN_CAMINO_ORIGEN,
      color: "bg-green-500",
      icon: "🚗",
    },
    {
      label: "En Origen",
      step: FLOW_STEPS.DRIVER_TRANSPORT_EN_ORIGEN,
      color: "bg-purple-500",
      icon: "📍",
    },
    {
      label: "En Viaje",
      step: FLOW_STEPS.DRIVER_TRANSPORT_EN_VIAJE,
      color: "bg-orange-500",
      icon: "🏁",
    },
    {
      label: "Finalizar Viaje",
      step: FLOW_STEPS.DRIVER_TRANSPORT_COMPLETAR_VIAJE,
      color: "bg-red-500",
      icon: "✅",
    },
  ];

  return (
    <View className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
      <Text className="font-JakartaBold text-xs text-gray-700 dark:text-gray-200 mb-2">
        👨‍🚗 Estados de Conductor
      </Text>
      <View className="space-y-1">
        {driverStates.map((state, index) => (
          <Button
            key={index}
            variant="primary"
            title={`${state.icon} ${state.label}`}
            onPress={() => startWithDriverStep(state.step)}
            className={`px-3 py-2 ${state.color}`}
          />
        ))}
      </View>
    </View>
  );
};

// Componente para métricas de performance
export const PerformanceMetrics: React.FC = () => {
  const [renderTime, setRenderTime] = React.useState(0);
  const [memoryUsage, setMemoryUsage] = React.useState(0);

  React.useEffect(() => {
    const startTime = Date.now();

    // Simular medición de memoria (en una app real usarías una librería específica)
    const interval = setInterval(() => {
      setMemoryUsage(Math.round(Math.random() * 30 + 20)); // Simulación
    }, 2000);

    return () => {
      const endTime = Date.now();
      setRenderTime(endTime - startTime);
      clearInterval(interval);
    };
  });

  return (
    <View className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
      <Text className="font-JakartaBold text-xs text-gray-700 dark:text-gray-200 mb-2">
        📊 Performance Metrics
      </Text>
      <View className="flex-row space-x-4">
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          Render: {renderTime}ms
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          Memory: {memoryUsage}MB
        </Text>
      </View>
    </View>
  );
};

// Componente para mostrar estado de desarrollo
export const DevModeIndicator: React.FC = () => {
  const devStore = useDevStore();

  return (
    <View className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
      <Text className="font-JakartaBold text-xs text-gray-700 dark:text-gray-200 mb-2 uppercase tracking-wide">
        Developer Mode
      </Text>
      <View className="flex-row space-x-2">
        <Button
          variant={devStore.developerMode ? "success" : "secondary"}
          title={`Dev: ${devStore.developerMode ? "ON" : "OFF"}`}
          onPress={() => devStore.setDeveloperMode(!devStore.developerMode)}
          className="flex-1 px-3 py-2"
        />
        <Button
          variant={devStore.networkBypass ? "success" : "secondary"}
          title={`Net: ${devStore.networkBypass ? "MOCK" : "LIVE"}`}
          onPress={() => devStore.setNetworkBypass(!devStore.networkBypass)}
          className="flex-1 px-3 py-2"
        />
        <Button
          variant={devStore.wsBypass ? "success" : "secondary"}
          title={`WS: ${devStore.wsBypass ? "OFF" : "ON"}`}
          onPress={() => devStore.setWsBypass(!devStore.wsBypass)}
          className="flex-1 px-3 py-2"
        />
      </View>
    </View>
  );
};

// Componente para controles de ride status
export const RideStatusControls: React.FC = () => {
  const realtime = useRealtimeStore();

  const rideStatuses = [
    { status: "accepted", label: "Accept", color: "bg-blue-500" },
    { status: "arriving", label: "Arriving", color: "bg-blue-400" },
    { status: "arrived", label: "Arrived", color: "bg-blue-600" },
    { status: "in_progress", label: "Start", color: "bg-green-500" },
    { status: "completed", label: "Complete", color: "bg-green-600" },
    { status: "cancelled", label: "Cancel", color: "bg-red-500" },
  ];

  return (
    <View className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
      <Text className="font-JakartaBold text-xs text-gray-700 dark:text-gray-200 mb-2 uppercase tracking-wide">
        Ride Status
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {rideStatuses.map((status, index) => (
          <Button
            key={index}
            variant="primary"
            title={status.label}
            onPress={() => {
              realtime.updateRideStatus(1 as any, status.status as any);
              console.log(`Status updated to: ${status.status}`);
            }}
            className={`px-3 py-2 min-w-[70px] ${status.color}`}
          />
        ))}
      </View>
    </View>
  );
};

// Componente para controles de simulación
export const SimulationControls: React.FC = () => {
  const realtime = useRealtimeStore();

  return (
    <View className="px-4 py-3">
      <Text className="font-JakartaBold text-xs text-gray-700 dark:text-gray-200 mb-2 uppercase tracking-wide">
        Simulation & Map
      </Text>
      <View className="space-y-2">
        <Button
          variant={realtime.simulationEnabled ? "danger" : "primary"}
          title={
            realtime.simulationEnabled
              ? "⏸️ Pause Simulation"
              : "▶️ Resume Simulation"
          }
          onPress={() =>
            realtime.setSimulationEnabled(!realtime.simulationEnabled)
          }
          className="px-4 py-2"
        />

        <Button
          variant="primary"
          title="📍 Move Driver"
          onPress={() => {
            const { userLatitude, userLongitude } =
              require("@/store").useLocationStore.getState();
            const baseLat = userLatitude || 40.7128;
            const baseLng = userLongitude || -74.006;
            const jitter = () => (Math.random() - 0.5) * 0.003;
            require("@/store")
              .useRealtimeStore.getState()
              .updateDriverLocation({
                latitude: baseLat + jitter(),
                longitude: baseLng + jitter(),
                timestamp: new Date(),
              });
            console.log("Driver location updated");
          }}
          className="px-4 py-2 bg-purple-600"
        />

        <Button
          variant="primary"
          title="🎯 Fit Route"
          onPress={() => {
            const {
              userLatitude,
              userLongitude,
              destinationLatitude,
              destinationLongitude,
            } = require("@/store").useLocationStore.getState();
            const points: { latitude: number; longitude: number }[] = [];
            if (userLatitude && userLongitude)
              points.push({ latitude: userLatitude, longitude: userLongitude });
            if (destinationLatitude && destinationLongitude)
              points.push({
                latitude: destinationLatitude,
                longitude: destinationLongitude,
              });
            const driverLoc =
              require("@/store").useRealtimeStore.getState().driverLocation;
            if (driverLoc)
              points.push({
                latitude: driverLoc.latitude,
                longitude: driverLoc.longitude,
              });

            console.log("Fit Route - Points:", points.length);
          }}
          className="px-4 py-2 bg-indigo-600"
        />
      </View>
    </View>
  );
};
