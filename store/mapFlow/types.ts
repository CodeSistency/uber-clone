import type { ReactNode } from "react";
import type { RideType } from "../../lib/unified-flow/constants";

// Roles and services
export type MapFlowRole = "customer" | "driver";

export type ServiceType = "transport" | "delivery" | "mandado" | "envio";

export type FlowRole = "customer" | "driver";

// Driver generic steps
export type DriverGeneralStep =
  | "DRIVER_DISPONIBILIDAD"
  | "DRIVER_FINALIZACION_RATING";

// Selection
export type SelectionStep = "SELECCION_SERVICIO";

// Customer transport steps
export type CustomerTransportStep =
  | "CUSTOMER_TRANSPORT_DEFINICION_VIAJE"
  | "CUSTOMER_TRANSPORT_CONFIRM_ORIGIN"
  | "CUSTOMER_TRANSPORT_CONFIRM_DESTINATION"
  | "CUSTOMER_TRANSPORT_SELECCION_VEHICULO"
  | "CUSTOMER_TRANSPORT_METODOLOGIA_PAGO"
  | "CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR"
  | "CUSTOMER_TRANSPORT_CONFIRMAR_CONDUCTOR"
  | "CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION"
  | "CUSTOMER_TRANSPORT_ELECCION_CONDUCTOR"
  | "CUSTOMER_TRANSPORT_GESTION_CONFIRMACION"
  | "CUSTOMER_TRANSPORT_DURANTE_FINALIZACION"
  | "CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO"
  | "CUSTOMER_TRANSPORT_VIAJE_EN_CURSO"
  | "CUSTOMER_TRANSPORT_VIAJE_COMPLETADO"
  | "CUSTOMER_TRANSPORT_VIAJE_CANCELADO";

// Driver transport steps
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

// Customer delivery steps
export type CustomerDeliveryStep =
  | "CUSTOMER_DELIVERY_BUSQUEDA_NEGOCIO"
  | "CUSTOMER_DELIVERY_ARMADO_PEDIDO"
  | "CUSTOMER_DELIVERY_CHECKOUT_CONFIRMACION"
  | "CUSTOMER_DELIVERY_SEGUIMIENTO_DELIVERY";

// Driver delivery steps
export type DriverDeliveryStep =
  | "DRIVER_DELIVERY_RECIBIR_SOLICITUD"
  | "DRIVER_DELIVERY_PREPARAR_PEDIDO"
  | "DRIVER_DELIVERY_RECOGER_PEDIDO"
  | "DRIVER_DELIVERY_EN_CAMINO_ENTREGA"
  | "DRIVER_DELIVERY_ENTREGAR_PEDIDO";

// Customer mandado steps
export type CustomerMandadoStep =
  | "CUSTOMER_MANDADO_DETALLES_MANDADO"
  | "CUSTOMER_MANDADO_PRECIO_PAGO"
  | "CUSTOMER_MANDADO_BUSCANDO_CONDUCTOR"
  | "CUSTOMER_MANDADO_COMUNICACION_CONFIRMACION"
  | "CUSTOMER_MANDADO_FINALIZACION";

// Driver mandado steps
export type DriverMandadoStep =
  | "DRIVER_MANDADO_RECIBIR_SOLICITUD"
  | "DRIVER_MANDADO_EN_CAMINO_ORIGEN"
  | "DRIVER_MANDADO_RECOGER_PRODUCTOS"
  | "DRIVER_MANDADO_EN_CAMINO_DESTINO"
  | "DRIVER_MANDADO_ENTREGAR_MANDADO";

// Customer envio steps
export type CustomerEnvioStep =
  | "CUSTOMER_ENVIO_DETALLES_ENVIO"
  | "CUSTOMER_ENVIO_CALCULAR_PRECIO"
  | "CUSTOMER_ENVIO_SEGUIMIENTO_PAQUETE"
  | "CUSTOMER_ENVIO_CONFIRMACION_ENTREGA";

// Driver envio steps
export type DriverEnvioStep =
  | "DRIVER_ENVIO_RECIBIR_SOLICITUD"
  | "DRIVER_ENVIO_EN_CAMINO_ORIGEN"
  | "DRIVER_ENVIO_RECOGER_PAQUETE"
  | "DRIVER_ENVIO_EN_CAMINO_DESTINO"
  | "DRIVER_ENVIO_ENTREGAR_PAQUETE";

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

export type MapFlowStep =
  | "idle"
  | "travel_start"
  | "set_locations"
  | "confirm_origin"
  | "choose_service"
  | "choose_driver"
  | "summary"
  | FlowStep;

export interface StepConfig {
  id: MapFlowStep;
  bottomSheet: {
    visible: boolean;
    minHeight: number;
    maxHeight: number;
    initialHeight: number;
    showHandle?: boolean;
    allowDrag?: boolean;
    allowClose?: boolean;
    className?: string;
    snapPoints?: number[];
    handleHeight?: number;
    useGradient?: boolean;
    useBlur?: boolean;
    gradientColors?: string[];
    blurIntensity?: number;
    blurTint?: "light" | "dark" | "default";
    bottomBar?: ReactNode;
    bottomBarHeight?: number;
    showBottomBarAt?: number;
  };
  mapInteraction?: "none" | "pan_to_confirm" | "follow_driver" | "follow_route";
  transition?: {
    type: "none" | "fade" | "slide";
    duration?: number;
  };
}

export interface VariantState {
  usePagerView: boolean;
  currentPageIndex: number;
  totalPages: number;
  isTransitioning: boolean;
  pagerSteps: MapFlowStep[];
  currentStepIndex: number;
  enableSwipe: boolean;
  showProgress: boolean;
  allowSkip: boolean;
  canNavigateBack: boolean;
  canNavigateForward: boolean;
  progressColor: string;
  progressSize: number;
  progressStyle: "dots" | "bar" | "steps" | "numbers";
  completedSteps: MapFlowStep[];
  requiredSteps: MapFlowStep[];
  skippedSteps: MapFlowStep[];
  transitionDuration: number;
  animationType: "slide" | "fade" | "scale";
  enableAnimations: boolean;
  hasError: boolean;
  errorMessage: string | null;
  retryCount: number;
}

export type ServiceFlowDefinition = Record<
  FlowRole,
  Record<ServiceType, FlowStep[]>
>;

export interface LocationSnapshot {
  latitude: number;
  longitude: number;
  address?: string | null;
  timestamp?: Date;
}

export interface DriverSnapshot {
  id: number;
  name?: string;
  title?: string;
  vehicleType?: string;
  car_seats?: number;
}

export interface RouteInfoSnapshot {
  distanceMiles: number;
  durationMinutes: number;
  originAddress: string;
  destinationAddress: string;
}

export interface PriceBreakdownSnapshot {
  baseFare: number;
  distanceCost: number;
  timeCost: number;
}

export interface AsyncSearchState {
  searchId: string | null;
  status: "idle" | "searching" | "found" | "timeout" | "cancelled";
  matchedDriver?: DriverSnapshot | null;
  timeRemaining: number;
  error: string | null;
  startTime?: Date;
}

export interface StepConfigSummary {
  bottomSheetVisible: boolean;
  bottomSheetMinHeight: number;
  bottomSheetMaxHeight: number;
  bottomSheetInitialHeight: number;
  bottomSheetAllowDrag: boolean;
  bottomSheetAllowClose: boolean;
  bottomSheetShowHandle: boolean;
  bottomSheetUseGradient: boolean;
  bottomSheetUseBlur: boolean;
  bottomSheetBottomBar: ReactNode | null;
  bottomSheetClassName?: string;
  bottomSheetSnapPoints?: number[];
  bottomSheetHandleHeight: number;
  mapInteraction: NonNullable<StepConfig["mapInteraction"]>;
  transitionType: NonNullable<NonNullable<StepConfig["transition"]>["type"]> | "none";
  transitionDuration: number;
}

export interface NavigationConfigUpdate {
  enableSwipe?: boolean;
  showProgress?: boolean;
  allowSkip?: boolean;
  canNavigateBack?: boolean;
  canNavigateForward?: boolean;
}

export interface VisualConfigUpdate {
  progressColor?: string;
  progressSize?: number;
  progressStyle?: "dots" | "bar" | "steps";
}

export interface AnimationConfigUpdate {
  transitionDuration?: number;
  animationType?: "slide" | "fade" | "scale";
  enableAnimations?: boolean;
}

export interface ValidationConfigUpdate {
  requiredSteps?: MapFlowStep[];
}

export interface AsyncSearchUpdatePayload {
  matchedDriver?: DriverSnapshot | null;
  timeRemaining?: number;
  error?: string | null;
}

export interface MapFlowSnapshot {
  role: MapFlowRole;
  service?: ServiceType;
  step: MapFlowStep;
  history: MapFlowStep[];
  isActive: boolean;
  stepConfig: Record<MapFlowStep, StepConfig>;
  steps: Record<MapFlowStep, StepConfig>;
  flow: {
    bottomSheetVisible: boolean;
    bottomSheetMinHeight: number;
    bottomSheetMaxHeight: number;
    bottomSheetInitialHeight: number;
    bottomSheetShowHandle: boolean;
    bottomSheetAllowDrag: boolean;
    bottomSheetAllowClose: boolean;
    bottomSheetUseGradient: boolean;
    bottomSheetUseBlur: boolean;
    bottomSheetBottomBar: ReactNode | null;
    bottomSheetClassName?: string;
    bottomSheetSnapPoints?: number[];
    bottomSheetHandleHeight?: number;
    // New state for BottomSheet local control
    bottomSheetManuallyClosed: boolean;
    showReopenButton: boolean;
  };
  variant: VariantState;
  rideId?: number | null;
  orderId?: number | null;
  errandId?: number | null;
  parcelId?: number | null;
  rideType: RideType;
  confirmedOrigin?: LocationSnapshot | null;
  confirmedDestination?: LocationSnapshot | null;
  phoneNumber?: string;
  isMatching: boolean;
  matchedDriver?: DriverSnapshot | null;
  matchingTimeout: number;
  matchingStartTime?: Date;
  acceptanceTimeout: number;
  acceptanceStartTime?: Date;
  selectedTierId?: number;
  selectedVehicleTypeId?: number;
  estimatedPrice?: number;
  routeInfo?: RouteInfoSnapshot;
  priceBreakdown?: PriceBreakdownSnapshot;
  asyncSearch: AsyncSearchState;
  asyncSearchTimer?: ReturnType<typeof setInterval> | null;
  bottomSheetVisible: boolean;
  bottomSheetMinHeight: number;
  bottomSheetMaxHeight: number;
  bottomSheetInitialHeight: number;
  bottomSheetAllowDrag: boolean;
  bottomSheetAllowClose: boolean;
  bottomSheetClassName?: string;
  bottomSheetSnapPoints?: number[];
  bottomSheetHandleHeight: number;
  mapInteraction: NonNullable<StepConfig["mapInteraction"]>;
  transitionType: NonNullable<NonNullable<StepConfig["transition"]>["type"]> | "none";
  transitionDuration: number;
}

export interface MapFlowActions {
  setCurrentStep(step: MapFlowStep): void;
  start(role: MapFlowRole): void;
  startService(service: ServiceType, role?: FlowRole): void;
  stop(): void;
  reset(): void;
  goTo(step: MapFlowStep): void;
  goToStep(stepName: string): void;
  next(): void;
  back(): void;
  updateStepBottomSheet(step: MapFlowStep, cfg: Partial<StepConfig["bottomSheet"]>): void;
  setMapInteraction(step: MapFlowStep, interaction: NonNullable<StepConfig["mapInteraction"]>): void;
  updateStepTransition(step: MapFlowStep, cfg: Partial<NonNullable<StepConfig["transition"]>>): void;
  setRideId(id: number | null): void;
  setOrderId(id: number | null): void;
  setErrandId(id: number | null): void;
  setParcelId(id: number | null): void;
  setRideType(type: RideType): void;
  setConfirmedOrigin(location: LocationSnapshot | null): void;
  setConfirmedDestination(location: LocationSnapshot | null): void;
  setPhoneNumber(phone: string | undefined): void;
  startMatching(timeoutSeconds?: number): void;
  stopMatching(): void;
  setMatchedDriver(driver: DriverSnapshot | null): void;
  clearMatchedDriver(): void;
  startAcceptanceTimer(timeoutSeconds?: number): void;
  stopAcceptanceTimer(): void;
  setSelectedTierId(tierId: number | undefined): void;
  setSelectedVehicleTypeId(vehicleTypeId: number | undefined): void;
  setEstimatedPrice(price: number | undefined): void;
  setRouteInfo(routeInfo: RouteInfoSnapshot | undefined): void;
  setPriceBreakdown(breakdown: PriceBreakdownSnapshot | undefined): void;
  startAsyncSearch(searchId: string, timeRemaining: number): void;
  updateAsyncSearchStatus(status: AsyncSearchState["status"], payload?: AsyncSearchUpdatePayload): void;
  cancelAsyncSearch(): void;
  confirmAsyncDriver(driverId: number): void;
  calculateTimeRemaining(): number;
  startAsyncSearchTimer(): void;
  getInitialStepConfig(step: MapFlowStep): StepConfigSummary;
  startWithConfig(step: MapFlowStep, role?: MapFlowRole): StepConfigSummary;
  startWithCustomerStep(step: CustomerFlowStep): StepConfigSummary;
  startWithDriverStep(step: DriverFlowStep): StepConfigSummary;
  startWithTransportStep(step: CustomerTransportStep | DriverTransportStep, role: FlowRole): StepConfigSummary;
  startWithDeliveryStep(step: CustomerDeliveryStep | DriverDeliveryStep, role: FlowRole): StepConfigSummary;
  startWithMandadoStep(step: CustomerMandadoStep | DriverMandadoStep, role: FlowRole): StepConfigSummary;
  startWithEnvioStep(step: CustomerEnvioStep | DriverEnvioStep, role: FlowRole): StepConfigSummary;
  setUsePagerView(usePagerView: boolean): void;
  setPagerSteps(steps: MapFlowStep[]): void;
  resetVariant(): void;
  setCurrentPageIndex(pageIndex: number): void;
  goToNextPage(): void;
  goToPreviousPage(): void;
  goToPagerStep(step: MapFlowStep): void;
  navigateToPage(pageIndex: number, validate?: boolean): void;
  setNavigationConfig(config: NavigationConfigUpdate): void;
  setVisualConfig(config: VisualConfigUpdate): void;
  setAnimationConfig(config: AnimationConfigUpdate): void;
  setValidationConfig(config: ValidationConfigUpdate): void;
  setTransitioning(isTransitioning: boolean): void;
  markStepCompleted(step: MapFlowStep): void;
  markStepSkipped(step: MapFlowStep): void;
  setRequiredSteps(steps: MapFlowStep[]): void;
  setError(error: string | null): void;
  clearError(): void;
  incrementRetryCount(): void;
  resetRetryCount(): void;
  // New actions for BottomSheet local control
  setBottomSheetManualClose(closed: boolean): void;
  setShowReopenButton(show: boolean): void;
  resetBottomSheetLocalState(): void;
}

export type MapFlowState = MapFlowSnapshot & MapFlowActions;

