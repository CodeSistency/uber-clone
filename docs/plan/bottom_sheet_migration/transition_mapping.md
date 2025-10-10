# Mapeo de Transiciones - MapFlow Bottom Sheet

## 🎭 Resumen Ejecutivo

Este documento analiza y mapea todas las transiciones del MapFlow para asegurar compatibilidad con @gorhom/bottom-sheet. Se identifican los tipos de transición, duraciones, y patrones de uso para crear un mapeo preciso.

## 📊 Análisis de Transiciones por Tipo

### **1. Transiciones SLIDE (8 pasos)**

#### **Características**
- **Duración**: 220ms (consistente)
- **Comportamiento**: Deslizamiento vertical del bottom sheet
- **Uso**: Cambios de estado principales, selecciones importantes

#### **Pasos con SLIDE**
```typescript
// Pasos con transición SLIDE (220ms)
travel_start: { type: "slide", duration: 220 }
set_locations: { type: "slide", duration: 220 }
choose_service: { type: "slide", duration: 220 }
summary: { type: "slide", duration: 220 }
SELECCION_SERVICIO: { type: "slide", duration: 220 }
CUSTOMER_TRANSPORT_DEFINICION_VIAJE: { type: "slide", duration: 220 }
CUSTOMER_TRANSPORT_SELECCION_VEHICULO: { type: "slide", duration: 220 }
CUSTOMER_TRANSPORT_METODOLOGIA_PAGO: { type: "slide", duration: 220 }
CUSTOMER_TRANSPORT_DURANTE_FINALIZACION: { type: "slide", duration: 220 }
CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO: { type: "slide", duration: 220 }
DRIVER_FINALIZACION_RATING: { type: "slide", duration: 220 }
```

#### **Patrón de Uso SLIDE**
- **Inicio de flujo**: `travel_start`, `set_locations`
- **Selección de servicios**: `choose_service`, `SELECCION_SERVICIO`
- **Selección de vehículo**: `CUSTOMER_TRANSPORT_SELECCION_VEHICULO`
- **Configuración de pago**: `CUSTOMER_TRANSPORT_METODOLOGIA_PAGO`
- **Finalización**: `summary`, `CUSTOMER_TRANSPORT_DURANTE_FINALIZACION`
- **Notificaciones importantes**: `CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO`
- **Rating**: `DRIVER_FINALIZACION_RATING`

### **2. Transiciones FADE (12 pasos)**

#### **Características**
- **Duración**: 180ms (3 pasos) / 200ms (9 pasos)
- **Comportamiento**: Desvanecimiento/aparición del bottom sheet
- **Uso**: Cambios de estado sutiles, confirmaciones, estados de espera

#### **Pasos con FADE (180ms)**
```typescript
// Pasos con transición FADE (180ms)
confirm_origin: { type: "fade", duration: 180 }
CUSTOMER_TRANSPORT_GESTION_CONFIRMACION: { type: "fade", duration: 180 }
DRIVER_DISPONIBILIDAD: { type: "fade", duration: 180 }
```

#### **Pasos con FADE (200ms)**
```typescript
// Pasos con transición FADE (200ms)
choose_driver: { type: "fade", duration: 200 }
CUSTOMER_TRANSPORT_ELECCION_CONDUCTOR: { type: "fade", duration: 200 }
CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR: { type: "fade", duration: 200 }
CUSTOMER_TRANSPORT_CONFIRMAR_CONDUCTOR: { type: "fade", duration: 200 }
CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION: { type: "fade", duration: 200 }
CUSTOMER_TRANSPORT_VIAJE_EN_CURSO: { type: "fade", duration: 200 }
```

#### **Patrón de Uso FADE**
- **Confirmaciones**: `confirm_origin`, `CUSTOMER_TRANSPORT_GESTION_CONFIRMACION`
- **Selección de conductor**: `choose_driver`, `CUSTOMER_TRANSPORT_ELECCION_CONDUCTOR`
- **Estados de espera**: `CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR`, `CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION`
- **Estados activos**: `CUSTOMER_TRANSPORT_VIAJE_EN_CURSO`
- **Conductor**: `DRIVER_DISPONIBILIDAD`

### **3. Transiciones NONE (3 pasos)**

#### **Características**
- **Duración**: 0ms
- **Comportamiento**: Sin transición, cambio instantáneo
- **Uso**: Estados inactivos, cambios de contexto

#### **Pasos con NONE**
```typescript
// Pasos con transición NONE (0ms)
idle: { type: "none", duration: 0 }
CUSTOMER_TRANSPORT_CONFIRM_ORIGIN: { type: "none", duration: 0 }
CUSTOMER_TRANSPORT_CONFIRM_DESTINATION: { type: "none", duration: 0 }
```

#### **Patrón de Uso NONE**
- **Estado inactivo**: `idle`
- **Confirmaciones sin sheet**: `CUSTOMER_TRANSPORT_CONFIRM_ORIGIN`, `CUSTOMER_TRANSPORT_CONFIRM_DESTINATION`

## 🎯 Análisis de Duración de Transiciones

### **Distribución de Duraciones**
- **0ms**: 3 pasos (12%)
- **180ms**: 3 pasos (12%)
- **200ms**: 9 pasos (36%)
- **220ms**: 10 pasos (40%)

### **Patrones de Duración**

#### **180ms - Transiciones Rápidas**
- **Uso**: Confirmaciones críticas
- **Pasos**: `confirm_origin`, `CUSTOMER_TRANSPORT_GESTION_CONFIRMACION`, `DRIVER_DISPONIBILIDAD`
- **Características**: Respuesta rápida, feedback inmediato

#### **200ms - Transiciones Estándar**
- **Uso**: Cambios de estado normales
- **Pasos**: Selección de conductor, estados de espera, viaje activo
- **Características**: Balance entre velocidad y suavidad

#### **220ms - Transiciones Suaves**
- **Uso**: Cambios de estado importantes
- **Pasos**: Inicio de flujo, selección de servicios, finalización
- **Características**: Transición suave, experiencia premium

## 🔄 Mapeo a @gorhom/bottom-sheet

### **1. Transiciones SLIDE**

#### **Mapeo a @gorhom/bottom-sheet**
```typescript
// InlineBottomSheet
transition: { type: "slide", duration: 220 }

// @gorhom/bottom-sheet
<BottomSheet
  animationConfigs={{
    duration: 220,
    easing: Easing.out(Easing.cubic),
  }}
  // ... otras props
>
```

#### **Implementación**
```typescript
const getSlideAnimation = (duration: number) => ({
  duration,
  easing: Easing.out(Easing.cubic),
});

const GorhomMapFlowBottomSheet = ({ transition, ...props }) => {
  if (transition?.type === 'slide') {
    return (
      <BottomSheet
        animationConfigs={{
          ...getSlideAnimation(transition.duration),
        }}
        // ... otras props
      >
        {/* contenido */}
      </BottomSheet>
    );
  }
};
```

### **2. Transiciones FADE**

#### **Mapeo a @gorhom/bottom-sheet**
```typescript
// InlineBottomSheet
transition: { type: "fade", duration: 200 }

// @gorhom/bottom-sheet
<BottomSheet
  animationConfigs={{
    duration: 200,
    easing: Easing.inOut(Easing.ease),
  }}
  // ... otras props
>
```

#### **Implementación**
```typescript
const getFadeAnimation = (duration: number) => ({
  duration,
  easing: Easing.inOut(Easing.ease),
});

const GorhomMapFlowBottomSheet = ({ transition, ...props }) => {
  if (transition?.type === 'fade') {
    return (
      <BottomSheet
        animationConfigs={{
          ...getFadeAnimation(transition.duration),
        }}
        // ... otras props
      >
        {/* contenido */}
      </BottomSheet>
    );
  }
};
```

### **3. Transiciones NONE**

#### **Mapeo a @gorhom/bottom-sheet**
```typescript
// InlineBottomSheet
transition: { type: "none", duration: 0 }

// @gorhom/bottom-sheet
<BottomSheet
  animationConfigs={{
    duration: 0,
    easing: Easing.linear,
  }}
  // ... otras props
>
```

#### **Implementación**
```typescript
const getNoneAnimation = () => ({
  duration: 0,
  easing: Easing.linear,
});

const GorhomMapFlowBottomSheet = ({ transition, ...props }) => {
  if (transition?.type === 'none') {
    return (
      <BottomSheet
        animationConfigs={{
          ...getNoneAnimation(),
        }}
        // ... otras props
      >
        {/* contenido */}
      </BottomSheet>
    );
  }
};
```

## 🎨 Configuración de Animaciones por Tipo

### **1. Función de Mapeo de Transiciones**
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

### **2. Configuración de Animaciones por Paso**
```typescript
const getAnimationConfig = (step: MapFlowStep) => {
  const stepConfig = DEFAULT_CONFIG[step];
  const { transition } = stepConfig;
  
  return mapTransitionToGorhom(transition);
};
```

### **3. Configuración Especial por Duración**
```typescript
const getSpecialAnimationConfig = (duration: number) => {
  if (duration === 180) {
    // Transiciones rápidas - confirmaciones críticas
    return {
      duration: 180,
      easing: Easing.out(Easing.quad),
    };
  } else if (duration === 200) {
    // Transiciones estándar - cambios normales
    return {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    };
  } else if (duration === 220) {
    // Transiciones suaves - cambios importantes
    return {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    };
  } else {
    // Transición por defecto
    return {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    };
  }
};
```

## 📊 Análisis de Patrones de Transición

### **1. Patrones por Categoría de Paso**

#### **Inicio de Flujo**
- **Transición**: SLIDE (220ms)
- **Pasos**: `travel_start`, `set_locations`
- **Razón**: Cambio importante de estado, experiencia suave

#### **Selección de Servicios**
- **Transición**: SLIDE (220ms)
- **Pasos**: `choose_service`, `SELECCION_SERVICIO`
- **Razón**: Selección importante, experiencia premium

#### **Selección de Conductor**
- **Transición**: FADE (200ms)
- **Pasos**: `choose_driver`, `CUSTOMER_TRANSPORT_ELECCION_CONDUCTOR`
- **Razón**: Cambio de estado, no tan crítico

#### **Estados de Espera**
- **Transición**: FADE (200ms)
- **Pasos**: `CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR`, `CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION`
- **Razón**: Cambio sutil, no interrumpir experiencia

#### **Confirmaciones**
- **Transición**: FADE (180ms)
- **Pasos**: `confirm_origin`, `CUSTOMER_TRANSPORT_GESTION_CONFIRMACION`
- **Razón**: Respuesta rápida, feedback inmediato

#### **Finalización**
- **Transición**: SLIDE (220ms)
- **Pasos**: `summary`, `CUSTOMER_TRANSPORT_DURANTE_FINALIZACION`
- **Razón**: Cambio importante, experiencia suave

### **2. Patrones por Duración**

#### **180ms - Respuesta Rápida**
- **Uso**: Confirmaciones críticas
- **Características**: Feedback inmediato, respuesta rápida
- **Easing**: `Easing.out(Easing.quad)` - Aceleración rápida

#### **200ms - Balance Estándar**
- **Uso**: Cambios de estado normales
- **Características**: Balance entre velocidad y suavidad
- **Easing**: `Easing.inOut(Easing.ease)` - Suave y equilibrado

#### **220ms - Experiencia Premium**
- **Uso**: Cambios importantes de estado
- **Características**: Transición suave, experiencia premium
- **Easing**: `Easing.out(Easing.cubic)` - Suave y elegante

## 🔧 Implementación de Transiciones

### **1. Hook para Transiciones**
```typescript
const useMapFlowTransition = (step: MapFlowStep) => {
  const stepConfig = useMapFlowStore(state => state.steps[step]);
  const { transition } = stepConfig;
  
  const animationConfig = useMemo(() => {
    return mapTransitionToGorhom(transition);
  }, [transition]);
  
  return animationConfig;
};
```

### **2. Componente con Transiciones**
```typescript
const GorhomMapFlowBottomSheet = ({ step, ...props }) => {
  const animationConfig = useMapFlowTransition(step);
  
  return (
    <BottomSheet
      animationConfigs={animationConfig}
      // ... otras props
    >
      {/* contenido */}
    </BottomSheet>
  );
};
```

### **3. Configuración Dinámica**
```typescript
const getDynamicAnimationConfig = (step: MapFlowStep, customDuration?: number) => {
  const stepConfig = DEFAULT_CONFIG[step];
  const { transition } = stepConfig;
  
  const duration = customDuration || transition.duration;
  
  return mapTransitionToGorhom({
    type: transition.type,
    duration,
  });
};
```

## 📈 Métricas de Transiciones

- **Total de pasos**: 25
- **Pasos con SLIDE**: 10 (40%)
- **Pasos con FADE**: 12 (48%)
- **Pasos con NONE**: 3 (12%)
- **Duración promedio**: 196ms
- **Duración más común**: 220ms (40%)
- **Duración más rápida**: 180ms (12%)
- **Duración más lenta**: 220ms (40%)

## 🎯 Plan de Testing para Transiciones

### **1. Testing de Transiciones SLIDE**
- Verificar que la transición sea suave y vertical
- Verificar que la duración sea exacta (220ms)
- Verificar que el easing sea apropiado

### **2. Testing de Transiciones FADE**
- Verificar que la transición sea sutil y elegante
- Verificar que la duración sea exacta (180ms/200ms)
- Verificar que el easing sea apropiado

### **3. Testing de Transiciones NONE**
- Verificar que no haya transición
- Verificar que el cambio sea instantáneo
- Verificar que no haya interferencia visual

### **4. Testing de Duraciones Específicas**
- Verificar que 180ms sea rápido pero suave
- Verificar que 200ms sea equilibrado
- Verificar que 220ms sea suave y elegante

## 📝 Conclusión

Las transiciones del MapFlow son muy específicas y requieren un mapeo cuidadoso a @gorhom/bottom-sheet. Especial atención debe darse a las duraciones exactas y los tipos de easing para mantener la experiencia de usuario. La clave está en mapear correctamente cada tipo de transición a las capacidades de @gorhom/bottom-sheet mientras se preserva la funcionalidad exacta.



