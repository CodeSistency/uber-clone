import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

// Importar tipos necesarios para tests
import { ExpoNotificationError } from "../../../types/expo-notifications";

// Mock de Expo Notifications
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  setBadgeCountAsync: jest.fn(),
  getBadgeCountAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  deleteNotificationChannelAsync: jest.fn(),
  getNotificationChannelsAsync: jest.fn(),
  AndroidImportance: {
    MIN: 1,
    LOW: 2,
    DEFAULT: 3,
    HIGH: 4,
  },
  AndroidNotificationPriority: {
    MIN: -2,
    LOW: -1,
    DEFAULT: 0,
    HIGH: 1,
    MAX: 2,
  },
}));

// Mock del logger
jest.mock("@/lib/logger", () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock del store
jest.mock("@/store/expo-notifications/expoNotificationStore", () => ({
  useExpoNotificationStore: {
    getState: jest.fn(() => ({
      addNotification: jest.fn(),
      setToken: jest.fn(),
      setPermissions: jest.fn(),
    })),
  },
}));

// Mock del config
jest.mock("@/lib/expo-notifications/config", () => ({
  expoNotificationConfig: {
    getConfig: jest.fn(() => ({
      showInForeground: true,
      playSound: true,
      showBadge: true,
      autoDismiss: true,
      vibrate: true,
    })),
    setupExpoNotificationHandler: jest.fn(),
    setupExpoAndroidChannels: jest.fn(),
  },
}));

// Mock del token manager
jest.mock("@/lib/expo-notifications/tokenManager", () => ({
  expoTokenManager: {
    getPushToken: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

import { expoNotificationService } from "@/app/services/expo-notifications/expoNotificationService";

describe("ExpoNotificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset del servicio singleton
    (expoNotificationService as any).isInitialized = false;
    (expoNotificationService as any).notificationSubscription = null;
    (expoNotificationService as any).responseSubscription = null;
  });

  describe("initialize()", () => {
    it("should initialize service successfully on first call", async () => {
      // Mock successful initialization
      const mockGetPushToken = jest
        .fn()
        .mockResolvedValue({ type: "expo", data: "token123" });
      const mockRequestPermissions = jest
        .fn()
        .mockResolvedValue({ granted: true, status: "granted" });

      jest
        .mocked(
          require("@/lib/expo-notifications/tokenManager").expoTokenManager
            .getPushToken,
        )
        .mockImplementation(mockGetPushToken);
      jest
        .mocked(Notifications.getPermissionsAsync)
        .mockResolvedValue({
          status: Notifications.PermissionStatus.GRANTED,
          granted: true,
          canAskAgain: true,
          expires: 'never'
        } as any);
      jest
        .mocked(Notifications.requestPermissionsAsync)
        .mockResolvedValue({
          status: Notifications.PermissionStatus.GRANTED,
          granted: true,
          canAskAgain: true,
          expires: 'never'
        } as any);

      const result = await expoNotificationService.initialize();

      expect(result).toBeUndefined(); // initialize() returns void on success
      expect(expoNotificationService["isInitialized"]).toBe(true);
    });

    it("should handle permission denied gracefully", async () => {
      const mockRequestPermissions = jest
        .fn()
        .mockResolvedValue({
          granted: false,
          status: Notifications.PermissionStatus.DENIED,
          canAskAgain: true,
          expires: undefined
        });

      jest
        .mocked(Notifications.requestPermissionsAsync)
        .mockResolvedValue({
          granted: false,
          status: Notifications.PermissionStatus.DENIED,
          canAskAgain: true,
          expires: 'never'
        } as any);

      await expect(expoNotificationService.initialize()).rejects.toThrow();
    });

    it("should setup Android channels on Android platform", async () => {
      Platform.OS = "android";

      const mockSetupAndroidChannels = jest.fn();
      jest
        .mocked(
          require("@/lib/expo-notifications/config").expoNotificationConfig
            .setupExpoAndroidChannels,
        )
        .mockImplementation(mockSetupAndroidChannels);

      await expoNotificationService.initialize();

      expect(mockSetupAndroidChannels).toHaveBeenCalled();
    });

    it("should not setup Android channels on iOS", async () => {
      Platform.OS = "ios";

      const mockSetupAndroidChannels = jest.fn();
      jest
        .mocked(
          require("@/lib/expo-notifications/config").expoNotificationConfig
            .setupExpoAndroidChannels,
        )
        .mockImplementation(mockSetupAndroidChannels);

      await expoNotificationService.initialize();

      expect(mockSetupAndroidChannels).not.toHaveBeenCalled();
    });

    it("should return early if already initialized", async () => {
      expoNotificationService["isInitialized"] = true;

      const result = await expoNotificationService.initialize();

      expect(result).toBeUndefined();
    });
  });

  describe("sendLocalNotification()", () => {
    beforeEach(async () => {
      await expoNotificationService.initialize();
    });

    it("should send local notification successfully", async () => {
      const mockSchedule = jest.fn().mockResolvedValue("notification-id-123");
      jest
        .mocked(Notifications.scheduleNotificationAsync)
        .mockImplementation(mockSchedule);

      const result = await expoNotificationService.sendLocalNotification(
        "Test Title",
        "Test Message",
        { type: "SYSTEM_UPDATE" },
      );

      expect(result).toBe("notification-id-123");
      expect(mockSchedule).toHaveBeenCalledWith({
        content: {
          title: "Test Title",
          subtitle: null,
          body: "Test Message",
          data: { type: "SYSTEM_UPDATE" },
          sound: true,
        },
        trigger: null,
      });
    });

    it("should add notification to store", async () => {
      const mockSchedule = jest.fn().mockResolvedValue("notification-id-123");
      const mockAddNotification = jest.fn();
      const mockStore = { addNotification: mockAddNotification };

      jest
        .mocked(Notifications.scheduleNotificationAsync)
        .mockImplementation(mockSchedule);
      jest
        .mocked(
          require("@/store/expo-notifications/expoNotificationStore")
            .useExpoNotificationStore.getState,
        )
        .mockReturnValue(mockStore);

      await expoNotificationService.sendLocalNotification("Title", "Message");

      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "notification-id-123",
          title: "Title",
          message: "Message",
          type: "SYSTEM_UPDATE",
          isRead: false,
        }),
      );
    });

    it("should throw error when not initialized", async () => {
      expoNotificationService["isInitialized"] = false;

      await expect(
        expoNotificationService.sendLocalNotification("Title", "Message"),
      ).rejects.toThrow("ExpoNotificationService not initialized");
    });
  });

  describe("scheduleNotification()", () => {
    beforeEach(async () => {
      await expoNotificationService.initialize();
    });

    it("should schedule notification with time trigger", async () => {
      const mockSchedule = jest.fn().mockResolvedValue("scheduled-id-123");
      jest
        .mocked(Notifications.scheduleNotificationAsync)
        .mockImplementation(mockSchedule);

      const trigger = { seconds: 300 }; // 5 minutes
      const result = await expoNotificationService.scheduleNotification(
        "Reminder",
        "Time to check the app",
        trigger,
      );

      expect(result).toBe("scheduled-id-123");
      expect(mockSchedule).toHaveBeenCalledWith({
        content: expect.objectContaining({
          title: "Reminder",
          body: "Time to check the app",
        }),
        trigger,
      });
    });
  });

  describe("Permissions", () => {
    describe("requestPermissions()", () => {
      it("should request permissions and update store", async () => {
        const mockPermissions = {
          granted: true,
          status: Notifications.PermissionStatus.GRANTED,
          canAskAgain: true,
          expires: undefined,
        };
        const mockSetPermissions = jest.fn();

        jest
          .mocked(Notifications.getPermissionsAsync)
          .mockResolvedValue({
            status: Notifications.PermissionStatus.UNDETERMINED,
            granted: false,
            canAskAgain: true,
            expires: 'never'
          } as any);
        jest
          .mocked(Notifications.requestPermissionsAsync)
          .mockResolvedValue(mockPermissions as any);
        jest
          .mocked(
            require("@/store/expo-notifications/expoNotificationStore")
              .useExpoNotificationStore.getState,
          )
          .mockReturnValue({
            setPermissions: mockSetPermissions,
          });

        const result = await expoNotificationService.requestPermissions();

        expect(result).toEqual(mockPermissions);
        expect(mockSetPermissions).toHaveBeenCalledWith(mockPermissions);
      });
    });

    describe("checkPermissions()", () => {
      it("should check current permissions", async () => {
        const mockPermissions = {
          status: Notifications.PermissionStatus.GRANTED,
          granted: true,
          canAskAgain: true,
          expires: undefined
        };
        jest
          .mocked(Notifications.getPermissionsAsync)
          .mockResolvedValue(mockPermissions as any);

        const result = await expoNotificationService.checkPermissions();

        expect(result).toEqual({
          granted: true,
          canAskAgain: true,
          status: Notifications.PermissionStatus.GRANTED,
        });
      });
    });
  });

  describe("Badge Management", () => {
    describe("setBadgeCount()", () => {
      it("should set badge count", async () => {
        const mockSetBadge = jest.fn().mockResolvedValue(undefined);
        jest
          .mocked(Notifications.setBadgeCountAsync)
          .mockImplementation(mockSetBadge);

        await expoNotificationService.setBadgeCount(5);

        expect(mockSetBadge).toHaveBeenCalledWith(5);
      });
    });

    describe("getBadgeCount()", () => {
      it("should get badge count", async () => {
        jest.mocked(Notifications.getBadgeCountAsync).mockResolvedValue(3);

        const result = await expoNotificationService.getBadgeCount();

        expect(result).toBe(3);
      });
    });

    describe("clearBadge()", () => {
      it("should clear badge by setting count to 0", async () => {
        const mockSetBadge = jest.fn().mockResolvedValue(undefined);
        jest
          .mocked(Notifications.setBadgeCountAsync)
          .mockImplementation(mockSetBadge);

        await expoNotificationService.clearBadge();

        expect(mockSetBadge).toHaveBeenCalledWith(0);
      });
    });
  });

  describe("Android Channels", () => {
    beforeEach(() => {
      Platform.OS = "android";
    });

    describe("createChannel()", () => {
      it("should create notification channel on Android", async () => {
        const mockChannel = { id: "test", name: "Test Channel" };
        const mockSetChannel = jest.fn().mockResolvedValue(undefined);
        jest
          .mocked(Notifications.setNotificationChannelAsync)
          .mockImplementation(mockSetChannel);

        await expoNotificationService.createChannel(mockChannel);

        expect(mockSetChannel).toHaveBeenCalledWith("test", mockChannel);
      });
    });

    describe("deleteChannel()", () => {
      it("should delete notification channel on Android", async () => {
        const mockDeleteChannel = jest.fn().mockResolvedValue(undefined);
        jest
          .mocked(Notifications.deleteNotificationChannelAsync)
          .mockImplementation(mockDeleteChannel);

        await expoNotificationService.deleteChannel("test-channel");

        expect(mockDeleteChannel).toHaveBeenCalledWith("test-channel");
      });
    });

    describe("getChannels()", () => {
      it("should get notification channels on Android", async () => {
        const mockChannels = [{
          id: "test",
          name: "Test",
          importance: Notifications.AndroidImportance.DEFAULT,
          description: "Test channel",
          sound: "default",
          vibrationPattern: [],
          lightColor: "#ffffff",
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          bypassDnd: false,
          showBadge: true,
          audioAttributes: {},
          enableLights: true,
          enableVibrate: true,
        }];
        jest
          .mocked(Notifications.getNotificationChannelsAsync)
          .mockResolvedValue(mockChannels as any);

        const result = await expoNotificationService.getChannels();

        expect(result).toEqual(mockChannels);
      });
    });
  });

  describe("Event Management", () => {
    describe("addEventListener()", () => {
      it("should add event listener and return listener ID", () => {
        const mockCallback = jest.fn();
        const listenerId = expoNotificationService.addEventListener(
          "notificationReceived",
          mockCallback,
        );

        expect(typeof listenerId).toBe("string");
        expect(listenerId.startsWith("listener_")).toBe(true);
      });
    });

    describe("removeEventListener()", () => {
      it("should remove event listener", () => {
        const mockCallback = jest.fn();
        const listenerId = expoNotificationService.addEventListener(
          "notificationReceived",
          mockCallback,
        );

        const removed = expoNotificationService.removeEventListener(listenerId);

        expect(removed).toBe(true);
      });

      it("should return false for non-existent listener", () => {
        const removed =
          expoNotificationService.removeEventListener("non-existent");

        expect(removed).toBe(false);
      });
    });

    describe("removeAllListeners()", () => {
      it("should remove all listeners for specific event", () => {
        expoNotificationService.addEventListener(
          "notificationReceived",
          jest.fn(),
        );
        expoNotificationService.addEventListener(
          "notificationReceived",
          jest.fn(),
        );
        expoNotificationService.addEventListener(
          "notificationResponse",
          jest.fn(),
        );

        expoNotificationService.removeAllListeners("notificationReceived");

        // Should only have the notificationResponse listener left
        expect((expoNotificationService as any).eventListeners.size).toBe(1);
      });
    });
  });

  describe("Utility Methods", () => {
    describe("getNotificationContent()", () => {
      it("should return correct content for RIDE_REQUEST", () => {
        const content = expoNotificationService.getNotificationContent(
          "RIDE_REQUEST",
          {
            pickupLocation: "123 Main St",
          },
        );

        expect(content).toEqual({
          title: "New Ride Request",
          body: "Pickup at 123 Main St",
        });
      });

      it("should return correct content for RIDE_ACCEPTED", () => {
        const content = expoNotificationService.getNotificationContent(
          "RIDE_ACCEPTED",
          {
            driverName: "John",
          },
        );

        expect(content).toEqual({
          title: "Driver Found!",
          body: "Your driver John",
        });
      });

      it("should return default content for unknown types", () => {
        const content = expoNotificationService.getNotificationContent(
          "UNKNOWN_TYPE" as any,
        );

        expect(content).toEqual({
          title: "Uber",
          body: "You have a new notification",
        });
      });
    });

    describe("simulateNotification()", () => {
      it("should simulate notification reception", () => {
        const mockHandleNotification = jest.spyOn(
          expoNotificationService as any,
          "handleNotificationReceived",
        );

        expoNotificationService.simulateNotification({
          title: "Test",
          body: "Simulation",
          data: { type: "SYSTEM_UPDATE" },
        });

        expect(mockHandleNotification).toHaveBeenCalled();
      });
    });
  });

  describe("destroy()", () => {
    it("should cleanup resources", async () => {
      await expoNotificationService.initialize();

      const mockClearTokens = jest.fn();
      jest
        .mocked(
          require("@/lib/expo-notifications/tokenManager").expoTokenManager
            .clearTokens,
        )
        .mockImplementation(mockClearTokens);

      await expoNotificationService.destroy();

      expect(mockClearTokens).toHaveBeenCalled();
      expect(expoNotificationService["isInitialized"]).toBe(false);
    });
  });
});
