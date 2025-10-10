# Diseño de Arquitectura - Migración a @gorhom/bottom-sheet

## 🎯 Resumen Ejecutivo

Este documento define la arquitectura detallada para la migración del InlineBottomSheet custom a @gorhom/bottom-sheet. Se establece la estructura de componentes, hooks, y patrones de implementación para mantener la compatibilidad completa con el sistema actual.

## 🏗️ Arquitectura General

### **1. Estructura de Archivos**

```
components/ui/
├── GorhomMapFlowBottomSheet.tsx          # Componente principal
├── MapFlowBackground.tsx                 # Componente de background
├── MapFlowFooter.tsx                     # Componente de footer
├── MapFlowHandle.tsx                     # Componente de handle personalizado
└── MapFlowContent.tsx                     # Componente de contenido

hooks/
├── useMapFlowBottomSheet.ts              # Hook principal
├── useMapFlowAnimatedValues.ts           # Hook para valores animados
├── useMapFlowScrollControl.ts            # Hook para control de scroll
├── useMapFlowBackground.ts               # Hook para backgrounds
├── useMapFlowFooter.ts                   # Hook para footer
├── useMapFlowSnapPoints.ts               # Hook para snap points
└── useMapFlowAnimationConfig.ts          # Hook para configuración de animaciones

utils/
├── mapFlowMapper.ts                      # Utilidades de mapeo
├── snapPointsCalculator.ts                # Calculadora de snap points
└── transitionMapper.ts                   # Mapeo de transiciones

types/
├── MapFlowBottomSheet.ts                 # Tipos del componente principal
├── MapFlowHooks.ts                       # Tipos de hooks
└── MapFlowUtils.ts                       # Tipos de utilidades
```

### **2. Jerarquía de Componentes**

```
GorhomMapFlowBottomSheet
├── BottomSheet (@gorhom/bottom-sheet)
│   ├── handleComponent: MapFlowHandle
│   ├── backgroundComponent: MapFlowBackground
│   ├── footerComponent: MapFlowFooter
│   └── children: MapFlowContent
└── Hooks
    ├── useMapFlowBottomSheet
    ├── useMapFlowAnimatedValues
    ├── useMapFlowScrollControl
    ├── useMapFlowBackground
    ├── useMapFlowFooter
    ├── useMapFlowSnapPoints
    └── useMapFlowAnimationConfig
```

## 🧩 Componentes Principales

### **1. GorhomMapFlowBottomSheet**

#### **Props Interface**
```typescript
interface GorhomMapFlowBottomSheetProps {
  // Props del MapFlow (mantener compatibilidad)
  visible: boolean;
  minHeight: number;
  maxHeight: number;
  initialHeight: number;
  showHandle?: boolean;
  allowDrag?: boolean;
  onClose?: () => void;
  
  // Props adicionales de @gorhom/bottom-sheet
  snapPoints?: string[];
  enableOverDrag?: boolean;
  enablePanDownToClose?: boolean;
  
  // Props de contenido
  children: React.ReactNode;
  className?: string;
  
  // Props de configuración
  step?: MapFlowStep;
  useGradient?: boolean;
  useBlur?: boolean;
  bottomBar?: React.ReactNode;
}
```

#### **Implementación**
```typescript
const GorhomMapFlowBottomSheet: React.FC<GorhomMapFlowBottomSheetProps> = ({
  visible,
  minHeight,
  maxHeight,
  initialHeight,
  showHandle = true,
  allowDrag = true,
  onClose,
  children,
  className,
  step,
  useGradient = false,
  useBlur = false,
  bottomBar,
  ...props
}) => {
  // Hooks principales
  const bottomSheet = useMapFlowBottomSheet(step);
  const animatedValues = useMapFlowAnimatedValues(step);
  const scrollControl = useMapFlowScrollControl(step);
  const background = useMapFlowBackground(step);
  const footer = useMapFlowFooter(step);
  const snapPoints = useMapFlowSnapPoints(step);
  const animationConfig = useMapFlowAnimationConfig(step);
  
  // Mapeo de props
  const index = visible ? 0 : -1;
  const enableHandlePanningGesture = allowDrag && scrollControl.handlePanningEnabled;
  const enableContentPanningGesture = allowDrag && scrollControl.contentPanningEnabled;
  const handleComponent = showHandle ? undefined : null;
  
  return (
    <BottomSheet
      index={index}
      snapPoints={snapPoints.snapPoints}
      enableHandlePanningGesture={enableHandlePanningGesture}
      enableContentPanningGesture={enableContentPanningGesture}
      handleComponent={handleComponent}
      backgroundComponent={background.useGradient || background.useBlur ? MapFlowBackground : undefined}
      footerComponent={footer.bottomBar ? MapFlowFooter : undefined}
      animationConfigs={animationConfig.animationConfig}
      onClose={onClose}
      className={className}
      {...props}
    >
      <MapFlowContent>
        {children}
      </MapFlowContent>
    </BottomSheet>
  );
};
```

### **2. MapFlowBackground**

#### **Props Interface**
```typescript
interface MapFlowBackgroundProps {
  step?: MapFlowStep;
  useGradient?: boolean;
  useBlur?: boolean;
  gradientColors?: ColorValue[];
  blurIntensity?: number;
  blurTint?: 'light' | 'dark' | 'default';
}
```

#### **Implementación**
```typescript
const MapFlowBackground: React.FC<MapFlowBackgroundProps> = ({
  step,
  useGradient = false,
  useBlur = false,
  gradientColors,
  blurIntensity = 20,
  blurTint = 'default',
}) => {
  const background = useMapFlowBackground(step);
  
  if (useGradient || background.useGradient) {
    return (
      <GradientBackground
        colors={gradientColors || background.gradientColors}
        style={background.gradientBackground}
      />
    );
  }
  
  if (useBlur || background.useBlur) {
    return (
      <BlurBackground
        intensity={blurIntensity || background.blurIntensity}
        tint={blurTint || background.blurTint}
        style={background.blurBackground}
      />
    );
  }
  
  return <View style={StyleSheet.absoluteFillObject} />;
};
```

### **3. MapFlowFooter**

#### **Props Interface**
```typescript
interface MapFlowFooterProps {
  step?: MapFlowStep;
  bottomBar?: React.ReactNode;
  bottomBarHeight?: number;
  showBottomBarAt?: number;
}
```

#### **Implementación**
```typescript
const MapFlowFooter: React.FC<MapFlowFooterProps> = ({
  step,
  bottomBar,
  bottomBarHeight,
  showBottomBarAt,
}) => {
  const footer = useMapFlowFooter(step);
  
  return (
    <Animated.View
      style={[
        footer.footerStyle,
        { height: bottomBarHeight || footer.bottomBarHeight }
      ]}
    >
      {bottomBar || footer.bottomBar}
    </Animated.View>
  );
};
```

### **4. MapFlowHandle**

#### **Props Interface**
```typescript
interface MapFlowHandleProps {
  step?: MapFlowStep;
  style?: ViewStyle;
  children?: React.ReactNode;
}
```

#### **Implementación**
```typescript
const MapFlowHandle: React.FC<MapFlowHandleProps> = ({
  step,
  style,
  children,
}) => {
  const stepConfig = useMapFlowStore(state => state.steps[step]);
  const { bottomSheet } = stepConfig;
  
  if (!bottomSheet.showHandle) {
    return null;
  }
  
  return (
    <View style={[styles.handle, style]}>
      {children || <View style={styles.handleIndicator} />}
    </View>
  );
};
```

### **5. MapFlowContent**

#### **Props Interface**
```typescript
interface MapFlowContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
}
```

#### **Implementación**
```typescript
const MapFlowContent: React.FC<MapFlowContentProps> = ({
  children,
  style,
  className,
}) => {
  return (
    <View style={[styles.content, style]} className={className}>
      {children}
    </View>
  );
};
```

## 🎣 Hooks Principales

### **1. useMapFlowBottomSheet**

#### **Interface**
```typescript
interface MapFlowBottomSheetReturn {
  // Métodos de control
  goToSnapPoint: (index: number) => void;
  goToHeight: (height: number) => void;
  scrollUpComplete: () => void;
  scrollDownComplete: () => void;
  
  // Métodos de estado
  getCurrentHeight: () => number;
  isAtMaxHeight: () => boolean;
  isAtMinHeight: () => boolean;
  
  // Control de scroll
  enableScroll: () => void;
  disableScroll: () => void;
  scrollEnabled: boolean;
  
  // Estado actual
  isActive: boolean;
  isClosed: boolean;
  isExpanded: boolean;
  isCollapsed: boolean;
  
  // Valores animados
  animatedIndex: SharedValue<number>;
  animatedPosition: SharedValue<number>;
  animatedContentHeight: SharedValue<number>;
}
```

#### **Implementación**
```typescript
const useMapFlowBottomSheet = (step?: MapFlowStep): MapFlowBottomSheetReturn => {
  const stepConfig = useMapFlowStore(state => state.steps[step]);
  const { bottomSheet } = stepConfig;
  
  const {
    snapToIndex,
    snapToPosition,
    expand,
    collapse,
    close,
    isActive,
    isClosed,
    isExpanded,
    isCollapsed,
    animatedIndex,
    animatedPosition,
    animatedContentHeight,
  } = useBottomSheet();
  
  // Mapeo de métodos del InlineBottomSheet
  const goToSnapPoint = useCallback((index: number) => {
    snapToIndex(index);
  }, [snapToIndex]);
  
  const goToHeight = useCallback((height: number) => {
    snapToPosition(height);
  }, [snapToPosition]);
  
  const scrollUpComplete = useCallback(() => {
    expand();
  }, [expand]);
  
  const scrollDownComplete = useCallback(() => {
    collapse();
  }, [collapse]);
  
  const getCurrentHeight = useCallback(() => {
    return animatedPosition.value;
  }, [animatedPosition]);
  
  const isAtMaxHeight = useCallback(() => {
    return isExpanded;
  }, [isExpanded]);
  
  const isAtMinHeight = useCallback(() => {
    return isCollapsed;
  }, [isCollapsed]);
  
  // Control de scroll
  const [scrollEnabled, setScrollEnabled] = useState(bottomSheet.allowDrag);
  
  const enableScroll = useCallback(() => {
    setScrollEnabled(true);
  }, []);
  
  const disableScroll = useCallback(() => {
    setScrollEnabled(false);
  }, []);
  
  return {
    goToSnapPoint,
    goToHeight,
    scrollUpComplete,
    scrollDownComplete,
    getCurrentHeight,
    isAtMaxHeight,
    isAtMinHeight,
    enableScroll,
    disableScroll,
    scrollEnabled,
    isActive,
    isClosed,
    isExpanded,
    isCollapsed,
    animatedIndex,
    animatedPosition,
    animatedContentHeight,
  };
};
```

### **2. useMapFlowAnimatedValues**

#### **Interface**
```typescript
interface MapFlowAnimatedValuesReturn {
  animatedIndex: SharedValue<number>;
  animatedPosition: SharedValue<number>;
  animatedContentHeight: SharedValue<number>;
  animatedHeight: AnimatedStyle;
  animatedOpacity: AnimatedStyle;
  animatedTranslateY: AnimatedStyle;
}
```

#### **Implementación**
```typescript
const useMapFlowAnimatedValues = (step?: MapFlowStep): MapFlowAnimatedValuesReturn => {
  const stepConfig = useMapFlowStore(state => state.steps[step]);
  const { bottomSheet } = stepConfig;
  
  const { animatedIndex, animatedPosition, animatedContentHeight } = useBottomSheet();
  
  // Interpolaciones personalizadas
  const animatedHeight = useAnimatedStyle(() => {
    return {
      height: animatedPosition.value,
    };
  });
  
  const animatedOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedPosition.value,
      [bottomSheet.minHeight, bottomSheet.maxHeight],
      [0.5, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });
  
  const animatedTranslateY = useAnimatedStyle(() => {
    const translateY = interpolate(
      animatedPosition.value,
      [bottomSheet.minHeight, bottomSheet.maxHeight],
      [bottomSheet.minHeight, 0],
      Extrapolate.CLAMP
    );
    return { transform: [{ translateY }] };
  });
  
  return {
    animatedIndex,
    animatedPosition,
    animatedContentHeight,
    animatedHeight,
    animatedOpacity,
    animatedTranslateY,
  };
};
```

### **3. useMapFlowScrollControl**

#### **Interface**
```typescript
interface MapFlowScrollControlReturn {
  scrollEnabled: boolean;
  handlePanningEnabled: boolean;
  contentPanningEnabled: boolean;
  enableScroll: () => void;
  disableScroll: () => void;
  enableHandlePanning: () => void;
  disableHandlePanning: () => void;
  enableContentPanning: () => void;
  disableContentPanning: () => void;
}
```

#### **Implementación**
```typescript
const useMapFlowScrollControl = (step?: MapFlowStep): MapFlowScrollControlReturn => {
  const stepConfig = useMapFlowStore(state => state.steps[step]);
  const { bottomSheet } = stepConfig;
  
  const [scrollEnabled, setScrollEnabled] = useState(bottomSheet.allowDrag);
  const [handlePanningEnabled, setHandlePanningEnabled] = useState(bottomSheet.allowDrag);
  const [contentPanningEnabled, setContentPanningEnabled] = useState(bottomSheet.allowDrag);
  
  const enableScroll = useCallback(() => {
    setScrollEnabled(true);
    setHandlePanningEnabled(true);
    setContentPanningEnabled(true);
  }, []);
  
  const disableScroll = useCallback(() => {
    setScrollEnabled(false);
    setHandlePanningEnabled(false);
    setContentPanningEnabled(false);
  }, []);
  
  const enableHandlePanning = useCallback(() => {
    setHandlePanningEnabled(true);
  }, []);
  
  const disableHandlePanning = useCallback(() => {
    setHandlePanningEnabled(false);
  }, []);
  
  const enableContentPanning = useCallback(() => {
    setContentPanningEnabled(true);
  }, []);
  
  const disableContentPanning = useCallback(() => {
    setContentPanningEnabled(false);
  }, []);
  
  return {
    scrollEnabled,
    handlePanningEnabled,
    contentPanningEnabled,
    enableScroll,
    disableScroll,
    enableHandlePanning,
    disableHandlePanning,
    enableContentPanning,
    disableContentPanning,
  };
};
```

### **4. useMapFlowBackground**

#### **Interface**
```typescript
interface MapFlowBackgroundReturn {
  useGradient: boolean;
  useBlur: boolean;
  gradientColors: ColorValue[];
  blurIntensity: number;
  blurTint: 'light' | 'dark' | 'default';
  gradientBackground: AnimatedStyle;
  blurBackground: AnimatedStyle;
}
```

#### **Implementación**
```typescript
const useMapFlowBackground = (step?: MapFlowStep): MapFlowBackgroundReturn => {
  const stepConfig = useMapFlowStore(state => state.steps[step]);
  const { bottomSheet } = stepConfig;
  
  const { animatedPosition } = useBottomSheet();
  
  // Background con gradient
  const gradientBackground = useAnimatedStyle(() => {
    if (!bottomSheet.useGradient) return {};
    
    const opacity = interpolate(
      animatedPosition.value,
      [bottomSheet.minHeight, bottomSheet.maxHeight],
      [0.8, 1],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
    };
  });
  
  // Background con blur
  const blurBackground = useAnimatedStyle(() => {
    if (!bottomSheet.useBlur) return {};
    
    const intensity = interpolate(
      animatedPosition.value,
      [bottomSheet.minHeight, bottomSheet.maxHeight],
      [bottomSheet.blurIntensity * 0.5, bottomSheet.blurIntensity],
      Extrapolate.CLAMP
    );
    
    return {
      opacity: 1,
    };
  });
  
  return {
    useGradient: bottomSheet.useGradient,
    useBlur: bottomSheet.useBlur,
    gradientColors: bottomSheet.gradientColors,
    blurIntensity: bottomSheet.blurIntensity,
    blurTint: bottomSheet.blurTint,
    gradientBackground,
    blurBackground,
  };
};
```

### **5. useMapFlowFooter**

#### **Interface**
```typescript
interface MapFlowFooterReturn {
  footerStyle: AnimatedStyle;
  bottomBar: React.ReactNode;
  bottomBarHeight: number;
  showBottomBarAt: number;
}
```

#### **Implementación**
```typescript
const useMapFlowFooter = (step?: MapFlowStep): MapFlowFooterReturn => {
  const stepConfig = useMapFlowStore(state => state.steps[step]);
  const { bottomSheet } = stepConfig;
  
  const { animatedPosition } = useBottomSheet();
  
  const footerStyle = useAnimatedStyle(() => {
    if (!bottomSheet.bottomBar) return {};
    
    const opacity = interpolate(
      animatedPosition.value,
      [bottomSheet.minHeight, bottomSheet.maxHeight],
      [0, 1],
      Extrapolate.CLAMP
    );
    
    const translateY = interpolate(
      animatedPosition.value,
      [bottomSheet.minHeight, bottomSheet.maxHeight],
      [bottomSheet.bottomBarHeight, 0],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
      transform: [{ translateY }],
    };
  });
  
  return {
    footerStyle,
    bottomBar: bottomSheet.bottomBar,
    bottomBarHeight: bottomSheet.bottomBarHeight,
    showBottomBarAt: bottomSheet.showBottomBarAt,
  };
};
```

### **6. useMapFlowSnapPoints**

#### **Interface**
```typescript
interface MapFlowSnapPointsReturn {
  snapPoints: string[];
  calculateSnapPoints: () => string[];
}
```

#### **Implementación**
```typescript
const useMapFlowSnapPoints = (step?: MapFlowStep): MapFlowSnapPointsReturn => {
  const stepConfig = useMapFlowStore(state => state.steps[step]);
  const { bottomSheet } = stepConfig;
  
  const calculateSnapPoints = useCallback(() => {
    const screenHeight = Dimensions.get('window').height;
    
    const minPercent = Math.round((bottomSheet.minHeight / screenHeight) * 100);
    const initialPercent = Math.round((bottomSheet.initialHeight / screenHeight) * 100);
    const maxPercent = Math.round((bottomSheet.maxHeight / screenHeight) * 100);
    
    const points = [minPercent, initialPercent, maxPercent]
      .filter((height, index, arr) => arr.indexOf(height) === index)
      .sort((a, b) => a - b);
    
    return points.map(point => `${point}%`);
  }, [bottomSheet]);
  
  const snapPoints = useMemo(() => calculateSnapPoints(), [calculateSnapPoints]);
  
  return {
    snapPoints,
    calculateSnapPoints,
  };
};
```

### **7. useMapFlowAnimationConfig**

#### **Interface**
```typescript
interface MapFlowAnimationConfigReturn {
  animationConfig: AnimationConfig;
  transitionType: string;
  transitionDuration: number;
}
```

#### **Implementación**
```typescript
const useMapFlowAnimationConfig = (step?: MapFlowStep): MapFlowAnimationConfigReturn => {
  const stepConfig = useMapFlowStore(state => state.steps[step]);
  const { transition } = stepConfig;
  
  const animationConfig = useMemo(() => {
    const { type, duration } = transition;
    
    switch (type) {
      case 'slide':
        return {
          duration,
          easing: Easing.out(Easing.cubic),
        };
      case 'fade':
        return {
          duration,
          easing: Easing.inOut(Easing.ease),
        };
      case 'none':
        return {
          duration: 0,
          easing: Easing.linear,
        };
      default:
        return {
          duration: 200,
          easing: Easing.inOut(Easing.ease),
        };
    }
  }, [transition]);
  
  return {
    animationConfig,
    transitionType: transition.type,
    transitionDuration: transition.duration,
  };
};
```

## 🔧 Utilidades

### **1. mapFlowMapper.ts**

#### **Función Principal**
```typescript
export const mapMapFlowToGorhom = (mapFlowConfig: StepConfig) => {
  const { bottomSheet } = mapFlowConfig;
  
  // Mapeo de visibilidad
  const index = bottomSheet.visible ? 0 : -1;
  
  // Mapeo de snap points
  const snapPoints = calculateSnapPoints(
    bottomSheet.minHeight,
    bottomSheet.initialHeight,
    bottomSheet.maxHeight
  );
  
  // Mapeo de gestos
  const enableHandlePanningGesture = bottomSheet.allowDrag;
  const enableContentPanningGesture = bottomSheet.allowDrag;
  
  // Mapeo de handle
  const handleComponent = bottomSheet.showHandle ? undefined : null;
  
  return {
    index,
    snapPoints,
    enableHandlePanningGesture,
    enableContentPanningGesture,
    handleComponent,
  };
};
```

### **2. snapPointsCalculator.ts**

#### **Función Principal**
```typescript
export const calculateSnapPoints = (
  minHeight: number,
  initialHeight: number,
  maxHeight: number
): string[] => {
  const screenHeight = Dimensions.get('window').height;
  
  const minPercent = Math.round((minHeight / screenHeight) * 100);
  const initialPercent = Math.round((initialHeight / screenHeight) * 100);
  const maxPercent = Math.round((maxHeight / screenHeight) * 100);
  
  const points = [minPercent, initialPercent, maxPercent]
    .filter((height, index, arr) => arr.indexOf(height) === index)
    .sort((a, b) => a - b);
  
  return points.map(point => `${point}%`);
};
```

### **3. transitionMapper.ts**

#### **Función Principal**
```typescript
export const mapTransitionToGorhom = (transition: TransitionConfig) => {
  const { type, duration } = transition;
  
  switch (type) {
    case 'slide':
      return {
        duration,
        easing: Easing.out(Easing.cubic),
      };
    case 'fade':
      return {
        duration,
        easing: Easing.inOut(Easing.ease),
      };
    case 'none':
      return {
        duration: 0,
        easing: Easing.linear,
      };
    default:
      return {
        duration: 200,
        easing: Easing.inOut(Easing.ease),
      };
  }
};
```

## 📊 Patrones de Implementación

### **1. Patrón de Hook Compuesto**

#### **useMapFlowBottomSheetComplete**
```typescript
const useMapFlowBottomSheetComplete = (step?: MapFlowStep) => {
  const bottomSheet = useMapFlowBottomSheet(step);
  const animatedValues = useMapFlowAnimatedValues(step);
  const scrollControl = useMapFlowScrollControl(step);
  const background = useMapFlowBackground(step);
  const footer = useMapFlowFooter(step);
  const snapPoints = useMapFlowSnapPoints(step);
  const animationConfig = useMapFlowAnimationConfig(step);
  
  return {
    ...bottomSheet,
    ...animatedValues,
    ...scrollControl,
    ...background,
    ...footer,
    ...snapPoints,
    ...animationConfig,
  };
};
```

### **2. Patrón de Contexto**

#### **MapFlowBottomSheetContext**
```typescript
const MapFlowBottomSheetContext = createContext<MapFlowBottomSheetContextValue | null>(null);

const MapFlowBottomSheetProvider: React.FC<MapFlowBottomSheetProviderProps> = ({ 
  step, 
  children 
}) => {
  const value = useMapFlowBottomSheetComplete(step);
  
  return (
    <MapFlowBottomSheetContext.Provider value={value}>
      {children}
    </MapFlowBottomSheetContext.Provider>
  );
};

const useMapFlowBottomSheetContext = () => {
  const context = useContext(MapFlowBottomSheetContext);
  if (!context) {
    throw new Error('useMapFlowBottomSheetContext must be used within MapFlowBottomSheetProvider');
  }
  return context;
};
```

### **3. Patrón de Factory**

#### **MapFlowBottomSheetFactory**
```typescript
export const createMapFlowBottomSheet = (step: MapFlowStep) => {
  return (props: Omit<GorhomMapFlowBottomSheetProps, 'step'>) => (
    <GorhomMapFlowBottomSheet {...props} step={step} />
  );
};

// Uso
const TravelStartBottomSheet = createMapFlowBottomSheet('travel_start');
const SetLocationsBottomSheet = createMapFlowBottomSheet('set_locations');
```

## 🎯 Estrategias de Testing

### **1. Testing de Componentes**

#### **Testing de GorhomMapFlowBottomSheet**
```typescript
describe('GorhomMapFlowBottomSheet', () => {
  it('debe renderizar correctamente', () => {
    const { getByTestId } = render(
      <GorhomMapFlowBottomSheet
        visible={true}
        minHeight={100}
        maxHeight={500}
        initialHeight={200}
      >
        <Text>Content</Text>
      </GorhomMapFlowBottomSheet>
    );
    
    expect(getByTestId('bottom-sheet')).toBeTruthy();
  });
});
```

#### **Testing de Hooks**
```typescript
describe('useMapFlowBottomSheet', () => {
  it('debe retornar métodos de control', () => {
    const { result } = renderHook(() => useMapFlowBottomSheet('travel_start'));
    
    expect(result.current.goToSnapPoint).toBeDefined();
    expect(result.current.goToHeight).toBeDefined();
    expect(result.current.scrollUpComplete).toBeDefined();
    expect(result.current.scrollDownComplete).toBeDefined();
  });
});
```

### **2. Testing de Integración**

#### **Testing con MapFlow**
```typescript
describe('Integración con MapFlow', () => {
  it('debe funcionar con MapFlowWrapper', () => {
    const { getByTestId } = render(
      <MapFlowWrapper step="travel_start">
        <Text>Content</Text>
      </MapFlowWrapper>
    );
    
    expect(getByTestId('bottom-sheet')).toBeTruthy();
  });
});
```

## 📝 Conclusión

La arquitectura diseñada proporciona una base sólida para la migración, manteniendo la compatibilidad completa con el sistema actual mientras aprovecha las capacidades avanzadas de @gorhom/bottom-sheet. La estructura modular permite una implementación gradual y facilita el mantenimiento a largo plazo.



