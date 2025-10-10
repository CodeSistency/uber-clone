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

      const registered = stepRegistry.get(FLOW_STEPS.SELECCION_SERVICIO);
      expect(registered).toBeDefined();
      expect(registered?.component).toBe(component);
      expect(registered?.metadata.role).toBe('customer');
    });

    it('should overwrite existing registration', () => {
      const component1 = () => <MockServiceSelection />;
      const component2 = () => <MockTransportDefinition />;
      
      stepRegistry.register(FLOW_STEPS.SELECCION_SERVICIO, component1, { role: 'customer' });
      stepRegistry.register(FLOW_STEPS.SELECCION_SERVICIO, component2, { role: 'driver' });

      const registered = stepRegistry.get(FLOW_STEPS.SELECCION_SERVICIO);
      expect(registered?.component).toBe(component2);
      expect(registered?.metadata.role).toBe('driver');
    });

    it('should handle multiple registrations', () => {
      stepRegistry.register(FLOW_STEPS.SELECCION_SERVICIO, () => <MockServiceSelection />, { role: 'customer' });
      stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE, () => <MockTransportDefinition />, { role: 'customer' });
      stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_GESTION_CONFIRMACION, () => <MockDriverConfirmation />, { role: 'customer' });

      expect(stepRegistry.getStats().total).toBe(3);
    });
  });

  describe('get', () => {
    it('should return undefined for unregistered step', () => {
      const result = stepRegistry.get('UNKNOWN_STEP' as any);
      expect(result).toBeUndefined();
    });

    it('should return registered component', () => {
      const component = () => <MockServiceSelection />;
      stepRegistry.register(FLOW_STEPS.SELECCION_SERVICIO, component, { role: 'customer' });

      const result = stepRegistry.get(FLOW_STEPS.SELECCION_SERVICIO);
      expect(result).toBeDefined();
      expect(result?.component).toBe(component);
    });
  });

  describe('getAll', () => {
    it('should return all registered components', () => {
      stepRegistry.register(FLOW_STEPS.SELECCION_SERVICIO, () => <MockServiceSelection />, { role: 'customer' });
      stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE, () => <MockTransportDefinition />, { role: 'customer' });

      const all = stepRegistry.getAll();
      expect(all).toHaveLength(2);
      expect(all[0].step).toBe(FLOW_STEPS.SELECCION_SERVICIO);
      expect(all[1].step).toBe(FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      stepRegistry.register(FLOW_STEPS.SELECCION_SERVICIO, () => <MockServiceSelection />, { role: 'customer' });
      stepRegistry.register(FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE, () => <MockTransportDefinition />, { role: 'customer' });

      const stats = stepRegistry.getStats();
      expect(stats.total).toBe(2);
      expect(stats.byRole.customer).toBe(2);
      expect(stats.byRole.driver).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all registrations', () => {
      stepRegistry.register(FLOW_STEPS.SELECCION_SERVICIO, () => <MockServiceSelection />, { role: 'customer' });
      expect(stepRegistry.getStats().total).toBe(1);

      stepRegistry.clear();
      expect(stepRegistry.getStats().total).toBe(0);
    });
  });
});

describe('ComponentMapper', () => {
  beforeEach(() => {
    // Limpiar el mapper antes de cada test
    componentMapper.clear();
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

      componentMapper.clear();

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
    componentMapper.clear();
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
