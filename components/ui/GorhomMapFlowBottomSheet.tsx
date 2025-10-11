import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, LayoutChangeEvent } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import MapFlowBlurBackground from './MapFlowBlurBackground';
import MapFlowFooter from './MapFlowFooter';
import MapFlowProgressHandle from './MapFlowProgressHandle';
import { useMapFlowBottomSheet } from '@/hooks/useMapFlowBottomSheet';
import { useMapFlowAnimatedValues } from '@/hooks/useMapFlowAnimatedValues';
import { useMapFlowScrollControl } from '@/hooks/useMapFlowScrollControl';
import { useMapFlowBackground } from '@/hooks/useMapFlowBackground';
import { useMapFlowFooter } from '@/hooks/useMapFlowFooter';
import { useMapFlowSnapPoints } from '@/hooks/useMapFlowSnapPoints';
import { useMapFlowAnimationConfig } from '@/hooks/useMapFlowAnimationConfig';
import { useMapFlowTransitions } from '@/hooks/useMapFlowTransitions';
import { useMapFlowHeights } from '@/hooks/useMapFlowHeights';
import { useMapFlowPagerWithSteps } from '@/hooks/useMapFlowPagerWithSteps';
import { MapFlowStep } from '@/store';
import MapFlowPagerView from '../mapFlow/MapFlowPagerView';
import { log } from '@/lib/logger';
import { useBottomSheetTransition } from '@/hooks/useBottomSheetTransition';
import { MapFlowBottomSheetProvider } from '@/context/MapFlowBottomSheetContext';
import { useBottomSheetCloseAnimation } from '@/hooks/useBottomSheetCloseAnimation';

interface GorhomMapFlowBottomSheetProps {
  visible: boolean;
  minHeight: number;
  maxHeight: number;
  initialHeight: number;
  showHandle?: boolean;
  allowDrag?: boolean;
  allowClose?: boolean;
  onClose?: () => void;
  snapPoints?: string[];
  enableOverDrag?: boolean;
  enablePanDownToClose?: boolean;
  children: React.ReactNode;
  className?: string;
  testID?: string;
  step?: MapFlowStep;
  useGradient?: boolean;
  useBlur?: boolean;
  bottomBar?: React.ReactNode;
  
  // Nuevas props para PagerView
  usePagerView?: boolean;
  pagerSteps?: MapFlowStep[];
  onStepChange?: (step: MapFlowStep) => void;
  onPageChange?: (pageIndex: number) => void;
  enableSwipe?: boolean;
  showPageIndicator?: boolean;
  animationType?: 'slide' | 'fade';
  
  // Nueva prop para modo de header
  headerMode?: 'back' | 'close';
}

const GorhomMapFlowBottomSheet: React.FC<GorhomMapFlowBottomSheetProps> = ({
  visible,
  minHeight,
  maxHeight,
  initialHeight,
  showHandle = true,
  allowDrag = true,
  allowClose = true,
  onClose,
  children,
  step,
  bottomBar,
  // Nuevas props para PagerView
  usePagerView = false,
  pagerSteps = [],
  onStepChange,
  onPageChange,
  enableSwipe = true,
  showPageIndicator = true,
  animationType = 'slide',
  // Nueva prop para modo de header
  headerMode = 'back',
}) => {
  const hasCloseCallback = typeof onClose === 'function';
  const effectiveAllowClose = allowClose && allowDrag;
  const showCloseWarning = allowClose && !hasCloseCallback;

  if (showCloseWarning) {
    console.warn('[GorhomMapFlowBottomSheet] allowClose=true but no onClose handler provided. Close gestures will be ignored');
  }
  const heights = useMapFlowHeights(step);

  // 🆕 Hook para transiciones suaves
  const transition = useBottomSheetTransition({
    duration: 300,
    easing: 'ease-out',
    springConfig: { damping: 15, stiffness: 150, mass: 1 }
  });

  // 🆕 Hook para PagerView
  const pagerHook = useMapFlowPagerWithSteps();
  
  // 🆕 Hook para animación de cierre
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { closeWithAnimation } = useBottomSheetCloseAnimation(bottomSheetRef as React.RefObject<BottomSheet>, onClose);
  
  // 🆕 Determinar si usar PagerView
  const resolvedPagerSteps = pagerSteps.length > 0 ? pagerSteps : pagerHook.pagerSteps;
  const shouldUsePagerView = Boolean(
    usePagerView &&
    pagerHook.shouldUsePager &&
    resolvedPagerSteps.length > 0
  );
  
  // 🆕 Obtener pasos para PagerView
  const stepsToUse = resolvedPagerSteps;
  
  // 🔧 Optimizar logging - solo en desarrollo
  if (__DEV__) {
    log.pagerView.debug('PagerView State', {
      data: {
        usePagerViewProp: usePagerView,
        shouldUsePagerView,
        hookShouldUsePager: pagerHook.shouldUsePager,
        pagerStepsLength: pagerSteps.length,
        stepsToUseLength: stepsToUse.length,
        stepsToUse,
        currentStep: step,
        pagerHookState: {
          currentPageIndex: pagerHook.currentPageIndex,
          totalPages: pagerHook.totalPages,
          isTransitioning: pagerHook.isTransitioning,
          usePagerView: pagerHook.usePagerView
        }
      }
    });
  }
  
  // 🔧 Lógica simplificada sin useMapFlowCriticalConfig
  const index = visible ? 0 : -1;
  const enableHandlePanningGesture = allowDrag;
  const enableContentPanningGesture = allowDrag;
  
  // 🔧 Optimizar handleStepPress con useCallback
  const handleStepPress = useCallback((nextStep: MapFlowStep) => {
    onStepChange?.(nextStep);
    pagerHook.goToPagerStep(nextStep);
  }, [onStepChange, pagerHook.goToPagerStep]);

  // 🔧 Memoizar ProgressHandleComponent fuera del useMemo
  const ProgressHandleComponent = React.memo(() => (
    <MapFlowProgressHandle
      currentStep={step || 'idle'}
      currentPageIndex={pagerHook.currentPageIndex}
      totalPages={pagerHook.totalPages}
      steps={stepsToUse}
      type={pagerHook.progressConfig?.progressStyle || 'dots'}
      color={pagerHook.progressConfig?.progressColor || '#0286FF'}
      onStepPress={handleStepPress}
      onProgressPress={() => {}}
    />
  ));

  // 🆕 Handle component optimizado con menos dependencias
  const handleComponent = useMemo(() => {
    if (!showHandle) {
      return null;
    }
    
    if (shouldUsePagerView && pagerHook.progressConfig) {
      return ProgressHandleComponent;
    }
    return undefined; // Usar handle por defecto
  }, [showHandle, shouldUsePagerView, pagerHook.progressConfig?.progressStyle]);

  // 🔧 Optimizar logging - solo en desarrollo
  if (__DEV__) {
    log.bottomSheet.debug('Sheet Config', {
      data: {
        visible,
        step,
        index,
        finalIndex: visible ? index : -1,
        enableHandlePanningGesture,
        enableContentPanningGesture,
        hasHandleComponent: !!handleComponent,
        allowDrag,
      }
    });
  }

  // 🔧 Snap points inteligentes con validación robusta
  const validSnapPoints = useMemo(() => {
    const providedSnapPoints = heights.snapPoints;
    
    if (!providedSnapPoints || providedSnapPoints.length === 0) {
      return ['25%', '50%', '75%'];
    }
    
    // Validar que sean porcentajes válidos
    const validPoints = providedSnapPoints
      .map(p => {
        const num = parseInt(p.replace('%', ''));
        return !isNaN(num) && num > 0 && num <= 100 ? `${num}%` : null;
      })
      .filter((p): p is string => p !== null);
      
    if (__DEV__) {
      log.bottomSheet.debug('Snap points validation', { 
        data: { 
          provided: providedSnapPoints, 
          valid: validPoints,
          usingDefault: validPoints.length === 0
        } 
      });
    }
    
    return validPoints.length > 0 ? validPoints : ['25%', '50%', '75%'];
  }, [heights.snapPoints]);

  const finalIndex = visible ? index : -1;

  // 🔧 Optimizar logging - solo en desarrollo
  if (__DEV__) {
    log.bottomSheet.debug('Final State', {
      data: {
        visible,
        index,
        finalIndex,
        willRender: finalIndex !== -1,
        validSnapPoints,
        platform: Platform.OS,
        backgroundType: Platform.OS === 'android' ? 'dark-gradient' : 'blur+gradient'
      }
    });
  }

  const footerComponent = useMemo(() => {
    if (bottomBar) {
      return (props: any) => (
        <View style={{ padding: 16 }}>
          {bottomBar}
        </View>
      );
    }
    return undefined;
  }, [bottomBar]);

  const handleContentLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (__DEV__) {
      log.bottomSheet.debug('Content layout', {
        data: {
          width,
          height,
          shouldUsePagerView,
          finalIndex,
          visible,
        }
      });
    }
  }, [shouldUsePagerView, finalIndex, visible]);

  // 🆕 Sincronizar cambios de paso con animación del PagerView
  const pagerViewRef = useRef<any>(null);
  
  useEffect(() => {
    if (shouldUsePagerView && pagerViewRef.current && step) {
      const stepIndex = stepsToUse.findIndex(s => s === step);
      if (stepIndex !== -1 && stepIndex !== pagerHook.currentPageIndex) {
        // Animar a la página correspondiente
        pagerViewRef.current.setPage(stepIndex);
      }
    }
  }, [step, shouldUsePagerView, stepsToUse, pagerHook.currentPageIndex]);

  // 🆕 Callback para cerrar con animación
  const handleCloseWithAnimation = useCallback(() => {
    closeWithAnimation(300);
  }, [closeWithAnimation]);

  // 🆕 Context value para FlowHeader
  const contextValue = useMemo(() => ({
    closeBottomSheet: handleCloseWithAnimation,
    isCloseable: allowClose && allowDrag,
    mode: headerMode,
    isConnected: true,
  }), [handleCloseWithAnimation, allowClose, allowDrag, headerMode]);

  const safeRenderPager = shouldUsePagerView && stepsToUse.length > 0 && pagerHook.totalPages > 0;

  // 🆕 Efecto para sincronizar transiciones con la visibilidad
  useEffect(() => {
    if (visible) {
      transition.showBottomSheet(initialHeight);
    } else {
      transition.hideBottomSheet();
    }
  }, [visible, initialHeight, transition]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={finalIndex}
      snapPoints={validSnapPoints}
      enableHandlePanningGesture={enableHandlePanningGesture}
      enableContentPanningGesture={enableContentPanningGesture}
      handleComponent=
        {handleComponent || (() => (
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              borderRadius: 2,
              alignSelf: 'center',
              marginVertical: 8,
            }}
          />
        ))}
      backgroundComponent={() => (
        <View style={{
          backgroundColor: 'rgba(0,0,0,0.8)',
          flex: 1
        }} />
      )}
      footerComponent={footerComponent}
      enableOverDrag={allowDrag}
      enablePanDownToClose={effectiveAllowClose}
      onClose={() => {
        log.bottomSheet.debug('onClose invoked', {
          data: {
            hasCloseCallback,
            effectiveAllowClose,
            allowDrag,
            allowClose,
          }
        });

        if (!effectiveAllowClose) {
          log.bottomSheet.debug('Close prevented because effectiveAllowClose=false');
          return;
        }

        if (hasCloseCallback && onClose) {
          onClose();
        }
      }}
      onChange={(nextIndex) => {
        if (__DEV__) {
          log.bottomSheet.debug('onChange', { data: nextIndex });
        }
      }}
      onAnimate={(fromIndex, toIndex) => {
        if (__DEV__) {
          log.bottomSheet.debug('onAnimate', { data: { fromIndex, toIndex } });
        }
      }}
    >
      <BottomSheetView 
        style={[styles.transparentContent, transition.animatedContainerStyle]} 
        onLayout={handleContentLayout}
      >
        <MapFlowBottomSheetProvider value={contextValue}>
          {safeRenderPager ? (
            <MapFlowPagerView
              ref={pagerViewRef}
              steps={stepsToUse}
              currentStep={step || 'idle'}
              onStepChange={(newStep) => {
                if (__DEV__) {
                  log.pagerView.debug('PagerView step change', { data: newStep });
                }
                onStepChange?.(newStep);
                pagerHook.goToPagerStep(newStep);
              }}
              onPageChange={(pageIndex) => {
                if (__DEV__) {
                  log.pagerView.debug('PagerView page change', { data: pageIndex });
                }
                onPageChange?.(pageIndex);
                pagerHook.setCurrentPageIndex(pageIndex);
              }}
              enableSwipe={enableSwipe && pagerHook.currentStepConfig?.enableSwipe}
              showPageIndicator={showPageIndicator && pagerHook.currentStepConfig?.showProgress}
              animationType="slide" // Forzar slide
            />
          ) : (
            children
          )}
        </MapFlowBottomSheetProvider>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  transparentContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default GorhomMapFlowBottomSheet;
