import {
  formatTime,
  formatDate,
  getPriorityFromType,
  shouldShowNotification,
  isQuietHours,
  getChatPreview,
  generateNotificationId,
  getRelativeTime,
  groupNotificationsByDate,
  getNotificationStats,
  validateNotificationConfig,
  createDefaultNotificationConfig,
  areNotificationPreferencesEqual,
  getNotificationIcon,
  getNotificationColor,
} from '@/lib/expo-notifications/utils';
import { ExpoNotificationType, ExpoNotificationData } from '../../../../types/expo-notifications';

describe('Notification Utils', () => {
  describe('formatTime()', () => {
    it('should format minutes less than 60', () => {
      expect(formatTime(30)).toBe('30 min');
      expect(formatTime(5)).toBe('5 min');
    });

    it('should format hours and minutes', () => {
      expect(formatTime(90)).toBe('1h 30m');
      expect(formatTime(60)).toBe('1h 0m');
      expect(formatTime(150)).toBe('2h 30m');
    });

    it('should handle edge cases', () => {
      expect(formatTime(0)).toBe('0 min');
      expect(formatTime(59)).toBe('59 min');
      expect(formatTime(61)).toBe('1h 1m');
    });
  });

  describe('formatDate()', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDate(date.toISOString())).toBe('15 January 2024');
    });

    it('should pad single digit days', () => {
      const date = new Date('2024-01-05T10:30:00Z');
      expect(formatDate(date.toISOString())).toBe('05 January 2024');
    });
  });

  describe('getPriorityFromType()', () => {
    it('should return critical for emergency alerts', () => {
      expect(getPriorityFromType('EMERGENCY_ALERT')).toBe('critical');
    });

    it('should return high for ride requests and driver events', () => {
      expect(getPriorityFromType('RIDE_REQUEST')).toBe('high');
      expect(getPriorityFromType('DRIVER_ARRIVED')).toBe('high');
      expect(getPriorityFromType('RIDE_CANCELLED')).toBe('high');
    });

    it('should return normal for most notifications', () => {
      expect(getPriorityFromType('RIDE_STARTED')).toBe('normal');
      expect(getPriorityFromType('CHAT_MESSAGE')).toBe('normal');
      expect(getPriorityFromType('PAYMENT_SUCCESS')).toBe('normal');
    });

    it('should return low for system and promotional', () => {
      expect(getPriorityFromType('SYSTEM_UPDATE')).toBe('low');
      expect(getPriorityFromType('PROMOTIONAL')).toBe('low');
    });

    it('should return normal for unknown types', () => {
      expect(getPriorityFromType('UNKNOWN_TYPE' as ExpoNotificationType)).toBe('normal');
    });
  });

  describe('shouldShowNotification()', () => {
    const basePreferences = {
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
    };

    it('should return false if push notifications are disabled', () => {
      const preferences = { ...basePreferences, pushEnabled: false };
      expect(shouldShowNotification(preferences, 'RIDE_REQUEST')).toBe(false);
    });

    it('should return true for enabled notification types', () => {
      expect(shouldShowNotification(basePreferences, 'RIDE_REQUEST')).toBe(true);
      expect(shouldShowNotification(basePreferences, 'EMERGENCY_ALERT')).toBe(true);
    });

    it('should return false for disabled specific types', () => {
      const preferences = { ...basePreferences, rideUpdates: false };
      expect(shouldShowNotification(preferences, 'RIDE_REQUEST')).toBe(false);
    });

    it('should always show emergency alerts', () => {
      const preferences = { ...basePreferences, pushEnabled: false };
      // Emergency alerts should always show regardless of pushEnabled setting
      expect(shouldShowNotification(preferences, 'EMERGENCY_ALERT')).toBe(true);
    });

    it('should hide non-critical notifications during quiet hours', () => {
      const preferences = {
        ...basePreferences,
        quietHoursEnabled: true,
        quietHoursStart: "22:00",
        quietHoursEnd: "08:00",
      };

      // Mock current time to be during quiet hours (23:00)
      const quietHour = new Date();
      quietHour.setHours(23, 0, 0, 0);

      expect(shouldShowNotification(preferences, 'RIDE_REQUEST', quietHour)).toBe(false);
      expect(shouldShowNotification(preferences, 'EMERGENCY_ALERT', quietHour)).toBe(true);
    });
  });

  describe('isQuietHours()', () => {
    const preferences = {
      quietHoursEnabled: true,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
    };

    it('should return false if quiet hours are disabled', () => {
      const disabledPreferences = { ...preferences, quietHoursEnabled: false };
      expect(isQuietHours(disabledPreferences)).toBe(false);
    });

    it('should return true during quiet hours', () => {
      const quietTime = new Date();
      quietTime.setHours(23, 30, 0, 0); // 23:30
      expect(isQuietHours(preferences, quietTime)).toBe(true);

      const earlyMorning = new Date();
      earlyMorning.setHours(2, 0, 0, 0); // 02:00
      expect(isQuietHours(preferences, earlyMorning)).toBe(true);
    });

    it('should return false outside quiet hours', () => {
      const afternoon = new Date();
      afternoon.setHours(14, 0, 0, 0); // 14:00
      expect(isQuietHours(preferences, afternoon)).toBe(false);

      const evening = new Date();
      evening.setHours(20, 0, 0, 0); // 20:00
      expect(isQuietHours(preferences, evening)).toBe(false);
    });

    it('should handle overnight quiet hours correctly', () => {
      const lateNight = new Date();
      lateNight.setHours(1, 0, 0, 0); // 01:00 (after midnight, before 08:00)
      expect(isQuietHours(preferences, lateNight)).toBe(true);
    });
  });

  describe('getChatPreview()', () => {
    it('should return full message if under limit', () => {
      const message = 'Hello world';
      expect(getChatPreview(message, 50)).toBe('Hello world');
    });

    it('should truncate long messages', () => {
      const message = 'This is a very long message that should be truncated';
      expect(getChatPreview(message, 20)).toBe('This is a very lon...');
    });

    it('should handle edge cases', () => {
      expect(getChatPreview('', 10)).toBe('');
      expect(getChatPreview('Short', 10)).toBe('Short');
    });
  });

  describe('generateNotificationId()', () => {
    it('should generate unique IDs with prefix', () => {
      const id1 = generateNotificationId('test');
      const id2 = generateNotificationId('test');

      expect(id1).toMatch(/^test_\d+_[\w-]+$/);
      expect(id2).toMatch(/^test_\d+_[\w-]+$/);
      expect(id1).not.toBe(id2);
    });

    it('should use default prefix if none provided', () => {
      const id = generateNotificationId();
      expect(id).toMatch(/^notification_\d+_[\w-]+$/);
    });
  });

  describe('getRelativeTime()', () => {
    it('should return "just now" for very recent dates', () => {
      const now = new Date();
      expect(getRelativeTime(now)).toBe('just now');
    });

    it('should format minutes correctly', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(getRelativeTime(fiveMinutesAgo)).toBe('5 min ago');
    });

    it('should format hours correctly', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(getRelativeTime(twoHoursAgo)).toBe('2 hours ago');
    });

    it('should format days correctly', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(getRelativeTime(threeDaysAgo)).toBe('3 days ago');
    });

    it('should handle singular forms', () => {
      const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
      expect(getRelativeTime(oneHourAgo)).toBe('1 hour ago');

      const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      expect(getRelativeTime(oneDayAgo)).toBe('1 day ago');
    });
  });

  describe('groupNotificationsByDate()', () => {
    it('should group notifications by date', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const notifications: ExpoNotificationData[] = [
        {
          id: '1',
          type: 'SYSTEM_UPDATE',
          title: 'Today 1',
          message: 'Message 1',
          data: {},
          timestamp: today,
          isRead: false,
          priority: 'normal',
        },
        {
          id: '2',
          type: 'SYSTEM_UPDATE',
          title: 'Today 2',
          message: 'Message 2',
          data: {},
          timestamp: today,
          isRead: false,
          priority: 'normal',
        },
        {
          id: '3',
          type: 'SYSTEM_UPDATE',
          title: 'Yesterday',
          message: 'Message 3',
          data: {},
          timestamp: yesterday,
          isRead: false,
          priority: 'normal',
        },
      ];

      const grouped = groupNotificationsByDate(notifications);

      expect(Object.keys(grouped)).toHaveLength(2);
      expect(grouped[today.toDateString()]).toHaveLength(2);
      expect(grouped[yesterday.toDateString()]).toHaveLength(1);
    });
  });

  describe('getNotificationStats()', () => {
    it('should calculate correct statistics', () => {
      const notifications: Array<{ isRead: boolean; type: ExpoNotificationType }> = [
        { isRead: true, type: 'RIDE_REQUEST' },
        { isRead: false, type: 'RIDE_REQUEST' },
        { isRead: false, type: 'CHAT_MESSAGE' },
        { isRead: true, type: 'SYSTEM_UPDATE' },
        { isRead: false, type: 'SYSTEM_UPDATE' },
      ];

      const stats = getNotificationStats(notifications);

      expect(stats.total).toBe(5);
      expect(stats.unread).toBe(3);
      expect(stats.read).toBe(2);
      expect(stats.readRate).toBe(40); // 2/5 * 100

      expect(stats.byType['RIDE_REQUEST']).toBe(2);
      expect(stats.byType['CHAT_MESSAGE']).toBe(1);
      expect(stats.byType['SYSTEM_UPDATE']).toBe(2);
    });
  });

  describe('validateNotificationConfig()', () => {
    it('should validate correct config', () => {
      const config = {
        appName: 'Test App',
        appVersion: '1.0.0',
        autoDismiss: true,
        showInForeground: true,
        playSound: true,
        vibrate: true,
        showBadge: true,
        retryAttempts: 3,
        retryDelay: 1000,
        requestTimeout: 30000,
      };

      const result = validateNotificationConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const config = {};
      const result = validateNotificationConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('appName must be a non-empty string');
      expect(result.errors).toContain('appVersion must be a non-empty string');
    });

    it('should validate quiet hours format', () => {
      const config = {
        appName: 'Test App',
        appVersion: '1.0.0',
        quietHoursEnabled: true,
        quietHoursStart: 'invalid',
        quietHoursEnd: '25:00',
      };

      const result = validateNotificationConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('quietHoursStart must be in HH:mm format');
      expect(result.errors).toContain('quietHoursEnd must be in HH:mm format');
    });
  });

  describe('createDefaultNotificationConfig()', () => {
    it('should return default preferences', () => {
      const defaults = createDefaultNotificationConfig();

      expect(defaults.pushEnabled).toBe(true);
      expect(defaults.smsEnabled).toBe(false);
      expect(defaults.rideUpdates).toBe(true);
      expect(defaults.promotional).toBe(false);
      expect(defaults.quietHoursEnabled).toBe(false);
      expect(defaults.quietHoursStart).toBe("22:00");
      expect(defaults.quietHoursEnd).toBe("08:00");
    });
  });

  describe('areNotificationPreferencesEqual()', () => {
    it('should return true for identical preferences', () => {
      const prefs1 = createDefaultNotificationConfig();
      const prefs2 = createDefaultNotificationConfig();

      expect(areNotificationPreferencesEqual(prefs1, prefs2)).toBe(true);
    });

    it('should return false for different preferences', () => {
      const prefs1 = createDefaultNotificationConfig();
      const prefs2 = { ...prefs1, pushEnabled: false };

      expect(areNotificationPreferencesEqual(prefs1, prefs2)).toBe(false);
    });
  });

  describe('getNotificationIcon()', () => {
    it('should return correct icons for notification types', () => {
      expect(getNotificationIcon('RIDE_REQUEST')).toBe('🚗');
      expect(getNotificationIcon('EMERGENCY_ALERT')).toBe('🚨');
      expect(getNotificationIcon('CHAT_MESSAGE')).toBe('💬');
      expect(getNotificationIcon('SYSTEM_UPDATE')).toBe('🔄');
    });

    it('should return default icon for unknown types', () => {
      expect(getNotificationIcon('UNKNOWN_TYPE' as ExpoNotificationType)).toBe('📱');
    });
  });

  describe('getNotificationColor()', () => {
    it('should return correct colors for notification types', () => {
      expect(getNotificationColor('RIDE_REQUEST')).toBe('#0286FF');
      expect(getNotificationColor('EMERGENCY_ALERT')).toBe('#DC2626');
      expect(getNotificationColor('CHAT_MESSAGE')).toBe('#EC4899');
      expect(getNotificationColor('SYSTEM_UPDATE')).toBe('#6B7280');
    });

    it('should return default color for unknown types', () => {
      expect(getNotificationColor('UNKNOWN_TYPE' as ExpoNotificationType)).toBe('#6B7280');
    });
  });
});
