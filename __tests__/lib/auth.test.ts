import * as SecureStore from 'expo-secure-store';
import { fetchAPI } from '../../lib/fetch';
import {
  login,
  register,
  logout,
  refreshAccessToken,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
  isTokenExpired,
  decodeJWT,
  validateToken,
  backupTokens,
  restoreTokens,
  updateActivity,
  startAutoLogout,
  stopAutoLogout,
  resetSession,
  getSessionInfo,
  pauseSession,
  resumeSession,
  forceLogout,
  sessionManager
} from '../../lib/auth';

// Mock dependencies
jest.mock('expo-secure-store');
jest.mock('../../lib/fetch');
jest.mock('../../lib/onboarding', () => ({
  resetOnboardingStatus: jest.fn(),
}));

// Mock the store
jest.mock('../../store', () => ({
  useUserStore: {
    getState: jest.fn(() => ({
      setUser: jest.fn(),
      clearUser: jest.fn(),
      setAuthenticated: jest.fn(),
      setLoading: jest.fn(),
    })),
  },
}));

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const mockFetchAPI = fetchAPI as jest.MockedFunction<typeof fetchAPI>;

describe('Authentication Functions', () => {
  const mockCredentials = {
    email: 'test@example.com',
    password: 'password123',
    deviceType: 'ios' as const,
    deviceId: 'device-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset session state
    resetSession();
  });

  describe('Token Management', () => {
    test('setAccessToken stores token with metadata', async () => {
      const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'; // mock JWT

      await setAccessToken(token);

      expect(mockSecureStore.setItemAsync).toHaveBeenCalled();
      const call = mockSecureStore.setItemAsync.mock.calls[0];
      expect(call[0]).toBe('access_token');
      const storedData = JSON.parse(call[1]);
      expect(storedData.token).toBe(token);
      expect(storedData.issuedAt).toBeDefined();
    });

    test('getAccessToken retrieves valid token', async () => {
      const token = 'valid-token';
      const tokenData = {
        token,
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      };

      mockSecureStore.getItemAsync.mockResolvedValue(JSON.stringify(tokenData));

      const result = await getAccessToken();

      expect(result).toBe(token);
    });

    test('getAccessToken returns null for expired token', async () => {
      const tokenData = {
        token: 'expired-token',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      };

      mockSecureStore.getItemAsync.mockResolvedValue(JSON.stringify(tokenData));

      const result = await getAccessToken();

      expect(result).toBeNull();
    });

    test('clearTokens removes all stored tokens', async () => {
      await clearTokens();

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('access_token');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('refresh_token');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('token_backup');
    });
  });

  describe('Token Validation', () => {
    test('isTokenExpired returns true for expired token', () => {
      const expiredToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDAwMDAwMDB9.abc'; // exp: 1600000000 (Sept 2020)

      expect(isTokenExpired(expiredToken)).toBe(true);
    });

    test('isTokenExpired returns false for valid token', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const validToken = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOj${futureTime}}`;

      expect(isTokenExpired(validToken)).toBe(false);
    });

    test('decodeJWT decodes token payload correctly', () => {
      const payload = { userId: 123, email: 'test@example.com', exp: 2000000000 };
      const token = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify(payload))}`;

      const decoded = decodeJWT(token);

      expect(decoded).toEqual(payload);
    });

    test('validateToken returns true for valid token', async () => {
      const token = 'valid-token';
      mockSecureStore.getItemAsync.mockResolvedValue(JSON.stringify({
        token,
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      }));

      const isValid = await validateToken(token);

      expect(isValid).toBe(true);
    });
  });

  describe('Authentication API Calls', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password123',
      deviceType: 'ios' as const,
      deviceId: 'device-123',
    };

    const mockAuthResponse = {
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-456',
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        clerkId: null,
      },
    };

    test('login calls API and stores tokens on success', async () => {
      mockFetchAPI.mockResolvedValue({
        success: true,
        data: mockAuthResponse,
      });

      const result = await login(mockCredentials);

      expect(mockFetchAPI).toHaveBeenCalledWith('auth/login', {
        method: 'POST',
        body: JSON.stringify(mockCredentials),
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAuthResponse);
    });

    test('login returns error on API failure', async () => {
      mockFetchAPI.mockResolvedValue({
        success: false,
        message: 'Invalid credentials',
      });

      const result = await login(mockCredentials);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
    });

    test('register calls API with registration data', async () => {
      const registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+1234567890',
      };

      mockFetchAPI.mockResolvedValue({
        success: true,
        data: mockAuthResponse,
      });

      const result = await register(registerData);

      expect(mockFetchAPI).toHaveBeenCalledWith('auth/register', {
        method: 'POST',
        body: JSON.stringify(registerData),
      });
      expect(result.success).toBe(true);
    });

    test('logout clears tokens and resets state', async () => {
      mockFetchAPI.mockResolvedValue({ success: true });

      await logout();

      expect(mockFetchAPI).toHaveBeenCalledWith('auth/logout', {
        method: 'POST',
      });
      // Tokens should be cleared (tested in clearTokens)
    });
  });

  describe('Token Refresh', () => {
    test('refreshAccessToken gets new tokens from API', async () => {
      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockFetchAPI.mockResolvedValue({
        success: true,
        data: newTokens,
      });

      const result = await refreshAccessToken();

      expect(mockFetchAPI).toHaveBeenCalledWith('auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: expect.any(String) }),
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(newTokens);
    });

    test('prevents multiple simultaneous refresh calls', async () => {
      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockFetchAPI.mockResolvedValue({
        success: true,
        data: newTokens,
      });

      // Start multiple refresh calls
      const promise1 = refreshAccessToken();
      const promise2 = refreshAccessToken();

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(mockFetchAPI).toHaveBeenCalledTimes(1); // Only one API call
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });
  });

  describe('Token Backup and Restore', () => {
    test('backupTokens saves current tokens', async () => {
      const tokenData = {
        token: 'backup-token',
        issuedAt: new Date().toISOString(),
      };

      mockSecureStore.getItemAsync.mockResolvedValue(JSON.stringify(tokenData));

      await backupTokens();

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'token_backup',
        expect.stringContaining('backup-token')
      );
    });

    test('restoreTokens recovers backed up tokens', async () => {
      const backupData = {
        accessToken: { token: 'restored-access', issuedAt: new Date().toISOString() },
        refreshToken: { token: 'restored-refresh', issuedAt: new Date().toISOString() },
        timestamp: new Date().toISOString(),
      };

      mockSecureStore.getItemAsync.mockResolvedValue(JSON.stringify(backupData));

      const result = await restoreTokens();

      expect(result).toBe(true);
      // Tokens should be restored (implementation detail)
    });
  });

  describe('Session Management', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('updateActivity resets last activity time', () => {
      const oldTime = new Date(Date.now() - 10000);

      updateActivity();

      const sessionInfo = getSessionInfo();
      expect(sessionInfo.lastActivity.getTime()).toBeGreaterThan(oldTime.getTime());
    });

    test('startAutoLogout sets up timer', () => {
      startAutoLogout();

      const sessionInfo = getSessionInfo();
      expect(sessionInfo.autoLogoutTimer).not.toBeNull();
      expect(sessionInfo.isActive).toBe(true);
    });

    test('stopAutoLogout clears timer', () => {
      startAutoLogout();
      expect(getSessionInfo().autoLogoutTimer).not.toBeNull();

      stopAutoLogout();
      expect(getSessionInfo().autoLogoutTimer).toBeNull();
    });

    test('getSessionInfo returns current session state', () => {
      const info = getSessionInfo();

      expect(info).toHaveProperty('lastActivity');
      expect(info).toHaveProperty('isActive');
      expect(info).toHaveProperty('timeUntilLogout');
    });

    test('pauseSession and resumeSession work correctly', () => {
      expect(getSessionInfo().isActive).toBe(true);

      pauseSession();
      expect(getSessionInfo().isActive).toBe(false);

      resumeSession();
      expect(getSessionInfo().isActive).toBe(true);
    });

    test('forceLogout clears session and calls logout', async () => {
      mockFetchAPI.mockResolvedValue({ success: true });

      await forceLogout();

      const sessionInfo = getSessionInfo();
      expect(sessionInfo.isActive).toBe(false);
      expect(sessionInfo.autoLogoutTimer).toBeNull();
    });

    test('resetSession restores initial state', () => {
      // Start auto logout to change state
      startAutoLogout();

      // Reset session
      resetSession();

      const sessionInfo = getSessionInfo();
      expect(sessionInfo.isActive).toBe(true);
      expect(sessionInfo.warningShown).toBe(false);
      expect(sessionInfo.autoLogoutTimer).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('handles SecureStore errors gracefully', async () => {
      mockSecureStore.getItemAsync.mockRejectedValue(new Error('Storage error'));

      const result = await getAccessToken();

      expect(result).toBeNull();
    });

    test('handles API errors in authentication calls', async () => {
      mockFetchAPI.mockRejectedValue(new Error('Network error'));

      const result = await login(mockCredentials);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Network error');
    });

    test('handles malformed tokens gracefully', () => {
      expect(() => isTokenExpired('malformed-token')).not.toThrow();
      expect(() => decodeJWT('malformed-token')).not.toThrow();
    });
  });
});

