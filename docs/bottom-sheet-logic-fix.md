# Corrección de la Lógica del BottomSheet

## Problema Identificado

El usuario reportó que cuando cierra el BottomSheet:
1. **Aparece el contenido** en un parpadeo
2. **Se abre automáticamente** el BottomSheet otra vez
3. **Desaparece** el botón flotante

## Causa del Problema

El issue estaba en la lógica de control de visibilidad que no respetaba correctamente las props `allowDrag` y `allowClose`.

### Lógica Anterior (Problemática)
```typescript
// ❌ Problemático
const sheetVisible = flow.bottomSheetVisible && !bottomSheetClosed;

// El BottomSheet se podía cerrar independientemente de allowDrag/allowClose
// Causaba parpadeo porque el estado se reseteaba automáticamente
```

## Solución Implementada

### 1. Lógica de Control Mejorada

```typescript
// ✅ Corregido
const canClose = flow.bottomSheetAllowDrag && flow.flow.bottomSheetAllowClose;
const sheetVisible = flow.bottomSheetVisible && (!bottomSheetClosed || !canClose);
```

### 2. Control Condicional del Cierre

```typescript
// Solo permitir cerrar si ambas condiciones son true
const handleBottomSheetClose = useCallback(() => {
  if (flow.bottomSheetAllowDrag && flow.flow.bottomSheetAllowClose) {
    setBottomSheetClosed(true);
    setShowFloatingButton(true);
  }
}, [flow.bottomSheetAllowDrag, flow.flow.bottomSheetAllowClose]);
```

### 3. Props Condicionales del BottomSheet

```typescript
<GorhomMapFlowBottomSheet
  allowDrag={canClose}           // Solo si se puede cerrar
  allowClose={canClose}          // Solo si se puede cerrar
  onClose={canClose ? handleBottomSheetClose : undefined}  // Solo si se puede cerrar
/>
```

## Comportamiento por Configuración

### Caso 1: `allowDrag = true` y `allowClose = true`
- ✅ **BottomSheet se puede cerrar**
- ✅ **Aparece botón flotante** al cerrar
- ✅ **Se puede reabrir** con el botón flotante

### Caso 2: `allowDrag = false` o `allowClose = false`
- ❌ **BottomSheet NO se puede cerrar**
- ❌ **NO aparece botón flotante**
- ❌ **NO se puede cerrar** (comportamiento forzado)

## Flujo de Estados

```
Estado Inicial
    ↓
BottomSheet Visible
    ↓
¿allowDrag && allowClose?
    ↓                    ↓
   SÍ                    NO
    ↓                    ↓
Se puede cerrar      NO se puede cerrar
    ↓                    ↓
Usuario cierra        BottomSheet permanece
    ↓                    visible
Aparece botón flotante
    ↓
Usuario toca botón
    ↓
BottomSheet se reabre
```

## Logs de Debug Agregados

```typescript
console.log('[UnifiedFlowWrapper] BottomSheet Visibility State:', {
  flowBottomSheetVisible: flow.bottomSheetVisible,
  bottomSheetClosed,
  canClose,
  sheetVisible,
  allowDrag: flow.bottomSheetAllowDrag,
  allowClose: flow.flow.bottomSheetAllowClose,
  showFloatingButton,
  step: flow.step,
  isActive: flow.isActive
});
```

## Beneficios de la Corrección

1. **Elimina el parpadeo**: El contenido no aparece brevemente
2. **Respeta la configuración**: Solo se puede cerrar si está permitido
3. **Comportamiento consistente**: El botón flotante solo aparece cuando es apropiado
4. **Mejor UX**: No hay comportamientos inesperados

## Casos de Uso por Step

### Steps que NO permiten cerrar (allowDrag = false, allowClose = false)
- `confirm_origin`: Usuario debe confirmar origen
- `confirm_destination`: Usuario debe confirmar destino
- Pasos críticos del flujo

### Steps que SÍ permiten cerrar (allowDrag = true, allowClose = true)
- `choose_service`: Selección de servicio
- `choose_driver`: Selección de conductor
- Pasos informativos

## Testing

Para probar la funcionalidad:

1. **Navegar al demo unificado**
2. **Verificar logs** en consola para ver el estado
3. **Intentar cerrar** en diferentes steps
4. **Verificar** que el botón flotante aparece solo cuando corresponde

