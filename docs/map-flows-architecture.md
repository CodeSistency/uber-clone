## Arquitectura de Flujos Multistep con Mapa Persistente

### Objetivo
Estandarizar la implementación de flujos multistep para cliente y conductor manteniendo el mapa siempre visible, con un BottomSheet que intercambia contenidos por paso. La solución debe ser escalable, desacoplada, fácil de mantener y reemplazable.

### Principios
- Mapa persistente en toda la pantalla.
- BottomSheet como contenedor de pasos (UI de cada step independiente).
- Orquestación de estado/step centralizada en un store (Zustand).
- Hooks para acciones del flujo y navegación programática por pasos.
- Componentización: cada paso en su propio archivo.
- Reutilizar `UIStore` si se requiere un BottomSheet global (esta versión usa uno local optimizado para flujos de ride).

### Piezas Clave
- `store/mapFlow/mapFlow.ts`: Store de orquestación del flujo con pasos, configuración de BottomSheet y tipo de interacción del mapa.
- `hooks/useMapFlow.ts`: Hook para operar el flujo (start, next, back, goTo, reset).
- `components/mapflow/MapFlowWrapper.tsx`: Wrapper que renderiza el `Map` y el `BottomSheet`, e inyecta el contenido del step actual.
- `components/mapflow/steps/*`: Pasos independientes de UI: TravelStart, SetLocations, ConfirmOrigin, ChooseService, ChooseDriver, Summary.
- `app/(root)/map-flows-demo.tsx`: Pantalla de demo para probar el flujo completo y su navegación.

### Diseño del Store
```ts
type MapFlowStep = 'idle' | 'travel_start' | 'set_locations' | 'confirm_origin' | 'choose_service' | 'choose_driver' | 'summary';

interface StepConfig {
  bottomSheet: { visible: boolean; minHeight: number; maxHeight: number; initialHeight: number; showHandle?: boolean };
  mapInteraction?: 'none' | 'pan_to_confirm' | 'follow_driver' | 'follow_route';
}
```

- El store contiene `step`, `history`, banderas y tamaños derivados del BottomSheet para el step activo, y acciones: `start`, `stop`, `reset`, `goTo`, `next`, `back`.
- `stepConfig` mapea cada step a su configuración de UI y comportamiento de mapa. Esto permite ajustar alturas/snap points por step sin tocar los componentes.

### Wrapper del Flujo
`MapFlowWrapper` mantiene el mapa visible y controla un `BottomSheet` local. Recibe un callback `renderStep(step)` para renderizar el contenido según el step actual. El mapa puede ser parametrizado (p.ej., `serviceType`) y el wrapper se puede reutilizar para conductor/cliente.

### Hooks
`useMapFlow` provee una API mínima para mover el flujo sin acoplar a componentes específicos. Esto facilita probar y reemplazar pasos.

### Integración con Mapas y UI Existente
- Se reutiliza `components/Map.tsx` como capa de visualización principal (marcadores, rutas, etc.).
- Para centrar/ajustar el mapa según altura del BottomSheet, se puede combinar con `hooks/useMapCenter` si se requiere ajustar deltas por step.
- Si se quiere usar el sistema global de BottomSheets (`useUIStore`), el wrapper podría delegar a `showBottomSheet` y `updateBottomSheet`. En esta primera versión, usar uno local reduce acoplamiento y rendimiento es más predecible en flujos de ride.

### Flujo Ejemplo (Cliente)
1. `travel_start`: CTA "Viajar". Al presionar, pasa a `set_locations`.
2. `set_locations`: Formularios/buscadores de origen/destino (o selección en mapa). Continúa a `confirm_origin`.
3. `confirm_origin`: Mapa en modo `pan_to_confirm` para ajustar el pin. CTA confirma → `choose_service`.
4. `choose_service`: Lista de servicios (tarifas/ETA). Selección → `choose_driver`.
5. `choose_driver`: Lista de conductores cercanos/estimaciones. Continuar → `summary`.
6. `summary`: Resumen y finalizar → `reset` o navegación a "viaje activo".

### Extensión al Flujo de Conductor
- Cambiar `role` en `MapFlowWrapper` y ajustar `stepConfig` (p.ej., pasos `accept_request`, `arriving`, `arrived`, `in_progress`, `complete`). El store permite agregar steps y su configuración sin reescribir el wrapper.

### Navegación y Rutas
- El mapa permanece siempre visible; los cambios se dan en el BottomSheet.
- Para saltar a vistas dedicadas (p.ej., chat, recibo), usar `router.push` en acciones de steps.

### Buenas Prácticas
- Mantener cada step atómico y enfocado en una acción del usuario.
- Evitar lógica de negocio en el UI: delegar a servicios/stores (location, realtime, payments, etc.).
- Usar selectores de Zustand para evitar re-renders innecesarios.
- Centralizar tamaños del BottomSheet por step en `stepConfig`.

### Próximos Pasos
- Integrar Google Places/Autocompletes en `SetLocations`.
- Control de cámara del mapa por `mapInteraction` (p.ej., follow route/driver).
- Añadir validaciones y side-effects (crear solicitud, asignar conductor) conectando `realtimeStore` y `notificationStore`.


