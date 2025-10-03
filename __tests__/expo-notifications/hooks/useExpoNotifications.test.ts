import { act, renderHook, waitFor } from "@testing-library/react-native";
import { Platform } from "react-native";

// Mock del servicio
jest.mock("@/app/services/expo-notifications", () => ({
  expoNotificationService: {
    initialize: jest.fn(),
    sendLocalNotification: jest.fn(),
    scheduleNotification: jest.fn(),
    cancelNotification: jest.fn(),
    cancelAllNotifications: jest.fn(),
    requestPermissions: jest.fn(),
    checkPermissions: jest.fn(),
    getPushToken: jest.fn(),
    setBadgeCount: jest.fn(),
  },
}));

// Mock del store
jest.mock("@/store/expo-notifications/expoNotificationStore", () => ({
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
    token: null,
    permissions: null,
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    clearNotifications: jest.fn(),
    updatePreferences: jest.fn(),
    syncWithServer: jest.fn(),
    removeNotification: jest.fn(),
  })),
}));

// Mock de React hooks
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useEffect: jest.fn((callback) => callback()),
}));

import { useExpoNotifications } from "@/app/hooks/expo-notifications/useExpoNotifications";
import { expoNotificationService } from "@/app/services/expo-notifications";
import { useExpoNotificationStore } from "@/store/expo-notifications/expoNotificationStore";

describe("useExpoNotifications", () => {
  const mockExpoNotificationService = expoNotificationService as jest.Mocked<
    typeof expoNotificationService
  >;
  const mockUseExpoNotificationStore =
    useExpoNotificationStore as jest.MockedFunction<
      typeof useExpoNotificationStore
    >;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockExpoNotificationService.initialize.mockResolvedValue(undefined);
    mockExpoNotificationService.sendLocalNotification.mockResolvedValue(
      "notification-id",
    );
    mockExpoNotificationService.scheduleNotification.mockResolvedValue(
      "scheduled-id",
    );
    mockExpoNotificationService.cancelNotification.mockResolvedValue(undefined);
    mockExpoNotificationService.cancelAllNotifications.mockResolvedValue(
      undefined,
    );
    mockExpoNotificationService.requestPermissions.mockResolvedValue({
      granted: true,
      canAskAgain: true,
      status: "granted",
    });
    mockExpoNotificationService.getPushToken.mockResolvedValue({
      type: "expo",
      data: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    });
    mockExpoNotificationService.setBadgeCount.mockResolvedValue(undefined);
  });

  describe("Initialization", () => {
    it("should initialize service on mount", async () => {
      renderHook(() => useExpoNotifications());

      expect(mockExpoNotificationService.initialize).toHaveBeenCalledTimes(1);
    });

    it("should handle initialization error gracefully", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockExpoNotificationService.initialize.mockRejectedValue(
        new Error("Init failed"),
      );

      renderHook(() => useExpoNotifications());

      expect(consoleSpy).toHaveBeenCalledWith(
        "[useExpoNotifications] Failed to initialize service:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("State", () => {
    it("should return correct initial state", () => {
      const { result } = renderHook(() => useExpoNotifications());

      expect(result.current.notifications).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.preferences.pushEnabled).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.permissions).toBeNull();
    });
  });

  describe("sendLocalNotification", () => {
    it("should call service sendLocalNotification with correct parameters", async () => {
      const { result } = renderHook(() => useExpoNotifications());

      await act(async () => {
        await result.current.sendLocalNotification(
          "Test Title",
          "Test Message",
          { customData: "test" },
        );
      });

      expect(
        mockExpoNotificationService.sendLocalNotification,
      ).toHaveBeenCalledWith("Test Title", "Test Message", {
        customData: "test",
      });
    });

    it("should handle sendLocalNotification error", async () => {
      const { result } = renderHook(() => useExpoNotifications());
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockExpoNotificationService.sendLocalNotification.mockRejectedValue(
        new Error("Send failed"),
      );

      await act(async () => {
        await expect(
          result.current.sendLocalNotification("Title", "Message"),
        ).rejects.toThrow("Send failed");
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "[useExpoNotifications] Failed to send local notification:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("scheduleNotification", () => {
    it("should call service scheduleNotification with time trigger", async () => {
      const { result } = renderHook(() => useExpoNotifications());

      const trigger = { seconds: 300 };

      await act(async () => {
        await result.current.scheduleNotification(
          "Reminder",
          "Time to check app",
          300,
          { reminderId: "123" },
        );
      });

      expect(
        mockExpoNotificationService.scheduleNotification,
      ).toHaveBeenCalledWith("Reminder", "Time to check app", trigger, {
        reminderId: "123",
      });
    });
  });

  describe("cancelNotification", () => {
    it("should call service cancelNotification", async () => {
      const { result } = renderHook(() => useExpoNotifications());

      await act(async () => {
        await result.current.cancelNotification("notification-id");
      });

      expect(
        mockExpoNotificationService.cancelNotification,
      ).toHaveBeenCalledWith("notification-id");
    });
  });

  describe("cancelAllNotifications", () => {
    it("should call service cancelAllNotifications", async () => {
      const { result } = renderHook(() => useExpoNotifications());

      await act(async () => {
        await result.current.cancelAllNotifications();
      });

      expect(
        mockExpoNotificationService.cancelAllNotifications,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe("getDeviceToken", () => {
    it("should call service getPushToken", async () => {
      const { result } = renderHook(() => useExpoNotifications());

      const token = await act(async () => {
        return await result.current.getDeviceToken();
      });

      expect(mockExpoNotificationService.getPushToken).toHaveBeenCalledTimes(1);
      expect(token).toEqual({
        type: "expo",
        data: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
      });
    });
  });

  describe("requestPermissions", () => {
    it("should call service requestPermissions", async () => {
      const { result } = renderHook(() => useExpoNotifications());

      const permissions = await act(async () => {
        return await result.current.requestPermissions();
      });

      expect(
        mockExpoNotificationService.requestPermissions,
      ).toHaveBeenCalledTimes(1);
      expect(permissions).toEqual({
        granted: true,
        canAskAgain: true,
        status: "granted",
      });
    });
  });

  describe("setBadgeCount", () => {
    it("should call service setBadgeCount", async () => {
      const { result } = renderHook(() => useExpoNotifications());

      await act(async () => {
        await result.current.setBadgeCount(5);
      });

      expect(mockExpoNotificationService.setBadgeCount).toHaveBeenCalledWith(5);
    });
  });

  describe("Store Actions", () => {
    let mockStoreActions: any;

    beforeEach(() => {
      mockStoreActions = {
        markAsRead: jest.fn(),
        markAllAsRead: jest.fn(),
        clearNotifications: jest.fn(),
        updatePreferences: jest.fn(),
        syncWithServer: jest.fn(),
        removeNotification: jest.fn(),
      };

      mockUseExpoNotificationStore.mockReturnValue({
        ...mockStoreActions,
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
      });
    });

    it("should expose markAsRead action", () => {
      const { result } = renderHook(() => useExpoNotifications());

      act(() => {
        result.current.markAsRead("test-id");
      });

      expect(mockStoreActions.markAsRead).toHaveBeenCalledWith("test-id");
    });

    it("should expose markAllAsRead action", () => {
      const { result } = renderHook(() => useExpoNotifications());

      act(() => {
        result.current.markAllAsRead();
      });

      expect(mockStoreActions.markAllAsRead).toHaveBeenCalledTimes(1);
    });

    it("should expose clearNotifications action", () => {
      const { result } = renderHook(() => useExpoNotifications());

      act(() => {
        result.current.clearNotifications();
      });

      expect(mockStoreActions.clearNotifications).toHaveBeenCalledTimes(1);
    });

    it("should expose updatePreferences action", () => {
      const { result } = renderHook(() => useExpoNotifications());
      const newPreferences = {
        pushEnabled: false,
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

      act(() => {
        result.current.updatePreferences(newPreferences);
      });

      expect(mockStoreActions.updatePreferences).toHaveBeenCalledWith(
        newPreferences,
      );
    });

    it("should expose removeNotification action", () => {
      const { result } = renderHook(() => useExpoNotifications());

      act(() => {
        result.current.removeNotification("test-id");
      });

      expect(mockStoreActions.removeNotification).toHaveBeenCalledWith(
        "test-id",
      );
    });
  });
});
