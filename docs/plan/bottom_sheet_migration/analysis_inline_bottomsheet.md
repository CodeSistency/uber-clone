# Análisis Detallado del InlineBottomSheet.tsx

## 📋 Resumen Ejecutivo

El `InlineBottomSheet.tsx` es un componente custom complejo que implementa un bottom sheet con funcionalidades avanzadas como gestos, animaciones, gradients, blur effects y bottom bars animados. Este análisis documenta todas sus funcionalidades para facilitar la migración a @gorhom/bottom-sheet.

## 🔧 Props y Interface

### Interface Principal: `InlineBottomSheetProps`

```typescript
interface InlineBottomSheetProps extends ViewProps {
  // Control básico
  visible: boolean;                    // Si el sheet está visible
  minHeight?: number;                  // Altura mínima en pixels (default: 120)
  maxHeight?: number;                  // Altura máxima en pixels (default: 600)
  initialHeight?: number;              // Altura inicial en pixels (default: 300)
  allowDrag?: boolean;                 // Permitir arrastre (default: true)
  showHandle?: boolean;                // Mostrar handle de arrastre (default: true)
  onClose?: () => void;                // Callback al cerrar
  snapPoints?: number[];               // Puntos de snap en pixels
  className?: string;                  // Clases CSS adicionales

  // Gradient background props
  useGradient?: boolean;               // Usar gradient background (default: true)
  gradientColors?: readonly [ColorValue, ColorValue, ...ColorValue[]]; // Colores del gradient
  useBlur?: boolean;                  // Usar blur effect (default: true)
  blurIntensity?: number;              // Intensidad del blur (default: 45)
  blurTint?: "light" | "dark" | "default"; // Tint del blur
  blurFallbackColor?: string;          // Color fallback para blur

  // Bottom bar props
  bottomBar?: React.ReactNode;         // Contenido del bottom bar
  bottomBarHeight?: number;             // Altura del bottom bar (default: 64)
  showBottomBarAt?: number;            // Ratio para mostrar bottom bar (default: 0.6)
}
```

### Interface de Métodos: `BottomSheetMethods`

```typescript
export interface BottomSheetMethods {
  scrollUpComplete: () => void;        // Ir a altura máxima
  scrollDownComplete: () => void;     // Ir a altura mínima
  goToSnapPoint: (index: number) => void; // Ir a snap point específico
  goToHeight: (height: number) => void;    // Ir a altura específica
  enableScroll: () => void;            // Habilitar scroll
  disableScroll: () => void;           // Deshabilitar scroll
  getCurrentHeight: () => number;      // Obtener altura actual
  isAtMaxHeight: () => boolean;        // Verificar si está en altura máxima
  isAtMinHeight: () => boolean;        // Verificar si está en altura mínima
}
```

### Interface de Configuración: `BottomSheetConfig`

```typescript
interface BottomSheetConfig {
  minHeight?: number;                  // Altura mínima
  maxHeight?: number;                  // Altura máxima
  initialHeight?: number;              // Altura inicial
  snapPoints?: number[];              // Puntos de snap
  animationConfig?: {                 // Configuración de animaciones
    duration?: number;
    easing?: any;
    bounciness?: number;
    speed?: number;
  };
}
```

## 🎨 Funcionalidades Principales

### 1. Sistema de Gestos (PanResponder)

- **Detección de gestos verticales**: Solo responde a gestos principalmente verticales
- **Threshold de activación**: 3px vertical, 6px horizontal
- **Gestos habilitados/deshabilitados**: Controlado por `allowDrag`
- **Snap automático**: Al soltar, va al snap point más cercano
- **Cierre por gesto**: Si se arrastra más de 80px hacia abajo o velocidad > 0.75

### 2. Sistema de Animaciones

- **Spring animations**: Usando `Animated.spring` con configuración personalizable
- **Configuración por defecto**: 
  - `bounciness: 6`
  - `speed: 9`
- **Animaciones suaves**: Para transiciones entre alturas
- **Interpolaciones**: Para bottom bar (opacity y translateY)

### 3. Sistema de Background

#### Gradient Background
- **LinearGradient**: De abajo hacia arriba
- **Colores por defecto**: 
  ```typescript
  ["rgba(0,0,0,0.65)", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.05)", "rgba(0,0,0,0)"]
  ```
- **Configuración**: `useGradient` y `gradientColors`

#### Blur Background
- **BlurView**: Usando `expo-blur`
- **Intensidad**: 45 por defecto
- **Tint**: "default" por defecto
- **Fallback**: Color sólido si blur no está disponible

### 4. Sistema de Bottom Bar Animado

- **Aparición condicional**: Basada en altura del sheet
- **Interpolaciones**:
  - `translateY`: De `bottomBarHeight` a `0`
  - `opacity`: De `0` a `1`
- **Threshold**: `minHeight + (maxHeight - minHeight) * showBottomBarAt`
- **Animación suave**: Basada en posición del sheet

### 5. Sistema de Snap Points

- **Cálculo automático**: Basado en `minHeight`, `initialHeight`, `maxHeight`
- **Snap points adicionales**: Puntos medios calculados automáticamente
- **Snap más cercano**: Al soltar, va al punto más cercano
- **Configuración personalizada**: Via `snapPoints` prop

## 🔄 Hook Personalizado: `useBottomSheet`

### Funcionalidades del Hook

```typescript
const useBottomSheet = (config: BottomSheetConfig = {}) => {
  // Estado interno
  const heightAnim = useRef(new Animated.Value(initialHeight)).current;
  const currentHeight = useRef(initialHeight);
  const scrollEnabled = useRef(true);

  // Métodos expuestos
  return {
    heightAnim,           // Valor animado de altura
    methods,             // Métodos de control
    currentHeight,       // Altura actual
    scrollEnabled,       // Estado de scroll
  };
};
```

### Métodos del Hook

- **`animateTo(toValue, customConfig)`**: Animar a altura específica
- **`scrollUpComplete()`**: Ir a altura máxima
- **`scrollDownComplete()`**: Ir a altura mínima
- **`goToSnapPoint(index)`**: Ir a snap point específico
- **`goToHeight(height)`**: Ir a altura específica
- **`enableScroll()` / `disableScroll()`**: Control de scroll
- **`getCurrentHeight()`**: Obtener altura actual
- **`isAtMaxHeight()` / `isAtMinHeight()`**: Verificar posiciones

## 🎯 Configuraciones Especiales

### 1. Configuraciones sin Drag
- **`allowDrag: false`**: Deshabilita completamente el arrastre
- **Uso**: Para pasos como `confirm_origin` donde no se debe permitir arrastre

### 2. Configuraciones sin Handle
- **`showHandle: false`**: Oculta el handle de arrastre
- **Uso**: Para pasos como `CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR`

### 3. Configuraciones de Altura Específica
- **Alturas críticas**: 100px, 120px, 140px, 160px, 200px, 300px, 420px, 520px, 700px
- **Ratios específicos**: Diferentes alturas para diferentes pasos del flujo

## 🔧 Implementación Técnica

### 1. Gestión de Estado
- **Animated.Value**: Para altura del sheet
- **useRef**: Para valores que no causan re-render
- **useCallback**: Para funciones estables

### 2. Optimizaciones
- **Native Driver**: Para animaciones de transformación
- **Memoización**: Para evitar re-renders innecesarios
- **Lazy evaluation**: Para cálculos costosos

### 3. Accesibilidad
- **accessibilityRole**: "adjustable" para el handle
- **accessibilityLabel**: "Ajustar hoja"
- **Pointer events**: Controlado por `allowDrag`

## 📊 Métricas de Complejidad

- **Líneas de código**: ~993 líneas
- **Props**: 20+ props diferentes
- **Métodos expuestos**: 9 métodos
- **Hooks internos**: 1 hook personalizado
- **Dependencias externas**: 3 (expo-blur, expo-linear-gradient, react-native)

## 🎯 Puntos Críticos para Migración

### 1. Compatibilidad de Props
- Mantener todas las props actuales
- Mapear correctamente a props de @gorhom/bottom-sheet
- Preservar comportamiento por defecto

### 2. Funcionalidades Avanzadas
- **Gradient backgrounds**: Requiere componente custom
- **Blur effects**: Requiere integración con expo-blur
- **Bottom bar animado**: Requiere interpolaciones custom
- **Snap points dinámicos**: Requiere cálculo automático

### 3. Gestos y Animaciones
- **PanResponder**: Reemplazar por gestos de @gorhom/bottom-sheet
- **Spring animations**: Mapear a configuración de @gorhom/bottom-sheet
- **Interpolaciones**: Mantener para bottom bar

### 4. Métodos Imperativos
- **useImperativeHandle**: Mantener interface actual
- **Métodos de control**: Mapear a métodos de @gorhom/bottom-sheet
- **Estado interno**: Preservar funcionalidad

## 🚀 Estrategia de Migración

### 1. Crear Wrapper Component
- Mantener interface actual
- Mapear props internamente
- Exponer mismos métodos

### 2. Implementar Funcionalidades
- Background components custom
- Bottom bar con interpolaciones
- Snap points automáticos
- Gestos compatibles

### 3. Testing
- Probar todas las configuraciones
- Verificar comportamiento idéntico
- Performance testing

## 📝 Conclusión

El `InlineBottomSheet.tsx` es un componente muy sofisticado con funcionalidades avanzadas que requieren una migración cuidadosa para mantener la compatibilidad total. La estrategia debe enfocarse en crear un wrapper que mantenga la interface actual mientras aprovecha las capacidades nativas de @gorhom/bottom-sheet.



