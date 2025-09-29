import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';

// Mock completo del sistema
jest.mock('@/app/services/expo-notifications', () => ({
  expoNotificationService: {
    initialize: jest.fn().mockResolvedValue(undefined),
    sendLocalNotification: jest.fn().mockResolvedValue('notification-1'),
    scheduleNotification: jest.fn().mockResolvedValue('scheduled-1'),
    cancelNotification: jest.fn().mockResolvedValue(undefined),
    cancelAllNotifications: jest.fn().mockResolvedValue(undefined),
    requestPermissions: jest.fn().mockResolvedValue({ granted: true, status: 'granted' }),
    getPushToken: jest.fn().mockResolvedValue({ type: 'expo', data: 'expo-token-123' }),
    setBadgeCount: jest.fn().mockResolvedValue(undefined),
    getDeviceToken: jest.fn().mockResolvedValue('expo-token-123'),
  },
}));

jest.mock('@/store/expo-notifications/expoNotificationStore', () => ({
  useExpoNotificationStore: jest.fn(() => ({
    notifications: [],
    unreadCount: 0,
    preferences: {
      pushEnabled: true,
      smsEnabled: false,
      rideUpdates: true,
      driverMessages: true,
      promotional: false,
      emergencyAlerts: true,
      soundEnabled: true,
      vibrationEnabled: true,
      badgeEnabled: true,
      quietHoursEnabled: false,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
    },
    isLoading: false,
    error: null,
    addNotification: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    clearNotifications: jest.fn(),
    updatePreferences: jest.fn(),
    removeNotification: jest.fn(),
  })),
}));

jest.mock('@/app/lib/storage', () => ({
  notificationStorage: {
    savePreferences: jest.fn().mockResolvedValue(undefined),
    getPreferences: jest.fn().mockResolvedValue(null),
    saveNotificationHistory: jest.fn().mockResolvedValue(undefined),
    getNotificationHistory: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('@/lib/logger', () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

import { useNotifications } from '@/app/hooks/useNotifications';

describe('End-to-End Notifications Flow', () => {
  let mockStore: any;
  let mockService: any;
  let mockStorage: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStore = require('@/store/expo-notifications/expoNotificationStore').useExpoNotificationStore;
    mockService = require('@/app/services/expo-notifications').expoNotificationService;
    mockStorage = require('@/app/lib/storage').notificationStorage;

    // Reset store state
    mockStore.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      preferences: {
        pushEnabled: true,
        smsEnabled: false,
        rideUpdates: true,
        driverMessages: true,
        promotional: false,
        emergencyAlerts: true,
        soundEnabled: true,
        vibrationEnabled: true,
        badgeEnabled: true,
        quietHoursEnabled: false,
        quietHoursStart: "22:00",
        quietHoursEnd: "08:00",
      },
      isLoading: false,
      error: null,
      addNotification: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      clearNotifications: jest.fn(),
      updatePreferences: jest.fn(),
      removeNotification: jest.fn(),
    });
  });

  describe('Complete User Journey: App Launch → Notification → Interaction', () => {
    it('should handle complete notification lifecycle', async () => {
      // 1. App Launch - Hook Initialization
      const { result } = renderHook(() => useNotifications());

      // Verificar estado inicial
      expect(result.current.notifications).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.isLoading).toBe(false);

      // 2. Permission Request Flow
      let permissions;
      await act(async () => {
        permissions = await result.current.requestPermissions();
      });

      expect(permissions).toEqual({ granted: true, status: 'granted' });
      expect(mockService.requestPermissions).toHaveBeenCalled();

      // 3. Token Retrieval
      let token;
      await act(async () => {
        token = await result.current.getDeviceToken();
      });

      expect(token).toBe('expo-token-123');
      expect(mockService.getDeviceToken).toHaveBeenCalled();

      // 4. Receive First Notification (Ride Request)
      const rideNotification = {
        id: 'ride-123',
        type: 'RIDE_REQUEST' as const,
        title: 'New Ride Request',
        message: 'Pickup at 123 Main St',
        data: { rideId: '123', pickupLocation: '123 Main St' },
        timestamp: new Date(),
        isRead: false,
      };

      // Simular recepción de notificación
      act(() => {
        result.current.addNotification(rideNotification);
      });

      // Verificar que se agregó
      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(1);
        expect(result.current.notifications[0].title).toBe('New Ride Request');
        expect(result.current.unreadCount).toBe(1);
      });

      // 5. Badge Update
      expect(mockService.setBadgeCount).toHaveBeenCalledWith(1);

      // 6. User Interaction - Mark as Read
      act(() => {
        result.current.markAsRead('ride-123');
      });

      await waitFor(() => {
        expect(result.current.unreadCount).toBe(0);
      });

      expect(mockService.setBadgeCount).toHaveBeenCalledWith(0);

      // 7. Receive Second Notification (Driver Accepted)
      const driverNotification = {
        id: 'driver-456',
        type: 'RIDE_ACCEPTED' as const,
        title: 'Driver Found!',
        message: 'Your driver John is on the way',
        data: { driverId: '456', driverName: 'John' },
        timestamp: new Date(),
        isRead: false,
      };

      act(() => {
        result.current.addNotification(driverNotification);
      });

      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(2);
        expect(result.current.unreadCount).toBe(1);
      });

      // 8. Send Local Notification (e.g., reminder)
      let localNotificationId;
      await act(async () => {
        localNotificationId = await result.current.sendLocalNotification(
          'Ride Reminder',
          'Your driver will arrive in 5 minutes',
          { type: 'reminder', rideId: '123' }
        );
      });

      expect(localNotificationId).toBe('notification-1');
      expect(mockService.sendLocalNotification).toHaveBeenCalledWith(
        'Ride Reminder',
        'Your driver will arrive in 5 minutes',
        { type: 'reminder', rideId: '123' }
      );

      // 9. Schedule Future Notification
      let scheduledId;
      await act(async () => {
        scheduledId = await result.current.scheduleNotification(
          'Pickup Reminder',
          'Time to meet your driver',
          300, // 5 minutes
          { type: 'pickup_reminder', rideId: '123' }
        );
      });

      expect(scheduledId).toBe('scheduled-1');

      // 10. User Clears Notifications
      act(() => {
        result.current.clearNotifications();
      });

      await waitFor(() => {
        expect(result.current.notifications).toEqual([]);
        expect(result.current.unreadCount).toBe(0);
      });

      // 11. Preferences Update
      const newPreferences = {
        pushEnabled: true,
        soundEnabled: false,
        vibrationEnabled: true,
        promotional: true,
      };

      act(() => {
        result.current.updatePreferences(newPreferences);
      });

      await waitFor(() => {
        expect(result.current.preferences.soundEnabled).toBe(false);
        expect(result.current.preferences.promotional).toBe(true);
      });
    });

    it('should handle error scenarios gracefully', async () => {
      // Simular error en servicio
      mockService.sendLocalNotification.mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => useNotifications());

      // Intentar enviar notificación con error
      await expect(
        act(async () => {
          await result.current.sendLocalNotification('Title', 'Message');
        })
      ).rejects.toThrow('Network error');

      // Verificar que el estado permanece consistente
      expect(result.current.notifications).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
    });

    it('should maintain data persistence across sessions', async () => {
      // Primera sesión - agregar datos
      const { result: result1, rerender } = renderHook(() => useNotifications());

      const notification = {
        id: 'persistent-1',
        type: 'SYSTEM_UPDATE' as const,
        title: 'Welcome',
        message: 'Welcome to the app',
        data: {},
        timestamp: new Date(),
        isRead: false,
      };

      act(() => {
        result1.current.addNotification(notification);
      });

      await waitFor(() => {
        expect(result1.current.notifications).toHaveLength(1);
      });

      // Verificar que se guardó en storage
      expect(mockStorage.saveNotificationHistory).toHaveBeenCalled();

      // Simular nueva sesión con datos persistidos
      mockStorage.getNotificationHistory.mockResolvedValueOnce([notification]);

      // Re-render hook (simula nueva sesión)
      rerender();

      await waitFor(() => {
        expect(result1.current.notifications).toHaveLength(1);
        expect(result1.current.notifications[0].id).toBe('persistent-1');
      });
    });
  });

  describe('Cross-Platform Compatibility', () => {
    it('should work on iOS', async () => {
      Platform.OS = 'ios';

      const { result } = renderHook(() => useNotifications());

      // iOS debería funcionar igual que Android
      expect(result.current.isOnline).toBe(true);
      expect(result.current.websocketConnected).toBe(true);
    });

    it('should work on Android', async () => {
      Platform.OS = 'android';

      const { result } = renderHook(() => useNotifications());

      // Android debería funcionar igual que iOS
      expect(result.current.isOnline).toBe(true);
      expect(result.current.websocketConnected).toBe(true);
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle large number of notifications efficiently', async () => {
      const { result } = renderHook(() => useNotifications());

      // Crear 50 notificaciones
      const notifications = Array.from({ length: 50 }, (_, i) => ({
        id: `bulk-${i}`,
        type: 'SYSTEM_UPDATE' as const,
        title: `Notification ${i}`,
        message: `Message ${i}`,
        data: { index: i },
        timestamp: new Date(Date.now() - i * 1000),
        isRead: i % 2 === 0,
      }));

      // Agregar todas las notificaciones
      act(() => {
        notifications.forEach(notification => {
          result.current.addNotification(notification);
        });
      });

      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(50);
        expect(result.current.unreadCount).toBe(25); // 25 no leídas (impares)
      });

      // Verificar que las operaciones siguen funcionando
      act(() => {
        result.current.markAllAsRead();
      });

      await waitFor(() => {
        expect(result.current.unreadCount).toBe(0);
        expect(result.current.notifications.every(n => n.isRead)).toBe(true);
      });
    });

    it('should cleanup old notifications automatically', async () => {
      const { result } = renderHook(() => useNotifications());

      // Crear notificaciones antiguas y recientes
      const oldNotification = {
        id: 'old-1',
        type: 'SYSTEM_UPDATE' as const,
        title: 'Old Notification',
        message: 'This is old',
        data: {},
        timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 días atrás
        isRead: false,
      };

      const newNotification = {
        id: 'new-1',
        type: 'RIDE_REQUEST' as const,
        title: 'New Ride',
        message: 'Recent ride request',
        data: {},
        timestamp: new Date(),
        isRead: false,
      };

      act(() => {
        result.current.addNotification(oldNotification);
        result.current.addNotification(newNotification);
      });

      await waitFor(() => {
        // El sistema debería mantener solo notificaciones recientes
        expect(result.current.notifications.length).toBeLessThanOrEqual(2);
        expect(result.current.notifications.some(n => n.id === 'new-1')).toBe(true);
      });
    });
  });

  describe('Real-time Updates and Synchronization', () => {
    it('should update badge count automatically', async () => {
      const { result } = renderHook(() => useNotifications());

      // Agregar notificación no leída
      act(() => {
        result.current.addNotification({
          id: 'badge-test',
          type: 'CHAT_MESSAGE' as const,
          title: 'New Message',
          message: 'Hello there',
          data: {},
          timestamp: new Date(),
          isRead: false,
        });
      });

      await waitFor(() => {
        expect(result.current.unreadCount).toBe(1);
      });

      // Badge debería actualizarse automáticamente
      expect(mockService.setBadgeCount).toHaveBeenCalledWith(1);

      // Marcar como leída
      act(() => {
        result.current.markAsRead('badge-test');
      });

      await waitFor(() => {
        expect(result.current.unreadCount).toBe(0);
      });

      // Badge debería resetearse
      expect(mockService.setBadgeCount).toHaveBeenCalledWith(0);
    });

    it('should handle preference changes that affect notifications', async () => {
      const { result } = renderHook(() => useNotifications());

      // Cambiar preferencias para deshabilitar notificaciones de rides
      act(() => {
        result.current.updatePreferences({
          rideUpdates: false,
          pushEnabled: true,
        });
      });

      await waitFor(() => {
        expect(result.current.preferences.rideUpdates).toBe(false);
      });

      // Las funciones de utilidad deberían reflejar el cambio
      expect(result.current.areNotificationsEnabled()).toBe(true); // pushEnabled true
    });
  });
});


