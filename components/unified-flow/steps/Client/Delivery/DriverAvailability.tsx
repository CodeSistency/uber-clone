import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  FlatList,
} from "react-native";

import { driverLocationService } from "@/app/services/driverLocationService";
import { driverStateService } from "@/app/services/driverStateService";
import {
  driverTransportService,
  PendingRequest,
} from "@/app/services/driverTransportService";
import { websocketService } from "@/app/services/websocketService";
import { Button, Card, Badge } from "@/components/ui";
import { useUI } from "@/components/UIWrapper";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useRealtimeStore } from "@/store";
import { useDriverStateStore } from "@/store/driverState/driverState";
import { useLocationStore } from "@/store/location/location";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";

const POLLING_INTERVAL = 5000; // 5 segundos

const DriverAvailability: React.FC = () => {
  const { startWithDriverStep } = useMapFlow();
  const { showSuccess, showError } = useUI();
  const driverState = useDriverStateStore();
  const locationState = useLocationStore();

  const [isInitializing, setIsInitializing] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<number | null>(null);
  const [processingRequest, setProcessingRequest] = useState<number | null>(
    null,
  );

  // Polling function for pending requests
  const pollPendingRequests = async () => {
    console.log(
      "[DriverAvailability] 🔍 Poll function called - driverStatus:",
      driverState.status,
      "intervalActive:",
      !!pollingIntervalRef.current,
    );

    // Only poll if driver is online (regardless of isPolling state)
    if (driverState.status !== "online") {
      console.log(
        "[DriverAvailability] ❌ Polling skipped - driver not online, status:",
        driverState.status,
      );

      // Clean up any orphaned intervals when not online
      if (pollingIntervalRef.current) {
        console.log(
          "[DriverAvailability] 🧹 Cleaning up interval - driver went offline",
        );
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      return;
    }

    try {
      console.log(
        "[DriverAvailability] 🔄 Starting polling for pending requests...",
      );
      console.log(
        "[DriverAvailability] 📊 Current state - isPolling:",
        isPolling,
        "driverStatus:",
        driverState.status,
      );

      // Get current location from location store (more reliable than driver state)
      const currentLat = locationState.userLatitude;
      const currentLng = locationState.userLongitude;

      console.log("[DriverAvailability] 📍 Using location for polling:", {
        lat: currentLat,
        lng: currentLng,
        hasValidLocation: !!(currentLat && currentLng),
      });

      // Skip polling if we don't have valid coordinates yet
      if (!currentLat || !currentLng) {
        console.log(
          "[DriverAvailability] ⚠️ Skipping poll - no valid GPS coordinates yet",
        );
        return;
      }

      const startTime = Date.now();
      const response = await driverTransportService.getPendingRequests(
        currentLat,
        currentLng,
      );
      const endTime = Date.now();

      console.log(
        "[DriverAvailability] 📡 Raw API response received in",
        endTime - startTime,
        "ms:",
        response,
      );

      const requests = response?.data || [];
      console.log(
        "[DriverAvailability] 📋 Extracted requests array:",
        requests,
      );
      console.log("[DriverAvailability] 📊 Requests details:", {
        totalRequests: requests.length,
        hasData: !!response?.data,
        responseKeys: Object.keys(response || {}),
        firstRequest: requests[0] || null,
      });

      // Only update if there are changes to avoid unnecessary re-renders
      setPendingRequests((prevRequests) => {
        const hasChanges =
          prevRequests.length !== requests.length ||
          JSON.stringify(prevRequests) !== JSON.stringify(requests);

        if (hasChanges) {
          console.log(
            "[DriverAvailability] 🔄 Updating pending requests - OLD:",
            prevRequests.length,
            "NEW:",
            requests.length,
          );
          return requests;
        } else {
          console.log(
            "[DriverAvailability] ⏭️ No changes in pending requests, skipping update",
          );
          return prevRequests;
        }
      });

      if (requests.length > 0) {
        console.log(
          `[DriverAvailability] 🎯 Found ${requests.length} pending request(s)`,
        );
        requests.forEach((req: PendingRequest, index: number) => {
          console.log(`[DriverAvailability] 📝 Request ${index + 1}:`, {
            rideId: req.rideId,
            passenger: req.passenger?.name,
            origin: req.originAddress,
            destination: req.destinationAddress,
            fare: req.farePrice,
            timeLeft: req.timeRemainingSeconds,
          });
        });
      } else {
        console.log("[DriverAvailability] 📭 No pending requests found");
      }

      console.log(
        "[DriverAvailability] ✅ Polling cycle completed successfully",
      );
    } catch (error: any) {
      console.error(
        "[DriverAvailability] ❌ Error polling pending requests:",
        error,
      );
      console.error("[DriverAvailability] 🔍 Error details:", {
        message: error?.message,
        status: error?.status,
        stack: error?.stack,
      });
      // Don't show error to user for polling failures, just log it
    }
  };

  // Start/stop polling based on online status
  const managePolling = (shouldPoll: boolean) => {
    console.log(
      "[DriverAvailability] 🎛️ managePolling called with shouldPoll:",
      shouldPoll,
      "driverStatus:",
      driverState.status,
    );

    if (shouldPoll && driverState.status === "online") {
      // Clear any existing interval first (safety check)
      if (pollingIntervalRef.current) {
        console.log(
          "[DriverAvailability] 🧹 Clearing existing interval before starting new one:",
          pollingIntervalRef.current,
        );
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      console.log(
        "[DriverAvailability] 🟢 Starting polling for pending requests",
      );
      console.log(
        "[DriverAvailability] ⏱️ Polling interval:",
        POLLING_INTERVAL,
        "ms",
      );

      setIsPolling(true);

      // Initial poll
      console.log("[DriverAvailability] 🚀 Making initial poll...");
      pollPendingRequests();

      // Set up interval polling
      pollingIntervalRef.current = setInterval(() => {
        console.log("[DriverAvailability] 🔄 Interval poll triggered");
        pollPendingRequests();
      }, POLLING_INTERVAL);

      console.log(
        "[DriverAvailability] ✅ Polling started with interval ID:",
        pollingIntervalRef.current,
      );
    } else {
      console.log(
        "[DriverAvailability] 🔴 Stopping polling for pending requests",
      );

      setIsPolling(false);
      setPendingRequests([]);

      if (pollingIntervalRef.current) {
        console.log(
          "[DriverAvailability] 🕒 Clearing interval:",
          pollingIntervalRef.current,
        );
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        console.log("[DriverAvailability] ✅ Interval cleared");
      }

      console.log("[DriverAvailability] ✅ Polling stopped successfully");
    }
  };

  // Handle accepting a pending request
  const handleAcceptRequest = async (request: PendingRequest) => {
    if (processingRequest) return;

    setProcessingRequest(request.rideId);
    try {
      console.log(
        "[DriverAvailability] Accepting pending request:",
        request.rideId,
      );

      await driverTransportService.accept(request.rideId);
      websocketService.joinRideRoom(request.rideId);

      // Store the active ride
      useRealtimeStore.getState().setActiveRide({
        ride_id: request.rideId,
        service: "transport",
        status: "accepted",
        passenger: request.passenger,
        originAddress: request.originAddress,
        destinationAddress: request.destinationAddress,
        farePrice: request.farePrice,
        tier: request.tier,
        pickupLocation: request.pickupLocation,
      } as any);

      showSuccess("Solicitud aceptada", "Transporte aceptado exitosamente");

      // Navigate to next step
      startWithDriverStep(FLOW_STEPS.DRIVER_TRANSPORT.EN_CAMINO_ORIGEN);
    } catch (error) {
      console.error("[DriverAvailability] Error accepting request:", error);
      showError("No se pudo aceptar", "Intenta de nuevo");
    } finally {
      setProcessingRequest(null);
    }
  };

  // Handle rejecting a pending request
  const handleRejectRequest = async (request: PendingRequest) => {
    if (processingRequest) return;

    setProcessingRequest(request.rideId);
    try {
      console.log(
        "[DriverAvailability] Rejecting pending request:",
        request.rideId,
      );
      // For now, just remove from local state
      // In a real implementation, you might want to call a reject endpoint
      setPendingRequests((prev) =>
        prev.filter((r) => r.rideId !== request.rideId),
      );
      showSuccess("Solicitud rechazada", "Buscando otras oportunidades");
    } catch (error) {
      console.error("[DriverAvailability] Error rejecting request:", error);
    } finally {
      setProcessingRequest(null);
    }
  };

  // Initialize driver state on mount
  useEffect(() => {
    const initializeDriver = async () => {
      try {
        setIsInitializing(true);

        // Check if user is already a driver based on local state
        if (!driverState.isDriver) {
          console.log(
            "[DriverAvailability] User is not a driver, initializing...",
          );

          // Initialize as driver (this will set status to offline)
          await driverStateService.initializeAsDriver();

          // Set basic driver info (we don't have GET endpoint to fetch current status)
          driverState.setDriver({
            isDriver: true,
            status: "offline", // Start offline
            verificationStatus: "approved",
            isAvailable: false,
          });

          showSuccess("¡Bienvenido!", "Has sido configurado como conductor");
        } else {
          console.log(
            "[DriverAvailability] Driver already initialized, using local state",
          );
          // Driver is already initialized, use existing local state
        }
      } catch (error) {
        console.error("[DriverAvailability] Error initializing driver:", error);
        showError("Error", "No se pudo inicializar el estado del conductor");
      } finally {
        setIsInitializing(false);
      }
    };

    initializeDriver();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Monitor driver status changes to manage polling
  useEffect(() => {
    console.log(
      "[DriverAvailability] 🚨🚨 USEEFFECT EXECUTING - Driver status changed to:",
      driverState.status,
      "isPolling:",
      isPolling,
      "hasInterval:",
      !!pollingIntervalRef.current,
      "timestamp:",
      new Date().toISOString(),
    );

    const handleStatusChange = async () => {
      if (driverState.status === "online" && !isPolling) {
        console.log(
          "[DriverAvailability] 🎯 Driver went online, ensuring driver registration before polling...",
        );

        try {
          // Ensure user is registered as driver before starting polling
          await ensureDriverRegistration();
          console.log(
            "[DriverAvailability] ✅ Driver registration confirmed, starting polling...",
          );
          managePolling(true);
        } catch (error) {
          console.error(
            "[DriverAvailability] ❌ Failed to register as driver:",
            error,
          );
          showError("Error", "No se pudo registrar como conductor");
          // Revert status back to offline
          driverState.updateStatus("offline");
        }
      } else if (driverState.status === "offline" && isPolling) {
        console.log(
          "[DriverAvailability] 🛑 Driver went offline, stopping polling...",
        );
        managePolling(false);
      } else {
        console.log(
          "[DriverAvailability] ℹ️ No action needed - status:",
          driverState.status,
          "isPolling:",
          isPolling,
        );
      }
    };

    handleStatusChange();
  }, [driverState.status]); // Only depend on driverState.status

  // Function to ensure user is registered as driver
  const ensureDriverRegistration = async () => {
    try {
      console.log(
        "[DriverAvailability] 🔍 Checking if user is registered as driver...",
      );

      // Check if user is already a driver based on local state
      if (!driverState.isDriver) {
        console.log(
          "[DriverAvailability] 👤 User is not a driver, initializing...",
        );
        await driverStateService.initializeAsDriver();

        // Set basic driver info (no GET endpoint available)
        driverState.setDriver({
          isDriver: true,
          status: "offline", // Start offline
          verificationStatus: "approved",
          isAvailable: false,
        });

        console.log("[DriverAvailability] ✅ Driver initialized locally");

        // Start location tracking since we're going online
        await driverLocationService.updateAvailability(true);
      } else {
        console.log(
          "[DriverAvailability] ✅ User is already registered as driver",
        );
      }
    } catch (error) {
      console.error(
        "[DriverAvailability] ❌ Error ensuring driver registration:",
        error,
      );
      throw error;
    }
  };

  const toggleAvailability = async () => {
    if (isToggling || isInitializing) return;

    setIsToggling(true);
    try {
      const newStatus = driverState.status === "online" ? "offline" : "online";

      console.log(`[DriverAvailability] Toggling status to: ${newStatus}`);

      if (newStatus === "online") {
        // Going online - update backend status first, then local status
        console.log(
          "[DriverAvailability] 🔄 Going online - updating backend status",
        );
        await driverStateService.goOnline();

        driverState.updateStatus("online");

        console.log(
          "[DriverAvailability] 📊 After update - new status:",
          driverState.status,
        );

        // Update WebSocket status
        websocketService.updateDriverStatus({ available: true });

        // Start GPS tracking for available drivers (no active ride)
        console.log(
          "[DriverAvailability] 🚀 Starting GPS tracking for available driver",
        );
        try {
          // Start availability tracking (no ride ID needed)
          await driverLocationService.startAvailabilityTracking();
          console.log(
            "[DriverAvailability] ✅ GPS tracking started successfully",
          );
        } catch (error) {
          console.error(
            "[DriverAvailability] ❌ Error starting GPS tracking:",
            error,
          );
        }

        showSuccess("¡Conectado!", "Configurando como conductor...");
      } else {
        // Going offline - update backend and stop location tracking
        await driverStateService.goOffline();
        await driverLocationService.updateAvailability(false);

        // Stop GPS tracking
        console.log(
          "[DriverAvailability] 🛑 Stopping GPS tracking for offline driver",
        );
        try {
          await driverLocationService.stopTracking();
          console.log(
            "[DriverAvailability] ✅ GPS tracking stopped successfully",
          );
        } catch (error) {
          console.error(
            "[DriverAvailability] ❌ Error stopping GPS tracking:",
            error,
          );
        }

        // Update WebSocket status
        websocketService.updateDriverStatus({ available: false });

        driverState.updateStatus("offline");

        showSuccess("Desconectado", "Ya no recibirás solicitudes de viaje");
      }
    } catch (error) {
      console.error("[DriverAvailability] Error toggling availability:", error);
      showError("Error", "No se pudo cambiar el estado. Intenta de nuevo.");
    } finally {
      setIsToggling(false);
    }
  };

  const goMockIncoming = async () => {
    if (isToggling || isInitializing) return;

    setIsToggling(true);
    try {
      console.log("[DriverAvailability] Simulating incoming request...");

      const result = await driverTransportService.simulateRequest();

      if (result?.data) {
        console.log(
          "[DriverAvailability] Request simulated successfully:",
          result.data,
        );
        showSuccess("¡Solicitud simulada!", "Nueva solicitud de viaje creada");

        // Navigate to incoming request step
        startWithDriverStep(FLOW_STEPS.DRIVER_TRANSPORT.RECIBIR_SOLICITUD);
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (error: any) {
      console.error("[DriverAvailability] Error simulating request:", error);

      if (error.statusCode === 404 && error.error === "NO_USERS_AVAILABLE") {
        showError(
          "No hay usuarios disponibles",
          "No se puede simular una solicitud en este momento",
        );
      } else {
        showError(
          "Error al simular",
          error.message || "No se pudo crear la solicitud simulada",
        );
      }
    } finally {
      setIsToggling(false);
    }
  };

  const getStatusColor = () => {
    switch (driverState.status) {
      case "online":
        return "text-green-600";
      case "busy":
        return "text-orange-600";
      case "offline":
        return "text-gray-500";
      default:
        return "text-gray-400";
    }
  };

  const getStatusText = () => {
    switch (driverState.status) {
      case "online":
        return "En línea - Disponible";
      case "busy":
        return "Ocupado";
      case "offline":
        return "Fuera de línea";
      default:
        return "Desconocido";
    }
  };

  if (isInitializing) {
    return (
      <View className="flex-1">
        <FlowHeader title="Cargando..." />
        <View className="flex-1 items-center justify-center p-6">
          <ActivityIndicator size="large" color="#0286FF" />
          <Text className="font-JakartaMedium text-lg mt-4 text-gray-600">
            Inicializando estado del conductor...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlowHeader title="Disponibilidad del Conductor" />

      <View className="flex-1 p-6">
        {/* Estado actual */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <Text className="font-JakartaBold text-lg mb-2">Estado Actual</Text>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className={`font-JakartaBold text-xl ${getStatusColor()}`}>
                {getStatusText()}
              </Text>
              {driverState.verificationStatus === "approved" && (
                <Text className="font-Jakarta text-sm text-green-600 mt-1">
                  ✓ Verificado
                </Text>
              )}
              {driverState.verificationStatus === "pending" && (
                <Text className="font-Jakarta text-sm text-orange-600 mt-1">
                  ⏳ Verificación pendiente
                </Text>
              )}
            </View>

            {/* Indicador visual */}
            <View
              className={`w-4 h-4 rounded-full ${
                driverState.status === "online"
                  ? "bg-green-500"
                  : driverState.status === "busy"
                    ? "bg-orange-500"
                    : "bg-gray-400"
              }`}
            />
          </View>
        </View>

        {/* Indicador de búsqueda cuando está online */}
        {driverState.status === "online" && pendingRequests.length === 0 && (
          <View className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">🔍</Text>
              <View className="flex-1">
                <Text className="font-JakartaBold text-blue-800 mb-1">
                  Buscando solicitudes...
                </Text>
                <Text className="font-Jakarta text-sm text-blue-700">
                  El sistema está activo buscando viajes en tu zona
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Solicitudes pendientes */}
        {driverState.status === "online" && pendingRequests.length > 0 && (
          <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <Text className="font-JakartaBold text-lg mb-3 text-orange-600">
              🚨 Solicitudes Pendientes ({pendingRequests.length})
            </Text>

            <FlatList
              data={pendingRequests}
              keyExtractor={(item) => item.rideId.toString()}
              renderItem={({ item }) => (
                <View className="bg-gray-50 rounded-lg p-3 mb-3 border border-orange-200">
                  {/* Header con pasajero y tiempo */}
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="font-JakartaBold text-gray-800 mr-2">
                          {item.passenger.name}
                        </Text>
                        <View className="flex-row items-center">
                          <Text className="text-yellow-500 mr-1">★</Text>
                          <Text className="font-Jakarta text-sm text-gray-600">
                            {item.passenger.rating.toFixed(1)}
                          </Text>
                        </View>
                      </View>
                      <Text className="font-Jakarta text-sm text-gray-600">
                        📞 {item.passenger.phone}
                      </Text>
                    </View>
                    <View className="bg-orange-100 px-2 py-1 rounded">
                      <Text className="font-Jakarta text-xs text-orange-800">
                        ⏰ {item.timeRemainingSeconds}s
                      </Text>
                    </View>
                  </View>

                  {/* Ruta */}
                  <View className="mb-2">
                    <View className="flex-row items-start mb-1">
                      <Text className="text-green-500 mr-2 mt-1">●</Text>
                      <Text className="font-Jakarta text-sm text-gray-800 flex-1">
                        {item.originAddress}
                      </Text>
                    </View>
                    <View className="flex-row items-start">
                      <Text className="text-red-500 mr-2 mt-1">■</Text>
                      <Text className="font-Jakarta text-sm text-gray-800 flex-1">
                        {item.destinationAddress}
                      </Text>
                    </View>
                  </View>

                  {/* Detalles del viaje */}
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="font-JakartaBold text-gray-800">
                      {item.tier.name}
                    </Text>
                    <Text className="font-JakartaBold text-green-600 text-lg">
                      ${item.farePrice.toFixed(2)}
                    </Text>
                  </View>

                  {/* Botones de acción */}
                  <View className="flex-row">
                    <View className="flex-1 mr-2">
                      <Button
                        variant="success"
                        title={
                          processingRequest === item.rideId
                            ? "Aceptando..."
                            : "✅ Aceptar"
                        }
                        onPress={() => handleAcceptRequest(item)}
                        loading={processingRequest === item.rideId}
                        className="py-2"
                      />
                    </View>
                    <View className="flex-1">
                      <Button
                        variant="danger"
                        title={
                          processingRequest === item.rideId
                            ? "Rechazando..."
                            : "❌ Rechazar"
                        }
                        onPress={() => handleRejectRequest(item)}
                        loading={processingRequest === item.rideId}
                        className="py-2"
                      />
                    </View>
                  </View>
                </View>
              )}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            />
          </View>
        )}

        {/* Estadísticas rápidas */}
        {driverState.todayRides > 0 && (
          <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <Text className="font-JakartaBold text-lg mb-2">Hoy</Text>
            <View className="flex-row justify-between">
              <View>
                <Text className="font-Jakarta text-sm text-gray-600">
                  Viajes
                </Text>
                <Text className="font-JakartaBold text-lg">
                  {driverState.todayRides}
                </Text>
              </View>
              <View>
                <Text className="font-Jakarta text-sm text-gray-600">
                  Ganancias
                </Text>
                <Text className="font-JakartaBold text-lg text-green-600">
                  ${driverState.todayEarnings.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Controles principales */}
        <View className="space-y-3">
          <Button
            variant={driverState.status === "online" ? "danger" : "success"}
            title={
              isToggling
                ? "Cambiando estado..."
                : driverState.status === "online"
                  ? "Ir offline"
                  : "Ir online"
            }
            onPress={toggleAvailability}
            loading={isToggling}
            className="w-full"
            disabled={driverState.verificationStatus !== "approved"}
          />

          {driverState.verificationStatus !== "approved" && (
            <Card className="bg-orange-50 border-orange-200">
              <Text className="font-JakartaMedium text-sm text-orange-800 text-center">
                Debes estar verificado para recibir viajes
              </Text>
            </Card>
          )}

          <Button
            variant="outline"
            title="Simular Solicitud Entrante"
            onPress={goMockIncoming}
            className="w-full"
            disabled={driverState.status !== "online"}
          />
        </View>

        {/* Información adicional */}
        <Card className="mt-6 bg-gray-50">
          <Text className="font-JakartaMedium text-sm text-gray-600 text-center mb-2">
            💡 Consejos para conductores
          </Text>
          <Text className="font-Jakarta text-xs text-gray-500 text-center">
            Mantente conectado para recibir más solicitudes. Los conductores
            activos ganan más.
          </Text>
        </Card>
      </View>
    </View>
  );
};

export default DriverAvailability;
