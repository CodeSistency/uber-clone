# Notas de Gestos (E1 · M1.2 · T1.2.3)

## Estado actual

- `PanResponder` habilita drag cuando `Math.abs(g.dy) > 6` y `allowDrag`
  - Este umbral puede ser elevado para pulsaciones cortas al intentar expandir ligeramente el sheet.
- `hookData.scrollEnabled` limita el drag cuando se usa `useBottomSheet` externo.
- Al liberar el gesto, ajusta al snap point más cercano entre `[min, mid, max, snapPoints...]`.

## Observaciones

- En pasos con `allowDrag: false`, el handle queda deshabilitado (nuevo feedback visual) pero PanResponder aún se crea.
- No hay diferenciación entre arrastres ascendentes/descendentes suaves (todo se decide por magnitud de `dy`).
- Considerar `hitSlop` agregado: el área es más grande, por lo que podríamos reducir `dy` mínimo.

## Próximas acciones (T1.2.3)

1. Reducir umbral a ~3-4 px para mejorar sensibilidad.
2. Agregar tolerancia angular (evitar que scroll vertical pequeño de contenido active drag).
3. Evaluar migración a `react-native-gesture-handler` (PanGesture) si se requiere.
4. Determinar comportamiento cuando `allowDrag` cambia dinámicamente (limpiar handlers).

## Evaluación de react-native-gesture-handler

- Se revisó `react-native-gesture-handler` (PanGestureHandler) y su integración con Expo SDK 53.
- Requiere configuración adicional (wrapping con GestureHandlerRootView y ajustes en Navigation) que ya usamos en otras secciones pero incrementa complejidad aquí.
- Dado que el flujo actual funciona con `PanResponder` y los ajustes de umbral reducen falsos positivos, se decidió **posponer la migración** hasta que se requiera sincronización más avanzada con animaciones Reanimated.
