# Análisis de Gradient y Blur - InlineBottomSheet

## 🎨 Resumen Ejecutivo

El sistema de backgrounds del `InlineBottomSheet` implementa un sistema sofisticado de capas visuales que combina blur effects, gradients lineales, y fallbacks inteligentes para crear efectos visuales avanzados. Este análisis documenta todas las funcionalidades para facilitar la migración a @gorhom/bottom-sheet.

## 🌈 Sistema de Gradient Background

### Configuración por Defecto

```typescript
// Props de gradient
useGradient = true,
gradientColors = [
  "rgba(0,0,0,0.65)",  // 65% opacidad - más oscuro
  "rgba(0,0,0,0.25)",  // 25% opacidad - medio
  "rgba(0,0,0,0.05)",  // 5% opacidad - muy sutil
  "rgba(0,0,0,0)",     // 0% opacidad - transparente
] as const,
```

### Implementación del Gradient

```typescript
{useGradient ? (
  <View style={StyleSheet.absoluteFillObject}>
    {/* Blur layer (opcional) */}
    {useBlur ? (
      <BlurView
        intensity={blurIntensity}
        tint={blurTint}
        style={StyleSheet.absoluteFillObject}
      />
    ) : (
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: blurFallbackColor,
        }}
      />
    )}
    
    {/* Gradient layer */}
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 1 }}  // Desde abajo
      end={{ x: 0, y: 0 }}     // Hasta arriba
      style={StyleSheet.absoluteFillObject}
    />
  </View>
) : (
  <View className="absolute inset-0 bg-white dark:bg-brand-primary" />
)}
```

### Características del Gradient

#### 1. **Dirección del Gradient**
- **start**: `{ x: 0, y: 1 }` - Comienza desde abajo
- **end**: `{ x: 0, y: 0 }` - Termina en arriba
- **Efecto**: Fade de oscuro (abajo) a transparente (arriba)

#### 2. **Colores por Defecto**
- **Color 1**: `rgba(0,0,0,0.65)` - Negro con 65% opacidad
- **Color 2**: `rgba(0,0,0,0.25)` - Negro con 25% opacidad
- **Color 3**: `rgba(0,0,0,0.05)` - Negro con 5% opacidad
- **Color 4**: `rgba(0,0,0,0)` - Completamente transparente

#### 3. **Configuración Personalizable**
- **`useGradient`**: Habilitar/deshabilitar gradient
- **`gradientColors`**: Array de colores personalizado
- **Tipado**: `readonly [ColorValue, ColorValue, ...ColorValue[]]`

## 🌫️ Sistema de Blur Background

### Configuración por Defecto

```typescript
// Props de blur
useBlur = true,
blurIntensity = 45,
blurTint = "default",
blurFallbackColor = "rgba(0,0,0,0.25)",
```

### Implementación del Blur

```typescript
{useBlur ? (
  <BlurView
    intensity={blurIntensity}    // Intensidad del blur (0-100)
    tint={blurTint}             // Tint del blur
    style={StyleSheet.absoluteFillObject}
  />
) : (
  <View
    style={{
      ...StyleSheet.absoluteFillObject,
      backgroundColor: blurFallbackColor,  // Color fallback
    }}
  />
)}
```

### Características del Blur

#### 1. **Intensidad del Blur**
- **Valor por defecto**: 45 (moderado)
- **Rango**: 0-100 (0 = sin blur, 100 = máximo blur)
- **Efecto**: Desenfoque del contenido de fondo

#### 2. **Tint del Blur**
- **"default"**: Tint neutro
- **"light"**: Tint claro
- **"dark"**: Tint oscuro
- **Efecto**: Afecta el color del blur

#### 3. **Fallback System**
- **`useBlur: false`**: Usa color sólido en lugar de blur
- **`blurFallbackColor`**: Color de respaldo
- **Compatibilidad**: Para dispositivos que no soportan blur

## 🏗️ Arquitectura de Capas

### Estructura de Capas (de abajo hacia arriba)

```
1. BlurView (si useBlur = true)
   ├── intensity: 45
   ├── tint: "default"
   └── style: absoluteFillObject

2. LinearGradient (si useGradient = true)
   ├── colors: [rgba(0,0,0,0.65), rgba(0,0,0,0.25), rgba(0,0,0,0.05), rgba(0,0,0,0)]
   ├── start: { x: 0, y: 1 }
   ├── end: { x: 0, y: 0 }
   └── style: absoluteFillObject

3. Contenido del Bottom Sheet
   ├── Drag handle
   ├── ScrollView con contenido
   └── Bottom bar (animado)
```

### Lógica Condicional

```typescript
// 1. Si useGradient = false
<View className="absolute inset-0 bg-white dark:bg-brand-primary" />

// 2. Si useGradient = true
<View style={StyleSheet.absoluteFillObject}>
  {/* Blur layer */}
  {useBlur ? <BlurView /> : <View backgroundColor={blurFallbackColor} />}
  
  {/* Gradient layer */}
  <LinearGradient colors={gradientColors} />
</View>
```

## 🎯 Configuraciones Especiales

### 1. **Modo Sin Gradient**
- **`useGradient: false`**: Background sólido
- **Color**: `bg-white dark:bg-brand-primary`
- **Uso**: Para sheets simples sin efectos visuales

### 2. **Modo Sin Blur**
- **`useBlur: false`**: Sin efecto blur
- **Fallback**: Color sólido `blurFallbackColor`
- **Uso**: Para dispositivos con problemas de performance

### 3. **Configuración Personalizada**
- **`gradientColors`**: Colores completamente personalizables
- **`blurIntensity`**: Intensidad ajustable
- **`blurTint`**: Tint personalizable

## 🔄 Integración con @gorhom/bottom-sheet

### Mapeo de Funcionalidades

| **InlineBottomSheet** | **@gorhom/bottom-sheet** | **Estrategia** |
|----------------------|---------------------------|----------------|
| `useGradient` | `backgroundComponent` | Componente custom |
| `gradientColors` | Props del componente | Pasar como props |
| `useBlur` | `backgroundComponent` | Integrar BlurView |
| `blurIntensity` | Props del componente | Pasar como props |
| `blurTint` | Props del componente | Pasar como props |
| `blurFallbackColor` | Props del componente | Pasar como props |

### Implementación del Background Component

```typescript
// Componente custom para @gorhom/bottom-sheet
const GorhomBottomSheetBackground: React.FC<{
  useGradient?: boolean;
  gradientColors?: string[];
  useBlur?: boolean;
  blurIntensity?: number;
  blurTint?: "light" | "dark" | "default";
  blurFallbackColor?: string;
}> = ({
  useGradient = true,
  gradientColors = ["rgba(0,0,0,0.65)", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.05)", "rgba(0,0,0,0)"],
  useBlur = true,
  blurIntensity = 45,
  blurTint = "default",
  blurFallbackColor = "rgba(0,0,0,0.25)",
}) => {
  if (!useGradient) {
    return <View className="absolute inset-0 bg-white dark:bg-brand-primary" />;
  }

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {useBlur ? (
        <BlurView
          intensity={blurIntensity}
          tint={blurTint}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: blurFallbackColor,
          }}
        />
      )}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
};
```

### Uso en @gorhom/bottom-sheet

```typescript
<BottomSheet
  backgroundComponent={GorhomBottomSheetBackground}
  // ... otras props
>
  {/* contenido */}
</BottomSheet>
```

## 🎨 Variaciones de Gradient

### 1. **Gradient Oscuro (por defecto)**
```typescript
gradientColors = [
  "rgba(0,0,0,0.65)",   // Muy oscuro
  "rgba(0,0,0,0.25)",   // Oscuro
  "rgba(0,0,0,0.05)",   // Sutil
  "rgba(0,0,0,0)",      // Transparente
]
```

### 2. **Gradient Claro**
```typescript
gradientColors = [
  "rgba(255,255,255,0.9)",  // Muy claro
  "rgba(255,255,255,0.6)",  // Claro
  "rgba(255,255,255,0.3)",  // Sutil
  "rgba(255,255,255,0)",    // Transparente
]
```

### 3. **Gradient de Color**
```typescript
gradientColors = [
  "rgba(2,134,255,0.8)",    // Azul primario
  "rgba(2,134,255,0.4)",    // Azul medio
  "rgba(2,134,255,0.1)",    // Azul sutil
  "rgba(2,134,255,0)",      // Transparente
]
```

## 🔧 Optimizaciones de Performance

### 1. **Lazy Loading de BlurView**
- Solo renderizar BlurView cuando `useBlur = true`
- Fallback inmediato si blur no está disponible
- Evitar re-renders innecesarios

### 2. **Memoización de Componentes**
```typescript
const MemoizedBlurView = React.memo(BlurView);
const MemoizedLinearGradient = React.memo(LinearGradient);
```

### 3. **Configuración Condicional**
- Renderizar solo las capas necesarias
- Evitar cálculos innecesarios
- Optimizar para diferentes dispositivos

## 🎯 Casos de Uso Específicos

### 1. **MapFlow Steps**
- **`confirm_origin`**: Gradient sutil para no interferir con mapa
- **`choose_driver`**: Gradient más intenso para destacar contenido
- **`CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR`**: Sin gradient para transparencia

### 2. **UnifiedFlow Steps**
- **Service selection**: Gradient personalizado por servicio
- **Driver selection**: Gradient adaptado al tema
- **Payment flow**: Gradient sutil para no distraer

### 3. **Configuraciones por Dispositivo**
- **iOS**: Blur nativo optimizado
- **Android**: Fallback a gradient sólido
- **Performance**: Configuración adaptativa

## 📊 Métricas de Complejidad

- **Props de gradient**: 2 (`useGradient`, `gradientColors`)
- **Props de blur**: 4 (`useBlur`, `blurIntensity`, `blurTint`, `blurFallbackColor`)
- **Capas de background**: 2 (blur + gradient)
- **Configuraciones**: 6 variaciones principales
- **Dependencias**: 2 (`expo-blur`, `expo-linear-gradient`)

## 🚀 Estrategia de Migración

### 1. **Crear Background Component**
- Implementar componente custom
- Mantener todas las props actuales
- Preservar comportamiento visual

### 2. **Integrar con @gorhom/bottom-sheet**
- Usar `backgroundComponent` prop
- Pasar configuración como props
- Mantener compatibilidad total

### 3. **Testing Visual**
- Verificar todos los gradientes
- Probar blur en diferentes dispositivos
- Validar fallbacks

## 📝 Conclusión

El sistema de gradient y blur del `InlineBottomSheet` es muy sofisticado y requiere una migración cuidadosa para mantener los efectos visuales. La clave está en crear un `backgroundComponent` custom que preserve todas las funcionalidades mientras se integra perfectamente con @gorhom/bottom-sheet.



