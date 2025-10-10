# Diseño de Interfaz Variant - PagerView

## **📊 ST1.2.1.1: Definición de VariantState**

### **🔍 Interfaz Principal**

```typescript
// Nueva interfaz para el estado de la variante PagerView
export interface VariantState {
  // Control de activación
  usePagerView: boolean;           // Flag para activar/desactivar variante
  
  // Estado de navegación
  currentPageIndex: number;        // Índice de página actual (0-based)
  totalPages: number;             // Total de páginas en el flujo
  isTransitioning: boolean;       // Estado de transición entre páginas
  
  // Configuración de pasos
  pagerSteps: MapFlowStep[];       // Array de pasos disponibles en el pager
  currentStepIndex: number;        // Índice del paso actual en pagerSteps
  
  // Configuración de navegación
  enableSwipe: boolean;           // Permitir swipe horizontal
  showProgress: boolean;          // Mostrar indicador de progreso
  allowSkip: boolean;             // Permitir saltar pasos
  canNavigateBack: boolean;      // Permitir navegación hacia atrás
  canNavigateForward: boolean;   // Permitir navegación hacia adelante
  
  // Configuración visual
  progressColor: string;          // Color del indicador de progreso
  progressSize: number;           // Tamaño del indicador
  progressStyle: 'dots' | 'bar' | 'steps'; // Estilo del indicador
  
  // Estados de validación
  completedSteps: MapFlowStep[];  // Pasos completados
  requiredSteps: MapFlowStep[];   // Pasos requeridos
  skippedSteps: MapFlowStep[];    // Pasos saltados
  
  // Configuración de animaciones
  transitionDuration: number;     // Duración de transiciones (ms)
  animationType: 'slide' | 'fade' | 'scale'; // Tipo de animación
  enableAnimations: boolean;     // Habilitar animaciones
  
  // Estados de error
  hasError: boolean;             // Si hay error en la variante
  errorMessage: string | null;   // Mensaje de error
  retryCount: number;            // Contador de reintentos
}
```

### **🎯 Propiedades por Categoría**

#### **1. Control de Activación**
```typescript
usePagerView: boolean;
```
- **Propósito**: Flag principal para activar/desactivar la variante
- **Valor por defecto**: `false`
- **Uso**: Determina si usar PagerView o contenido directo

#### **2. Estado de Navegación**
```typescript
currentPageIndex: number;        // 0-based index
totalPages: number;             // Total de páginas
isTransitioning: boolean;       // Estado de transición
pagerSteps: MapFlowStep[];       // Pasos disponibles
currentStepIndex: number;        // Índice del paso actual
```
- **Propósito**: Manejar navegación entre páginas
- **Sincronización**: Se sincroniza con `currentStep` del store principal

#### **3. Configuración de Navegación**
```typescript
enableSwipe: boolean;           // Swipe horizontal
showProgress: boolean;          // Indicador de progreso
allowSkip: boolean;             // Saltar pasos
canNavigateBack: boolean;      // Navegación hacia atrás
canNavigateForward: boolean;   // Navegación hacia adelante
```
- **Propósito**: Controlar comportamiento de navegación
- **Configuración**: Puede ser global o por paso

#### **4. Configuración Visual**
```typescript
progressColor: string;          // Color del indicador
progressSize: number;           // Tamaño del indicador
progressStyle: 'dots' | 'bar' | 'steps'; // Estilo del indicador
```
- **Propósito**: Personalizar apariencia del indicador de progreso
- **Flexibilidad**: Diferentes estilos según preferencias

#### **5. Estados de Validación**
```typescript
completedSteps: MapFlowStep[];  // Pasos completados
requiredSteps: MapFlowStep[];   // Pasos requeridos
skippedSteps: MapFlowStep[];    // Pasos saltados
```
- **Propósito**: Rastrear progreso y validaciones
- **Uso**: Para indicador de progreso y validaciones de navegación

#### **6. Configuración de Animaciones**
```typescript
transitionDuration: number;     // Duración (ms)
animationType: 'slide' | 'fade' | 'scale'; // Tipo de animación
enableAnimations: boolean;     // Habilitar animaciones
```
- **Propósito**: Controlar animaciones de transición
- **Performance**: Permite deshabilitar animaciones si es necesario

#### **7. Estados de Error**
```typescript
hasError: boolean;             // Si hay error
errorMessage: string | null;   // Mensaje de error
retryCount: number;            // Contador de reintentos
```
- **Propósito**: Manejar errores en la variante
- **Recuperación**: Sistema de reintentos automático

### **🔧 Valores por Defecto**

```typescript
// Estado inicial de la variante
const DEFAULT_VARIANT_STATE: VariantState = {
  // Control de activación
  usePagerView: false,
  
  // Estado de navegación
  currentPageIndex: 0,
  totalPages: 0,
  isTransitioning: false,
  pagerSteps: [],
  currentStepIndex: 0,
  
  // Configuración de navegación
  enableSwipe: true,
  showProgress: true,
  allowSkip: false,
  canNavigateBack: true,
  canNavigateForward: true,
  
  // Configuración visual
  progressColor: '#0286FF',
  progressSize: 8,
  progressStyle: 'dots',
  
  // Estados de validación
  completedSteps: [],
  requiredSteps: [],
  skippedSteps: [],
  
  // Configuración de animaciones
  transitionDuration: 300,
  animationType: 'slide',
  enableAnimations: true,
  
  // Estados de error
  hasError: false,
  errorMessage: null,
  retryCount: 0,
};
```

### **🎯 Integración con MapFlowState**

#### **Extensión Propuesta**
```typescript
// En store/mapFlow/mapFlow.ts
export interface MapFlowState {
  // ... propiedades existentes
  
  // Nueva propiedad para variante
  variant: VariantState;
  
  // ... resto de propiedades
}
```

#### **Actualización del Estado Inicial**
```typescript
// En el store inicial
export const useMapFlowStore = create<MapFlowState>((set, get) => ({
  // ... estado existente
  
  variant: DEFAULT_VARIANT_STATE,
  
  // ... resto del estado
}));
```

### **🔍 Validaciones y Constraints**

#### **1. Validaciones de Índices**
```typescript
// Validar que currentPageIndex esté en rango
const isValidPageIndex = (index: number, totalPages: number): boolean => {
  return index >= 0 && index < totalPages;
};

// Validar que pagerSteps no esté vacío cuando usePagerView es true
const isValidPagerSteps = (steps: MapFlowStep[], usePagerView: boolean): boolean => {
  return !usePagerView || steps.length > 0;
};
```

#### **2. Validaciones de Navegación**
```typescript
// Validar que se pueda navegar a un paso específico
const canNavigateToStep = (
  step: MapFlowStep,
  variant: VariantState,
  stepConfig: StepConfig
): boolean => {
  // Verificar si el paso está en pagerSteps
  if (!variant.pagerSteps.includes(step)) {
    return false;
  }
  
  // Verificar si el paso es requerido
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

#### **3. Validaciones de Estado**
```typescript
// Validar estado de transición
const isTransitioningValid = (variant: VariantState): boolean => {
  // No puede estar en transición si no hay páginas
  if (variant.totalPages === 0 && variant.isTransitioning) {
    return false;
  }
  
  // No puede estar en transición si no está activada la variante
  if (!variant.usePagerView && variant.isTransitioning) {
    return false;
  }
  
  return true;
};
```

### **🎨 Configuraciones por Tipo de Paso**

#### **Pasos de Confirmación**
```typescript
const CONFIRMATION_VARIANT_CONFIG: Partial<VariantState> = {
  enableSwipe: false,        // No permitir swipe
  showProgress: true,        // Mostrar progreso
  allowSkip: false,          // No permitir saltar
  canNavigateBack: true,     // Permitir volver
  canNavigateForward: false, // No permitir avanzar hasta confirmar
  progressStyle: 'steps',    // Indicador de pasos
};
```

#### **Pasos de Búsqueda**
```typescript
const SEARCHING_VARIANT_CONFIG: Partial<VariantState> = {
  enableSwipe: false,        // No permitir swipe durante búsqueda
  showProgress: true,        // Mostrar progreso
  allowSkip: false,          // No permitir saltar
  canNavigateBack: false,    // No permitir volver
  canNavigateForward: false, // No permitir avanzar
  progressStyle: 'dots',     // Indicador de puntos
};
```

#### **Pasos de Espera**
```typescript
const WAITING_VARIANT_CONFIG: Partial<VariantState> = {
  enableSwipe: false,        // No permitir swipe
  showProgress: true,        // Mostrar progreso
  allowSkip: false,          // No permitir saltar
  canNavigateBack: false,    // No permitir volver
  canNavigateForward: false, // No permitir avanzar
  progressStyle: 'bar',      // Indicador de barra
};
```

### **🔧 Helpers y Utilidades**

#### **1. Helper de Configuración por Paso**
```typescript
// Obtener configuración de variante por paso
const getVariantConfigForStep = (step: MapFlowStep): Partial<VariantState> => {
  switch (step) {
    case 'confirm_origin':
    case 'CUSTOMER_TRANSPORT_GESTION_CONFIRMACION':
      return CONFIRMATION_VARIANT_CONFIG;
      
    case 'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR':
      return SEARCHING_VARIANT_CONFIG;
      
    case 'CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION':
    case 'CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO':
      return WAITING_VARIANT_CONFIG;
      
    default:
      return {}; // Configuración por defecto
  }
};
```

#### **2. Helper de Validación de Estado**
```typescript
// Validar estado completo de la variante
const validateVariantState = (variant: VariantState): ValidationResult => {
  const errors: string[] = [];
  
  // Validar índices
  if (!isValidPageIndex(variant.currentPageIndex, variant.totalPages)) {
    errors.push('currentPageIndex está fuera de rango');
  }
  
  // Validar pasos
  if (!isValidPagerSteps(variant.pagerSteps, variant.usePagerView)) {
    errors.push('pagerSteps no puede estar vacío cuando usePagerView es true');
  }
  
  // Validar transición
  if (!isTransitioningValid(variant)) {
    errors.push('Estado de transición inválido');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

### **🎯 Consideraciones de Performance**

#### **1. Memoización de Cálculos**
```typescript
// Memoizar cálculos costosos
const useVariantCalculations = (variant: VariantState) => {
  return useMemo(() => {
    return {
      progressPercentage: (variant.currentPageIndex / variant.totalPages) * 100,
      canGoBack: variant.currentPageIndex > 0,
      canGoForward: variant.currentPageIndex < variant.totalPages - 1,
      isFirstPage: variant.currentPageIndex === 0,
      isLastPage: variant.currentPageIndex === variant.totalPages - 1,
    };
  }, [variant.currentPageIndex, variant.totalPages]);
};
```

#### **2. Optimización de Re-renders**
```typescript
// Usar selectores específicos para evitar re-renders innecesarios
const useVariantSelector = <T>(selector: (variant: VariantState) => T) => {
  return useMapFlowStore(state => selector(state.variant));
};
```

### **✅ Conclusión**

#### **Fortalezas del Diseño**
- ✅ **Completo**: Cubre todos los aspectos de la variante PagerView
- ✅ **Flexible**: Configuración granular por paso
- ✅ **Validado**: Sistema de validaciones robusto
- ✅ **Performante**: Optimizaciones de performance incluidas
- ✅ **Extensible**: Fácil agregar nuevas funcionalidades

#### **Próximos Pasos**
1. **Implementar** la interfaz en el store
2. **Crear** acciones para manejar la variante
3. **Diseñar** estrategia de migración gradual
4. **Implementar** validaciones y helpers

