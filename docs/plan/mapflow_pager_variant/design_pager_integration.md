# Diseño de Integración PagerView con STEP_COMPONENTS

## **🎯 Reutilizando STEP_COMPONENTS para PagerView Variant**

### **🔍 Análisis del Sistema Actual**

#### **Estructura Actual de STEP_COMPONENTS**
```typescript
// Mapeo type-safe de pasos a componentes
const STEP_COMPONENTS: Partial<Record<MapFlowStep, () => React.ReactNode>> = {
  [FLOW_STEPS.SELECCION_SERVICIO]: () => <ServiceSelection />,
  [FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE]: () => <TransportDefinition />,
  [FLOW_STEPS.CUSTOMER_TRANSPORT_CONFIRM_ORIGIN]: () => <ConfirmOrigin />,
  [FLOW_STEPS.CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR]: () => <DriverMatching />,
  [FLOW_STEPS.CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION]: () => <WaitingForAcceptance />,
  [FLOW_STEPS.CUSTOMER_TRANSPORT_GESTION_CONFIRMACION]: () => <DriverConfirmation />,
  [FLOW_STEPS.CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO]: () => <DriverArrived />,
  [FLOW_STEPS.DRIVER_FINALIZACION_RATING]: () => <Rating />,
  // ... más pasos
};
```

### **🎯 Estrategia de Integración**

#### **1. Extensión de STEP_COMPONENTS para PagerView**

```typescript
// Extensión para soportar PagerView
interface PagerStepConfig {
  component: () => React.ReactNode;
  pagerConfig?: {
    enableSwipe: boolean;
    showProgress: boolean;
    allowSkip: boolean;
    canNavigateBack: boolean;
    canNavigateForward: boolean;
    progressStyle: 'dots' | 'bar' | 'steps';
    progressColor: string;
    required: boolean;
  };
}

// Nuevo mapeo extendido
const STEP_COMPONENTS_WITH_PAGER: Partial<Record<MapFlowStep, PagerStepConfig>> = {
  [FLOW_STEPS.SELECCION_SERVICIO]: {
    component: () => <ServiceSelection />,
    pagerConfig: {
      enableSwipe: true,
      showProgress: true,
      allowSkip: false,
      canNavigateBack: true,
      canNavigateForward: true,
      progressStyle: 'steps',
      progressColor: '#0286FF',
      required: true,
    },
  },
  
  [FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE]: {
    component: () => <TransportDefinition />,
    pagerConfig: {
      enableSwipe: true,
      showProgress: true,
      allowSkip: false,
      canNavigateBack: true,
      canNavigateForward: true,
      progressStyle: 'steps',
      progressColor: '#0286FF',
      required: true,
    },
  },
  
  [FLOW_STEPS.CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR]: {
    component: () => <DriverMatching />,
    pagerConfig: {
      enableSwipe: false,        // No permitir swipe durante búsqueda
      showProgress: true,
      allowSkip: false,
      canNavigateBack: false,    // No permitir volver durante búsqueda
      canNavigateForward: false, // No permitir avanzar hasta encontrar conductor
      progressStyle: 'dots',
      progressColor: '#00FF88',
      required: true,
    },
  },
  
  [FLOW_STEPS.CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION]: {
    component: () => <WaitingForAcceptance />,
    pagerConfig: {
      enableSwipe: false,        // No permitir swipe durante espera
      showProgress: true,
      allowSkip: false,
      canNavigateBack: false,
      canNavigateForward: false,
      progressStyle: 'bar',
      progressColor: '#FFE014',
      required: true,
    },
  },
  
  [FLOW_STEPS.CUSTOMER_TRANSPORT_GESTION_CONFIRMACION]: {
    component: () => <DriverConfirmation />,
    pagerConfig: {
      enableSwipe: false,        // No permitir swipe en confirmación
      showProgress: true,
      allowSkip: false,
      canNavigateBack: true,
      canNavigateForward: false, // No permitir avanzar hasta confirmar
      progressStyle: 'steps',
      progressColor: '#0286FF',
      required: true,
    },
  },
  
  [FLOW_STEPS.CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO]: {
    component: () => <DriverArrived />,
    pagerConfig: {
      enableSwipe: false,        // No permitir swipe cuando conductor llegó
      showProgress: true,
      allowSkip: false,
      canNavigateBack: false,
      canNavigateForward: false,
      progressStyle: 'dots',
      progressColor: '#10B981',
      required: true,
    },
  },
  
  [FLOW_STEPS.DRIVER_FINALIZACION_RATING]: {
    component: () => <Rating />,
    pagerConfig: {
      enableSwipe: false,        // No permitir swipe en rating
      showProgress: true,
      allowSkip: false,
      canNavigateBack: false,
      canNavigateForward: false,
      progressStyle: 'steps',
      progressColor: '#F59E0B',
      required: true,
    },
  },
};
```

#### **2. Hook para Manejar PagerView con STEP_COMPONENTS**

```typescript
// Hook para manejar PagerView con STEP_COMPONENTS
export const useMapFlowPagerWithSteps = () => {
  const { step, variant } = useMapFlow();
  
  // Obtener configuración de pasos para PagerView
  const getPagerSteps = useCallback(() => {
    // Filtrar pasos que tienen configuración de pager
    return Object.keys(STEP_COMPONENTS_WITH_PAGER)
      .filter(stepKey => {
        const config = STEP_COMPONENTS_WITH_PAGER[stepKey as MapFlowStep];
        return config?.pagerConfig;
      }) as MapFlowStep[];
  }, []);
  
  // Obtener configuración de un paso específico
  const getStepPagerConfig = useCallback((step: MapFlowStep) => {
    const config = STEP_COMPONENTS_WITH_PAGER[step];
    return config?.pagerConfig || null;
  }, []);
  
  // Determinar si un paso debe usar PagerView
  const shouldUsePagerForStep = useCallback((step: MapFlowStep) => {
    const config = getStepPagerConfig(step);
    return !!config && variant.usePagerView;
  }, [getStepPagerConfig, variant.usePagerView]);
  
  // Obtener pasos ordenados para PagerView
  const getOrderedPagerSteps = useCallback(() => {
    const pagerSteps = getPagerSteps();
    
    // Ordenar pasos según el flujo lógico
    const stepOrder: MapFlowStep[] = [
      FLOW_STEPS.SELECCION_SERVICIO,
      FLOW_STEPS.CUSTOMER_TRANSPORT_DEFINICION_VIAJE,
      FLOW_STEPS.CUSTOMER_TRANSPORT_CONFIRM_ORIGIN,
      FLOW_STEPS.CUSTOMER_TRANSPORT_CONFIRM_DESTINATION,
      FLOW_STEPS.CUSTOMER_TRANSPORT_SELECCION_VEHICULO,
      FLOW_STEPS.CUSTOMER_TRANSPORT_METODOLOGIA_PAGO,
      FLOW_STEPS.CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR,
      FLOW_STEPS.CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION,
      FLOW_STEPS.CUSTOMER_TRANSPORT_GESTION_CONFIRMACION,
      FLOW_STEPS.CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO,
      FLOW_STEPS.DRIVER_FINALIZACION_RATING,
    ];
    
    // Filtrar y ordenar según el orden lógico
    return stepOrder.filter(step => pagerSteps.includes(step));
  }, [getPagerSteps]);
  
  // Renderizar componente de paso
  const renderStepComponent = useCallback((step: MapFlowStep) => {
    const config = STEP_COMPONENTS_WITH_PAGER[step];
    if (!config) {
      return <DefaultStep step={step} />;
    }
    
    return config.component();
  }, []);
  
  // Obtener configuración de progreso para el paso actual
  const getCurrentProgressConfig = useCallback(() => {
    const config = getStepPagerConfig(step);
    if (!config) {
      return null;
    }
    
    return {
      progressStyle: config.progressStyle,
      progressColor: config.progressColor,
      showProgress: config.showProgress,
    };
  }, [step, getStepPagerConfig]);
  
  return {
    // Estado
    pagerSteps: getOrderedPagerSteps(),
    currentStepConfig: getStepPagerConfig(step),
    shouldUsePager: shouldUsePagerForStep(step),
    progressConfig: getCurrentProgressConfig(),
    
    // Acciones
    renderStepComponent,
    getStepPagerConfig,
    shouldUsePagerForStep,
    
    // Helpers
    isStepRequired: (step: MapFlowStep) => {
      const config = getStepPagerConfig(step);
      return config?.required || false;
    },
    
    canNavigateToStep: (targetStep: MapFlowStep) => {
      const config = getStepPagerConfig(targetStep);
      if (!config) return false;
      
      // Verificar si se puede navegar según configuración
      return config.canNavigateBack || config.canNavigateForward;
    },
  };
};
```

#### **3. Integración con MapFlowPagerView**

```typescript
// Componente MapFlowPagerView extendido para usar STEP_COMPONENTS
export const MapFlowPagerViewWithSteps: React.FC<MapFlowPagerViewWithStepsProps> = ({
  steps,
  currentStep,
  onStepChange,
  onPageChange,
  enableSwipe = true,
  showPageIndicator = true,
  animationType = 'slide'
}) => {
  const pagerHook = useMapFlowPagerWithSteps();
  
  // Renderizar páginas usando STEP_COMPONENTS
  const renderPages = useMemo(() => {
    return steps.map((step, index) => (
      <MapFlowPage
        key={step}
        step={step}
        isActive={index === pagerHook.currentPageIndex}
        isVisible={Math.abs(index - pagerHook.currentPageIndex) <= 1}
        onContentReady={() => {
          console.log('[MapFlowPagerViewWithSteps] Page content ready:', step);
        }}
        onAction={(action, data) => {
          console.log('[MapFlowPagerViewWithSteps] Page action:', { step, action, data });
        }}
      >
        {/* Renderizar componente usando STEP_COMPONENTS */}
        {pagerHook.renderStepComponent(step)}
      </MapFlowPage>
    ));
  }, [steps, pagerHook.currentPageIndex, pagerHook.renderStepComponent]);
  
  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={pagerHook.currentPageIndex}
        scrollEnabled={enableSwipe}
        onPageSelected={handlePageSelected}
        offscreenPageLimit={1}
        keyboardDismissMode="on-drag"
      >
        {renderPages}
      </PagerView>
    </View>
  );
};
```

#### **4. Integración con GorhomMapFlowBottomSheet**

```typescript
// Extensión de GorhomMapFlowBottomSheet para usar STEP_COMPONENTS
export const GorhomMapFlowBottomSheet: React.FC<GorhomMapFlowBottomSheetProps> = ({
  // ... props existentes
  
  // Nuevas props para PagerView
  usePagerView = false,
  pagerSteps = [],
  onStepChange,
  children,
}) => {
  const pagerHook = useMapFlowPagerWithSteps();
  const variant = useMapFlowVariant();
  
  // Determinar si usar PagerView
  const shouldUsePagerView = usePagerView && 
                            variant.usePagerView && 
                            pagerHook.shouldUsePager;
  
  // Obtener pasos para PagerView
  const stepsToUse = pagerSteps.length > 0 ? pagerSteps : pagerHook.pagerSteps;
  
  // Renderizar Progress Handle si es necesario
  const handleComponent = shouldUsePagerView ? (
    <MapFlowProgressHandle
      currentStep={step}
      currentPageIndex={variant.currentPageIndex}
      totalPages={variant.totalPages}
      steps={stepsToUse}
      onStepPress={onStepChange}
      progressStyle={pagerHook.progressConfig?.progressStyle}
      progressColor={pagerHook.progressConfig?.progressColor}
      showProgress={pagerHook.progressConfig?.showProgress}
    />
  ) : undefined;
  
  // Renderizado condicional
  if (shouldUsePagerView) {
    return (
      <BottomSheet
        // ... props existentes
        handleComponent={handleComponent}
      >
        <MapFlowPagerViewWithSteps
          steps={stepsToUse}
          currentStep={step}
          onStepChange={onStepChange}
          onPageChange={(pageIndex) => {
            variant.setCurrentPageIndex(pageIndex);
          }}
          enableSwipe={pagerHook.currentStepConfig?.enableSwipe}
          showPageIndicator={pagerHook.currentStepConfig?.showProgress}
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

#### **5. Configuración Automática por Paso**

```typescript
// Hook para configuración automática por paso
export const useMapFlowStepPagerConfig = (step: MapFlowStep) => {
  const pagerHook = useMapFlowPagerWithSteps();
  
  // Obtener configuración del paso actual
  const stepConfig = pagerHook.getStepPagerConfig(step);
  
  // Configurar variante automáticamente según el paso
  useEffect(() => {
    if (stepConfig) {
      // Configurar navegación
      pagerHook.setNavigationConfig({
        enableSwipe: stepConfig.enableSwipe,
        showProgress: stepConfig.showProgress,
        allowSkip: stepConfig.allowSkip,
        canNavigateBack: stepConfig.canNavigateBack,
        canNavigateForward: stepConfig.canNavigateForward,
      });
      
      // Configurar visual
      pagerHook.setVisualConfig({
        progressColor: stepConfig.progressColor,
        progressStyle: stepConfig.progressStyle,
      });
    }
  }, [step, stepConfig]);
  
  return {
    stepConfig,
    isPagerEnabled: !!stepConfig,
    canNavigate: pagerHook.canNavigateToStep,
    isRequired: pagerHook.isStepRequired(step),
  };
};
```

### **🎯 Ventajas de esta Aproximación**

#### **1. Reutilización Completa**
- ✅ **STEP_COMPONENTS**: Reutiliza 100% de los componentes existentes
- ✅ **Lógica de Renderizado**: Mantiene la misma lógica de renderizado
- ✅ **Type Safety**: Mantiene la seguridad de tipos existente

#### **2. Configuración Granular**
- ✅ **Por Paso**: Configuración específica para cada paso
- ✅ **Automática**: Configuración automática según el paso actual
- ✅ **Flexible**: Fácil agregar nuevos pasos con configuración

#### **3. Migración Gradual**
- ✅ **Sin Breaking Changes**: No afecta funcionalidad existente
- ✅ **Activación Selectiva**: Activar PagerView solo en pasos específicos
- ✅ **Rollback Fácil**: Desactivar PagerView en cualquier momento

#### **4. Mantenibilidad**
- ✅ **Un Solo Lugar**: Toda la configuración en STEP_COMPONENTS_WITH_PAGER
- ✅ **Consistencia**: Misma lógica de renderizado para ambos modos
- ✅ **Extensibilidad**: Fácil agregar nuevas configuraciones

### **🎯 Implementación Práctica**

#### **1. Extensión Gradual de STEP_COMPONENTS**
```typescript
// Paso 1: Agregar configuración de pager a pasos existentes
const STEP_COMPONENTS_WITH_PAGER = {
  // Mantener componentes existentes
  ...STEP_COMPONENTS,
  
  // Agregar configuración de pager solo donde sea necesario
  [FLOW_STEPS.CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR]: {
    component: () => <DriverMatching />,
    pagerConfig: {
      enableSwipe: false,
      showProgress: true,
      progressStyle: 'dots',
      progressColor: '#00FF88',
      required: true,
    },
  },
};
```

#### **2. Activación Condicional**
```typescript
// En UnifiedFlowWrapper
const UnifiedFlowWrapper: React.FC<UnifiedFlowWrapperProps> = ({
  // ... props existentes
}) => {
  const flow = useMapFlow();
  const pagerHook = useMapFlowPagerWithSteps();
  
  // Determinar si usar PagerView para el paso actual
  const shouldUsePagerView = pagerHook.shouldUsePager;
  
  return (
    <View className="flex-1">
      <Map />
      
      {flow.bottomSheetVisible ? (
        <GorhomMapFlowBottomSheet
          // ... props existentes
          usePagerView={shouldUsePagerView}
          pagerSteps={pagerHook.pagerSteps}
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

### **✅ Conclusión**

#### **Fortalezas de la Aproximación**
- ✅ **Reutilización Máxima**: 100% de STEP_COMPONENTS existentes
- ✅ **Configuración Granular**: Por paso específico
- ✅ **Migración Segura**: Sin breaking changes
- ✅ **Mantenibilidad**: Un solo lugar para toda la configuración
- ✅ **Extensibilidad**: Fácil agregar nuevos pasos

#### **Próximos Pasos**
1. **Implementar** STEP_COMPONENTS_WITH_PAGER
2. **Crear** useMapFlowPagerWithSteps hook
3. **Extender** GorhomMapFlowBottomSheet
4. **Integrar** con UnifiedFlowWrapper

