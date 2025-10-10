/**
 * Barrel exports para el sistema de registry de componentes
 * Proporciona acceso centralizado al registry y mapper
 */

// Exportar clases principales
export { StepRegistry, stepRegistry } from './StepRegistry';
export { ComponentMapper, componentMapper } from './ComponentMapper';

// Importar instancias para uso interno
import { stepRegistry } from './StepRegistry';
import { componentMapper } from './ComponentMapper';

// Exportar tipos
export type { StepComponent, StepRegistration } from './StepRegistry';
export type { ComponentMappingConfig, DefaultStepProps } from './ComponentMapper';

// Exportar helpers para inicialización
export const initializeStepRegistry = () => {
  // Esta función se puede usar para inicializar el registry con componentes por defecto
  if (__DEV__) {
    console.log('[StepRegistry] Initializing step registry...');
  }
  
  // Aquí se pueden registrar componentes por defecto si es necesario
  // stepRegistry.register('SELECCION_SERVICIO', () => <ServiceSelection />);
  
  return stepRegistry;
};

export const initializeComponentMapper = () => {
  // Esta función se puede usar para configurar el mapper
  if (__DEV__) {
    console.log('[ComponentMapper] Initializing component mapper...');
  }
  
  // Configurar modo debug basado en __DEV__
  componentMapper.setDebugMode(__DEV__);
  
  return componentMapper;
};

// Función de conveniencia para inicializar todo el sistema
export const initializeRegistry = () => {
  const registry = initializeStepRegistry();
  const mapper = initializeComponentMapper();
  
  if (__DEV__) {
    console.log('[Registry] Initialization complete', {
      registry: registry.getStats(),
      mapper: 'ComponentMapper initialized',
    });
  }
  
  return { registry, mapper };
};

// Exportar funciones de registro de pasos
export { registerCustomerSteps } from './registerCustomerSteps';
export { registerDriverSteps } from './registerDriverSteps';

// Función para registrar todos los pasos
export const registerAllSteps = () => {
  if (__DEV__) {
    console.log('[Registry] Registering all step components...');
  }
  
  // Importar y ejecutar registros
  const { registerCustomerSteps } = require('./registerCustomerSteps');
  const { registerDriverSteps } = require('./registerDriverSteps');
  
  registerCustomerSteps();
  registerDriverSteps();
  
  if (__DEV__) {
    console.log('[Registry] All step components registered successfully');
  }
};