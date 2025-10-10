# Análisis de MapFlowState - Documentación Técnica

## **📊 Estructura Actual del MapFlowState**

### **🔍 Interfaz Principal**
```typescript
export interface MapFlowState {
  // Identidad y contexto
  role: MapFlowRole;                    // "customer" | "driver"
  service?: ServiceType;               // "transport" | "delivery" | "mandado" | "envio"
  step: MapFlowStep;                   // Paso actual del flujo
  history: MapFlowStep[];              // Historial de pasos
  isActive: boolean;                   // Estado de activación del flujo

  // Configuración de pasos
  stepConfig: Record<MapFlowStep, StepConfig>;
  steps: Record<MapFlowStep, StepConfig>; // Alias para stepConfig

  // Estado del BottomSheet
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

  // Acciones principales
  setCurrentStep: (step: MapFlowStep) => void;

  // Identificadores de flujo actual
  rideId?: number | null;
  orderId?: number | null;
  errandId?: number | null;
  parcelId?: number | null;

  // Configuración de viaje
  rideType: RideType;
  confirmedOrigin: undefined;
  confirmedDestination: undefined;
}
```

### **🎯 Puntos de Extensión Identificados**

#### **1. Nuevo Objeto `variant` para PagerView**
```typescript
// Propuesta de extensión
variant: {
  usePagerView: boolean;           // Activar/desactivar variante PagerView
  currentPageIndex: number;       // Índice de página actual
  totalPages: number;             // Total de páginas en el flujo
  isTransitioning: boolean;       // Estado de transición
  pagerSteps: MapFlowStep[];      // Pasos disponibles en el pager
  enableSwipe: boolean;          // Permitir swipe horizontal
  showProgress: boolean;         // Mostrar indicador de progreso
}
```

#### **2. Acciones Adicionales Necesarias**
```typescript
// Acciones para manejar la variante
setUsePagerView: (use: boolean) => void;
setCurrentPageIndex: (index: number) => void;
setTotalPages: (total: number) => void;
setPagerSteps: (steps: MapFlowStep[]) => void;
goToNextPage: () => void;
goToPreviousPage: () => void;
goToPage: (index: number) => void;
```

#### **3. Modificación de `setCurrentStep`**
- Detectar si debe usar PagerView o contenido directo
- Actualizar `currentPageIndex` cuando cambia el paso
- Mantener compatibilidad con el comportamiento existente

### **🔧 Configuración por Paso (StepConfig)**

#### **Estructura Actual**
```typescript
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
    className?: string;
    snapPoints?: number[];
    handleHeight?: number;
    useGradient?: boolean;
    useBlur?: boolean;
    gradientColors?: string[];
    blurIntensity?: number;
    blurTint?: 'light' | 'dark' | 'default';
    bottomBar?: React.ReactNode;
    bottomBarHeight?: number;
    showBottomBarAt?: number;
  };
  mapInteraction: MapInteraction;
  transition: TransitionConfig;
}
```

#### **Extensión Propuesta para PagerView**
```typescript
// Agregar a StepConfig
pager?: {
  enableSwipe: boolean;        // Permitir swipe horizontal
  showProgress: boolean;       // Mostrar indicador de progreso
  allowSkip: boolean;          // Permitir saltar pasos
  required: boolean;          // Paso requerido
  canNavigateBack: boolean;   // Permitir navegación hacia atrás
  canNavigateForward: boolean; // Permitir navegación hacia adelante
}
```

### **📈 Estado Inicial Actual**
```typescript
// Estado inicial del store
{
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
  }
}
```

### **🎯 Estrategia de Migración**

#### **Fase 1: Extensión No Invasiva**
- Agregar objeto `variant` con valores por defecto
- Mantener todas las funcionalidades existentes
- No modificar comportamiento actual

#### **Fase 2: Integración Gradual**
- Modificar `setCurrentStep` para detectar variante
- Agregar lógica condicional para PagerView
- Mantener fallback a comportamiento original

#### **Fase 3: Optimización**
- Refinar configuración por paso
- Optimizar rendimiento de transiciones
- Completar testing y documentación

### **⚠️ Consideraciones de Compatibilidad**

1. **Backward Compatibility**: Todas las funcionalidades existentes deben seguir funcionando
2. **Progressive Enhancement**: La variante PagerView debe ser opcional
3. **Performance**: No impactar el rendimiento del sistema actual
4. **Testing**: Verificar que no se rompan flujos existentes

### **🔍 Dependencias Identificadas**

- **Componentes**: `GorhomMapFlowBottomSheet`, `MapFlowPagerView`, `MapFlowPage`
- **Hooks**: `useMapFlowPageContent`, `useMapFlowPager`
- **Store**: Todas las acciones existentes deben mantenerse
- **Configuración**: `DEFAULT_CONFIG` debe extenderse sin romper compatibilidad

