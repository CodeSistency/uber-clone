# Análisis de Configuraciones Críticas - MapFlow Bottom Sheet

## 🚨 Resumen Ejecutivo

Este documento identifica y analiza las configuraciones críticas del MapFlow que requieren atención especial durante la migración a @gorhom/bottom-sheet. Estas configuraciones son críticas porque difieren del comportamiento estándar y podrían causar problemas si no se manejan correctamente.

## ⚠️ Configuraciones Críticas Identificadas

### **1. Pasos SIN Handle (showHandle: false)**

#### **CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR** 🔴 **MÁS CRÍTICO**
```typescript
bottomSheet: {
  visible: true,
  minHeight: 300,        // 38% de pantalla
  maxHeight: 700,        // 88% de pantalla  
  initialHeight: 500,     // 63% de pantalla
  showHandle: false,     // ⚠️ SIN HANDLE
  allowDrag: false,      // ⚠️ SIN DRAG
}
```
- **Propósito**: Pantalla de búsqueda de conductor
- **Comportamiento**: Sheet grande, fijo, sin interacción
- **Riesgo**: Alto - configuración muy específica

#### **CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION**
```typescript
bottomSheet: {
  visible: true,
  minHeight: 140,        // 18% de pantalla
  maxHeight: 360,        // 45% de pantalla
  initialHeight: 180,    // 23% de pantalla
  showHandle: false,     // ⚠️ SIN HANDLE
  allowDrag: false,      // ⚠️ SIN DRAG
}
```
- **Propósito**: Esperando respuesta del conductor
- **Comportamiento**: Sheet pequeño, fijo, informativo
- **Riesgo**: Medio - configuración moderada

#### **CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO**
```typescript
bottomSheet: {
  visible: true,
  minHeight: 200,        // 25% de pantalla
  maxHeight: 400,        // 50% de pantalla
  initialHeight: 300,    // 38% de pantalla
  showHandle: false,     // ⚠️ SIN HANDLE
  allowDrag: false,      // ⚠️ SIN DRAG
}
```
- **Propósito**: Notificación de llegada del conductor
- **Comportamiento**: Sheet medio, fijo, notificación
- **Riesgo**: Medio - configuración moderada

### **2. Pasos SIN Drag (allowDrag: false)**

#### **confirm_origin** 🔴 **CRÍTICO**
```typescript
bottomSheet: {
  visible: true,
  minHeight: 100,        // 13% de pantalla
  maxHeight: 260,        // 33% de pantalla
  initialHeight: 120,    // 15% de pantalla
  showHandle: true,      // ✅ CON HANDLE
  allowDrag: false,      // ⚠️ SIN DRAG
}
```
- **Propósito**: Confirmación de ubicación de origen
- **Comportamiento**: Sheet pequeño, handle visible, sin drag
- **Riesgo**: Alto - handle sin drag es inusual

#### **CUSTOMER_TRANSPORT_GESTION_CONFIRMACION**
```typescript
bottomSheet: {
  visible: true,
  minHeight: 100,        // 13% de pantalla
  maxHeight: 260,        // 33% de pantalla
  initialHeight: 120,    // 15% de pantalla
  showHandle: true,      // ✅ CON HANDLE
  allowDrag: false,      // ⚠️ SIN DRAG
}
```
- **Propósito**: Gestión de confirmación
- **Comportamiento**: Sheet pequeño, handle visible, sin drag
- **Riesgo**: Alto - handle sin drag es inusual

#### **DRIVER_FINALIZACION_RATING**
```typescript
bottomSheet: {
  visible: true,
  minHeight: 260,        // 33% de pantalla
  maxHeight: 640,        // 80% de pantalla
  initialHeight: 480,    // 60% de pantalla
  showHandle: true,      // ✅ CON HANDLE
  allowDrag: false,      // ⚠️ SIN DRAG
}
```
- **Propósito**: Rating del conductor
- **Comportamiento**: Sheet grande, handle visible, sin drag
- **Riesgo**: Medio - configuración moderada

### **3. Pasos SIN Bottom Sheet (visible: false)**

#### **idle**
```typescript
bottomSheet: {
  visible: false,        // ⚠️ SIN SHEET
  minHeight: 0,
  maxHeight: 0,
  initialHeight: 0,
  showHandle: false,
  allowDrag: true,
}
```
- **Propósito**: Estado inactivo
- **Comportamiento**: No hay bottom sheet
- **Riesgo**: Bajo - comportamiento estándar

#### **CUSTOMER_TRANSPORT_CONFIRM_ORIGIN**
```typescript
bottomSheet: {
  visible: false,        // ⚠️ SIN SHEET
  minHeight: 0,
  maxHeight: 0,
  initialHeight: 0,
  showHandle: false,
  allowDrag: false,
}
```
- **Propósito**: Confirmación de origen (sin sheet)
- **Comportamiento**: No hay bottom sheet
- **Riesgo**: Bajo - comportamiento estándar

#### **CUSTOMER_TRANSPORT_CONFIRM_DESTINATION**
```typescript
bottomSheet: {
  visible: false,        // ⚠️ SIN SHEET
  minHeight: 0,
  maxHeight: 0,
  initialHeight: 0,
  showHandle: false,
  allowDrag: false,
}
```
- **Propósito**: Confirmación de destino (sin sheet)
- **Comportamiento**: No hay bottom sheet
- **Riesgo**: Bajo - comportamiento estándar

## 🎯 Análisis de Riesgos por Configuración

### **🔴 RIESGO ALTO**

#### **1. Handle Visible + Sin Drag**
- **Pasos**: `confirm_origin`, `CUSTOMER_TRANSPORT_GESTION_CONFIRMACION`
- **Problema**: Handle visible pero no funcional
- **Solución**: Mapear a `handleComponent: null` o `enableHandlePanningGesture: false`

#### **2. Sin Handle + Sin Drag + Altura Grande**
- **Pasos**: `CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR`
- **Problema**: Configuración muy específica
- **Solución**: Configuración especial en @gorhom/bottom-sheet

### **🟡 RIESGO MEDIO**

#### **1. Sin Handle + Sin Drag + Altura Moderada**
- **Pasos**: `CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION`, `CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO`
- **Problema**: Configuración inusual pero manejable
- **Solución**: Mapeo directo a props de @gorhom/bottom-sheet

#### **2. Handle Visible + Sin Drag + Altura Grande**
- **Pasos**: `DRIVER_FINALIZACION_RATING`
- **Problema**: Handle visible pero no funcional
- **Solución**: Mapear correctamente las props

### **🟢 RIESGO BAJO**

#### **1. Sin Bottom Sheet**
- **Pasos**: `idle`, `CUSTOMER_TRANSPORT_CONFIRM_ORIGIN`, `CUSTOMER_TRANSPORT_CONFIRM_DESTINATION`
- **Problema**: Comportamiento estándar
- **Solución**: Mapear a `index: -1` (cerrado)

## 🔄 Estrategias de Migración por Configuración

### **1. Pasos SIN Handle (showHandle: false)**

#### **Mapeo a @gorhom/bottom-sheet**
```typescript
// InlineBottomSheet
showHandle: false

// @gorhom/bottom-sheet
handleComponent: null
// O
handleHeight: 0
```

#### **Implementación**
```typescript
const GorhomMapFlowBottomSheet = ({ showHandle, ...props }) => {
  return (
    <BottomSheet
      handleComponent={showHandle ? undefined : null}
      // ... otras props
    >
      {/* contenido */}
    </BottomSheet>
  );
};
```

### **2. Pasos SIN Drag (allowDrag: false)**

#### **Mapeo a @gorhom/bottom-sheet**
```typescript
// InlineBottomSheet
allowDrag: false

// @gorhom/bottom-sheet
enableHandlePanningGesture: false
enableContentPanningGesture: false
```

#### **Implementación**
```typescript
const GorhomMapFlowBottomSheet = ({ allowDrag, ...props }) => {
  return (
    <BottomSheet
      enableHandlePanningGesture={allowDrag}
      enableContentPanningGesture={allowDrag}
      // ... otras props
    >
      {/* contenido */}
    </BottomSheet>
  );
};
```

### **3. Pasos SIN Bottom Sheet (visible: false)**

#### **Mapeo a @gorhom/bottom-sheet**
```typescript
// InlineBottomSheet
visible: false

// @gorhom/bottom-sheet
index: -1  // Cerrado
```

#### **Implementación**
```typescript
const GorhomMapFlowBottomSheet = ({ visible, ...props }) => {
  if (!visible) return null;
  
  return (
    <BottomSheet
      index={0}  // Abierto
      // ... otras props
    >
      {/* contenido */}
    </BottomSheet>
  );
};
```

## 🎨 Configuraciones Especiales por Altura

### **1. Alturas Muy Pequeñas (100-120px)**
- **Pasos**: `confirm_origin`, `CUSTOMER_TRANSPORT_GESTION_CONFIRMACION`
- **Características**: Sheets informativos, sin drag
- **Mapeo**: `snapPoints: ["13%", "15%", "33%"]`

### **2. Alturas Moderadas (140-200px)**
- **Pasos**: `travel_start`, `SELECCION_SERVICIO`, `CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION`
- **Características**: Sheets de selección, con drag
- **Mapeo**: `snapPoints: ["18%", "25%", "53%"]`

### **3. Alturas Grandes (300-500px)**
- **Pasos**: `CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR`, `CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO`
- **Características**: Sheets informativos, sin drag
- **Mapeo**: `snapPoints: ["38%", "63%", "88%"]`

### **4. Alturas Muy Grandes (500-700px)**
- **Pasos**: `CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR`
- **Características**: Sheet de búsqueda, sin handle, sin drag
- **Mapeo**: `snapPoints: ["38%", "63%", "88%"]`

## 🔧 Implementación de Configuraciones Críticas

### **1. Función de Mapeo de Props**
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

### **2. Función de Cálculo de Snap Points**
```typescript
const calculateSnapPoints = (minHeight: number, initialHeight: number, maxHeight: number) => {
  const screenHeight = Dimensions.get('window').height;
  
  const minPercent = Math.round((minHeight / screenHeight) * 100);
  const initialPercent = Math.round((initialHeight / screenHeight) * 100);
  const maxPercent = Math.round((maxHeight / screenHeight) * 100);
  
  // Eliminar duplicados y ordenar
  const points = [minPercent, initialPercent, maxPercent]
    .filter((height, index, arr) => arr.indexOf(height) === index)
    .sort((a, b) => a - b);
  
  return points.map(point => `${point}%`);
};
```

### **3. Configuración Especial para Pasos Críticos**
```typescript
const getSpecialConfiguration = (step: MapFlowStep) => {
  const specialConfigs = {
    'CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR': {
      // Configuración especial para búsqueda de conductor
      enableOverDrag: false,
      enablePanDownToClose: false,
      backgroundStyle: {
        backgroundColor: 'rgba(0,0,0,0.8)',
      },
    },
    'confirm_origin': {
      // Configuración especial para confirmación
      enableOverDrag: false,
      enablePanDownToClose: false,
    },
    // ... más configuraciones especiales
  };
  
  return specialConfigs[step] || {};
};
```

## 📊 Métricas de Configuraciones Críticas

- **Total de pasos**: 25
- **Pasos críticos**: 9 (36%)
- **Pasos sin handle**: 3 (12%)
- **Pasos sin drag**: 6 (24%)
- **Pasos sin sheet**: 3 (12%)
- **Pasos con configuración especial**: 3 (12%)

## 🎯 Plan de Testing para Configuraciones Críticas

### **1. Testing de Pasos SIN Handle**
- Verificar que no aparezca handle visual
- Verificar que no se pueda arrastrar desde el área del handle
- Verificar que el contenido sea accesible

### **2. Testing de Pasos SIN Drag**
- Verificar que no se pueda arrastrar el sheet
- Verificar que el handle no sea funcional
- Verificar que el contenido sea accesible

### **3. Testing de Pasos SIN Sheet**
- Verificar que no aparezca bottom sheet
- Verificar que el mapa sea completamente visible
- Verificar que no haya interferencia visual

### **4. Testing de Alturas Específicas**
- Verificar que las alturas se respeten exactamente
- Verificar que los snap points funcionen correctamente
- Verificar que las transiciones sean suaves

## 📝 Conclusión

Las configuraciones críticas del MapFlow requieren una migración muy cuidadosa para mantener el comportamiento exacto. Especial atención debe darse a los pasos sin handle y sin drag, así como a las alturas específicas y las configuraciones especiales. La clave está en mapear correctamente estas configuraciones a las capacidades de @gorhom/bottom-sheet mientras se preserva la funcionalidad exacta.



