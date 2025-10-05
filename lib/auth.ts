import * as SecureStore from "expo-secure-store";

import { fetchAPI } from "@/lib/fetch";
import { resetOnboardingStatus } from "@/lib/onboarding";
import { useUIStore } from "@/store";

// Types for authentication
export interface User {
  id: number;
  name: string;
  email: string;
  clerkId: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to get user store dynamically (avoids circular dependency)
let userStoreInstance: any = null;
const getUserStore = (): any => {
  // Lazy import to avoid circular dependency
  if (!userStoreInstance) {
    try {
      const { useUserStore } = require("@/store");
      userStoreInstance = useUserStore.getState();
    } catch (error) {
      
      return null;
    }
  }
  return userStoreInstance;
};

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
  firebaseToken?: string;
  deviceType?: "ios" | "android" | "web";
  deviceId?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  preferredLanguage?: "es" | "en";
  timezone?: string;
  firebaseToken?: string;
  deviceType?: "ios" | "android" | "web";
  deviceId?: string;
}

// Token validation and utilities
interface TokenInfo {
  token: string;
  expiresAt?: Date;
  issuedAt: Date;
}

// Session management configuration
interface SessionConfig {
  autoLogoutTimeout: number; // in milliseconds (default: 30 minutes)
  warningTime: number; // show warning before logout (default: 5 minutes)
  checkInterval: number; // how often to check activity (default: 1 minute)
}

const defaultSessionConfig: SessionConfig = {
  autoLogoutTimeout: 30 * 60 * 1000, // 30 minutes
  warningTime: 5 * 60 * 1000, // 5 minutes before logout
  checkInterval: 60 * 1000, // check every minute
};

// Session state
let sessionState: {
  lastActivity: Date;
  autoLogoutTimer: ReturnType<typeof setInterval> | null;
  warningShown: boolean;
  isActive: boolean;
} = {
  lastActivity: new Date(),
  autoLogoutTimer: null,
  warningShown: false,
  isActive: true,
};

// Advanced token management with automatic rotation
const tokenCache: {
  accessToken: TokenInfo | null;
  refreshToken: TokenInfo | null;
  isRefreshing: boolean;
  refreshPromise: Promise<any> | null;
} = {
  accessToken: null,
  refreshToken: null,
  isRefreshing: false,
  refreshPromise: null,
};

// Token validation utilities moved to exports below

function isTokenExpired(token: string): boolean {
  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    if (!decoded || !decoded.exp) return false;

    // Add 5 minute buffer before actual expiration
    const expirationTime = decoded.exp * 1000 - 5 * 60 * 1000;
    return Date.now() >= expirationTime;
  } catch (error) {
    
    return true; // Assume expired if we can't check
  }
}

// Internal JWT Token management
export const tokenManager = {
  // Store access token with metadata
  async setAccessToken(token: string) {
    try {
      await SecureStore.setItemAsync("access_token", token);

      // Update cache with token info
      const decoded = decodeJWT(token);
      tokenCache.accessToken = {
        token,
        expiresAt: decoded?.exp ? new Date(decoded.exp * 1000) : undefined,
        issuedAt: new Date(),
      };

      
    } catch (error) {
      
    }
  },

  // Get access token with automatic refresh if expired
  async getAccessToken(): Promise<string | null> {
    try {
      let token = await SecureStore.getItemAsync("access_token");

      if (!token) {
        
        return null;
      }

      // Check if token is expired and attempt refresh
      if (isTokenExpired(token)) {
        

        const refreshResult = await this.refreshAccessToken();
        if (refreshResult?.success && refreshResult.data?.accessToken) {
          
          return refreshResult.data.accessToken;
        } else {
          
          // Return the expired token anyway - let the API handle the 401
          return token;
        }
      }

      return token;
    } catch (error) {
      
      return null;
    }
  },

  // Store refresh token with metadata
  async setRefreshToken(token: string) {
    try {
      await SecureStore.setItemAsync("refresh_token", token);

      // Update cache with token info
      const decoded = decodeJWT(token);
      tokenCache.refreshToken = {
        token,
        expiresAt: decoded?.exp ? new Date(decoded.exp * 1000) : undefined,
        issuedAt: new Date(),
      };

      
    } catch (error) {
      
    }
  },

  // Get refresh token
  async getRefreshToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync("refresh_token");
      return token;
    } catch (error) {
      
      return null;
    }
  },

  // Refresh access token automatically
  async refreshAccessToken(): Promise<{
    success: boolean;
    message: string;
    data?: { accessToken: string; refreshToken: string };
  }> {
    // Prevent multiple simultaneous refresh attempts
    if (tokenCache.isRefreshing) {
      
      if (tokenCache.refreshPromise) {
        return await tokenCache.refreshPromise;
      }
    }

    try {
      tokenCache.isRefreshing = true;

      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        return {
          success: false,
          message: "No refresh token available",
        };
      }

      

      // Import fetchAPI dynamically to avoid circular dependency
      const { fetchAPI } = require("./fetch");

      tokenCache.refreshPromise = fetchAPI("auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      });

      const response = await tokenCache.refreshPromise;

      if (response?.accessToken && response?.refreshToken) {
        // Store new tokens
        await this.setAccessToken(response.accessToken);
        await this.setRefreshToken(response.refreshToken);

        
        return {
          success: true,
          message: "Token refreshed successfully",
          data: {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          },
        };
      } else {
        
        return {
          success: false,
          message: response?.message || "Token refresh failed",
        };
      }
    } catch (error: any) {
      
      return {
        success: false,
        message: error.message || "Token refresh failed",
      };
    } finally {
      tokenCache.isRefreshing = false;
      tokenCache.refreshPromise = null;
    }
  },

  // Validate token integrity and expiration
  async validateToken(
    token: string,
  ): Promise<{ valid: boolean; expired: boolean; payload?: any }> {
    try {
      if (!token || token.trim() === "") {
        return { valid: false, expired: true };
      }

      const decoded = decodeJWT(token);
      if (!decoded) {
        return { valid: false, expired: true };
      }

      const expired = isTokenExpired(token);

      return {
        valid: !expired,
        expired,
        payload: decoded,
      };
    } catch (error) {
      
      return { valid: false, expired: true };
    }
  },

  // Enhanced secure storage with integrity checks
  async secureStore(key: string, value: string): Promise<void> {
    try {
      // Add integrity hash for critical data
      const integrityHash = this.generateIntegrityHash(value);
      const secureData = JSON.stringify({
        data: value,
        hash: integrityHash,
        timestamp: Date.now(),
        version: "1.0",
      });

      await SecureStore.setItemAsync(key, secureData);
      
    } catch (error) {
      
      throw error;
    }
  },

  async secureRetrieve(key: string): Promise<string | null> {
    try {
      const storedData = await SecureStore.getItemAsync(key);
      if (!storedData) return null;

      // Validate integrity for critical data
      try {
        const parsed = JSON.parse(storedData);
        if (parsed.data && parsed.hash) {
          const computedHash = this.generateIntegrityHash(parsed.data);
          if (computedHash !== parsed.hash) {
            
            // Don't fail, but log the issue
          }
        }
        return parsed.data || storedData;
      } catch (parseError) {
        // Fallback for old format data
        
        return storedData;
      }
    } catch (error) {
      
      return null;
    }
  },

  // Generate simple integrity hash (not cryptographically secure, but for basic validation)
  generateIntegrityHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  },

  // Backup and recovery (basic implementation)
  async backupTokens(): Promise<{
    accessToken?: string;
    refreshToken?: string;
  }> {
    try {
      const accessToken = await this.secureRetrieve("access_token");
      const refreshToken = await this.secureRetrieve("refresh_token");

      const backup = {
        accessToken: accessToken || undefined,
        refreshToken: refreshToken || undefined,
        timestamp: Date.now(),
      };

      // Store backup in a separate key
      await SecureStore.setItemAsync("token_backup", JSON.stringify(backup));
      

      return backup;
    } catch (error) {
      
      return {};
    }
  },

  async restoreTokens(): Promise<boolean> {
    try {
      const backupData = await SecureStore.getItemAsync("token_backup");
      if (!backupData) return false;

      const backup = JSON.parse(backupData);

      // Only restore if backup is recent (less than 24 hours old)
      const isRecent =
        backup.timestamp && Date.now() - backup.timestamp < 24 * 60 * 60 * 1000;

      if (isRecent && backup.accessToken) {
        await this.secureStore("access_token", backup.accessToken);
        
      }

      if (isRecent && backup.refreshToken) {
        await this.secureStore("refresh_token", backup.refreshToken);
        
      }

      return true;
    } catch (error) {
      
      return false;
    }
  },

  // Clear all tokens (logout)
  async clearTokens() {
    try {
      // Create backup before clearing (for recovery if needed)
      await this.backupTokens();

      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");

      // Clear cache
      tokenCache.accessToken = null;
      tokenCache.refreshToken = null;
      tokenCache.isRefreshing = false;
      tokenCache.refreshPromise = null;

      
    } catch (error) {
      
    }
  },

  // Get headers for protected API calls
  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken();
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
    }
    return {
      "Content-Type": "application/json",
    };
  },

  // Get headers for refresh token calls
  async getRefreshHeaders(): Promise<Record<string, string>> {
    const refreshToken = await this.getRefreshToken();
    if (refreshToken) {
      return {
        Authorization: `Bearer ${refreshToken}`,
        "Content-Type": "application/json",
      };
    }
    return {
      "Content-Type": "application/json",
    };
  },
};

// Legacy token cache for Clerk compatibility (can be removed later)
// Note: tokenCache functionality is now handled internally

// Internal Authentication Functions

// Register a new user
export const registerUser = async (
  userData: RegisterData,
): Promise<{ success: boolean; message: string; data?: AuthResponse }> => {
  try {
    

    // Prepare base user data without Firebase fields
    const baseUserData = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      country: userData.country,
      state: userData.state,
      city: userData.city,
      dateOfBirth: userData.dateOfBirth,
      gender: userData.gender,
      preferredLanguage: userData.preferredLanguage,
      timezone: userData.timezone,
    };

    // Get Firebase token data if not provided
    let firebaseData = null;
    if (!userData.firebaseToken) {
      
      try {
        // Lazy import to avoid circular dependency
        const { firebaseService } = require("../app/services/firebaseService");
        firebaseData = await firebaseService.getFirebaseTokenData();
      } catch (error) {
        
      }

      if (firebaseData) {
        userData.firebaseToken = firebaseData.token;
        userData.deviceType = firebaseData.deviceType;
        userData.deviceId = firebaseData.deviceId;
        
      } else {
        
      }
    }

    // For compatibility with current backend, do NOT send Firebase fields on register either
    const requestBody: any = { ...baseUserData };
    if (userData.firebaseToken || userData.deviceType || userData.deviceId) {
      
    } else {
      
    }

    

    const response = await fetchAPI("auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    

    // Handle nested response structure from backend
    const accessToken = response?.data?.accessToken || response?.accessToken;
    const refreshToken = response?.data?.refreshToken || response?.refreshToken;
    const user = response?.data?.user || response?.user;

    
    
    
    
    
    
    
    
    
    
    
    

    // Test the condition explicitly
    const hasAccessToken = !!accessToken;
    const hasRefreshToken = !!refreshToken;
    
    
    

    // Check if we have a successful response regardless of token extraction
    const isSuccessful =
      response?.statusCode === 201 ||
      response?.message === "Success" ||
      (accessToken && refreshToken);

    
    
    
    

    if (isSuccessful) {
      

      // Store tokens securely (use extracted tokens or try alternative extraction)
      const finalAccessToken =
        accessToken || response?.data?.accessToken || response?.accessToken;
      const finalRefreshToken =
        refreshToken || response?.data?.refreshToken || response?.refreshToken;
      const finalUser = user || response?.data?.user || response?.user;

      if (finalAccessToken && finalRefreshToken) {
        await tokenManager.setAccessToken(finalAccessToken);
        await tokenManager.setRefreshToken(finalRefreshToken);
        
      } else {
        
      }

      // Store user data in global store
      if (finalUser) {
        
        getUserStore().setUser(finalUser);
      }

      

      return {
        success: true,
        message: "User registered successfully",
        data: {
          accessToken: finalAccessToken,
          refreshToken: finalRefreshToken,
          user: finalUser,
        },
      };
    }

    
    
    
    

    return {
      success: false,
      message: response?.message || "Registration failed",
    };
  } catch (error: any) {
    
    return {
      success: false,
      message: error.message || "Registration failed",
    };
  }
};

// Login user
export const loginUser = async (
  credentials: LoginCredentials,
): Promise<{ success: boolean; message: string; data?: AuthResponse }> => {
  try {
    

    // Prepare base credentials without Firebase fields
    const baseCredentials = {
      email: credentials.email,
      password: credentials.password,
    };

    // Get Firebase token data if not provided
    let firebaseData = null;
    if (!credentials.firebaseToken) {
      
      try {
        // Lazy import to avoid circular dependency
        const { firebaseService } = require("../app/services/firebaseService");
        firebaseData = await firebaseService.getFirebaseTokenData();
      } catch (error) {
        
      }

      if (firebaseData) {
        credentials.firebaseToken = firebaseData.token;
        credentials.deviceType = firebaseData.deviceType;
        credentials.deviceId = firebaseData.deviceId;
        
      } else {
        
      }
    }

    // Build request body and include Firebase fields only when all are present
    const requestBody: any = { ...baseCredentials };

    const hasValidFirebaseToken =
      typeof credentials.firebaseToken === "string" &&
      credentials.firebaseToken.trim().length > 0;
    const hasValidDeviceType =
      typeof credentials.deviceType === "string" &&
      credentials.deviceType.trim().length > 0;
    const hasValidDeviceId =
      typeof credentials.deviceId === "string" &&
      credentials.deviceId.trim().length > 0;

    if (hasValidFirebaseToken && hasValidDeviceType && hasValidDeviceId) {
      requestBody.firebaseToken = credentials.firebaseToken;
      requestBody.deviceType = credentials.deviceType;
      requestBody.deviceId = credentials.deviceId;
      
    } else {
      
    }

    

    const response = await fetchAPI("auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    

    // Handle nested response structure from backend
    const accessToken = response?.data?.accessToken || response?.accessToken;
    const refreshToken = response?.data?.refreshToken || response?.refreshToken;
    const user = response?.data?.user || response?.user;

    
    
    
    
    

    // Check if we have a successful response regardless of token extraction
    const isSuccessful =
      response?.statusCode === 201 ||
      response?.message === "Success" ||
      (accessToken && refreshToken);

    if (isSuccessful) {
      

      // Store tokens securely (use extracted tokens or try alternative extraction)
      const finalAccessToken =
        accessToken || response?.data?.accessToken || response?.accessToken;
      const finalRefreshToken =
        refreshToken || response?.data?.refreshToken || response?.refreshToken;
      const finalUser = user || response?.data?.user || response?.user;

      if (finalAccessToken && finalRefreshToken) {
        await tokenManager.setAccessToken(finalAccessToken);
        await tokenManager.setRefreshToken(finalRefreshToken);
        
      } else {
        
      }

      // Store user data in global store
      if (finalUser) {
        
        getUserStore().setUser(finalUser);
      }

      

      return {
        success: true,
        message: "Login successful",
        data: {
          accessToken: finalAccessToken,
          refreshToken: finalRefreshToken,
          user: finalUser,
        },
      };
    }

    return {
      success: false,
      message: response?.message || "Login failed",
    };
  } catch (error: any) {
    
    return {
      success: false,
      message: error.message || "Login failed",
    };
  }
};

// Logout user
export const logoutUser = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    

    const response = await fetchAPI("auth/logout", {
      method: "POST",
      headers: await tokenManager.getAuthHeaders(),
    });

    // Clear tokens regardless of API response
    await tokenManager.clearTokens();

    // Clear user data from global store
    
    getUserStore().clearUser();

    // Reset onboarding local status to avoid skipping flow on next login
    try {
      await resetOnboardingStatus();
      
    } catch (e) {
      
    }

    
    return {
      success: true,
      message: response?.message || "Logout successful",
    };
  } catch (error: any) {
    
    // Still clear tokens even if API call fails
    await tokenManager.clearTokens();

    // Clear user data from global store even on error
    
    getUserStore().clearUser();

    try {
      await resetOnboardingStatus();
    } catch {}

    return {
      success: true,
      message: "Logged out locally",
    };
  }
};

// Get user profile
export const getUserProfile = async (): Promise<{
  success: boolean;
  message: string;
  data?: User;
}> => {
  try {
    

    const response = await fetchAPI("auth/profile", {
      method: "GET",
      headers: await tokenManager.getAuthHeaders(),
    });

    
    
    

    // Handle nested response structure (data wrapper)
    const userData = response?.data || response;

    
    
    
    
    

    // Primary check: HTTP status success with valid data
    if (
      (response?.statusCode === 200 || response?.statusCode === 201) &&
      userData?.id &&
      userData?.email
    ) {
      
      return {
        success: true,
        message: response.message || "Profile retrieved successfully",
        data: userData,
      };
    }

    if (userData?.id && userData?.email) {
      
      return {
        success: true,
        message: "Profile retrieved successfully",
        data: userData,
      };
    }

    // Check if response has success/message structure
    if (response?.success === true && response?.data) {
      
      return {
        success: true,
        message: response.message || "Profile retrieved successfully",
        data: response.data,
      };
    }

    // Check if response has success/message structure without data wrapper
    if (response?.success === true && userData?.id) {
      
      return {
        success: true,
        message: response.message || "Profile retrieved successfully",
        data: userData,
      };
    }

    
    
    
    
    
    
    

    return {
      success: false,
      message:
        response?.message ||
        "Failed to get profile - invalid response structure",
    };
  } catch (error: any) {
    
    return {
      success: false,
      message: error.message || "Failed to get profile",
    };
  }
};

// Refresh access token
export const refreshAccessToken = async (): Promise<{
  success: boolean;
  message: string;
  data?: { accessToken: string; refreshToken: string };
}> => {
  try {
    

    const refreshToken = await tokenManager.getRefreshToken();
    if (!refreshToken) {
      return {
        success: false,
        message: "No refresh token available",
      };
    }

    const response = await fetchAPI("auth/refresh", {
      method: "POST",
      headers: await tokenManager.getRefreshHeaders(),
      body: JSON.stringify({ refreshToken }),
    });

    

    if (response?.accessToken && response?.refreshToken) {
      // Store new tokens
      await tokenManager.setAccessToken(response.accessToken);
      await tokenManager.setRefreshToken(response.refreshToken);

      return {
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        },
      };
    }

    return {
      success: false,
      message: response?.message || "Token refresh failed",
    };
  } catch (error: any) {
    
    return {
      success: false,
      message: error.message || "Token refresh failed",
    };
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    // First check if user exists in store (fast check)
    const userStore = getUserStore();
    if (userStore.user && userStore.isAuthenticated) {
      
      return true;
    }

    // Fallback to token check
    const token = await tokenManager.getAccessToken();
    const hasToken = !!token;

    // Update store based on token existence
    if (hasToken && !userStore.user) {
      
      // Try to refresh user data if we have token but no user in store
      const profileResult = await getUserProfile();
      

      if (profileResult.success && profileResult.data) {
        
        userStore.setUser(profileResult.data);
        return true;
      } else {
        
      }
    }

    
    return hasToken;
  } catch (error) {
    
    return false;
  }
};

// Legacy functions for backward compatibility (can be removed later)
export const jwtTokenManager = tokenManager; // Alias for backward compatibility

// Initialize user store on app startup
export const initializeUserStore = async (): Promise<void> => {
  try {
    

    // Check if we have a valid token
    const token = await tokenManager.getAccessToken();
    

    if (!token) {
      
      getUserStore().clearUser();
      return;
    }

    // Check if user is already in store
    const userStore = getUserStore();
    

    if (userStore.user) {
      
      return;
    }

    // Fetch user profile and store it
    
    const result = await getUserProfile();
    

    if (result.success && result.data) {
      
      
      userStore.setUser(result.data);

      // Verify the user was stored
      const updatedStore = getUserStore();
      
    } else {
      
      
      userStore.clearUser();
    }
  } catch (error) {
    
    
    getUserStore().clearUser();
  }
};

// Hook to ensure user data is available (optional usage)
export const useEnsureUserData = () => {
  // Lazy import to avoid circular dependency
  const { useUserStore } = require("@/store");
  const userStore = useUserStore?.();

  const ensureUserData = async () => {
    // If user is already in store, no need to do anything
    if (userStore.user) {
      return userStore.user;
    }

    // If no user in store but authenticated, try to refresh
    if (userStore.isAuthenticated) {
      await userStore.refreshUser();
      return userStore.user;
    }

    // If not authenticated, initialize the store
    await initializeUserStore();
    return userStore.user;
  };

  return {
    ensureUserData,
    user: userStore.user,
    isLoading: userStore.isLoading,
  };
};

// Test function to debug profile API response
export const debugProfileResponse = async () => {
  try {
    

    const response = await fetchAPI("auth/profile", {
      method: "GET",
      headers: await tokenManager.getAuthHeaders(),
    });

    
    
    
    
    
    
    
    

    // Test different extraction methods
    const method1 = response?.data || response;
    const method2 = response?.data;
    const method3 = response;

    
    
    

    return response;
  } catch (error) {
    
    return null;
  }
};

// Simple function to check if user is logged in (for UI purposes)
export const checkAuthStatus = async (): Promise<boolean> => {
  return await isAuthenticated();
};

// Helper functions for common UI operations

// Session management functions
export const sessionManager = {
  // Update last activity timestamp
  updateActivity: () => {
    sessionState.lastActivity = new Date();
    sessionState.warningShown = false; // Reset warning flag
    
  },

  // Start automatic logout monitoring
  startAutoLogout: (config: Partial<SessionConfig> = {}) => {
    const sessionConfig = { ...defaultSessionConfig, ...config };

    // Clear existing timer
    if (sessionState.autoLogoutTimer) {
      clearInterval(sessionState.autoLogoutTimer);
    }

    

    sessionState.autoLogoutTimer = setInterval(() => {
      if (!sessionState.isActive) return;

      const now = new Date();
      const timeSinceActivity =
        now.getTime() - sessionState.lastActivity.getTime();
      const timeUntilLogout =
        sessionConfig.autoLogoutTimeout - timeSinceActivity;
      const timeUntilWarning = timeUntilLogout - sessionConfig.warningTime;

      // Show warning before logout
      if (
        timeUntilWarning <= 0 &&
        !sessionState.warningShown &&
        timeUntilLogout > 0
      ) {
        sessionState.warningShown = true;
        

        // Show UI warning (if UI store is available)
        try {
          const uiStore = require("@/store").useUIStore?.getState();
          if (uiStore?.showError) {
            uiStore.showError(
              "Session Expiring",
              `Your session will expire in ${Math.ceil(timeUntilLogout / 60000)} minutes due to inactivity.`,
            );
          }
        } catch (error) {
          
        }
      }

      // Auto logout when timeout is reached
      if (timeSinceActivity >= sessionConfig.autoLogoutTimeout) {
        
        sessionManager.stopAutoLogout();
        sessionManager.forceLogout("Session expired due to inactivity");
      }
    }, sessionConfig.checkInterval);
  },

  // Stop automatic logout monitoring
  stopAutoLogout: () => {
    if (sessionState.autoLogoutTimer) {
      clearInterval(sessionState.autoLogoutTimer);
      sessionState.autoLogoutTimer = null;
      
    }
  },

  // Force logout with reason
  forceLogout: async (reason: string = "Session terminated") => {
    

    try {
      await logoutUser();
      
    } catch (error) {
      
      // Clear tokens anyway
      await tokenManager.clearTokens();
    }

    // Reset session state
    sessionManager.resetSession();
  },

  // Reset session state
  resetSession: () => {
    sessionState.lastActivity = new Date();
    sessionState.warningShown = false;
    sessionState.isActive = true;
    sessionManager.stopAutoLogout();
    
  },

  // Get session info
  getSessionInfo: () => ({
    lastActivity: sessionState.lastActivity,
    isActive: sessionState.isActive,
    warningShown: sessionState.warningShown,
    timeSinceActivity: Date.now() - sessionState.lastActivity.getTime(),
    autoLogoutTimer: sessionState.autoLogoutTimer,
  }),

  // Pause/resume session monitoring (useful for background/foreground transitions)
  pauseSession: () => {
    sessionState.isActive = false;
    
  },

  resumeSession: () => {
    sessionState.isActive = true;
    sessionManager.updateActivity(); // Reset activity timer
    
  },
};

// Enhanced UI helpers with session management
// Alias exports for backward compatibility with tests
export const login = loginUser;
export const register = registerUser;
export const logout = logoutUser;
export const getAccessToken = tokenManager.getAccessToken;
export const setAccessToken = tokenManager.setAccessToken;
export const getRefreshToken = tokenManager.getRefreshToken;
export const setRefreshToken = tokenManager.setRefreshToken;
export const clearTokens = tokenManager.clearTokens;
export const decodeJWT = (token: string) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    throw new Error("Invalid JWT token");
  }
};
export const validateToken = async (token: string) => {
  return !isTokenExpired(token);
};
export const backupTokens = tokenManager.backupTokens;
export const restoreTokens = tokenManager.restoreTokens;
export const updateActivity = sessionManager.updateActivity;
export const startAutoLogout = sessionManager.startAutoLogout;
export const stopAutoLogout = sessionManager.stopAutoLogout;
export const resetSession = sessionManager.resetSession;
export const getSessionInfo = sessionManager.getSessionInfo;
export const pauseSession = sessionManager.pauseSession;
export const resumeSession = sessionManager.resumeSession;
export const forceLogout = sessionManager.forceLogout;

// Export the isTokenExpired function
export { isTokenExpired };

export const uiHelpers = {
  // Quick login with UI feedback
  loginWithUI: async (credentials: { email: string; password: string }) => {
    const { withUI } = useUIStore.getState() as any; // Type workaround
    const result = await withUI(() => loginUser(credentials), {
      loadingMessage: "Signing you in...",
      successMessage: "Welcome back!",
      errorTitle: "Login Failed",
    });

    // Start session monitoring on successful login
    if (result?.success) {
      sessionManager.resetSession();
      sessionManager.startAutoLogout();
    }

    return result;
  },

  // Quick register with UI feedback
  registerWithUI: async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    const { withUI } = useUIStore.getState() as any; // Type workaround
    return await withUI(() => registerUser(userData), {
      loadingMessage: "Creating your account...",
      successMessage: "Account created successfully!",
      errorTitle: "Registration Failed",
    });
  },

  // Quick logout with UI feedback
  logoutWithUI: async () => {
    const { withUI } = useUIStore.getState() as any; // Type workaround
    const result = await withUI(() => logoutUser(), {
      loadingMessage: "Signing out...",
      successMessage: "Signed out successfully",
      errorTitle: "Logout Error",
    });

    // Stop session monitoring on logout
    if (result?.success) {
      sessionManager.resetSession();
    }

    return result;
  },
};
