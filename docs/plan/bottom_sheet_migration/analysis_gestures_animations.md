# Análisis de Gestos y Animaciones - InlineBottomSheet

## 🎯 Resumen Ejecutivo

El sistema de gestos y animaciones del `InlineBottomSheet` es altamente sofisticado, implementando un PanResponder custom con lógica de detección inteligente, animaciones spring suaves, y un sistema de interpolaciones para efectos visuales avanzados.

## 🤏 Sistema de Gestos (PanResponder)

### Configuración del PanResponder

```typescript
const panResponder = useRef(
  PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => {
      const canDrag = allowDrag && (useHook ? hookData.scrollEnabled : true);
      const verticalThreshold = 3;
      const horizontalThreshold = 6;
      const isVerticalEnough = Math.abs(g.dy) > verticalThreshold;
      const isMostlyVertical = Math.abs(g.dy) > Math.abs(g.dx);
      return canDrag && isVerticalEnough && isMostlyVertical;
    },
    onPanResponderGrant: () => {
      startHeightRef.current = currentHeightRef.current;
    },
    onPanResponderMove: (_, g) => {
      if (!allowDrag || (useHook && !hookData.scrollEnabled)) return;
      const next = clamp(
        startHeightRef.current - g.dy,
        minHeight,
        maxHeight,
      );
      heightAnim.setValue(next);
    },
    onPanResponderRelease: (_, g) => {
      if (!allowDrag || (useHook && !hookData.scrollEnabled)) return;
      const end = clamp(
        startHeightRef.current - g.dy,
        minHeight,
        maxHeight,
      );
      const mid = (minHeight + maxHeight) / 2;
      const snaps = [minHeight, mid, maxHeight, ...(snapPoints || [])];
      const nearest = snaps.reduce((a, b) =>
        Math.abs(b - end) < Math.abs(a - end) ? b : a,
      );
      animateTo(nearest);
    },
  }),
).current;
```

### Características del Sistema de Gestos

#### 1. **Detección Inteligente de Gestos**
- **Threshold vertical**: 3px mínimo para activar
- **Threshold horizontal**: 6px máximo para evitar activación accidental
- **Detección direccional**: Solo gestos principalmente verticales (`|dy| > |dx|`)
- **Control de habilitación**: Respetando `allowDrag` y `scrollEnabled`

#### 2. **Gestión de Estado Durante el Gesto**
- **onPanResponderGrant**: Captura altura inicial al comenzar
- **onPanResponderMove**: Actualiza altura en tiempo real con `setValue`
- **onPanResponderRelease**: Calcula snap point final y anima

#### 3. **Lógica de Snap Points**
- **Snap points automáticos**: `[minHeight, mid, maxHeight]`
- **Snap points personalizados**: Agregados via `snapPoints` prop
- **Algoritmo de proximidad**: Va al punto más cercano al final del gesto
- **Clamping**: Altura siempre entre `minHeight` y `maxHeight`

## 🎨 Sistema de Animaciones

### Configuración de Animaciones Spring

```typescript
const SPRING_BOUNCINESS = 6;
const SPRING_SPEED = 9;

const defaultAnimConfig = {
  bounciness: animationConfig.bounciness !== undefined 
    ? animationConfig.bounciness 
    : SPRING_BOUNCINESS,
  speed: animationConfig.speed !== undefined 
    ? animationConfig.speed 
    : SPRING_SPEED,
  ...animationConfig,
};
```

### Función Principal de Animación

```typescript
const animateTo = useCallback(
  (toValue: number, customConfig?: any) => {
    const clampedValue = Math.max(minHeight, Math.min(maxHeight, toValue));
    
    Animated.spring(heightAnim, {
      toValue: clampedValue,
      useNativeDriver: false,  // ⚠️ Importante: No usa native driver
      ...defaultAnimConfig,
      ...customConfig,
    }).start();
  },
  [heightAnim, minHeight, maxHeight, defaultAnimConfig],
);
```

### Características de las Animaciones

#### 1. **Spring Animations**
- **Bounciness**: 6 (efecto de rebote moderado)
- **Speed**: 9 (velocidad de animación)
- **Configuración personalizable**: Via `animationConfig` prop
- **Clamping automático**: Valores siempre dentro de límites

#### 2. **Gestión de Estado**
- **useNativeDriver: false**: Para permitir interpolaciones complejas
- **Listener de altura**: Actualiza `currentHeight` en tiempo real
- **Cleanup automático**: Remueve listeners al desmontar

#### 3. **Métodos de Control**
```typescript
// Métodos expuestos para control programático
scrollUpComplete: () => animateTo(maxHeight);
scrollDownComplete: () => animateTo(minHeight);
goToSnapPoint: (index: number) => {
  if (snapPoints && snapPoints[index]) {
    animateTo(snapPoints[index]);
  }
};
goToHeight: animateTo;
```

## 🎭 Sistema de Interpolaciones

### Interpolación del Bottom Bar

```typescript
// Cálculo del threshold para mostrar bottom bar
const screenHeight = Dimensions.get("window").height;
const cappedMax = Math.min(maxHeight, Math.floor(screenHeight * 0.85));
const threshold = minHeight + (cappedMax - minHeight) * showBottomBarAt;

// Interpolación de translateY
const barTranslate = heightAnim.interpolate({
  inputRange: [threshold - 40, threshold + 40],
  outputRange: [bottomBarHeight, 0],
  extrapolate: "clamp",
});

// Interpolación de opacity
const barOpacity = heightAnim.interpolate({
  inputRange: [threshold - 20, threshold + 20],
  outputRange: [0, 1],
  extrapolate: "clamp",
});
```

### Características de las Interpolaciones

#### 1. **Bottom Bar Animado**
- **Threshold dinámico**: Basado en `showBottomBarAt` (default: 0.6)
- **TranslateY**: De `bottomBarHeight` a `0` (aparición desde abajo)
- **Opacity**: De `0` a `1` (fade in/out)
- **Rangos de interpolación**: 40px para translateY, 20px para opacity

#### 2. **Cálculos Inteligentes**
- **Screen height aware**: Considera altura de pantalla
- **Capped maximum**: Máximo 85% de la pantalla
- **Smooth transitions**: Rangos de interpolación suaves

#### 3. **Extrapolación Controlada**
- **extrapolate: "clamp"**: Evita valores fuera del rango
- **Rangos superpuestos**: Para transiciones más suaves
- **Performance optimizada**: Interpolaciones nativas

## 🔄 Gestión de Estado y Performance

### Estado Interno

```typescript
// Referencias para estado no reactivo
const heightAnim = useRef(new Animated.Value(initialHeight)).current;
const currentHeight = useRef(initialHeight);
const scrollEnabled = useRef(true);
const startHeightRef = useRef(initialHeight);

// Listener para actualizar estado
useEffect(() => {
  const id = heightAnim.addListener(({ value }) => {
    currentHeightRef.current = value;
  });
  return () => heightAnim.removeListener(id);
}, [heightAnim]);
```

### Optimizaciones de Performance

#### 1. **useCallback para Funciones**
- Todas las funciones de control usan `useCallback`
- Dependencias optimizadas para evitar re-renders
- Funciones estables para referencias

#### 2. **useRef para Valores No Reactivos**
- `currentHeight`: No causa re-render
- `scrollEnabled`: Estado interno
- `startHeightRef`: Para cálculos de gesto

#### 3. **Listener Management**
- **Add listener**: Al montar componente
- **Remove listener**: Al desmontar
- **Cleanup automático**: Previene memory leaks

## 🎯 Mapeo a @gorhom/bottom-sheet

### Gestos Equivalentes

| **InlineBottomSheet** | **@gorhom/bottom-sheet** | **Notas** |
|----------------------|---------------------------|-----------|
| `onMoveShouldSetPanResponder` | `enableHandlePanningGesture` | Detección de gestos |
| `onPanResponderMove` | `enableContentPanningGesture` | Gestos de contenido |
| `onPanResponderRelease` | `snapPoints` + `onChange` | Snap automático |
| `allowDrag` | `enableHandlePanningGesture` + `enableContentPanningGesture` | Control de habilitación |

### Animaciones Equivalentes

| **InlineBottomSheet** | **@gorhom/bottom-sheet** | **Notas** |
|----------------------|---------------------------|-----------|
| `Animated.spring` | `animationConfigs` | Configuración de animaciones |
| `bounciness: 6, speed: 9` | `useBottomSheetSpringConfigs` | Parámetros spring |
| `useNativeDriver: false` | Automático | Para interpolaciones |

### Interpolaciones Equivalentes

| **InlineBottomSheet** | **@gorhom/bottom-sheet** | **Notas** |
|----------------------|---------------------------|-----------|
| `heightAnim.interpolate` | `animatedPosition` | Posición animada |
| Bottom bar animations | `footerComponent` | Componente custom |
| `extrapolate: "clamp"` | Automático | Control de rangos |

## 🚀 Estrategia de Migración

### 1. **Mantener Interface Actual**
- Preservar todos los métodos expuestos
- Mantener comportamiento de gestos
- Conservar animaciones suaves

### 2. **Mapear Gestos**
- `enableHandlePanningGesture`: Para gestos del handle
- `enableContentPanningGesture`: Para gestos del contenido
- `onChange`: Para callbacks de cambio de posición

### 3. **Implementar Animaciones**
- `useBottomSheetSpringConfigs`: Para configuración spring
- `animationConfigs`: Para animaciones personalizadas
- `animatedPosition`: Para interpolaciones

### 4. **Bottom Bar Custom**
- `footerComponent`: Componente con interpolaciones
- `animatedPosition`: Para animaciones basadas en posición
- Mantener lógica de threshold

## 📊 Métricas de Complejidad

- **PanResponder handlers**: 4 métodos
- **Animaciones**: 1 función principal + 4 métodos de control
- **Interpolaciones**: 2 (translateY + opacity)
- **Estado interno**: 4 refs + 1 listener
- **Configuración**: 2 constantes + configuración personalizable

## 🎯 Puntos Críticos

### 1. **Compatibilidad de Gestos**
- Mantener detección inteligente de gestos
- Preservar thresholds y lógica de activación
- Conservar comportamiento de snap points

### 2. **Animaciones Suaves**
- Spring animations con misma configuración
- Interpolaciones para bottom bar
- Performance optimizada

### 3. **Estado y Control**
- Métodos imperativos idénticos
- Estado interno consistente
- Callbacks apropiados

## 📝 Conclusión

El sistema de gestos y animaciones del `InlineBottomSheet` es muy sofisticado y requiere una migración cuidadosa para mantener la misma experiencia de usuario. La clave está en mapear correctamente los gestos a las capacidades nativas de @gorhom/bottom-sheet mientras se preservan las animaciones y interpolaciones custom.



