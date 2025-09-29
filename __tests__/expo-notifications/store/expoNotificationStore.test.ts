import { act } from '@testing-library/react-native';
import { create } from 'zustand';

// Mock del logger
jest.mock('@/lib/logger', () => ({
  log: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock del servicio de notificaciones
jest.mock('@/app/services/expo-notifications', () => ({
  expoNotificationService: {
    simulateNotification: jest.fn(),
  },
}));

import { useExpoNotificationStore } from '@/store/expo-notifications/expoNotificationStore';
import { ExpoNotificationData, ExpoNotificationPreferences, ExpoPushToken, ExpoNotificationPermissions } from '../../../../types/expo-notifications';

describe('useExpoNotificationStore', () => {
  let store: ReturnType<typeof useExpoNotificationStore.getState>;

  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useExpoNotificationStore.setState({
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
        lastSync: null,
        token: null,
        permissions: null,
      });
    });
    store = useExpoNotificationStore.getState();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(store.notifications).toEqual([]);
      expect(store.unreadCount).toBe(0);
      expect(store.preferences.pushEnabled).toBe(true);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.token).toBeNull();
      expect(store.permissions).toBeNull();
    });
  });

  describe('addNotification()', () => {
    it('should add notification to empty list', () => {
      const notification: ExpoNotificationData = {
        id: 'test-1',
        type: 'SYSTEM_UPDATE',
        title: 'Test Notification',
        message: 'Test message',
        data: {},
        timestamp: new Date(),
        isRead: false,
        priority: 'normal',
      };

      act(() => {
        store.addNotification(notification);
      });

      const updatedStore = useExpoNotificationStore.getState();
      expect(updatedStore.notifications).toHaveLength(1);
      expect(updatedStore.notifications[0]).toEqual(notification);
      expect(updatedStore.unreadCount).toBe(1);
    });

    it('should add notification to existing list', () => {
      const existingNotification: ExpoNotificationData = {
        id: 'existing-1',
        type: 'SYSTEM_UPDATE',
        title: 'Existing',
        message: 'Existing message',
        data: {},
        timestamp: new Date(),
        isRead: false,
        priority: 'normal',
      };

      const newNotification: ExpoNotificationData = {
        id: 'new-1',
        type: 'RIDE_REQUEST',
        title: 'New Ride',
        message: 'New ride request',
        data: {},
        timestamp: new Date(),
        isRead: false,
        priority: 'high',
      };

      act(() => {
        store.addNotification(existingNotification);
        store.addNotification(newNotification);
      });

      const updatedStore = useExpoNotificationStore.getState();
      expect(updatedStore.notifications).toHaveLength(2);
      expect(updatedStore.notifications[0]).toEqual(newNotification); // Most recent first
      expect(updatedStore.notifications[1]).toEqual(existingNotification);
      expect(updatedStore.unreadCount).toBe(2);
    });

    it('should update existing notification', () => {
      const originalNotification: ExpoNotificationData = {
        id: 'test-1',
        type: 'SYSTEM_UPDATE',
        title: 'Original',
        message: 'Original message',
        data: {},
        timestamp: new Date(),
        isRead: false,
        priority: 'normal',
      };

      const updatedNotification: ExpoNotificationData = {
        id: 'test-1',
        type: 'SYSTEM_UPDATE',
        title: 'Updated',
        message: 'Updated message',
        data: { updated: true },
        timestamp: new Date(),
        isRead: true,
        priority: 'high',
      };

      act(() => {
        store.addNotification(originalNotification);
        store.addNotification(updatedNotification);
      });

      const updatedStore = useExpoNotificationStore.getState();
      expect(updatedStore.notifications).toHaveLength(1);
      expect(updatedStore.notifications[0]).toEqual(updatedNotification);
      expect(updatedStore.unreadCount).toBe(0); // Updated to read
    });

    it('should maintain maximum of 100 notifications', () => {
      // Add 101 notifications
      for (let i = 1; i <= 101; i++) {
        const notification: ExpoNotificationData = {
          id: `notification-${i}`,
          type: 'SYSTEM_UPDATE',
          title: `Notification ${i}`,
          message: `Message ${i}`,
          data: {},
          timestamp: new Date(),
          isRead: false,
          priority: 'normal',
        };

        act(() => {
          store.addNotification(notification);
        });
      }

      const updatedStore = useExpoNotificationStore.getState();
      expect(updatedStore.notifications).toHaveLength(100);
      expect(updatedStore.notifications[0].id).toBe('notification-101'); // Most recent
      expect(updatedStore.notifications[99].id).toBe('notification-2'); // Second most recent
    });

    it('should not count read notifications in unread count', () => {
      const readNotification: ExpoNotificationData = {
        id: 'read-1',
        type: 'SYSTEM_UPDATE',
        title: 'Read Notification',
        message: 'Read message',
        data: {},
        timestamp: new Date(),
        isRead: true,
        priority: 'normal',
      };

      const unreadNotification: ExpoNotificationData = {
        id: 'unread-1',
        type: 'SYSTEM_UPDATE',
        title: 'Unread Notification',
        message: 'Unread message',
        data: {},
        timestamp: new Date(),
        isRead: false,
        priority: 'normal',
      };

      act(() => {
        store.addNotification(readNotification);
        store.addNotification(unreadNotification);
      });

      const updatedStore = useExpoNotificationStore.getState();
      expect(updatedStore.unreadCount).toBe(1);
    });
  });

  describe('markAsRead()', () => {
    it('should mark notification as read', () => {
      const notification: ExpoNotificationData = {
        id: 'test-1',
        type: 'SYSTEM_UPDATE',
        title: 'Test',
        message: 'Test message',
        data: {},
        timestamp: new Date(),
        isRead: false,
        priority: 'normal',
      };

      act(() => {
        store.addNotification(notification);
        store.markAsRead('test-1');
      });

      const updatedStore = useExpoNotificationStore.getState();
      expect(updatedStore.notifications[0].isRead).toBe(true);
      expect(updatedStore.unreadCount).toBe(0);
    });

    it('should update unread count correctly', () => {
      const notifications: ExpoNotificationData[] = [
        {
          id: '1',
          type: 'SYSTEM_UPDATE',
          title: 'Test 1',
          message: 'Message 1',
          data: {},
          timestamp: new Date(),
          isRead: false,
          priority: 'normal',
        },
        {
          id: '2',
          type: 'SYSTEM_UPDATE',
          title: 'Test 2',
          message: 'Message 2',
          data: {},
          timestamp: new Date(),
          isRead: false,
          priority: 'normal',
        },
      ];

      act(() => {
        notifications.forEach(n => store.addNotification(n));
        store.markAsRead('1');
      });

      const updatedStore = useExpoNotificationStore.getState();
      expect(updatedStore.unreadCount).toBe(1);
    });

    it('should do nothing for non-existent notification', () => {
      act(() => {
        store.markAsRead('non-existent');
      });

      const updatedStore = useExpoNotificationStore.getState();
      expect(updatedStore.notifications).toHaveLength(0);
      expect(updatedStore.unreadCount).toBe(0);
    });
  });

  describe('markAllAsRead()', () => {
    it('should mark all notifications as read', () => {
      const notifications: ExpoNotificationData[] = [
        {
          id: '1',
          type: 'SYSTEM_UPDATE',
          title: 'Test 1',
          message: 'Message 1',
          data: {},
          timestamp: new Date(),
          isRead: false,
          priority: 'normal',
        },
        {
          id: '2',
          type: 'SYSTEM_UPDATE',
          title: 'Test 2',
          message: 'Message 2',
          data: {},
          timestamp: new Date(),
          isRead: false,
          priority: 'normal',
        },
      ];

      act(() => {
        notifications.forEach(n => store.addNotification(n));
        store.markAllAsRead();
      });

      const updatedStore = useExpoNotificationStore.getState();
      expect(updatedStore.notifications.every(n => n.isRead)).toBe(true);
      expect(updatedStore.unreadCount).toBe(0);
    });
  });

  describe('clearNotifications()', () => {
    it('should clear all notifications', () => {
      const notification: ExpoNotificationData = {
        id: 'test-1',
        type: 'SYSTEM_UPDATE',
        title: 'Test',
        message: 'Test message',
        data: {},
        timestamp: new Date(),
        isRead: false,
        priority: 'normal',
      };

      act(() => {
        store.addNotification(notification);
        store.clearNotifications();
      });

      const updatedStore = useExpoNotificationStore.getState();
      expect(updatedStore.notifications).toHaveLength(0);
      expect(updatedStore.unreadCount).toBe(0);
    });
  });

  describe('updatePreferences()', () => {
    it('should update notification preferences', () => {
      const newPreferences: ExpoNotificationPreferences = {
        pushEnabled: false,
        smsEnabled: true,
        rideUpdates: false,
        driverMessages: true,
        promotional: true,
        emergencyAlerts: true,
        soundEnabled: false,
        vibrationEnabled: true,
        badgeEnabled: true,
        quietHoursEnabled: true,
        quietHoursStart: "23:00",
        quietHoursEnd: "07:00",
      };

      act(() => {
        store.updatePreferences(newPreferences);
      });

      const updatedStore = useExpoNotificationStore.getState();
      expect(updatedStore.preferences).toEqual(newPreferences);
    });
  });

  describe('setToken()', () => {
    it('should set push token', () => {
      const token: ExpoPushToken = {
        type: 'expo',
        data: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
      };

      act(() => {
        store.setToken(token);
      });

      const updatedStore = useExpoNotificationStore.getState();
      expect(updatedStore.token).toEqual(token);
    });

    it('should clear push token', () => {
      act(() => {
        store.setToken(null);
      });

      const updatedStore = useExpoNotificationStore.getState();
      expect(updatedStore.token).toBeNull();
    });
  });

  describe('setPermissions()', () => {
    it('should set notification permissions', () => {
      const permissions: ExpoNotificationPermissions = {
        granted: true,
        canAskAgain: true,
        status: 'granted',
      };

      act(() => {
        store.setPermissions(permissions);
      });

      const updatedStore = useExpoNotificationStore.getState();
      expect(updatedStore.permissions).toEqual(permissions);
    });
  });

  describe('setLoading() and setError()', () => {
    it('should set loading state', () => {
      act(() => {
        store.setLoading(true);
      });

      let updatedStore = useExpoNotificationStore.getState();
      expect(updatedStore.isLoading).toBe(true);

      act(() => {
        store.setLoading(false);
      });

      updatedStore = useExpoNotificationStore.getState();
      expect(updatedStore.isLoading).toBe(false);
    });

    it('should set error state', () => {
      const errorMessage = 'Test error';

      act(() => {
        store.setError(errorMessage);
      });

      let updatedStore = useExpoNotificationStore.getState();
      expect(updatedStore.error).toBe(errorMessage);

      act(() => {
        store.setError(null);
      });

      updatedStore = useExpoNotificationStore.getState();
      expect(updatedStore.error).toBeNull();
    });
  });

  describe('syncWithServer()', () => {
    it('should handle successful sync', async () => {
      const mockSync = jest.fn().mockResolvedValue(undefined);

      act(() => {
        store.syncWithServer = mockSync;
      });

      await act(async () => {
        await store.syncWithServer();
      });

      expect(mockSync).toHaveBeenCalled();
    });

    it('should handle sync error', async () => {
      const errorMessage = 'Sync failed';
      const mockSync = jest.fn().mockRejectedValue(new Error(errorMessage));

      act(() => {
        store.syncWithServer = mockSync;
        store.setLoading(true);
        store.setError(null);
      });

      await act(async () => {
        await expect(store.syncWithServer()).rejects.toThrow(errorMessage);
      });

      const updatedStore = useExpoNotificationStore.getState();
      expect(updatedStore.isLoading).toBe(false);
      expect(updatedStore.error).toBe(errorMessage);
    });
  });

  describe('removeNotification()', () => {
    it('should remove specific notification', () => {
      const notification1: ExpoNotificationData = {
        id: '1',
        type: 'SYSTEM_UPDATE',
        title: 'Test 1',
        message: 'Message 1',
        data: {},
        timestamp: new Date(),
        isRead: false,
        priority: 'normal',
      };

      const notification2: ExpoNotificationData = {
        id: '2',
        type: 'SYSTEM_UPDATE',
        title: 'Test 2',
        message: 'Message 2',
        data: {},
        timestamp: new Date(),
        isRead: true,
        priority: 'normal',
      };

      act(() => {
        store.addNotification(notification1);
        store.addNotification(notification2);
        store.removeNotification('1');
      });

      const updatedStore = useExpoNotificationStore.getState();
      expect(updatedStore.notifications).toHaveLength(1);
      expect(updatedStore.notifications[0].id).toBe('2');
      expect(updatedStore.unreadCount).toBe(0); // notification2 was already read
    });

    it('should update unread count when removing unread notification', () => {
      const notification1: ExpoNotificationData = {
        id: '1',
        type: 'SYSTEM_UPDATE',
        title: 'Test 1',
        message: 'Message 1',
        data: {},
        timestamp: new Date(),
        isRead: false,
        priority: 'normal',
      };

      const notification2: ExpoNotificationData = {
        id: '2',
        type: 'SYSTEM_UPDATE',
        title: 'Test 2',
        message: 'Message 2',
        data: {},
        timestamp: new Date(),
        isRead: false,
        priority: 'normal',
      };

      act(() => {
        store.addNotification(notification1);
        store.addNotification(notification2);
        store.removeNotification('1');
      });

      const updatedStore = useExpoNotificationStore.getState();
      expect(updatedStore.unreadCount).toBe(1); // Only notification2 remains unread
    });
  });
});
