import React, { useRef, useCallback, useMemo, useEffect } from 'react';
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

const MapFlowPagerView: React.FC<MapFlowPagerViewProps> = ({
  steps,
  currentStep,
  onStepChange,
  onPageChange,
  enableSwipe = true,
  showPageIndicator = true,
  animationType = 'slide'
}) => {
  const pagerRef = useRef<PagerView>(null);
  const { flow } = useMapFlowStore();
  
  const {
    currentPageIndex,
    isTransitioning,
    goToPage,
    goToStep,
    canNavigate
  } = useMapFlowPager(steps, currentStep);

  // Encontrar el índice del paso actual
  const currentStepIndex = useMemo(() => {
    const index = steps.findIndex(step => step === currentStep);
    console.log('[PagerDiagnostics][MapFlowPagerView] Current step index computed:', {
      currentStep,
      index,
      steps
    });
    return index;
  }, [steps, currentStep]);

  // Navegar a una página específica
  const handlePageSelected = useCallback((event: PagerViewOnPageSelectedEvent) => {
    const pageIndex = event.nativeEvent.position;
    const step = steps[pageIndex];
    
    console.log('[PagerDiagnostics][MapFlowPagerView] Page selected:', { pageIndex, step });
    
    if (step && step !== currentStep) {
      onStepChange(step);
    }
    
    onPageChange?.(pageIndex);
  }, [steps, currentStep, onStepChange, onPageChange]);

  // Navegar a un paso específico
  const handleStepNavigation = useCallback((step: MapFlowStep) => {
    const stepIndex = steps.findIndex(s => s === step);
    console.log('[PagerDiagnostics][MapFlowPagerView] handleStepNavigation:', { step, stepIndex, currentStepIndex });
    if (stepIndex !== -1 && stepIndex !== currentStepIndex) {
      goToPage(stepIndex);
    }
  }, [steps, currentStepIndex, goToPage]);

  // Sincronizar con cambios externos del paso
  useEffect(() => {
    if (currentStepIndex !== -1 && currentStepIndex !== currentPageIndex) {
      console.log('[PagerDiagnostics][MapFlowPagerView] Syncing to external step:', {
        currentStepIndex,
        currentPageIndex,
        steps
      });
      goToPage(currentStepIndex);
    }
  }, [currentStepIndex, currentPageIndex, goToPage, steps]);

  // Renderizar páginas
  const renderPages = useMemo(() => {
    console.log('[PagerDiagnostics][MapFlowPagerView] Rendering pages:', {
      steps,
      currentPageIndex,
      totalSteps: steps.length
    });
    
    return steps.map((step, index) => {
      console.log('[PagerDiagnostics][MapFlowPagerView] Creating page:', {
        step,
        index,
        isActive: index === currentPageIndex,
        isVisible: Math.abs(index - currentPageIndex) <= 1
      });
      
      return (
        <MapFlowPage
          key={step}
          step={step}
          isActive={index === currentPageIndex}
          isVisible={Math.abs(index - currentPageIndex) <= 1} // Solo renderizar páginas adyacentes
          onContentReady={() => {
            console.log('[PagerDiagnostics][MapFlowPagerView] Page content ready:', step);
          }}
          onAction={(action, data) => {
            console.log('[PagerDiagnostics][MapFlowPagerView] Page action:', { step, action, data });
            // Manejar acciones específicas del paso
          }}
        />
      );
    });
  }, [steps, currentPageIndex]);

  const handlePagerLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    console.log('[PagerDiagnostics][MapFlowPagerView] Pager layout:', {
      width,
      height,
      steps: steps.length,
      currentPageIndex,
      currentStepIndex
    });
  }, [steps.length, currentPageIndex, currentStepIndex]);

  return (
    <View style={styles.container} onLayout={handlePagerLayout}>
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={currentStepIndex}
        scrollEnabled={enableSwipe}
        onPageSelected={handlePageSelected}
        // Optimización de performance
        offscreenPageLimit={1}
        // Configuración de gestos
        keyboardDismissMode="on-drag"
        layoutDirection="ltr"
      >
        {renderPages}
      </PagerView>
      
      {/* Page indicator removed - component not available */}
    </View>
  );
};

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
