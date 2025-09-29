import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';

// Mock completo del stack de notificaciones
jest.mock('@/app/services/expo-notifications', () => ({
  expoNotificationService: {
    initialize: jest.fn().mockResolvedValue(undefined),
    sendLocalNotification: jest.fn().mockResolvedValue('notification-id-123'),
    scheduleNotification: jest.fn().mockResolvedValue('scheduled-id-456'),
    cancelNotification: jest.fn().mockResolvedValue(undefined),
    cancelAllNotifications: jest.fn().mockResolvedValue(undefined),
    requestPermissions: jest.fn().mockResolvedValue({ granted: true, status: 'granted' }),
    getPushToken: jest.fn().mockResolvedValue({ type: 'expo', data: 'token123' }),
    setBadgeCount: jest.fn().mockResolvedValue(undefined),
    getDeviceToken: jest.fn().mockResolvedValue('token123'),
  },
}));

// Mock del store Expo
const mockStoreState = {
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
  token: null,
  permissions: null,
  lastSync: null,
  addNotification: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  clearNotifications: jest.fn(),
  updatePreferences: jest.fn(),
  syncWithServer: jest.fn(),
  removeNotification: jest.fn(),
  setLoading: jest.fn(),
  setError: jest.fn(),
  setToken: jest.fn(),
  setPermissions: jest.fn(),
};

jest.mock('@/store/expo-notifications/expoNotificationStore', () => ({
  useExpoNotificationStore: () => mockStoreState,
}));

// Mock del storage legacy
jest.mock('@/app/lib/storage', () => ({
  notificationStorage: {
    savePreferences: jest.fn().mockResolvedValue(undefined),
    getPreferences: jest.fn().mockResolvedValue(null),
    saveNotificationHistory: jest.fn().mockResolvedValue(undefined),
    getNotificationHistory: jest.fn().mockResolvedValue([]),
  },
}));

// Mock del logger
jest.mock('@/lib/logger', () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

import { useNotifications } from '@/app/hooks/useNotifications';

describe('useNotifications - Migration Integration Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset Platform para tests consistentes
    Platform.OS = 'ios';
  });

  describe('Hook Interface Compatibility', () => {
    it('should return the same interface as before migration', async () => {
      const { result } = renderHook(() => useNotifications());

      // Verificar que retorna la misma estructura que antes
      expect(result.current).toHaveProperty('notifications');
      expect(result.current).toHaveProperty('unreadCount');
      expect(result.current).toHaveProperty('preferences');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('sendLocalNotification');
      expect(result.current).toHaveProperty('scheduleNotification');
      expect(result.current).toHaveProperty('cancelNotification');
      expect(result.current).toHaveProperty('getDeviceToken');
      expect(result.current).toHaveProperty('setBadgeCount');
      expect(result.current).toHaveProperty('addNotification');
      expect(result.current).toHaveProperty('markAsRead');
      expect(result.current).toHaveProperty('markAllAsRead');
      expect(result.current).toHaveProperty('clearNotifications');
      expect(result.current).toHaveProperty('updatePreferences');
      expect(result.current).toHaveProperty('removeNotification');
    });

    it('should provide backward compatible data types', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.notifications).toBeInstanceOf(Array);
        expect(typeof result.current.unreadCount).toBe('number');
        expect(typeof result.current.isLoading).toBe('boolean');
        expect(result.current.error).toBeNull();

        // Verificar estructura de notificaciones (legacy format)
        if (result.current.notifications.length > 0) {
          const notification = result.current.notifications[0];
          expect(notification).toHaveProperty('id');
          expect(notification).toHaveProperty('type');
          expect(notification).toHaveProperty('title');
          expect(notification).toHaveProperty('message');
          expect(notification).toHaveProperty('timestamp');
          expect(notification).toHaveProperty('isRead');
          expect(notification.timestamp).toBeInstanceOf(Date);
          expect(typeof notification.isRead).toBe('boolean');
        }

        // Verificar estructura de preferencias (legacy format)
        expect(result.current.preferences).toHaveProperty('pushEnabled');
        expect(result.current.preferences).toHaveProperty('rideUpdates');
        expect(result.current.preferences).toHaveProperty('driverMessages');
        expect(typeof result.current.preferences.pushEnabled).toBe('boolean');
      });
    });
  });

  describe('Functional Compatibility', () => {
    it('should send local notifications through the new system', async () => {
      const { result } = renderHook(() => useNotifications());

      let notificationId;
      await act(async () => {
        notificationId = await result.current.sendLocalNotification(
          'Test Title',
          'Test Message',
          { customData: 'test' }
        );
      });

      expect(mockService.sendLocalNotification).toHaveBeenCalledWith(
        'Test Title',
        'Test Message',
        { customData: 'test' }
      );
      expect(notificationId).toBe('notification-id-123');
    });

    it('should schedule notifications through the new system', async () => {
      const { result } = renderHook(() => useNotifications());

      const scheduledId = await act(async () => {
        return await result.current.scheduleNotification(
          'Reminder',
          'Time to check app',
          300, // 5 minutes
          { reminderId: '123' }
        );
      });

      expect(scheduledId).toBe('scheduled-id-456');
    });

    it('should get device token through the new system', async () => {
      const { result } = renderHook(() => useNotifications());

      const token = await act(async () => {
        return await result.current.getDeviceToken();
      });

      expect(token).toBe('token123');
    });

    it('should request permissions through the new system', async () => {
      const { result } = renderHook(() => useNotifications());

      const permissions = await act(async () => {
        return await result.current.requestPermissions();
      });

      expect(permissions).toEqual({ granted: true, status: 'granted' });
    });

    it('should update badge count through the new system', async () => {
      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.setBadgeCount(5);
      });

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });
  });

  describe('State Management Compatibility', () => {
    it('should handle notification state through the wrapper', async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.notifications.length).toBe(1);
        expect(result.current.unreadCount).toBe(1);
      });

      // Mark as read
      act(() => {
        result.current.markAsRead('expo-1');
      });

      // Unread count should update
      await waitFor(() => {
        expect(result.current.unreadCount).toBe(0);
      });
    });

    it('should handle preferences through the wrapper', async () => {
      const { result } = renderHook(() => useNotifications());

      const newPreferences = {
        pushEnabled: false,
        rideUpdates: false,
        driverMessages: true,
        promotional: true,
        emergencyAlerts: true,
      };

      act(() => {
        result.current.updatePreferences(newPreferences);
      });

      await waitFor(() => {
        expect(result.current.preferences.pushEnabled).toBe(false);
        expect(result.current.preferences.rideUpdates).toBe(false);
        expect(result.current.preferences.promotional).toBe(true);
      });
    });
  });

  describe('Legacy API Compatibility', () => {
    it('should provide legacy utility functions', async () => {
      const { result } = renderHook(() => useNotifications());

      // Test legacy utility functions
      expect(typeof result.current.areNotificationsEnabled).toBe('function');
      expect(typeof result.current.getNotificationsByType).toBe('function');
      expect(typeof result.current.getUnreadNotifications).toBe('function');
      expect(typeof result.current.getNotificationsByPriority).toBe('function');

      // Test utility functions work
      expect(result.current.areNotificationsEnabled()).toBe(true); // pushEnabled && soundEnabled

      const rideNotifications = result.current.getNotificationsByType('RIDE_REQUEST');
      expect(rideNotifications.length).toBe(1);

      const unreadNotifications = result.current.getUnreadNotifications();
      expect(unreadNotifications.length).toBe(1);

      const priorityNotifications = result.current.getNotificationsByPriority('high');
      expect(priorityNotifications.length).toBe(0); // Legacy doesn't support priorities
    });

    it('should provide connection status compatibility', async () => {
      const { result } = renderHook(() => useNotifications());

      // Legacy properties for compatibility
      expect(result.current.isOnline).toBe(true);
      expect(result.current.websocketConnected).toBe(true);
    });
  });

  describe('Migration Data Handling', () => {
    it('should handle empty legacy data gracefully', async () => {
      // Mock empty legacy storage
      const mockStorage = require('@/app/lib/storage').notificationStorage;
      mockStorage.getPreferences.mockResolvedValue(null);
      mockStorage.getNotificationHistory.mockResolvedValue([]);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.notifications).toEqual([]);
        expect(result.current.preferences.pushEnabled).toBe(true); // Default value
      });
    });

    it('should migrate legacy preferences correctly', async () => {
      const legacyPreferences = {
        pushEnabled: false,
        smsEnabled: true,
        rideUpdates: false,
        driverMessages: true,
        promotional: true,
        emergencyAlerts: true,
        soundEnabled: false,
        vibrationEnabled: false,
      };

      const mockStorage = require('@/app/lib/storage').notificationStorage;
      mockStorage.getPreferences.mockResolvedValue(legacyPreferences);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.preferences.pushEnabled).toBe(false);
        expect(result.current.preferences.smsEnabled).toBe(true);
        expect(result.current.preferences.rideUpdates).toBe(false);
        expect(result.current.preferences.soundEnabled).toBe(false);
      });
    });

    it('should migrate legacy notifications correctly', async () => {
      const legacyNotifications = [
        {
          id: 'legacy-1',
          type: 'RIDE_REQUEST' as const,
          title: 'Legacy Ride',
          message: 'Legacy message',
          data: { legacy: true },
          timestamp: new Date(),
          isRead: false,
        },
      ];

      const mockStorage = require('@/app/lib/storage').notificationStorage;
      mockStorage.getNotificationHistory.mockResolvedValue(legacyNotifications);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.notifications.length).toBe(1);
        expect(result.current.notifications[0].title).toBe('Legacy Ride');
      });
    });
  });

  describe('Error Handling Compatibility', () => {
    it('should handle service errors gracefully', async () => {
      const mockService = require('@/app/services/expo-notifications').expoNotificationService;
      mockService.sendLocalNotification.mockRejectedValue(new Error('Service error'));

      const { result } = renderHook(() => useNotifications());

      await expect(
        act(async () => {
          await result.current.sendLocalNotification('Title', 'Message');
        })
      ).rejects.toThrow('Service error');
    });

    it('should maintain error state compatibility', async () => {
      const mockStore = require('@/store/expo-notifications/expoNotificationStore').useExpoNotificationStore;
      mockStore.mockReturnValue({
        ...mockStore(),
        error: 'Test error',
        isLoading: false,
      });

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.error).toBe('Test error');
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});


