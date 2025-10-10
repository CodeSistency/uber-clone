# Estrategia de Migración - InlineBottomSheet a @gorhom/bottom-sheet

## 🎯 Resumen Ejecutivo

Este documento define la estrategia de migración del InlineBottomSheet custom a @gorhom/bottom-sheet v5.2.4. Se establece el enfoque, metodología, y plan de implementación basado en el análisis completo del sistema actual.

## 🎯 Objetivos de la Migración

### **1. Objetivos Principales**
- **Preservar funcionalidad exacta**: Mantener 100% de la funcionalidad actual
- **Mejorar performance**: Aprovechar las optimizaciones de @gorhom/bottom-sheet
- **Simplificar mantenimiento**: Reducir código custom y dependencias
- **Aumentar estabilidad**: Usar librería probada y mantenida

### **2. Objetivos Secundarios**
- **Mejorar experiencia de desarrollo**: API más clara y documentada
- **Facilitar testing**: Hooks y métodos más testables
- **Preparar para futuras mejoras**: Base sólida para nuevas funcionalidades

## 🎯 Estrategia de Migración

### **1. Enfoque: Migración Gradual por Componentes**

#### **Fase 1: Componente Base**
- Crear `GorhomMapFlowBottomSheet` como wrapper de @gorhom/bottom-sheet
- Implementar mapeo de todas las props del MapFlow
- Mantener compatibilidad con la API actual

#### **Fase 2: Integración con MapFlow**
- Reemplazar `InlineBottomSheet` en `MapFlowWrapper`
- Reemplazar `InlineBottomSheet` en `UnifiedFlowWrapper`
- Mantener funcionalidad exacta

#### **Fase 3: Optimización y Testing**
- Optimizar performance
- Implementar testing completo
- Documentar cambios

### **2. Metodología: Backward Compatibility**

#### **Principio de Compatibilidad**
- Mantener la misma API externa
- Preservar todos los comportamientos
- No romper código existente
- Transición transparente

#### **Estrategia de Implementación**
```typescript
// Antes (InlineBottomSheet)
<InlineBottomSheet
  visible={flow.bottomSheetVisible}
  minHeight={flow.bottomSheetMinHeight}
  maxHeight={flow.bottomSheetMaxHeight}
  initialHeight={flow.bottomSheetInitialHeight}
  showHandle={flow.bottomSheetShowHandle}
  allowDrag={flow.bottomSheetAllowDrag}
  onClose={handleClose}
>
  {content}
</InlineBottomSheet>

// Después (GorhomMapFlowBottomSheet)
<GorhomMapFlowBottomSheet
  visible={flow.bottomSheetVisible}
  minHeight={flow.bottomSheetMinHeight}
  maxHeight={flow.bottomSheetMaxHeight}
  initialHeight={flow.bottomSheetInitialHeight}
  showHandle={flow.bottomSheetShowHandle}
  allowDrag={flow.bottomSheetAllowDrag}
  onClose={handleClose}
>
  {content}
</GorhomMapFlowBottomSheet>
```

## 🏗️ Arquitectura de la Migración

### **1. Estructura de Componentes**

#### **GorhomMapFlowBottomSheet**
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
}
```

#### **Hooks Personalizados**
```typescript
// Hook principal
const useMapFlowBottomSheet = (step: MapFlowStep) => { ... };

// Hook para valores animados
const useMapFlowAnimatedValues = (step: MapFlowStep) => { ... };

// Hook para control de scroll
const useMapFlowScrollControl = (step: MapFlowStep) => { ... };

// Hook para backgrounds
const useMapFlowBackground = (step: MapFlowStep) => { ... };

// Hook para footer
const useMapFlowFooter = (step: MapFlowStep) => { ... };
```

### **2. Mapeo de Configuraciones**

#### **Mapeo de Props Básicas**
```typescript
const mapMapFlowToGorhom = (mapFlowConfig: StepConfig) => {
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

#### **Mapeo de Transiciones**
```typescript
const mapTransitionToGorhom = (transition: TransitionConfig) => {
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

### **3. Componentes de Background**

#### **GradientBackground**
```typescript
const GradientBackground: React.FC<GradientBackgroundProps> = ({ 
  colors, 
  ...props 
}) => (
  <LinearGradient
    colors={colors}
    style={StyleSheet.absoluteFillObject}
    {...props}
  />
);
```

#### **BlurBackground**
```typescript
const BlurBackground: React.FC<BlurBackgroundProps> = ({ 
  intensity, 
  tint, 
  ...props 
}) => (
  <BlurView
    intensity={intensity}
    tint={tint}
    style={StyleSheet.absoluteFillObject}
    {...props}
  />
);
```

#### **MapFlowBackground**
```typescript
const MapFlowBackground: React.FC<MapFlowBackgroundProps> = ({ step }) => {
  const stepConfig = useMapFlowStore(state => state.steps[step]);
  const { bottomSheet } = stepConfig;
  
  if (bottomSheet.useGradient) {
    return <GradientBackground colors={bottomSheet.gradientColors} />;
  }
  
  if (bottomSheet.useBlur) {
    return <BlurBackground intensity={bottomSheet.blurIntensity} tint={bottomSheet.blurTint} />;
  }
  
  return <View style={StyleSheet.absoluteFillObject} />;
};
```

### **4. Componentes de Footer**

#### **MapFlowFooter**
```typescript
const MapFlowFooter: React.FC<MapFlowFooterProps> = ({ step, bottomBar }) => {
  const stepConfig = useMapFlowStore(state => state.steps[step]);
  const { bottomSheet } = stepConfig;
  
  const { animatedPosition } = useBottomSheet();
  
  const footerStyle = useAnimatedStyle(() => {
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
  
  return (
    <Animated.View style={[footerStyle, { height: bottomSheet.bottomBarHeight }]}>
      {bottomBar}
    </Animated.View>
  );
};
```

## 🔄 Plan de Implementación

### **1. Fase 1: Preparación (1-2 días)**

#### **Tareas**
- [ ] Crear estructura de archivos
- [ ] Implementar hooks básicos
- [ ] Crear componentes de background
- [ ] Crear componentes de footer
- [ ] Implementar mapeo de configuraciones

#### **Entregables**
- `components/ui/GorhomMapFlowBottomSheet.tsx`
- `hooks/useMapFlowBottomSheet.ts`
- `hooks/useMapFlowAnimatedValues.ts`
- `hooks/useMapFlowScrollControl.ts`
- `hooks/useMapFlowBackground.ts`
- `hooks/useMapFlowFooter.ts`
- `components/ui/MapFlowBackground.tsx`
- `components/ui/MapFlowFooter.tsx`

### **2. Fase 2: Implementación Core (2-3 días)**

#### **Tareas**
- [ ] Implementar `GorhomMapFlowBottomSheet`
- [ ] Implementar mapeo de props
- [ ] Implementar mapeo de transiciones
- [ ] Implementar mapeo de gestos
- [ ] Implementar mapeo de alturas

#### **Entregables**
- Componente principal funcional
- Mapeo completo de configuraciones
- Compatibilidad con MapFlow

### **3. Fase 3: Integración (1-2 días)**

#### **Tareas**
- [ ] Integrar en `MapFlowWrapper`
- [ ] Integrar en `UnifiedFlowWrapper`
- [ ] Reemplazar `InlineBottomSheet`
- [ ] Verificar funcionalidad

#### **Entregables**
- Integración completa
- Funcionalidad preservada
- Sin regresiones

### **4. Fase 4: Testing y Optimización (2-3 días)**

#### **Tareas**
- [ ] Testing de configuraciones críticas
- [ ] Testing de transiciones
- [ ] Testing de backgrounds
- [ ] Testing de footer
- [ ] Optimización de performance
- [ ] Documentación

#### **Entregables**
- Testing completo
- Performance optimizada
- Documentación actualizada

## 🎯 Estrategias de Testing

### **1. Testing de Configuraciones Críticas**

#### **Pasos SIN Handle**
```typescript
describe('Pasos sin Handle', () => {
  it('CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR no debe mostrar handle', () => {
    const { getByTestId } = render(
      <GorhomMapFlowBottomSheet step="CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR">
        <Text>Content</Text>
      </GorhomMapFlowBottomSheet>
    );
    
    expect(getByTestId('handle')).toBeNull();
  });
});
```

#### **Pasos SIN Drag**
```typescript
describe('Pasos sin Drag', () => {
  it('confirm_origin no debe permitir drag', () => {
    const { getByTestId } = render(
      <GorhomMapFlowBottomSheet step="confirm_origin">
        <Text>Content</Text>
      </GorhomMapFlowBottomSheet>
    );
    
    const bottomSheet = getByTestId('bottom-sheet');
    expect(bottomSheet.props.enableHandlePanningGesture).toBe(false);
    expect(bottomSheet.props.enableContentPanningGesture).toBe(false);
  });
});
```

### **2. Testing de Transiciones**

#### **Transiciones SLIDE**
```typescript
describe('Transiciones SLIDE', () => {
  it('travel_start debe usar transición slide', () => {
    const { getByTestId } = render(
      <GorhomMapFlowBottomSheet step="travel_start">
        <Text>Content</Text>
      </GorhomMapFlowBottomSheet>
    );
    
    const bottomSheet = getByTestId('bottom-sheet');
    expect(bottomSheet.props.animationConfigs.duration).toBe(220);
    expect(bottomSheet.props.animationConfigs.easing).toBe(Easing.out(Easing.cubic));
  });
});
```

### **3. Testing de Backgrounds**

#### **Gradient Background**
```typescript
describe('Gradient Background', () => {
  it('debe mostrar gradient cuando useGradient es true', () => {
    const { getByTestId } = render(
      <GorhomMapFlowBottomSheet step="step_with_gradient">
        <Text>Content</Text>
      </GorhomMapFlowBottomSheet>
    );
    
    expect(getByTestId('gradient-background')).toBeTruthy();
  });
});
```

### **4. Testing de Footer**

#### **Footer Animado**
```typescript
describe('Footer Animado', () => {
  it('debe mostrar footer cuando bottomBar está definido', () => {
    const { getByTestId } = render(
      <GorhomMapFlowBottomSheet step="step_with_footer">
        <Text>Content</Text>
      </GorhomMapFlowBottomSheet>
    );
    
    expect(getByTestId('footer')).toBeTruthy();
  });
});
```

## 📊 Métricas de Éxito

### **1. Métricas de Funcionalidad**
- **Configuraciones mapeadas**: 100%
- **Transiciones preservadas**: 100%
- **Backgrounds funcionando**: 100%
- **Footer animado funcionando**: 100%
- **Gestos funcionando**: 100%

### **2. Métricas de Performance**
- **Tiempo de renderizado**: < 16ms
- **Memoria utilizada**: < 50MB
- **FPS**: > 60fps
- **Tiempo de transición**: < 220ms

### **3. Métricas de Calidad**
- **Cobertura de testing**: > 90%
- **Documentación**: 100%
- **Compatibilidad**: 100%
- **Regresiones**: 0

## 🎯 Plan de Rollback

### **1. Estrategia de Rollback**
- Mantener `InlineBottomSheet` como fallback
- Implementar feature flag para alternar entre implementaciones
- Documentar proceso de rollback

### **2. Implementación de Feature Flag**
```typescript
const useGorhomBottomSheet = process.env.EXPO_PUBLIC_USE_GORHOM_BOTTOM_SHEET === 'true';

const BottomSheetComponent = useGorhomBottomSheet 
  ? GorhomMapFlowBottomSheet 
  : InlineBottomSheet;
```

### **3. Proceso de Rollback**
1. Cambiar feature flag a `false`
2. Verificar que `InlineBottomSheet` funciona
3. Investigar problemas con `GorhomMapFlowBottomSheet`
4. Corregir problemas
5. Volver a cambiar feature flag a `true`

## 📝 Conclusión

La estrategia de migración está diseñada para ser gradual, segura y transparente. Se mantiene la compatibilidad completa mientras se aprovechan las capacidades avanzadas de @gorhom/bottom-sheet. El plan de implementación es realista y permite rollback en caso de problemas.



