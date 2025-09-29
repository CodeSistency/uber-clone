# Auditoría de Bottom Sheet (E1 · M1.1 · T1.1.1)

## Fuentes revisadas
- `store/mapFlow/mapFlow.ts`
- `hooks/useMapFlow.ts`
- `components/unified-flow/UnifiedFlowWrapper.tsx`
- `components/ui/InlineBottomSheet.tsx`

## Configuración actual por paso (extracto)
- **CUSTOMER_TRANSPORT_DEFINICION_VIAJE** → min 160, max 520, initial 320, drag habilitado.
- **CUSTOMER_TRANSPORT_CONFIRM_ORIGIN/DESTINATION** → sheet oculto (min/max 0), interacciones de mapa activas.
- **CUSTOMER_TRANSPORT_SELECCION_VEHICULO** → min 200, max 560, initial 440 (salto alto desde confirmación).
- **CUSTOMER_TRANSPORT_METODOLOGIA_PAGO** → min 180, max 520, initial 320.
- **CUSTOMER_TRANSPORT_BUSCANDO_CONDUCTOR** → min 120, max 280, initial 150 (drag deshabilitado, handle oculto).
- **CUSTOMER_TRANSPORT_CONFIRMAR_CONDUCTOR** → min 160, max 420, initial 240.
- **CUSTOMER_TRANSPORT_ESPERANDO_ACEPTACION** → min 140, max 360, initial 180; drag deshabilitado.
- **CUSTOMER_TRANSPORT_DURANTE_FINALIZACION** → min 180, max 520, initial 320.
- **CUSTOMER_TRANSPORT_CONDUCTOR_LLEGO** → min 200, max 400, initial 300; drag off.
- **CUSTOMER_TRANSPORT_VIAJE_EN_CURSO** → min 180, max 350, initial 220 (follow_driver).
- **CUSTOMER_TRANSPORT_VIAJE_COMPLETADO** → min 200, max 600, initial 400; drag off.
- **CUSTOMER_DELIVERY_ARMADO_PEDIDO / CHECKOUT_CONFIRMACION** → initial 600, drag deshabilitado (full height).
- **CUSTOMER_DELIVERY_SEGUIMIENTO_DELIVERY** → min 120, max 300, initial 150 (follow_driver).

## Observaciones de transición
- Saltos notorios cuando se pasa de pasos ocultos (confirm origin/destination) a `SELECCION_VEHICULO` (0 → 440).
- Cambios abruptos entre estados compactos (`BUSCANDO_CONDUCTOR` 150) y expandidos (`GESTION_CONFIRMACION` 120 pero drag habilitado/posible). Se requiere animación suave.
- Varios pasos deshabilitan drag pero mantienen minHeight > 0, lo que puede sorprender al usuario al intentar arrastrar.

## Hooks y lógica relevante
- `useMapFlow` expone `startWithCustomerStep` y logs de estado (útiles para depurar transiciones).
- `UnifiedFlowWrapper` toma configuraciones del store y pasa props crudas a `InlineBottomSheet` sin animación adicional.
- `InlineBottomSheet` usa `Animated.spring` pero setea height directamente al nuevo valor; no hay interpolación entre props cambiantes.

## Próximos pasos (para T1.1.2)
1. Definir estrategia para detectar cambios de altura desde `UnifiedFlowWrapper` o dentro de `InlineBottomSheet` (effect comparando previousHeight vs nextHeight).
2. Evaluar mantener historial de altura previa en store para iniciar animaciones desde el valor real mostrado.
3. Considerar Reanimated v3 si se requiere sincronización avanzada con gestures.
