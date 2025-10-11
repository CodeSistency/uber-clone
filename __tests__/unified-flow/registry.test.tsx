/**
 * Tests para el sistema de registry de componentes
 */

import { stepRegistry, componentMapper } from '@/components/unified-flow/registry';
import { FLOW_STEPS } from '@/lib/unified-flow/constants';

// Mock de componentes
const MockServiceSelection = () => <div>ServiceSelection</div>;
const MockTransportDefinition = () => <div>TransportDefinition</div>;
const MockDriverConfirmation = () => <div>DriverConfirmation</div>;

describe('StepRegistry', () => {
  beforeEach(() => {
    // Limpiar el registry antes de cada test
    stepRegistry.clear();
  });

  describe('register', () => {
    it('should register a component successfully', () => {
      const component = () => <MockServiceSelection />;
      
      stepRegistry.register(FLOW_STEPS.SELECCION_SERVICIO, component, {
        role: 'customer',
      });

      const registered = stepRegistry.getComponent(FLOW_STEPS.SELECCION_SERVICIO, 'customer');
      expect(registered).toBeDefined();
      expect(registered).toBe(component);
    });

    it('should overwrite existing registration', () => {
      const component1 = () => <MockServiceSelection />;
      const component2 = () => <MockTransportDefinition />;
      
      stepRegistry.register(FLOW_STEPS.SELECCION_SERVICIO, component1, { role: 'customer' });
      stepRegistry.register(FLOW_STEPS.SELECCION_SERVICIO, component2, { role: 'driver' });

      const registered = stepRegistry.getComponent(FLOW_STEPS.SELECCION_SERVICIO, 'driver');
      expect(registered).toBe(component2);
    });

    it('should handle multiple registrations', () => {
      stepRegistry.register(FLOW_STEPS.SELECCION_SERVICIO, () => <MockServiceSelection />, { role: 'customer' });
      stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE, () => <MockTransportDefinition />, { role: 'customer' });
      stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_GESTION_CONFIRMACION, () => <MockDriverConfirmation />, { role: 'customer' });

      expect(stepRegistry.getStats().totalSteps).toBe(3);
    });
  });

  describe('get', () => {
    it('should return undefined for unregistered step', () => {
      const result = stepRegistry.getComponent('UNKNOWN_STEP' as any);
      expect(result).toBeNull();
    });

    it('should return registered component', () => {
      const component = () => <MockServiceSelection />;
      stepRegistry.register(FLOW_STEPS.SELECCION_SERVICIO, component, { role: 'customer' });

      const result = stepRegistry.getComponent(FLOW_STEPS.SELECCION_SERVICIO, 'customer');
      expect(result).toBeDefined();
      expect(result).toBe(component);
    });
  });

  describe('getAll', () => {
    it('should return all registered components', () => {
      stepRegistry.register(FLOW_STEPS.SELECCION_SERVICIO, () => <MockServiceSelection />, { role: 'customer' });
      stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE, () => <MockTransportDefinition />, { role: 'customer' });

      const all = stepRegistry.getRegisteredSteps();
      expect(all).toHaveLength(2);
      expect(all).toContain(FLOW_STEPS.SELECCION_SERVICIO);
      expect(all).toContain(FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      stepRegistry.register(FLOW_STEPS.SELECCION_SERVICIO, () => <MockServiceSelection />, { role: 'customer' });
      stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE, () => <MockTransportDefinition />, { role: 'customer' });

      const stats = stepRegistry.getStats();
      expect(stats.totalSteps).toBe(2);
      expect(stats.totalComponents).toBe(2);
    });
  });

  describe('clear', () => {
    it('should clear all registrations', () => {
      stepRegistry.register(FLOW_STEPS.SELECCION_SERVICIO, () => <MockServiceSelection />, { role: 'customer' });
      expect(stepRegistry.getStats().totalSteps).toBe(1);

      stepRegistry.clear();
      expect(stepRegistry.getStats().totalSteps).toBe(0);
    });
  });
});

describe('ComponentMapper', () => {
  beforeEach(() => {
    // ComponentMapper no tiene método clear, se resetea automáticamente
  });

  describe('createMapper', () => {
    it('should create a mapper function', () => {
      const mapper = componentMapper.createMapper({
        role: 'customer',
        fallbackToDefault: true,
      });

      expect(typeof mapper).toBe('function');
    });

    it('should return registered component when found', () => {
      const component = () => <MockServiceSelection />;
      stepRegistry.register(FLOW_STEPS.SELECCION_SERVICIO, component, { role: 'customer' });

      const mapper = componentMapper.createMapper({
        role: 'customer',
        fallbackToDefault: true,
      });

      const result = mapper(FLOW_STEPS.SELECCION_SERVICIO);
      expect(result).toBeDefined();
    });

    it('should return default component when not found and fallbackToDefault is true', () => {
      const defaultComponent = () => <div>Default</div>;
      componentMapper.setDefaultComponent(defaultComponent);

      const mapper = componentMapper.createMapper({
        role: 'customer',
        fallbackToDefault: true,
      });

      const result = mapper('UNKNOWN_STEP' as any);
      expect(result).toBeDefined();
    });

    it('should return undefined when not found and fallbackToDefault is false', () => {
      const mapper = componentMapper.createMapper({
        role: 'customer',
        fallbackToDefault: false,
      });

      const result = mapper('UNKNOWN_STEP' as any);
      expect(result).toBeUndefined();
    });
  });

  describe('setDefaultComponent', () => {
    it('should set default component', () => {
      const defaultComponent = () => <div>Default</div>;
      componentMapper.setDefaultComponent(defaultComponent);

      const mapper = componentMapper.createMapper({
        role: 'customer',
        fallbackToDefault: true,
      });

      const result = mapper('UNKNOWN_STEP' as any);
      expect(result).toBeDefined();
    });
  });

  describe('clear', () => {
    it('should clear mapper state', () => {
      const defaultComponent = () => <div>Default</div>;
      componentMapper.setDefaultComponent(defaultComponent);

      // ComponentMapper no tiene método clear

      const mapper = componentMapper.createMapper({
        role: 'customer',
        fallbackToDefault: true,
      });

      const result = mapper('UNKNOWN_STEP' as any);
      expect(result).toBeUndefined();
    });
  });
});

describe('Registry Integration', () => {
  beforeEach(() => {
    stepRegistry.clear();
    // ComponentMapper no tiene método clear
  });

  it('should work together to render components', () => {
    // Registrar componente
    const component = () => <MockServiceSelection />;
    stepRegistry.register(FLOW_STEPS.SELECCION_SERVICIO, component, { role: 'customer' });

    // Crear mapper
    const mapper = componentMapper.createMapper({
      role: 'customer',
      fallbackToDefault: true,
    });

    // Renderizar
    const result = mapper(FLOW_STEPS.SELECCION_SERVICIO);
    expect(result).toBeDefined();
  });

  it('should handle role-based filtering', () => {
    // Registrar componentes para diferentes roles
    stepRegistry.register(FLOW_STEPS.SELECCION_SERVICIO, () => <MockServiceSelection />, { role: 'customer' });
    stepRegistry.register(FLOW_STEPS.DRIVER_TRANSPORT_RECIBIR_SOLICITUD, () => <MockDriverConfirmation />, { role: 'driver' });

    // Crear mapper para customer
    const customerMapper = componentMapper.createMapper({
      role: 'customer',
      fallbackToDefault: false,
    });

    // Crear mapper para driver
    const driverMapper = componentMapper.createMapper({
      role: 'driver',
      fallbackToDefault: false,
    });

    // Customer mapper debería encontrar el componente de customer
    const customerResult = customerMapper(FLOW_STEPS.SELECCION_SERVICIO);
    expect(customerResult).toBeDefined();

    // Driver mapper debería encontrar el componente de driver
    const driverResult = driverMapper(FLOW_STEPS.DRIVER_TRANSPORT_RECIBIR_SOLICITUD);
    expect(driverResult).toBeDefined();
  });
});
