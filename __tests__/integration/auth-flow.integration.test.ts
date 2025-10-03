import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useUserStore } from "../../store";
import {
  login,
  register,
  logout,
  refreshAccessToken,
  setAccessToken,
  getAccessToken,
  clearTokens,
  updateActivity,
  startAutoLogout,
  sessionManager,
} from "../../lib/auth";
import { fetchAPI } from "../../lib/fetch";

// Mock dependencies
jest.mock("../../lib/fetch");
jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockFetchAPI = fetchAPI as jest.MockedFunction<typeof fetchAPI>;
const mockSecureStore = require("expo-secure-store");

describe("Authentication Flow Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset user store state
    const userStore = useUserStore.getState();
    userStore.clearUser();
    userStore.setAuthenticated(false);
    userStore.setLoading(false);
    userStore.setError(null);
  });

  describe("Complete Login Flow", () => {
    const validCredentials = {
      email: "user@example.com",
      password: "password123",
      deviceType: "ios" as const,
      deviceId: "device-123",
    };

    const mockAuthResponse = {
      accessToken: "access-token-123",
      refreshToken: "refresh-token-456",
      user: {
        id: 1,
        name: "John Doe",
        email: "user@example.com",
        clerkId: "clerk_123",
      },
    };

    test("successful login stores tokens and updates user state", async () => {
      mockFetchAPI.mockResolvedValue({
        success: true,
        data: mockAuthResponse,
      });

      const result = await login(validCredentials);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAuthResponse);

      // Verify tokens were stored
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(2);
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        "access_token",
        expect.stringContaining("access-token-123"),
      );
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        "refresh_token",
        expect.stringContaining("refresh-token-456"),
      );

      // Verify user store was updated
      const userStore = useUserStore.getState();
      expect(userStore.isAuthenticated).toBe(true);
      expect(userStore.user).toEqual(mockAuthResponse.user);
    });

    test("login failure does not update state", async () => {
      mockFetchAPI.mockResolvedValue({
        success: false,
        message: "Invalid credentials",
      });

      const result = await login(validCredentials);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid credentials");

      // Verify state was not updated
      const userStore = useUserStore.getState();
      expect(userStore.isAuthenticated).toBe(false);
      expect(userStore.user).toBeNull();
    });

    test("login with network error handles gracefully", async () => {
      mockFetchAPI.mockRejectedValue(new Error("Network error"));

      const result = await login(validCredentials);

      expect(result.success).toBe(false);
      expect(result.message).toContain("Network error");
    });
  });

  describe("Complete Registration Flow", () => {
    const registrationData = {
      name: "New User",
      email: "newuser@example.com",
      password: "securePassword123",
      phone: "+1234567890",
      country: "US",
      city: "New York",
      deviceType: "android" as const,
      deviceId: "device-456",
    };

    const mockRegistrationResponse = {
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
      user: {
        id: 2,
        name: "New User",
        email: "newuser@example.com",
        clerkId: null,
      },
    };

    test("successful registration creates account and logs in user", async () => {
      mockFetchAPI.mockResolvedValue({
        success: true,
        data: mockRegistrationResponse,
      });

      const result = await register(registrationData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRegistrationResponse);

      // Verify API was called with correct data
      expect(mockFetchAPI).toHaveBeenCalledWith("auth/register", {
        method: "POST",
        body: JSON.stringify(registrationData),
      });

      // Verify tokens were stored
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(2);

      // Verify user store was updated
      const userStore = useUserStore.getState();
      expect(userStore.isAuthenticated).toBe(true);
      expect(userStore.user).toEqual(mockRegistrationResponse.user);
    });

    test("registration with existing email fails gracefully", async () => {
      mockFetchAPI.mockResolvedValue({
        success: false,
        message: "Email already exists",
      });

      const result = await register(registrationData);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Email already exists");

      // Verify user state was not updated
      const userStore = useUserStore.getState();
      expect(userStore.isAuthenticated).toBe(false);
    });
  });

  describe("Logout Flow", () => {
    beforeEach(async () => {
      // Set up authenticated state
      mockFetchAPI.mockResolvedValue({ success: true });
      await setAccessToken("test-token");
      const userStore = useUserStore.getState();
      userStore.setUser({
        id: 1,
        name: "Test User",
        email: "test@example.com",
      });
      userStore.setAuthenticated(true);
    });

    test("successful logout clears tokens and resets user state", async () => {
      mockFetchAPI.mockResolvedValue({ success: true });

      await logout();

      // Verify API call
      expect(mockFetchAPI).toHaveBeenCalledWith("auth/logout", {
        method: "POST",
      });

      // Verify tokens were cleared
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "access_token",
      );
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "refresh_token",
      );

      // Verify user state was reset
      const userStore = useUserStore.getState();
      expect(userStore.isAuthenticated).toBe(false);
      expect(userStore.user).toBeNull();
    });

    test("logout handles API failure gracefully", async () => {
      mockFetchAPI.mockRejectedValue(new Error("API error"));

      // Should not throw and still clear local state
      await expect(logout()).resolves.not.toThrow();

      // Verify local state was still cleared
      const userStore = useUserStore.getState();
      expect(userStore.isAuthenticated).toBe(false);
      expect(userStore.user).toBeNull();
    });
  });

  describe("Token Refresh Flow", () => {
    beforeEach(async () => {
      // Set up initial tokens
      await setAccessToken("old-access-token");
      mockSecureStore.getItemAsync.mockResolvedValue(
        JSON.stringify({
          token: "old-refresh-token",
          issuedAt: new Date().toISOString(),
        }),
      );
    });

    test("successful token refresh updates stored tokens", async () => {
      const newTokens = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      };

      mockFetchAPI.mockResolvedValue({
        success: true,
        data: newTokens,
      });

      const result = await refreshAccessToken();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(newTokens);

      // Verify API call
      expect(mockFetchAPI).toHaveBeenCalledWith("auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken: "old-refresh-token" }),
      });

      // Verify new tokens were stored
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        "access_token",
        expect.stringContaining("new-access-token"),
      );
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        "refresh_token",
        expect.stringContaining("new-refresh-token"),
      );
    });

    test("token refresh failure returns error", async () => {
      mockFetchAPI.mockResolvedValue({
        success: false,
        message: "Invalid refresh token",
      });

      const result = await refreshAccessToken();

      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid refresh token");
    });
  });

  describe("Session Management Integration", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test("auto logout works with activity tracking", () => {
      // Start auto logout (30 minute timeout)
      startAutoLogout();

      // Initial activity
      updateActivity();
      expect(sessionManager.getSessionInfo().isActive).toBe(true);

      // Advance time by 25 minutes
      jest.advanceTimersByTime(25 * 60 * 1000);
      expect(sessionManager.getSessionInfo().isActive).toBe(true);

      // Advance time by another 6 minutes (total 31 minutes)
      jest.advanceTimersByTime(6 * 60 * 1000);

      // Should trigger logout (implementation detail - may need adjustment)
      expect(sessionManager.getSessionInfo().isActive).toBe(false);
    });

    test("activity updates prevent auto logout", () => {
      startAutoLogout();

      // Initial activity
      updateActivity();

      // Advance time by 20 minutes
      jest.advanceTimersByTime(20 * 60 * 1000);

      // User activity resets timer
      updateActivity();

      // Advance time by another 20 minutes
      jest.advanceTimersByTime(20 * 60 * 1000);

      // Should still be active
      expect(sessionManager.getSessionInfo().isActive).toBe(true);

      // Advance another 11 minutes to trigger logout
      jest.advanceTimersByTime(11 * 60 * 1000);
      expect(sessionManager.getSessionInfo().isActive).toBe(false);
    });
  });

  describe("Error Recovery Flows", () => {
    test("network failure during login can be retried", async () => {
      const validCredentials = {
        email: "user@example.com",
        password: "password123",
      };

      // First call fails
      mockFetchAPI
        .mockRejectedValueOnce(new Error("Network timeout"))
        .mockResolvedValueOnce({
          success: true,
          data: {
            accessToken: "retry-access-token",
            refreshToken: "retry-refresh-token",
            user: { id: 1, name: "Retry User", email: "user@example.com" },
          },
        });

      // First attempt fails
      const firstResult = await login(validCredentials);
      expect(firstResult.success).toBe(false);

      // Second attempt succeeds
      const secondResult = await login(validCredentials);
      expect(secondResult.success).toBe(true);

      expect(mockFetchAPI).toHaveBeenCalledTimes(2);
    });

    test("token expiration triggers automatic refresh", async () => {
      // Set up expired access token
      const expiredTokenData = {
        token: "expired-token",
        issuedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        expiresAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      };

      mockSecureStore.getItemAsync
        .mockResolvedValueOnce(JSON.stringify(expiredTokenData)) // access token
        .mockResolvedValueOnce(
          JSON.stringify({
            token: "valid-refresh-token",
            issuedAt: new Date().toISOString(),
          }),
        ); // refresh token

      // Mock successful refresh
      mockFetchAPI.mockResolvedValue({
        success: true,
        data: {
          accessToken: "refreshed-access-token",
          refreshToken: "refreshed-refresh-token",
        },
      });

      // Attempt to get access token (should trigger refresh)
      const token = await getAccessToken();

      expect(token).toBe("refreshed-access-token");
      expect(mockFetchAPI).toHaveBeenCalledWith(
        "auth/refresh",
        expect.any(Object),
      );
    });
  });

  describe("Cross-Platform Compatibility", () => {
    test("works with different device types", async () => {
      const deviceTypes = ["ios", "android", "web"] as const;

      for (const deviceType of deviceTypes) {
        mockFetchAPI.mockResolvedValue({
          success: true,
          data: {
            accessToken: `${deviceType}-token`,
            refreshToken: `${deviceType}-refresh`,
            user: { id: 1, name: "Test User", email: "test@example.com" },
          },
        });

        const result = await login({
          email: "test@example.com",
          password: "password123",
          deviceType,
          deviceId: `${deviceType}-device`,
        });

        expect(result.success).toBe(true);
        expect(result.data?.accessToken).toBe(`${deviceType}-token`);
      }
    });
  });

  describe("Security Integration", () => {
    test("secure token storage prevents unauthorized access", async () => {
      const sensitiveToken = "super-secret-token";
      await setAccessToken(sensitiveToken);

      // Verify token was stored securely
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        "access_token",
        expect.any(String),
      );

      // Verify stored data includes security metadata
      const storedData = JSON.parse(
        mockSecureStore.setItemAsync.mock.calls[0][1],
      );
      expect(storedData.token).toBe(sensitiveToken);
      expect(storedData.issuedAt).toBeDefined();
      expect(storedData).toHaveProperty("hash"); // Security hash
    });

    test("logout clears all sensitive data", async () => {
      // Set up authenticated state with sensitive data
      await setAccessToken("sensitive-token");
      const userStore = useUserStore.getState();
      userStore.setUser({
        id: 1,
        name: "Sensitive User",
        email: "sensitive@example.com",
      });
      userStore.setAuthenticated(true);

      await logout();

      // Verify all sensitive data was cleared
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "access_token",
      );
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "refresh_token",
      );
      expect(userStore.isAuthenticated).toBe(false);
      expect(userStore.user).toBeNull();
    });
  });
});
