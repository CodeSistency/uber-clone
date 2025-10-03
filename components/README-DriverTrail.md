# DriverTrail Component

## Descripción

Componente que dibuja un trazo neón amarillo persistente del recorrido del conductor en tiempo real.

## Características

- ✅ **Trazo neón amarillo** (#FFE014) con efecto glow
- ✅ **Actualización en tiempo real** desde WebSocket GPS
- ✅ **Throttling inteligente** por distancia y tiempo
- ✅ **Gestión automática de memoria** (máx 100 puntos)
- ✅ **Fade out progresivo** (30 segundos por defecto)
- ✅ **Performance optimizada** con cleanup automático

## Uso Básico

```tsx
import DriverTrail from "@/components/DriverTrail";

// Dentro de un componente MapView
<MapView>
  {/* Otros marcadores y elementos */}

  {/* Trazo del conductor */}
  <DriverTrail
    driverId="driver_123"
    maxPoints={100}
    fadeTime={30000} // 30 segundos
    color="#FFE014"
    width={4}
    opacity={0.8}
    minDistance={10} // metros
    minTimeInterval={2000} // ms
  />
</MapView>;
```

## Props

| Prop              | Tipo      | Default     | Descripción                        |
| ----------------- | --------- | ----------- | ---------------------------------- |
| `driverId`        | `string?` | -           | ID opcional del conductor          |
| `maxPoints`       | `number`  | `100`       | Máximo puntos en memoria           |
| `fadeTime`        | `number`  | `30000`     | Tiempo antes de fade out (ms)      |
| `color`           | `string`  | `'#FFE014'` | Color del trazo neón               |
| `width`           | `number`  | `4`         | Grosor de la línea                 |
| `opacity`         | `number`  | `0.8`       | Opacidad del trazo                 |
| `minDistance`     | `number`  | `10`        | Distancia mínima entre puntos (m)  |
| `minTimeInterval` | `number`  | `2000`      | Intervalo mínimo entre puntos (ms) |

## Integración

### Con MapViewWithBottomSheet

```tsx
<MapViewWithBottomSheet
  markers={markers}
  bottomSheetContent={<View>{/* Contenido del bottom sheet */}</View>}
>
  {/* Trazo del conductor integrado */}
  <DriverTrail />
</MapViewWithBottomSheet>
```

### Con Map Component Principal

```tsx
<Map serviceType="transport">
  {/* El DriverTrail se integra automáticamente */}
</Map>
```

## Sistema de Efectos Visuales

### Efecto Glow Triple

1. **Línea principal**: Color neón, ancho normal, opacidad completa
2. **Glow externo**: Más ancho, color neón, opacidad reducida
3. **Núcleo interno**: Más delgado, color neón, opacidad completa

### Gestión de Memoria

- **Límite automático**: Máx 100 puntos activos
- **Cleanup por tiempo**: Puntos > 30s se eliminan
- **Cleanup por precisión**: Puntos con baja precisión se eliminan si hay muchos
- **Throttling**: Solo puntos significativos se agregan

## Performance

### Optimizaciones Implementadas

- ✅ **useCallback** para funciones críticas
- ✅ **useRef** para throttling
- ✅ **useMemo** para cálculos costosos
- ✅ **Intervalos eficientes** (15s cleanup)
- ✅ **Logging condicional** (solo cada 10 puntos)

### Métricas Esperadas

- **Memoria**: < 50KB para 100 puntos
- **CPU**: < 5% impacto en navegación
- **Batería**: Mínimo impacto adicional

## Estados del Trazo

### Estados Visuales

- **Activo**: Línea neón continua
- **Fade out**: Opacidad decreciente
- **Cleanup**: Puntos eliminados automáticamente
- **Pausa**: Sin nuevos puntos (conductor parado)

### Estados de Performance

- **Normal**: < 50 puntos, actualización fluida
- **Optimizado**: 50-80 puntos, throttling activo
- **Cleanup**: > 80 puntos, eliminación automática
- **Crítico**: > 100 puntos, limpieza forzada

## Debugging

### Logs Disponibles

```bash
[DriverTrail] Adding first trail point
[DriverTrail] Trail updated. Points: 25
[DriverTrail] Cleaned up 15 points. Remaining: 85
[DriverTrail] Memory cleanup: kept 100 recent points
```

### Troubleshooting

- **No aparece trazo**: Verificar `driverLocation` en store
- **Trazo intermitente**: Revisar throttling (distancia/tiempo)
- **Performance baja**: Verificar límites de memoria
- **Trazo no se borra**: Revisar configuración de `fadeTime`

## Próximas Mejoras Planeadas

### Fase 2: Route Prediction Integration

- ✅ **Predicción visual** de trayectoria futura
- ✅ **Líneas punteadas** para predicciones
- ✅ **Confianza de predicción** por colores

### Fase 3: Advanced Animations

- ✅ **Animaciones de entrada/salida**
- ✅ **Transiciones smooth** entre estados
- ✅ **Efectos de velocidad** (más glow si va rápido)

### Fase 4: Social Features

- ✅ **Trazo compartible** con pasajeros
- ✅ **Historial de rutas** guardado
- ✅ **Estadísticas de viaje** por trazo
