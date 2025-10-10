import React from 'react';
import type { MapFlowStep } from '@/store';

/**
 * Tipo para componentes de pasos
 */
export type StepComponent = () => React.ReactNode;

/**
 * Configuración de registro de componentes
 */
export interface StepRegistration {
  component: StepComponent;
  role?: 'customer' | 'driver';
  service?: 'transport' | 'delivery' | 'mandado' | 'envio';
  fallback?: boolean;
  priority?: number;
}

/**
 * Registry centralizado para componentes de pasos del MapFlow
 * Permite registro type-safe y búsqueda optimizada de componentes
 */
export class StepRegistry {
  private static instance: StepRegistry;
  private components: Map<MapFlowStep, StepRegistration[]> = new Map();
  private fallbackComponents: Map<MapFlowStep, StepComponent> = new Map();

  private constructor() {
    // Singleton pattern
  }

  /**
   * Obtener instancia singleton del registry
   */
  public static getInstance(): StepRegistry {
    if (!StepRegistry.instance) {
      StepRegistry.instance = new StepRegistry();
    }
    return StepRegistry.instance;
  }

  /**
   * Registrar un componente para un paso específico
   */
  public register(
    step: MapFlowStep,
    component: StepComponent,
    options: Omit<StepRegistration, 'component'> = {}
  ): void {
    const registration: StepRegistration = {
      component,
      ...options,
    };

    if (!this.components.has(step)) {
      this.components.set(step, []);
    }

    const existing = this.components.get(step)!;
    
    // Si es fallback, guardarlo por separado
    if (options.fallback) {
      this.fallbackComponents.set(step, component);
      return;
    }

    // Agregar con prioridad (mayor prioridad = primero en la lista)
    const priority = options.priority || 0;
    const insertIndex = existing.findIndex(reg => (reg.priority || 0) < priority);
    
    if (insertIndex === -1) {
      existing.push(registration);
    } else {
      existing.splice(insertIndex, 0, registration);
    }
  }

  /**
   * Registrar múltiples componentes de una vez
   */
  public registerBatch(registrations: Record<MapFlowStep, StepComponent>): void {
    Object.entries(registrations).forEach(([step, component]) => {
      this.register(step as MapFlowStep, component);
    });
  }

  /**
   * Obtener componente para un paso específico
   */
  public getComponent(
    step: MapFlowStep,
    role?: 'customer' | 'driver',
    service?: 'transport' | 'delivery' | 'mandado' | 'envio'
  ): StepComponent | null {
    // 🐛 DEBUG: Logging detallado del StepRegistry
    console.log('=== STEP REGISTRY DEBUG ===');
    console.log('Looking for step:', step);
    console.log('Looking for role:', role);
    console.log('Looking for service:', service);
    console.log('Registry size:', this.components.size);
    console.log('Registry keys:', Array.from(this.components.keys()));
    
    const registrations = this.components.get(step);
    console.log('Registered steps for this step:', registrations?.length || 0);
    
    if (!registrations || registrations.length === 0) {
      console.log('❌ No registered steps found for step:', step);
      // Intentar con fallback
      const fallback = this.fallbackComponents.get(step);
      console.log('Fallback component exists:', !!fallback);
      return fallback || null;
    }

    // Log all registered steps for this step
    registrations.forEach((reg, index) => {
      console.log(`Registered step ${index}:`, {
        role: reg.role,
        service: reg.service,
        priority: reg.priority,
        hasComponent: !!reg.component
      });
    });

    // Buscar el mejor match
    for (const registration of registrations) {
      // Match exacto de role y service
      if (role && service && registration.role === role && registration.service === service) {
        console.log('✅ Found exact match (role + service)');
        return registration.component;
      }
      
      // Match de role solamente
      if (role && !service && registration.role === role && !registration.service) {
        console.log('✅ Found role match');
        return registration.component;
      }
      
      // Match de service solamente
      if (!role && service && !registration.role && registration.service === service) {
        console.log('✅ Found service match');
        return registration.component;
      }
      
      // Match genérico (sin role ni service específicos)
      if (!role && !service && !registration.role && !registration.service) {
        console.log('✅ Found generic match');
        return registration.component;
      }
    }

    // Si no hay match, usar el primero disponible
    const firstRegistration = registrations[0];
    if (firstRegistration) {
      console.log('⚠️ Using first available registration');
      return firstRegistration.component;
    }

    console.log('❌ No match found for step:', step);
    // Finalmente, intentar con fallback
    const fallback = this.fallbackComponents.get(step);
    console.log('Final fallback component exists:', !!fallback);
    return fallback || null;
  }

  /**
   * Obtener todos los componentes registrados para un paso
   */
  public getAllComponents(step: MapFlowStep): StepRegistration[] {
    return this.components.get(step) || [];
  }

  /**
   * Verificar si un paso tiene componentes registrados
   */
  public hasComponent(step: MapFlowStep): boolean {
    const registrations = this.components.get(step);
    return (registrations && registrations.length > 0) || this.fallbackComponents.has(step);
  }

  /**
   * Obtener todos los pasos registrados
   */
  public getRegisteredSteps(): MapFlowStep[] {
    const steps = new Set<MapFlowStep>();
    
    this.components.forEach((_, step) => steps.add(step));
    this.fallbackComponents.forEach((_, step) => steps.add(step));
    
    return Array.from(steps);
  }

  /**
   * Limpiar todos los registros
   */
  public clear(): void {
    this.components.clear();
    this.fallbackComponents.clear();
  }

  /**
   * Limpiar registros para un paso específico
   */
  public clearStep(step: MapFlowStep): void {
    this.components.delete(step);
    this.fallbackComponents.delete(step);
  }

  /**
   * Obtener estadísticas del registry
   */
  public getStats(): {
    totalSteps: number;
    totalComponents: number;
    fallbackComponents: number;
  } {
    const totalSteps = this.getRegisteredSteps().length;
    const totalComponents = Array.from(this.components.values())
      .reduce((sum, registrations) => sum + registrations.length, 0);
    const fallbackComponents = this.fallbackComponents.size;

    return {
      totalSteps,
      totalComponents,
      fallbackComponents,
    };
  }

  /**
   * Validar que todos los pasos requeridos tienen componentes
   */
  public validate(requiredSteps: MapFlowStep[]): {
    valid: boolean;
    missingSteps: MapFlowStep[];
  } {
    const missingSteps: MapFlowStep[] = [];
    
    requiredSteps.forEach(step => {
      if (!this.hasComponent(step)) {
        missingSteps.push(step);
      }
    });

    return {
      valid: missingSteps.length === 0,
      missingSteps,
    };
  }
}

// Exportar instancia singleton
export const stepRegistry = StepRegistry.getInstance();
