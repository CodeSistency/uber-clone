# Plan de Implementación - Migración a @gorhom/bottom-sheet

## 🎯 Resumen Ejecutivo

Este documento define el plan detallado de implementación para la migración del InlineBottomSheet custom a @gorhom/bottom-sheet. Se establece el cronograma, tareas específicas, y criterios de éxito para cada fase.

## 📅 Cronograma General

### **Duración Total: 8-10 días**
- **Fase 1**: Preparación (1-2 días)
- **Fase 2**: Implementación Core (2-3 días)
- **Fase 3**: Integración (1-2 días)
- **Fase 4**: Testing y Optimización (2-3 días)

## 🎯 Fase 1: Preparación (Días 1-2)

### **Objetivos**
- Crear estructura de archivos
- Implementar hooks básicos
- Crear componentes de background
- Crear componentes de footer
- Implementar mapeo de configuraciones

### **Tareas Específicas**

#### **Día 1: Estructura y Hooks Básicos**

##### **T1.1.1: Crear Estructura de Archivos**
- [ ] Crear `components/ui/GorhomMapFlowBottomSheet.tsx`
- [ ] Crear `components/ui/MapFlowBackground.tsx`
- [ ] Crear `components/ui/MapFlowFooter.tsx`
- [ ] Crear `components/ui/MapFlowHandle.tsx`
- [ ] Crear `components/ui/MapFlowContent.tsx`

##### **T1.1.2: Implementar Hooks Básicos**
- [ ] Crear `hooks/useMapFlowBottomSheet.ts`
- [ ] Crear `hooks/useMapFlowAnimatedValues.ts`
- [ ] Crear `hooks/useMapFlowScrollControl.ts`
- [ ] Crear `hooks/useMapFlowSnapPoints.ts`
- [ ] Crear `hooks/useMapFlowAnimationConfig.ts`

##### **T1.1.3: Crear Utilidades**
- [ ] Crear `utils/mapFlowMapper.ts`
- [ ] Crear `utils/snapPointsCalculator.ts`
- [ ] Crear `utils/transitionMapper.ts`

##### **T1.1.4: Crear Tipos**
- [ ] Crear `types/MapFlowBottomSheet.ts`
- [ ] Crear `types/MapFlowHooks.ts`
- [ ] Crear `types/MapFlowUtils.ts`

#### **Día 2: Componentes de Background y Footer**

##### **T1.2.1: Implementar Hooks de Background**
- [ ] Crear `hooks/useMapFlowBackground.ts`
- [ ] Implementar lógica de gradient
- [ ] Implementar lógica de blur
- [ ] Implementar interpolaciones

##### **T1.2.2: Implementar Hooks de Footer**
- [ ] Crear `hooks/useMapFlowFooter.ts`
- [ ] Implementar lógica de footer animado
- [ ] Implementar interpolaciones de footer

##### **T1.2.3: Crear Componentes de Background**
- [ ] Implementar `GradientBackground`
- [ ] Implementar `BlurBackground`
- [ ] Implementar `MapFlowBackground`

##### **T1.2.4: Crear Componentes de Footer**
- [ ] Implementar `MapFlowFooter`
- [ ] Implementar animaciones de footer
- [ ] Implementar visibilidad de footer

### **Entregables Fase 1**
- Estructura de archivos completa
- Hooks básicos implementados
- Componentes de background funcionando
- Componentes de footer funcionando
- Utilidades de mapeo implementadas

### **Criterios de Éxito**
- [ ] Todos los archivos creados
- [ ] Hooks básicos funcionando
- [ ] Componentes de background renderizando
- [ ] Componentes de footer renderizando
- [ ] Utilidades de mapeo funcionando

## 🎯 Fase 2: Implementación Core (Días 3-5)

### **Objetivos**
- Implementar `GorhomMapFlowBottomSheet`
- Implementar mapeo de props
- Implementar mapeo de transiciones
- Implementar mapeo de gestos
- Implementar mapeo de alturas

### **Tareas Específicas**

#### **Día 3: Componente Principal**

##### **T2.1.1: Implementar GorhomMapFlowBottomSheet**
- [ ] Crear interface de props
- [ ] Implementar componente principal
- [ ] Implementar mapeo de props básicas
- [ ] Implementar mapeo de visibilidad
- [ ] Implementar mapeo de snap points

##### **T2.1.2: Implementar Mapeo de Gestos**
- [ ] Implementar mapeo de `allowDrag`
- [ ] Implementar mapeo de `showHandle`
- [ ] Implementar control de scroll
- [ ] Implementar control de panning

##### **T2.1.3: Implementar Mapeo de Transiciones**
- [ ] Implementar mapeo de transiciones SLIDE
- [ ] Implementar mapeo de transiciones FADE
- [ ] Implementar mapeo de transiciones NONE
- [ ] Implementar mapeo de duraciones

#### **Día 4: Configuraciones Críticas**

##### **T2.2.1: Implementar Pasos SIN Handle**
- [ ] Implementar `CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR`
- [ ] Implementar `CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION`
- [ ] Implementar `CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO`
- [ ] Verificar funcionamiento

##### **T2.2.2: Implementar Pasos SIN Drag**
- [ ] Implementar `confirm_origin`
- [ ] Implementar `CUSTOMER_TRANSPORT_GESTION_CONFIRMACION`
- [ ] Implementar `DRIVER_FINALIZACION_RATING`
- [ ] Verificar funcionamiento

##### **T2.2.3: Implementar Pasos SIN Bottom Sheet**
- [ ] Implementar `idle`
- [ ] Implementar `CUSTOMER_TRANSPORT_CONFIRM_ORIGIN`
- [ ] Implementar `CUSTOMER_TRANSPORT_CONFIRM_DESTINATION`
- [ ] Verificar funcionamiento

#### **Día 5: Alturas y Snap Points**

##### **T2.3.1: Implementar Cálculo de Snap Points**
- [ ] Implementar conversión de pixels a porcentajes
- [ ] Implementar cálculo de snap points dinámicos
- [ ] Implementar eliminación de duplicados
- [ ] Implementar ordenamiento

##### **T2.3.2: Implementar Mapeo de Alturas**
- [ ] Implementar mapeo de alturas pequeñas (100-120px)
- [ ] Implementar mapeo de alturas moderadas (140-200px)
- [ ] Implementar mapeo de alturas grandes (300-500px)
- [ ] Implementar mapeo de alturas muy grandes (500-700px)

##### **T2.3.3: Implementar Configuraciones Especiales**
- [ ] Implementar configuración especial para `CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR`
- [ ] Implementar configuración especial para `confirm_origin`
- [ ] Implementar configuración especial para `DRIVER_FINALIZACION_RATING`
- [ ] Verificar funcionamiento

### **Entregables Fase 2**
- Componente principal funcionando
- Mapeo de props implementado
- Mapeo de transiciones implementado
- Mapeo de gestos implementado
- Mapeo de alturas implementado
- Configuraciones críticas funcionando

### **Criterios de Éxito**
- [ ] Componente principal renderizando
- [ ] Mapeo de props funcionando
- [ ] Mapeo de transiciones funcionando
- [ ] Mapeo de gestos funcionando
- [ ] Mapeo de alturas funcionando
- [ ] Configuraciones críticas funcionando

## 🎯 Fase 3: Integración (Días 6-7)

### **Objetivos**
- Integrar en `MapFlowWrapper`
- Integrar en `UnifiedFlowWrapper`
- Reemplazar `InlineBottomSheet`
- Verificar funcionalidad

### **Tareas Específicas**

#### **Día 6: Integración con MapFlowWrapper**

##### **T3.1.1: Modificar MapFlowWrapper**
- [ ] Importar `GorhomMapFlowBottomSheet`
- [ ] Reemplazar `InlineBottomSheet`
- [ ] Mantener props existentes
- [ ] Verificar funcionalidad

##### **T3.1.2: Verificar Configuraciones**
- [ ] Verificar paso `travel_start`
- [ ] Verificar paso `set_locations`
- [ ] Verificar paso `confirm_origin`
- [ ] Verificar paso `choose_service`
- [ ] Verificar paso `choose_driver`
- [ ] Verificar paso `summary`

##### **T3.1.3: Verificar Transiciones**
- [ ] Verificar transiciones SLIDE
- [ ] Verificar transiciones FADE
- [ ] Verificar transiciones NONE
- [ ] Verificar duraciones específicas

#### **Día 7: Integración con UnifiedFlowWrapper**

##### **T3.2.1: Modificar UnifiedFlowWrapper**
- [ ] Importar `GorhomMapFlowBottomSheet`
- [ ] Reemplazar `InlineBottomSheet`
- [ ] Mantener props existentes
- [ ] Verificar funcionalidad

##### **T3.2.2: Verificar Configuraciones Críticas**
- [ ] Verificar `CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR`
- [ ] Verificar `CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION`
- [ ] Verificar `CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO`
- [ ] Verificar `CUSTOMER_TRANSPORT_GESTION_CONFIRMACION`
- [ ] Verificar `DRIVER_FINALIZACION_RATING`

##### **T3.2.3: Verificar Funcionalidad Completa**
- [ ] Verificar navegación entre pasos
- [ ] Verificar transiciones entre pasos
- [ ] Verificar configuraciones dinámicas
- [ ] Verificar comportamiento de gestos

### **Entregables Fase 3**
- Integración con MapFlowWrapper completa
- Integración con UnifiedFlowWrapper completa
- Funcionalidad preservada
- Sin regresiones

### **Criterios de Éxito**
- [ ] MapFlowWrapper funcionando
- [ ] UnifiedFlowWrapper funcionando
- [ ] Funcionalidad preservada
- [ ] Sin regresiones
- [ ] Navegación funcionando
- [ ] Transiciones funcionando

## 🎯 Fase 4: Testing y Optimización (Días 8-10)

### **Objetivos**
- Testing de configuraciones críticas
- Testing de transiciones
- Testing de backgrounds
- Testing de footer
- Optimización de performance
- Documentación

### **Tareas Específicas**

#### **Día 8: Testing de Configuraciones Críticas**

##### **T4.1.1: Testing de Pasos SIN Handle**
- [ ] Testing de `CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR`
- [ ] Testing de `CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION`
- [ ] Testing de `CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO`
- [ ] Verificar que no aparezca handle

##### **T4.1.2: Testing de Pasos SIN Drag**
- [ ] Testing de `confirm_origin`
- [ ] Testing de `CUSTOMER_TRANSPORT_GESTION_CONFIRMACION`
- [ ] Testing de `DRIVER_FINALIZACION_RATING`
- [ ] Verificar que no se pueda arrastrar

##### **T4.1.3: Testing de Pasos SIN Bottom Sheet**
- [ ] Testing de `idle`
- [ ] Testing de `CUSTOMER_TRANSPORT_CONFIRM_ORIGIN`
- [ ] Testing de `CUSTOMER_TRANSPORT_CONFIRM_DESTINATION`
- [ ] Verificar que no aparezca bottom sheet

#### **Día 9: Testing de Transiciones y Backgrounds**

##### **T4.2.1: Testing de Transiciones**
- [ ] Testing de transiciones SLIDE (220ms)
- [ ] Testing de transiciones FADE (180ms/200ms)
- [ ] Testing de transiciones NONE (0ms)
- [ ] Verificar duraciones específicas

##### **T4.2.2: Testing de Backgrounds**
- [ ] Testing de gradient backgrounds
- [ ] Testing de blur backgrounds
- [ ] Testing de backgrounds por defecto
- [ ] Verificar interpolaciones

##### **T4.2.3: Testing de Footer**
- [ ] Testing de footer animado
- [ ] Testing de interpolaciones de footer
- [ ] Testing de visibilidad de footer
- [ ] Verificar animaciones

#### **Día 10: Optimización y Documentación**

##### **T4.3.1: Optimización de Performance**
- [ ] Optimizar renderizado
- [ ] Optimizar animaciones
- [ ] Optimizar memoria
- [ ] Verificar FPS

##### **T4.3.2: Documentación**
- [ ] Documentar cambios realizados
- [ ] Documentar nueva API
- [ ] Documentar ejemplos de uso
- [ ] Actualizar README

##### **T4.3.3: Testing Final**
- [ ] Testing de integración completo
- [ ] Testing de regresiones
- [ ] Testing de performance
- [ ] Verificar funcionalidad completa

### **Entregables Fase 4**
- Testing completo implementado
- Performance optimizada
- Documentación actualizada
- Funcionalidad verificada

### **Criterios de Éxito**
- [ ] Testing completo
- [ ] Performance optimizada
- [ ] Documentación actualizada
- [ ] Funcionalidad verificada
- [ ] Sin regresiones
- [ ] FPS > 60

## 📊 Métricas de Éxito

### **1. Métricas de Funcionalidad**
- **Configuraciones mapeadas**: 100%
- **Transiciones preservadas**: 100%
- **Backgrounds funcionando**: 100%
- **Footer animado funcionando**: 100%
- **Gestos funcionando**: 100%

### **2. Métricas de Performance**
- **Tiempo de renderizado**: < 16ms
- **Memoria utilizada**: < 50MB
- **FPS**: > 60fps
- **Tiempo de transición**: < 220ms

### **3. Métricas de Calidad**
- **Cobertura de testing**: > 90%
- **Documentación**: 100%
- **Compatibilidad**: 100%
- **Regresiones**: 0

## 🎯 Plan de Rollback

### **1. Estrategia de Rollback**
- Mantener `InlineBottomSheet` como fallback
- Implementar feature flag para alternar entre implementaciones
- Documentar proceso de rollback

### **2. Implementación de Feature Flag**
```typescript
const useGorhomBottomSheet = process.env.EXPO_PUBLIC_USE_GORHOM_BOTTOM_SHEET === 'true';

const BottomSheetComponent = useGorhomBottomSheet 
  ? GorhomMapFlowBottomSheet 
  : InlineBottomSheet;
```

### **3. Proceso de Rollback**
1. Cambiar feature flag a `false`
2. Verificar que `InlineBottomSheet` funciona
3. Investigar problemas con `GorhomMapFlowBottomSheet`
4. Corregir problemas
5. Volver a cambiar feature flag a `true`

## 📝 Conclusión

El plan de implementación está diseñado para ser gradual, seguro y transparente. Se mantiene la compatibilidad completa mientras se aprovechan las capacidades avanzadas de @gorhom/bottom-sheet. El cronograma es realista y permite rollback en caso de problemas.



