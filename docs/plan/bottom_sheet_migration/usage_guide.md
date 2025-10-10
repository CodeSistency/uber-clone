# Guía de Uso - GorhomMapFlowBottomSheet

## 📋 **Resumen**

Esta guía explica cómo usar el nuevo componente `GorhomMapFlowBottomSheet` que reemplaza el `InlineBottomSheet` custom con la librería `@gorhom/bottom-sheet`.

## 🚀 **Instalación y Configuración**

### **1. Dependencias Requeridas**

```bash
npm install @gorhom/bottom-sheet
```

### **2. Configuración del Provider**

```tsx
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export default function App() {
  return (
    <BottomSheetModalProvider>
      {/* Tu aplicación */}
    </BottomSheetModalProvider>
  );
}
```

## 🎯 **Uso Básico**

### **1. Componente Principal**

```tsx
import GorhomMapFlowBottomSheet from '@/components/ui/GorhomMapFlowBottomSheet';

<GorhomMapFlowBottomSheet
  visible={true}
  minHeight={100}
  maxHeight={500}
  initialHeight={200}
  showHandle={true}
  allowDrag={true}
  onClose={() => console.log('Closed')}
>
  <Text>Contenido del bottom sheet</Text>
</GorhomMapFlowBottomSheet>
```

### **2. Con MapFlow**

```tsx
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';
import GorhomMapFlowBottomSheet from '@/components/ui/GorhomMapFlowBottomSheet';

const MyComponent = () => {
  const flow = useMapFlowStore(state => state.flow);
  
  return (
    <GorhomMapFlowBottomSheet
      visible={flow.bottomSheetVisible}
      minHeight={flow.bottomSheetMinHeight}
      maxHeight={flow.bottomSheetMaxHeight}
      initialHeight={flow.bottomSheetInitialHeight}
      showHandle={flow.bottomSheetShowHandle}
      allowDrag={flow.bottomSheetAllowDrag}
      step="CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR"
    >
      <Text>Contenido específico del paso</Text>
    </GorhomMapFlowBottomSheet>
  );
};
```

## 🔧 **Props Disponibles**

### **Props Básicas**

| Prop | Tipo | Descripción | Requerido |
|------|------|-------------|-----------|
| `visible` | `boolean` | Si el bottom sheet está visible | ✅ |
| `minHeight` | `number` | Altura mínima en píxeles | ✅ |
| `maxHeight` | `number` | Altura máxima en píxeles | ✅ |
| `initialHeight` | `number` | Altura inicial en píxeles | ✅ |
| `showHandle` | `boolean` | Mostrar handle de arrastre | ❌ |
| `allowDrag` | `boolean` | Permitir arrastre | ❌ |
| `onClose` | `() => void` | Callback al cerrar | ❌ |

### **Props de Configuración**

| Prop | Tipo | Descripción | Requerido |
|------|------|-------------|-----------|
| `step` | `MapFlowStep` | Paso del MapFlow | ❌ |
| `useGradient` | `boolean` | Usar gradiente de fondo | ❌ |
| `useBlur` | `boolean` | Usar efecto blur | ❌ |
| `bottomBar` | `ReactNode` | Barra inferior personalizada | ❌ |

### **Props de @gorhom/bottom-sheet**

| Prop | Tipo | Descripción | Requerido |
|------|------|-------------|-----------|
| `snapPoints` | `string[]` | Puntos de snap personalizados | ❌ |
| `enableOverDrag` | `boolean` | Permitir arrastre excesivo | ❌ |
| `enablePanDownToClose` | `boolean` | Cerrar al arrastrar hacia abajo | ❌ |

## 🎨 **Configuraciones Especiales**

### **1. Pasos Sin Handle**

```tsx
<GorhomMapFlowBottomSheet
  visible={true}
  minHeight={300}
  maxHeight={700}
  initialHeight={500}
  showHandle={false} // Sin handle
  allowDrag={false}  // Sin arrastre
  step="CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR"
>
  <Text>Buscando conductor...</Text>
</GorhomMapFlowBottomSheet>
```

### **2. Pasos Sin Bottom Sheet**

```tsx
<GorhomMapFlowBottomSheet
  visible={false} // No visible
  minHeight={100}
  maxHeight={500}
  initialHeight={200}
  step="idle"
>
  <Text>Este contenido no se mostrará</Text>
</GorhomMapFlowBottomSheet>
```

### **3. Con Gradiente y Blur**

```tsx
<GorhomMapFlowBottomSheet
  visible={true}
  minHeight={200}
  maxHeight={600}
  initialHeight={400}
  useGradient={true}
  useBlur={true}
  step="CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO"
>
  <Text>Conductor llegó</Text>
</GorhomMapFlowBottomSheet>
```

## 🔄 **Transiciones**

### **Tipos de Transición**

- **`slide`**: Transición deslizante (por defecto)
- **`fade`**: Transición de desvanecimiento
- **`none`**: Sin transición

### **Duraciones**

- **`180ms`**: Transición rápida
- **`200ms`**: Transición estándar
- **`220ms`**: Transición suave

### **Ejemplo de Transición**

```tsx
<GorhomMapFlowBottomSheet
  visible={true}
  minHeight={100}
  maxHeight={500}
  initialHeight={200}
  step="CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR" // Transición fade de 180ms
>
  <Text>Buscando conductor...</Text>
</GorhomMapFlowBottomSheet>
```

## 🎯 **Hooks Disponibles**

### **1. useMapFlowBottomSheet**

```tsx
import { useMapFlowBottomSheet } from '@/hooks/useMapFlowBottomSheet';

const MyComponent = () => {
  const {
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
  } = useMapFlowBottomSheet('CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR');
  
  return (
    <View>
      <Text>Altura actual: {getCurrentHeight()}</Text>
      <Text>¿Está expandido? {isExpanded ? 'Sí' : 'No'}</Text>
    </View>
  );
};
```

### **2. useMapFlowCriticalConfig**

```tsx
import { useMapFlowCriticalConfig } from '@/hooks/useMapFlowCriticalConfig';

const MyComponent = () => {
  const {
    isNoHandleStep,
    isNoDragStep,
    isNoBottomSheetStep,
    isSearchingDriverStep,
    isConfirmationStep,
    isRatingStep,
  } = useMapFlowCriticalConfig('CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR');
  
  return (
    <View>
      <Text>¿Sin handle? {isNoHandleStep ? 'Sí' : 'No'}</Text>
      <Text>¿Sin arrastre? {isNoDragStep ? 'Sí' : 'No'}</Text>
    </View>
  );
};
```

### **3. useMapFlowTransitions**

```tsx
import { useMapFlowTransitions } from '@/hooks/useMapFlowTransitions';

const MyComponent = () => {
  const {
    transitionType,
    transitionDuration,
    isSlideTransition,
    isFadeTransition,
    isNoneTransition,
    isQuickTransition,
    isStandardTransition,
    isSmoothTransition,
  } = useMapFlowTransitions('CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR');
  
  return (
    <View>
      <Text>Tipo: {transitionType}</Text>
      <Text>Duración: {transitionDuration}ms</Text>
    </View>
  );
};
```

## 🧪 **Testing**

### **1. Test del Componente**

```tsx
import { render, fireEvent } from '@testing-library/react-native';
import GorhomMapFlowBottomSheet from '@/components/ui/GorhomMapFlowBottomSheet';

describe('GorhomMapFlowBottomSheet', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <GorhomMapFlowBottomSheet
        visible={true}
        minHeight={100}
        maxHeight={500}
        initialHeight={200}
      >
        <Text>Test Content</Text>
      </GorhomMapFlowBottomSheet>
    );
    
    expect(getByText('Test Content')).toBeTruthy();
  });
});
```

### **2. Test de Hooks**

```tsx
import { renderHook } from '@testing-library/react-hooks';
import { useMapFlowCriticalConfig } from '@/hooks/useMapFlowCriticalConfig';

describe('useMapFlowCriticalConfig', () => {
  it('identifies no handle steps', () => {
    const { result } = renderHook(() => 
      useMapFlowCriticalConfig('CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR')
    );
    
    expect(result.current.isNoHandleStep).toBe(true);
  });
});
```

## 🚨 **Troubleshooting**

### **Problemas Comunes**

1. **Bottom sheet no se muestra**
   - Verificar que `visible={true}`
   - Verificar que `minHeight`, `maxHeight`, `initialHeight` sean válidos

2. **No se puede arrastrar**
   - Verificar que `allowDrag={true}`
   - Verificar que el paso no esté en la lista de pasos sin arrastre

3. **Handle no se muestra**
   - Verificar que `showHandle={true}`
   - Verificar que el paso no esté en la lista de pasos sin handle

4. **Transiciones no funcionan**
   - Verificar que el paso tenga configuración de transición
   - Verificar que la duración sea válida

### **Debug**

```tsx
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';

const DebugComponent = () => {
  const flow = useMapFlowStore(state => state.flow);
  
  console.log('MapFlow State:', {
    visible: flow.bottomSheetVisible,
    minHeight: flow.bottomSheetMinHeight,
    maxHeight: flow.bottomSheetMaxHeight,
    showHandle: flow.bottomSheetShowHandle,
    allowDrag: flow.bottomSheetAllowDrag,
  });
  
  return null;
};
```

## 📚 **Ejemplos Completos**

### **1. Demo Básico**

Ver `app/(customer)/unified-flow-demo-gorhom.tsx` para un ejemplo completo de uso.

### **2. Wrapper para MapFlow**

Ver `components/mapflow/MapFlowWrapperGorhom.tsx` para integración con MapFlow.

### **3. Wrapper para UnifiedFlow**

Ver `components/unified-flow/UnifiedFlowWrapperGorhom.tsx` para integración con UnifiedFlow.

## 🎉 **Conclusión**

El nuevo `GorhomMapFlowBottomSheet` proporciona:

- ✅ **Compatibilidad total** con el `InlineBottomSheet` existente
- ✅ **Mejor rendimiento** con `@gorhom/bottom-sheet`
- ✅ **Configuraciones críticas** para todos los pasos del MapFlow
- ✅ **Transiciones suaves** con diferentes tipos y duraciones
- ✅ **Hooks especializados** para control avanzado
- ✅ **Testing completo** con tests unitarios
- ✅ **Documentación detallada** para fácil uso

¡La migración está lista para usar! 🚀



