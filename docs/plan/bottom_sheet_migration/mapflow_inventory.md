# Inventario Completo de Pasos MapFlow - Configuraciones de Bottom Sheet

## 📋 Resumen Ejecutivo

Este documento proporciona un inventario completo de todos los pasos del MapFlow que utilizan bottom sheet, incluyendo sus configuraciones específicas, alturas, comportamientos de gestos, y tipos de transición.

## 🎯 Categorización de Pasos

### **Pasos SIN Bottom Sheet (visible: false)**
- `idle` - Estado inactivo
- `CUSTOMER_TRANSPORT_CONFIRM_ORIGIN` - Confirmación de origen (sin sheet)
- `CUSTOMER_TRANSPORT_CONFIRM_DESTINATION` - Confirmación de destino (sin sheet)

### **Pasos CON Bottom Sheet (visible: true)**

## 📊 Inventario Detallado por Categoría

### **1. Pasos de Inicio y Configuración**

#### **travel_start**
- **Alturas**: min: 140px, max: 420px, initial: 200px
- **Gestos**: handle: true, drag: true
- **Transición**: slide, 220ms
- **Mapa**: none

#### **set_locations**
- **Alturas**: min: 160px, max: 520px, initial: 320px
- **Gestos**: handle: true, drag: true
- **Transición**: slide, 220ms
- **Mapa**: none

#### **confirm_origin**
- **Alturas**: min: 100px, max: 260px, initial: 120px
- **Gestos**: handle: true, drag: **false** ⚠️
- **Transición**: fade, 180ms
- **Mapa**: pan_to_confirm

### **2. Pasos de Selección de Servicio**

#### **choose_service**
- **Alturas**: min: 200px, max: 560px, initial: 440px
- **Gestos**: handle: true, drag: true
- **Transición**: slide, 220ms
- **Mapa**: none

#### **SELECCION_SERVICIO**
- **Alturas**: min: 140px, max: 420px, initial: 200px
- **Gestos**: handle: true, drag: true
- **Transición**: slide, 220ms
- **Mapa**: none

### **3. Pasos de Selección de Conductor**

#### **choose_driver**
- **Alturas**: min: 160px, max: 520px, initial: 380px
- **Gestos**: handle: true, drag: true
- **Transición**: fade, 200ms
- **Mapa**: follow_route

#### **CUSTOMER_TRANSPORT_ELECCION_CONDUCTOR**
- **Alturas**: min: 160px, max: 520px, initial: 380px
- **Gestos**: handle: true, drag: true
- **Transición**: fade, 200ms
- **Mapa**: follow_route

### **4. Pasos de Búsqueda de Conductor**

#### **CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR** ⚠️ **CRÍTICO**
- **Alturas**: min: 300px, max: 700px, initial: 500px
- **Gestos**: handle: **false**, drag: **false** ⚠️
- **Transición**: fade, 200ms
- **Mapa**: none
- **Nota**: Paso sin handle ni drag - requiere atención especial

#### **CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION**
- **Alturas**: min: 140px, max: 360px, initial: 180px
- **Gestos**: handle: **false**, drag: **false** ⚠️
- **Transición**: fade, 200ms
- **Mapa**: none

### **5. Pasos de Confirmación**

#### **CUSTOMER_TRANSPORT_CONFIRMAR_CONDUCTOR**
- **Alturas**: min: 160px, max: 420px, initial: 240px
- **Gestos**: handle: true, drag: true
- **Transición**: fade, 200ms
- **Mapa**: follow_route

#### **CUSTOMER_TRANSPORT_GESTION_CONFIRMACION**
- **Alturas**: min: 100px, max: 260px, initial: 120px
- **Gestos**: handle: true, drag: **false** ⚠️
- **Transición**: fade, 180ms
- **Mapa**: pan_to_confirm

### **6. Pasos de Viaje Activo**

#### **CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO**
- **Alturas**: min: 200px, max: 400px, initial: 300px
- **Gestos**: handle: **false**, drag: **false** ⚠️
- **Transición**: slide, 220ms
- **Mapa**: none

#### **CUSTOMER_TRANSPORT_VIAJE_EN_CURSO**
- **Alturas**: min: 180px, max: 350px, initial: 220px
- **Gestos**: handle: true, drag: true
- **Transición**: slide, 220ms
- **Mapa**: follow_route

### **7. Pasos de Finalización**

#### **summary**
- **Alturas**: min: 180px, max: 520px, initial: 320px
- **Gestos**: handle: true, drag: true
- **Transición**: slide, 220ms
- **Mapa**: follow_route

#### **CUSTOMER_TRANSPORT_DURANTE_FINALIZACION**
- **Alturas**: min: 180px, max: 520px, initial: 320px
- **Gestos**: handle: true, drag: true
- **Transición**: slide, 220ms
- **Mapa**: follow_route

### **8. Pasos de Conductor**

#### **DRIVER_DISPONIBILIDAD**
- **Alturas**: min: 120px, max: 360px, initial: 160px
- **Gestos**: handle: true, drag: true
- **Transición**: fade, 180ms
- **Mapa**: none

#### **DRIVER_FINALIZACION_RATING**
- **Alturas**: min: 260px, max: 640px, initial: 480px
- **Gestos**: handle: true, drag: **false** ⚠️
- **Transición**: slide, 220ms
- **Mapa**: none

## 🎯 Configuraciones Críticas Identificadas

### **1. Pasos SIN Handle (showHandle: false)**
- `CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR` ⚠️
- `CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION` ⚠️
- `CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO` ⚠️

### **2. Pasos SIN Drag (allowDrag: false)**
- `confirm_origin` ⚠️
- `CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR` ⚠️
- `CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION` ⚠️
- `CUSTOMER_TRANSPORT_GESTION_CONFIRMACION` ⚠️
- `CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO` ⚠️
- `DRIVER_FINALIZACION_RATING` ⚠️

### **3. Pasos SIN Bottom Sheet (visible: false)**
- `idle`
- `CUSTOMER_TRANSPORT_CONFIRM_ORIGIN`
- `CUSTOMER_TRANSPORT_CONFIRM_DESTINATION`

## 📏 Análisis de Alturas

### **Alturas Mínimas (minHeight)**
- **100px**: `confirm_origin`, `CUSTOMER_TRANSPORT_GESTION_CONFIRMACION`
- **120px**: `DRIVER_DISPONIBILIDAD`
- **140px**: `travel_start`, `SELECCION_SERVICIO`, `CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION`
- **160px**: `set_locations`, `choose_driver`, `CUSTOMER_TRANSPORT_DEFINICION_VIAJE`, `CUSTOMER_TRANSPORT_ELECCION_CONDUCTOR`, `CUSTOMER_TRANSPORT_CONFIRMAR_CONDUCTOR`
- **180px**: `summary`, `CUSTOMER_TRANSPORT_METODOLOGIA_PAGO`, `CUSTOMER_TRANSPORT_DURANTE_FINALIZACION`, `CUSTOMER_TRANSPORT_VIAJE_EN_CURSO`
- **200px**: `choose_service`, `CUSTOMER_TRANSPORT_SELECCION_VEHICULO`, `CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO`
- **260px**: `DRIVER_FINALIZACION_RATING`
- **300px**: `CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR` ⚠️

### **Alturas Máximas (maxHeight)**
- **260px**: `confirm_origin`, `CUSTOMER_TRANSPORT_GESTION_CONFIRMACION`
- **350px**: `CUSTOMER_TRANSPORT_VIAJE_EN_CURSO`
- **360px**: `DRIVER_DISPONIBILIDAD`, `CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION`
- **400px**: `CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO`
- **420px**: `travel_start`, `SELECCION_SERVICIO`, `CUSTOMER_TRANSPORT_CONFIRMAR_CONDUCTOR`
- **520px**: `set_locations`, `choose_driver`, `CUSTOMER_TRANSPORT_DEFINICION_VIAJE`, `CUSTOMER_TRANSPORT_ELECCION_CONDUCTOR`, `summary`, `CUSTOMER_TRANSPORT_METODOLOGIA_PAGO`, `CUSTOMER_TRANSPORT_DURANTE_FINALIZACION`
- **560px**: `choose_service`, `CUSTOMER_TRANSPORT_SELECCION_VEHICULO`
- **640px**: `DRIVER_FINALIZACION_RATING`
- **700px**: `CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR` ⚠️

### **Alturas Iniciales (initialHeight)**
- **120px**: `confirm_origin`, `CUSTOMER_TRANSPORT_GESTION_CONFIRMACION`
- **160px**: `DRIVER_DISPONIBILIDAD`
- **180px**: `CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION`
- **200px**: `travel_start`, `SELECCION_SERVICIO`
- **220px**: `CUSTOMER_TRANSPORT_VIAJE_EN_CURSO`
- **240px**: `CUSTOMER_TRANSPORT_CONFIRMAR_CONDUCTOR`
- **300px**: `CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO`
- **320px**: `set_locations`, `CUSTOMER_TRANSPORT_DEFINICION_VIAJE`, `summary`, `CUSTOMER_TRANSPORT_METODOLOGIA_PAGO`, `CUSTOMER_TRANSPORT_DURANTE_FINALIZACION`
- **380px**: `choose_driver`, `CUSTOMER_TRANSPORT_ELECCION_CONDUCTOR`
- **440px**: `choose_service`, `CUSTOMER_TRANSPORT_SELECCION_VEHICULO`
- **480px**: `DRIVER_FINALIZACION_RATING`
- **500px**: `CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR` ⚠️

## 🎭 Análisis de Transiciones

### **Tipos de Transición**
- **slide**: 8 pasos (220ms)
- **fade**: 12 pasos (180-200ms)
- **none**: 3 pasos (0ms)

### **Duración de Transiciones**
- **180ms**: `confirm_origin`, `CUSTOMER_TRANSPORT_GESTION_CONFIRMACION`, `DRIVER_DISPONIBILIDAD`
- **200ms**: `choose_driver`, `CUSTOMER_TRANSPORT_ELECCION_CONDUCTOR`, `CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR`, `CUSTOMER_TRANSPORT_CONFIRMAR_CONDUCTOR`, `CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION`
- **220ms**: `travel_start`, `set_locations`, `choose_service`, `summary`, `SELECCION_SERVICIO`, `CUSTOMER_TRANSPORT_DEFINICION_VIAJE`, `CUSTOMER_TRANSPORT_SELECCION_VEHICULO`, `CUSTOMER_TRANSPORT_METODOLOGIA_PAGO`, `CUSTOMER_TRANSPORT_DURANTE_FINALIZACION`, `CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO`, `DRIVER_FINALIZACION_RATING`

## 🗺️ Análisis de Interacciones con Mapa

### **Tipos de Interacción**
- **none**: 8 pasos
- **pan_to_confirm**: 3 pasos
- **follow_route**: 6 pasos
- **follow_driver**: 0 pasos (no implementado)

## 📊 Estadísticas Generales

- **Total de pasos**: 25
- **Pasos con bottom sheet**: 22
- **Pasos sin bottom sheet**: 3
- **Pasos sin handle**: 3
- **Pasos sin drag**: 6
- **Pasos críticos**: 3 (sin handle y sin drag)

## 🎯 Pasos Críticos para Migración

### **1. CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR** ⚠️ **MÁS CRÍTICO**
- Sin handle, sin drag, altura muy grande (700px)
- Requiere atención especial en la migración

### **2. CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION**
- Sin handle, sin drag
- Altura moderada (360px)

### **3. CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO**
- Sin handle, sin drag
- Altura moderada (400px)

## 🚀 Implicaciones para la Migración

### **1. Configuraciones Especiales**
- Mapear correctamente `showHandle: false` a `handleComponent: null`
- Mapear correctamente `allowDrag: false` a `enableHandlePanningGesture: false` + `enableContentPanningGesture: false`

### **2. Alturas Específicas**
- Convertir pixels a porcentajes manteniendo proporciones
- Preservar ratios de altura (min/initial/max)

### **3. Transiciones**
- Mapear `slide` y `fade` a configuraciones de animación apropiadas
- Preservar duraciones específicas

### **4. Interacciones con Mapa**
- Mantener compatibilidad con `pan_to_confirm` y `follow_route`
- Preservar comportamiento de `none`

## 📝 Conclusión

El MapFlow tiene un sistema muy sofisticado de configuraciones de bottom sheet que requiere una migración cuidadosa. Los pasos críticos identificados necesitan atención especial para mantener el comportamiento exacto, especialmente los pasos sin handle y sin drag.



