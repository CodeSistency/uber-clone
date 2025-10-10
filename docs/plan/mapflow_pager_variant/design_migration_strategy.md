# Estrategia de Migración Gradual - PagerView Variant

## **📊 ST1.2.1.3: Plan de Migración Sin Romper Funcionalidad**

### **🎯 Principios de Migración**

#### **1. Backward Compatibility**
- ✅ **Funcionalidad Existente**: Mantener 100% de compatibilidad
- ✅ **APIs Existentes**: No cambiar interfaces públicas
- ✅ **Comportamiento por Defecto**: Variante desactivada por defecto
- ✅ **Rollback Seguro**: Posibilidad de desactivar variante en cualquier momento

#### **2. Feature Flags**
- ✅ **Control Granular**: Activar/desactivar por paso
- ✅ **Configuración Dinámica**: Cambiar configuración en runtime
- ✅ **Testing A/B**: Probar variante con usuarios específicos
- ✅ **Monitoreo**: Tracking de uso y performance

#### **3. Migración Incremental**
- ✅ **Fase 1**: Extensión del store (sin cambios visuales)
- ✅ **Fase 2**: Componentes de variante (opcionales)
- ✅ **Fase 3**: Integración con BottomSheet (condicional)
- ✅ **Fase 4**: Activación gradual por pasos

### **🔧 Estrategia de Implementación**

#### **Fase 1: Extensión del Store (Sin Breaking Changes)**

```typescript
// 1.1: Agregar VariantState al MapFlowState
export interface MapFlowState {
  // ... propiedades existentes (sin cambios)
  
  // Nueva propiedad opcional
  variant?: VariantState;  // Opcional para mantener compatibilidad
}

// 1.2: Agregar acciones de variante
export const useMapFlowStore = create<MapFlowState>((set, get) => ({
  // ... acciones existentes (sin cambios)
  
  // Nuevas acciones de variante
  setUsePagerView: (usePagerView: boolean) => { /* implementación */ },
  setPagerSteps: (steps: MapFlowStep[]) => { /* implementación */ },
  // ... resto de acciones de variante
}));
```

#### **Fase 2: Componentes de Variante (Opcionales)**

```typescript
// 2.1: Crear MapFlowProgressHandle (nuevo componente)
export const MapFlowProgressHandle: React.FC<MapFlowProgressHandleProps> = ({
  // Props para indicador de progreso
}) => {
  // Implementación del handle con progreso
};

// 2.2: Crear useMapFlowVariant (nuevo hook)
export const useMapFlowVariant = () => {
  // Hook para manejar estado de variante
};

// 2.3: Crear useMapFlowProgressHandle (nuevo hook)
export const useMapFlowProgressHandle = () => {
  // Hook para manejar indicador de progreso
};
```

#### **Fase 3: Integración Condicional con BottomSheet**

```typescript
// 3.1: Extender GorhomMapFlowBottomSheet (condicional)
export const GorhomMapFlowBottomSheet: React.FC<GorhomMapFlowBottomSheetProps> = ({
  // ... props existentes
  
  // Nuevas props opcionales
  usePagerView?: boolean;
  pagerSteps?: MapFlowStep[];
  onStepChange?: (step: MapFlowStep) => void;
}) => {
  const variant = useMapFlowVariant();
  
  // Renderizado condicional
  if (usePagerView && variant.usePagerView) {
    return (
      <BottomSheet
        // ... props existentes
        handleComponent={<MapFlowProgressHandle />}
      >
        <MapFlowPagerView
          steps={pagerSteps || variant.pagerSteps}
          currentStep={step}
          onStepChange={onStepChange}
        />
      </BottomSheet>
    );
  }
  
  // Renderizado existente (sin cambios)
  return (
    <BottomSheet
      // ... props existentes
    >
      {children}
    </BottomSheet>
  );
};
```

#### **Fase 4: Activación Gradual**

```typescript
// 4.1: Configuración por paso
const STEP_VARIANT_CONFIG: Record<MapFlowStep, boolean> = {
  'idle': false,                    // No usar variante
  'confirm_origin': false,          // No usar variante
  'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR': true,  // Usar variante
  'CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION': true, // Usar variante
  'CUSTOMER_TRANSPORT_GESTION_CONFIRMACION': false, // No usar variante
  'CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO': true,     // Usar variante
  'DRIVER_FINALIZACION_RATING': false,            // No usar variante
};

// 4.2: Hook para determinar si usar variante
export const useShouldUsePagerView = (step: MapFlowStep): boolean => {
  const { variant } = useMapFlowStore();
  
  // Verificar configuración global
  if (!variant.usePagerView) {
    return false;
  }
  
  // Verificar configuración por paso
  return STEP_VARIANT_CONFIG[step] || false;
};
```

### **🔧 Implementación por Fases**

#### **Fase 1: Extensión del Store (Semana 1)**

```typescript
// 1.1: Agregar VariantState
interface MapFlowState {
  // ... propiedades existentes
  variant: VariantState;
}

// 1.2: Agregar acciones básicas
const useMapFlowStore = create<MapFlowState>((set, get) => ({
  // ... acciones existentes
  
  // Acciones de variante
  setUsePagerView: (usePagerView: boolean) => {
    set((state) => ({
      variant: {
        ...state.variant,
        usePagerView,
      }
    }));
  },
  
  setPagerSteps: (steps: MapFlowStep[]) => {
    set((state) => ({
      variant: {
        ...state.variant,
        pagerSteps: steps,
        totalPages: steps.length,
      }
    }));
  },
  
  // ... resto de acciones de variante
}));
```

#### **Fase 2: Componentes de Variante (Semana 2)**

```typescript
// 2.1: MapFlowProgressHandle
export const MapFlowProgressHandle: React.FC<MapFlowProgressHandleProps> = ({
  currentStep,
  currentPageIndex,
  totalPages,
  steps,
  onStepPress,
  showProgress = true,
  progressColor = '#0286FF',
  progressSize = 8,
  progressStyle = 'dots',
}) => {
  const { variant } = useMapFlowVariant();
  
  if (!showProgress) {
    return null;
  }
  
  return (
    <View style={styles.handleContainer}>
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <TouchableOpacity
            key={step}
            style={[
              styles.progressStep,
              {
                backgroundColor: index <= currentPageIndex ? progressColor : 'rgba(255,255,255,0.3)',
                width: progressSize,
                height: progressSize,
              }
            ]}
            onPress={() => onStepPress?.(step)}
          />
        ))}
      </View>
    </View>
  );
};

// 2.2: useMapFlowVariant
export const useMapFlowVariant = () => {
  const variant = useMapFlowStore(state => state.variant);
  const actions = useMapFlowStore(state => ({
    setUsePagerView: state.setUsePagerView,
    setPagerSteps: state.setPagerSteps,
    setCurrentPageIndex: state.setCurrentPageIndex,
    goToNextPage: state.goToNextPage,
    goToPreviousPage: state.goToPreviousPage,
    goToStep: state.goToStep,
    // ... resto de acciones
  }));
  
  return {
    ...variant,
    ...actions,
  };
};
```

#### **Fase 3: Integración con BottomSheet (Semana 3)**

```typescript
// 3.1: Extender GorhomMapFlowBottomSheet
export const GorhomMapFlowBottomSheet: React.FC<GorhomMapFlowBottomSheetProps> = ({
  // ... props existentes
  
  // Nuevas props opcionales
  usePagerView = false,
  pagerSteps = [],
  onStepChange,
  children,
}) => {
  const variant = useMapFlowVariant();
  const shouldUsePagerView = useShouldUsePagerView(step);
  
  // Determinar si usar variante
  const useVariant = usePagerView && variant.usePagerView && shouldUsePagerView;
  
  // Renderizado condicional
  if (useVariant) {
    return (
      <BottomSheet
        // ... props existentes
        handleComponent={<MapFlowProgressHandle />}
      >
        <MapFlowPagerView
          steps={pagerSteps.length > 0 ? pagerSteps : variant.pagerSteps}
          currentStep={step}
          onStepChange={onStepChange}
        />
      </BottomSheet>
    );
  }
  
  // Renderizado existente (sin cambios)
  return (
    <BottomSheet
      // ... props existentes
    >
      {children}
    </BottomSheet>
  );
};
```

#### **Fase 4: Activación Gradual (Semana 4)**

```typescript
// 4.1: Configuración por paso
const STEP_VARIANT_CONFIG: Record<MapFlowStep, boolean> = {
  'idle': false,
  'confirm_origin': false,
  'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR': true,
  'CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION': true,
  'CUSTOMER_TRANSPORT_GESTION_CONFIRMACION': false,
  'CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO': true,
  'DRIVER_FINALIZACION_RATING': false,
};

// 4.2: Hook para determinar uso de variante
export const useShouldUsePagerView = (step: MapFlowStep): boolean => {
  const { variant } = useMapFlowStore();
  
  if (!variant.usePagerView) {
    return false;
  }
  
  return STEP_VARIANT_CONFIG[step] || false;
};

// 4.3: Integración en UnifiedFlowWrapper
export const UnifiedFlowWrapper: React.FC<UnifiedFlowWrapperProps> = ({
  // ... props existentes
}) => {
  const flow = useMapFlow();
  const shouldUsePagerView = useShouldUsePagerView(flow.step);
  
  return (
    <View className="flex-1">
      <Map />
      
      {flow.bottomSheetVisible ? (
        <GorhomMapFlowBottomSheet
          // ... props existentes
          usePagerView={shouldUsePagerView}
          pagerSteps={flow.variant.pagerSteps}
          onStepChange={(step) => flow.setCurrentStep(step)}
        >
          {content}
        </GorhomMapFlowBottomSheet>
      ) : (
        <View>{content}</View>
      )}
    </View>
  );
};
```

### **🔧 Testing y Validación**

#### **1. Testing de Compatibilidad**
```typescript
// Test: Funcionalidad existente no se rompe
describe('Backward Compatibility', () => {
  it('should work without variant', () => {
    const { result } = renderHook(() => useMapFlow());
    
    // Verificar que funcionalidad existente funciona
    expect(result.current.step).toBe('idle');
    expect(result.current.bottomSheetVisible).toBe(false);
  });
  
  it('should work with variant disabled', () => {
    const { result } = renderHook(() => useMapFlow());
    
    // Desactivar variante
    result.current.setUsePagerView(false);
    
    // Verificar que funcionalidad existente funciona
    expect(result.current.variant.usePagerView).toBe(false);
  });
});
```

#### **2. Testing de Variante**
```typescript
// Test: Variante funciona correctamente
describe('PagerView Variant', () => {
  it('should activate variant', () => {
    const { result } = renderHook(() => useMapFlow());
    
    // Activar variante
    result.current.setUsePagerView(true);
    result.current.setPagerSteps(['step1', 'step2', 'step3']);
    
    expect(result.current.variant.usePagerView).toBe(true);
    expect(result.current.variant.pagerSteps).toEqual(['step1', 'step2', 'step3']);
  });
  
  it('should navigate between pages', () => {
    const { result } = renderHook(() => useMapFlow());
    
    // Configurar variante
    result.current.setUsePagerView(true);
    result.current.setPagerSteps(['step1', 'step2', 'step3']);
    
    // Navegar
    result.current.setCurrentPageIndex(1);
    
    expect(result.current.variant.currentPageIndex).toBe(1);
  });
});
```

#### **3. Testing de Integración**
```typescript
// Test: Integración con BottomSheet
describe('BottomSheet Integration', () => {
  it('should render PagerView when variant is active', () => {
    const { getByTestId } = render(
      <GorhomMapFlowBottomSheet
        visible={true}
        usePagerView={true}
        pagerSteps={['step1', 'step2']}
        onStepChange={jest.fn()}
      />
    );
    
    expect(getByTestId('mapflow-pager-view')).toBeTruthy();
  });
  
  it('should render normal content when variant is inactive', () => {
    const { getByTestId } = render(
      <GorhomMapFlowBottomSheet
        visible={true}
        usePagerView={false}
      >
        <Text>Normal Content</Text>
      </GorhomMapFlowBottomSheet>
    );
    
    expect(getByTestId('normal-content')).toBeTruthy();
  });
});
```

### **📊 Monitoreo y Métricas**

#### **1. Métricas de Uso**
```typescript
// Tracking de uso de variante
const trackVariantUsage = (step: MapFlowStep, useVariant: boolean) => {
  analytics.track('variant_usage', {
    step,
    useVariant,
    timestamp: Date.now(),
  });
};
```

#### **2. Métricas de Performance**
```typescript
// Tracking de performance
const trackVariantPerformance = (step: MapFlowStep, duration: number) => {
  analytics.track('variant_performance', {
    step,
    duration,
    timestamp: Date.now(),
  });
};
```

#### **3. Métricas de Error**
```typescript
// Tracking de errores
const trackVariantError = (step: MapFlowStep, error: string) => {
  analytics.track('variant_error', {
    step,
    error,
    timestamp: Date.now(),
  });
};
```

### **🎯 Rollback Strategy**

#### **1. Rollback por Feature Flag**
```typescript
// Desactivar variante globalmente
const disableVariantGlobally = () => {
  useMapFlowStore.getState().setUsePagerView(false);
};

// Desactivar variante por paso
const disableVariantForStep = (step: MapFlowStep) => {
  STEP_VARIANT_CONFIG[step] = false;
};
```

#### **2. Rollback por Configuración**
```typescript
// Configuración de emergencia
const EMERGENCY_CONFIG = {
  disableVariant: true,
  fallbackToNormal: true,
  showError: false,
};
```

### **✅ Conclusión**

#### **Fortalezas de la Estrategia**
- ✅ **Sin Breaking Changes**: 100% de compatibilidad hacia atrás
- ✅ **Migración Gradual**: Implementación por fases
- ✅ **Rollback Seguro**: Posibilidad de desactivar en cualquier momento
- ✅ **Testing Completo**: Cobertura de todos los escenarios
- ✅ **Monitoreo**: Tracking de uso y performance

#### **Próximos Pasos**
1. **Implementar** Fase 1: Extensión del store
2. **Crear** Fase 2: Componentes de variante
3. **Integrar** Fase 3: BottomSheet condicional
4. **Activar** Fase 4: Uso gradual por pasos

