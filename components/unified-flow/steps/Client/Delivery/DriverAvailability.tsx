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
import { websocketEventManager } from "@/lib/websocketEventManager";
import { Button, Card, Badge } from "@/components/ui";
import { useUI } from "@/components/UIWrapper";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useRealtimeStore } from "@/store";
import { useDriverStateStore } from "@/store/driverState/driverState";
import { useLocationStore } from "@/store/location/location";
import { FLOW_STEPS } from "@/lib/unified-flow/constants";

const POLLING_INTERVAL = 5000; // 5 segundos (legacy - to be removed)
const MAX_DISTANCE_KM = 5; // Radio máximo para solicitudes de viaje

const DriverAvailability: React.FC = () => {
  const { startWithDriverStep } = useMapFlow();
  const { showSuccess, showError } = useUI();
  const driverState = useDriverStateStore();
  const locationState = useLocationStore();

  const [isInitializing, setIsInitializing] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const [processingRequest, setProcessingRequest] = useState<number | null>(
    null,
  );

  // 🚀 NUEVO: Estado para temporizadores de expiración de solicitudes
  const [requestTimers, setRequestTimers] = useState<
    Map<number, { expiresAt: Date; intervalId: NodeJS.Timeout }>
  >(new Map());

  // 🚀 NUEVO: Estado para forzar re-render cada segundo (para countdown visual)
  const [forceUpdate, setForceUpdate] = useState(0);

  // 🚀 NUEVO: Funciones para manejar temporizadores de expiración (2 minutos)
  const createRequestTimer = (requestId: number, expiresAt: Date) => {
    // Limpiar temporizador existente si hay
    clearRequestTimer(requestId);

    const now = new Date();
    const timeLeft = expiresAt.getTime() - now.getTime();

    if (timeLeft <= 0) {
      
      removeExpiredRequest(requestId);
      return;
    }

    

    // Crear interval para actualizar UI cada segundo
    const intervalId = setInterval(() => {
      const currentTime = new Date();
      const remaining = expiresAt.getTime() - currentTime.getTime();

      if (remaining <= 0) {
        
        clearRequestTimer(requestId);
        removeExpiredRequest(requestId);
      }
    }, 1000);

    setRequestTimers(
      (prev) => new Map(prev.set(requestId, { expiresAt, intervalId })),
    );
  };

  const clearRequestTimer = (requestId: number) => {
    setRequestTimers((prev) => {
      const timer = prev.get(requestId);
      if (timer) {
        clearInterval(timer.intervalId);
        const newMap = new Map(prev);
        newMap.delete(requestId);
        return newMap;
      }
      return prev;
    });
  };

  const removeExpiredRequest = (requestId: number) => {
    setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
    clearRequestTimer(requestId);

    // Feedback visual de expiración
    showError("Solicitud expirada", "La solicitud de viaje ha expirado");

    
  };

  const getTimeRemaining = (requestId: number): number => {
    const timer = requestTimers.get(requestId);
    if (!timer) return 0;

    const remaining = timer.expiresAt.getTime() - Date.now();
    return Math.max(0, Math.round(remaining / 1000)); // segundos
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return "00:00";

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Limpiar todos los temporizadores al desmontar
  useEffect(() => {
    return () => {
      requestTimers.forEach((timer) => {
        clearInterval(timer.intervalId);
      });
    };
  }, []);

  // 🚀 NUEVO: Forzar re-render cada segundo para actualizar countdown visual
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setForceUpdate((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []);

  // Polling function for pending requests
  const pollPendingRequests = async () => {
    

    // Only poll if driver is online (regardless of isPolling state)
    if (driverState.status !== "online") {
      

      // Clean up any orphaned intervals when not online
      if (pollingIntervalRef.current) {
        
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      return;
    }

    try {
      
      

      // Get current location from location store (more reliable than driver state)
      const currentLat = locationState.userLatitude;
      const currentLng = locationState.userLongitude;

      

      // Skip polling if we don't have valid coordinates yet
      if (!currentLat || !currentLng) {
        
        return;
      }

      const startTime = Date.now();
      const response = await driverTransportService.getPendingRequests(
        currentLat,
        currentLng,
      );
      const endTime = Date.now();

      

      const requests = response?.data || [];
      
      

      // Only update if there are changes to avoid unnecessary re-renders
      setPendingRequests((prevRequests) => {
        const hasChanges =
          prevRequests.length !== requests.length ||
          JSON.stringify(prevRequests) !== JSON.stringify(requests);

        if (hasChanges) {
          
          return requests;
        } else {
          
          return prevRequests;
        }
      });

      if (requests.length > 0) {
        
        requests.forEach((req: PendingRequest, index: number) => {
          
        });
      } else {
        
      }

      
    } catch (error: any) {
      
      
      // Don't show error to user for polling failures, just log it
    }
  };

  // Start/stop polling based on online status
  const managePolling = (shouldPoll: boolean) => {
    

    if (shouldPoll && driverState.status === "online") {
      // Clear any existing interval first (safety check)
      if (pollingIntervalRef.current) {
        
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      
      

      setIsPolling(true);

      // Initial poll
      
      pollPendingRequests();

      // Set up interval polling
      pollingIntervalRef.current = setInterval(() => {
        
        pollPendingRequests();
      }, POLLING_INTERVAL);

      
    } else {
      

      setIsPolling(false);
      setPendingRequests([]);

      // 🚀 NUEVO: Limpiar todos los temporizadores activos cuando se detiene el polling
      
      requestTimers.forEach((timer, requestId) => {
        clearInterval(timer.intervalId);
        
      });
      setRequestTimers(new Map());

      if (pollingIntervalRef.current) {
        
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        
      }

      
    }
  };

  // Handle accepting a pending request
  const handleAcceptRequest = async (request: PendingRequest) => {
    if (processingRequest) return;

    setProcessingRequest(request.rideId);
    try {
      

      // 🚀 NUEVO: Limpiar temporizador antes de aceptar
      clearRequestTimer(request.id);

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
      startWithDriverStep(FLOW_STEPS.DRIVER_TRANSPORT_EN_CAMINO_ORIGEN);
    } catch (error) {
      
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
      

      // 🚀 NUEVO: Limpiar temporizador antes de rechazar
      clearRequestTimer(request.id);

      // For now, just remove from local state
      // In a real implementation, you might want to call a reject endpoint
      setPendingRequests((prev) =>
        prev.filter((r) => r.rideId !== request.rideId),
      );
      showSuccess("Solicitud rechazada", "Buscando otras oportunidades");
    } catch (error) {
      
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
          
          // Driver is already initialized, use existing local state
        }
      } catch (error) {
        
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
    

    const handleStatusChange = async () => {
      if (driverState.status === "online" && !isPolling) {
        

        try {
          // Ensure user is registered as driver before starting polling
          await ensureDriverRegistration();
          
          managePolling(true);
        } catch (error) {
          
          showError("Error", "No se pudo registrar como conductor");
          // Revert status back to offline
          driverState.updateStatus("offline");
        }
      } else if (driverState.status === "offline" && isPolling) {
        
        managePolling(false);
      } else {
        
      }
    };

    handleStatusChange();
  }, [driverState.status]); // Only depend on driverState.status

  // 🚀 NUEVO: WebSocket listener para ride:requested (reemplaza polling)
  useEffect(() => {
    const handleRideRequested = async (data: any) => {
      

      // Solo procesar si el conductor está online
      if (driverState.status !== "online") {
        
        return;
      }

      try {
        const driverLat = locationState.userLatitude;
        const driverLng = locationState.userLongitude;

        if (!driverLat || !driverLng) {
          
          return;
        }

        // Calcular distancia desde la ubicación del conductor al origen del viaje
        const distance = calculateDistance(
          driverLat,
          driverLng,
          data.originLat || data.origin?.latitude,
          data.originLng || data.origin?.longitude,
        );

        

        // Solo mostrar solicitudes dentro del radio de 5km
        if (distance <= MAX_DISTANCE_KM) {
          

          // Fetch único para obtener detalles completos de las solicitudes
          const response = await driverTransportService.getPendingRequests(
            driverLat,
            driverLng,
          );

          if (response?.success && response?.data) {
            const requests = response.data;
            

            setPendingRequests(requests);
            setIsPolling(true); // Mantener compatibilidad con UI existente

            // 🚀 NUEVO: Crear temporizadores para cada solicitud
            requests.forEach((request: PendingRequest) => {
              if (request.expiresAt) {
                const expiresAt = new Date(request.expiresAt);
                createRequestTimer(request.id, expiresAt);
              } else {
                // Si no tiene expiresAt, asumir 2 minutos desde ahora
                const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
                createRequestTimer(request.id, expiresAt);
                
              }
            });

            // Feedback al conductor
            showSuccess(
              "Nueva solicitud",
              "Tienes una nueva solicitud de viaje cercana",
            );

            // Feedback háptico (si está disponible)
            try {
              const { Haptics } = require("expo-haptics");
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
            } catch (error) {
              // Haptics no disponible, ignorar
            }
          } else {
            
          }
        } else {
          
        }
      } catch (error) {
        
        showError("Error", "No se pudo procesar la solicitud de viaje");
      }
    };

    // Suscribirse al evento ride:requested
    websocketEventManager.on("ride:requested", handleRideRequested);

    // Cleanup al desmontar
    return () => {
      websocketEventManager.off("ride:requested", handleRideRequested);
    };
  }, [
    driverState.status,
    locationState.userLatitude,
    locationState.userLongitude,
  ]);

  // Function to ensure user is registered as driver
  const ensureDriverRegistration = async () => {
    try {
      

      // Check if user is already a driver based on local state
      if (!driverState.isDriver) {
        
        await driverStateService.initializeAsDriver();

        // Set basic driver info (no GET endpoint available)
        driverState.setDriver({
          isDriver: true,
          status: "offline", // Start offline
          verificationStatus: "approved",
          isAvailable: false,
        });

        

        // Start location tracking since we're going online
        await driverLocationService.updateAvailability(true);
      } else {
        
      }
    } catch (error) {
      
      throw error;
    }
  };

  const toggleAvailability = async () => {
    if (isToggling || isInitializing) return;

    setIsToggling(true);
    try {
      const newStatus = driverState.status === "online" ? "offline" : "online";

      

      if (newStatus === "online") {
        // Going online - update backend status first, then local status
        
        await driverStateService.goOnline();

        driverState.updateStatus("online");

        

        // Update WebSocket status
        websocketService.updateDriverStatus({ available: true });

        // Start GPS tracking for available drivers (no active ride)
        
        try {
          // Start availability tracking (no ride ID needed)
          await driverLocationService.startAvailabilityTracking();
          
        } catch (error) {
          
        }

        showSuccess("¡Conectado!", "Configurando como conductor...");
      } else {
        // Going offline - update backend and stop location tracking
        await driverStateService.goOffline();
        await driverLocationService.updateAvailability(false);

        // Stop GPS tracking
        
        try {
          await driverLocationService.stopTracking();
          
        } catch (error) {
          
        }

        // Update WebSocket status
        websocketService.updateDriverStatus({ available: false });

        driverState.updateStatus("offline");

        showSuccess("Desconectado", "Ya no recibirás solicitudes de viaje");
      }
    } catch (error) {
      
      showError("Error", "No se pudo cambiar el estado. Intenta de nuevo.");
    } finally {
      setIsToggling(false);
    }
  };

  const goMockIncoming = async () => {
    if (isToggling || isInitializing) return;

    setIsToggling(true);
    try {
      

      const result = await driverTransportService.simulateRequest();

      if (result?.data) {
        
        showSuccess("¡Solicitud simulada!", "Nueva solicitud de viaje creada");

        // Navigate to incoming request step
        startWithDriverStep(FLOW_STEPS.DRIVER_TRANSPORT_RECIBIR_SOLICITUD);
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (error: any) {
      

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

      {/* 🚀 NUEVO: Indicador de estado en tiempo real */}
      <View className="bg-green-50 border border-green-200 rounded-lg p-3 mx-6 mb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-2 h-2 bg-green-500 rounded-full mr-2"></View>
            <Text className="font-JakartaMedium text-sm text-green-800">
              🟢 Conectado en tiempo real
            </Text>
          </View>
          <Text className="font-Jakarta text-xs text-green-600">
            {pendingRequests.length} solicitud
            {pendingRequests.length !== 1 ? "es" : ""} activa
            {pendingRequests.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

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
              keyExtractor={(item) => `request_${item.id}_${forceUpdate}`} // 🚀 NUEVO: Incluir forceUpdate para re-render
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
                    <View
                      className={`px-2 py-1 rounded ${
                        getTimeRemaining(item.id) <= 30
                          ? "bg-red-100"
                          : getTimeRemaining(item.id) <= 60
                            ? "bg-orange-100"
                            : "bg-green-100"
                      }`}
                    >
                      <Text
                        className={`font-Jakarta text-xs ${
                          getTimeRemaining(item.id) <= 30
                            ? "text-red-800"
                            : getTimeRemaining(item.id) <= 60
                              ? "text-orange-800"
                              : "text-green-800"
                        }`}
                      >
                        ⏰ {formatTimeRemaining(getTimeRemaining(item.id))}
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
              // 🚀 NUEVO: Optimizaciones de performance
              initialNumToRender={5}
              maxToRenderPerBatch={3}
              windowSize={10}
              removeClippedSubviews={true}
              getItemLayout={(data, index) => ({
                length: 180, // Altura aproximada de cada item
                offset: 180 * index,
                index,
              })}
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

/**
 * Calcular distancia entre dos puntos usando fórmula de Haversine
 */
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
