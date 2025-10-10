import { useEffect, useRef, useCallback } from 'react';
import { useDiagnosticsStore } from '@/lib/diagnostics/DiagnosticsManager';

/**
 * Hook para monitorear performance de componentes
 * Rastrea tiempo de renderizado, re-renders y uso de memoria
 */
export const usePerformanceMonitor = (componentName: string) => {
  const addPerformanceMetric = useDiagnosticsStore((state) => state.addPerformanceMetric);
  const addEvent = useDiagnosticsStore((state) => state.addEvent);
  const isEnabled = useDiagnosticsStore((state) => state.isEnabled);
  
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const lastRenderTime = useRef<number>(0);
  
  // Medir tiempo de renderizado
  const startRender = useCallback(() => {
    if (!isEnabled) return;
    renderStartTime.current = performance.now();
    renderCount.current += 1;
  }, [isEnabled]);
  
  const endRender = useCallback(() => {
    if (!isEnabled || renderStartTime.current === 0) return;
    
    const renderTime = performance.now() - renderStartTime.current;
    lastRenderTime.current = renderTime;
    
    // Agregar métrica de performance
    addPerformanceMetric({
      renderTime,
      reRenderCount: renderCount.current,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      componentName,
    });
    
    // Log si el render es lento (>16ms para 60fps)
    if (renderTime > 16) {
      addEvent({
        type: 'warning',
        category: 'component',
        message: `Slow render detected in ${componentName}`,
        data: { renderTime, reRenderCount: renderCount.current },
        component: componentName,
        duration: renderTime,
      });
    }
    
    renderStartTime.current = 0;
  }, [isEnabled, componentName, addPerformanceMetric, addEvent]);
  
  // Medir re-renders excesivos
  useEffect(() => {
    if (!isEnabled) return;
    
    if (renderCount.current > 10) {
      addEvent({
        type: 'warning',
        category: 'component',
        message: `Excessive re-renders detected in ${componentName}`,
        data: { reRenderCount: renderCount.current },
        component: componentName,
      });
    }
  }, [renderCount.current, componentName, isEnabled, addEvent]);
  
  return {
    startRender,
    endRender,
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTime.current,
  };
};

/**
 * Hook para monitorear errores en componentes
 */
export const useErrorMonitor = (componentName: string) => {
  const addErrorReport = useDiagnosticsStore((state) => state.addErrorReport);
  const addEvent = useDiagnosticsStore((state) => state.addEvent);
  const isEnabled = useDiagnosticsStore((state) => state.isEnabled);
  
  const reportError = useCallback((error: Error, context?: any) => {
    if (!isEnabled) return;
    
    addErrorReport(error, {
      component: componentName,
      ...context,
    });
  }, [componentName, isEnabled, addErrorReport]);
  
  const reportWarning = useCallback((message: string, data?: any) => {
    if (!isEnabled) return;
    
    addEvent({
      type: 'warning',
      category: 'component',
      message,
      data,
      component: componentName,
    });
  }, [componentName, isEnabled, addEvent]);
  
  return {
    reportError,
    reportWarning,
  };
};

/**
 * Hook para monitorear estado de MapFlow
 */
export const useMapFlowMonitor = () => {
  const addEvent = useDiagnosticsStore((state) => state.addEvent);
  const isEnabled = useDiagnosticsStore((state) => state.isEnabled);
  
  const logStepChange = useCallback((fromStep: string, toStep: string, duration?: number) => {
    if (!isEnabled) return;
    
    addEvent({
      type: 'info',
      category: 'mapflow',
      message: `Step changed from ${fromStep} to ${toStep}`,
      data: { fromStep, toStep, duration },
      duration,
    });
  }, [isEnabled, addEvent]);
  
  const logNavigation = useCallback((action: string, data?: any) => {
    if (!isEnabled) return;
    
    addEvent({
      type: 'info',
      category: 'navigation',
      message: `Navigation: ${action}`,
      data,
    });
  }, [isEnabled, addEvent]);
  
  const logWebSocketEvent = useCallback((event: string, data?: any) => {
    if (!isEnabled) return;
    
    addEvent({
      type: 'info',
      category: 'websocket',
      message: `WebSocket: ${event}`,
      data,
    });
  }, [isEnabled, addEvent]);
  
  return {
    logStepChange,
    logNavigation,
    logWebSocketEvent,
  };
};

/**
 * Hook para monitorear performance de selectors
 */
export const useSelectorMonitor = (selectorName: string) => {
  const addEvent = useDiagnosticsStore((state) => state.addEvent);
  const isEnabled = useDiagnosticsStore((state) => state.isEnabled);
  
  const logSelectorUsage = useCallback((selector: string, duration: number) => {
    if (!isEnabled) return;
    
    addEvent({
      type: 'debug',
      category: 'store',
      message: `Selector ${selector} used`,
      data: { selector, duration },
      component: selectorName,
      duration,
    });
  }, [selectorName, isEnabled, addEvent]);
  
  return {
    logSelectorUsage,
  };
};
