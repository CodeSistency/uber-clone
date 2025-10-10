import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

/**
 * Tipos para el sistema de diagnósticos
 */
export interface DiagnosticEvent {
  id: string;
  timestamp: Date;
  type: 'performance' | 'error' | 'warning' | 'info' | 'debug';
  category: 'mapflow' | 'navigation' | 'websocket' | 'ui' | 'store' | 'component';
  message: string;
  data?: any;
  component?: string;
  stackTrace?: string;
  duration?: number;
  memoryUsage?: number;
}

export interface PerformanceMetrics {
  renderTime: number;
  reRenderCount: number;
  memoryUsage: number;
  componentName: string;
  timestamp: Date;
}

export interface ErrorReport {
  id: string;
  error: Error;
  context: {
    component?: string;
    action?: string;
    state?: any;
  };
  timestamp: Date;
  resolved: boolean;
}

export interface DiagnosticsState {
  // Estado
  events: DiagnosticEvent[];
  performanceMetrics: PerformanceMetrics[];
  errorReports: ErrorReport[];
  isEnabled: boolean;
  maxEvents: number;
  maxMetrics: number;
  
  // Actions
  addEvent: (event: Omit<DiagnosticEvent, 'id' | 'timestamp'>) => void;
  addPerformanceMetric: (metric: Omit<PerformanceMetrics, 'timestamp'>) => void;
  addErrorReport: (error: Error, context?: any) => void;
  clearEvents: () => void;
  clearMetrics: () => void;
  clearErrors: () => void;
  setEnabled: (enabled: boolean) => void;
  
  // Selectors
  getEventsByType: (type: DiagnosticEvent['type']) => DiagnosticEvent[];
  getEventsByCategory: (category: DiagnosticEvent['category']) => DiagnosticEvent[];
  getRecentEvents: (limit?: number) => DiagnosticEvent[];
  getPerformanceSummary: () => {
    averageRenderTime: number;
    totalReRenders: number;
    memoryPeak: number;
    slowestComponent: string;
  };
  getErrorSummary: () => {
    totalErrors: number;
    unresolvedErrors: number;
    mostCommonError: string;
  };
}

/**
 * Manager centralizado para diagnósticos del MapFlow
 * Proporciona monitoreo en tiempo real, métricas de performance y reportes de errores
 */
export const useDiagnosticsStore = create<DiagnosticsState>()(
  subscribeWithSelector((set, get) => ({
    // Estado inicial
    events: [],
    performanceMetrics: [],
    errorReports: [],
    isEnabled: __DEV__,
    maxEvents: 1000,
    maxMetrics: 500,
    
    // Actions
    addEvent: (eventData) => {
      if (!get().isEnabled) return;
      
      const event: DiagnosticEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        ...eventData,
      };
      
      set((state) => {
        const newEvents = [...state.events, event];
        // Mantener solo los últimos maxEvents
        if (newEvents.length > state.maxEvents) {
          newEvents.splice(0, newEvents.length - state.maxEvents);
        }
        
        return { events: newEvents };
      });
      
      // Log en consola si es error o warning
      if (event.type === 'error' || event.type === 'warning') {
        if (event.type === 'error') {
          console.error(`[Diagnostics] ${event.category}: ${event.message}`, event.data);
        } else if (event.type === 'warning') {
          console.warn(`[Diagnostics] ${event.category}: ${event.message}`, event.data);
        }
      }
    },
    
    addPerformanceMetric: (metricData) => {
      if (!get().isEnabled) return;
      
      const metric: PerformanceMetrics = {
        timestamp: new Date(),
        ...metricData,
      };
      
      set((state) => {
        const newMetrics = [...state.performanceMetrics, metric];
        if (newMetrics.length > state.maxMetrics) {
          newMetrics.splice(0, newMetrics.length - state.maxMetrics);
        }
        
        return { performanceMetrics: newMetrics };
      });
    },
    
    addErrorReport: (error, context = {}) => {
      if (!get().isEnabled) return;
      
      const report: ErrorReport = {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        error,
        context,
        timestamp: new Date(),
        resolved: false,
      };
      
      set((state) => ({
        errorReports: [...state.errorReports, report],
      }));
      
      // También agregar como evento
      get().addEvent({
        type: 'error',
        category: 'component',
        message: error.message,
        data: { error: error.stack, context },
        component: context.component,
        stackTrace: error.stack,
      });
    },
    
    clearEvents: () => {
      set({ events: [] });
    },
    
    clearMetrics: () => {
      set({ performanceMetrics: [] });
    },
    
    clearErrors: () => {
      set({ errorReports: [] });
    },
    
    setEnabled: (enabled) => {
      set({ isEnabled: enabled });
    },
    
    // Selectors
    getEventsByType: (type) => {
      return get().events.filter(event => event.type === type);
    },
    
    getEventsByCategory: (category) => {
      return get().events.filter(event => event.category === category);
    },
    
    getRecentEvents: (limit = 50) => {
      const events = get().events;
      return events.slice(-limit);
    },
    
    getPerformanceSummary: () => {
      const metrics = get().performanceMetrics;
      if (metrics.length === 0) {
        return {
          averageRenderTime: 0,
          totalReRenders: 0,
          memoryPeak: 0,
          slowestComponent: 'N/A',
        };
      }
      
      const totalRenderTime = metrics.reduce((sum, metric) => sum + metric.renderTime, 0);
      const totalReRenders = metrics.reduce((sum, metric) => sum + metric.reRenderCount, 0);
      const memoryPeak = Math.max(...metrics.map(metric => metric.memoryUsage));
      const slowestComponent = metrics.reduce((slowest, metric) => 
        metric.renderTime > slowest.renderTime ? metric : slowest
      ).componentName;
      
      return {
        averageRenderTime: totalRenderTime / metrics.length,
        totalReRenders,
        memoryPeak,
        slowestComponent,
      };
    },
    
    getErrorSummary: () => {
      const errors = get().errorReports;
      const totalErrors = errors.length;
      const unresolvedErrors = errors.filter(error => !error.resolved).length;
      
      // Encontrar el error más común
      const errorCounts = errors.reduce((counts, error) => {
        const key = error.error.message;
        counts[key] = (counts[key] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);
      
      const mostCommonError = Object.entries(errorCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
      
      return {
        totalErrors,
        unresolvedErrors,
        mostCommonError,
      };
    },
  }))
);

// Selectors optimizados para componentes
export const useDiagnosticsEvents = () => 
  useDiagnosticsStore((state) => state.events);

export const useDiagnosticsMetrics = () => 
  useDiagnosticsStore((state) => state.performanceMetrics);

export const useDiagnosticsErrors = () => 
  useDiagnosticsStore((state) => state.errorReports);

export const useDiagnosticsEnabled = () => 
  useDiagnosticsStore((state) => state.isEnabled);

export const useRecentDiagnostics = (limit = 20) => 
  useDiagnosticsStore((state) => state.getRecentEvents(limit));

export const usePerformanceSummary = () => 
  useDiagnosticsStore((state) => state.getPerformanceSummary());

export const useErrorSummary = () => 
  useDiagnosticsStore((state) => state.getErrorSummary());
