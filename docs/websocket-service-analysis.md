# WebSocket Service - Análisis y Mapa de Funcionalidades

## 📊 Resumen General

- **Archivo**: `app/services/websocketService.ts`
- **Líneas**: 2,387
- **Clase**: `WebSocketService` (Singleton)
- **Propósito**: Manejar comunicación en tiempo real para la aplicación Uber Clone

## 🏗️ Arquitectura General

### Patrón de Diseño

- **Singleton Pattern**: Una única instancia global
- **Observer Pattern**: Sistema de eventos y listeners
- **Queue Pattern**: Cola de mensajes con rate limiting
- **State Machine**: Gestión de estados de conexión

### Dependencias Principales

```typescript
import { io, Socket } from "socket.io-client";
import { driverDeliveryService } from "@/app/services/driverDeliveryService";
// ... otros servicios
import {
  useRealtimeStore,
  useChatStore,
  useNotificationStore,
} from "../../store";
```

## 📋 Mapa de Funcionalidades

### 1. 🔗 Gestión de Conexión

**Funciones principales:**

- `connect(userId, token)` - Establecer conexión inicial
- `disconnect()` - Cerrar conexión
- `forceReconnect()` - Reconexión forzada

**Características:**

- Reconexión automática con backoff exponencial
- Autenticación JWT en handshake
- Timeout configurable (10s por defecto)
- Manejo de errores de conexión

### 2. 🏠 Gestión de Rooms

**Funciones principales:**

- `joinRideRoom(rideId)` - Unirse a sala de viaje
- `leaveRideRoom(rideId)` - Salir de sala de viaje
- `leaveAllRooms()` - Salir de todas las salas

**Propósito:**

- Comunicación específica por viaje
- Aislamiento de mensajes entre viajes
- Eficiencia en broadcasting

### 3. 💬 Sistema de Mensajes

**Funciones principales:**

- `sendMessage(rideId, message)` - Enviar mensaje de texto
- `sendTypingStart(rideId)` - Indicar escritura
- `sendTypingStop(rideId)` - Detener indicador de escritura

**Características:**

- Rate limiting (100ms entre mensajes)
- Queue de mensajes cuando desconectado
- Procesamiento asíncrono de cola

### 4. 📍 Tracking GPS

**Funciones principales:**

- `updateDriverLocation(rideId, location)` - Actualizar ubicación

**Características:**

- Envío optimizado de coordenadas
- Integración con servicios de mapas
- Actualizaciones en tiempo real

### 5. 🚨 Sistema de Emergencias

**Funciones principales:**

- `triggerEmergency(emergencyData)` - Activar emergencia

**Características:**

- Prioridad alta en envío
- Notificación inmediata a sistemas
- Logging detallado

### 6. 👨‍💼 Funcionalidades de Conductor

**Funciones principales:**

- `updateDriverStatus(statusData)` - Actualizar estado
- `requestEarningsUpdate(driverId)` - Solicitar actualización de ganancias
- `requestPerformanceData(driverId)` - Solicitar métricas de rendimiento
- `updateVehicleChecklist(vehicleData)` - Actualizar checklist

**Propósito:**

- Dashboard en tiempo real para conductores
- Métricas de rendimiento live
- Gestión de estado del vehículo

### 7. 📊 Sistema de Métricas y Monitoreo

**Propiedades principales:**

- `performanceMetrics` - Métricas de rendimiento
- `messageQueue` - Cola de mensajes
- `lastPingTime` - Último ping recibido

**Funciones:**

- `resetPerformanceMetrics()` - Reset de métricas
- Heartbeat monitoring
- Connection health tracking

### 8. 🎯 Sistema de Eventos

**Eventos manejados:**

- `connect` - Conexión establecida
- `disconnect` - Conexión perdida
- `connect_error` - Error de conexión
- `rideStatusUpdate` - Actualización de estado de viaje
- `driverLocationUpdate` - Nueva ubicación de conductor
- `newMessage` - Nuevo mensaje recibido
- `typingStart/Stop` - Indicadores de escritura
- `earningsUpdate` - Actualización de ganancias
- `performanceUpdate` - Nuevas métricas
- `rideNotification` - Nueva solicitud de viaje

## 🔧 Sistema Interno

### Queue Management

```typescript
interface QueuedMessage {
  event: string;
  data: any;
  timestamp: number;
  priority: number;
}
```

**Características:**

- Queue con límite máximo (50 mensajes)
- Procesamiento FIFO
- Rate limiting automático
- Priorización de mensajes críticos

### Rate Limiting

- **Mensaje rate**: 100ms entre mensajes
- **Reconnection backoff**: Exponencial (1s, 2s, 4s, 8s, 10s max)
- **Heartbeat**: 30 segundos

### Error Handling

- **Network errors**: Reintento automático
- **Authentication errors**: Refresh token automático
- **Connection drops**: Reconexión automática
- **Message failures**: Re-queue automático

## 📈 Estados y Ciclo de Vida

### Estados de Conexión

```
DISCONNECTED → CONNECTING → CONNECTED → DISCONNECTING → DISCONNECTED
```

### Estados de Servicio

```
INITIALIZING → READY → CONNECTING → CONNECTED → ERROR → RECONNECTING
```

## 🔗 Integraciones Externas

### Stores (Zustand)

- `useRealtimeStore` - Estado de viajes en tiempo real
- `useChatStore` - Estado de mensajes
- `useNotificationStore` - Notificaciones push

### Servicios

- `driverDeliveryService` - Gestión de entregas
- `driverErrandService` - Gestión de mandados
- `driverParcelService` - Gestión de paquetes
- `locationTrackingService` - Tracking GPS

## 🎯 Puntos de Extensión

### Nuevos Tipos de Servicio

- Añadir nuevos servicios de conductor
- Integrar nuevos tipos de rooms
- Extender sistema de eventos

### Nuevas Funcionalidades

- Sistema de notificaciones push
- Compresión de mensajes
- Encriptación end-to-end

## ⚠️ Problemas Identificados

### Tamaño del Archivo

- **2,387 líneas** - Muy grande para mantenimiento
- Múltiples responsabilidades en una clase
- Difícil testing y debugging

### Complejidad

- Lógica mezclada (conexión + mensajes + métricas)
- Dependencias circulares con stores
- Configuración hardcodeada

### Rendimiento

- Queue processing sincrónico
- Rate limiting básico
- Memory leaks potenciales

## 🔨 Plan de Refactorización

### Módulos a Extraer - Responsabilidades Separables

#### 1. **ConnectionManager** (`app/services/websocket/connection.ts`)

**Líneas aproximadas**: 200-300
**Funciones a extraer**:

- `connect()`, `disconnect()`, `forceReconnect()`
- Lógica de reconexión automática
- Manejo de estados de conexión
- Health checks de conexión

**Interfaces requeridas**:

```typescript
interface ConnectionConfig {
  url: string;
  timeout: number;
  maxRetries: number;
  reconnectDelay: number;
}

interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  lastConnected?: Date;
  reconnectAttempts: number;
}
```

#### 2. **EventManager** (`app/services/websocket/events.ts`)

**Líneas aproximadas**: 150-200
**Funciones a extraer**:

- `addEventListener()`, `removeEventListener()`
- `emitEvent()`, `broadcastEvent()`
- Manejo de callbacks de eventos
- Sistema de suscripción a eventos

**Eventos principales a manejar**:

- `connect`, `disconnect`, `connect_error`
- `rideStatusUpdate`, `driverLocationUpdate`
- `newMessage`, `typingStart`, `typingStop`
- `earningsUpdate`, `performanceUpdate`, `rideNotification`

#### 3. **MessageQueue** (`app/services/websocket/queue.ts`)

**Líneas aproximadas**: 100-150
**Funciones a extraer**:

- Queue management (`addToQueue`, `processQueue`)
- Rate limiting logic
- Message prioritization
- Queue persistence (opcional)

**Estructuras de datos**:

```typescript
interface QueuedMessage {
  id: string;
  event: string;
  data: any;
  timestamp: number;
  priority: "low" | "normal" | "high" | "critical";
  retryCount: number;
}
```

#### 4. **MetricsMonitor** (`app/services/websocket/metrics.ts`)

**Líneas aproximadas**: 80-120
**Funciones a extraer**:

- `updateMetrics()`, `getMetrics()`, `resetMetrics()`
- Performance tracking (latencia, throughput)
- Connection health monitoring
- Error rate tracking

**Métricas a trackear**:

- Messages sent/received per minute
- Connection uptime/downtime
- Average response time
- Error rates by type

#### 5. **RoomManager** (`app/services/websocket/rooms.ts`)

**Líneas aproximadas**: 50-80
**Funciones a extraer**:

- `joinRoom()`, `leaveRoom()`, `leaveAllRooms()`
- Room state tracking
- Room membership validation
- Broadcast to room members

**Estructuras**:

```typescript
interface RoomState {
  roomId: string;
  joinedAt: Date;
  memberCount: number;
  lastActivity: Date;
}
```

### Servicio Principal Refactorizado

#### Estructura Final

```typescript
// app/services/websocket/index.ts
export class WebSocketService {
  private connectionManager: ConnectionManager;
  private eventManager: EventManager;
  private messageQueue: MessageQueue;
  private metricsMonitor: MetricsMonitor;
  private roomManager: RoomManager;

  constructor(config: WebSocketConfig) {
    this.connectionManager = new ConnectionManager(config.connection);
    this.eventManager = new EventManager();
    this.messageQueue = new MessageQueue(config.queue);
    this.metricsMonitor = new MetricsMonitor();
    this.roomManager = new RoomManager();

    this.setupEventForwarding();
  }

  // API pública mantenida para compatibilidad
  async connect(userId: string, token: string) {
    return this.connectionManager.connect(userId, token);
  }

  // Métodos públicos delegados
  sendMessage(rideId: number, message: string) {
    this.messageQueue.addMessage("sendMessage", { rideId, message });
  }

  joinRideRoom(rideId: number) {
    this.roomManager.joinRoom(`ride_${rideId}`);
  }

  // etc...
}
```

#### Interfaces Compartidas

```typescript
// app/services/websocket/types.ts
export interface WebSocketConfig {
  connection: ConnectionConfig;
  queue: QueueConfig;
  events: EventConfig;
  metrics: MetricsConfig;
}

export interface BaseModule {
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  getHealthStatus(): HealthStatus;
}

export interface HealthStatus {
  healthy: boolean;
  lastCheck: Date;
  error?: string;
}
```

### Orden de Implementación

#### Fase 1: Interfaces y Tipos (Día 1)

1. Crear `app/services/websocket/types.ts` con todas las interfaces
2. Definir contratos entre módulos
3. Crear interfaces de testing

#### Fase 2: Módulos Independientes (Días 2-4)

1. **ConnectionManager** - Más crítico, empezar aquí
2. **MessageQueue** - Independiente, fácil de testear
3. **RoomManager** - Simple, depende de ConnectionManager
4. **EventManager** - Requiere integración con otros módulos
5. **MetricsMonitor** - Puede ser último

#### Fase 3: Integración (Días 5-6)

1. Crear servicio principal con composición
2. Implementar forwarding de eventos entre módulos
3. Añadir manejo de errores cross-module
4. Crear tests de integración

#### Fase 4: Migración y Testing (Días 7-8)

1. Reemplazar código original módulo por módulo
2. Mantener compatibilidad de API
3. Tests exhaustivos de cada módulo
4. Performance testing

### Estrategia de Migración

#### Backward Compatibility

- Mantener constructor existente
- Preservar todas las APIs públicas
- Gradual replacement de internals
- Feature flags para testing

#### Testing Strategy

```typescript
// tests/websocket/WebSocketService.test.ts
describe("WebSocketService", () => {
  it("should maintain API compatibility", () => {
    // Test that all public methods exist and work
  });

  it("should use new modular architecture internally", () => {
    // Test that modules are properly instantiated
  });
});
```

#### Risk Mitigation

- **Branch strategy**: Feature branch con PRs pequeños
- **Gradual rollout**: Reemplazo módulo por módulo
- **Fallback mechanism**: Capacidad de rollback rápido
- **Monitoring**: Métricas de performance antes/durante/después

## ✅ Checklist de Compatibilidad

- [ ] Mantener API pública existente
- [ ] Preservar todos los eventos emitidos
- [ ] Mantener configuración actual
- [ ] Asegurar performance equivalente
- [ ] Tests de integración pasan

## 📋 Próximos Pasos

1. **Crear interfaces** para cada módulo
2. **Extraer ConnectionManager** primero
3. **Crear tests** para cada módulo
4. **Refactorizar servicio principal**
5. **Actualizar documentación**

---

_Análisis completado el: 2025-09-26_
_Tamaño del archivo: 2,387 líneas_
_Módulos identificados: 8 responsabilidades principales_
