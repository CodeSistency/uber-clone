# Diseño de MapFlowProgressHandle - PagerView Variant

## **📊 ST1.2.2.1: Interfaz del Componente Progress Handle**

### **🔍 Props Interface**

```typescript
// Interfaz principal del componente
export interface MapFlowProgressHandleProps {
  // Estado del flujo
  currentStep: MapFlowStep;           // Paso actual del flujo
  currentPageIndex: number;          // Índice de página actual (0-based)
  totalPages: number;                // Total de páginas en el flujo
  steps: MapFlowStep[];              // Array de pasos disponibles
  
  // Configuración visual
  showProgress?: boolean;            // Mostrar indicador de progreso
  progressColor?: string;            // Color del indicador activo
  inactiveColor?: string;            // Color del indicador inactivo
  progressSize?: number;             // Tamaño del indicador
  progressStyle?: 'dots' | 'bar' | 'steps'; // Estilo del indicador
  
  // Configuración de interacción
  onStepPress?: (step: MapFlowStep) => void; // Callback al presionar paso
  enableStepNavigation?: boolean;    // Permitir navegación por toque
  showStepLabels?: boolean;          // Mostrar etiquetas de pasos
  
  // Configuración de animaciones
  enableAnimations?: boolean;        // Habilitar animaciones
  animationDuration?: number;        // Duración de animaciones (ms)
  animationType?: 'fade' | 'scale' | 'slide'; // Tipo de animación
  
  // Configuración de validación
  completedSteps?: MapFlowStep[];    // Pasos completados
  requiredSteps?: MapFlowStep[];     // Pasos requeridos
  skippedSteps?: MapFlowStep[];      // Pasos saltados
  
  // Configuración de estilo
  containerStyle?: ViewStyle;        // Estilo del contenedor
  progressContainerStyle?: ViewStyle; // Estilo del contenedor de progreso
  stepStyle?: ViewStyle;             // Estilo de cada paso
  activeStepStyle?: ViewStyle;       // Estilo del paso activo
  completedStepStyle?: ViewStyle;    // Estilo del paso completado
  requiredStepStyle?: ViewStyle;     // Estilo del paso requerido
  skippedStepStyle?: ViewStyle;      // Estilo del paso saltado
  
  // Configuración de accesibilidad
  accessibilityLabel?: string;       // Etiqueta de accesibilidad
  accessibilityHint?: string;        // Sugerencia de accesibilidad
  testID?: string;                   // ID para testing
}
```

### **🎯 Estilos de Indicador**

#### **1. Dots Style (Puntos)**
```typescript
// Estilo de puntos - indicador circular
const dotsStyle = {
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  step: {
    width: progressSize,
    height: progressSize,
    borderRadius: progressSize / 2,
    marginHorizontal: 4,
    backgroundColor: inactiveColor,
  },
  activeStep: {
    backgroundColor: progressColor,
    transform: [{ scale: 1.2 }],
  },
  completedStep: {
    backgroundColor: progressColor,
    opacity: 0.8,
  },
};
```

#### **2. Bar Style (Barra)**
```typescript
// Estilo de barra - indicador de progreso lineal
const barStyle = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: inactiveColor,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: progressColor,
    borderRadius: 2,
  },
  stepIndicator: {
    position: 'absolute',
    top: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: progressColor,
  },
};
```

#### **3. Steps Style (Pasos)**
```typescript
// Estilo de pasos - indicador de pasos numerados
const stepsStyle = {
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: inactiveColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeStep: {
    backgroundColor: progressColor,
    transform: [{ scale: 1.1 }],
  },
  completedStep: {
    backgroundColor: progressColor,
    opacity: 0.8,
  },
  stepLabel: {
    position: 'absolute',
    top: 40,
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
};
```

### **🎯 Estados de Paso**

#### **1. Estados Básicos**
```typescript
// Estados de cada paso en el indicador
type StepStatus = 'pending' | 'active' | 'completed' | 'skipped' | 'required' | 'error';

interface StepState {
  step: MapFlowStep;
  status: StepStatus;
  index: number;
  isClickable: boolean;
  isVisible: boolean;
}
```

#### **2. Lógica de Estados**
```typescript
// Determinar estado de cada paso
const getStepStatus = (
  step: MapFlowStep,
  currentStep: MapFlowStep,
  currentPageIndex: number,
  stepIndex: number,
  completedSteps: MapFlowStep[],
  requiredSteps: MapFlowStep[],
  skippedSteps: MapFlowStep[]
): StepStatus => {
  // Paso actual
  if (step === currentStep) {
    return 'active';
  }
  
  // Paso completado
  if (completedSteps.includes(step)) {
    return 'completed';
  }
  
  // Paso saltado
  if (skippedSteps.includes(step)) {
    return 'skipped';
  }
  
  // Paso requerido
  if (requiredSteps.includes(step)) {
    return 'required';
  }
  
  // Paso pendiente
  return 'pending';
};
```

### **🎯 Configuración por Tipo de Paso**

#### **1. Pasos de Confirmación**
```typescript
const CONFIRMATION_PROGRESS_CONFIG: Partial<MapFlowProgressHandleProps> = {
  progressStyle: 'steps',
  showStepLabels: true,
  enableStepNavigation: false,
  progressColor: '#0286FF',
  inactiveColor: 'rgba(255,255,255,0.3)',
  progressSize: 8,
};
```

#### **2. Pasos de Búsqueda**
```typescript
const SEARCHING_PROGRESS_CONFIG: Partial<MapFlowProgressHandleProps> = {
  progressStyle: 'dots',
  showStepLabels: false,
  enableStepNavigation: false,
  progressColor: '#00FF88',
  inactiveColor: 'rgba(255,255,255,0.3)',
  progressSize: 6,
};
```

#### **3. Pasos de Espera**
```typescript
const WAITING_PROGRESS_CONFIG: Partial<MapFlowProgressHandleProps> = {
  progressStyle: 'bar',
  showStepLabels: false,
  enableStepNavigation: false,
  progressColor: '#FFE014',
  inactiveColor: 'rgba(255,255,255,0.3)',
  progressSize: 4,
};
```

### **🎯 Animaciones y Transiciones**

#### **1. Animación de Entrada**
```typescript
// Animación de entrada del indicador
const useProgressHandleAnimation = (isVisible: boolean) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: isVisible ? 1 : 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isVisible]);
  
  return { fadeAnim, scaleAnim };
};
```

#### **2. Animación de Cambio de Paso**
```typescript
// Animación de cambio de paso
const useStepChangeAnimation = (currentPageIndex: number) => {
  const stepAnimations = useRef<Animated.Value[]>([]).current;
  
  useEffect(() => {
    stepAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: index === currentPageIndex ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [currentPageIndex]);
  
  return stepAnimations;
};
```

#### **3. Animación de Completado**
```typescript
// Animación de paso completado
const useCompletedStepAnimation = (completedSteps: MapFlowStep[]) => {
  const completedAnimations = useRef<Animated.Value[]>([]).current;
  
  useEffect(() => {
    completedSteps.forEach((step, index) => {
      if (completedAnimations[index]) {
        Animated.sequence([
          Animated.timing(completedAnimations[index], {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(completedAnimations[index], {
            toValue: 0.8,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });
  }, [completedSteps]);
  
  return completedAnimations;
};
```

### **🎯 Integración con BottomSheet**

#### **1. Props del BottomSheet**
```typescript
// Extensión de GorhomMapFlowBottomSheet para incluir Progress Handle
interface GorhomMapFlowBottomSheetProps {
  // ... props existentes
  
  // Props para Progress Handle
  useProgressHandle?: boolean;
  progressHandleProps?: Partial<MapFlowProgressHandleProps>;
  onStepPress?: (step: MapFlowStep) => void;
}
```

#### **2. Renderizado Condicional**
```typescript
// En GorhomMapFlowBottomSheet
const GorhomMapFlowBottomSheet: React.FC<GorhomMapFlowBottomSheetProps> = ({
  // ... props existentes
  useProgressHandle = false,
  progressHandleProps = {},
  onStepPress,
}) => {
  const variant = useMapFlowVariant();
  
  // Determinar si usar Progress Handle
  const shouldUseProgressHandle = useProgressHandle && variant.usePagerView;
  
  // Renderizar Progress Handle como handleComponent
  const handleComponent = shouldUseProgressHandle ? (
    <MapFlowProgressHandle
      currentStep={step}
      currentPageIndex={variant.currentPageIndex}
      totalPages={variant.totalPages}
      steps={variant.pagerSteps}
      onStepPress={onStepPress}
      {...progressHandleProps}
    />
  ) : undefined;
  
  return (
    <BottomSheet
      // ... props existentes
      handleComponent={handleComponent}
    >
      {/* contenido */}
    </BottomSheet>
  );
};
```

### **🎯 Hook de Progress Handle**

#### **1. useMapFlowProgressHandle**
```typescript
// Hook para manejar lógica del Progress Handle
export const useMapFlowProgressHandle = () => {
  const variant = useMapFlowVariant();
  const { step } = useMapFlow();
  
  // Calcular estados de pasos
  const stepStates = useMemo(() => {
    return variant.pagerSteps.map((step, index) => ({
      step,
      index,
      status: getStepStatus(
        step,
        step,
        variant.currentPageIndex,
        index,
        variant.completedSteps,
        variant.requiredSteps,
        variant.skippedSteps
      ),
      isClickable: variant.enableSwipe && index !== variant.currentPageIndex,
      isVisible: true,
    }));
  }, [
    variant.pagerSteps,
    step,
    variant.currentPageIndex,
    variant.completedSteps,
    variant.requiredSteps,
    variant.skippedSteps,
    variant.enableSwipe,
  ]);
  
  // Navegar a paso específico
  const navigateToStep = useCallback((step: MapFlowStep) => {
    const stepIndex = variant.pagerSteps.findIndex(s => s === step);
    if (stepIndex !== -1) {
      variant.setCurrentPageIndex(stepIndex);
    }
  }, [variant]);
  
  // Obtener configuración por paso
  const getStepConfig = useCallback((step: MapFlowStep) => {
    return getVariantConfigForStep(step);
  }, []);
  
  return {
    stepStates,
    navigateToStep,
    getStepConfig,
    // Estado de la variante
    ...variant,
  };
};
```

### **🎯 Testing del Componente**

#### **1. Testing de Renderizado**
```typescript
// Test: Renderizado del Progress Handle
describe('MapFlowProgressHandle', () => {
  it('should render with dots style', () => {
    const { getByTestId } = render(
      <MapFlowProgressHandle
        currentStep="step1"
        currentPageIndex={0}
        totalPages={3}
        steps={['step1', 'step2', 'step3']}
        progressStyle="dots"
        testID="progress-handle"
      />
    );
    
    expect(getByTestId('progress-handle')).toBeTruthy();
  });
  
  it('should render with bar style', () => {
    const { getByTestId } = render(
      <MapFlowProgressHandle
        currentStep="step1"
        currentPageIndex={0}
        totalPages={3}
        steps={['step1', 'step2', 'step3']}
        progressStyle="bar"
        testID="progress-handle"
      />
    );
    
    expect(getByTestId('progress-handle')).toBeTruthy();
  });
  
  it('should render with steps style', () => {
    const { getByTestId } = render(
      <MapFlowProgressHandle
        currentStep="step1"
        currentPageIndex={0}
        totalPages={3}
        steps={['step1', 'step2', 'step3']}
        progressStyle="steps"
        testID="progress-handle"
      />
    );
    
    expect(getByTestId('progress-handle')).toBeTruthy();
  });
});
```

#### **2. Testing de Interacción**
```typescript
// Test: Interacción del Progress Handle
describe('MapFlowProgressHandle Interaction', () => {
  it('should call onStepPress when step is pressed', () => {
    const onStepPress = jest.fn();
    
    const { getByTestId } = render(
      <MapFlowProgressHandle
        currentStep="step1"
        currentPageIndex={0}
        totalPages={3}
        steps={['step1', 'step2', 'step3']}
        onStepPress={onStepPress}
        enableStepNavigation={true}
        testID="progress-handle"
      />
    );
    
    const step2 = getByTestId('step-1');
    fireEvent.press(step2);
    
    expect(onStepPress).toHaveBeenCalledWith('step2');
  });
  
  it('should not call onStepPress when step navigation is disabled', () => {
    const onStepPress = jest.fn();
    
    const { getByTestId } = render(
      <MapFlowProgressHandle
        currentStep="step1"
        currentPageIndex={0}
        totalPages={3}
        steps={['step1', 'step2', 'step3']}
        onStepPress={onStepPress}
        enableStepNavigation={false}
        testID="progress-handle"
      />
    );
    
    const step2 = getByTestId('step-1');
    fireEvent.press(step2);
    
    expect(onStepPress).not.toHaveBeenCalled();
  });
});
```

### **✅ Conclusión**

#### **Fortalezas del Diseño**
- ✅ **Flexible**: Múltiples estilos de indicador
- ✅ **Interactivo**: Navegación por toque
- ✅ **Animado**: Transiciones suaves
- ✅ **Accesible**: Soporte completo de accesibilidad
- ✅ **Testeable**: Cobertura completa de testing
- ✅ **Integrable**: Fácil integración con BottomSheet

#### **Próximos Pasos**
1. **Implementar** el componente MapFlowProgressHandle
2. **Crear** el hook useMapFlowProgressHandle
3. **Integrar** con GorhomMapFlowBottomSheet
4. **Implementar** testing completo

