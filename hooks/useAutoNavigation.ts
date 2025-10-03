import { useEffect, useCallback } from "react";
import { websocketEventManager } from "@/lib/websocketEventManager";
import { useMapFlow } from "./useMapFlow";
import { useRealtimeStore } from "@/store/realtime/realtime";
import { log, LogLevel } from "@/lib/logger";

/**
 * Hook personalizado para navegación automática basada en eventos WebSocket
 *
 * Maneja transiciones automáticas entre estados del viaje basadas en eventos
 * del servidor, proporcionando una experiencia fluida y en tiempo real.
 */
export const useAutoNavigation = () => {
  const {
    next,
    back,
    startWithDriverStep,
    currentStep,
    rideId,
    matchedDriver,
    confirmedDestination,
  } = useMapFlow() as any;

  const realtime = useRealtimeStore();
  const activeRide = realtime.activeRide;

  /**
   * Mapeo de eventos WebSocket a acciones de navegación
   * Define qué hacer cuando llegan ciertos eventos del servidor
   */
  const EVENT_TRANSITIONS = {
    // Cliente: Eventos de aceptación del viaje
    "ride:accepted": (data: any) => {
      if (validateEventForRide(data, "accepted")) {
        log.info(
          "useAutoNavigation",
          "🚨 ride:accepted - Auto-navigating to driver arrival",
          { data },
        );
        next(); // Va a ConductorEncontrado -> ConductorLlego
      }
    },

    "ride:rejected": (data: any) => {
      if (validateEventForRide(data, "rejected")) {
        log.info(
          "useAutoNavigation",
          "🚨 ride:rejected - Auto-navigating back to driver search",
          { data },
        );
        back(); // Vuelve a BUSCANDO_CONDUCTOR
      }
    },

    // Cliente: Eventos del viaje en progreso
    "ride:arrived": (data: any) => {
      if (validateEventForRide(data, "arrived")) {
        log.info(
          "useAutoNavigation",
          "🚨 ride:arrived - Auto-navigating to driver arrived",
          { data },
        );
        // Navegar a ConductorLlego (este paso depende del flow actual)
        // En el flow del cliente, esto sería desde ViajeEnCurso
      }
    },

    "ride:started": (data: any) => {
      if (validateEventForRide(data, "started")) {
        log.info(
          "useAutoNavigation",
          "🚨 ride:started - Ride officially started",
          { data },
        );
        // Actualizar estado pero no navegar automáticamente
        realtime.updateRideStatus(rideId, "in_progress");
      }
    },

    "ride:completed": (data: any) => {
      if (validateEventForRide(data, "completed")) {
        log.info(
          "useAutoNavigation",
          "🚨 ride:completed - Auto-navigating to ride completed",
          { data },
        );
        // Navegar a ViajeCompletado
        // Esto dependería del flow actual del cliente
      }
    },

    "ride:cancelled": (data: any) => {
      if (validateEventForRide(data, "cancelled")) {
        log.info(
          "useAutoNavigation",
          "🚨 ride:cancelled - Auto-navigating to cancellation",
          { data },
        );
        // Navegar a pantalla de viaje cancelado
        back(); // O a pantalla específica de cancelación
      }
    },

    // Conductor: Eventos de solicitud de viaje
    "ride:requested": (data: any) => {
      // Este evento ya se maneja en DriverAvailability y DriverIncomingRequest
      // No necesitamos navegación automática aquí
      log.debug(
        "useAutoNavigation",
        "📨 ride:requested received (handled by other components)",
        { data },
      );
    },

    // Eventos de ubicación (no requieren navegación, solo actualización de UI)
    driverLocationUpdate: (data: any) => {
      // Este evento ya se maneja en RideInProgress
      // Solo logging para debugging
      log.debug(
        "useAutoNavigation",
        "📍 driverLocationUpdate received (handled by RideInProgress)",
        { data },
      );
    },
  };

  /**
   * Valida que un evento WebSocket corresponde al viaje actual
   * y que la transición es válida desde el estado actual
   */
  const validateEventForRide = useCallback(
    (data: any, expectedStatus?: string): boolean => {
      // Validar que tenemos un rideId
      if (!rideId && !data.rideId) {
        log.warn(
          "useAutoNavigation",
          "No rideId available for event validation",
          { data },
        );
        return false;
      }

      // Validar que el evento corresponde a este viaje
      const eventRideId = data.rideId || data.id;
      if (eventRideId !== rideId) {
        log.debug("useAutoNavigation", "Event for different ride, ignoring", {
          eventRideId,
          currentRideId: rideId,
        });
        return false;
      }

      // Validar que tenemos un viaje activo
      if (!activeRide) {
        log.warn("useAutoNavigation", "No active ride for navigation", {
          data,
        });
        return false;
      }

      // Validar transición de estado (si se especifica expectedStatus)
      if (expectedStatus && activeRide.status) {
        const isValidTransition = validateStateTransition(
          activeRide.status,
          expectedStatus,
        );
        if (!isValidTransition) {
          log.warn("useAutoNavigation", "Invalid state transition", {
            currentStatus: activeRide.status,
            expectedStatus,
            data,
          });
          return false;
        }
      }

      return true;
    },
    [rideId, activeRide],
  );

  /**
   * Valida si una transición de estado es lógica
   */
  const validateStateTransition = useCallback(
    (currentStatus: string, newStatus: string): boolean => {
      const VALID_TRANSITIONS: Record<string, string[]> = {
        pending: ["accepted", "rejected", "cancelled"],
        accepted: ["arrived", "started", "cancelled"],
        arrived: ["started", "cancelled"],
        in_progress: ["completed", "cancelled"],
        completed: [], // Estado final
        cancelled: [], // Estado final
      };

      const validNextStates = VALID_TRANSITIONS[currentStatus] || [];
      return validNextStates.includes(newStatus);
    },
    [],
  );

  /**
   * Maneja errores en transiciones automáticas
   */
  const handleTransitionError = useCallback(
    (error: any, event: string, data: any) => {
      log.error("useAutoNavigation", `Error in auto-navigation for ${event}:`, {
        error: error.message,
        event,
        data,
        currentStep,
        rideId,
        activeRide: activeRide?.status,
      });

      // En caso de error, no hacer navegación automática
      // El usuario puede continuar manualmente o reintentar
    },
    [currentStep, rideId, activeRide],
  );

  /**
   * Configura todos los listeners de WebSocket para navegación automática
   */
  useEffect(() => {
    if (!rideId) {
      log.debug(
        "useAutoNavigation",
        "No rideId, skipping auto-navigation setup",
      );
      return;
    }

    log.info("useAutoNavigation", "Setting up auto-navigation listeners", {
      rideId,
    });

    // Configurar listeners para cada evento de transición
    const cleanupFunctions: (() => void)[] = [];

    Object.entries(EVENT_TRANSITIONS).forEach(([event, handler]) => {
      const listener = (data: any) => {
        try {
          handler(data);
        } catch (error) {
          handleTransitionError(error, event, data);
        }
      };

      websocketEventManager.on(event, listener);

      // Guardar función de cleanup
      cleanupFunctions.push(() => {
        websocketEventManager.off(event, listener);
      });
    });

    // Cleanup al desmontar o cambiar rideId
    return () => {
      log.info("useAutoNavigation", "Cleaning up auto-navigation listeners");
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [rideId, validateEventForRide, handleTransitionError]);

  /**
   * Función manual para forzar una navegación (para casos edge)
   */
  const forceNavigate = useCallback(
    (direction: "next" | "back", reason?: string) => {
      log.info(
        "useAutoNavigation",
        `Manual navigation triggered: ${direction}`,
        {
          reason,
          currentStep,
          rideId,
        },
      );

      if (direction === "next") {
        next();
      } else {
        back();
      }
    },
    [next, back, currentStep, rideId],
  );

  /**
   * Obtener estado actual de navegación automática
   */
  const getNavigationState = useCallback(() => {
    return {
      currentStep,
      rideId,
      activeRideStatus: activeRide?.status,
      hasMatchedDriver: !!matchedDriver,
      hasDestination: !!confirmedDestination,
      isAutoNavigationActive: !!rideId,
    };
  }, [currentStep, rideId, activeRide, matchedDriver, confirmedDestination]);

  return {
    // Estado
    navigationState: getNavigationState(),

    // Acciones manuales
    forceNavigate,

    // Utilidades
    validateEventForRide,
    validateStateTransition,

    // Información de debugging
    EVENT_TRANSITIONS: Object.keys(EVENT_TRANSITIONS),
  };
};
