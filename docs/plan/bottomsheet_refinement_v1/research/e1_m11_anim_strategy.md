# Estrategia de Animación (E1 · M1.1 · T1.1.2)

## Objetivo

Conseguir una transición suave del bottom sheet cuando las alturas configuradas cambian entre pasos del flujo, evitando saltos bruscos y preservando la sensación iOS-like.

## Decisiones principales

- **API de animación**: Mantener `Animated.spring` (RN core) aprovechando que ya está integrada en `InlineBottomSheet`. Reanimated 3 se considera opcional por ahora; evaluaremos adopción solo si se requieren interpolaciones avanzadas vinculadas a gestos complejos.
- **Origen y destino de altura**: Conservar la altura renderizada previa en un `useRef` (`previousHeightRef`) y animar desde ese valor hacia el nuevo `targetHeight` calculado a partir de `initialHeight` y límites (`minHeight`, `maxHeight`).
- **Detección de cambios**: Introducir un `useEffect` en `InlineBottomSheet` que observe `minHeight`, `maxHeight`, `initialHeight`, `visible` y `snapPoints`. Al detectar modificaciones, calcular el nuevo destino y llamar a `animateTo` en lugar de establecer la altura directamente.
- **Sincronización con MapFlow**:
  - `UnifiedFlowWrapper` seguirá enviando las props derivadas del store.
  - Añadiremos un identificador de step (`flow.step`) como dependencia para reiniciar animación cuando cambie de paso.
  - Se expondrá opcionalmente un callback (`onHeightTransitionStart/End`) para debug futuro, pero no es prioritario.
- **Prevención de flashes**:
  - Mientras se anima, mantener la altura actual en `Animated.Value`; no modificar estilos externos.
  - Evitar re-render innecesario del contenido forzando la animación antes de que nuevas props de children se monten (el efecto corre antes del render final gracias a useEffect tras commit).

## Pasos propuestos de implementación (T1.1.3)

1. Añadir refs `previousTargetHeightRef` y `targetHeightRef` en `InlineBottomSheet`.
2. Crear helper `computeTargetHeight` que normalice `initialHeight` dentro de `[minHeight, maxHeight]` y, si existen `snapPoints`, busque el más cercano.
3. En `useEffect`, comparar `targetHeightRef.current` con nuevo target y, si difiere ±2 px, llamar a `animateTo`.
4. Ajustar `animatedTo` para usar `Animated.spring` con parámetros `bounciness: 6`, `speed: 9` (tuning inicial); exponer estos valores como constantes para ajustes en T1.1.4.
5. Mantener compatibilidad cuando se usa `ref` externo (`useBottomSheet`): si `useHook` es true, delegar en `hookData.methods.goToHeight`.

## Consideraciones

- **Drag deshabilitado**: Cuando `allowDrag` cambia de false a true (o viceversa) no afecta la animación de altura; simplemente se actualizan los handlers como hasta ahora.
- **Sheets ocultos**: Para pasos invisibles (`visible = false`), se evita la animación y se resetea `previousHeightRef` al valor inicial cuando vuelven a mostrarse.
- **Compatibilidad**: No se introducen nuevas dependencias externas; solo cambios internos en `InlineBottomSheet` y, de ser necesario, un pequeño ajuste en `UnifiedFlowWrapper` para pasar `flow.step` en `key` o prop.

## Próximos pasos

- Implementar los cambios listados en el paso 1 (T1.1.3).
- Afina parámetros (T1.1.4) usando dispositivos iOS/Android reales.

## Implementación (T1.1.3)

- Se añadieron constantes `SPRING_BOUNCINESS` (6) y `SPRING_SPEED` (9) para mantener valores tuning centralizados.
- Nuevo helper `computeTargetHeight` garantiza que `initialHeight` caiga dentro de `[minHeight, maxHeight]` y usa el snap point más cercano cuando exista.
- `previousTargetHeightRef` retiene el último valor aplicado; un `useEffect` compara contra el nuevo target y dispara `Animated.spring` (o `hookData.methods.goToHeight` si se usa el hook) cuando detecta diferencia > 1 px.
- Cuando `visible` es false, el ref se resetea a `initialHeight` para evitar saltos en el próximo render.
- El spring usa `useNativeDriver: false` (heights animadas no soportan native driver) y mantiene la compatibilidad con el hook externo (`useBottomSheet`).
