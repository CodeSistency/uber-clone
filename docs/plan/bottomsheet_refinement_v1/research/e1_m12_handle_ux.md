# Investigación UX: Drag Handle (E1 · M1.2 · T1.2.1)

## Referencias analizadas
- **Apple Maps / Apple Music**: manejar un grabber centrado, ancho ~36-40 px, altura ~5 px, utilize contraste suave y shadow sutil.
- **Material Design Bottom Sheet**: recomienda hit area vertical mínima de 24 px; el handle puede ser invisible pero accesible mientras la zona superior sea táctil.
- **Expo Bottom Sheet (gorhom)**: usa zona táctil expandida (padding vertical 16) y handle con radios grandes.

## Problemas actuales
- Grabber actual (`w-12 h-1.5`) y padding `pt-2 pb-1` → hitbox efectiva ~20 px; usuarios reportan dificultad para tomarlo.
- `allowDrag` false en varios pasos genera inconsistencia; aún así el grabber se renderiza cuando `showHandle` true, pero sin acción.
- Sin feedback visual al tocar/arrastrar (no hay highlight).

## Recomendaciones de diseño
1. **Ampliar área táctil**: envolver el handle en `TouchableWithoutFeedback` o aumentar padding vertical a ~12-14 px, y zona clicable 44 px (guideline Apple).
2. **Ajustar dimensiones**: usar ancho 36 px (`w-9`) y altura 4 px (`h-1`).
3. **Estilo**: color `bg-gray-400` con opacidad adaptativa dark/light, aplicar leve sombra o blur.
4. **Feedback**: cambiar opacidad cuando se active gesture (opcional con Animated values).
5. **Accesibilidad**: `accessibilityRole="adjustable"`, `accessibilityLabel="Deslizar para expandir"`.

## Implicaciones para próximos pasos
- T1.2.2: implementar wrapper con padding vertical + `hitSlop` generoso.
- T1.2.3: revisar PanResponder para alinearse con área táctil y evaluar migración a `react-native-gesture-handler` si se requiere.

## Implementación (avance)
- `InlineBottomSheet`: drag handle ahora está envuelto en `TouchableWithoutFeedback` con `hitSlop` generoso y padding vertical 12 px.
- Grabber redimensionado (`w-9 h-1`) para alinearse con patrones iOS.
- Accesibilidad mejorada (`accessibilityRole="adjustable"`, label descriptivo).
- Siguiente paso (T1.2.2): aplicar estilos visuales refinados (colores, shadow) y coordinación con estados de drag.

## Ajustes visuales implementados (T1.2.2)
- Handle ahora responde visualmente a `allowDrag` (opacidad y color reducidos cuando no está activo).
- Se añadió shadow sutil para mejorar contraste sobre fondos claros/oscuro.
- Mantuvimos tamaño recomendado (36px) y padding 12px asegurando hit-area mínima de 44px vertical.

Siguientes pasos: abordar `T1.2.3` para optimizar PanResponder y evaluar `react-native-gesture-handler`.
