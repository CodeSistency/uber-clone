# Sistema de Notificaciones Expo

Este directorio contiene la implementación completa del sistema de notificaciones usando únicamente **Expo Notifications**, independiente del sistema Firebase existente.

## 📁 Estructura

```
app/services/expo-notifications/
├── index.ts                    # Exportaciones principales
├── expoNotificationService.ts  # Servicio core de notificaciones
└── README.md                   # Esta documentación

store/expo-notifications/
├── index.ts                    # Exportaciones del store
└── expoNotificationStore.ts    # Store Zustand para estado

app/hooks/expo-notifications/
├── index.ts                    # Exportaciones de hooks
└── useExpoNotifications.ts     # Hooks React personalizados

lib/expo-notifications/
├── config.ts                   # Configuración centralizada
├── tokenManager.ts             # Gestión de tokens push
└── utils.ts                    # Utilidades del sistema

types/expo-notifications.d.ts   # Definiciones TypeScript
```

## 🚀 Inicio Rápido

### 1. Inicialización del Servicio

```typescript
import { expoNotificationService } from '@/app/services/expo-notifications';

const App = () => {
  useEffect(() => {
    const init = async () => {
      try {
        await expoNotificationService.initialize();
        console.log('Expo Notifications initialized successfully');
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    init();
  }, []);

  return <AppContent />;
};
```

### 2. Usar el Hook Principal

```typescript
import { useExpoNotifications } from '@/app/hooks/expo-notifications';

const NotificationComponent = () => {
  const {
    notifications,
    unreadCount,
    sendLocalNotification,
    requestPermissions,
  } = useExpoNotifications();

  const handleSendNotification = async () => {
    await sendLocalNotification(
      'Hello!',
      'This is a test notification',
      { type: 'SYSTEM_UPDATE' }
    );
  };

  return (
    <View>
      <Text>Unread: {unreadCount}</Text>
      <Button title="Send Notification" onPress={handleSendNotification} />
    </View>
  );
};
```

## 📱 API Principal

### ExpoNotificationService

Clase principal que maneja todas las operaciones de notificaciones.

```typescript
import { expoNotificationService } from "@/app/services/expo-notifications";

// Inicializar
await expoNotificationService.initialize();

// Enviar notificación local
const id = await expoNotificationService.sendLocalNotification(
  "Title",
  "Message body",
  { customData: "value" },
);

// Programar notificación
const scheduledId = await expoNotificationService.scheduleNotification(
  "Reminder",
  "Time to check your app!",
  { seconds: 3600 }, // 1 hora
  { type: "SYSTEM_UPDATE" },
);

// Gestionar permisos
const permissions = await expoNotificationService.requestPermissions();

// Gestionar badge
await expoNotificationService.setBadgeCount(5);
```

### Hook useExpoNotifications

Hook React que proporciona acceso completo al sistema.

```typescript
const {
  // Estado
  notifications,
  unreadCount,
  preferences,
  token,
  permissions,

  // Acciones
  sendLocalNotification,
  scheduleNotification,
  markAsRead,
  updatePreferences,
  requestPermissions,
} = useExpoNotifications();
```

## ⚙️ Configuración

### Variables de Entorno

```env
# Opcional - Configuración de comportamiento
EXPO_PUBLIC_NOTIFICATIONS_AUTO_DISMISS=true
EXPO_PUBLIC_NOTIFICATIONS_FOREGROUND=true
EXPO_PUBLIC_NOTIFICATIONS_SOUND=true
EXPO_PUBLIC_NOTIFICATIONS_VIBRATE=true
EXPO_PUBLIC_NOTIFICATIONS_BADGE=true
EXPO_PUBLIC_NOTIFICATIONS_RETRY_ATTEMPTS=3
EXPO_PUBLIC_NOTIFICATIONS_TIMEOUT=30000
```

### Configuración Programática

```typescript
import { expoNotificationConfig } from "@/lib/expo-notifications/config";

// Obtener configuración actual
const config = expoNotificationConfig.getConfig();

// Configurar canales Android
await expoNotificationConfig.setupExpoAndroidChannels();
```

## 🎯 Tipos de Notificación

```typescript
type ExpoNotificationType =
  | "RIDE_REQUEST" // Nueva solicitud de viaje
  | "RIDE_ACCEPTED" // Viaje aceptado por conductor
  | "RIDE_CANCELLED" // Viaje cancelado
  | "DRIVER_ARRIVED" // Conductor llegó al punto de recogida
  | "RIDE_STARTED" // Viaje iniciado
  | "RIDE_COMPLETED" // Viaje completado
  | "PAYMENT_SUCCESS" // Pago exitoso
  | "CHAT_MESSAGE" // Nuevo mensaje de chat
  | "EMERGENCY_ALERT" // Alerta de emergencia
  | "SYSTEM_UPDATE" // Actualización del sistema
  | "PROMOTIONAL"; // Notificación promocional
```

## 📊 Gestión de Estado

### Store Zustand

```typescript
import { useExpoNotificationStore } from "@/store/expo-notifications";

// Acceso directo al store
const store = useExpoNotificationStore();

// Estado
const { notifications, unreadCount, preferences, token, permissions } = store;

// Acciones
store.addNotification(notification);
store.markAsRead(notificationId);
store.updatePreferences(newPreferences);
```

### Selectores Optimizados

```typescript
import {
  useUnreadNotifications,
  useNotificationsByType,
  useNotificationSummary,
} from "@/store/expo-notifications";

// Solo notificaciones no leídas
const unreadNotifications = useUnreadNotifications();

// Notificaciones por tipo
const rideNotifications = useNotificationsByType("RIDE_REQUEST");

// Resumen general
const summary = useNotificationSummary();
// { total: 10, unread: 3, hasToken: true, permissionsGranted: true }
```

## 🔧 Hooks Especializados

### Gestión de Permisos

```typescript
import { useNotificationPermissions } from "@/app/hooks/expo-notifications";

const { hasPermissions, canAskAgain, requestPermissions } =
  useNotificationPermissions();

if (!hasPermissions && canAskAgain) {
  // Solicitar permisos al usuario
  await requestPermissions();
}
```

### Gestión de Tokens

```typescript
import { usePushToken } from "@/app/hooks/expo-notifications";

const { token, hasToken, tokenType, getDeviceToken } = usePushToken();

if (!hasToken) {
  const newToken = await getDeviceToken();
  // Enviar token al servidor para push notifications
}
```

### Badge de la App

```typescript
import { useAppBadge } from "@/app/hooks/expo-notifications";

const { badgeCount, clearBadge } = useAppBadge();
// El badge se actualiza automáticamente con unreadCount
```

### Simulador (para Testing)

```typescript
import { useNotificationSimulator } from "@/app/hooks/expo-notifications";

const { simulateRideRequest, simulateNotification } =
  useNotificationSimulator();

// Simular solicitud de viaje
simulateRideRequest();

// Simular notificación personalizada
simulateNotification("Custom Title", "Custom message", {
  type: "SYSTEM_UPDATE",
});
```

## 🎨 Utilidades

### Formateo y Helpers

```typescript
import {
  formatTime,
  formatDate,
  shouldShowNotification,
  getNotificationIcon,
  getNotificationColor,
} from "@/lib/expo-notifications/utils";

// Formatear tiempo
const timeString = formatTime(90); // "1h 30m"

// Verificar si mostrar notificación
const shouldShow = shouldShowNotification(preferences, "RIDE_REQUEST");

// Obtener icono y color para UI
const icon = getNotificationIcon("RIDE_REQUEST"); // "🚗"
const color = getNotificationColor("RIDE_REQUEST"); // "#0286FF"
```

## 🔄 Ciclo de Vida

### Inicialización

1. **Configuración**: Setup de canales y handlers
2. **Permisos**: Verificación/solicitud de permisos
3. **Token**: Obtención de token push
4. **Listeners**: Configuración de event listeners

### Operaciones

- **Local**: Notificaciones inmediatas
- **Scheduled**: Notificaciones programadas
- **Push**: Notificaciones desde servidor
- **Management**: Gestión de estado y preferencias

### Limpieza

- **Tokens**: Limpieza de tokens almacenados
- **Listeners**: Remoción de event listeners
- **Badge**: Reset de contador

## 🧪 Testing

### Simulación de Notificaciones

```typescript
import { expoNotificationService } from "@/app/services/expo-notifications";

// Simular notificación
expoNotificationService.simulateNotification({
  title: "Test Notification",
  body: "This is a test",
  data: { type: "SYSTEM_UPDATE" },
  type: "foreground",
});
```

### Testing con Hooks

```typescript
import { renderHook, act } from "@testing-library/react-native";
import { useExpoNotifications } from "@/app/hooks/expo-notifications";

const { result } = renderHook(() => useExpoNotifications());

// Simular envío de notificación
await act(async () => {
  await result.current.sendLocalNotification("Test", "Message");
});

// Verificar estado
expect(result.current.notifications).toHaveLength(1);
```

## 🚨 Manejo de Errores

### Errores Comunes

```typescript
try {
  await expoNotificationService.sendLocalNotification(title, body);
} catch (error) {
  if (error instanceof ExpoNotificationError) {
    switch (error.code) {
      case "PERMISSION_DENIED":
        // Mostrar UI para solicitar permisos
        break;
      case "TOKEN_NOT_AVAILABLE":
        // Reintentar obtener token
        break;
      default:
        // Error genérico
        break;
    }
  }
}
```

## 📋 Checklist de Implementación

- ✅ Estructura de archivos creada
- ✅ Tipos TypeScript definidos
- ✅ Configuración centralizada
- ✅ Gestión de tokens implementada
- ✅ Servicio core desarrollado
- ✅ Store Zustand configurado
- ✅ Hooks React creados
- ✅ Utilidades implementadas
- 🔄 Testing pendiente
- 🔄 Integración con UI pendiente
- 🔄 Documentación de API pendiente

## 🔗 Integración con Sistema Existente

Este sistema es **completamente independiente** del sistema Firebase existente. Para migrar:

1. **Mantener ambos sistemas** durante transición
2. **Actualizar imports** progresivamente
3. **Migrar componentes** uno por uno
4. **Remover sistema Firebase** cuando todo esté probado

### Comparación con Firebase

| Característica    | Firebase             | Expo Only        |
| ----------------- | -------------------- | ---------------- |
| **Push Tokens**   | FCM                  | Expo Push Token  |
| **Configuración** | google-services.json | Variables ENV    |
| **Dependencias**  | Firebase SDK         | Solo Expo        |
| **Plataformas**   | iOS, Android, Web    | iOS, Android     |
| **Testing**       | Complejo             | Fácil simulación |
| **Bundle Size**   | Más grande           | Más pequeño      |

## 🎯 Próximos Pasos

1. **Crear componente UI** para gestionar notificaciones
2. **Implementar testing** completo
3. **Agregar analíticas** de engagement
4. **Optimizar performance** para listas grandes
5. **Implementar offline queue** para notificaciones fallidas
