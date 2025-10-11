import React, { useRef, useCallback, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import PagerView, { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import { MapFlowStep } from '@/store';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';
import MapFlowPage from './MapFlowPage';
import { useMapFlowPager } from './hooks/useMapFlowPager';

interface MapFlowPagerViewProps {
  steps: MapFlowStep[];
  currentStep: MapFlowStep;
  onStepChange: (step: MapFlowStep) => void;
  onPageChange?: (pageIndex: number) => void;
  enableSwipe?: boolean;
  showPageIndicator?: boolean;
  animationType?: 'slide' | 'fade';
}

// 🔧 Memoizar MapFlowPage para optimización
const MemoizedMapFlowPage = React.memo(MapFlowPage);

const MapFlowPagerView = forwardRef<PagerView, MapFlowPagerViewProps>(({
  steps,
  currentStep,
  onStepChange,
  onPageChange,
  enableSwipe = true,
  showPageIndicator = true,
  animationType = 'slide'
}, ref) => {
  const localPagerRef = useRef<PagerView>(null);
  const { flow } = useMapFlowStore();
  
  // Combinar refs
  useImperativeHandle(ref, () => localPagerRef.current!);
  
  const {
    currentPageIndex,
    isTransitioning,
    goToPage,
    goToStep,
    canNavigate
  } = useMapFlowPager(steps, currentStep);

  // 🔧 Optimizar logging - solo en desarrollo
  const currentStepIndex = useMemo(() => {
    const index = steps.findIndex(step => step === currentStep);
    if (__DEV__) {
      console.log('[PagerView] Current step index:', { currentStep, index });
    }
    return index;
  }, [steps, currentStep]);

  // Navegar a una página específica
  const handlePageSelected = useCallback((event: PagerViewOnPageSelectedEvent) => {
    const pageIndex = event.nativeEvent.position;
    const step = steps[pageIndex];
    
    if (__DEV__) {
      console.log('[PagerView] Page selected:', { pageIndex, step });
    }
    
    if (step && step !== currentStep) {
      onStepChange(step);
    }
    
    onPageChange?.(pageIndex);
  }, [steps, currentStep, onStepChange, onPageChange]);

  // Navegar a un paso específico
  const handleStepNavigation = useCallback((step: MapFlowStep) => {
    const stepIndex = steps.findIndex(s => s === step);
    if (__DEV__) {
      console.log('[PagerView] Step navigation:', { step, stepIndex, currentStepIndex });
    }
    if (stepIndex !== -1 && stepIndex !== currentStepIndex) {
      goToPage(stepIndex);
    }
  }, [steps, currentStepIndex, goToPage]);

  // Sincronizar con cambios externos del paso
  useEffect(() => {
    if (currentStepIndex !== -1 && currentStepIndex !== currentPageIndex) {
      if (__DEV__) {
        console.log('[PagerView] Syncing to external step:', {
          currentStepIndex,
          currentPageIndex,
          steps
        });
      }
      goToPage(currentStepIndex);
    }
  }, [currentStepIndex, currentPageIndex, goToPage, steps]);

  // 🔧 Optimizar renderPages con lazy loading
  const renderPages = useMemo(() => {
    if (__DEV__) {
      console.log('[PagerView] Rendering pages:', {
        steps,
        currentPageIndex,
        totalSteps: steps.length
      });
    }
    
    return steps.map((step, index) => {
      // Solo renderizar página actual y adyacentes
      const shouldRender = Math.abs(index - currentPageIndex) <= 1;
      
      if (!shouldRender) {
        return <View key={step} style={{ flex: 1 }} />;
      }
      
      if (__DEV__) {
        console.log('[PagerView] Creating page:', {
          step,
          index,
          isActive: index === currentPageIndex,
          isVisible: shouldRender
        });
      }
      
      return (
        <MemoizedMapFlowPage
          key={step}
          step={step}
          isActive={index === currentPageIndex}
          isVisible={true}
          onContentReady={() => {
            if (__DEV__) console.log('[PagerView] Content ready:', step);
          }}
          onAction={(action, data) => {
            if (__DEV__) console.log('[PagerView] Action:', { step, action });
            // Manejar acciones específicas del paso
          }}
        />
      );
    });
  }, [steps, currentPageIndex]);

  const handlePagerLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (__DEV__) {
      console.log('[PagerView] Pager layout:', {
        width,
        height,
        steps: steps.length,
        currentPageIndex,
        currentStepIndex
      });
    }
  }, [steps.length, currentPageIndex, currentStepIndex]);

  return (
    <View style={styles.container} onLayout={handlePagerLayout}>
      <PagerView
        ref={localPagerRef}
        style={styles.pagerView}
        initialPage={currentStepIndex}
        scrollEnabled={enableSwipe}
        onPageSelected={handlePageSelected}
        // 🔧 Optimización de performance
        offscreenPageLimit={1} // Solo mantener 1 página a cada lado en memoria
        keyboardDismissMode="on-drag"
        layoutDirection="ltr"
        overdrag={false} // Deshabilitar overdrag para mejor performance
        pageMargin={0} // Sin margen entre páginas
      >
        {renderPages}
      </PagerView>
      
      {/* Page indicator removed - component not available */}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  pagerView: {
    flex: 1,
  },
});

export default MapFlowPagerView;
