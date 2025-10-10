import React from 'react';
import { View, Text } from 'react-native';
import type { MapFlowStep } from '@/store';
import { stepRegistry, type StepComponent } from './StepRegistry';

/**
 * Configuración para mapeo de componentes
 */
export interface ComponentMappingConfig {
  role?: 'customer' | 'driver';
  service?: 'transport' | 'delivery' | 'mandado' | 'envio';
  fallbackToDefault?: boolean;
  showDebugInfo?: boolean;
}

/**
 * Componente por defecto para pasos no implementados
 */
export interface DefaultStepProps {
  step: MapFlowStep;
  role?: 'customer' | 'driver';
  onBack?: () => void;
}

/**
 * Mapper para componentes de pasos del MapFlow
 * Proporciona mapeo type-safe y manejo de fallbacks
 */
export class ComponentMapper {
  private static instance: ComponentMapper;
  private defaultComponent: StepComponent | null = null;
  private debugMode: boolean = false;

  private constructor() {
    // Singleton pattern
  }

  /**
   * Obtener instancia singleton del mapper
   */
  public static getInstance(): ComponentMapper {
    if (!ComponentMapper.instance) {
      ComponentMapper.instance = new ComponentMapper();
    }
    return ComponentMapper.instance;
  }

  /**
   * Configurar componente por defecto
   */
  public setDefaultComponent(component: StepComponent): void {
    this.defaultComponent = component;
  }

  /**
   * Habilitar/deshabilitar modo debug
   */
  public setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Mapear paso a componente
   */
  public mapStepToComponent(
    step: MapFlowStep,
    config: ComponentMappingConfig = {}
  ): StepComponent {
    const { role, service, fallbackToDefault = true, showDebugInfo = false } = config;

    // 🐛 DEBUG: Logging detallado del ComponentMapper
    console.log('=== COMPONENT MAPPER DEBUG ===');
    console.log('Step:', step);
    console.log('Role:', role);
    console.log('Service:', service);
    console.log('Fallback to default:', fallbackToDefault);
    console.log('Default component exists:', !!this.defaultComponent);

    // Buscar componente en el registry
    const component = stepRegistry.getComponent(step, role, service);
    console.log('Component found:', !!component);
    console.log('Component type:', typeof component);

    if (component) {
      if (showDebugInfo || this.debugMode) {
        console.log(`[ComponentMapper] Found component for step: ${step}`, {
          role,
          service,
          component: component.name || 'Anonymous',
        });
      }
      console.log('✅ Rendering component for step:', step);
      return component;
    }

    // Si no se encuentra y se permite fallback
    if (fallbackToDefault && this.defaultComponent) {
      if (showDebugInfo || this.debugMode) {
        console.warn(`[ComponentMapper] Using default component for step: ${step}`, {
          role,
          service,
        });
      }
      console.log('⚠️ Using default component for step:', step);
      return this.defaultComponent;
    }

    // Si no hay fallback disponible, crear componente de error
    if (showDebugInfo || this.debugMode) {
      console.error(`[ComponentMapper] No component found for step: ${step}`, {
        role,
        service,
        fallbackToDefault,
      });
    }

    return this.createErrorComponent(step, role);
  }

  /**
   * Crear función de mapeo para un contexto específico
   */
  public createMapper(config: ComponentMappingConfig = {}): (step: MapFlowStep) => React.ReactNode {
    return (step: MapFlowStep) => {
      const Component = this.mapStepToComponent(step, config);
      return React.createElement(Component);
    };
  }

  /**
   * Crear función de mapeo con props personalizadas
   */
  public createMapperWithProps<T extends Record<string, any>>(
    config: ComponentMappingConfig = {},
    defaultProps: T = {} as T
  ): (step: MapFlowStep, props?: Partial<T>) => React.ReactNode {
    return (step: MapFlowStep, props: Partial<T> = {}) => {
      const Component = this.mapStepToComponent(step, config);
      const mergedProps = { ...defaultProps, ...props };
      return React.createElement(Component, mergedProps);
    };
  }

  /**
   * Crear componente de error para pasos no encontrados
   */
  private createErrorComponent(step: MapFlowStep, role?: string): StepComponent {
    return () => {
      const stepName = step.replace(/_/g, ' ').toLowerCase();
      const roleName = role || 'unknown';
      
      return React.createElement(View, {
        style: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
          backgroundColor: '#f8f9fa',
        },
      }, [
        React.createElement(Text, {
          key: 'icon',
          style: { fontSize: 48, marginBottom: 16 },
        }, '🚧'),
        React.createElement(Text, {
          key: 'title',
          style: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 8,
            textAlign: 'center',
            color: '#dc3545',
          },
        }, 'Component Not Found'),
        React.createElement(Text, {
          key: 'step',
          style: {
            fontSize: 14,
            color: '#6c757d',
            textAlign: 'center',
            marginBottom: 4,
          },
        }, `Step: ${stepName}`),
        React.createElement(Text, {
          key: 'role',
          style: {
            fontSize: 12,
            color: '#6c757d',
            textAlign: 'center',
          },
        }, `Role: ${roleName}`),
      ]);
    };
  }

  /**
   * Obtener información de debug para un paso
   */
  public getDebugInfo(step: MapFlowStep, config: ComponentMappingConfig = {}): {
    hasComponent: boolean;
    componentName: string | null;
    registrations: number;
    fallbackAvailable: boolean;
  } {
    const { role, service } = config;
    const hasComponent = stepRegistry.hasComponent(step);
    const component = stepRegistry.getComponent(step, role, service);
    const registrations = stepRegistry.getAllComponents(step).length;
    const fallbackAvailable = !!this.defaultComponent;

    return {
      hasComponent,
      componentName: component?.name || null,
      registrations,
      fallbackAvailable,
    };
  }

  /**
   * Validar mapeo para múltiples pasos
   */
  public validateMapping(
    steps: MapFlowStep[],
    config: ComponentMappingConfig = {}
  ): {
    valid: boolean;
    missingSteps: MapFlowStep[];
    debugInfo: Partial<Record<MapFlowStep, ReturnType<ComponentMapper['getDebugInfo']>>>;
  } {
    const missingSteps: MapFlowStep[] = [];
    const debugInfo: Partial<Record<MapFlowStep, ReturnType<ComponentMapper['getDebugInfo']>>> = {};

    steps.forEach(step => {
      const info = this.getDebugInfo(step, config);
      debugInfo[step] = info;

      if (!info.hasComponent && !info.fallbackAvailable) {
        missingSteps.push(step);
      }
    });

    return {
      valid: missingSteps.length === 0,
      missingSteps,
      debugInfo,
    };
  }
}

// Exportar instancia singleton
export const componentMapper = ComponentMapper.getInstance();
