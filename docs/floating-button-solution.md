# Solución del Botón Flotante para BottomSheet

## Problema Identificado
Cuando el `BottomSheet` se cierra en `UnifiedFlowWrapper`, no había forma de reabrirlo porque:
1. El estado `visible` se mantenía en `false`
2. No existía un mecanismo para cambiar el estado de vuelta a `true`
3. El usuario quedaba "atrapado" sin acceso al contenido del BottomSheet

## Solución Implementada

### 1. Componente FloatingReopenButton
- **Ubicación**: `components/ui/FloatingReopenButton.tsx`
- **Características**:
  - Botón circular con icono de flecha hacia arriba
  - Animación fade-in/fade-out suave
  - Posicionamiento en esquina inferior derecha
  - Sombra y efectos visuales modernos
  - Configurable (tamaño, color, posición, icono)

### 2. Estado de Control en UnifiedFlowWrapper
- **Nuevos estados**:
  - `showFloatingButton`: Controla la visibilidad del botón flotante
  - `bottomSheetClosed`: Indica si el BottomSheet fue cerrado manualmente

### 3. Lógica de Cierre y Reapertura
```typescript
// Detectar cierre del BottomSheet
const handleBottomSheetClose = useCallback(() => {
  setBottomSheetClosed(true);
  setShowFloatingButton(true);
}, []);

// Reabrir BottomSheet
const handleReopenBottomSheet = useCallback(() => {
  setBottomSheetClosed(false);
  setShowFloatingButton(false);
  flow.updateStepBottomSheet(flow.step, { visible: true });
}, [flow]);
```

### 4. Control de Visibilidad Inteligente
```typescript
// El BottomSheet solo se muestra si:
// 1. El flow dice que debe ser visible
// 2. Y no fue cerrado manualmente
const sheetVisible = flow.bottomSheetVisible && !bottomSheetClosed;
```

## Flujo de Funcionamiento

### Estado Inicial
1. BottomSheet visible según configuración del step
2. Botón flotante oculto
3. Usuario puede interactuar normalmente

### Cuando se Cierra el BottomSheet
1. Usuario desliza hacia abajo o toca fuera del BottomSheet
2. Se ejecuta `handleBottomSheetClose()`
3. Se establece `bottomSheetClosed = true`
4. Se establece `showFloatingButton = true`
5. Aparece el botón flotante con animación fade-in

### Cuando se Presiona el Botón Flotante
1. Usuario toca el botón flotante
2. Se ejecuta `handleReopenBottomSheet()`
3. Se establece `bottomSheetClosed = false`
4. Se establece `showFloatingButton = false`
5. Se actualiza la configuración del step para hacer visible el BottomSheet
6. El botón flotante desaparece con animación fade-out

### Reset Automático
- Si el flow cambia de step y el BottomSheet debe ser visible, se resetea automáticamente el estado
- Esto evita que el botón flotante aparezca cuando no debería

## Características Técnicas

### Animaciones
- **Fade In**: 300ms con spring animation para el scale
- **Fade Out**: 300ms con timing animation
- **Spring Effect**: Tension 100, friction 8 para efecto natural

### Posicionamiento
- **Por defecto**: Esquina inferior derecha (bottom-right)
- **Configurable**: bottom-left, top-right, top-left
- **Z-index**: 1000 para estar por encima de otros elementos

### Accesibilidad
- **TouchableOpacity**: Feedback táctil nativo
- **activeOpacity**: 0.8 para feedback visual
- **Tamaño mínimo**: 56px (estándar de Material Design)

## Archivos Modificados

1. **`components/ui/FloatingReopenButton.tsx`** (NUEVO)
   - Componente del botón flotante con animaciones

2. **`components/unified-flow/UnifiedFlowWrapper.tsx`** (MODIFICADO)
   - Agregado estado para control del botón flotante
   - Agregadas funciones de manejo de cierre/reapertura
   - Integrado el botón flotante en el render

3. **`app/(customer)/floating-button-demo.tsx`** (NUEVO)
   - Página de demo para probar la funcionalidad

## Beneficios de la Solución

1. **UX Mejorada**: El usuario nunca queda "atrapado" sin acceso al contenido
2. **No Invasiva**: El botón solo aparece cuando es necesario
3. **Intuitiva**: Icono de flecha hacia arriba indica claramente la acción
4. **Animada**: Transiciones suaves que no interrumpen el flujo
5. **Configurable**: Fácil de personalizar para diferentes casos de uso
6. **Robusta**: Maneja correctamente los cambios de estado del flow

## Casos de Uso

- **Transport**: Cuando el usuario cierra el BottomSheet durante la selección de conductor
- **Delivery**: Cuando se cierra durante la selección de restaurante
- **Mandado**: Cuando se cierra durante la configuración del mandado
- **Envío**: Cuando se cierra durante la configuración del paquete

## Próximos Pasos

1. **Testing**: Probar en diferentes dispositivos y orientaciones
2. **Personalización**: Permitir diferentes iconos según el contexto
3. **Analytics**: Trackear cuándo se usa el botón flotante
4. **A11y**: Agregar soporte para lectores de pantalla
5. **Haptic Feedback**: Vibración al tocar el botón en dispositivos compatibles

