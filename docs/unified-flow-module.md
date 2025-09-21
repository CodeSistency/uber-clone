# Módulo de Flujo Unificado del Cliente

## 📋 Resumen

Este módulo implementa el flujo unificado del cliente basado en el documento `FlujoUnificado.md`. Proporciona una experiencia unificada para múltiples servicios (Transporte, Delivery, Mandado, Envío) con navegación consistente y arquitectura modular.

## 🏗️ Arquitectura

### Estructura del Módulo

```
lib/unified-flow/
├── constants.ts          # Constantes y tipos del flujo
├── index.ts             # Exportaciones principales
└── ...

store/unified-flow/
└── unifiedFlow.ts       # Store Zustand del flujo

hooks/
└── useUnifiedFlow.ts    # Hook personalizado

components/unified-flow/
├── UnifiedFlowWrapper.tsx     # Componente principal
└── steps/                     # Componentes de pasos
    ├── ServiceSelection.tsx
    ├── TransportDefinition.tsx
    ├── TransportVehicleSelection.tsx
    ├── DeliveryBusinessSearch.tsx
    ├── MandadoDetails.tsx
    └── ...

app/(root)/
└── unified-flow-demo.tsx      # Pantalla de demo
```

## 🎯 Servicios Implementados

### 1. **Transporte** (`CLIENTE_TRANSPORT_*`)
- ✅ Definición de viaje
- ✅ Selección de vehículo (Carro/Moto)
- 🔄 Elección de conductor
- 🔄 Gestión de confirmación
- 🔄 Durante y finalización

### 2. **Delivery** (`CLIENTE_DELIVERY_*`)
- ✅ Búsqueda de negocio
- 🔄 Armado del pedido
- 🔄 Checkout y confirmación
- 🔄 Seguimiento del delivery

### 3. **Mandado** (`CLIENTE_MANDADO_*`)
- ✅ Detalles del mandado
- 🔄 Precio y pago
- 🔄 Buscando conductor
- 🔄 Comunicación y confirmación
- 🔄 Finalización

### 4. **Envío de Paquete** (`CLIENTE_ENVIO_*`)
- 🔄 Detalles del envío
- 🔄 Cálculo de precio
- 🔄 Seguimiento del paquete
- 🔄 Confirmación de entrega

## 🔧 API del Módulo

### Store (Zustand)

```typescript
import { useUnifiedFlowStore } from '@/store/unified-flow/unifiedFlow';

const {
  service,           // Servicio actual
  step,             // Paso actual
  isActive,         // Estado del flujo
  startService,     // Iniciar servicio específico
  next,             // Siguiente paso
  back,             // Paso anterior
  goTo,             // Ir a paso específico
  stop,             // Detener flujo
  reset             // Reiniciar flujo
} = useUnifiedFlowStore();
```

### Hook Personalizado

```typescript
import { useUnifiedFlow } from '@/hooks/useUnifiedFlow';

const flow = useUnifiedFlow();
// Retorna todas las propiedades y acciones del store
```

## 🚀 Uso

### Pantalla de Demo

```typescript
import UnifiedFlowWrapper from '@/components/unified-flow/UnifiedFlowWrapper';

export default function UnifiedFlowDemo() {
  return <UnifiedFlowWrapper role="customer" />;
}
```

### Navegación desde Drawer

Ya está configurado en `DrawerContent.tsx`:
- **Título**: "Flujo Unificado Demo"
- **Ícono**: 🔄
- **Ruta**: `/(root)/unified-flow-demo`

## 🎨 Características de UI/UX

### BottomSheet Adaptativo
- **Alturas dinámicas** por paso
- **Drag habilitado/deshabilitado** según contexto
- **Animaciones suaves** entre transiciones
- **Responsive** a diferentes tamaños de pantalla

### Estados de Interacción
- **Map Interaction**: `none`, `pan_to_confirm`, `follow_driver`, `follow_route`
- **Transiciones**: `fade`, `slide`, `none`
- **Snap Points**: Puntos de anclaje personalizables

## 🔄 Flujo de Navegación

```
Inicio → Selección de Servicio
    ↓
Servicio Específico:
├── Transporte: Definición → Vehículo → Conductor → Confirmación → Viaje
├── Delivery: Búsqueda → Pedido → Checkout → Seguimiento
├── Mandado: Detalles → Precio → Conductor → Comunicación → Finalización
└── Envío: Detalles → Precio → Seguimiento → Entrega
```

## 📱 Componentes Implementados

### ServiceSelection
- **Función**: Pantalla inicial de selección de servicios
- **Características**: Grid de servicios con iconos y descripciones
- **Interacción**: Touch para seleccionar servicio

### TransportDefinition
- **Función**: Definir origen y destino del viaje
- **Características**: Campos de origen/destino, sugerencias
- **Interacción**: Touch para seleccionar ubicaciones

### TransportVehicleSelection
- **Función**: Seleccionar tipo de vehículo
- **Características**: Tabs Carro/Moto, lista de opciones con precios
- **Interacción**: Selección de vehículo y continuación

### DeliveryBusinessSearch
- **Función**: Buscar y seleccionar restaurante
- **Características**: Barra de búsqueda, categorías, lista de negocios
- **Interacción**: Búsqueda, filtrado por categoría

### MandadoDetails
- **Función**: Especificar detalles del mandado
- **Características**: Formulario completo, tipos de producto
- **Interacción**: Formulario con validación

## 🔮 Próximos Pasos

### Componentes Pendientes
- [ ] Elección de conductor (Transporte)
- [ ] Gestión de confirmación (Transporte)
- [ ] Durante y finalización (Transporte)
- [ ] Armado del pedido (Delivery)
- [ ] Checkout y confirmación (Delivery)
- [ ] Seguimiento del delivery (Delivery)
- [ ] Precio y pago (Mandado)
- [ ] Buscando conductor (Mandado)
- [ ] Comunicación y confirmación (Mandado)
- [ ] Finalización (Mandado)
- [ ] Detalles del envío (Envío)
- [ ] Cálculo de precio (Envío)
- [ ] Seguimiento del paquete (Envío)
- [ ] Confirmación de entrega (Envío)

### Mejoras Futuras
- [ ] Integración con Google Places API
- [ ] Sistema de pagos integrado
- [ ] Notificaciones push
- [ ] Persistencia de estado
- [ ] Analytics y tracking
- [ ] Modo oscuro completo
- [ ] Internacionalización (i18n)

## 🧪 Testing

Para probar el módulo:

1. **Abrir la app**
2. **Ir al Drawer** (menú hamburguesa)
3. **Seleccionar "Flujo Unificado Demo"**
4. **Probar la navegación** entre diferentes servicios

## 📚 Documentación Relacionada

- `docs/flujo/cliente/FlujoUnificado.md` - Especificación completa del flujo
- `docs/map-flows-architecture.md` - Arquitectura del sistema MapFlow base
- `docs/advanced-ui-system.md` - Sistema de UI avanzado

## 🤝 Contribución

Para agregar nuevos pasos o servicios:

1. **Agregar constantes** en `lib/unified-flow/constants.ts`
2. **Crear componente** en `components/unified-flow/steps/`
3. **Actualizar renderStep** en `UnifiedFlowWrapper.tsx`
4. **Configurar store** en `store/unified-flow/unifiedFlow.ts`
5. **Documentar** cambios en este archivo

---

**Estado**: 🚧 En desarrollo activo
**Versión**: 1.0.0
**Última actualización**: Diciembre 2024
