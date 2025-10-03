import { act, renderHook, waitFor } from "@testing-library/react-native";
import { Platform } from "react-native";

// Mock completo del stack
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
  AndroidImportance: { DEFAULT: 3 },
  AndroidNotificationPriority: { DEFAULT: 0 },
}));

jest.mock("@/lib/logger", () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Import después de mocks
import { useExpoNotifications } from "@/app/hooks/expo-notifications/useExpoNotifications";
import { expoNotificationService } from "@/app/services/expo-notifications";
import { useExpoNotificationStore } from "@/store/expo-notifications/expoNotificationStore";

describe("Expo Notifications - End-to-End Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup successful mocks por defecto
    const mockPermissions = {
      granted: true,
      canAskAgain: true,
      status: "granted",
    };
    const mockToken = {
      type: "expo",
      data: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    };

    // Mock de Expo Notifications
    jest
      .mocked(require("expo-notifications").getPermissionsAsync)
      .mockResolvedValue(mockPermissions);
    jest
      .mocked(require("expo-notifications").requestPermissionsAsync)
      .mockResolvedValue(mockPermissions);
    jest
      .mocked(require("expo-notifications").getExpoPushTokenAsync)
      .mockResolvedValue(mockToken);
    jest
      .mocked(require("expo-notifications").scheduleNotificationAsync)
      .mockResolvedValue("notification-id-123");
    jest
      .mocked(require("expo-notifications").setBadgeCountAsync)
      .mockResolvedValue(undefined);
    jest
      .mocked(require("expo-notifications").getBadgeCountAsync)
      .mockResolvedValue(0);

    // Mock del config
    jest
      .mocked(
        require("@/lib/expo-notifications/config").expoNotificationConfig
          .getConfig,
      )
      .mockReturnValue({
        showInForeground: true,
        playSound: true,
        showBadge: true,
        autoDismiss: true,
        vibrate: true,
      });
    jest
      .mocked(
        require("@/lib/expo-notifications/config").expoNotificationConfig
          .setupExpoNotificationHandler,
      )
      .mockReturnValue(undefined);
    jest
      .mocked(
        require("@/lib/expo-notifications/config").expoNotificationConfig
          .setupExpoAndroidChannels,
      )
      .mockResolvedValue(undefined);

    // Mock del token manager
    jest
      .mocked(
        require("@/lib/expo-notifications/tokenManager").expoTokenManager
          .getPushToken,
      )
      .mockResolvedValue(mockToken);
    jest
      .mocked(
        require("@/lib/expo-notifications/tokenManager").expoTokenManager
          .clearTokens,
      )
      .mockResolvedValue(undefined);
  });

  describe("Complete User Journey", () => {
    it("should handle complete notification lifecycle", async () => {
      // 1. Inicializar hook
      const { result } = renderHook(() => useExpoNotifications());

      // 2. Verificar estado inicial
      expect(result.current.notifications).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.isLoading).toBe(false);

      // 3. Enviar notificación local
      let notificationId: string;
      await act(async () => {
        notificationId = await result.current.sendLocalNotification(
          "Welcome!",
          "Thanks for using our app",
          { userId: "123", type: "SYSTEM_UPDATE" },
        );
      });

      // 4. Verificar que se agregó al store
      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(1);
        expect(result.current.notifications[0].title).toBe("Welcome!");
        expect(result.current.notifications[0].message).toBe(
          "Thanks for using our app",
        );
        expect(result.current.notifications[0].isRead).toBe(false);
        expect(result.current.unreadCount).toBe(1);
      });

      // 5. Marcar como leída
      act(() => {
        result.current.markAsRead(notificationId!);
      });

      // 6. Verificar que se actualizó el estado
      await waitFor(() => {
        expect(result.current.notifications[0].isRead).toBe(true);
        expect(result.current.unreadCount).toBe(0);
      });

      // 7. Enviar otra notificación
      await act(async () => {
        await result.current.sendLocalNotification(
          "Ride Available",
          "New ride request in your area",
          { type: "RIDE_REQUEST", rideId: "ride-456" },
        );
      });

      // 8. Verificar contador actualizado
      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(2);
        expect(result.current.unreadCount).toBe(1);
      });

      // 9. Limpiar todas las notificaciones
      act(() => {
        result.current.clearNotifications();
      });

      // 10. Verificar que se limpió
      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(0);
        expect(result.current.unreadCount).toBe(0);
      });
    });

    it("should handle permissions workflow", async () => {
      // Mock permissions denied initially
      const deniedPermissions = {
        granted: false,
        canAskAgain: true,
        status: "denied",
      };
      const grantedPermissions = {
        granted: true,
        canAskAgain: true,
        status: "granted",
      };

      jest
        .mocked(require("expo-notifications").getPermissionsAsync)
        .mockResolvedValue(deniedPermissions);
      jest
        .mocked(require("expo-notifications").requestPermissionsAsync)
        .mockResolvedValue(grantedPermissions);

      const { result } = renderHook(() => useExpoNotifications());

      // Verificar estado inicial (sin permisos)
      expect(result.current.permissions?.granted).toBe(false);

      // Solicitar permisos
      let permissions;
      await act(async () => {
        permissions = await result.current.requestPermissions();
      });

      // Verificar que se obtuvieron permisos
      expect((permissions as any)?.granted).toBe(true);
      expect(result.current.permissions?.granted).toBe(true);
    });

    it("should handle token management", async () => {
      const mockToken = {
        type: "expo",
        data: "ExponentPushToken[yyyyyyyyyyyyyyyyyyyyyy]",
      };
      jest
        .mocked(require("expo-notifications").getExpoPushTokenAsync)
        .mockResolvedValue(mockToken);
      jest
        .mocked(
          require("@/lib/expo-notifications/tokenManager").expoTokenManager
            .getPushToken,
        )
        .mockResolvedValue(mockToken);

      const { result } = renderHook(() => useExpoNotifications());

      // Obtener token
      let token;
      await act(async () => {
        token = await result.current.getDeviceToken();
      });

      // Verificar token
      expect(token).toEqual(mockToken);
      expect(result.current.token).toEqual(mockToken);
    });

    it("should handle badge management", async () => {
      jest
        .mocked(require("expo-notifications").getBadgeCountAsync)
        .mockResolvedValue(3);

      const { result } = renderHook(() => useExpoNotifications());

      // Agregar notificaciones para que haya unread count
      act(() => {
        // Simular agregar notificaciones al store
        const mockStore = useExpoNotificationStore.getState();
        mockStore.addNotification({
          id: "1",
          type: "SYSTEM_UPDATE",
          title: "Test 1",
          message: "Message 1",
          data: {},
          timestamp: new Date(),
          isRead: false,
          priority: "normal",
        });
        mockStore.addNotification({
          id: "2",
          type: "SYSTEM_UPDATE",
          title: "Test 2",
          message: "Message 2",
          data: {},
          timestamp: new Date(),
          isRead: false,
          priority: "normal",
        });
      });

      // El badge debería actualizarse automáticamente (simulado)
      await waitFor(() => {
        expect(result.current.unreadCount).toBe(2);
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle notification service errors gracefully", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock error en envío de notificación
      jest
        .mocked(require("expo-notifications").scheduleNotificationAsync)
        .mockRejectedValue(new Error("Notification failed"));

      const { result } = renderHook(() => useExpoNotifications());

      // Intentar enviar notificación
      await act(async () => {
        await expect(
          result.current.sendLocalNotification("Title", "Message"),
        ).rejects.toThrow("Notification failed");
      });

      // Verificar que se logueó el error
      expect(consoleSpy).toHaveBeenCalledWith(
        "[useExpoNotifications] Failed to send local notification:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should handle initialization errors", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock error en inicialización
      jest
        .mocked(require("expo-notifications").requestPermissionsAsync)
        .mockRejectedValue(new Error("Permission request failed"));

      renderHook(() => useExpoNotifications());

      expect(consoleSpy).toHaveBeenCalledWith(
        "[useExpoNotifications] Failed to initialize service:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Performance and Memory", () => {
    it("should handle large number of notifications efficiently", async () => {
      const { result } = renderHook(() => useExpoNotifications());

      // Agregar muchas notificaciones
      const notifications = Array.from({ length: 50 }, (_, i) => ({
        id: `notification-${i}`,
        type: "SYSTEM_UPDATE" as const,
        title: `Notification ${i}`,
        message: `Message ${i}`,
        data: { index: i },
        timestamp: new Date(Date.now() - i * 1000), // Diferentes timestamps
        isRead: i % 2 === 0, // Alternar leído/no leído
        priority: "normal" as const,
      }));

      act(() => {
        const mockStore = useExpoNotificationStore.getState();
        notifications.forEach((notification) => {
          mockStore.addNotification(notification);
        });
      });

      // Verificar que se maneje correctamente
      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(50);
        expect(result.current.unreadCount).toBe(25); // 25 no leídas (pares)
      });

      // Marcar todas como leídas
      act(() => {
        result.current.markAllAsRead();
      });

      // Verificar que se actualice eficientemente
      await waitFor(() => {
        expect(result.current.unreadCount).toBe(0);
        expect(result.current.notifications.every((n) => n.isRead)).toBe(true);
      });
    });

    it("should maintain maximum notification limit", () => {
      const { result } = renderHook(() => useExpoNotifications());

      // Agregar 102 notificaciones (límite es 100)
      act(() => {
        const mockStore = useExpoNotificationStore.getState();
        for (let i = 1; i <= 102; i++) {
          mockStore.addNotification({
            id: `notification-${i}`,
            type: "SYSTEM_UPDATE",
            title: `Notification ${i}`,
            message: `Message ${i}`,
            data: {},
            timestamp: new Date(),
            isRead: false,
            priority: "normal",
          });
        }
      });

      // Verificar que se mantenga el límite
      expect(result.current.notifications).toHaveLength(100);
      expect(result.current.notifications[0].id).toBe("notification-102"); // Más reciente primero
      expect(result.current.notifications[99].id).toBe("notification-3"); // 100 más recientes
    });
  });

  describe("Platform Specific Behavior", () => {
    it("should setup Android channels on Android platform", async () => {
      Platform.OS = "android";

      const mockSetupAndroidChannels = jest.fn();
      jest
        .mocked(
          require("@/lib/expo-notifications/config").expoNotificationConfig
            .setupExpoAndroidChannels,
        )
        .mockImplementation(mockSetupAndroidChannels);

      renderHook(() => useExpoNotifications());

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

      renderHook(() => useExpoNotifications());

      expect(mockSetupAndroidChannels).not.toHaveBeenCalled();
    });
  });

  describe("Notification Preferences", () => {
    it("should update preferences correctly", () => {
      const { result } = renderHook(() => useExpoNotifications());

      const newPreferences = {
        pushEnabled: false,
        soundEnabled: false,
        vibrationEnabled: false,
        promotional: true,
        quietHoursEnabled: true,
        quietHoursStart: "23:00",
        quietHoursEnd: "07:00",
        smsEnabled: false,
        rideUpdates: true,
        driverMessages: true,
        emergencyAlerts: true,
        badgeEnabled: true,
      };

      act(() => {
        result.current.updatePreferences(newPreferences);
      });

      expect(result.current.preferences).toEqual(newPreferences);
    });
  });
});
