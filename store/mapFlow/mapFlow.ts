import { create } from "zustand";
import { RideType } from "@/lib/unified-flow/constants";

export type MapFlowRole = "customer" | "driver";

// Global flow types
export type ServiceType = "transport" | "delivery" | "mandado" | "envio";

export type FlowRole = "customer" | "driver";

// Driver generic steps
export type DriverGeneralStep =
  | "DRIVER_DISPONIBILIDAD"
  | "DRIVER_FINALIZACION_RATING";

// Tipos más específicos para mejor type safety
export type SelectionStep = "SELECCION_SERVICIO";

export type CustomerTransportStep =
  | "CUSTOMER_TRANSPORT_DEFINICION_VIAJE"
  | "CUSTOMER_TRANSPORT_CONFIRM_ORIGIN"
  | "CUSTOMER_TRANSPORT_CONFIRM_DESTINATION"
  | "CUSTOMER_TRANSPORT_SELECCION_VEHICULO"
  | "CUSTOMER_TRANSPORT_METODOLOGIA_PAGO"
  | "CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR"
  | "CUSTOMER_TRANSPORT_CONFIRMAR_CONDUCTOR"
  | "CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION"
  | "CUSTOMER_TRANSPORT_ELECCION_CONDUCTOR" // Mantener para compatibilidad
  | "CUSTOMER_TRANSPORT_GESTION_CONFIRMACION"
  | "CUSTOMER_TRANSPORT_DURANTE_FINALIZACION"
  | "CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO"
  | "CUSTOMER_TRANSPORT_VIAJE_EN_CURSO"
  | "CUSTOMER_TRANSPORT_VIAJE_COMPLETADO"
  | "CUSTOMER_TRANSPORT_VIAJE_CANCELADO";

export type DriverTransportStep =
  | "DRIVER_TRANSPORT_RECIBIR_SOLICITUD"
  | "DRIVER_TRANSPORT_ACEPTAR_RECHAZAR"
  | "DRIVER_TRANSPORT_EN_CAMINO_ORIGEN"
  | "DRIVER_TRANSPORT_EN_ORIGEN"
  | "DRIVER_TRANSPORT_INICIAR_VIAJE"
  | "DRIVER_TRANSPORT_EN_VIAJE"
  | "DRIVER_TRANSPORT_COMPLETAR_VIAJE"
  | "DRIVER_TRANSPORT_VIAJE_COMPLETADO"
  | "DRIVER_TRANSPORT_VIAJE_CANCELADO";

export type CustomerDeliveryStep =
  | "CUSTOMER_DELIVERY_BUSQUEDA_NEGOCIO"
  | "CUSTOMER_DELIVERY_ARMADO_PEDIDO"
  | "CUSTOMER_DELIVERY_CHECKOUT_CONFIRMACION"
  | "CUSTOMER_DELIVERY_SEGUIMIENTO_DELIVERY";

export type DriverDeliveryStep =
  | "DRIVER_DELIVERY_RECIBIR_SOLICITUD"
  | "DRIVER_DELIVERY_PREPARAR_PEDIDO"
  | "DRIVER_DELIVERY_RECOGER_PEDIDO"
  | "DRIVER_DELIVERY_EN_CAMINO_ENTREGA"
  | "DRIVER_DELIVERY_ENTREGAR_PEDIDO";

export type CustomerMandadoStep =
  | "CUSTOMER_MANDADO_DETALLES_MANDADO"
  | "CUSTOMER_MANDADO_PRECIO_PAGO"
  | "CUSTOMER_MANDADO_BUSCANDO_CONDUCTOR"
  | "CUSTOMER_MANDADO_COMUNICACION_CONFIRMACION"
  | "CUSTOMER_MANDADO_FINALIZACION";

export type DriverMandadoStep =
  | "DRIVER_MANDADO_RECIBIR_SOLICITUD"
  | "DRIVER_MANDADO_EN_CAMINO_ORIGEN"
  | "DRIVER_MANDADO_RECOGER_PRODUCTOS"
  | "DRIVER_MANDADO_EN_CAMINO_DESTINO"
  | "DRIVER_MANDADO_ENTREGAR_MANDADO";

export type CustomerEnvioStep =
  | "CUSTOMER_ENVIO_DETALLES_ENVIO"
  | "CUSTOMER_ENVIO_CALCULAR_PRECIO"
  | "CUSTOMER_ENVIO_SEGUIMIENTO_PAQUETE"
  | "CUSTOMER_ENVIO_CONFIRMACION_ENTREGA";

export type DriverEnvioStep =
  | "DRIVER_ENVIO_RECIBIR_SOLICITUD"
  | "DRIVER_ENVIO_EN_CAMINO_ORIGEN"
  | "DRIVER_ENVIO_RECOGER_PAQUETE"
  | "DRIVER_ENVIO_EN_CAMINO_DESTINO"
  | "DRIVER_ENVIO_ENTREGAR_PAQUETE";

// Tipos combinados por rol
export type CustomerFlowStep =
  | SelectionStep
  | CustomerTransportStep
  | CustomerDeliveryStep
  | CustomerMandadoStep
  | CustomerEnvioStep;

export type DriverFlowStep =
  | DriverGeneralStep
  | DriverTransportStep
  | DriverDeliveryStep
  | DriverMandadoStep
  | DriverEnvioStep;

export type FlowStep =
  | SelectionStep
  | CustomerTransportStep
  | DriverGeneralStep
  | DriverTransportStep
  | CustomerDeliveryStep
  | DriverDeliveryStep
  | CustomerMandadoStep
  | DriverMandadoStep
  | CustomerEnvioStep
  | DriverEnvioStep;

// Constantes para facilitar el uso type-safe
export const FLOW_STEPS = {
  // Selection
  SELECCION_SERVICIO: "SELECCION_SERVICIO" as SelectionStep,

  // Driver General
  DRIVER_DISPONIBILIDAD: "DRIVER_DISPONIBILIDAD" as DriverFlowStep,
  DRIVER_FINALIZACION_RATING: "DRIVER_FINALIZACION_RATING" as DriverFlowStep,

  // Customer Transport
  CUSTOMER_TRANSPORT: {
    DEFINICION_VIAJE:
      "CUSTOMER_TRANSPORT_DEFINICION_VIAJE" as CustomerTransportStep,
    CONFIRM_ORIGIN:
      "CUSTOMER_TRANSPORT_CONFIRM_ORIGIN" as CustomerTransportStep,
    CONFIRM_DESTINATION:
      "CUSTOMER_TRANSPORT_CONFIRM_DESTINATION" as CustomerTransportStep,
    SELECCION_VEHICULO:
      "CUSTOMER_TRANSPORT_SELECCION_VEHICULO" as CustomerTransportStep,
    METODOLOGIA_PAGO:
      "CUSTOMER_TRANSPORT_METODOLOGIA_PAGO" as CustomerTransportStep,
    BUSCANDO_CONDUCTOR:
      "CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR" as CustomerTransportStep,
    CONFIRMAR_CONDUCTOR:
      "CUSTOMER_TRANSPORT_CONFIRMAR_CONDUCTOR" as CustomerTransportStep,
    ESPERANDO_ACEPTACION:
      "CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION" as CustomerTransportStep,
    ELECCION_CONDUCTOR:
      "CUSTOMER_TRANSPORT_ELECCION_CONDUCTOR" as CustomerTransportStep, // Mantener para compatibilidad
    GESTION_CONFIRMACION:
      "CUSTOMER_TRANSPORT_GESTION_CONFIRMACION" as CustomerTransportStep,
    DURANTE_FINALIZACION:
      "CUSTOMER_TRANSPORT_DURANTE_FINALIZACION" as CustomerTransportStep,
    CONDUCTOR_LLEGO:
      "CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO" as CustomerTransportStep,
    VIAJE_EN_CURSO:
      "CUSTOMER_TRANSPORT_VIAJE_EN_CURSO" as CustomerTransportStep,
    VIAJE_COMPLETADO:
      "CUSTOMER_TRANSPORT_VIAJE_COMPLETADO" as CustomerTransportStep,
    VIAJE_CANCELADO:
      "CUSTOMER_TRANSPORT_VIAJE_CANCELADO" as CustomerTransportStep,
  } as const,

  // Driver Transport
  DRIVER_TRANSPORT: {
    RECIBIR_SOLICITUD:
      "DRIVER_TRANSPORT_RECIBIR_SOLICITUD" as DriverTransportStep,
    ACEPTAR_RECHAZAR:
      "DRIVER_TRANSPORT_ACEPTAR_RECHAZAR" as DriverTransportStep,
    EN_CAMINO_ORIGEN:
      "DRIVER_TRANSPORT_EN_CAMINO_ORIGEN" as DriverTransportStep,
    EN_ORIGEN: "DRIVER_TRANSPORT_EN_ORIGEN" as DriverTransportStep,
    INICIAR_VIAJE: "DRIVER_TRANSPORT_INICIAR_VIAJE" as DriverTransportStep,
    EN_VIAJE: "DRIVER_TRANSPORT_EN_VIAJE" as DriverTransportStep,
    COMPLETAR_VIAJE: "DRIVER_TRANSPORT_COMPLETAR_VIAJE" as DriverTransportStep,
    VIAJE_COMPLETADO:
      "DRIVER_TRANSPORT_VIAJE_COMPLETADO" as DriverTransportStep,
    VIAJE_CANCELADO: "DRIVER_TRANSPORT_VIAJE_CANCELADO" as DriverTransportStep,
  } as const,

  // Customer Delivery
  CUSTOMER_DELIVERY: {
    BUSQUEDA_NEGOCIO:
      "CUSTOMER_DELIVERY_BUSQUEDA_NEGOCIO" as CustomerDeliveryStep,
    ARMADO_PEDIDO: "CUSTOMER_DELIVERY_ARMADO_PEDIDO" as CustomerDeliveryStep,
    CHECKOUT_CONFIRMACION:
      "CUSTOMER_DELIVERY_CHECKOUT_CONFIRMACION" as CustomerDeliveryStep,
    SEGUIMIENTO_DELIVERY:
      "CUSTOMER_DELIVERY_SEGUIMIENTO_DELIVERY" as CustomerDeliveryStep,
  } as const,

  // Driver Delivery
  DRIVER_DELIVERY: {
    RECIBIR_SOLICITUD:
      "DRIVER_DELIVERY_RECIBIR_SOLICITUD" as DriverDeliveryStep,
    PREPARAR_PEDIDO: "DRIVER_DELIVERY_PREPARAR_PEDIDO" as DriverDeliveryStep,
    RECOGER_PEDIDO: "DRIVER_DELIVERY_RECOGER_PEDIDO" as DriverDeliveryStep,
    EN_CAMINO_ENTREGA:
      "DRIVER_DELIVERY_EN_CAMINO_ENTREGA" as DriverDeliveryStep,
    ENTREGAR_PEDIDO: "DRIVER_DELIVERY_ENTREGAR_PEDIDO" as DriverDeliveryStep,
  } as const,

  // Customer Mandado
  CUSTOMER_MANDADO: {
    DETALLES_MANDADO:
      "CUSTOMER_MANDADO_DETALLES_MANDADO" as CustomerMandadoStep,
    PRECIO_PAGO: "CUSTOMER_MANDADO_PRECIO_PAGO" as CustomerMandadoStep,
    BUSCANDO_CONDUCTOR:
      "CUSTOMER_MANDADO_BUSCANDO_CONDUCTOR" as CustomerMandadoStep,
    COMUNICACION_CONFIRMACION:
      "CUSTOMER_MANDADO_COMUNICACION_CONFIRMACION" as CustomerMandadoStep,
    FINALIZACION: "CUSTOMER_MANDADO_FINALIZACION" as CustomerMandadoStep,
  } as const,

  // Driver Mandado
  DRIVER_MANDADO: {
    RECIBIR_SOLICITUD: "DRIVER_MANDADO_RECIBIR_SOLICITUD" as DriverMandadoStep,
    EN_CAMINO_ORIGEN: "DRIVER_MANDADO_EN_CAMINO_ORIGEN" as DriverMandadoStep,
    RECOGER_PRODUCTOS: "DRIVER_MANDADO_RECOGER_PRODUCTOS" as DriverMandadoStep,
    EN_CAMINO_DESTINO: "DRIVER_MANDADO_EN_CAMINO_DESTINO" as DriverMandadoStep,
    ENTREGAR_MANDADO: "DRIVER_MANDADO_ENTREGAR_MANDADO" as DriverMandadoStep,
  } as const,

  // Customer Envío
  CUSTOMER_ENVIO: {
    DETALLES_ENVIO: "CUSTOMER_ENVIO_DETALLES_ENVIO" as CustomerEnvioStep,
    CALCULAR_PRECIO: "CUSTOMER_ENVIO_CALCULAR_PRECIO" as CustomerEnvioStep,
    SEGUIMIENTO_PAQUETE:
      "CUSTOMER_ENVIO_SEGUIMIENTO_PAQUETE" as CustomerEnvioStep,
    CONFIRMACION_ENTREGA:
      "CUSTOMER_ENVIO_CONFIRMACION_ENTREGA" as CustomerEnvioStep,
  } as const,

  // Driver Envío
  DRIVER_ENVIO: {
    RECIBIR_SOLICITUD: "DRIVER_ENVIO_RECIBIR_SOLICITUD" as DriverEnvioStep,
    EN_CAMINO_ORIGEN: "DRIVER_ENVIO_EN_CAMINO_ORIGEN" as DriverEnvioStep,
    RECOGER_PAQUETE: "DRIVER_ENVIO_RECOGER_PAQUETE" as DriverEnvioStep,
    EN_CAMINO_DESTINO: "DRIVER_ENVIO_EN_CAMINO_DESTINO" as DriverEnvioStep,
    ENTREGAR_PAQUETE: "DRIVER_ENVIO_ENTREGAR_PAQUETE" as DriverEnvioStep,
  } as const,

  // Flat constants for compatibility with components that import from constants
  CUSTOMER_TRANSPORT_DEFINICION_VIAJE: "CUSTOMER_TRANSPORT_DEFINICION_VIAJE" as CustomerTransportStep,
  CUSTOMER_TRANSPORT_CONFIRM_ORIGIN: "CUSTOMER_TRANSPORT_CONFIRM_ORIGIN" as CustomerTransportStep,
  CUSTOMER_TRANSPORT_CONFIRM_DESTINATION: "CUSTOMER_TRANSPORT_CONFIRM_DESTINATION" as CustomerTransportStep,
  CUSTOMER_TRANSPORT_SELECCION_VEHICULO: "CUSTOMER_TRANSPORT_SELECCION_VEHICULO" as CustomerTransportStep,
  CUSTOMER_TRANSPORT_METODOLOGIA_PAGO: "CUSTOMER_TRANSPORT_METODOLOGIA_PAGO" as CustomerTransportStep,
  CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR: "CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR" as CustomerTransportStep,
  CUSTOMER_TRANSPORT_CONFIRMAR_CONDUCTOR: "CUSTOMER_TRANSPORT_CONFIRMAR_CONDUCTOR" as CustomerTransportStep,
  CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION: "CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION" as CustomerTransportStep,
  CUSTOMER_TRANSPORT_GESTION_CONFIRMACION: "CUSTOMER_TRANSPORT_GESTION_CONFIRMACION" as CustomerTransportStep,
  CUSTOMER_TRANSPORT_DURANTE_FINALIZACION: "CUSTOMER_TRANSPORT_DURANTE_FINALIZACION" as CustomerTransportStep,
  CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO: "CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO" as CustomerTransportStep,
  CUSTOMER_TRANSPORT_VIAJE_EN_CURSO: "CUSTOMER_TRANSPORT_VIAJE_EN_CURSO" as CustomerTransportStep,
  CUSTOMER_TRANSPORT_VIAJE_COMPLETADO: "CUSTOMER_TRANSPORT_VIAJE_COMPLETADO" as CustomerTransportStep,
  CUSTOMER_TRANSPORT_VIAJE_CANCELADO: "CUSTOMER_TRANSPORT_VIAJE_CANCELADO" as CustomerTransportStep,

  DRIVER_TRANSPORT_RECIBIR_SOLICITUD: "DRIVER_TRANSPORT_RECIBIR_SOLICITUD" as DriverTransportStep,
  DRIVER_TRANSPORT_ACEPTAR_RECHAZAR: "DRIVER_TRANSPORT_ACEPTAR_RECHAZAR" as DriverTransportStep,
  DRIVER_TRANSPORT_EN_CAMINO_ORIGEN: "DRIVER_TRANSPORT_EN_CAMINO_ORIGEN" as DriverTransportStep,
  DRIVER_TRANSPORT_EN_ORIGEN: "DRIVER_TRANSPORT_EN_ORIGEN" as DriverTransportStep,
  DRIVER_TRANSPORT_INICIAR_VIAJE: "DRIVER_TRANSPORT_INICIAR_VIAJE" as DriverTransportStep,
  DRIVER_TRANSPORT_EN_VIAJE: "DRIVER_TRANSPORT_EN_VIAJE" as DriverTransportStep,
  DRIVER_TRANSPORT_COMPLETAR_VIAJE: "DRIVER_TRANSPORT_COMPLETAR_VIAJE" as DriverTransportStep,

  CUSTOMER_DELIVERY_BUSQUEDA_NEGOCIO: "CUSTOMER_DELIVERY_BUSQUEDA_NEGOCIO" as CustomerDeliveryStep,
  CUSTOMER_DELIVERY_ARMADO_PEDIDO: "CUSTOMER_DELIVERY_ARMADO_PEDIDO" as CustomerDeliveryStep,
  CUSTOMER_DELIVERY_CHECKOUT_CONFIRMACION: "CUSTOMER_DELIVERY_CHECKOUT_CONFIRMACION" as CustomerDeliveryStep,
  CUSTOMER_DELIVERY_SEGUIMIENTO_DELIVERY: "CUSTOMER_DELIVERY_SEGUIMIENTO_DELIVERY" as CustomerDeliveryStep,

  DRIVER_DELIVERY_RECIBIR_SOLICITUD: "DRIVER_DELIVERY_RECIBIR_SOLICITUD" as DriverDeliveryStep,
  DRIVER_DELIVERY_PREPARAR_PEDIDO: "DRIVER_DELIVERY_PREPARAR_PEDIDO" as DriverDeliveryStep,
  DRIVER_DELIVERY_RECOGER_PEDIDO: "DRIVER_DELIVERY_RECOGER_PEDIDO" as DriverDeliveryStep,
  DRIVER_DELIVERY_EN_CAMINO_ENTREGA: "DRIVER_DELIVERY_EN_CAMINO_ENTREGA" as DriverDeliveryStep,
  DRIVER_DELIVERY_ENTREGAR_PEDIDO: "DRIVER_DELIVERY_ENTREGAR_PEDIDO" as DriverDeliveryStep,

  CUSTOMER_MANDADO_DETALLES_MANDADO: "CUSTOMER_MANDADO_DETALLES_MANDADO" as CustomerMandadoStep,
  CUSTOMER_MANDADO_PRECIO_PAGO: "CUSTOMER_MANDADO_PRECIO_PAGO" as CustomerMandadoStep,
  CUSTOMER_MANDADO_BUSCANDO_CONDUCTOR: "CUSTOMER_MANDADO_BUSCANDO_CONDUCTOR" as CustomerMandadoStep,
  CUSTOMER_MANDADO_COMUNICACION_CONFIRMACION: "CUSTOMER_MANDADO_COMUNICACION_CONFIRMACION" as CustomerMandadoStep,
  CUSTOMER_MANDADO_FINALIZACION: "CUSTOMER_MANDADO_FINALIZACION" as CustomerMandadoStep,

  DRIVER_MANDADO_RECIBIR_SOLICITUD: "DRIVER_MANDADO_RECIBIR_SOLICITUD" as DriverMandadoStep,
  DRIVER_MANDADO_EN_CAMINO_ORIGEN: "DRIVER_MANDADO_EN_CAMINO_ORIGEN" as DriverMandadoStep,
  DRIVER_MANDADO_RECOGER_PRODUCTOS: "DRIVER_MANDADO_RECOGER_PRODUCTOS" as DriverMandadoStep,
  DRIVER_MANDADO_EN_CAMINO_DESTINO: "DRIVER_MANDADO_EN_CAMINO_DESTINO" as DriverMandadoStep,
  DRIVER_MANDADO_ENTREGAR_MANDADO: "DRIVER_MANDADO_ENTREGAR_MANDADO" as DriverMandadoStep,

  CUSTOMER_ENVIO_DETALLES_ENVIO: "CUSTOMER_ENVIO_DETALLES_ENVIO" as CustomerEnvioStep,
  CUSTOMER_ENVIO_CALCULAR_PRECIO: "CUSTOMER_ENVIO_CALCULAR_PRECIO" as CustomerEnvioStep,
  CUSTOMER_ENVIO_SEGUIMIENTO_PAQUETE: "CUSTOMER_ENVIO_SEGUIMIENTO_PAQUETE" as CustomerEnvioStep,
  CUSTOMER_ENVIO_CONFIRMACION_ENTREGA: "CUSTOMER_ENVIO_CONFIRMACION_ENTREGA" as CustomerEnvioStep,

  DRIVER_ENVIO_RECIBIR_SOLICITUD: "DRIVER_ENVIO_RECIBIR_SOLICITUD" as DriverEnvioStep,
  DRIVER_ENVIO_EN_CAMINO_ORIGEN: "DRIVER_ENVIO_EN_CAMINO_ORIGEN" as DriverEnvioStep,
  DRIVER_ENVIO_RECOGER_PAQUETE: "DRIVER_ENVIO_RECOGER_PAQUETE" as DriverEnvioStep,
  DRIVER_ENVIO_EN_CAMINO_DESTINO: "DRIVER_ENVIO_EN_CAMINO_DESTINO" as DriverEnvioStep,
  DRIVER_ENVIO_ENTREGAR_PAQUETE: "DRIVER_ENVIO_ENTREGAR_PAQUETE" as DriverEnvioStep,
} as const;

export type MapFlowStep =
  | "idle"
  | "travel_start"
  | "set_locations"
  | "confirm_origin"
  | "choose_service"
  | "choose_driver"
  | "summary"
  | FlowStep;

interface StepConfig {
  id: MapFlowStep;
  bottomSheet: {
    visible: boolean;
    minHeight: number;
    maxHeight: number;
    initialHeight: number;
    showHandle?: boolean;
    allowDrag?: boolean;
    className?: string;
    snapPoints?: number[];
    handleHeight?: number;
  };
  mapInteraction?: "none" | "pan_to_confirm" | "follow_driver" | "follow_route";
  transition?: {
    type: "none" | "fade" | "slide";
    duration?: number; // ms
  };
}

export interface MapFlowState {
  role: MapFlowRole;
  service?: ServiceType; // For unified flow
  step: MapFlowStep;
  history: MapFlowStep[];
  isActive: boolean;
  stepConfig: Record<MapFlowStep, StepConfig>;
  // Current flow identifiers
  rideId?: number | null;
  orderId?: number | null;
  errandId?: number | null;
  parcelId?: number | null;

  // New state for ride type and confirmations
  rideType: RideType;
  confirmedOrigin?: any; // LocationData
  confirmedDestination?: any; // LocationData
  phoneNumber?: string; // Only for FOR_OTHER

  // Driver matching state
  isMatching: boolean;
  matchedDriver?: any; // DriverData
  matchingTimeout: number; // seconds
  matchingStartTime?: Date;
  acceptanceTimeout: number; // seconds
  acceptanceStartTime?: Date;

  // Ride configuration
  selectedTierId?: number;
  selectedVehicleTypeId?: number;

  // Price calculation state
  estimatedPrice?: number;
  routeInfo?: {
    distanceMiles: number;
    durationMinutes: number;
    originAddress: string;
    destinationAddress: string;
  };
  priceBreakdown?: {
    baseFare: number;
    distanceCost: number;
    timeCost: number;
  };

  // Async driver search state
  asyncSearch: {
    searchId: string | null;
    status: 'idle' | 'searching' | 'found' | 'timeout' | 'cancelled';
    matchedDriver?: any;
    timeRemaining: number;
    error: string | null;
    startTime?: Date;
  };

  // Derived UI state
  bottomSheetVisible: boolean;
  bottomSheetMinHeight: number;
  bottomSheetMaxHeight: number;
  bottomSheetInitialHeight: number;
  bottomSheetAllowDrag: boolean;
  bottomSheetClassName?: string;
  bottomSheetSnapPoints?: number[];
  bottomSheetHandleHeight: number;
  mapInteraction: NonNullable<StepConfig["mapInteraction"]>;
  transitionType:
    | NonNullable<NonNullable<StepConfig["transition"]>["type"]>
    | "none";
  transitionDuration: number;

  // Actions
  start: (role: MapFlowRole) => void;
  startService: (service: ServiceType, role?: FlowRole) => void; // For unified flow
  stop: () => void;
  reset: () => void;
  goTo: (step: MapFlowStep) => void;
  goToStep: (stepName: string) => void;
  next: () => void;
  back: () => void;
  updateStepBottomSheet: (
    step: MapFlowStep,
    cfg: Partial<StepConfig["bottomSheet"]>,
  ) => void;
  setMapInteraction: (
    step: MapFlowStep,
    interaction: NonNullable<StepConfig["mapInteraction"]>,
  ) => void;
  updateStepTransition: (
    step: MapFlowStep,
    cfg: Partial<NonNullable<StepConfig["transition"]>>,
  ) => void;
  setRideId: (id: number | null) => void;
  setOrderId: (id: number | null) => void;
  setErrandId: (id: number | null) => void;
  setParcelId: (id: number | null) => void;

  // New actions for ride type and confirmations
  setRideType: (type: RideType) => void;
  setConfirmedOrigin: (location: any) => void;
  setConfirmedDestination: (location: any) => void;
  setPhoneNumber: (phone: string) => void;

  // Driver matching actions
  startMatching: (timeoutSeconds?: number) => void;
  stopMatching: () => void;
  setMatchedDriver: (driver: any) => void;
  clearMatchedDriver: () => void;
  startAcceptanceTimer: (timeoutSeconds?: number) => void;
  stopAcceptanceTimer: () => void;

  // Ride configuration actions
  setSelectedTierId: (tierId: number) => void;
  setSelectedVehicleTypeId: (vehicleTypeId: number) => void;

  // Price calculation actions
  setEstimatedPrice: (price: number) => void;
  setRouteInfo: (routeInfo: {
    distanceMiles: number;
    durationMinutes: number;
    originAddress: string;
    destinationAddress: string;
  }) => void;
  setPriceBreakdown: (breakdown: {
    baseFare: number;
    distanceCost: number;
    timeCost: number;
  }) => void;

  // Async driver search actions
  startAsyncSearch: (searchId: string, timeRemaining: number) => void;
  updateAsyncSearchStatus: (status: string, data?: any) => void;
  cancelAsyncSearch: () => void;
  confirmAsyncDriver: (driverId: number) => void;

  // Helper methods
  calculateTimeRemaining: () => number;
  getInitialStepConfig: (
    step: MapFlowStep,
  ) => ReturnType<typeof getInitialStepConfig>;
  startWithConfig: (
    step: MapFlowStep,
    role?: MapFlowRole,
  ) => ReturnType<typeof getInitialStepConfig>;

  // Type-safe helper methods
  startWithCustomerStep: (
    step: CustomerFlowStep,
  ) => ReturnType<typeof getInitialStepConfig>;
  startWithDriverStep: (
    step: DriverFlowStep,
  ) => ReturnType<typeof getInitialStepConfig>;
  startWithTransportStep: (
    step: CustomerTransportStep | DriverTransportStep,
    role: FlowRole,
  ) => ReturnType<typeof getInitialStepConfig>;
  startWithDeliveryStep: (
    step: CustomerDeliveryStep | DriverDeliveryStep,
    role: FlowRole,
  ) => ReturnType<typeof getInitialStepConfig>;
  startWithMandadoStep: (
    step: CustomerMandadoStep | DriverMandadoStep,
    role: FlowRole,
  ) => ReturnType<typeof getInitialStepConfig>;
  startWithEnvioStep: (
    step: CustomerEnvioStep | DriverEnvioStep,
    role: FlowRole,
  ) => ReturnType<typeof getInitialStepConfig>;
}

// Service flows configuration for unified flow
const SERVICE_FLOWS: Record<FlowRole, Record<ServiceType, FlowStep[]>> = {
  // Customer flows
  customer: {
    transport: [
      "CUSTOMER_TRANSPORT_DEFINICION_VIAJE",
      "CUSTOMER_TRANSPORT_SELECCION_VEHICULO",
      "CUSTOMER_TRANSPORT_METODOLOGIA_PAGO",
      "CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR",
      "CUSTOMER_TRANSPORT_CONFIRMAR_CONDUCTOR",
      "CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION",
      "CUSTOMER_TRANSPORT_DURANTE_FINALIZACION",
    ],
    // Note: CONFIRM_DESTINATION and CONFIRM_ORIGIN are handled conditionally in the next() function
    delivery: [
      "CUSTOMER_DELIVERY_BUSQUEDA_NEGOCIO",
      "CUSTOMER_DELIVERY_ARMADO_PEDIDO",
      "CUSTOMER_DELIVERY_CHECKOUT_CONFIRMACION",
      "CUSTOMER_DELIVERY_SEGUIMIENTO_DELIVERY",
    ],
    mandado: [
      "CUSTOMER_MANDADO_DETALLES_MANDADO",
      "CUSTOMER_MANDADO_PRECIO_PAGO",
      "CUSTOMER_MANDADO_BUSCANDO_CONDUCTOR",
      "CUSTOMER_MANDADO_COMUNICACION_CONFIRMACION",
      "CUSTOMER_MANDADO_FINALIZACION",
    ],
    envio: [
      "CUSTOMER_ENVIO_DETALLES_ENVIO",
      "CUSTOMER_ENVIO_CALCULAR_PRECIO",
      "CUSTOMER_ENVIO_SEGUIMIENTO_PAQUETE",
      "CUSTOMER_ENVIO_CONFIRMACION_ENTREGA",
    ],
  },
  // Driver flows
  driver: {
    transport: [
      "DRIVER_TRANSPORT_RECIBIR_SOLICITUD",
      "DRIVER_TRANSPORT_ACEPTAR_RECHAZAR",
      "DRIVER_TRANSPORT_EN_CAMINO_ORIGEN",
      "DRIVER_TRANSPORT_EN_ORIGEN",
      "DRIVER_TRANSPORT_INICIAR_VIAJE",
      "DRIVER_TRANSPORT_EN_VIAJE",
      "DRIVER_TRANSPORT_COMPLETAR_VIAJE",
    ],
    delivery: [
      "DRIVER_DELIVERY_RECIBIR_SOLICITUD",
      "DRIVER_DELIVERY_PREPARAR_PEDIDO",
      "DRIVER_DELIVERY_RECOGER_PEDIDO",
      "DRIVER_DELIVERY_EN_CAMINO_ENTREGA",
      "DRIVER_DELIVERY_ENTREGAR_PEDIDO",
    ],
    mandado: [
      "DRIVER_MANDADO_RECIBIR_SOLICITUD",
      "DRIVER_MANDADO_EN_CAMINO_ORIGEN",
      "DRIVER_MANDADO_RECOGER_PRODUCTOS",
      "DRIVER_MANDADO_EN_CAMINO_DESTINO",
      "DRIVER_MANDADO_ENTREGAR_MANDADO",
    ],
    envio: [
      "DRIVER_ENVIO_RECIBIR_SOLICITUD",
      "DRIVER_ENVIO_EN_CAMINO_ORIGEN",
      "DRIVER_ENVIO_RECOGER_PAQUETE",
      "DRIVER_ENVIO_EN_CAMINO_DESTINO",
      "DRIVER_ENVIO_ENTREGAR_PAQUETE",
    ],
  },
};

const DEFAULT_CONFIG: Record<MapFlowStep, StepConfig> = {
  idle: {
    id: "idle",
    bottomSheet: {
      visible: false,
      minHeight: 0,
      maxHeight: 0,
      initialHeight: 0,
      showHandle: false,
      allowDrag: true,
    },
    mapInteraction: "none",
    transition: { type: "none", duration: 0 },
  },
  travel_start: {
    id: "travel_start",
    bottomSheet: {
      visible: true,
      minHeight: 140,
      maxHeight: 420,
      initialHeight: 200,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },
  set_locations: {
    id: "set_locations",
    bottomSheet: {
      visible: true,
      minHeight: 160,
      maxHeight: 520,
      initialHeight: 320,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },
  confirm_origin: {
    id: "confirm_origin",
    bottomSheet: {
      visible: true,
      minHeight: 100,
      maxHeight: 260,
      initialHeight: 120,
      showHandle: true,
      allowDrag: false,
    },
    mapInteraction: "pan_to_confirm",
    transition: { type: "fade", duration: 180 },
  },
  choose_service: {
    id: "choose_service",
    bottomSheet: {
      visible: true,
      minHeight: 200,
      maxHeight: 560,
      initialHeight: 440,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },
  choose_driver: {
    id: "choose_driver",
    bottomSheet: {
      visible: true,
      minHeight: 160,
      maxHeight: 520,
      initialHeight: 380,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "follow_route",
    transition: { type: "fade", duration: 200 },
  },
  summary: {
    id: "summary",
    bottomSheet: {
      visible: true,
      minHeight: 180,
      maxHeight: 520,
      initialHeight: 320,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "follow_route",
    transition: { type: "slide", duration: 220 },
  },

  // Unified flow steps
  SELECCION_SERVICIO: {
    id: "SELECCION_SERVICIO",
    bottomSheet: {
      visible: true,
      minHeight: 140,
      maxHeight: 420,
      initialHeight: 200,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },

  // Driver General
  DRIVER_DISPONIBILIDAD: {
    id: "DRIVER_DISPONIBILIDAD",
    bottomSheet: {
      visible: true,
      minHeight: 120,
      maxHeight: 360,
      initialHeight: 160,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "none",
    transition: { type: "fade", duration: 180 },
  },
  DRIVER_FINALIZACION_RATING: {
    id: "DRIVER_FINALIZACION_RATING",
    bottomSheet: {
      visible: true,
      minHeight: 260,
      maxHeight: 640,
      initialHeight: 480,
      showHandle: true,
      allowDrag: false,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },

  // Customer Transport
  CUSTOMER_TRANSPORT_DEFINICION_VIAJE: {
    id: "CUSTOMER_TRANSPORT_DEFINICION_VIAJE",
    bottomSheet: {
      visible: true,
      minHeight: 160,
      maxHeight: 520,
      initialHeight: 320,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },
  CUSTOMER_TRANSPORT_CONFIRM_ORIGIN: {
    id: "CUSTOMER_TRANSPORT_CONFIRM_ORIGIN",
    bottomSheet: {
      visible: false,
      minHeight: 0,
      maxHeight: 0,
      initialHeight: 0,
      showHandle: false,
      allowDrag: false,
    },
    mapInteraction: "pan_to_confirm",
    transition: { type: "fade", duration: 200 },
  },
  CUSTOMER_TRANSPORT_CONFIRM_DESTINATION: {
    id: "CUSTOMER_TRANSPORT_CONFIRM_DESTINATION",
    bottomSheet: {
      visible: false,
      minHeight: 0,
      maxHeight: 0,
      initialHeight: 0,
      showHandle: false,
      allowDrag: false,
    },
    mapInteraction: "pan_to_confirm",
    transition: { type: "fade", duration: 200 },
  },
  CUSTOMER_TRANSPORT_SELECCION_VEHICULO: {
    id: "CUSTOMER_TRANSPORT_SELECCION_VEHICULO",
    bottomSheet: {
      visible: true,
      minHeight: 200,
      maxHeight: 560,
      initialHeight: 440,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },
  CUSTOMER_TRANSPORT_METODOLOGIA_PAGO: {
    id: "CUSTOMER_TRANSPORT_METODOLOGIA_PAGO",
    bottomSheet: {
      visible: true,
      minHeight: 180,
      maxHeight: 520,
      initialHeight: 320,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },
  CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR: {
    id: "CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR",
    bottomSheet: {
      visible: true,
      minHeight: 300,
      maxHeight: 700,
      initialHeight: 500,
      showHandle: false,
      allowDrag: false,
    },
    mapInteraction: "none",
    transition: { type: "fade", duration: 200 },
  },
  CUSTOMER_TRANSPORT_CONFIRMAR_CONDUCTOR: {
    id: "CUSTOMER_TRANSPORT_CONFIRMAR_CONDUCTOR",
    bottomSheet: {
      visible: true,
      minHeight: 160,
      maxHeight: 420,
      initialHeight: 240,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "follow_route",
    transition: { type: "fade", duration: 200 },
  },
  CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION: {
    id: "CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION",
    bottomSheet: {
      visible: true,
      minHeight: 140,
      maxHeight: 360,
      initialHeight: 180,
      showHandle: false,
      allowDrag: false,
    },
    mapInteraction: "none",
    transition: { type: "fade", duration: 200 },
  },
  CUSTOMER_TRANSPORT_ELECCION_CONDUCTOR: {
    id: "CUSTOMER_TRANSPORT_ELECCION_CONDUCTOR",
    bottomSheet: {
      visible: true,
      minHeight: 160,
      maxHeight: 520,
      initialHeight: 380,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "follow_route",
    transition: { type: "fade", duration: 200 },
  },
  CUSTOMER_TRANSPORT_GESTION_CONFIRMACION: {
    id: "CUSTOMER_TRANSPORT_GESTION_CONFIRMACION",
    bottomSheet: {
      visible: true,
      minHeight: 100,
      maxHeight: 260,
      initialHeight: 120,
      showHandle: true,
      allowDrag: false,
    },
    mapInteraction: "pan_to_confirm",
    transition: { type: "fade", duration: 180 },
  },
  CUSTOMER_TRANSPORT_DURANTE_FINALIZACION: {
    id: "CUSTOMER_TRANSPORT_DURANTE_FINALIZACION",
    bottomSheet: {
      visible: true,
      minHeight: 180,
      maxHeight: 520,
      initialHeight: 320,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "follow_route",
    transition: { type: "slide", duration: 220 },
  },
  CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO: {
    id: "CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO",
    bottomSheet: {
      visible: true,
      minHeight: 200,
      maxHeight: 400,
      initialHeight: 300,
      showHandle: false,
      allowDrag: false,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },
  CUSTOMER_TRANSPORT_VIAJE_EN_CURSO: {
    id: "CUSTOMER_TRANSPORT_VIAJE_EN_CURSO",
    bottomSheet: {
      visible: true,
      minHeight: 180,
      maxHeight: 350,
      initialHeight: 220,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "follow_driver",
    transition: { type: "fade", duration: 200 },
  },
  CUSTOMER_TRANSPORT_VIAJE_COMPLETADO: {
    id: "CUSTOMER_TRANSPORT_VIAJE_COMPLETADO",
    bottomSheet: {
      visible: true,
      minHeight: 200,
      maxHeight: 600,
      initialHeight: 400,
      showHandle: true,
      allowDrag: false,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },
  CUSTOMER_TRANSPORT_VIAJE_CANCELADO: {
    id: "CUSTOMER_TRANSPORT_VIAJE_CANCELADO",
    bottomSheet: {
      visible: true,
      minHeight: 180,
      maxHeight: 350,
      initialHeight: 250,
      showHandle: false,
      allowDrag: false,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },

  // Customer Delivery
  CUSTOMER_DELIVERY_BUSQUEDA_NEGOCIO: {
    id: "CUSTOMER_DELIVERY_BUSQUEDA_NEGOCIO",
    bottomSheet: {
      visible: true,
      minHeight: 200,
      maxHeight: 600,
      initialHeight: 400,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },
  CUSTOMER_DELIVERY_ARMADO_PEDIDO: {
    id: "CUSTOMER_DELIVERY_ARMADO_PEDIDO",
    bottomSheet: {
      visible: true,
      minHeight: 100,
      maxHeight: 800,
      initialHeight: 600,
      showHandle: false,
      allowDrag: false,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },
  CUSTOMER_DELIVERY_CHECKOUT_CONFIRMACION: {
    id: "CUSTOMER_DELIVERY_CHECKOUT_CONFIRMACION",
    bottomSheet: {
      visible: true,
      minHeight: 100,
      maxHeight: 800,
      initialHeight: 600,
      showHandle: false,
      allowDrag: false,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },
  CUSTOMER_DELIVERY_SEGUIMIENTO_DELIVERY: {
    id: "CUSTOMER_DELIVERY_SEGUIMIENTO_DELIVERY",
    bottomSheet: {
      visible: true,
      minHeight: 120,
      maxHeight: 300,
      initialHeight: 150,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "follow_driver",
    transition: { type: "fade", duration: 200 },
  },

  // Customer Mandado
  CUSTOMER_MANDADO_DETALLES_MANDADO: {
    id: "CUSTOMER_MANDADO_DETALLES_MANDADO",
    bottomSheet: {
      visible: true,
      minHeight: 100,
      maxHeight: 800,
      initialHeight: 600,
      showHandle: false,
      allowDrag: false,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },
  CUSTOMER_MANDADO_PRECIO_PAGO: {
    id: "CUSTOMER_MANDADO_PRECIO_PAGO",
    bottomSheet: {
      visible: true,
      minHeight: 100,
      maxHeight: 800,
      initialHeight: 600,
      showHandle: false,
      allowDrag: false,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },
  CUSTOMER_MANDADO_BUSCANDO_CONDUCTOR: {
    id: "CUSTOMER_MANDADO_BUSCANDO_CONDUCTOR",
    bottomSheet: {
      visible: true,
      minHeight: 100,
      maxHeight: 200,
      initialHeight: 120,
      showHandle: false,
      allowDrag: false,
    },
    mapInteraction: "none",
    transition: { type: "fade", duration: 200 },
  },
  CUSTOMER_MANDADO_COMUNICACION_CONFIRMACION: {
    id: "CUSTOMER_MANDADO_COMUNICACION_CONFIRMACION",
    bottomSheet: {
      visible: true,
      minHeight: 140,
      maxHeight: 400,
      initialHeight: 240,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "follow_driver",
    transition: { type: "fade", duration: 200 },
  },
  CUSTOMER_MANDADO_FINALIZACION: {
    id: "CUSTOMER_MANDADO_FINALIZACION",
    bottomSheet: {
      visible: true,
      minHeight: 180,
      maxHeight: 520,
      initialHeight: 320,
      showHandle: true,
      allowDrag: false,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },

  // Customer Envío
  CUSTOMER_ENVIO_DETALLES_ENVIO: {
    id: "CUSTOMER_ENVIO_DETALLES_ENVIO",
    bottomSheet: {
      visible: true,
      minHeight: 100,
      maxHeight: 800,
      initialHeight: 600,
      showHandle: false,
      allowDrag: false,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },
  CUSTOMER_ENVIO_CALCULAR_PRECIO: {
    id: "CUSTOMER_ENVIO_CALCULAR_PRECIO",
    bottomSheet: {
      visible: true,
      minHeight: 100,
      maxHeight: 800,
      initialHeight: 600,
      showHandle: false,
      allowDrag: false,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },
  CUSTOMER_ENVIO_SEGUIMIENTO_PAQUETE: {
    id: "CUSTOMER_ENVIO_SEGUIMIENTO_PAQUETE",
    bottomSheet: {
      visible: true,
      minHeight: 120,
      maxHeight: 300,
      initialHeight: 150,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "follow_driver",
    transition: { type: "fade", duration: 200 },
  },
  CUSTOMER_ENVIO_CONFIRMACION_ENTREGA: {
    id: "CUSTOMER_ENVIO_CONFIRMACION_ENTREGA",
    bottomSheet: {
      visible: true,
      minHeight: 180,
      maxHeight: 520,
      initialHeight: 320,
      showHandle: true,
      allowDrag: false,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },

  // Driver Transport
  DRIVER_TRANSPORT_RECIBIR_SOLICITUD: {
    id: "DRIVER_TRANSPORT_RECIBIR_SOLICITUD",
    bottomSheet: {
      visible: true,
      minHeight: 200,
      maxHeight: 500,
      initialHeight: 300,
      showHandle: true,
      allowDrag: false,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },
  DRIVER_TRANSPORT_ACEPTAR_RECHAZAR: {
    id: "DRIVER_TRANSPORT_ACEPTAR_RECHAZAR",
    bottomSheet: {
      visible: true,
      minHeight: 180,
      maxHeight: 400,
      initialHeight: 220,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "none",
    transition: { type: "fade", duration: 200 },
  },
  DRIVER_TRANSPORT_EN_CAMINO_ORIGEN: {
    id: "DRIVER_TRANSPORT_EN_CAMINO_ORIGEN",
    bottomSheet: {
      visible: true,
      minHeight: 120,
      maxHeight: 300,
      initialHeight: 150,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "follow_route",
    transition: { type: "fade", duration: 200 },
  },
  DRIVER_TRANSPORT_EN_ORIGEN: {
    id: "DRIVER_TRANSPORT_EN_ORIGEN",
    bottomSheet: {
      visible: true,
      minHeight: 140,
      maxHeight: 350,
      initialHeight: 180,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "pan_to_confirm",
    transition: { type: "fade", duration: 180 },
  },
  DRIVER_TRANSPORT_INICIAR_VIAJE: {
    id: "DRIVER_TRANSPORT_INICIAR_VIAJE",
    bottomSheet: {
      visible: true,
      minHeight: 160,
      maxHeight: 400,
      initialHeight: 200,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "follow_route",
    transition: { type: "slide", duration: 220 },
  },
  DRIVER_TRANSPORT_EN_VIAJE: {
    id: "DRIVER_TRANSPORT_EN_VIAJE",
    bottomSheet: {
      visible: true,
      minHeight: 120,
      maxHeight: 300,
      initialHeight: 150,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "follow_route",
    transition: { type: "fade", duration: 200 },
  },
  DRIVER_TRANSPORT_COMPLETAR_VIAJE: {
    id: "DRIVER_TRANSPORT_COMPLETAR_VIAJE",
    bottomSheet: {
      visible: true,
      minHeight: 180,
      maxHeight: 500,
      initialHeight: 300,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },
  DRIVER_TRANSPORT_VIAJE_COMPLETADO: {
    id: "DRIVER_TRANSPORT_VIAJE_COMPLETADO",
    bottomSheet: {
      visible: true,
      minHeight: 200,
      maxHeight: 400,
      initialHeight: 280,
      showHandle: true,
      allowDrag: false,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },
  DRIVER_TRANSPORT_VIAJE_CANCELADO: {
    id: "DRIVER_TRANSPORT_VIAJE_CANCELADO",
    bottomSheet: {
      visible: true,
      minHeight: 150,
      maxHeight: 300,
      initialHeight: 200,
      showHandle: false,
      allowDrag: false,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },

  // Driver Delivery
  DRIVER_DELIVERY_RECIBIR_SOLICITUD: {
    id: "DRIVER_DELIVERY_RECIBIR_SOLICITUD",
    bottomSheet: {
      visible: true,
      minHeight: 200,
      maxHeight: 500,
      initialHeight: 300,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },
  DRIVER_DELIVERY_PREPARAR_PEDIDO: {
    id: "DRIVER_DELIVERY_PREPARAR_PEDIDO",
    bottomSheet: {
      visible: true,
      minHeight: 140,
      maxHeight: 350,
      initialHeight: 180,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "none",
    transition: { type: "fade", duration: 200 },
  },
  DRIVER_DELIVERY_RECOGER_PEDIDO: {
    id: "DRIVER_DELIVERY_RECOGER_PEDIDO",
    bottomSheet: {
      visible: true,
      minHeight: 160,
      maxHeight: 400,
      initialHeight: 200,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "pan_to_confirm",
    transition: { type: "fade", duration: 180 },
  },
  DRIVER_DELIVERY_EN_CAMINO_ENTREGA: {
    id: "DRIVER_DELIVERY_EN_CAMINO_ENTREGA",
    bottomSheet: {
      visible: true,
      minHeight: 120,
      maxHeight: 300,
      initialHeight: 150,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "follow_route",
    transition: { type: "fade", duration: 200 },
  },
  DRIVER_DELIVERY_ENTREGAR_PEDIDO: {
    id: "DRIVER_DELIVERY_ENTREGAR_PEDIDO",
    bottomSheet: {
      visible: true,
      minHeight: 180,
      maxHeight: 500,
      initialHeight: 300,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "pan_to_confirm",
    transition: { type: "slide", duration: 220 },
  },

  // Driver Mandado
  DRIVER_MANDADO_RECIBIR_SOLICITUD: {
    id: "DRIVER_MANDADO_RECIBIR_SOLICITUD",
    bottomSheet: {
      visible: true,
      minHeight: 200,
      maxHeight: 500,
      initialHeight: 300,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },
  DRIVER_MANDADO_EN_CAMINO_ORIGEN: {
    id: "DRIVER_MANDADO_EN_CAMINO_ORIGEN",
    bottomSheet: {
      visible: true,
      minHeight: 120,
      maxHeight: 300,
      initialHeight: 150,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "follow_route",
    transition: { type: "fade", duration: 200 },
  },
  DRIVER_MANDADO_RECOGER_PRODUCTOS: {
    id: "DRIVER_MANDADO_RECOGER_PRODUCTOS",
    bottomSheet: {
      visible: true,
      minHeight: 160,
      maxHeight: 400,
      initialHeight: 200,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "pan_to_confirm",
    transition: { type: "fade", duration: 180 },
  },
  DRIVER_MANDADO_EN_CAMINO_DESTINO: {
    id: "DRIVER_MANDADO_EN_CAMINO_DESTINO",
    bottomSheet: {
      visible: true,
      minHeight: 120,
      maxHeight: 300,
      initialHeight: 150,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "follow_route",
    transition: { type: "fade", duration: 200 },
  },
  DRIVER_MANDADO_ENTREGAR_MANDADO: {
    id: "DRIVER_MANDADO_ENTREGAR_MANDADO",
    bottomSheet: {
      visible: true,
      minHeight: 180,
      maxHeight: 500,
      initialHeight: 300,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "pan_to_confirm",
    transition: { type: "slide", duration: 220 },
  },

  // Driver Envío
  DRIVER_ENVIO_RECIBIR_SOLICITUD: {
    id: "DRIVER_ENVIO_RECIBIR_SOLICITUD",
    bottomSheet: {
      visible: true,
      minHeight: 200,
      maxHeight: 500,
      initialHeight: 300,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "none",
    transition: { type: "slide", duration: 220 },
  },
  DRIVER_ENVIO_EN_CAMINO_ORIGEN: {
    id: "DRIVER_ENVIO_EN_CAMINO_ORIGEN",
    bottomSheet: {
      visible: true,
      minHeight: 120,
      maxHeight: 300,
      initialHeight: 150,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "follow_route",
    transition: { type: "fade", duration: 200 },
  },
  DRIVER_ENVIO_RECOGER_PAQUETE: {
    id: "DRIVER_ENVIO_RECOGER_PAQUETE",
    bottomSheet: {
      visible: true,
      minHeight: 160,
      maxHeight: 400,
      initialHeight: 200,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "pan_to_confirm",
    transition: { type: "fade", duration: 180 },
  },
  DRIVER_ENVIO_EN_CAMINO_DESTINO: {
    id: "DRIVER_ENVIO_EN_CAMINO_DESTINO",
    bottomSheet: {
      visible: true,
      minHeight: 120,
      maxHeight: 300,
      initialHeight: 150,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "follow_route",
    transition: { type: "fade", duration: 200 },
  },
  DRIVER_ENVIO_ENTREGAR_PAQUETE: {
    id: "DRIVER_ENVIO_ENTREGAR_PAQUETE",
    bottomSheet: {
      visible: true,
      minHeight: 180,
      maxHeight: 500,
      initialHeight: 300,
      showHandle: true,
      allowDrag: true,
    },
    mapInteraction: "pan_to_confirm",
    transition: { type: "slide", duration: 220 },
  },
};

// Helper function to get initial config for a step
const getInitialStepConfig = (step: MapFlowStep) => {
  const config = DEFAULT_CONFIG[step];
  return {
    bottomSheetVisible: config.bottomSheet.visible,
    bottomSheetMinHeight: config.bottomSheet.minHeight,
    bottomSheetMaxHeight: config.bottomSheet.maxHeight,
    bottomSheetInitialHeight: config.bottomSheet.initialHeight,
    bottomSheetAllowDrag: config.bottomSheet.allowDrag ?? true,
    bottomSheetClassName: config.bottomSheet.className,
    bottomSheetSnapPoints: config.bottomSheet.snapPoints,
    bottomSheetHandleHeight: config.bottomSheet.handleHeight ?? 44,
    mapInteraction: config.mapInteraction || "none",
    transitionType: config.transition?.type || "none",
    transitionDuration: config.transition?.duration || 0,
  };
};

export const useMapFlowStore = create<MapFlowState>((set, get) => ({
  role: "customer",
  service: undefined,
  step: "SELECCION_SERVICIO", // Start with service selection
  history: ["SELECCION_SERVICIO"],
  isActive: true, // Start as active
  stepConfig: DEFAULT_CONFIG,
  rideId: null,
  orderId: null,
  errandId: null,
  parcelId: null,

  // New state for ride type and confirmations
  rideType: RideType.NORMAL,
  confirmedOrigin: undefined,
  confirmedDestination: undefined,
  phoneNumber: undefined,

  // Driver matching state
  isMatching: false,
  matchedDriver: undefined,
  matchingTimeout: 30, // 30 seconds default
  matchingStartTime: undefined,
  acceptanceTimeout: 30, // 30 seconds default
  acceptanceStartTime: undefined,

  // Ride configuration
  selectedTierId: undefined,
  selectedVehicleTypeId: undefined,

  // Async driver search state
  asyncSearch: {
    searchId: null,
    status: 'idle' as const,
    matchedDriver: undefined,
    timeRemaining: 0,
    error: null,
    startTime: undefined,
  },

  // Initialize with correct config for SELECCION_SERVICIO
  ...getInitialStepConfig("SELECCION_SERVICIO"),

  start: (role) => {
    
    const cfg = get().stepConfig["travel_start"];
    
    const newState = {
      role,
      isActive: true,
      step: "travel_start",
      history: ["travel_start"],
      bottomSheetVisible: cfg.bottomSheet.visible,
      bottomSheetMinHeight: cfg.bottomSheet.minHeight,
      bottomSheetMaxHeight: cfg.bottomSheet.maxHeight,
      bottomSheetInitialHeight: cfg.bottomSheet.initialHeight,
      bottomSheetAllowDrag: cfg.bottomSheet.allowDrag ?? true,
      bottomSheetClassName: cfg.bottomSheet.className,
      bottomSheetSnapPoints: cfg.bottomSheet.snapPoints,
      bottomSheetHandleHeight: cfg.bottomSheet.handleHeight ?? 44,
      mapInteraction: cfg.mapInteraction || "none",
      transitionType: cfg.transition?.type || "none",
      transitionDuration: cfg.transition?.duration || 0,
    };
    
    set(() => newState as MapFlowState);
  },

  startService: (service: ServiceType, role: FlowRole = "customer") => {
    
    const firstStep = SERVICE_FLOWS[role][service][0];
    const cfg = get().stepConfig[firstStep];

    set(() => ({
      role,
      service,
      isActive: true,
      step: firstStep,
      history: [firstStep],
      bottomSheetVisible: cfg.bottomSheet.visible,
      bottomSheetMinHeight: cfg.bottomSheet.minHeight,
      bottomSheetMaxHeight: cfg.bottomSheet.maxHeight,
      bottomSheetInitialHeight: cfg.bottomSheet.initialHeight,
      bottomSheetAllowDrag: cfg.bottomSheet.allowDrag ?? true,
      bottomSheetClassName: cfg.bottomSheet.className,
      bottomSheetSnapPoints: cfg.bottomSheet.snapPoints,
      bottomSheetHandleHeight: cfg.bottomSheet.handleHeight ?? 44,
      mapInteraction: cfg.mapInteraction || "none",
      transitionType: cfg.transition?.type || "none",
      transitionDuration: cfg.transition?.duration || 0,
    }));
  },

  stop: () => {
    set(() => ({
      isActive: false,
      step: "idle",
      history: [],
      rideId: null,
      orderId: null,
      errandId: null,
      parcelId: null,
      bottomSheetVisible: false,
      bottomSheetMinHeight: 0,
      bottomSheetMaxHeight: 0,
      bottomSheetInitialHeight: 0,
      bottomSheetAllowDrag: true,
      bottomSheetClassName: undefined,
      bottomSheetSnapPoints: undefined,
      bottomSheetHandleHeight: 44,
      mapInteraction: "none",
      transitionType: "none",
      transitionDuration: 0,
    }));
  },

  reset: () => {
    const cfg = get().stepConfig["idle"];
    set(() => ({
      step: "idle",
      history: [],
      rideId: null,
      orderId: null,
      errandId: null,
      parcelId: null,
      bottomSheetVisible: cfg.bottomSheet.visible,
      bottomSheetMinHeight: cfg.bottomSheet.minHeight,
      bottomSheetMaxHeight: cfg.bottomSheet.maxHeight,
      bottomSheetInitialHeight: cfg.bottomSheet.initialHeight,
      bottomSheetAllowDrag: cfg.bottomSheet.allowDrag ?? true,
      bottomSheetClassName: cfg.bottomSheet.className,
      bottomSheetSnapPoints: cfg.bottomSheet.snapPoints,
      bottomSheetHandleHeight: cfg.bottomSheet.handleHeight ?? 44,
      mapInteraction: cfg.mapInteraction || "none",
      transitionType: cfg.transition?.type || "none",
      transitionDuration: cfg.transition?.duration || 0,
    }));
  },

  goTo: (step) => {
    const cfg = get().stepConfig[step];
    set((state) => ({
      step,
      history: [...state.history, step],
      bottomSheetVisible: cfg.bottomSheet.visible,
      bottomSheetMinHeight: cfg.bottomSheet.minHeight,
      bottomSheetMaxHeight: cfg.bottomSheet.maxHeight,
      bottomSheetInitialHeight: cfg.bottomSheet.initialHeight,
      bottomSheetAllowDrag: cfg.bottomSheet.allowDrag ?? true,
      bottomSheetClassName: cfg.bottomSheet.className,
      bottomSheetSnapPoints: cfg.bottomSheet.snapPoints,
      bottomSheetHandleHeight: cfg.bottomSheet.handleHeight ?? 44,
      mapInteraction: cfg.mapInteraction || "none",
      transitionType: cfg.transition?.type || "none",
      transitionDuration: cfg.transition?.duration || 0,
    }));
  },

  goToStep: (stepName: string) => {
    

    // Validate that the step exists in our configuration
    const stepConfig = get().stepConfig;
    const validStepNames = Object.keys(stepConfig);

    if (!validStepNames.includes(stepName)) {
      
      
      return;
    }

    // Convert string to MapFlowStep type (it's safe now that we validated)
    const step = stepName as MapFlowStep;
    

    // Use the existing goTo method
    get().goTo(step);
  },

  next: () => {
    const state = get();

    // Handle special case for transport service with conditional navigation
    if (state.service === "transport") {
      if (state.role === "customer") {
        const currentStep = state.step;

        if (currentStep === FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE) {
          // Navigate based on rideType
          if (state.rideType === RideType.FOR_OTHER) {
            get().goTo(FLOW_STEPS.CUSTOMER_TRANSPORT_CONFIRM_ORIGIN);
          } else {
            get().goTo(FLOW_STEPS.CUSTOMER_TRANSPORT_CONFIRM_DESTINATION);
          }
          return;
        }

        if (currentStep === FLOW_STEPS.CUSTOMER_TRANSPORT_CONFIRM_ORIGIN) {
          // Always go to CONFIRM_DESTINATION after confirming origin
          get().goTo(FLOW_STEPS.CUSTOMER_TRANSPORT_CONFIRM_DESTINATION);
          return;
        }

        if (currentStep === FLOW_STEPS.CUSTOMER_TRANSPORT_CONFIRM_DESTINATION) {
          // Go to vehicle selection after confirming destination
          get().goTo(FLOW_STEPS.CUSTOMER_TRANSPORT_SELECCION_VEHICULO);
          return;
        }
      } else if (state.role === "driver") {
        const currentStep = state.step;

        if (currentStep === FLOW_STEPS.DRIVER_TRANSPORT_RECIBIR_SOLICITUD) {
          // After receiving request, go to accept/reject step
          get().goTo(FLOW_STEPS.DRIVER_TRANSPORT_ACEPTAR_RECHAZAR);
          return;
        }
      }
    }

    // Handle original flow steps
    const originalOrder: MapFlowStep[] = [
      "travel_start",
      "set_locations",
      "confirm_origin",
      "choose_service",
      "choose_driver",
      "summary",
    ];

    // Handle unified flow steps
    if (
      state.service &&
      state.role &&
      SERVICE_FLOWS[state.role]?.[state.service]
    ) {
      const serviceFlow = SERVICE_FLOWS[state.role][state.service];
      const currentIndex = serviceFlow.indexOf(state.step as FlowStep);

      if (currentIndex >= 0 && currentIndex < serviceFlow.length - 1) {
        const nextStep = serviceFlow[currentIndex + 1];
        get().goTo(nextStep);
      }
    } else {
      // Handle original flow
      const current = state.step;
      const idx = originalOrder.indexOf(current);
      if (idx !== -1 && idx < originalOrder.length - 1) {
        const nextStep = originalOrder[idx + 1];
        get().goTo(nextStep);
      }
    }
  },

  back: () => {
    const state = get();
    const history = [...state.history];
    history.pop(); // remove current
    const previous = history[history.length - 1] || "travel_start";
    const cfg = state.stepConfig[previous];
    set(() => ({
      step: previous,
      history,
      bottomSheetVisible: cfg.bottomSheet.visible,
      bottomSheetMinHeight: cfg.bottomSheet.minHeight,
      bottomSheetMaxHeight: cfg.bottomSheet.maxHeight,
      bottomSheetInitialHeight: cfg.bottomSheet.initialHeight,
      bottomSheetAllowDrag: cfg.bottomSheet.allowDrag ?? true,
      bottomSheetClassName: cfg.bottomSheet.className,
      mapInteraction: cfg.mapInteraction || "none",
      transitionType: cfg.transition?.type || "none",
      transitionDuration: cfg.transition?.duration || 0,
    }));
  },

  setRideId: (id) => set(() => ({ rideId: id })),
  setOrderId: (id) => set(() => ({ orderId: id })),
  setErrandId: (id) => set(() => ({ errandId: id })),
  setParcelId: (id) => set(() => ({ parcelId: id })),

  // New actions for ride type and confirmations
  setRideType: (type) => set(() => ({ rideType: type })),
  setConfirmedOrigin: (location) => set(() => ({ confirmedOrigin: location })),
  setConfirmedDestination: (location) =>
    set(() => ({ confirmedDestination: location })),
  setPhoneNumber: (phone) => set(() => ({ phoneNumber: phone })),

  // Driver matching actions
  startMatching: (timeoutSeconds = 30) =>
    set((state) => ({
      isMatching: true,
      matchingTimeout: timeoutSeconds,
      matchingStartTime: new Date(),
      matchedDriver: undefined,
    })),
  stopMatching: () =>
    set(() => ({
      isMatching: false,
      matchingStartTime: undefined,
    })),
  setMatchedDriver: (driver) =>
    set(() => ({
      matchedDriver: driver,
      isMatching: false,
    })),
  clearMatchedDriver: () =>
    set(() => ({
      matchedDriver: undefined,
    })),
  startAcceptanceTimer: (timeoutSeconds = 30) =>
    set(() => ({
      acceptanceTimeout: timeoutSeconds,
      acceptanceStartTime: new Date(),
    })),
  stopAcceptanceTimer: () =>
    set(() => ({
      acceptanceStartTime: undefined,
    })),

  // Ride configuration actions
  setSelectedTierId: (tierId) => set(() => ({ selectedTierId: tierId })),
  setSelectedVehicleTypeId: (vehicleTypeId) =>
    set(() => ({ selectedVehicleTypeId: vehicleTypeId })),

  // Price calculation actions
  setEstimatedPrice: (price) => {
    
    set(() => ({ estimatedPrice: price }));
    
  },
  setRouteInfo: (routeInfo) => {
    
    set(() => ({ routeInfo }));
  },
  setPriceBreakdown: (breakdown) => {
    
    set(() => ({ priceBreakdown: breakdown }));
  },

  // Async driver search actions
  startAsyncSearch: (searchId, timeRemaining) => {
    
    set((state) => ({
      asyncSearch: {
        ...state.asyncSearch,
        searchId,
        status: 'searching' as const,
        timeRemaining,
        error: null,
        startTime: new Date(),
      },
    }));
  },

  updateAsyncSearchStatus: (status, data) => {
    
    set((state) => ({
      asyncSearch: {
        ...state.asyncSearch,
        status: status as 'idle' | 'searching' | 'found' | 'timeout' | 'cancelled',
        ...(data?.matchedDriver && { matchedDriver: data.matchedDriver }),
        ...(data?.timeRemaining !== undefined && { timeRemaining: data.timeRemaining }),
        ...(data?.error && { error: data.error }),
      },
    }));
  },

  cancelAsyncSearch: () => {
    
    set((state) => ({
      asyncSearch: {
        ...state.asyncSearch,
        status: 'cancelled' as const,
        timeRemaining: 0,
        error: null,
      },
    }));
  },

  confirmAsyncDriver: (driverId) => {
    
    // Aquí podríamos actualizar el estado del conductor confirmado
    // o simplemente resetear la búsqueda
    set((state) => ({
      asyncSearch: {
        ...state.asyncSearch,
        status: 'idle' as const,
        timeRemaining: 0,
        error: null,
      },
    }));
  },

  // Helper method to calculate time remaining
  calculateTimeRemaining: () => {
    const state = get();
    if (!state.asyncSearch.startTime || state.asyncSearch.status !== 'searching') {
      return 0;
    }

    const elapsed = Math.floor((Date.now() - state.asyncSearch.startTime.getTime()) / 1000);
    const maxWaitTime = 300; // Default max wait time in seconds
    const remaining = Math.max(0, maxWaitTime - elapsed);

    return remaining;
  },

  // Helper method to start countdown timer for async search
  startAsyncSearchTimer: () => {
    const state = get();
    if (state.asyncSearch.status !== 'searching' || !state.asyncSearch.startTime) {
      
      return;
    }

    const maxWaitTime = 300; // 5 minutes default
    

    // Clear any existing timer
    if ((state as any).asyncSearchTimer) {
      clearInterval((state as any).asyncSearchTimer);
    }

    // Start new timer
    const timer = setInterval(() => {
      const currentState = get();
      if (currentState.asyncSearch.status !== 'searching') {
        clearInterval(timer);
        return;
      }

      const remaining = currentState.calculateTimeRemaining();

      // Update time remaining
      set((state) => ({
        asyncSearch: {
          ...state.asyncSearch,
          timeRemaining: remaining,
        },
      }));

      // Check if time is up
      if (remaining === 0) {
        
        clearInterval(timer);

        // Update status to timeout
        set((state) => ({
          asyncSearch: {
            ...state.asyncSearch,
            status: 'timeout' as const,
            error: 'Tiempo de búsqueda agotado',
          },
        }));
      }
    }, 1000); // Update every second

    // Store timer reference (using any to avoid TypeScript issues)
    (state as any).asyncSearchTimer = timer;
  },

  updateStepBottomSheet: (step, cfg) => {
    set((state) => {
      const prev = state.stepConfig[step];
      const nextCfg: StepConfig = {
        ...prev,
        bottomSheet: { ...prev.bottomSheet, ...cfg },
      };
      const stepConfig = { ...state.stepConfig, [step]: nextCfg };
      const isCurrent = state.step === step;
      return {
        stepConfig,
        ...(isCurrent
          ? {
              bottomSheetVisible: nextCfg.bottomSheet.visible,
              bottomSheetMinHeight: nextCfg.bottomSheet.minHeight,
              bottomSheetMaxHeight: nextCfg.bottomSheet.maxHeight,
              bottomSheetInitialHeight: nextCfg.bottomSheet.initialHeight,
              bottomSheetAllowDrag: nextCfg.bottomSheet.allowDrag ?? true,
              bottomSheetClassName: nextCfg.bottomSheet.className,
              bottomSheetSnapPoints: nextCfg.bottomSheet.snapPoints,
              bottomSheetHandleHeight: nextCfg.bottomSheet.handleHeight ?? 44,
            }
          : {}),
      } as Partial<MapFlowState> as MapFlowState;
    });
  },

  setMapInteraction: (step, interaction) => {
    set((state) => {
      const prev = state.stepConfig[step];
      const nextCfg: StepConfig = { ...prev, mapInteraction: interaction };
      const stepConfig = { ...state.stepConfig, [step]: nextCfg };
      const isCurrent = state.step === step;
      return {
        stepConfig,
        ...(isCurrent ? { mapInteraction: interaction } : {}),
      } as Partial<MapFlowState> as MapFlowState;
    });
  },

  updateStepTransition: (step, cfg) => {
    set((state) => {
      const prev = state.stepConfig[step];
      const nextCfg: StepConfig = {
        ...prev,
        transition: {
          ...(prev.transition || { type: "none", duration: 0 }),
          ...cfg,
        },
      };
      const stepConfig = { ...state.stepConfig, [step]: nextCfg };
      const isCurrent = state.step === step;
      return {
        stepConfig,
        ...(isCurrent
          ? {
              transitionType: nextCfg.transition?.type || "none",
              transitionDuration: nextCfg.transition?.duration || 0,
            }
          : {}),
      } as Partial<MapFlowState> as MapFlowState;
    });
  },

  // Helper methods
  getInitialStepConfig: (step) => {
    
    return getInitialStepConfig(step);
  },

  startWithConfig: (step, role) => {
    

    // Get the configuration for the step
    const config = getInitialStepConfig(step);

    // Update the store state with the step configuration
    set(() => ({
      step,
      history: [step],
      isActive: true,
      bottomSheetVisible: config.bottomSheetVisible,
      bottomSheetMinHeight: config.bottomSheetMinHeight,
      bottomSheetMaxHeight: config.bottomSheetMaxHeight,
      bottomSheetInitialHeight: config.bottomSheetInitialHeight,
      bottomSheetAllowDrag: config.bottomSheetAllowDrag,
      bottomSheetClassName: config.bottomSheetClassName,
      bottomSheetSnapPoints: config.bottomSheetSnapPoints,
      bottomSheetHandleHeight: config.bottomSheetHandleHeight,
      mapInteraction: config.mapInteraction,
      transitionType: config.transitionType,
      transitionDuration: config.transitionDuration,
      ...(role ? { role } : {}), // Update role if provided
    }));

    return config;
  },

  // Type-safe helper methods
  startWithCustomerStep: (step) => {
    
    return get().startWithConfig(step, "customer");
  },

  startWithDriverStep: (step) => {
    
    return get().startWithConfig(step, "driver");
  },

  startWithTransportStep: (step, role) => {
    
    return get().startWithConfig(step, role);
  },

  startWithDeliveryStep: (step, role) => {
    
    return get().startWithConfig(step, role);
  },

  startWithMandadoStep: (step, role) => {
    
    return get().startWithConfig(step, role);
  },

  startWithEnvioStep: (step, role) => {
    
    return get().startWithConfig(step, role);
  },
}));
