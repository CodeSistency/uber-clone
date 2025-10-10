# Análisis de Hooks - @gorhom/bottom-sheet

## 🎯 Resumen Ejecutivo

Este documento analiza los hooks disponibles en @gorhom/bottom-sheet v5.2.4 y cómo pueden ser utilizados para implementar las funcionalidades del InlineBottomSheet custom. Se identifican los hooks disponibles, sus capacidades, y estrategias de implementación.

## 🎣 Hooks Principales

### **1. useBottomSheet**

#### **Propósito**
Hook principal que proporciona acceso a todos los métodos imperativos y valores animados del bottom sheet.

#### **Valores Retornados**
```typescript
const {
  // Métodos imperativos
  snapToIndex,
  snapToPosition,
  expand,
  collapse,
  close,
  
  // Estado
  isActive,
  isClosed,
  isExpanded,
  isCollapsed,
  
  // Valores animados
  animatedIndex,
  animatedPosition,
  animatedContentHeight,
} = useBottomSheet();
```

#### **Uso en MapFlow**
```typescript
const useMapFlowBottomSheet = (step: MapFlowStep) => {
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
  
  return {
    goToSnapPoint,
    goToHeight,
    scrollUpComplete,
    scrollDownComplete,
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

### **2. useBottomSheetModal**

#### **Propósito**
Hook para controlar bottom sheets modales (BottomSheetModal).

#### **Valores Retornados**
```typescript
const {
  present,
  dismiss,
  close,
  snapToIndex,
  snapToPosition,
} = useBottomSheetModal();
```

#### **Uso en MapFlow**
```typescript
const useMapFlowModal = (step: MapFlowStep) => {
  const stepConfig = useMapFlowStore(state => state.steps[step]);
  const { bottomSheet } = stepConfig;
  
  const {
    present,
    dismiss,
    close,
    snapToIndex,
    snapToPosition,
  } = useBottomSheetModal();
  
  const showModal = useCallback(() => {
    if (bottomSheet.visible) {
      present();
    }
  }, [bottomSheet.visible, present]);
  
  const hideModal = useCallback(() => {
    dismiss();
  }, [dismiss]);
  
  return {
    showModal,
    hideModal,
    close,
    snapToIndex,
    snapToPosition,
  };
};
```

### **3. useBottomSheetDynamicSnapPoints**

#### **Propósito**
Hook para manejar snap points dinámicos basados en el contenido.

#### **Valores Retornados**
```typescript
const {
  animatedSnapPoints,
  animatedHandleHeight,
  animatedContentHeight,
  handleContentLayout,
} = useBottomSheetDynamicSnapPoints();
```

#### **Uso en MapFlow**
```typescript
const useMapFlowDynamicSnapPoints = (step: MapFlowStep) => {
  const stepConfig = useMapFlowStore(state => state.steps[step]);
  const { bottomSheet } = stepConfig;
  
  const {
    animatedSnapPoints,
    animatedHandleHeight,
    animatedContentHeight,
    handleContentLayout,
  } = useBottomSheetDynamicSnapPoints();
  
  // Calcular snap points dinámicos
  const calculateDynamicSnapPoints = useCallback(() => {
    const minHeight = bottomSheet.minHeight;
    const maxHeight = bottomSheet.maxHeight;
    const initialHeight = bottomSheet.initialHeight;
    
    return [minHeight, initialHeight, maxHeight];
  }, [bottomSheet]);
  
  return {
    animatedSnapPoints,
    animatedHandleHeight,
    animatedContentHeight,
    handleContentLayout,
    calculateDynamicSnapPoints,
  };
};
```

## 🎨 Hooks Personalizados para MapFlow

### **1. useMapFlowBottomSheet**

#### **Propósito**
Hook personalizado que combina @gorhom/bottom-sheet con la lógica del MapFlow.

#### **Implementación**
```typescript
const useMapFlowBottomSheet = (step: MapFlowStep) => {
  const stepConfig = useMapFlowStore(state => state.steps[step]);
  const { bottomSheet, transition } = stepConfig;
  
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
    // Métodos de control
    goToSnapPoint,
    goToHeight,
    scrollUpComplete,
    scrollDownComplete,
    
    // Métodos de estado
    getCurrentHeight,
    isAtMaxHeight,
    isAtMinHeight,
    
    // Control de scroll
    enableScroll,
    disableScroll,
    scrollEnabled,
    
    // Estado actual
    isActive,
    isClosed,
    isExpanded,
    isCollapsed,
    
    // Valores animados
    animatedIndex,
    animatedPosition,
    animatedContentHeight,
  };
};
```

### **2. useMapFlowAnimatedValues**

#### **Propósito**
Hook para manejar valores animados personalizados del MapFlow.

#### **Implementación**
```typescript
const useMapFlowAnimatedValues = (step: MapFlowStep) => {
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

#### **Propósito**
Hook para controlar el comportamiento de scroll del bottom sheet.

#### **Implementación**
```typescript
const useMapFlowScrollControl = (step: MapFlowStep) => {
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

#### **Propósito**
Hook para manejar backgrounds personalizados (gradient, blur).

#### **Implementación**
```typescript
const useMapFlowBackground = (step: MapFlowStep) => {
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
    gradientBackground,
    blurBackground,
    useGradient: bottomSheet.useGradient,
    useBlur: bottomSheet.useBlur,
    gradientColors: bottomSheet.gradientColors,
    blurIntensity: bottomSheet.blurIntensity,
    blurTint: bottomSheet.blurTint,
  };
};
```

### **5. useMapFlowFooter**

#### **Propósito**
Hook para manejar el footer animado del bottom sheet.

#### **Implementación**
```typescript
const useMapFlowFooter = (step: MapFlowStep) => {
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

## 🔧 Hooks de Utilidad

### **1. useMapFlowSnapPoints**

#### **Propósito**
Hook para calcular snap points dinámicos.

#### **Implementación**
```typescript
const useMapFlowSnapPoints = (step: MapFlowStep) => {
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

### **2. useMapFlowAnimationConfig**

#### **Propósito**
Hook para configurar animaciones del bottom sheet.

#### **Implementación**
```typescript
const useMapFlowAnimationConfig = (step: MapFlowStep) => {
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

## 🎯 Estrategias de Implementación

### **1. Hook Compuesto**

#### **useMapFlowBottomSheetComplete**
```typescript
const useMapFlowBottomSheetComplete = (step: MapFlowStep) => {
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

### **2. Hook de Contexto**

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

## 📊 Métricas de Hooks

- **Hooks nativos**: 3
- **Hooks personalizados**: 8
- **Hooks de utilidad**: 2
- **Hooks compuestos**: 1
- **Hooks de contexto**: 1
- **Total de hooks**: 15

## 🎯 Plan de Testing

### **1. Testing de Hooks Nativos**
- Verificar `useBottomSheet`
- Verificar `useBottomSheetModal`
- Verificar `useBottomSheetDynamicSnapPoints`

### **2. Testing de Hooks Personalizados**
- Verificar `useMapFlowBottomSheet`
- Verificar `useMapFlowAnimatedValues`
- Verificar `useMapFlowScrollControl`
- Verificar `useMapFlowBackground`
- Verificar `useMapFlowFooter`

### **3. Testing de Hooks de Utilidad**
- Verificar `useMapFlowSnapPoints`
- Verificar `useMapFlowAnimationConfig`

### **4. Testing de Hooks Compuestos**
- Verificar `useMapFlowBottomSheetComplete`
- Verificar `MapFlowBottomSheetContext`

## 📝 Conclusión

Los hooks de @gorhom/bottom-sheet proporcionan una base sólida para implementar todas las funcionalidades del InlineBottomSheet custom. Los hooks personalizados permiten una integración perfecta con el MapFlow, manteniendo la funcionalidad exacta mientras aprovechan las capacidades avanzadas de @gorhom/bottom-sheet.



