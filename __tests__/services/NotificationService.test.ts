import { NotificationService } from "../../app/services/notificationService";
import { logger } from "../../lib/logger";

// Mock AsyncStorage first
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock expo-notifications
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  presentNotificationAsync: jest.fn(),
  setBadgeCountAsync: jest.fn(),
  AndroidNotificationPriority: {
    DEFAULT: "default",
    HIGH: "high",
    LOW: "low",
    MAX: "max",
    MIN: "min",
  },
  SchedulableTriggerInputTypes: {
    TIME_INTERVAL: "timeInterval",
  },
}));

// Mock firebase service
jest.mock("../../app/services/firebaseService", () => ({
  firebaseService: {
    getFCMToken: jest.fn(),
    requestPermissions: jest.fn(),
    initializeFirebase: jest.fn(),
  },
}));

// Mock logger
jest.mock("../../lib/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    critical: jest.fn(),
  },
  log: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    critical: jest.fn(),
  },
}));

const mockLogger = require("../../lib/logger").logger;

describe("NotificationService", () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    notificationService = NotificationService.getInstance();
  });

  describe("Initialization", () => {
    it("should return singleton instance", () => {
      const instance1 = NotificationService.getInstance();
      const instance2 = NotificationService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("Device Token", () => {
    it("should get device token successfully", async () => {
      const mockToken = "mock-fcm-token-123";
      const mockFirebaseService =
        require("../../app/services/firebaseService").firebaseService;
      mockFirebaseService.getFCMToken.mockResolvedValue(mockToken);

      const token = await notificationService.getDeviceToken();

      expect(token).toBe(mockToken);
      expect(mockLogger.info).toHaveBeenCalledWith(
        "NotificationService",
        "Requesting FCM device token",
        expect.objectContaining({
          tokenRequestId: expect.any(String),
          platform: expect.any(String),
          hasFirebaseService: true,
        }),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "NotificationService",
        "FCM device token retrieved successfully",
        expect.objectContaining({
          tokenRequestId: expect.any(String),
          tokenLength: mockToken.length,
          tokenPrefix: "mock-fcm-...",
        }),
      );
    });

    it("should handle token retrieval failure", async () => {
      const mockFirebaseService =
        require("../../app/services/firebaseService").firebaseService;
      mockFirebaseService.getFCMToken.mockResolvedValue(null);

      const token = await notificationService.getDeviceToken();

      expect(token).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "NotificationService",
        "FCM device token retrieval failed",
        expect.objectContaining({
          tokenRequestId: expect.any(String),
          reason: "Token is null or undefined",
        }),
      );
    });

    it("should handle errors during token retrieval", async () => {
      const mockError = new Error("Firebase error");
      const mockFirebaseService =
        require("../../app/services/firebaseService").firebaseService;
      mockFirebaseService.getFCMToken.mockRejectedValue(mockError);

      const token = await notificationService.getDeviceToken();

      expect(token).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        "NotificationService",
        "Failed to get device token",
        expect.objectContaining({
          tokenRequestId: expect.any(String),
          error: "Firebase error",
        }),
        mockError,
      );
    });
  });

  describe("Scheduled Notifications", () => {
    const mockNotifications = require("expo-notifications");

    it("should schedule notification successfully", async () => {
      const mockNotificationId = "scheduled-notification-123";
      mockNotifications.scheduleNotificationAsync.mockResolvedValue(
        mockNotificationId,
      );

      const result = await notificationService.scheduleNotification(
        "Test Title",
        "Test Body",
        300,
        { userId: "123" },
      );

      expect(result).toBe(mockNotificationId);
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Test Title",
          body: "Test Body",
          data: { userId: "123" },
          sound: "default",
          priority: "default",
          sticky: false,
          autoDismiss: true,
        },
        trigger: {
          seconds: 300,
          type: "timeInterval",
        },
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        "NotificationService",
        "Scheduling local notification",
        expect.objectContaining({
          notificationId: expect.any(String),
          title: "Test Title",
          bodyLength: 9,
          delayInSeconds: 300,
          hasData: true,
          soundEnabled: true,
          vibrationEnabled: true,
        }),
      );
    });

    it("should handle scheduling errors with fallback", async () => {
      const mockError = new Error("Scheduling failed");
      mockNotifications.scheduleNotificationAsync.mockRejectedValue(mockError);

      const result = await notificationService.scheduleNotification(
        "Test Title",
        "Test Body",
        300,
      );

      expect(result).toMatch(/^scheduled_/);
      expect(mockLogger.error).toHaveBeenCalledWith(
        "NotificationService",
        "Failed to schedule local notification",
        expect.objectContaining({
          notificationId: expect.any(String),
          title: "Test Title",
          delayInSeconds: 300,
          error: "Scheduling failed",
        }),
        mockError,
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "NotificationService",
        "Using fallback notification (not scheduled)",
        expect.objectContaining({
          notificationId: expect.any(String),
          reason: "expo-notifications scheduling failed",
        }),
      );
    });
  });

  describe("Push Notifications", () => {
    const mockNotifications = require("expo-notifications");

    it("should send push notification successfully", async () => {
      const mockPushId = "push-notification-123";
      mockNotifications.presentNotificationAsync.mockResolvedValue(mockPushId);

      const result = await notificationService.sendPushNotification(
        "Push Title",
        "Push Body",
        { type: "ride_request" },
        { sound: true, priority: "high" },
      );

      expect(result).toBe(mockPushId);
      expect(mockNotifications.presentNotificationAsync).toHaveBeenCalledWith({
        title: "Push Title",
        body: "Push Body",
        data: { type: "ride_request" },
        sound: true,
        priority: "high",
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        "NotificationService",
        "Push notification sent successfully",
        expect.objectContaining({
          notificationId: expect.any(String),
          pushId: mockPushId,
          title: "Push Title",
          immediate: true,
        }),
      );
    });

    it("should handle push notification errors with fallback", async () => {
      const mockError = new Error("Push failed");
      mockNotifications.presentNotificationAsync.mockRejectedValue(mockError);

      const result = await notificationService.sendPushNotification(
        "Push Title",
        "Push Body",
      );

      expect(result).toMatch(/^push_/);
      expect(mockLogger.error).toHaveBeenCalledWith(
        "NotificationService",
        "Failed to send push notification",
        expect.objectContaining({
          notificationId: expect.any(String),
          title: "Push Title",
          error: "Push failed",
        }),
        mockError,
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "NotificationService",
        "Using fallback notification (no push sent)",
        expect.objectContaining({
          notificationId: expect.any(String),
          reason: "expo-notifications present failed",
        }),
      );
    });
  });

  describe("Notification Management", () => {
    const mockNotifications = require("expo-notifications");

    it("should cancel notification successfully", async () => {
      mockNotifications.cancelScheduledNotificationAsync.mockResolvedValue(
        undefined,
      );

      await notificationService.cancelNotification("notification-123");

      expect(
        mockNotifications.cancelScheduledNotificationAsync,
      ).toHaveBeenCalledWith("notification-123");
      expect(mockLogger.info).toHaveBeenCalledWith(
        "NotificationService",
        "Notification cancelled successfully",
        { notificationId: "notification-123" },
      );
    });

    it("should handle cancellation errors gracefully", async () => {
      const mockError = new Error("Cancellation failed");
      mockNotifications.cancelScheduledNotificationAsync.mockRejectedValue(
        mockError,
      );

      // Should not throw
      await expect(
        notificationService.cancelNotification("notification-123"),
      ).resolves.toBeUndefined();

      expect(mockLogger.error).toHaveBeenCalledWith(
        "NotificationService",
        "Failed to cancel notification",
        expect.objectContaining({
          notificationId: "notification-123",
          error: "Cancellation failed",
        }),
        mockError,
      );
    });

    it("should cancel all notifications successfully", async () => {
      mockNotifications.cancelAllScheduledNotificationsAsync.mockResolvedValue(
        undefined,
      );

      await notificationService.cancelAllNotifications();

      expect(
        mockNotifications.cancelAllScheduledNotificationsAsync,
      ).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        "NotificationService",
        "All scheduled notifications cancelled successfully",
      );
    });

    it("should handle cancel all errors gracefully", async () => {
      const mockError = new Error("Cancel all failed");
      mockNotifications.cancelAllScheduledNotificationsAsync.mockRejectedValue(
        mockError,
      );

      await expect(
        notificationService.cancelAllNotifications(),
      ).resolves.toBeUndefined();

      expect(mockLogger.error).toHaveBeenCalledWith(
        "NotificationService",
        "Failed to cancel all notifications",
        { error: "Cancel all failed" },
        mockError,
      );
    });
  });

  describe("Badge Management", () => {
    const mockNotifications = require("expo-notifications");

    it("should set badge count successfully", async () => {
      mockNotifications.setBadgeCountAsync.mockResolvedValue(undefined);

      await notificationService.setBadgeCount(5);

      expect(mockNotifications.setBadgeCountAsync).toHaveBeenCalledWith(5);
      expect(mockLogger.info).toHaveBeenCalledWith(
        "NotificationService",
        "Badge count set successfully",
        { count: 5, platform: expect.any(String) },
      );
    });

    it("should handle badge count errors gracefully", async () => {
      const mockError = new Error("Badge count failed");
      mockNotifications.setBadgeCountAsync.mockRejectedValue(mockError);

      await expect(
        notificationService.setBadgeCount(5),
      ).resolves.toBeUndefined();

      expect(mockLogger.error).toHaveBeenCalledWith(
        "NotificationService",
        "Failed to set badge count",
        expect.objectContaining({
          count: 5,
          error: "Badge count failed",
        }),
        mockError,
      );
    });
  });
});
