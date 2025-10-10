import { log } from "./logger";
import { generateIdempotencyKey } from "./utils";
import { driverTransportService } from "@/app/services/driverTransportService";
import { driverDeliveryService } from "@/app/services/driverDeliveryService";
import { driverErrandService } from "@/app/services/driverErrandService";
import { driverParcelService } from "@/app/services/driverParcelService";
import { useDriverConfigStore } from "@/store/driverConfig/driverConfig";
import { useMapFlowStore, useRealtimeStore } from "@/store";
import { websocketService } from "@/app/services/websocketService";
import { DriverFlowStep, FLOW_STEPS } from "@/store/mapFlow";

/**
 * Driver Request Handler
 * 
 * Maneja la lógica de negocio para solicitudes de conductor de manera desacoplada.
 * Extraído del websocketService para mejorar mantenibilidad y testabilidad.
 */
export class DriverRequestHandler {
  private static instance: DriverRequestHandler;

  static getInstance(): DriverRequestHandler {
    if (!DriverRequestHandler.instance) {
      DriverRequestHandler.instance = new DriverRequestHandler();
    }
    return DriverRequestHandler.instance;
  }

  /**
   * Maneja una solicitud entrante de conductor
   */
  async handleIncomingRequest(data: any): Promise<void> {
    const requestId = `request_${data?.rideId || data?.id || 'unknown'}_${Date.now()}`;
    
    log.info("Processing incoming driver request", {
      component: "DriverRequestHandler",
      action: "handleIncomingRequest",
      data: {
        requestId,
        rideId: data?.rideId || data?.id,
        service: data?.service,
        area: data?.area,
      }
    });

    try {
      // 1. Store active ride context when available
      await this.storeActiveRideContext(data);

      // 2. Create notification
      this.createDriverNotification(data);

      // 3. Evaluate auto-accept conditions
      const { shouldAutoAccept, flowStep } = await this.evaluateRequest(data);

      if (shouldAutoAccept) {
        log.info("Auto-accepting request", { 
          component: "DriverRequestHandler",
          data: { requestId }
        });
        await this.autoAcceptRide(data);
      } else {
        log.info("Manual acceptance required", { 
          component: "DriverRequestHandler",
          data: { requestId }
        });
        this.navigateToFlow(flowStep);
      }
    } catch (error) {
      log.error("Error handling incoming request", {
        component: "DriverRequestHandler",
        data: {
          requestId,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      });
      throw error;
    }
  }

  /**
   * Almacena el contexto del ride activo si está disponible
   */
  private async storeActiveRideContext(data: any): Promise<void> {
    try {
      if (data?.ride) {
        useRealtimeStore.getState().setActiveRide(data.ride);
        log.debug("Active ride context stored", {
          component: "DriverRequestHandler",
          data: {
            rideId: data.ride.ride_id || data.ride.id,
          }
        });
      }
    } catch (error) {
      log.warn("Failed to store active ride context", {
        component: "DriverRequestHandler",
        data: {
          error: error instanceof Error ? error.message : "Unknown error",
        }
      });
    }
  }

  /**
   * Crea notificación para el conductor
   */
  private createDriverNotification(data: any): void {
    try {
      const { useNotificationStore } = require("@/store");
      
      useNotificationStore.getState().addNotification({
        id: `incoming_${data?.rideId || "unknown"}_${Date.now()}`,
        type: "RIDE_REQUEST" as any,
        title: "Nueva solicitud",
        message: `${(data?.service || "Servicio").toString().toUpperCase()} • ${data?.pickup?.address || "Origen"} → ${data?.dropoff?.address || "Destino"}`,
        data,
        timestamp: new Date(),
        isRead: false,
        priority: "high",
      });

      log.debug("Driver notification created", {
        component: "DriverRequestHandler",
        data: {
          rideId: data?.rideId || data?.id,
          service: data?.service,
        }
      });
    } catch (error) {
      log.error("Failed to create notification", {
        component: "DriverRequestHandler",
        data: {
          error: error instanceof Error ? error.message : "Unknown error",
        }
      });
    }
  }

  /**
   * Evalúa si la solicitud debe ser auto-aceptada
   */
  private async evaluateRequest(data: any): Promise<{
    shouldAutoAccept: boolean;
    flowStep: string;
  }> {
    const prefs = useDriverConfigStore.getState().ridePreferences;
    const driverLoc = useRealtimeStore.getState().driverLocation;
    const pickupLat = data?.pickup?.latitude ?? data?.ride?.origin_latitude;
    const pickupLng = data?.pickup?.longitude ?? data?.ride?.origin_longitude;

    // Check if auto-accept is enabled
    if (!prefs?.autoAccept) {
      return {
        shouldAutoAccept: false,
        flowStep: this.getFlowStepForService(data?.service),
      };
    }

    // Check if driver location is available
    if (!driverLoc || !pickupLat || !pickupLng) {
      log.warn("Cannot evaluate auto-accept - missing location data", {
        component: "DriverRequestHandler",
        data: {
          hasDriverLoc: !!driverLoc,
          hasPickupLat: !!pickupLat,
          hasPickupLng: !!pickupLng,
        }
      });
      return {
        shouldAutoAccept: false,
        flowStep: this.getFlowStepForService(data?.service),
      };
    }

    // Calculate distance using Haversine formula
    const distance = this.calculateHaversineDistance(
      driverLoc.latitude,
      driverLoc.longitude,
      pickupLat,
      pickupLng
    );

    const withinRadius = distance <= (prefs.autoAcceptRadius || 5);

    log.debug("Auto-accept evaluation", {
      component: "DriverRequestHandler",
      data: {
        distance,
        autoAcceptRadius: prefs.autoAcceptRadius || 5,
        withinRadius,
        shouldAutoAccept: prefs.autoAccept && withinRadius,
      }
    });

    return {
      shouldAutoAccept: prefs.autoAccept && withinRadius,
      flowStep: this.getFlowStepForService(data?.service),
    };
  }

  /**
   * Auto-acepta la solicitud de ride
   */
  private async autoAcceptRide(data: any): Promise<void> {
    const id = data?.ride?.ride_id || data?.rideId || data?.orderId || data?.id;
    const service = (data?.service || "").toString().toLowerCase();

    if (!id) {
      throw new Error("No valid ID found for auto-accept");
    }

    try {
      const key = generateIdempotencyKey();
      
      // Accept based on service type
      switch (service) {
        case "transport":
          await driverTransportService.accept(id, key);
          break;
        case "delivery":
          await driverDeliveryService.accept(id, key);
          break;
        case "mandado":
          await driverErrandService.accept(id, key);
          break;
        case "envio":
          await driverParcelService.accept(id, key);
          break;
        default:
          throw new Error(`Unknown service type: ${service}`);
      }

      // Join ride room
      websocketService.joinRideRoom(id);

      // Navigate to appropriate step
      const goTo = useMapFlowStore.getState().goTo;
      const nextStep = this.getNextStepForService(service) as any;
      goTo(nextStep);

      log.info("Ride auto-accepted successfully", {
        component: "DriverRequestHandler",
        data: {
          rideId: id,
          service,
          nextStep,
        }
      });
    } catch (error) {
      log.error("Failed to auto-accept ride", {
        component: "DriverRequestHandler",
        data: {
          rideId: id,
          service,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      });
      
      // Fallback to manual acceptance
      this.navigateToFlow(this.getFlowStepForService(service));
      throw error;
    }
  }

  /**
   * Navega al flujo apropiado para el servicio
   */
  private navigateToFlow(service: string): void {
    const startDriverStep = useMapFlowStore.getState().startWithDriverStep;
    const flowStep = this.getFlowStepForService(service);
    
    log.debug("Navigating to flow step", {
      component: "DriverRequestHandler",
      data: {
        service,
        flowStep,
      }
    });
    
    startDriverStep(flowStep as DriverFlowStep);
  }

  /**
   * Obtiene el paso de flujo inicial para el servicio
   */
  private getFlowStepForService(service: string): string {
    switch (service?.toLowerCase()) {
      case "transport":
        return FLOW_STEPS.DRIVER_TRANSPORT.RECIBIR_SOLICITUD;
      case "delivery":
        return FLOW_STEPS.DRIVER_DELIVERY.RECIBIR_SOLICITUD;
      case "mandado":
        return FLOW_STEPS.DRIVER_MANDADO.RECIBIR_SOLICITUD;
      case "envio":
        return FLOW_STEPS.DRIVER_ENVIO.RECIBIR_SOLICITUD;
      default:
        return FLOW_STEPS.DRIVER_TRANSPORT.RECIBIR_SOLICITUD;
    }
  }

  /**
   * Obtiene el siguiente paso después de aceptar
   */
  private getNextStepForService(service: string): string {
    switch (service?.toLowerCase()) {
      case "transport":
        return FLOW_STEPS.DRIVER_TRANSPORT.EN_CAMINO_ORIGEN;
      case "delivery":
        return FLOW_STEPS.DRIVER_DELIVERY.PREPARAR_PEDIDO;
      case "mandado":
        return FLOW_STEPS.DRIVER_MANDADO.EN_CAMINO_ORIGEN;
      case "envio":
        return FLOW_STEPS.DRIVER_ENVIO.EN_CAMINO_ORIGEN;
      default:
        return FLOW_STEPS.DRIVER_TRANSPORT.EN_CAMINO_ORIGEN;
    }
  }

  /**
   * Calcula distancia usando fórmula Haversine
   */
  private calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // Radio de la Tierra en km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

// Export singleton instance
export const driverRequestHandler = DriverRequestHandler.getInstance();
