import React, { useMemo, useState, useCallback } from "react";
import { View, Text, Platform } from "react-native";

import {
  transportClient,
  deliveryClient,
  errandClient,
  parcelClient,
} from "@/app/services/flowClientService";
import Map, { MapHandle } from "@/components/Map";
import { useUI } from "@/components/UIWrapper";
import { loadNearbyRestaurants, Restaurant } from "@/constants/dummyData";
import {
  DARK_MODERN_STYLE,
  type MapConfiguration,
} from "@/constants/mapStyles";
import { MapFlowProvider } from "@/context/MapFlowContext";
import { useMapController } from "@/hooks/useMapController";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useMapFlowPagerWithSteps } from "@/hooks/useMapFlowPagerWithSteps";
import { 
  useCurrentStep, 
  useCurrentRole, 
  useCurrentService,
  useRideId,
  useIsMatching,
  useMatchedDriver,
  useVariantState,
  useIsPagerViewActive,
  useCurrentPageIndex,
  useTotalPages,
  useStepConfig,
  useStepBottomSheet
} from "@/store/mapFlow/slices";
import { useRealtimeStore, useLocationStore } from "@/store";
import { useDevStore } from "@/store/dev/dev";
import { MapFlowStep } from '@/store';
import { usePerformanceMonitor, useErrorMonitor } from "@/hooks/usePerformanceMonitor";
import { DiagnosticsDashboard } from "@/components/diagnostics/DiagnosticsDashboard";
import GorhomMapFlowBottomSheet from "../ui/GorhomMapFlowBottomSheet";
import FloatingReopenButton from "../ui/FloatingReopenButton";
import { DebugInfo, MapDebugInfo } from "./DebugInfo";
import { log } from "@/lib/logger";
import BottomSheetErrorBoundary from "./BottomSheetErrorBoundary";

// 🎨 Importar configuración de mapas

interface UnifiedFlowWrapperProps {
  role?: "customer" | "driver";
  renderStep: (step: MapFlowStep) => React.ReactNode;
  children?: React.ReactNode;
  
  // Nuevas props para PagerView
  usePagerView?: boolean;
  enablePagerViewForSteps?: MapFlowStep[];
  onStepChange?: (step: MapFlowStep) => void;
  onPageChange?: (pageIndex: number) => void;
  pagerAnimationType?: 'slide' | 'fade';
  pagerEnableSwipe?: boolean;
  pagerShowPageIndicator?: boolean;
}

const UnifiedFlowWrapper: React.FC<UnifiedFlowWrapperProps> = ({
  role = "customer",
  renderStep,
  children,
  // Nuevas props para PagerView
  usePagerView = true, // 🆕 Activar PagerView por defecto
  enablePagerViewForSteps = [],
  onStepChange,
  onPageChange,
  pagerAnimationType = 'slide',
  pagerEnableSwipe = true,
  pagerShowPageIndicator = true,
}) => {
  // Performance monitoring
  const { startRender, endRender } = usePerformanceMonitor('UnifiedFlowWrapper');
  const { reportError } = useErrorMonitor('UnifiedFlowWrapper');
  
  const flow = useMapFlow();
  const map = useMapController();
  const devStore = useDevStore();
  
  // Use optimized selectors from store slices
  const currentStep = useCurrentStep();
  const currentRole = useCurrentRole();
  const currentService = useCurrentService();
  const rideId = useRideId();
  const isMatching = useIsMatching();
  const matchedDriver = useMatchedDriver();
  const variantState = useVariantState();
  const isPagerViewActive = useIsPagerViewActive();
  const currentPageIndex = useCurrentPageIndex();
  const totalPages = useTotalPages();
  const stepConfig = useStepConfig(currentStep);
  const bottomSheetConfig = useStepBottomSheet(currentStep);
  
  // Create flow state object for compatibility
  const flowState = { step: currentStep, role: currentRole, service: currentService };
  const bottomSheet = {
    bottomSheetVisible: bottomSheetConfig.visible,
    bottomSheetMinHeight: bottomSheetConfig.minHeight,
    bottomSheetMaxHeight: bottomSheetConfig.maxHeight,
    bottomSheetInitialHeight: bottomSheetConfig.initialHeight,
    bottomSheetAllowDrag: bottomSheetConfig.allowDrag ?? true,
    bottomSheetAllowClose: bottomSheetConfig.allowClose ?? true,
    bottomSheetShowHandle: bottomSheetConfig.showHandle ?? true,
    bottomSheetUseGradient: bottomSheetConfig.useGradient ?? false,
    bottomSheetUseBlur: bottomSheetConfig.useBlur ?? false,
    bottomSheetBottomBar: bottomSheetConfig.bottomBar ?? null,
    bottomSheetClassName: bottomSheetConfig.className,
    bottomSheetSnapPoints: bottomSheetConfig.snapPoints,
    bottomSheetHandleHeight: bottomSheetConfig.handleHeight ?? 44,
  };
  const pager = variantState;
  
  // Performance monitoring
  React.useEffect(() => {
    startRender();
    return () => endRender();
  }, [flow.step, flow.role, flow.service]);
  
  // 🐛 DEBUG: Logging para identificar problema de renderizado
  React.useEffect(() => {
    log.unifiedFlow.debug('Debug render', {
      data: {
        step: flow.step,
        role: flow.role,
        service: flow.service,
        renderStepType: typeof renderStep
      }
    });
  }, [flow.step, flow.role, flow.service, renderStep]);
  
  // 🆕 Hook para PagerView
  const pagerHook = useMapFlowPagerWithSteps();
  
  // 🆕 Estado para el botón flotante de reapertura (now using global state)
  const bottomSheetClosed = flow.flow.bottomSheetManuallyClosed;
  const showFloatingButton = flow.flow.showReopenButton;
  const previousStepRef = React.useRef<MapFlowStep | null>(null);

  const canClose = bottomSheet.bottomSheetAllowDrag && bottomSheet.bottomSheetAllowClose;

  // 🆕 Funciones para manejar el cierre y reapertura del BottomSheet
  const handleBottomSheetClose = useCallback(() => {
    log.bottomSheetClose.debug('BottomSheet close attempt', {
      data: {
        canClose,
        allowDrag: bottomSheet.bottomSheetAllowDrag,
        allowClose: bottomSheet.bottomSheetAllowClose,
        currentStep: flowState.step,
        bottomSheetVisible: bottomSheet.bottomSheetVisible,
      }
    });

    if (!canClose) {
      log.bottomSheetClose.debug('BottomSheet close ignored because canClose is false');
      // Reforzar la visibilidad original y evitar cambios de estado locales
      flow.updateStepBottomSheet(flowState.step, { visible: true, allowClose: false });
      return;
    }

    flow.setBottomSheetManualClose(true);
    flow.setShowReopenButton(true);
  }, [canClose, flow, flowState.step, bottomSheet]);

  const handleReopenBottomSheet = useCallback(() => {
    log.bottomSheetReopen.debug('Reopening BottomSheet', {
      data: {
        bottomSheetClosed,
        showFloatingButton,
        step: flow.step,
      }
    });

    flow.setBottomSheetManualClose(false);
    flow.setShowReopenButton(false);
    // Forzar la reapertura del BottomSheet usando updateStepBottomSheet
    flow.updateStepBottomSheet(flow.step, { visible: true });
  }, [flow, bottomSheetClosed, showFloatingButton]);
  
  // 🆕 Determinar si usar PagerView para el paso actual
  const resolvedPagerSteps = enablePagerViewForSteps.length > 0
    ? enablePagerViewForSteps
    : pagerHook.pagerSteps;
  const shouldUsePagerView = Boolean(
    usePagerView &&
    pagerHook.shouldUsePager &&
    resolvedPagerSteps.length > 0 &&
    (enablePagerViewForSteps.length === 0 || enablePagerViewForSteps.includes(flow.step))
  );

  // 🆕 Obtener pasos para PagerView
  const pagerSteps = resolvedPagerSteps;

  // 🔍 LOG: Estado del PagerView en UnifiedFlowWrapper
  log.pagerView.debug('PagerView State', {
    data: {
      usePagerViewProp: usePagerView,
      shouldUsePagerView,
      hookShouldUsePager: pagerHook.shouldUsePager,
      currentStep: flow.step,
      enablePagerViewForSteps: enablePagerViewForSteps.length,
      pagerStepsCount: pagerSteps.length,
      pagerSteps,
      pagerHookState: {
        currentPageIndex: pagerHook.currentPageIndex,
        totalPages: pagerHook.totalPages,
        isTransitioning: pagerHook.isTransitioning,
        usePagerView: pagerHook.usePagerView
      }
    }
  });

  // Debug: Estado del Flow
  log.unifiedFlow.debug('Flow State', {
    data: {
      isActive: flow.isActive,
      step: flow.step,
      bottomSheetVisible: flow.bottomSheetVisible,
      bottomSheetMinHeight: flow.bottomSheetMinHeight,
      bottomSheetMaxHeight: flow.bottomSheetMaxHeight,
      bottomSheetInitialHeight: flow.bottomSheetInitialHeight,
      shouldUsePagerView,
      pagerSteps: pagerSteps.length
    }
  });

  // Auto-start si no está activo
  React.useEffect(() => {
    if (!flow.isActive) {
      log.unifiedFlow.debug('Auto-starting flow');
      flow.start('customer');
    }
  }, [flow.isActive, flow, role]);
  
  // 🆕 Resetear el estado del botón flotante cuando cambia el paso o el flow lo oculta
  React.useEffect(() => {
    if (!flow.bottomSheetVisible && (bottomSheetClosed || showFloatingButton)) {
      log.unifiedFlow.debug('BottomSheet hidden by flow, resetting local state');
      flow.resetBottomSheetLocalState();
    }
  }, [flow.bottomSheetVisible, bottomSheetClosed, showFloatingButton, flow]);

  React.useEffect(() => {
    if (previousStepRef.current !== flow.step) {
      log.stepChange.debug('Step changed, resetting close state if needed', {
        data: {
          previousStep: previousStepRef.current,
          nextStep: flow.step,
          wasClosed: bottomSheetClosed,
        }
      });

      previousStepRef.current = flow.step;

      if (bottomSheetClosed || showFloatingButton) {
        flow.resetBottomSheetLocalState();
      }
    }
  }, [flow.step, bottomSheetClosed, showFloatingButton, flow]);

  // 🔧 Mejorar lógica de visibilidad del sheet
  const sheetVisible = useMemo(() => {
    // Si el flow dice que debe estar visible
    if (!flow.bottomSheetVisible) return false;
    
    // Si fue cerrado manualmente Y se permite cerrar, entonces ocultarlo
    if (bottomSheetClosed && canClose) return false;
    
    // En cualquier otro caso, mostrarlo
    return true;
  }, [flow.bottomSheetVisible, bottomSheetClosed, canClose]);
  
  // 🔍 LOG: Estado de visibilidad del BottomSheet
  log.unifiedFlow.debug('Visibility State', {
    data: {
      flowBottomSheetVisible: flow.bottomSheetVisible,
      bottomSheetClosed,
      canClose,
      sheetVisible,
      step: flow.step,
      isActive: flow.isActive
    }
  });
  const minH = flow.bottomSheetMinHeight;
  const maxH = flow.bottomSheetMaxHeight;
  const initH = flow.bottomSheetInitialHeight;
  const allowDrag = flow.bottomSheetAllowDrag;
  const className = flow.bottomSheetClassName || "px-5 pb-5";
  const transitionType = flow.transitionType;
  const transitionDuration = flow.transitionDuration;
  const snapPoints = flow.bottomSheetSnapPoints;
  const handleHeight = flow.bottomSheetHandleHeight;

  // 🔍 LOG: Estado del BottomSheet
  log.unifiedFlow.debug('BottomSheet State', {
    data: {
      sheetVisible,
      step: flow.step,
      service: flow.service,
      role: flow.role,
      minH,
      maxH,
      initH,
      allowDrag,
      snapPoints,
      handleHeight
    }
  });

  // 🎨 Configuración del mapa con tema dark moderno
  const mapConfig: Partial<MapConfiguration> = useMemo(
    () => ({
      theme: "dark",
      customStyle: DARK_MODERN_STYLE,
      userInterfaceStyle: "dark",
      mapType: Platform.OS === "ios" ? "mutedStandard" : "standard",
      showsPointsOfInterest: false,
      showsTraffic: false,
      showsCompass: true,
      showsScale: false,
      showsMyLocationButton: false,
      tintColor: "#00FF88", // Verde neón para acentos
      routeColor: "#4285F4", // Azul Google para rutas
      trailColor: "#FFE014", // Amarillo neón para trails
      predictionColor: "#00FF88", // Verde neón para predicciones
    }),
    [],
  );

  const content = useMemo(() => {
    const renderedContent = renderStep(flow.step);
    
    // 🔍 LOG: Verificar contenido renderizado
    log.unifiedFlow.debug('Content Analysis', {
      data: {
        step: flow.step,
        hasContent: !!renderedContent,
        contentType: typeof renderedContent,
        contentKeys: renderedContent ? Object.keys(renderedContent) : null
      }
    });
    
    return renderedContent;
  }, [renderStep, flow.step]);

  // Toast on step transitions (demo visibility)
  const ui = useUI();
  React.useEffect(() => {
    const pretty = String(flow.step).replace(/_/g, " ").toLowerCase();
    ui.showSnackbar({
      type: "info",
      message: `Paso: ${pretty}`,
      position: "top-right",
      duration: 1400,
      showCloseButton: false,
    });
  }, [flow.step]);

  // Polling for backend status during tracking-related steps
  React.useEffect(() => {
    let timer: any = null;
    const pollable =
      (flow.service === "transport" &&
        (flow.step === "CUSTOMER_TRANSPORT_GESTION_CONFIRMACION" ||
          flow.step === "CUSTOMER_TRANSPORT_DURANTE_FINALIZACION" ||
          flow.step === "CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION") &&
        (flow as any).rideId) ||
      (flow.service === "delivery" &&
        flow.step === "CUSTOMER_DELIVERY_SEGUIMIENTO_DELIVERY" &&
        (flow as any).orderId) ||
      (flow.service === "mandado" &&
        flow.step === "CUSTOMER_MANDADO_COMUNICACION_CONFIRMACION" &&
        (flow as any).errandId) ||
      (flow.service === "envio" &&
        flow.step === "CUSTOMER_ENVIO_SEGUIMIENTO_PAQUETE" &&
        (flow as any).parcelId);

    const doPoll = async () => {
      try {
        if (flow.service === "transport" && (flow as any).rideId) {
          const rideId = (flow as any).rideId as number;

          // 🆕 Usar nuevo endpoint de estado de pagos para transport
          const paymentStatus = await transportClient.getPaymentStatus(rideId);

          // Actualizar estado de pagos si existe grupo
          if (
            paymentStatus.data.hasPaymentGroup &&
            paymentStatus.data.groupId
          ) {
            const { usePaymentStore } = await import("@/store");
            usePaymentStore
              .getState()
              .updateGroupStatus(
                paymentStatus.data.groupId,
                paymentStatus.data,
              );
          }

          // Obtener estado del viaje
          const res = await transportClient.getStatus(rideId);
          const status = res?.data?.status || res?.status;

          if (status) {
            // Mapeo de estados del backend a estados del frontend
            const statusMap: any = {
              pending: "requested",
              driver_confirmed: "accepted",
              accepted: "accepted",
              arriving: "arriving",
              arrived: "arrived",
              in_progress: "in_progress",
              completed: "completed",
              cancelled: "cancelled",
              rejected: "cancelled",
            };
            const mappedStatus = statusMap[status] || "requested";

            
            useRealtimeStore.getState().updateRideStatus(rideId, mappedStatus);

            // Mostrar notificación solo para cambios importantes
            if (status === "accepted") {
              ui.showSuccess(
                "¡Conductor aceptado!",
                "Tu viaje comenzará pronto",
              );
            } else if (status === "arriving") {
              ui.showInfo("Conductor llegando", "Tu conductor está cerca");
            } else if (status === "arrived") {
              ui.showSuccess(
                "¡Conductor llegó!",
                "Tu conductor te está esperando",
              );
            } else if (status === "rejected") {
              ui.showError(
                "Viaje rechazado",
                "El conductor no pudo aceptar tu solicitud",
              );
            }
          }
        } else if (flow.service === "delivery" && (flow as any).orderId) {
          const orderId = (flow as any).orderId as number;
          const res = await deliveryClient.getStatus(orderId);
          const status = res?.data?.status || res?.status;
          if (status) ui.showInfo("Delivery", String(status));
        } else if (flow.service === "mandado" && (flow as any).errandId) {
          const id = (flow as any).errandId as number;
          const res = await errandClient.getStatus(id);
          const status = res?.data?.status || res?.status;
          if (status) ui.showInfo("Mandado", String(status));
        } else if (flow.service === "envio" && (flow as any).parcelId) {
          const id = (flow as any).parcelId as number;
          const res = await parcelClient.getStatus(id);
          const status = res?.data?.status || res?.status;
          if (status) ui.showInfo("Paquete", String(status));
        }
      } catch (e) {
        // Silent poll errors
        
      }
    };

    if (pollable) {
      doPoll();
      // Polling más frecuente durante matching (cada 3 segundos vs 5)
      const intervalMs =
        flow.step === "CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION" ? 3000 : 5000;
      timer = setInterval(doPoll, intervalMs);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [
    flow.service,
    flow.step,
    (flow as any).rideId,
    (flow as any).orderId,
    (flow as any).errandId,
    (flow as any).parcelId,
  ]);

  // Simple simulation control: when in confirmation or in-progress, animate a dummy driver location
  React.useEffect(() => {
    const {
      updateDriverLocation,
      startTracking,
      stopTracking,
      simulationEnabled,
    } = useRealtimeStore.getState();
    const { developerMode } = useDevStore.getState();
    let timer: any = null;

    const simulate =
      flow.step === "CUSTOMER_TRANSPORT_GESTION_CONFIRMACION" ||
      flow.step === "CUSTOMER_TRANSPORT_DURANTE_FINALIZACION" ||
      flow.step === "CUSTOMER_DELIVERY_SEGUIMIENTO_DELIVERY" ||
      flow.step === "CUSTOMER_ENVIO_SEGUIMIENTO_PAQUETE" ||
      flow.step === "CUSTOMER_MANDADO_COMUNICACION_CONFIRMACION";

    if (simulate && (simulationEnabled || developerMode)) {
      startTracking(1);
      let t = 0;
      timer = setInterval(() => {
        t += 1;
        // Simple parametric path near user location
        const { userLatitude, userLongitude } = useLocationStore.getState();
        const baseLat = userLatitude || 40.7128;
        const baseLng = userLongitude || -74.006;
        const lat = baseLat + Math.sin(t / 20) * 0.0015;
        const lng = baseLng + Math.cos(t / 20) * 0.0015;
        updateDriverLocation({
          latitude: lat,
          longitude: lng,
          timestamp: new Date(),
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
      stopTracking();
    };
  }, [flow.step]);

  // Camera control according to mapInteraction
  React.useEffect(() => {
    const {
      userLatitude,
      userLongitude,
      destinationLatitude,
      destinationLongitude,
    } = useLocationStore.getState();
    const { driverLocation } = useRealtimeStore.getState();

    if (!map) return;

    if (flow.mapInteraction === "pan_to_confirm") {
      if (userLatitude && userLongitude) {
        map.panTo({ latitude: userLatitude, longitude: userLongitude }, 600);
      }
    } else if (flow.mapInteraction === "follow_driver") {
      if (driverLocation) {
        map.panTo(
          {
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
          },
          600,
        );
      }
    } else if (flow.mapInteraction === "follow_route") {
      const points: { latitude: number; longitude: number }[] = [];
      if (userLatitude && userLongitude)
        points.push({ latitude: userLatitude, longitude: userLongitude });
      if (destinationLatitude && destinationLongitude)
        points.push({
          latitude: destinationLatitude,
          longitude: destinationLongitude,
        });
      if (driverLocation)
        points.push({
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
        });
      if (points.length >= 2) {
        map.fitBounds(points);
      }
    }
  }, [flow.mapInteraction, flow.step]);

  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = React.useState(false);

  // Load restaurants when service is delivery
  React.useEffect(() => {
    let active = true;
    const load = async () => {
      if (flow.service === "delivery") {
        setLoadingRestaurants(true);
        try {
          const data = await loadNearbyRestaurants();
          if (active) setRestaurants(data);
        } catch (e) {
          ui.showWarning("Delivery", "No se pudieron cargar restaurantes");
        } finally {
          if (active) setLoadingRestaurants(false);
        }
      } else {
        setRestaurants([]);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [flow.service]);

  // Toast on rideStatus change
  React.useEffect(() => {
    const { rideStatus } = useRealtimeStore.getState();
    if (rideStatus) {
      const msg = String(rideStatus).replace(/_/g, " ");
      if (
        rideStatus === "accepted" ||
        rideStatus === "arriving" ||
        rideStatus === "arrived"
      ) {
        ui.showInfo("Ride", msg);
      } else if (rideStatus === "in_progress") {
        ui.showSuccess("Ride", msg);
      } else if (rideStatus === "completed") {
        ui.showSuccess("Ride", msg);
      } else if (rideStatus === "cancelled") {
        ui.showWarning("Ride", msg);
      }
    }
  }, [flow.step]);

  return (
    <MapFlowProvider value={{ flow, map }}>
      <View className="flex-1">
        <Map
          ref={map.setRef as unknown as React.Ref<MapHandle>}
          serviceType={(flow.service as any) || "transport"}
          restaurants={restaurants}
          isLoadingRestaurants={loadingRestaurants}
          mapConfig={mapConfig}
        />

        {/* Debug Info - Optimizado con selectors */}
        <DebugInfo />
        <MapDebugInfo mapConfig={mapConfig} />

        {sheetVisible ? (
          <BottomSheetErrorBoundary
            onError={(error, errorInfo) => {
              log.error('BottomSheet error caught', { data: { error: error.message, errorInfo } });
            }}
            onRetry={() => {
              log.info('BottomSheet error retry requested');
              // El error boundary se reseteará automáticamente
            }}
            onClose={() => {
              log.info('BottomSheet error close requested');
              handleBottomSheetClose();
            }}
            onReport={() => {
              log.info('BottomSheet error report requested');
              // Aquí podrías implementar reporte de errores
            }}
          >
            <GorhomMapFlowBottomSheet
              visible={sheetVisible}
              minHeight={flow.bottomSheetMinHeight}
              maxHeight={flow.bottomSheetMaxHeight}
              initialHeight={flow.bottomSheetInitialHeight}
              showHandle={flow.flow.bottomSheetShowHandle}
              allowDrag={flow.bottomSheetAllowDrag}
              allowClose={flow.bottomSheetAllowClose && canClose}
              onClose={handleBottomSheetClose}
              step={flow.step}
              useGradient={flow.flow.bottomSheetUseGradient}
              useBlur={flow.flow.bottomSheetUseBlur}
              bottomBar={flow.flow.bottomSheetBottomBar}
              snapPoints={flow.bottomSheetSnapPoints?.map(p => `${p}%`)}
              enableOverDrag={flow.bottomSheetAllowDrag}
              enablePanDownToClose={flow.bottomSheetAllowClose && canClose}
              // 🆕 Nuevas props para PagerView
              usePagerView={shouldUsePagerView}
              pagerSteps={pagerSteps}
              onStepChange={(newStep) => {
                log.stepChange.debug('Step change', { data: newStep });
                onStepChange?.(newStep);
                pagerHook.goToPagerStep(newStep);
              }}
              onPageChange={(pageIndex) => {
                log.pageChange.debug('Page change', { data: pageIndex });
                onPageChange?.(pageIndex);
                pagerHook.setCurrentPageIndex(pageIndex);
              }}
              enableSwipe={pagerEnableSwipe}
              showPageIndicator={pagerShowPageIndicator}
              animationType={pagerAnimationType}
            >
              {content}
            </GorhomMapFlowBottomSheet>
          </BottomSheetErrorBoundary>
        ) : null}
        
        {/* 🆕 Botón flotante para reabrir el BottomSheet */}
        <FloatingReopenButton
          visible={bottomSheetClosed && flow.bottomSheetVisible && canClose}
          onPress={handleReopenBottomSheet}
          position="bottom-right"
          size={56}
          color="#FFFFFF"
          backgroundColor="#0286FF"
          iconName="chevron-up"
          animationDuration={300}
        />
        
        {/* 🆕 Diagnostics Dashboard */}
        {devStore.developerMode && <DiagnosticsDashboard />}
      </View>
      {/* Overlay children rendered above everything (e.g., simulation panel) */}
      {children}
    </MapFlowProvider>
  );
};

export default UnifiedFlowWrapper;
