# Diseño de Acciones de Variante - PagerView

## **📊 ST1.2.1.2: Definición de Acciones para VariantState**

### **🔍 Categorías de Acciones**

#### **1. Acciones de Control de Activación**
```typescript
// Activar/desactivar variante PagerView
setUsePagerView: (usePagerView: boolean) => void;

// Configurar pasos del pager
setPagerSteps: (steps: MapFlowStep[]) => void;

// Resetear variante a estado inicial
resetVariant: () => void;
```

#### **2. Acciones de Navegación**
```typescript
// Navegar a página específica
setCurrentPageIndex: (pageIndex: number) => void;

// Navegar al siguiente paso
goToNextPage: () => void;

// Navegar al paso anterior
goToPreviousPage: () => void;

// Navegar a paso específico
goToStep: (step: MapFlowStep) => void;

// Navegar a página específica con validación
navigateToPage: (pageIndex: number, validate?: boolean) => void;
```

#### **3. Acciones de Configuración**
```typescript
// Configurar navegación
setNavigationConfig: (config: NavigationConfig) => void;

// Configurar apariencia visual
setVisualConfig: (config: VisualConfig) => void;

// Configurar animaciones
setAnimationConfig: (config: AnimationConfig) => void;

// Configurar validaciones
setValidationConfig: (config: ValidationConfig) => void;
```

#### **4. Acciones de Estado**
```typescript
// Actualizar estado de transición
setTransitioning: (isTransitioning: boolean) => void;

// Marcar paso como completado
markStepCompleted: (step: MapFlowStep) => void;

// Marcar paso como saltado
markStepSkipped: (step: MapFlowStep) => void;

// Actualizar pasos requeridos
setRequiredSteps: (steps: MapFlowStep[]) => void;
```

#### **5. Acciones de Error**
```typescript
// Establecer error
setError: (error: string | null) => void;

// Limpiar error
clearError: () => void;

// Incrementar contador de reintentos
incrementRetryCount: () => void;

// Resetear contador de reintentos
resetRetryCount: () => void;
```

### **🎯 Implementación Detallada**

#### **1. Acciones de Control de Activación**

```typescript
// Activar/desactivar variante PagerView
setUsePagerView: (usePagerView: boolean) => {
  console.log('[MapFlowStore] setUsePagerView called with:', usePagerView);
  
  set((state) => ({
    variant: {
      ...state.variant,
      usePagerView,
      // Resetear estado cuando se desactiva
      ...(usePagerView ? {} : {
        currentPageIndex: 0,
        totalPages: 0,
        isTransitioning: false,
        pagerSteps: [],
        currentStepIndex: 0,
        completedSteps: [],
        skippedSteps: [],
        hasError: false,
        errorMessage: null,
        retryCount: 0,
      })
    }
  }));
},

// Configurar pasos del pager
setPagerSteps: (steps: MapFlowStep[]) => {
  console.log('[MapFlowStore] setPagerSteps called with:', steps);
  
  set((state) => ({
    variant: {
      ...state.variant,
      pagerSteps: steps,
      totalPages: steps.length,
      // Ajustar currentPageIndex si es necesario
      currentPageIndex: Math.min(state.variant.currentPageIndex, steps.length - 1),
    }
  }));
},

// Resetear variante a estado inicial
resetVariant: () => {
  console.log('[MapFlowStore] resetVariant called');
  
  set((state) => ({
    variant: DEFAULT_VARIANT_STATE
  }));
},
```

#### **2. Acciones de Navegación**

```typescript
// Navegar a página específica
setCurrentPageIndex: (pageIndex: number) => {
  console.log('[MapFlowStore] setCurrentPageIndex called with:', pageIndex);
  
  set((state) => {
    const { variant } = state;
    
    // Validar índice
    if (pageIndex < 0 || pageIndex >= variant.totalPages) {
      console.warn('[MapFlowStore] Invalid page index:', pageIndex);
      return state;
    }
    
    // Obtener paso correspondiente
    const step = variant.pagerSteps[pageIndex];
    if (!step) {
      console.warn('[MapFlowStore] No step found for page index:', pageIndex);
      return state;
    }
    
    return {
      variant: {
        ...variant,
        currentPageIndex: pageIndex,
        currentStepIndex: pageIndex,
        isTransitioning: true,
      },
      // Actualizar paso principal si es diferente
      ...(step !== state.step ? { step } : {})
    };
  });
  
  // Limpiar estado de transición después de un tiempo
  setTimeout(() => {
    set((state) => ({
      variant: {
        ...state.variant,
        isTransitioning: false,
      }
    }));
  }, 300);
},

// Navegar al siguiente paso
goToNextPage: () => {
  console.log('[MapFlowStore] goToNextPage called');
  
  const state = get();
  const { variant } = state;
  
  if (variant.currentPageIndex < variant.totalPages - 1) {
    state.setCurrentPageIndex(variant.currentPageIndex + 1);
  }
},

// Navegar al paso anterior
goToPreviousPage: () => {
  console.log('[MapFlowStore] goToPreviousPage called');
  
  const state = get();
  const { variant } = state;
  
  if (variant.currentPageIndex > 0) {
    state.setCurrentPageIndex(variant.currentPageIndex - 1);
  }
},

// Navegar a paso específico
goToStep: (step: MapFlowStep) => {
  console.log('[MapFlowStore] goToStep called with:', step);
  
  const state = get();
  const { variant } = state;
  
  const stepIndex = variant.pagerSteps.findIndex(s => s === step);
  if (stepIndex !== -1) {
    state.setCurrentPageIndex(stepIndex);
  } else {
    console.warn('[MapFlowStore] Step not found in pager steps:', step);
  }
},

// Navegar a página específica con validación
navigateToPage: (pageIndex: number, validate: boolean = true) => {
  console.log('[MapFlowStore] navigateToPage called with:', { pageIndex, validate });
  
  const state = get();
  const { variant } = state;
  
  if (validate) {
    // Validar que se pueda navegar a esa página
    const canNavigate = canNavigateToPage(pageIndex, variant);
    if (!canNavigate) {
      console.warn('[MapFlowStore] Cannot navigate to page:', pageIndex);
      return;
    }
  }
  
  state.setCurrentPageIndex(pageIndex);
},
```

#### **3. Acciones de Configuración**

```typescript
// Configurar navegación
setNavigationConfig: (config: NavigationConfig) => {
  console.log('[MapFlowStore] setNavigationConfig called with:', config);
  
  set((state) => ({
    variant: {
      ...state.variant,
      enableSwipe: config.enableSwipe ?? state.variant.enableSwipe,
      showProgress: config.showProgress ?? state.variant.showProgress,
      allowSkip: config.allowSkip ?? state.variant.allowSkip,
      canNavigateBack: config.canNavigateBack ?? state.variant.canNavigateBack,
      canNavigateForward: config.canNavigateForward ?? state.variant.canNavigateForward,
    }
  }));
},

// Configurar apariencia visual
setVisualConfig: (config: VisualConfig) => {
  console.log('[MapFlowStore] setVisualConfig called with:', config);
  
  set((state) => ({
    variant: {
      ...state.variant,
      progressColor: config.progressColor ?? state.variant.progressColor,
      progressSize: config.progressSize ?? state.variant.progressSize,
      progressStyle: config.progressStyle ?? state.variant.progressStyle,
    }
  }));
},

// Configurar animaciones
setAnimationConfig: (config: AnimationConfig) => {
  console.log('[MapFlowStore] setAnimationConfig called with:', config);
  
  set((state) => ({
    variant: {
      ...state.variant,
      transitionDuration: config.transitionDuration ?? state.variant.transitionDuration,
      animationType: config.animationType ?? state.variant.animationType,
      enableAnimations: config.enableAnimations ?? state.variant.enableAnimations,
    }
  }));
},

// Configurar validaciones
setValidationConfig: (config: ValidationConfig) => {
  console.log('[MapFlowStore] setValidationConfig called with:', config);
  
  set((state) => ({
    variant: {
      ...state.variant,
      requiredSteps: config.requiredSteps ?? state.variant.requiredSteps,
    }
  }));
},
```

#### **4. Acciones de Estado**

```typescript
// Actualizar estado de transición
setTransitioning: (isTransitioning: boolean) => {
  console.log('[MapFlowStore] setTransitioning called with:', isTransitioning);
  
  set((state) => ({
    variant: {
      ...state.variant,
      isTransitioning,
    }
  }));
},

// Marcar paso como completado
markStepCompleted: (step: MapFlowStep) => {
  console.log('[MapFlowStore] markStepCompleted called with:', step);
  
  set((state) => {
    const { variant } = state;
    const completedSteps = [...variant.completedSteps];
    
    if (!completedSteps.includes(step)) {
      completedSteps.push(step);
    }
    
    return {
      variant: {
        ...variant,
        completedSteps,
      }
    };
  });
},

// Marcar paso como saltado
markStepSkipped: (step: MapFlowStep) => {
  console.log('[MapFlowStore] markStepSkipped called with:', step);
  
  set((state) => {
    const { variant } = state;
    const skippedSteps = [...variant.skippedSteps];
    
    if (!skippedSteps.includes(step)) {
      skippedSteps.push(step);
    }
    
    return {
      variant: {
        ...variant,
        skippedSteps,
      }
    };
  });
},

// Actualizar pasos requeridos
setRequiredSteps: (steps: MapFlowStep[]) => {
  console.log('[MapFlowStore] setRequiredSteps called with:', steps);
  
  set((state) => ({
    variant: {
      ...state.variant,
      requiredSteps: steps,
    }
  }));
},
```

#### **5. Acciones de Error**

```typescript
// Establecer error
setError: (error: string | null) => {
  console.log('[MapFlowStore] setError called with:', error);
  
  set((state) => ({
    variant: {
      ...state.variant,
      hasError: !!error,
      errorMessage: error,
    }
  }));
},

// Limpiar error
clearError: () => {
  console.log('[MapFlowStore] clearError called');
  
  set((state) => ({
    variant: {
      ...state.variant,
      hasError: false,
      errorMessage: null,
      retryCount: 0,
    }
  }));
},

// Incrementar contador de reintentos
incrementRetryCount: () => {
  console.log('[MapFlowStore] incrementRetryCount called');
  
  set((state) => ({
    variant: {
      ...state.variant,
      retryCount: state.variant.retryCount + 1,
    }
  }));
},

// Resetear contador de reintentos
resetRetryCount: () => {
  console.log('[MapFlowStore] resetRetryCount called');
  
  set((state) => ({
    variant: {
      ...state.variant,
      retryCount: 0,
    }
  }));
},
```

### **🔧 Interfaces de Configuración**

#### **NavigationConfig**
```typescript
interface NavigationConfig {
  enableSwipe?: boolean;
  showProgress?: boolean;
  allowSkip?: boolean;
  canNavigateBack?: boolean;
  canNavigateForward?: boolean;
}
```

#### **VisualConfig**
```typescript
interface VisualConfig {
  progressColor?: string;
  progressSize?: number;
  progressStyle?: 'dots' | 'bar' | 'steps';
}
```

#### **AnimationConfig**
```typescript
interface AnimationConfig {
  transitionDuration?: number;
  animationType?: 'slide' | 'fade' | 'scale';
  enableAnimations?: boolean;
}
```

#### **ValidationConfig**
```typescript
interface ValidationConfig {
  requiredSteps?: MapFlowStep[];
}
```

### **🎯 Helpers de Validación**

#### **1. Validación de Navegación**
```typescript
// Validar si se puede navegar a una página
const canNavigateToPage = (pageIndex: number, variant: VariantState): boolean => {
  // Verificar rango
  if (pageIndex < 0 || pageIndex >= variant.totalPages) {
    return false;
  }
  
  // Verificar si está en transición
  if (variant.isTransitioning) {
    return false;
  }
  
  // Verificar si la variante está activa
  if (!variant.usePagerView) {
    return false;
  }
  
  return true;
};
```

#### **2. Validación de Paso**
```typescript
// Validar si se puede navegar a un paso específico
const canNavigateToStep = (step: MapFlowStep, variant: VariantState): boolean => {
  // Verificar si el paso está en pagerSteps
  if (!variant.pagerSteps.includes(step)) {
    return false;
  }
  
  // Verificar si es un paso requerido
  if (variant.requiredSteps.includes(step)) {
    return true;
  }
  
  // Verificar si se permite saltar
  if (variant.allowSkip) {
    return true;
  }
  
  return false;
};
```

#### **3. Validación de Estado**
```typescript
// Validar estado completo de la variante
const validateVariantState = (variant: VariantState): ValidationResult => {
  const errors: string[] = [];
  
  // Validar índices
  if (variant.currentPageIndex < 0 || variant.currentPageIndex >= variant.totalPages) {
    errors.push('currentPageIndex está fuera de rango');
  }
  
  // Validar pasos
  if (variant.usePagerView && variant.pagerSteps.length === 0) {
    errors.push('pagerSteps no puede estar vacío cuando usePagerView es true');
  }
  
  // Validar transición
  if (variant.isTransitioning && variant.totalPages === 0) {
    errors.push('No puede estar en transición si no hay páginas');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

### **🎯 Acciones Compuestas**

#### **1. Inicializar Variante**
```typescript
// Inicializar variante con configuración completa
initializeVariant: (config: VariantInitializationConfig) => {
  console.log('[MapFlowStore] initializeVariant called with:', config);
  
  const state = get();
  
  // Configurar pasos
  state.setPagerSteps(config.steps);
  
  // Configurar navegación
  if (config.navigation) {
    state.setNavigationConfig(config.navigation);
  }
  
  // Configurar visual
  if (config.visual) {
    state.setVisualConfig(config.visual);
  }
  
  // Configurar animaciones
  if (config.animation) {
    state.setAnimationConfig(config.animation);
  }
  
  // Configurar validaciones
  if (config.validation) {
    state.setValidationConfig(config.validation);
  }
  
  // Activar variante
  state.setUsePagerView(true);
},
```

#### **2. Navegar con Validación**
```typescript
// Navegar con validación completa
navigateWithValidation: (pageIndex: number) => {
  console.log('[MapFlowStore] navigateWithValidation called with:', pageIndex);
  
  const state = get();
  const { variant } = state;
  
  // Validar navegación
  if (!canNavigateToPage(pageIndex, variant)) {
    state.setError(`Cannot navigate to page ${pageIndex}`);
    return;
  }
  
  // Obtener paso correspondiente
  const step = variant.pagerSteps[pageIndex];
  if (!step) {
    state.setError(`No step found for page ${pageIndex}`);
    return;
  }
  
  // Validar paso
  if (!canNavigateToStep(step, variant)) {
    state.setError(`Cannot navigate to step ${step}`);
    return;
  }
  
  // Navegar
  state.setCurrentPageIndex(pageIndex);
  state.clearError();
},
```

### **✅ Conclusión**

#### **Fortalezas del Diseño de Acciones**
- ✅ **Completas**: Cubren todos los aspectos de la variante
- ✅ **Validadas**: Sistema de validación robusto
- ✅ **Flexibles**: Configuración granular
- ✅ **Compuestas**: Acciones complejas que combinan múltiples operaciones
- ✅ **Consistentes**: Siguen el patrón del store existente

#### **Próximos Pasos**
1. **Implementar** las acciones en el store
2. **Crear** helpers de validación
3. **Diseñar** estrategia de migración gradual
4. **Implementar** testing de las acciones

