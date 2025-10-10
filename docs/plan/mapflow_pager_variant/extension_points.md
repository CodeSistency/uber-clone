# Puntos de Extensión para Variante PagerView

## **🎯 Estrategia de Extensión No Invasiva**

### **1. Extensión del MapFlowState**

#### **Ubicación Actual**
```typescript
// En store/mapFlow/mapFlow.ts línea 334
export interface MapFlowState {
  // ... propiedades existentes
  flow: {
    bottomSheetVisible: boolean;
    bottomSheetMinHeight: number;
    bottomSheetMaxHeight: number;
    bottomSheetInitialHeight: number;
    bottomSheetShowHandle: boolean;
    bottomSheetAllowDrag: boolean;
    bottomSheetAllowClose: boolean;
    bottomSheetUseGradient: boolean;
    bottomSheetUseBlur: boolean;
    bottomSheetBottomBar: React.ReactNode;
  };
  setCurrentStep: (step: MapFlowStep) => void;
  // ... más propiedades
}
```

#### **Extensión Propuesta**
```typescript
// Agregar después de la propiedad 'flow'
variant: {
  usePagerView: boolean;           // Flag para activar variante
  currentPageIndex: number;        // Índice de página actual
  totalPages: number;             // Total de páginas
  isTransitioning: boolean;       // Estado de transición
  pagerSteps: MapFlowStep[];      // Pasos disponibles en pager
  enableSwipe: boolean;          // Permitir swipe horizontal
  showProgress: boolean;         // Mostrar indicador de progreso
  allowSkip: boolean;            // Permitir saltar pasos
  canNavigateBack: boolean;     // Permitir navegación hacia atrás
  canNavigateForward: boolean;  // Permitir navegación hacia adelante
};
```

### **2. Extensión de StepConfig**

#### **Ubicación Actual**
```typescript
// En store/mapFlow/mapFlow.ts línea ~300
interface StepConfig {
  id: MapFlowStep;
  bottomSheet: {
    visible: boolean;
    minHeight: number;
    maxHeight: number;
    initialHeight: number;
    showHandle?: boolean;
    allowDrag?: boolean;
    allowClose?: boolean;
    // ... más propiedades
  };
  mapInteraction: MapInteraction;
  transition: TransitionConfig;
}
```

#### **Extensión Propuesta**
```typescript
// Agregar después de 'transition'
pager?: {
  enableSwipe: boolean;        // Permitir swipe horizontal
  showProgress: boolean;       // Mostrar indicador de progreso
  allowSkip: boolean;         // Permitir saltar paso
  required: boolean;          // Paso requerido
  canNavigateBack: boolean;   // Permitir navegación hacia atrás
  canNavigateForward: boolean; // Permitir navegación hacia adelante
  progressColor?: string;      // Color del indicador de progreso
  progressSize?: number;      // Tamaño del indicador
};
```

### **3. Extensión del Estado Inicial**

#### **Ubicación Actual**
```typescript
// En store/mapFlow/mapFlow.ts línea 1438
export const useMapFlowStore = create<MapFlowState>((set, get) => ({
  role: "customer",
  service: undefined,
  step: "SELECCION_SERVICIO",
  history: ["SELECCION_SERVICIO"],
  isActive: true,
  stepConfig: DEFAULT_CONFIG,
  steps: DEFAULT_CONFIG,
  flow: {
    bottomSheetVisible: false,
    bottomSheetMinHeight: 100,
    bottomSheetMaxHeight: 500,
    bottomSheetInitialHeight: 200,
    bottomSheetShowHandle: true,
    bottomSheetAllowDrag: true,
    bottomSheetAllowClose: true,
    bottomSheetUseGradient: false,
    bottomSheetUseBlur: false,
    bottomSheetBottomBar: null,
  },
  // ... más propiedades
}));
```

#### **Extensión Propuesta**
```typescript
// Agregar después de 'flow'
variant: {
  usePagerView: false,           // Por defecto desactivado
  currentPageIndex: 0,           // Primera página
  totalPages: 0,                // Sin páginas inicialmente
  isTransitioning: false,        // Sin transición
  pagerSteps: [],               // Array vacío inicialmente
  enableSwipe: true,            // Swipe habilitado por defecto
  showProgress: true,           // Progreso visible por defecto
  allowSkip: false,             // No permitir saltar por defecto
  canNavigateBack: true,        // Navegación hacia atrás habilitada
  canNavigateForward: true,     // Navegación hacia adelante habilitada
},
```

## **🔧 Puntos de Modificación**

### **1. Modificar `setCurrentStep`**

#### **Ubicación Actual**
```typescript
// En store/mapFlow/mapFlow.ts línea 1458
setCurrentStep: (step: MapFlowStep) => {
  console.log('[MapFlowStore] setCurrentStep called with:', step);
  
  // Obtener la configuración del paso
  const stepConfig = DEFAULT_CONFIG[step];
  if (stepConfig) {
    const { bottomSheet } = stepConfig;
    
    // Actualizar el flow con la configuración del paso
    const newFlow = {
      bottomSheetVisible: bottomSheet.visible,
      bottomSheetMinHeight: bottomSheet.minHeight,
      bottomSheetMaxHeight: bottomSheet.maxHeight,
      bottomSheetInitialHeight: bottomSheet.initialHeight,
      bottomSheetShowHandle: bottomSheet.showHandle ?? true,
      bottomSheetAllowDrag: bottomSheet.allowDrag ?? true,
      bottomSheetAllowClose: bottomSheet.allowClose ?? true,
      bottomSheetUseGradient: bottomSheet.useGradient ?? false,
      bottomSheetUseBlur: bottomSheet.useBlur ?? false,
      bottomSheetBottomBar: bottomSheet.bottomBar ?? null,
    };
    
    console.log('[MapFlowStore] Updating flow with:', newFlow);
    
    set({ 
      step,
      flow: newFlow
    });
  } else {
    console.log('[MapFlowStore] No config found for step:', step);
    set({ step });
  }
},
```

#### **Modificación Propuesta**
```typescript
setCurrentStep: (step: MapFlowStep) => {
  console.log('[MapFlowStore] setCurrentStep called with:', step);
  
  const state = get();
  
  // Lógica existente para flow...
  const stepConfig = DEFAULT_CONFIG[step];
  if (stepConfig) {
    const { bottomSheet } = stepConfig;
    
    const newFlow = {
      bottomSheetVisible: bottomSheet.visible,
      bottomSheetMinHeight: bottomSheet.minHeight,
      bottomSheetMaxHeight: bottomSheet.maxHeight,
      bottomSheetInitialHeight: bottomSheet.initialHeight,
      bottomSheetShowHandle: bottomSheet.showHandle ?? true,
      bottomSheetAllowDrag: bottomSheet.allowDrag ?? true,
      bottomSheetAllowClose: bottomSheet.allowClose ?? true,
      bottomSheetUseGradient: bottomSheet.useGradient ?? false,
      bottomSheetUseBlur: bottomSheet.useBlur ?? false,
      bottomSheetBottomBar: bottomSheet.bottomBar ?? null,
    };
    
    // Nueva lógica para variante PagerView
    let newVariant = state.variant;
    if (state.variant.usePagerView && state.variant.pagerSteps.length > 0) {
      const pageIndex = state.variant.pagerSteps.indexOf(step);
      if (pageIndex !== -1) {
        newVariant = {
          ...state.variant,
          currentPageIndex: pageIndex,
          isTransitioning: true
        };
        
        // Resetear isTransitioning después de un delay
        setTimeout(() => {
          set((currentState) => ({
            variant: {
              ...currentState.variant,
              isTransitioning: false
            }
          }));
        }, 300);
      }
    }
    
    set({ 
      step,
      flow: newFlow,
      variant: newVariant
    });
  } else {
    console.log('[MapFlowStore] No config found for step:', step);
    set({ step });
  }
},
```

### **2. Agregar Nuevas Acciones**

#### **Ubicación**: Después de `setCurrentStep` (línea ~1490)

```typescript
// Acciones para variante PagerView
setUsePagerView: (use: boolean) => {
  console.log('[MapFlowStore] setUsePagerView called with:', use);
  set((state) => ({
    variant: {
      ...state.variant,
      usePagerView: use
    }
  }));
},

setCurrentPageIndex: (index: number) => {
  console.log('[MapFlowStore] setCurrentPageIndex called with:', index);
  set((state) => ({
    variant: {
      ...state.variant,
      currentPageIndex: Math.max(0, Math.min(index, state.variant.totalPages - 1))
    }
  }));
},

setTotalPages: (total: number) => {
  console.log('[MapFlowStore] setTotalPages called with:', total);
  set((state) => ({
    variant: {
      ...state.variant,
      totalPages: Math.max(0, total)
    }
  }));
},

setPagerSteps: (steps: MapFlowStep[]) => {
  console.log('[MapFlowStore] setPagerSteps called with:', steps);
  set((state) => ({
    variant: {
      ...state.variant,
      pagerSteps: steps,
      totalPages: steps.length,
      currentPageIndex: 0
    }
  }));
},

goToNextPage: () => {
  const state = get();
  if (state.variant.usePagerView && 
      state.variant.currentPageIndex < state.variant.totalPages - 1) {
    const nextIndex = state.variant.currentPageIndex + 1;
    const nextStep = state.variant.pagerSteps[nextIndex];
    if (nextStep) {
      setCurrentStep(nextStep);
    }
  }
},

goToPreviousPage: () => {
  const state = get();
  if (state.variant.usePagerView && state.variant.currentPageIndex > 0) {
    const prevIndex = state.variant.currentPageIndex - 1;
    const prevStep = state.variant.pagerSteps[prevIndex];
    if (prevStep) {
      setCurrentStep(prevStep);
    }
  }
},

goToPage: (index: number) => {
  const state = get();
  if (state.variant.usePagerView && 
      index >= 0 && index < state.variant.totalPages) {
    const step = state.variant.pagerSteps[index];
    if (step) {
      setCurrentStep(step);
    }
  }
},
```

### **3. Extensión de DEFAULT_CONFIG**

#### **Ubicación**: En la configuración de pasos específicos

```typescript
// Ejemplo para confirm_origin
confirm_origin: {
  id: "confirm_origin",
  bottomSheet: {
    visible: true,
    minHeight: 100,
    maxHeight: 260,
    initialHeight: 120,
    showHandle: true,
    allowDrag: false,
    allowClose: false,
  },
  mapInteraction: "pan_to_confirm",
  transition: { type: "fade", duration: 180 },
  // Nueva configuración de pager
  pager: {
    enableSwipe: false,        // No permitir swipe en confirmación
    showProgress: true,        // Mostrar progreso
    allowSkip: false,         // No permitir saltar
    required: true,           // Paso requerido
    canNavigateBack: true,    // Permitir volver
    canNavigateForward: false, // No permitir avanzar hasta confirmar
  }
},
```

## **⚠️ Consideraciones de Implementación**

### **1. Compatibilidad Hacia Atrás**
- Todas las propiedades de `variant` son opcionales
- Valores por defecto seguros para evitar errores
- Funcionalidad existente no se ve afectada

### **2. Validaciones**
- Verificar que `usePagerView` esté activado antes de usar acciones de pager
- Validar índices de página antes de navegar
- Manejar casos edge (array vacío, índices inválidos)

### **3. Testing**
- Verificar que la funcionalidad existente sigue funcionando
- Testear que la variante se puede activar/desactivar
- Validar navegación entre páginas

### **4. Performance**
- Evitar re-renders innecesarios
- Usar memoización donde sea apropiado
- Optimizar transiciones de página

