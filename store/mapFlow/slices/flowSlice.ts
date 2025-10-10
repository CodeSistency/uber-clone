import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { 
  MapFlowStep, 
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
  DriverEnvioStep
} from '../types';
import { SERVICE_FLOWS, FLOW_STEPS } from '../constants';
import { mapFlowLogger } from '../logger';

/**
 * Slice para manejar lógica de flujos del MapFlow
 * Responsabilidades:
 * - Navegación entre pasos
 * - Lógica de flujos por servicio
 * - Historial de navegación
 * - Validación de transiciones
 */
export interface FlowSlice {
  // Estado
  role: MapFlowRole;
  service: ServiceType | undefined;
  step: MapFlowStep;
  history: MapFlowStep[];
  isActive: boolean;
  
  // Actions de navegación
  start: (role: MapFlowRole) => void;
  startService: (service: ServiceType, role?: FlowRole) => void;
  stop: () => void;
  reset: () => void;
  goTo: (step: MapFlowStep) => void;
  goToStep: (stepName: string) => void;
  next: () => void;
  back: () => void;
  
  // Type-safe helpers
  startWithCustomerStep: (step: CustomerFlowStep) => void;
  startWithDriverStep: (step: DriverFlowStep) => void;
  startWithTransportStep: (step: CustomerTransportStep | DriverTransportStep, role: FlowRole) => void;
  startWithDeliveryStep: (step: CustomerDeliveryStep | DriverDeliveryStep, role: FlowRole) => void;
  startWithMandadoStep: (step: CustomerMandadoStep | DriverMandadoStep, role: FlowRole) => void;
  startWithEnvioStep: (step: CustomerEnvioStep | DriverEnvioStep, role: FlowRole) => void;
  
  // Selectors
  getCurrentStep: () => MapFlowStep;
  getCurrentRole: () => MapFlowRole;
  getCurrentService: () => ServiceType | undefined;
  getHistory: () => MapFlowStep[];
  isStepActive: (step: MapFlowStep) => boolean;
  canNavigateTo: (step: MapFlowStep) => boolean;
  getNextStep: () => MapFlowStep | null;
  getPreviousStep: () => MapFlowStep | null;
}

export const useFlowSlice = create<FlowSlice>()(
  subscribeWithSelector((set, get) => ({
    // Estado inicial
    role: 'customer',
    service: undefined,
    step: 'SELECCION_SERVICIO',
    history: ['SELECCION_SERVICIO'],
    isActive: true,
    
    // Actions de navegación
    start: (role: MapFlowRole) => {
      mapFlowLogger('debug', 'start', { role });
      
      set({
        role,
        isActive: true,
        step: 'travel_start',
        history: ['travel_start'],
      });
    },
    
    startService: (service: ServiceType, role: FlowRole = 'customer') => {
      mapFlowLogger('debug', 'startService', { service, role });
      
      const firstStep = SERVICE_FLOWS[role][service][0];
      
      set({
        role,
        service,
        isActive: true,
        step: firstStep,
        history: [firstStep],
      });
    },
    
    stop: () => {
      mapFlowLogger('debug', 'stop');
      
      set({
        isActive: false,
        step: 'idle',
        history: [],
      });
    },
    
    reset: () => {
      mapFlowLogger('debug', 'reset');
      
      set({
        step: 'idle',
        history: [],
      });
    },
    
    goTo: (step: MapFlowStep) => {
      mapFlowLogger('debug', 'goTo', { step });
      
      set((state) => ({
        step,
        history: [...state.history, step],
      }));
    },
    
    goToStep: (stepName: string) => {
      mapFlowLogger('debug', 'goToStep', { stepName });
      
      // Validar que el paso existe
      const validSteps = Object.keys(SERVICE_FLOWS.customer.transport);
      if (!validSteps.includes(stepName)) {
        mapFlowLogger('warn', 'Invalid step name', stepName);
        return;
      }
      
      get().goTo(stepName as MapFlowStep);
    },
    
    next: () => {
      const state = get();
      mapFlowLogger('debug', 'next', { currentStep: state.step, service: state.service, role: state.role });
      
      // Lógica especial para transport service
      if (state.service === 'transport') {
        if (state.role === 'customer') {
          const currentStep = state.step;
          
          if (currentStep === FLOW_STEPS.CUSTOMER_TRANSPORT.DEFINICION_VIAJE) {
            // Navegación condicional basada en rideType
            // Por ahora, ir a CONFIRM_DESTINATION por defecto
            get().goTo(FLOW_STEPS.CUSTOMER_TRANSPORT.CONFIRM_DESTINATION);
            return;
          }
          
          if (currentStep === FLOW_STEPS.CUSTOMER_TRANSPORT.CONFIRM_ORIGIN) {
            get().goTo(FLOW_STEPS.CUSTOMER_TRANSPORT.CONFIRM_DESTINATION);
            return;
          }
          
          if (currentStep === FLOW_STEPS.CUSTOMER_TRANSPORT.CONFIRM_DESTINATION) {
            get().goTo(FLOW_STEPS.CUSTOMER_TRANSPORT.SELECCION_VEHICULO);
            return;
          }
        } else if (state.role === 'driver') {
          const currentStep = state.step;
          
          if (currentStep === FLOW_STEPS.DRIVER_TRANSPORT.RECIBIR_SOLICITUD) {
            get().goTo(FLOW_STEPS.DRIVER_TRANSPORT.ACEPTAR_RECHAZAR);
            return;
          }
        }
      }
      
      // Lógica de flujo por servicio
      if (state.service && state.role && SERVICE_FLOWS[state.role]?.[state.service]) {
        const serviceFlow = SERVICE_FLOWS[state.role][state.service];
        const currentIndex = serviceFlow.indexOf(state.step as any);
        
        if (currentIndex >= 0 && currentIndex < serviceFlow.length - 1) {
          const nextStep = serviceFlow[currentIndex + 1];
          get().goTo(nextStep);
        }
      }
    },
    
    back: () => {
      const state = get();
      mapFlowLogger('debug', 'back', { currentStep: state.step, history: state.history });
      
      const history = [...state.history];
      history.pop(); // remover actual
      const previous = history[history.length - 1] || 'travel_start';
      
      set({
        step: previous,
        history,
      });
    },
    
    // Type-safe helpers
    startWithCustomerStep: (step: CustomerFlowStep) => {
      mapFlowLogger('debug', 'startWithCustomerStep', { step });
      
      set({
        role: 'customer',
        step,
        history: [step],
        isActive: true,
      });
    },
    
    startWithDriverStep: (step: DriverFlowStep) => {
      mapFlowLogger('debug', 'startWithDriverStep', { step });
      
      set({
        role: 'driver',
        step,
        history: [step],
        isActive: true,
      });
    },
    
    startWithTransportStep: (step: CustomerTransportStep | DriverTransportStep, role: FlowRole) => {
      mapFlowLogger('debug', 'startWithTransportStep', { step, role });
      
      set({
        role,
        service: 'transport',
        step,
        history: [step],
        isActive: true,
      });
    },
    
    startWithDeliveryStep: (step: CustomerDeliveryStep | DriverDeliveryStep, role: FlowRole) => {
      mapFlowLogger('debug', 'startWithDeliveryStep', { step, role });
      
      set({
        role,
        service: 'delivery',
        step,
        history: [step],
        isActive: true,
      });
    },
    
    startWithMandadoStep: (step: CustomerMandadoStep | DriverMandadoStep, role: FlowRole) => {
      mapFlowLogger('debug', 'startWithMandadoStep', { step, role });
      
      set({
        role,
        service: 'mandado',
        step,
        history: [step],
        isActive: true,
      });
    },
    
    startWithEnvioStep: (step: CustomerEnvioStep | DriverEnvioStep, role: FlowRole) => {
      mapFlowLogger('debug', 'startWithEnvioStep', { step, role });
      
      set({
        role,
        service: 'envio',
        step,
        history: [step],
        isActive: true,
      });
    },
    
    // Selectors
    getCurrentStep: () => get().step,
    getCurrentRole: () => get().role,
    getCurrentService: () => get().service,
    getHistory: () => get().history,
    
    isStepActive: (step: MapFlowStep) => {
      return get().step === step;
    },
    
    canNavigateTo: (step: MapFlowStep) => {
      const state = get();
      // Lógica básica de validación
      return state.isActive;
    },
    
    getNextStep: () => {
      const state = get();
      if (state.service && state.role && SERVICE_FLOWS[state.role]?.[state.service]) {
        const serviceFlow = SERVICE_FLOWS[state.role][state.service];
        const currentIndex = serviceFlow.indexOf(state.step as any);
        
        if (currentIndex >= 0 && currentIndex < serviceFlow.length - 1) {
          return serviceFlow[currentIndex + 1];
        }
      }
      return null;
    },
    
    getPreviousStep: () => {
      const state = get();
      const history = state.history;
      return history.length > 1 ? history[history.length - 2] : null;
    },
  }))
);

// Selectors optimizados para componentes
export const useCurrentStep = () => 
  useFlowSlice((state) => state.step);

export const useCurrentRole = () => 
  useFlowSlice((state) => state.role);

export const useCurrentService = () => 
  useFlowSlice((state) => state.service);

export const useFlowHistory = () => 
  useFlowSlice((state) => state.history);

export const useIsStepActive = (step: MapFlowStep) => 
  useFlowSlice((state) => state.step === step);
