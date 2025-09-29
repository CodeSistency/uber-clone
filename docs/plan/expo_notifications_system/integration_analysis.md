# Análisis de Integración - Sistema de Notificaciones Expo

## Estado Actual: Sistema Firebase + Expo Notifications Mixto

### 📍 Puntos de Integración Identificados

#### 1. **Inicialización en _layout.tsx**
```typescript
// app/_layout.tsx (líneas 102-113)
firebaseService.initializeFirebase().catch((error: any) => {
  console.warn("[RootLayout] Firebase initialization failed (expected in dev):", error.message);
});
```
**Estado**: Firebase se inicializa como servicio principal de notificaciones
**Impacto**: Necesita ser reemplazado por `expoNotificationService.initialize()`

#### 2. **Hook Principal: useNotifications**
```typescript
// app/hooks/useNotifications.ts
import { notificationService } from "../services/notificationService";
import { firebaseService } from "./firebaseService";

// API actual del hook:
const {
  notifications,        // NotificationData[]
  unreadCount,          // number
  preferences,          // NotificationPreferences
  isLoading,            // boolean
  error,                // string | null
  addNotification,      // (notification: NotificationData) => void
  markAsRead,           // (notificationId: string) => void
  markAllAsRead,        // () => void
  clearNotifications,   // () => void
  updatePreferences,    // (preferences: NotificationPreferences) => void
} = useNotifications();
```
**Estado**: Hook completo que usa Firebase + estado local
**Impacto**: Alto - usado en múltiples componentes

#### 3. **Componente UI: NotificationList**
```typescript
// app/components/notifications/NotificationList.tsx
import { useNotificationStore } from "../../../store";
import { NotificationData } from "../../../types/type";

// Props actuales:
interface NotificationListProps {
  onNotificationPress?: (notification: NotificationData) => void;
  showUnreadOnly?: boolean;
  maxHeight?: number;
  emptyStateMessage?: string;
}
```
**Estado**: Componente funcional que usa store antiguo
**Impacto**: Medio - componente específico de notificaciones

#### 4. **Store de Estado: useNotificationStore**
```typescript
// store/notification/notification.ts
interface NotificationStore {
  notifications: NotificationData[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isLoading: boolean;
  error: string | null;
  // Actions: addNotification, markAsRead, markAllAsRead, clearNotifications, etc.
}
```
**Estado**: Store Zustand con estado completo de notificaciones
**Impacto**: Alto - estado centralizado usado por hook y componentes

#### 5. **Servicio Firebase: notificationService**
```typescript
// app/services/notificationService.ts
export class NotificationService {
  async initialize(): Promise<void> {
    // Inicializa Firebase + Expo Notifications
    await firebaseService.requestPermissions();
    firebaseService.setupNotificationListeners();
    // ... setup Expo handlers
  }

  async getDeviceToken(): Promise<string | null> {
    const token = await firebaseService.getFCMToken();
    return token;
  }
}
```
**Estado**: Servicio híbrido (Firebase + Expo básico)
**Impacto**: Alto - servicio principal usado por hook

#### 6. **Firebase Service Base**
```typescript
// app/services/firebaseService.ts
export class FirebaseService {
  async requestPermissions(): Promise<boolean>
  async getFCMToken(): Promise<string | null>
  setupNotificationListeners(): void
  // ... métodos Firebase específicos
}
```
**Estado**: Servicio Firebase puro para tokens FCM
**Impacto**: Alto - maneja tokens push actuales

#### 7. **Tipos de Datos**
```typescript
// types/type.d.ts
interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  isRead: boolean;
  // ... otros campos
}

interface NotificationPreferences {
  pushEnabled: boolean;
  smsEnabled: boolean;
  rideUpdates: boolean;
  driverMessages: boolean;
  promotional: boolean;
  emergencyAlerts: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}
```
**Estado**: Tipos compatibles con nuevo sistema Expo
**Impacto**: Bajo - tipos son similares

#### 8. **Almacenamiento Local: notificationStorage**
```typescript
// lib/storage.ts
const notificationStorage = {
  async savePreferences(preferences: NotificationPreferences): Promise<void>
  async getPreferences(): Promise<NotificationPreferences | null>
  async saveNotificationHistory(notifications: NotificationData[]): Promise<void>
  async getNotificationHistory(): Promise<NotificationData[]>
}
```
**Estado**: Almacenamiento AsyncStorage para persistencia
**Impacto**: Medio - usado por hook para persistir estado

### 🔄 Flujos de Datos Actuales

#### **Flujo de Inicialización**
1. **App Start** → `_layout.tsx` inicializa `firebaseService`
2. **Component Mount** → `useNotifications` llama `notificationService.initialize()`
3. **Firebase Init** → Configura FCM + Expo handlers
4. **Load State** → Carga preferencias + historial desde AsyncStorage
5. **Setup Listeners** → Configura listeners para notificaciones entrantes

#### **Flujo de Notificaciones Entrantes**
1. **Push Received** → Firebase maneja notificación push
2. **Local Processing** → `firebaseService` procesa y formatea
3. **Store Update** → `addNotification()` actualiza estado
4. **UI Update** → Componentes reaccionan al cambio de estado
5. **Persistence** → Estado se guarda automáticamente en AsyncStorage

#### **Flujo de Interacción Usuario**
1. **Tap Notification** → `onNotificationPress` callback
2. **Mark as Read** → `markAsRead(notificationId)` en store
3. **Update UI** → Componente refleja cambio visual
4. **Persist Change** → Estado se guarda en AsyncStorage

### 📊 Matriz de Dependencias

| Componente | Depende de | Usado por | Estado Actual |
|------------|------------|-----------|---------------|
| `_layout.tsx` | `firebaseService` | App Root | ✅ Funcional |
| `useNotifications` | `notificationService`, `useNotificationStore` | Múltiples componentes | ✅ Funcional |
| `NotificationList` | `useNotificationStore`, `NotificationData` | Pantallas de notificaciones | ✅ Funcional |
| `notificationService` | `firebaseService` + Expo básico | `useNotifications` | ✅ Funcional |
| `firebaseService` | Firebase SDK | `notificationService` | ✅ Funcional |
| `useNotificationStore` | Zustand + tipos | `useNotifications`, `NotificationList` | ✅ Funcional |

### 🎯 Estrategia de Migración Propuesta

#### **Fase 1: Paralelo Seguro** (Recomendado)
- Mantener sistema Firebase activo durante migración
- Crear wrapper de compatibilidad para API existente
- Migrar componentes gradualmente
- Testing paralelo en cada paso

#### **Fase 2: Transición Gradual**
- Reemplazar servicios uno por uno
- Mantener misma API externa
- Actualizar componentes por módulos
- Validar funcionalidad en cada cambio

#### **Fase 3: Limpieza Final**
- Remover código Firebase legacy
- Optimizar bundle
- Actualizar documentación

### ⚠️ Riesgos Identificados

1. **Pérdida de Tokens**: Migración podría perder tokens FCM existentes
2. **Incompatibilidad de Tipos**: Diferencias entre `NotificationData` y `ExpoNotificationData`
3. **Persistencia**: Estado existente podría no migrar correctamente
4. **Dependencias Externas**: Componentes no identificados podrían romperse
5. **Performance**: Nuevo sistema podría tener diferente comportamiento

### ✅ Compatibilidad Identificada

- **API del Hook**: Similar entre sistemas
- **Tipos de Datos**: Compatible con mínimas adaptaciones
- **Estados del Store**: Estructura similar
- **Persistencia**: Mismo mecanismo AsyncStorage
- **Componentes UI**: Props similares, lógica adaptable

### 📋 Checklist de Migración

- [ ] ✅ Análisis completo de integración actual
- [ ] 🔄 Crear wrapper de compatibilidad
- [ ] 🔄 Migrar _layout.tsx (inicialización)
- [ ] 🔄 Migrar useNotifications hook
- [ ] 🔄 Actualizar NotificationList componente
- [ ] 🔄 Migrar notificationService
- [ ] 🔄 Testing de compatibilidad
- [ ] 🔄 Limpieza código legacy
- [ ] 🔄 Optimización final

---

## 📋 Checklist de Migración

- [x] ✅ Análisis completo de integración actual
- [ ] 🔄 Crear wrapper de compatibilidad
- [ ] 🔄 Migrar _layout.tsx (inicialización)
- [ ] 🔄 Migrar useNotifications hook
- [ ] 🔄 Actualizar NotificationList componente
- [ ] 🔄 Migrar notificationService
- [ ] 🔄 Testing de compatibilidad
- [ ] 🔄 Limpieza código legacy
- [ ] 🔄 Optimización final

## 🔄 Flujos de Datos Detallados

### **1. Flujo de Inicialización Completo**

```
┌─────────────────┐
│   App Start     │
│  (_layout.tsx)  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐     ┌─────────────────┐
│ Firebase Init   │────▶│   User Store    │
│ (Highest Priority)    │     │  Init         │
└─────────────────┘     └─────────┬───────┘
          │                       │
          ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Font Load     │     │   Module Store  │
│   (Splash)      │     │     Init        │
└─────────┬───────┘     └─────────────────┘
          │
          ▼
┌─────────────────┐     ┌─────────────────┐
│ Component Mount │────▶│ useNotifications│
│                 │     │    Hook         │
└─────────────────┘     └─────────┬───────┘
                                  │
                                  ▼
┌─────────────────┐     ┌─────────────────┐
│ Notification    │────▶│ Load from       │
│ Service Init    │     │ AsyncStorage    │
└─────────────────┘     └─────────────────┘
          │
          ▼
┌─────────────────┐
│   Setup         │
│ Event Listeners │
└─────────────────┘
```

**Secuencia de Dependencias:**
1. **Firebase** (línea 102-113 en _layout.tsx)
2. **User Store** (línea 115-134)
3. **Module Store** (línea 136-148)
4. **Fonts** (línea 48-50)
5. **Notifications** (useEffect en useNotifications)

### **2. Flujo de Notificaciones Push Entrantes**

```
┌─────────────────┐
│   Push Message  │
│  (FCM/APNs)     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐     ┌─────────────────┐
│ Firebase Cloud  │────▶│   firebaseService│
│ Messaging       │     │  processMessage  │
└─────────────────┘     └─────────┬───────┘
                                  │
                                  ▼
┌─────────────────┐     ┌─────────────────┐
│  Format &       │────▶│   Expo           │
│  Transform      │     │ Notifications    │
└─────────────────┘     └─────────────────┘
          │
          ▼
┌─────────────────┐     ┌─────────────────┐
│ addNotification │────▶│   Store Update   │
│  (Store)        │     │  (Zustand)       │
└─────────────────┘     └─────────┬───────┘
                                  │
                                  ▼
┌─────────────────┐     ┌─────────────────┐
│   UI Update     │────▶│   Auto-Save     │
│  (Components)   │     │ AsyncStorage    │
└─────────────────┘     └─────────────────┘
```

**Transformaciones de Datos:**
- FCM Raw → `NotificationData` object
- Timestamp string → Date object
- Type enum → localized strings
- Metadata → UI state

### **3. Flujo de Interacción del Usuario**

```
┌─────────────────┐
│   User Tap      │
│ Notification    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐     ┌─────────────────┐
│ onNotification  │────▶│   Navigation    │
│ Press Callback  │     │    Action       │
└─────────────────┘     └─────────────────┘
          │
          ▼
┌─────────────────┐     ┌─────────────────┐
│ markAsRead()    │────▶│   Store Update   │
│   (Hook)        │     │   unreadCount--  │
└─────────────────┘     └─────────┬───────┘
                                  │
                                  ▼
┌─────────────────┐     ┌─────────────────┐
│   UI Re-render  │────▶│   Persistence   │
│ (Visual Change) │     │   AsyncStorage  │
└─────────────────┘     └─────────────────┘
```

**Estados de Lectura:**
- `isRead: false` → `isRead: true`
- `unreadCount--`
- Visual indicators update
- Badge count update (iOS)

### **4. Flujo de Persistencia de Estado**

```
┌─────────────────┐
│   State Change  │
│ (Store Update)  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐     ┌─────────────────┐
│ useEffect       │────▶│   Serialize     │
│ (useNotifications)    │   to JSON       │
└─────────────────┘     └─────────┬───────┘
                                  │
                                  ▼
┌─────────────────┐     ┌─────────────────┐
│ AsyncStorage    │────▶│   Save to       │
│ .setItem()      │     │   Device        │
└─────────────────┘     └─────────────────┘
          │
          ▼
┌─────────────────┐
│   Confirmation  │
│   (Optional)    │
└─────────────────┘
```

**Datos Persistidos:**
- `NotificationData[]` → "notification_history"
- `NotificationPreferences` → "notification_preferences"
- Automatic on every state change

## 📊 Mapa de Dependencias Técnicas

### **Dependencias por Archivo**

#### **`app/_layout.tsx`**
- ✅ `firebaseService.initializeFirebase()`
- ✅ Requiere: Firebase SDK configurado
- ❌ Impacto: Alto (punto de entrada principal)

#### **`app/hooks/useNotifications.ts`**
- ✅ `notificationService.initialize()`
- ✅ `useNotificationStore` (estado)
- ✅ `notificationStorage` (persistencia)
- ❌ Impacto: Alto (API principal para componentes)

#### **`app/services/notificationService.ts`**
- ✅ `firebaseService` (tokens FCM)
- ✅ `expo-notifications` (handlers)
- ✅ `useNotificationStore` (estado)
- ❌ Impacto: Alto (servicio central)

#### **`store/notification/notification.ts`**
- ✅ Zustand store
- ✅ `NotificationData` types
- ❌ Impacto: Alto (estado global)

#### **`app/components/notifications/NotificationList.tsx`**
- ✅ `useNotificationStore`
- ✅ `NotificationData` types
- ❌ Impacto: Medio (UI específico)

### **Interfaces y Contratos**

#### **NotificationData Interface**
```typescript
interface NotificationData {
  id: string;              // UUID único
  type: NotificationType;  // Enum: RIDE_REQUEST, etc.
  title: string;           // Título para display
  message: string;         // Contenido principal
  data?: any;              // Metadatos adicionales
  timestamp: Date;         // Fecha de creación
  isRead: boolean;         // Estado de lectura
}
```

#### **Hook API Contract**
```typescript
interface UseNotificationsReturn {
  // State
  notifications: NotificationData[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isLoading: boolean;
  error: string | null;

  // Actions
  addNotification: (notification: NotificationData) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  updatePreferences: (prefs: NotificationPreferences) => void;
}
```

### **Riesgos de Ruptura Identificados**

#### **🔴 Riesgo Crítico**
- **Cambio de tipos**: `NotificationData` → `ExpoNotificationData`
- **Pérdida de tokens**: Migración sin backup de FCM tokens
- **Persistencia**: Datos existentes no migran correctamente

#### **🟡 Riesgo Medio**
- **API del hook**: Cambios en nombres de métodos
- **Props de componentes**: Interfaces modificadas
- **Estados de error**: Manejo diferente de errores

#### **🟢 Riesgo Bajo**
- **Estilos UI**: Cambios visuales mínimos
- **Performance**: Sistema Expo optimizado
- **Compatibilidad**: APIs similares

### **Puntos de Extensión**

#### **Configuración**
- Variables de entorno: `EXPO_PUBLIC_*`
- Configuración por plataforma (iOS/Android)
- Preferencias de usuario personalizables

#### **Eventos Personalizables**
- Notification received handlers
- Response handlers
- Custom notification types

#### **Integración con Backend**
- Endpoints de API existentes
- WebSocket para tiempo real
- Sincronización de estado

---

*Documento generado automáticamente como parte del análisis de integración - Etapa 3 Módulo 3.1*
