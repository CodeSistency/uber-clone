# Guía de Debug para BottomSheet con Botón Flotante

## Logs Agregados para Identificar el Problema

He agregado logs detallados en todos los puntos críticos del flujo para identificar exactamente dónde está el problema. Aquí está qué buscar en la consola:

## 1. Logs de Estado del Componente (UnifiedFlowWrapper)

### 🔄 COMPONENT RENDER - State
```javascript
[BottomSheetDiagnostics][UnifiedFlowWrapper] Flow State: {
  step: "SELECCION_SERVICIO",
  bottomSheetVisible: true,
  bottomSheetMinHeight: 140,
  bottomSheetMaxHeight: 420,
  bottomSheetInitialHeight: 200,
  shouldUsePagerView: false,
  pagerSteps: 0,
  canClose: true
}
```

### 🔍 VISIBILITY CALCULATION
```javascript
[BottomSheetDiagnostics][UnifiedFlowWrapper] Visibility State: {
  flowBottomSheetVisible: true,
  bottomSheetClosed: false,
  canClose: true,
  sheetVisible: true,
  step: "SELECCION_SERVICIO",
  isActive: true
}
```

## 2. Logs de Cierre del BottomSheet

### ❌ handleBottomSheetClose CALLED
```javascript
[BottomSheetDiagnostics][UnifiedFlowWrapper] BottomSheet close attempt {
  canClose: true,
  allowDrag: true,
  allowClose: true,
  currentStep: "SELECCION_SERVICIO",
  bottomSheetVisible: true,
}
```

```javascript
[BottomSheetDiagnostics][UnifiedFlowWrapper] BottomSheet close attempt -> closing allowed, updating local closed state
```

## 3. Logs de Reapertura del BottomSheet

### ✅ handleReopenBottomSheet CALLED
```javascript
[BottomSheetDiagnostics][UnifiedFlowWrapper] Reopening BottomSheet {
  bottomSheetClosed: true,
  showFloatingButton: true,
  step: "SELECCION_SERVICIO"
}
```

### ✅ handleReopenBottomSheet - SETTING STATE / CALLING updateStepBottomSheet
```javascript
[UnifiedFlowWrapper] ✅ handleReopenBottomSheet - SETTING STATE
[UnifiedFlowWrapper] ✅ handleReopenBottomSheet - CALLING updateStepBottomSheet
```

## 4. Logs del Componente GorhomMapFlowBottomSheet

### 🏗️ COMPONENT MOUNT/UPDATE
```javascript
[BottomSheetDiagnostics][GorhomMapFlowBottomSheet] Sheet Config: {
  visible: true,
  step: "SELECCION_SERVICIO",
  index: 0,
  finalIndex: 0,
  enableHandlePanningGesture: true,
  enableContentPanningGesture: true,
  hasHandleComponent: true,
  allowDrag: true
}
```

## 5. Logs del Botón Flotante

### 👆 BUTTON PRESSED (al tocar el botón flotante)
```
FloatingReopenButton onPress (sin logs adicionales)
```

## 🎨 Logs de Renderizado

### RENDER DECISION
```javascript
[UnifiedFlowWrapper] 🎨 RENDER DECISION: {
  sheetVisible: true,
  willRenderBottomSheet: true,
  canClose: true,
  bottomSheetClosed: false,
  showFloatingButton: false
}
```

## 🔍 Cómo Identificar el Problema

### Problema 1: BottomSheet no se puede cerrar
**Buscar en logs:**
- `canClose: false` en VISIBILITY CALCULATION
- `allowDrag: false` o `allowClose: false` en COMPONENT RENDER
- No aparece `handleBottomSheetClose CALLED`

**Solución:** Verificar configuración del step en el flow

### Problema 2: Botón flotante no aparece al cerrar
**Buscar en logs:**
- `handleBottomSheetClose CALLED` aparece
- `canShowButton: false` en handleBottomSheetClose
- `SETTING STATE` no aparece

**Solución:** El step no permite cerrar (allowDrag/allowClose = false)

### Problema 3: Botón flotante aparece pero no funciona
**Buscar en logs:**
- `BUTTON PRESSED` aparece
- `handleReopenBottomSheet CALLED` aparece
- `SETTING STATE` aparece
- `CALLING updateStepBottomSheet` aparece
- Pero BottomSheet no se reabre

**Solución:** Problema en `updateStepBottomSheet` del flow

### Problema 4: BottomSheet se cierra automáticamente
**Buscar en logs:**
- `sheetVisible` cambia de `true` a `false` sin intervención del usuario
- `bottomSheetClosed` cambia a `true` inesperadamente

**Solución:** Hay una llamada accidental a `handleBottomSheetClose`

## 🧪 Pasos para Testear

1. **Abrir consola del navegador/dispositivo**
2. **Navegar al demo unificado**
3. **Buscar logs con prefijos `[BottomSheetDiagnostics]` y `[PagerDiagnostics]`**
4. **Intentar cerrar el BottomSheet** y observar la secuencia de logs
5. **Verificar que aparezca el botón flotante**
6. **Tocar el botón flotante** y observar la reapertura

## 📊 Secuencia Esperada de Logs

### Al cerrar BottomSheet:
```
🔄 COMPONENT RENDER - State: {...}
🔍 VISIBILITY CALCULATION: {...}
❌ BottomSheet Diagnostics logs indicating close attempt
🎨 RENDER DECISION: RENDERING BottomSheet {...}
```

### Al tocar botón flotante:
```
👆 BUTTON PRESSED
✅ BottomSheet Diagnostics logs showing reopening
🔄 COMPONENT RENDER - State: {...}
🔍 VISIBILITY CALCULATION: {...}
🎨 RENDER DECISION: RENDERING BottomSheet {...}
🎈 COMPONENT: { visible: false, ... }
🎬 ANIMATION EFFECT: { willAnimate: "FADE_OUT", ... }
```

## 🔧 Comandos Útiles para Debug

```javascript
// Ver estado actual del flow
console.log('Current Flow State:', useMapFlowStore.getState());

// Ver estado del componente
console.log('Component State:', {
  showFloatingButton,
  bottomSheetClosed,
  canClose
});
```

## 📝 Checklist de Verificación

- [ ] `canClose` es `true` cuando debe permitir cerrar
- [ ] `handleBottomSheetClose` se llama al cerrar
- [ ] `showFloatingButton` se pone en `true` al cerrar
- [ ] `FloatingReopenButton` recibe `visible: true`
- [ ] `BUTTON PRESSED` aparece al tocar el botón
- [ ] `handleReopenBottomSheet` se llama correctamente
- [ ] `updateStepBottomSheet` se ejecuta
- [ ] BottomSheet se reabre después de tocar el botón

¡Con estos logs detallados podrás identificar exactamente dónde está el problema!
