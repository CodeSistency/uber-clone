import { create } from "zustand";
import type { ReactNode } from "react";
import { RideType } from "../../lib/unified-flow/constants";
import type {
  MapFlowRole,
  ServiceType,
  FlowRole,
  CustomerFlowStep,
  DriverFlowStep,
  CustomerTransportStep,
  DriverTransportStep,
  CustomerDeliveryStep,
  DriverDeliveryStep,
  CustomerMandadoStep,
  DriverMandadoStep,
  CustomerEnvioStep,
  DriverEnvioStep,
  FlowStep,
  StepConfig,
  VariantState,
  LocationSnapshot,
  DriverSnapshot,
  RouteInfoSnapshot,
  PriceBreakdownSnapshot,
  AsyncSearchState,
  MapFlowState,
  StepConfigSummary,
  NavigationConfigUpdate,
  VisualConfigUpdate,
  AnimationConfigUpdate,
  ValidationConfigUpdate,
  AsyncSearchUpdatePayload,
} from "./types";
import { DEFAULT_CONFIG } from "./config";
import {
  FLOW_STEPS,
  SERVICE_FLOWS,
  FLAT_CUSTOMER_TRANSPORT_STEPS,
  FLAT_DRIVER_TRANSPORT_STEPS,
} from "./constants";
import { mapFlowLogger } from "./logger";
import { MapFlowStep } from "@/store";
import { useDiagnosticsStore } from "@/lib/diagnostics/DiagnosticsManager";




// Helper function to get initial config for a step
const getInitialStepConfig = (step: MapFlowStep): StepConfigSummary => {
  const config = DEFAULT_CONFIG[step];
  return {
    bottomSheetVisible: config.bottomSheet.visible,
    bottomSheetMinHeight: config.bottomSheet.minHeight,
    bottomSheetMaxHeight: config.bottomSheet.maxHeight,
    bottomSheetInitialHeight: config.bottomSheet.initialHeight,
    bottomSheetAllowDrag: config.bottomSheet.allowDrag ?? true,
    bottomSheetAllowClose: config.bottomSheet.allowClose ?? true,
    bottomSheetShowHandle: config.bottomSheet.showHandle ?? true,
    bottomSheetUseGradient: config.bottomSheet.useGradient ?? false,
    bottomSheetUseBlur: config.bottomSheet.useBlur ?? false,
    bottomSheetBottomBar: config.bottomSheet.bottomBar ?? null,
    bottomSheetClassName: config.bottomSheet.className,
    bottomSheetSnapPoints: config.bottomSheet.snapPoints,
    bottomSheetHandleHeight: config.bottomSheet.handleHeight ?? 44,
    mapInteraction: config.mapInteraction || "none",
    transitionType: config.transition?.type || "none",
    transitionDuration: config.transition?.duration || 0,
  };
};

export const useMapFlowStore = create<MapFlowState>(
  (set, get) => ({
  role: "customer",
  service: undefined,
  step: "SELECCION_SERVICIO", // Start with service selection
  history: ["SELECCION_SERVICIO"],
  isActive: true, // Start as active
  stepConfig: DEFAULT_CONFIG,
  steps: DEFAULT_CONFIG, // Alias for stepConfig
  flow: {
    bottomSheetVisible: false,
    bottomSheetMinHeight: 100,
    bottomSheetMaxHeight: 500,
    bottomSheetInitialHeight: 200,
    bottomSheetShowHandle: true,
    bottomSheetAllowDrag: true,
    bottomSheetAllowClose: true,
    bottomSheetUseGradient: false,
    bottomSheetUseBlur: false,
    bottomSheetBottomBar: null,
    // New state for BottomSheet local control
    bottomSheetManuallyClosed: false,
    showReopenButton: false,
  },
  
  // Estado inicial de la variante PagerView
  variant: {
    // Control de activación
    usePagerView: false,
    
    // Estado de navegación
    currentPageIndex: 0,
    totalPages: 0,
    isTransitioning: false,
    pagerSteps: [],
    currentStepIndex: 0,
    
    // Configuración de navegación
    enableSwipe: true,
    showProgress: true,
    allowSkip: false,
    canNavigateBack: true,
    canNavigateForward: true,
    
    // Configuración visual
    progressColor: '#0286FF',
    progressSize: 8,
    progressStyle: 'dots',
    
    // Estados de validación
    completedSteps: [],
    requiredSteps: [],
    skippedSteps: [],
    
    // Configuración de animaciones
    transitionDuration: 300,
    animationType: 'slide',
    enableAnimations: true,
    
    // Estados de error
    hasError: false,
    errorMessage: null,
    retryCount: 0,
  },
  setCurrentStep(step: MapFlowStep) {
    const startTime = performance.now();
    const previousStep = get().step;
    
    // Obtener la configuración del paso
    const stepConfig = DEFAULT_CONFIG[step];
    if (stepConfig) {
      const { bottomSheet } = stepConfig;
      
      // Actualizar el flow con la configuración del paso
      const newFlow = {
        bottomSheetVisible: bottomSheet.visible,
        bottomSheetMinHeight: bottomSheet.minHeight,
        bottomSheetMaxHeight: bottomSheet.maxHeight,
        bottomSheetInitialHeight: bottomSheet.initialHeight,
        bottomSheetShowHandle: bottomSheet.showHandle ?? true,
        bottomSheetAllowDrag: bottomSheet.allowDrag ?? true,
        bottomSheetAllowClose: bottomSheet.allowClose ?? true,
        bottomSheetUseGradient: bottomSheet.useGradient ?? false,
        bottomSheetUseBlur: bottomSheet.useBlur ?? false,
        bottomSheetBottomBar: bottomSheet.bottomBar ?? null,
        bottomSheetClassName: bottomSheet.className,
        bottomSheetSnapPoints: bottomSheet.snapPoints,
        bottomSheetHandleHeight: bottomSheet.handleHeight ?? 44,
      };
      
      set({ 
        step,
        flow: {
          ...newFlow,
          bottomSheetManuallyClosed: false,
          showReopenButton: false,
        },
        bottomSheetVisible: newFlow.bottomSheetVisible,
        bottomSheetMinHeight: newFlow.bottomSheetMinHeight,
        bottomSheetMaxHeight: newFlow.bottomSheetMaxHeight,
        bottomSheetInitialHeight: newFlow.bottomSheetInitialHeight,
        bottomSheetAllowDrag: newFlow.bottomSheetAllowDrag,
        bottomSheetAllowClose: newFlow.bottomSheetAllowClose,
        bottomSheetClassName: newFlow.bottomSheetClassName,
        bottomSheetSnapPoints: newFlow.bottomSheetSnapPoints,
        bottomSheetHandleHeight: newFlow.bottomSheetHandleHeight,
      });
      
      // Log diagnóstico de cambio de paso
      const duration = performance.now() - startTime;
      useDiagnosticsStore.getState().addEvent({
        type: 'info',
        category: 'mapflow',
        message: `Step changed from ${previousStep} to ${step}`,
        data: { fromStep: previousStep, toStep: step, duration },
        duration,
      });
    } else {
      mapFlowLogger("warn", "No config found for step", step);
      set({ step });
      
      // Log error de configuración
      useDiagnosticsStore.getState().addEvent({
        type: 'error',
        category: 'mapflow',
        message: `No config found for step: ${step}`,
        data: { step, previousStep },
      });
    }
  },
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
    status: "idle",
    matchedDriver: null,
    timeRemaining: 0,
    error: null,
    startTime: undefined,
  },

  // Initialize with correct config for SELECCION_SERVICIO
  ...getInitialStepConfig("SELECCION_SERVICIO"),

  start(role) {
    const cfg = get().stepConfig["travel_start"];
    
    set(() => ({
      role,
      isActive: true,
      step: "travel_start",
      history: ["travel_start"],
      bottomSheetVisible: cfg.bottomSheet.visible,
      bottomSheetMinHeight: cfg.bottomSheet.minHeight,
      bottomSheetMaxHeight: cfg.bottomSheet.maxHeight,
      bottomSheetInitialHeight: cfg.bottomSheet.initialHeight,
      bottomSheetAllowDrag: cfg.bottomSheet.allowDrag ?? true,
      bottomSheetAllowClose: cfg.bottomSheet.allowClose ?? true,
      bottomSheetClassName: cfg.bottomSheet.className,
      bottomSheetSnapPoints: cfg.bottomSheet.snapPoints,
      bottomSheetHandleHeight: cfg.bottomSheet.handleHeight ?? 44,
      mapInteraction: cfg.mapInteraction || "none",
      transitionType: cfg.transition?.type || "none",
      transitionDuration: cfg.transition?.duration || 0,
    }));
  },

  startService(service: ServiceType, role: FlowRole = "customer") {
    
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
      bottomSheetAllowClose: cfg.bottomSheet.allowClose ?? true,
      bottomSheetClassName: cfg.bottomSheet.className,
      bottomSheetSnapPoints: cfg.bottomSheet.snapPoints,
      bottomSheetHandleHeight: cfg.bottomSheet.handleHeight ?? 44,
      mapInteraction: cfg.mapInteraction || "none",
      transitionType: cfg.transition?.type || "none",
      transitionDuration: cfg.transition?.duration || 0,
    }));
  },

  stop() {
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

  reset() {
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

  goTo(step) {
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

  goToStep(stepName: string) {
    

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

  next() {
    const state = get();

    // Handle special case for transport service with conditional navigation
    if (state.service === "transport") {
      if (state.role === "customer") {
        const currentStep = state.step;

        if (currentStep === FLOW_STEPS.CUSTOMER_TRANSPORT.DEFINICION_VIAJE) {
          // Navigate based on rideType
          if (state.rideType === RideType.FOR_OTHER) {
            get().goTo(FLOW_STEPS.CUSTOMER_TRANSPORT.CONFIRM_ORIGIN);
          } else {
            get().goTo(FLOW_STEPS.CUSTOMER_TRANSPORT.CONFIRM_DESTINATION);
          }
          return;
        }

        if (currentStep === FLOW_STEPS.CUSTOMER_TRANSPORT.CONFIRM_ORIGIN) {
          // Always go to CONFIRM_DESTINATION after confirming origin
          get().goTo(FLOW_STEPS.CUSTOMER_TRANSPORT.CONFIRM_DESTINATION);
          return;
        }

        if (currentStep === FLOW_STEPS.CUSTOMER_TRANSPORT.CONFIRM_DESTINATION) {
          // Go to vehicle selection after confirming destination
          get().goTo(FLOW_STEPS.CUSTOMER_TRANSPORT.SELECCION_VEHICULO);
          return;
        }
      } else if (state.role === "driver") {
        const currentStep = state.step;

        if (currentStep === FLOW_STEPS.DRIVER_TRANSPORT.RECIBIR_SOLICITUD) {
          // After receiving request, go to accept/reject step
          get().goTo(FLOW_STEPS.DRIVER_TRANSPORT.ACEPTAR_RECHAZAR);
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

  back() {
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

  setRideId(id) {
    set(() => ({ rideId: id }));
  },
  setOrderId(id) {
    set(() => ({ orderId: id }));
  },
  setErrandId(id) {
    set(() => ({ errandId: id }));
  },
  setParcelId(id) {
    set(() => ({ parcelId: id }));
  },

  // New actions for ride type and confirmations
  setRideType(type: RideType) {
    set(() => ({ rideType: type }));
  },
  setConfirmedOrigin(location: LocationSnapshot | null) {
    set(() => ({ confirmedOrigin: location }));
  },
  setConfirmedDestination(location: LocationSnapshot | null) {
    set(() => ({ confirmedDestination: location }));
  },
  setPhoneNumber(phone?: string) {
    set(() => ({ phoneNumber: phone }));
  },

  // Driver matching actions
  startMatching(timeoutSeconds: number = 30) {
    set(() => ({
      isMatching: true,
      matchingTimeout: timeoutSeconds,
      matchingStartTime: new Date(),
      matchedDriver: undefined,
    }));
  },
  stopMatching() {
    set(() => ({
      isMatching: false,
      matchingStartTime: undefined,
    }));
  },
  setMatchedDriver(driver: DriverSnapshot | null) {
    set(() => ({
      matchedDriver: driver ?? undefined,
      isMatching: false,
    }));
  },
  clearMatchedDriver() {
    set(() => ({ matchedDriver: undefined }));
  },
  startAcceptanceTimer(timeoutSeconds: number = 30) {
    set(() => ({
      acceptanceTimeout: timeoutSeconds,
      acceptanceStartTime: new Date(),
    }));
  },
  stopAcceptanceTimer() {
    set(() => ({ acceptanceStartTime: undefined }));
  },

  // Ride configuration actions
  setSelectedTierId(tierId?: number) {
    set(() => ({ selectedTierId: tierId }));
  },
  setSelectedVehicleTypeId(vehicleTypeId?: number) {
    set(() => ({ selectedVehicleTypeId: vehicleTypeId }));
  },

  // Price calculation actions
  setEstimatedPrice(price?: number) {
    set(() => ({ estimatedPrice: price }));
  },
  setRouteInfo(routeInfo?: RouteInfoSnapshot) {
    set(() => ({ routeInfo }));
  },
  setPriceBreakdown(breakdown?: PriceBreakdownSnapshot) {
    set(() => ({ priceBreakdown: breakdown }));
  },

  // Async driver search actions
  startAsyncSearch(searchId: string, timeRemaining: number) {
    set((state) => ({
      asyncSearch: {
        ...state.asyncSearch,
        searchId,
        status: "searching",
        timeRemaining,
        error: null,
        startTime: new Date(),
      },
    }));
  },

  updateAsyncSearchStatus(status: AsyncSearchState["status"], data?: AsyncSearchUpdatePayload) {
    set((state) => ({
      asyncSearch: {
        ...state.asyncSearch,
        status,
        matchedDriver: data?.matchedDriver ?? state.asyncSearch.matchedDriver,
        timeRemaining: data?.timeRemaining ?? state.asyncSearch.timeRemaining,
        error: data?.error ?? state.asyncSearch.error,
      },
    }));
  },

  cancelAsyncSearch() {
    set((state) => ({
      asyncSearch: {
        ...state.asyncSearch,
        status: "cancelled",
        timeRemaining: 0,
        error: null,
      },
    }));
  },

  confirmAsyncDriver(_driverId: number) {
    set((state) => ({
      asyncSearch: {
        ...state.asyncSearch,
        status: "idle",
        timeRemaining: 0,
        error: null,
      },
    }));
  },

  // Helper method to calculate time remaining
  calculateTimeRemaining(): number {
    const state = get();
    if (!state.asyncSearch.startTime || state.asyncSearch.status !== "searching") {
      return 0;
    }

    const elapsed = Math.floor((Date.now() - state.asyncSearch.startTime.getTime()) / 1000);
    const maxWaitTime = 300; // Default max wait time in seconds
    const remaining = Math.max(0, maxWaitTime - elapsed);

    return remaining;
  },

  // Helper method to start countdown timer for async search
  startAsyncSearchTimer(): void {
    const state = get();
    if (state.asyncSearch.status !== "searching" || !state.asyncSearch.startTime) {
      
      return;
    }

    const maxWaitTime = 300; // 5 minutes default
    

    // Clear any existing timer
    if (state.asyncSearchTimer) {
      clearInterval(state.asyncSearchTimer);
    }

    // Start new timer
    const timer = setInterval(() => {
      const currentState = get();
      if (currentState.asyncSearch.status !== "searching") {
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
            status: "timeout",
            error: "Tiempo de búsqueda agotado",
          },
        }));
      }
    }, 1000); // Update every second

    // Store timer reference (using any to avoid TypeScript issues)
    set({ asyncSearchTimer: timer });
  },

  updateStepBottomSheet(step: MapFlowStep, cfg: Partial<StepConfig["bottomSheet"]>) {
    set((state) => {
      const prev = state.stepConfig[step];
      const nextCfg: StepConfig = {
        ...prev,
        bottomSheet: { ...prev.bottomSheet, ...cfg },
      };
      mapFlowLogger("debug", "updateStepBottomSheet", {
        step,
        cfg,
        prevBottomSheet: prev.bottomSheet,
        nextBottomSheet: nextCfg.bottomSheet,
        isCurrent: state.step === step,
      });
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
              bottomSheetAllowClose: nextCfg.bottomSheet.allowClose ?? true,
              bottomSheetClassName: nextCfg.bottomSheet.className,
              bottomSheetSnapPoints: nextCfg.bottomSheet.snapPoints,
              bottomSheetHandleHeight: nextCfg.bottomSheet.handleHeight ?? 44,
            }
          : {}),
      };
    });
  },

  setMapInteraction(step: MapFlowStep, interaction: NonNullable<StepConfig["mapInteraction"]>) {
    set((state) => {
      const prev = state.stepConfig[step];
      const nextCfg: StepConfig = { ...prev, mapInteraction: interaction };
      const stepConfig = { ...state.stepConfig, [step]: nextCfg };
      const isCurrent = state.step === step;
      return {
        stepConfig,
        ...(isCurrent ? { mapInteraction: interaction } : {}),
      };
    });
  },

  updateStepTransition(step: MapFlowStep, cfg: Partial<NonNullable<StepConfig["transition"]>>) {
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
      };
    });
  },

  // Helper methods
  getInitialStepConfig(step: MapFlowStep) {
    return getInitialStepConfig(step);
  },

  startWithConfig(step: MapFlowStep, role?: MapFlowRole) {
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
      bottomSheetAllowClose: config.bottomSheetAllowClose,
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
  startWithCustomerStep(step: CustomerFlowStep) {
    return get().startWithConfig(step, "customer");
  },

  startWithDriverStep(step: DriverFlowStep) {
    return get().startWithConfig(step, "driver");
  },

  startWithTransportStep(step: CustomerTransportStep | DriverTransportStep, role: FlowRole) {
    return get().startWithConfig(step, role);
  },

  startWithDeliveryStep(step: CustomerDeliveryStep | DriverDeliveryStep, role: FlowRole) {
    return get().startWithConfig(step, role);
  },

  startWithMandadoStep(step: CustomerMandadoStep | DriverMandadoStep, role: FlowRole) {
    return get().startWithConfig(step, role);
  },

  startWithEnvioStep(step: CustomerEnvioStep | DriverEnvioStep, role: FlowRole) {
    return get().startWithConfig(step, role);
  },

  // Variant PagerView actions implementation
  setUsePagerView(usePagerView: boolean) {
      mapFlowLogger("debug", "setUsePagerView", usePagerView);
    
    set((state) => ({
      variant: {
        ...state.variant,
        usePagerView,
        // Resetear estado cuando se desactiva
        ...(usePagerView ? {} : {
          currentPageIndex: 0,
          totalPages: 0,
          isTransitioning: false,
          pagerSteps: [],
          currentStepIndex: 0,
          completedSteps: [],
          skippedSteps: [],
          hasError: false,
          errorMessage: null,
          retryCount: 0,
        })
      }
    }));
  },

  setPagerSteps(steps: MapFlowStep[]) {
    mapFlowLogger("debug", "setPagerSteps", steps);
    
    set((state) => ({
      variant: {
        ...state.variant,
        pagerSteps: steps,
        totalPages: steps.length,
        // Ajustar currentPageIndex si es necesario
        currentPageIndex: Math.min(state.variant.currentPageIndex, steps.length - 1),
      }
    }));
  },

  resetVariant() {
    mapFlowLogger("debug", "resetVariant");
    
    set((state) => ({
      variant: {
        usePagerView: false,
        currentPageIndex: 0,
        totalPages: 0,
        isTransitioning: false,
        pagerSteps: [],
        currentStepIndex: 0,
        enableSwipe: true,
        showProgress: true,
        allowSkip: false,
        canNavigateBack: true,
        canNavigateForward: true,
        progressColor: "#0286FF",
        progressSize: 8,
        progressStyle: "dots",
        completedSteps: [],
        requiredSteps: [],
        skippedSteps: [],
        transitionDuration: 300,
        animationType: "slide",
        enableAnimations: true,
        hasError: false,
        errorMessage: null,
        retryCount: 0,
      }
    }));
  },

  setCurrentPageIndex(pageIndex: number) {
    mapFlowLogger("debug", "setCurrentPageIndex", pageIndex);
    
    set((state) => {
      const { variant } = state;
      
      // Validar índice
      if (pageIndex < 0 || pageIndex >= variant.totalPages) {
        mapFlowLogger("warn", "Invalid page index", pageIndex);
        return state;
      }
      
      // Obtener paso correspondiente
      const step = variant.pagerSteps[pageIndex];
      if (!step) {
        mapFlowLogger("warn", "No step found for page index", pageIndex);
        return state;
      }
      
      return {
        variant: {
          ...variant,
          currentPageIndex: pageIndex,
          currentStepIndex: pageIndex,
          isTransitioning: true,
        },
        // Actualizar paso principal si es diferente
        ...(step !== state.step ? { step } : {})
      };
    });
    
    // Limpiar estado de transición después de un tiempo
    setTimeout(() => {
      set((state) => ({
        variant: {
          ...state.variant,
          isTransitioning: false,
        }
      }));
    }, 300);
  },

  goToNextPage() {
    mapFlowLogger("debug", "goToNextPage");
    
    const state = get();
    const { variant } = state;
    
    if (variant.currentPageIndex < variant.totalPages - 1) {
      state.setCurrentPageIndex(variant.currentPageIndex + 1);
    }
  },

  goToPreviousPage() {
    mapFlowLogger("debug", "goToPreviousPage");
    
    const state = get();
    const { variant } = state;
    
    if (variant.currentPageIndex > 0) {
      state.setCurrentPageIndex(variant.currentPageIndex - 1);
    }
  },

  goToPagerStep(step: MapFlowStep) {
    mapFlowLogger("debug", "goToPagerStep", step);
    
    const state = get();
    const { variant } = state;
    
    const stepIndex = variant.pagerSteps.findIndex((s) => s === step);
    if (stepIndex !== -1) {
      state.setCurrentPageIndex(stepIndex);
    } else {
      mapFlowLogger("warn", "Step not found in pager steps", step);
    }
  },

  navigateToPage(pageIndex: number, validate: boolean = true) {
    mapFlowLogger("debug", "navigateToPage", { pageIndex, validate });
    
    const state = get();
    const { variant } = state;
    
    if (validate) {
      // Validar que se pueda navegar a esa página
      if (pageIndex < 0 || pageIndex >= variant.totalPages) {
        mapFlowLogger("warn", "Cannot navigate to page", pageIndex);
        return;
      }
    }
    
    state.setCurrentPageIndex(pageIndex);
  },

  setNavigationConfig(config: NavigationConfigUpdate) {
    mapFlowLogger("debug", "setNavigationConfig", config);
    
    set((state) => ({
      variant: {
        ...state.variant,
        enableSwipe: config.enableSwipe ?? state.variant.enableSwipe,
        showProgress: config.showProgress ?? state.variant.showProgress,
        allowSkip: config.allowSkip ?? state.variant.allowSkip,
        canNavigateBack: config.canNavigateBack ?? state.variant.canNavigateBack,
        canNavigateForward: config.canNavigateForward ?? state.variant.canNavigateForward,
      }
    }));
  },

  setVisualConfig(config: VisualConfigUpdate) {
    mapFlowLogger("debug", "setVisualConfig", config);
    
    set((state) => ({
      variant: {
        ...state.variant,
        progressColor: config.progressColor ?? state.variant.progressColor,
        progressSize: config.progressSize ?? state.variant.progressSize,
        progressStyle: config.progressStyle ?? state.variant.progressStyle,
      }
    }));
  },

  setAnimationConfig(config: AnimationConfigUpdate) {
    mapFlowLogger("debug", "setAnimationConfig", config);
    
    set((state) => ({
      variant: {
        ...state.variant,
        transitionDuration: config.transitionDuration ?? state.variant.transitionDuration,
        animationType: config.animationType ?? state.variant.animationType,
        enableAnimations: config.enableAnimations ?? state.variant.enableAnimations,
      }
    }));
  },

  setValidationConfig(config: ValidationConfigUpdate) {
    mapFlowLogger("debug", "setValidationConfig", config);
    
    set((state) => ({
      variant: {
        ...state.variant,
        requiredSteps: config.requiredSteps ?? state.variant.requiredSteps,
      }
    }));
  },

  setTransitioning(isTransitioning: boolean) {
    mapFlowLogger("debug", "setTransitioning", isTransitioning);
    
    set((state) => ({
      variant: {
        ...state.variant,
        isTransitioning,
      }
    }));
  },

  markStepCompleted(step: MapFlowStep) {
    mapFlowLogger("debug", "markStepCompleted", step);
    
    set((state) => {
      const { variant } = state;
      const completedSteps = [...variant.completedSteps];
      
      if (!completedSteps.includes(step)) {
        completedSteps.push(step);
      }
      
      return {
        variant: {
          ...variant,
          completedSteps,
        }
      };
    });
  },

  markStepSkipped(step: MapFlowStep) {
    mapFlowLogger("debug", "markStepSkipped", step);
    
    set((state) => {
      const { variant } = state;
      const skippedSteps = [...variant.skippedSteps];
      
      if (!skippedSteps.includes(step)) {
        skippedSteps.push(step);
      }
      
      return {
        variant: {
          ...variant,
          skippedSteps,
        }
      };
    });
  },

  setRequiredSteps(steps: MapFlowStep[]) {
    mapFlowLogger("debug", "setRequiredSteps", steps);
    
    set((state) => ({
      variant: {
        ...state.variant,
        requiredSteps: steps,
      }
    }));
  },

  setError(error: string | null) {
    mapFlowLogger("debug", "setError", error);
    
    set((state) => ({
      variant: {
        ...state.variant,
        hasError: !!error,
        errorMessage: error,
      }
    }));
  },

  clearError() {
    mapFlowLogger("debug", "clearError");
    
    set((state) => ({
      variant: {
        ...state.variant,
        hasError: false,
        errorMessage: null,
        retryCount: 0,
      }
    }));
  },

  incrementRetryCount() {
    mapFlowLogger("debug", "incrementRetryCount");
    
    set((state) => ({
      variant: {
        ...state.variant,
        retryCount: state.variant.retryCount + 1,
      }
    }));
  },

  resetRetryCount() {
    mapFlowLogger("debug", "resetRetryCount");
    
    set((state) => ({
      variant: {
        ...state.variant,
        retryCount: 0,
      }
    }));
  },

  // New actions for BottomSheet local control
  setBottomSheetManualClose(closed: boolean) {
    mapFlowLogger("debug", "setBottomSheetManualClose", { closed });
    
    set((state) => ({
      flow: {
        ...state.flow,
        bottomSheetManuallyClosed: closed,
      }
    }));
  },

  setShowReopenButton(show: boolean) {
    mapFlowLogger("debug", "setShowReopenButton", { show });
    
    set((state) => ({
      flow: {
        ...state.flow,
        showReopenButton: show,
      }
    }));
  },

  resetBottomSheetLocalState() {
    mapFlowLogger("debug", "resetBottomSheetLocalState");
    
    set((state) => ({
      flow: {
        ...state.flow,
        bottomSheetManuallyClosed: false,
        showReopenButton: false,
      }
    }));
  },
}));
