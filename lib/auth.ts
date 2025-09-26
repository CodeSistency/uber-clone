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
      console.warn("[Auth] Could not load user store:", error);
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
  autoLogoutTimer: number | null;
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
    console.warn("[TokenManager] Error checking token expiration:", error);
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

      console.log("[TokenManager] Access token stored securely", {
        expiresAt: tokenCache.accessToken.expiresAt,
        issuedAt: tokenCache.accessToken.issuedAt,
      });
    } catch (error) {
      console.error("[TokenManager] Error storing access token:", error);
    }
  },

  // Get access token with automatic refresh if expired
  async getAccessToken(): Promise<string | null> {
    try {
      let token = await SecureStore.getItemAsync("access_token");

      if (!token) {
        console.log("[TokenManager] No access token found");
        return null;
      }

      // Check if token is expired and attempt refresh
      if (isTokenExpired(token)) {
        console.log("[TokenManager] Access token expired, attempting refresh");

        const refreshResult = await this.refreshAccessToken();
        if (refreshResult?.success && refreshResult.data?.accessToken) {
          console.log("[TokenManager] Token refreshed successfully");
          return refreshResult.data.accessToken;
        } else {
          console.warn(
            "[TokenManager] Token refresh failed, returning expired token",
          );
          // Return the expired token anyway - let the API handle the 401
          return token;
        }
      }

      return token;
    } catch (error) {
      console.error("[TokenManager] Error retrieving access token:", error);
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

      console.log("[TokenManager] Refresh token stored securely", {
        expiresAt: tokenCache.refreshToken.expiresAt,
        issuedAt: tokenCache.refreshToken.issuedAt,
      });
    } catch (error) {
      console.error("[TokenManager] Error storing refresh token:", error);
    }
  },

  // Get refresh token
  async getRefreshToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync("refresh_token");
      return token;
    } catch (error) {
      console.error("[Auth] Error retrieving refresh token:", error);
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
      console.log("[TokenManager] Refresh already in progress, waiting...");
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

      console.log("[TokenManager] Attempting token refresh");

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

        console.log("[TokenManager] ✅ Token refresh successful");
        return {
          success: true,
          message: "Token refreshed successfully",
          data: {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          },
        };
      } else {
        console.log(
          "[TokenManager] ❌ Token refresh failed - invalid response",
        );
        return {
          success: false,
          message: response?.message || "Token refresh failed",
        };
      }
    } catch (error: any) {
      console.error("[TokenManager] ❌ Token refresh error:", error);
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
      console.warn("[TokenManager] Token validation error:", error);
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
      console.log(`[TokenManager] Data stored securely for key: ${key}`);
    } catch (error) {
      console.error(`[TokenManager] Error storing data for key ${key}:`, error);
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
            console.warn(
              `[TokenManager] Data integrity check failed for key: ${key}`,
            );
            // Don't fail, but log the issue
          }
        }
        return parsed.data || storedData;
      } catch (parseError) {
        // Fallback for old format data
        console.log(`[TokenManager] Using legacy data format for key: ${key}`);
        return storedData;
      }
    } catch (error) {
      console.error(
        `[TokenManager] Error retrieving data for key ${key}:`,
        error,
      );
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
      console.log("[TokenManager] Token backup created");

      return backup;
    } catch (error) {
      console.error("[TokenManager] Error creating token backup:", error);
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
        console.log("[TokenManager] Access token restored from backup");
      }

      if (isRecent && backup.refreshToken) {
        await this.secureStore("refresh_token", backup.refreshToken);
        console.log("[TokenManager] Refresh token restored from backup");
      }

      return true;
    } catch (error) {
      console.error(
        "[TokenManager] Error restoring tokens from backup:",
        error,
      );
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

      console.log("[TokenManager] All tokens cleared");
    } catch (error) {
      console.error("[TokenManager] Error clearing tokens:", error);
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
    console.log("[Auth] Registering user:", userData.email);

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
      console.log("[Auth] No Firebase token provided, attempting to get one");
      try {
        // Lazy import to avoid circular dependency
        const { firebaseService } = require("../app/services/firebaseService");
        firebaseData = await firebaseService.getFirebaseTokenData();
      } catch (error) {
        console.warn("[Auth] Firebase service not available:", error);
      }

      if (firebaseData) {
        userData.firebaseToken = firebaseData.token;
        userData.deviceType = firebaseData.deviceType;
        userData.deviceId = firebaseData.deviceId;
        console.log(
          "[Auth] Firebase token obtained and added to registration data",
        );
      } else {
        console.log(
          "[Auth] Could not obtain Firebase token, proceeding without it",
        );
      }
    }

    // For compatibility with current backend, do NOT send Firebase fields on register either
    const requestBody: any = { ...baseUserData };
    if (userData.firebaseToken || userData.deviceType || userData.deviceId) {
      console.log(
        "[Auth] Firebase fields obtained but will NOT be sent in registration request (backend rejects them)",
      );
    } else {
      console.log("[Auth] Sending basic registration without Firebase fields");
    }

    console.log(
      "[Auth] Final request body:",
      JSON.stringify(requestBody, null, 2),
    );

    const response = await fetchAPI("auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("[Auth] Register response:", response);

    // Handle nested response structure from backend
    const accessToken = response?.data?.accessToken || response?.accessToken;
    const refreshToken = response?.data?.refreshToken || response?.refreshToken;
    const user = response?.data?.user || response?.user;

    console.log("[Auth] Extracted tokens:");
    console.log("[Auth] accessToken:", accessToken ? "PRESENT" : "MISSING");
    console.log("[Auth] refreshToken:", refreshToken ? "PRESENT" : "MISSING");
    console.log(
      "[Auth] accessToken value:",
      accessToken ? accessToken.substring(0, 20) + "..." : "undefined",
    );
    console.log(
      "[Auth] refreshToken value:",
      refreshToken ? refreshToken.substring(0, 20) + "..." : "undefined",
    );
    console.log("[Auth] accessToken type:", typeof accessToken);
    console.log("[Auth] refreshToken type:", typeof refreshToken);
    console.log("[Auth] accessToken length:", accessToken?.length);
    console.log("[Auth] refreshToken length:", refreshToken?.length);
    console.log("[Auth] accessToken truthy:", !!accessToken);
    console.log("[Auth] refreshToken truthy:", !!refreshToken);
    console.log("[Auth] Combined condition:", !!(accessToken && refreshToken));

    // Test the condition explicitly
    const hasAccessToken = !!accessToken;
    const hasRefreshToken = !!refreshToken;
    console.log("[Auth] hasAccessToken:", hasAccessToken);
    console.log("[Auth] hasRefreshToken:", hasRefreshToken);
    console.log(
      "[Auth] Final condition result:",
      hasAccessToken && hasRefreshToken,
    );

    // Check if we have a successful response regardless of token extraction
    const isSuccessful =
      response?.statusCode === 201 ||
      response?.message === "Success" ||
      (accessToken && refreshToken);

    console.log("[Auth] isSuccessful check:", isSuccessful);
    console.log("[Auth] statusCode check:", response?.statusCode === 201);
    console.log("[Auth] message check:", response?.message === "Success");
    console.log("[Auth] tokens check:", !!(accessToken && refreshToken));

    if (isSuccessful) {
      console.log(
        "[Auth] Registration successful, proceeding with token storage",
      );

      // Store tokens securely (use extracted tokens or try alternative extraction)
      const finalAccessToken =
        accessToken || response?.data?.accessToken || response?.accessToken;
      const finalRefreshToken =
        refreshToken || response?.data?.refreshToken || response?.refreshToken;
      const finalUser = user || response?.data?.user || response?.user;

      if (finalAccessToken && finalRefreshToken) {
        await tokenManager.setAccessToken(finalAccessToken);
        await tokenManager.setRefreshToken(finalRefreshToken);
        console.log("[Auth] Tokens stored successfully");
      } else {
        console.log("[Auth] Warning: Could not extract tokens for storage");
      }

      // Store user data in global store
      if (finalUser) {
        console.log("[Auth] Storing user data in global store:", finalUser);
        getUserStore().setUser(finalUser);
      }

      console.log("[Auth] User registered successfully:", finalUser?.email);

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

    console.log("[Auth] Tokens are missing, registration failed");
    console.log("[Auth] accessToken exists:", !!accessToken);
    console.log("[Auth] refreshToken exists:", !!refreshToken);
    console.log("[Auth] response.message:", response?.message);

    return {
      success: false,
      message: response?.message || "Registration failed",
    };
  } catch (error: any) {
    console.error("[Auth] Registration error:", error);
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
    console.log("[Auth] Logging in user:", credentials.email);

    // Prepare base credentials without Firebase fields
    const baseCredentials = {
      email: credentials.email,
      password: credentials.password,
    };

    // Get Firebase token data if not provided
    let firebaseData = null;
    if (!credentials.firebaseToken) {
      console.log("[Auth] No Firebase token provided, attempting to get one");
      try {
        // Lazy import to avoid circular dependency
        const { firebaseService } = require("../app/services/firebaseService");
        firebaseData = await firebaseService.getFirebaseTokenData();
      } catch (error) {
        console.warn("[Auth] Firebase service not available:", error);
      }

      if (firebaseData) {
        credentials.firebaseToken = firebaseData.token;
        credentials.deviceType = firebaseData.deviceType;
        credentials.deviceId = firebaseData.deviceId;
        console.log(
          "[Auth] Firebase token obtained and added to login credentials",
        );
      } else {
        console.log(
          "[Auth] Could not obtain Firebase token, proceeding without it",
        );
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
      console.log("[Auth] Including Firebase fields in login request");
    } else {
      console.log(
        "[Auth] Firebase fields missing or invalid, sending basic login",
      );
    }

    console.log(
      "[Auth] Final request body:",
      JSON.stringify(requestBody, null, 2),
    );

    const response = await fetchAPI("auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("[Auth] Login response:", response);

    // Handle nested response structure from backend
    const accessToken = response?.data?.accessToken || response?.accessToken;
    const refreshToken = response?.data?.refreshToken || response?.refreshToken;
    const user = response?.data?.user || response?.user;

    console.log("[Auth] Extracted tokens (login):");
    console.log("[Auth] accessToken:", accessToken ? "PRESENT" : "MISSING");
    console.log("[Auth] refreshToken:", refreshToken ? "PRESENT" : "MISSING");
    console.log(
      "[Auth] accessToken value:",
      accessToken ? accessToken.substring(0, 20) + "..." : "undefined",
    );
    console.log(
      "[Auth] refreshToken value:",
      refreshToken ? refreshToken.substring(0, 20) + "..." : "undefined",
    );

    // Check if we have a successful response regardless of token extraction
    const isSuccessful =
      response?.statusCode === 201 ||
      response?.message === "Success" ||
      (accessToken && refreshToken);

    if (isSuccessful) {
      console.log("[Auth] Login successful, proceeding with token storage");

      // Store tokens securely (use extracted tokens or try alternative extraction)
      const finalAccessToken =
        accessToken || response?.data?.accessToken || response?.accessToken;
      const finalRefreshToken =
        refreshToken || response?.data?.refreshToken || response?.refreshToken;
      const finalUser = user || response?.data?.user || response?.user;

      if (finalAccessToken && finalRefreshToken) {
        await tokenManager.setAccessToken(finalAccessToken);
        await tokenManager.setRefreshToken(finalRefreshToken);
        console.log("[Auth] Tokens stored successfully");
      } else {
        console.log("[Auth] Warning: Could not extract tokens for storage");
      }

      // Store user data in global store
      if (finalUser) {
        console.log("[Auth] Storing user data in global store:", finalUser);
        getUserStore().setUser(finalUser);
      }

      console.log("[Auth] User logged in successfully:", finalUser?.email);

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
    console.error("[Auth] Login error:", error);
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
    console.log("[Auth] Logging out user");

    const response = await fetchAPI("auth/logout", {
      method: "POST",
      headers: await tokenManager.getAuthHeaders(),
    });

    // Clear tokens regardless of API response
    await tokenManager.clearTokens();

    // Clear user data from global store
    console.log("[Auth] Clearing user data from global store");
    getUserStore().clearUser();

    // Reset onboarding local status to avoid skipping flow on next login
    try {
      await resetOnboardingStatus();
      console.log(
        "[Auth] Onboarding status reset locally (and API if available)",
      );
    } catch (e) {
      console.warn("[Auth] Failed to reset onboarding status:", e);
    }

    console.log("[Auth] User logged out successfully");
    return {
      success: true,
      message: response?.message || "Logout successful",
    };
  } catch (error: any) {
    console.error("[Auth] Logout error:", error);
    // Still clear tokens even if API call fails
    await tokenManager.clearTokens();

    // Clear user data from global store even on error
    console.log("[Auth] Clearing user data from global store (error case)");
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
    console.log("[Auth] Getting user profile");

    const response = await fetchAPI("auth/profile", {
      method: "GET",
      headers: await tokenManager.getAuthHeaders(),
    });

    console.log("[Auth] Profile response:", response);
    console.log("[Auth] Profile response type:", typeof response);
    console.log("[Auth] Profile response keys:", Object.keys(response || {}));

    // Handle nested response structure (data wrapper)
    const userData = response?.data || response;

    console.log("[Auth] Extracted user data:", userData);
    console.log("[Auth] UserData has id:", !!userData?.id);
    console.log("[Auth] UserData has email:", !!userData?.email);
    console.log("[Auth] Response has statusCode:", !!response?.statusCode);
    console.log("[Auth] StatusCode value:", response?.statusCode);

    // Primary check: HTTP status success with valid data
    if (
      (response?.statusCode === 200 || response?.statusCode === 201) &&
      userData?.id &&
      userData?.email
    ) {
      console.log("[Auth] ✅ HTTP success with valid user data");
      return {
        success: true,
        message: response.message || "Profile retrieved successfully",
        data: userData,
      };
    }

    if (userData?.id && userData?.email) {
      console.log("[Auth] Valid user data found:", userData);
      return {
        success: true,
        message: "Profile retrieved successfully",
        data: userData,
      };
    }

    // Check if response has success/message structure
    if (response?.success === true && response?.data) {
      console.log("[Auth] Success response with data:", response.data);
      return {
        success: true,
        message: response.message || "Profile retrieved successfully",
        data: response.data,
      };
    }

    // Check if response has success/message structure without data wrapper
    if (response?.success === true && userData?.id) {
      console.log("[Auth] Success response with user data:", userData);
      return {
        success: true,
        message: response.message || "Profile retrieved successfully",
        data: userData,
      };
    }

    console.log("[Auth] ❌ No valid condition matched, treating as error");
    console.log("[Auth] Response success:", response?.success);
    console.log("[Auth] Response statusCode:", response?.statusCode);
    console.log("[Auth] Response message:", response?.message);
    console.log("[Auth] UserData id:", userData?.id);
    console.log("[Auth] UserData email:", userData?.email);
    console.log(
      "[Auth] Full response for debugging:",
      JSON.stringify(response, null, 2),
    );

    return {
      success: false,
      message:
        response?.message ||
        "Failed to get profile - invalid response structure",
    };
  } catch (error: any) {
    console.error("[Auth] Profile error:", error);
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
    console.log("[Auth] Refreshing access token");

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

    console.log("[Auth] Refresh response:", response);

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
    console.error("[Auth] Token refresh error:", error);
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
      console.log("[Auth] User authenticated via store:", userStore.user.email);
      return true;
    }

    // Fallback to token check
    const token = await tokenManager.getAccessToken();
    const hasToken = !!token;

    // Update store based on token existence
    if (hasToken && !userStore.user) {
      console.log(
        "[Auth] Token exists but no user in store, attempting to fetch user profile",
      );
      // Try to refresh user data if we have token but no user in store
      const profileResult = await getUserProfile();
      console.log(
        "[Auth] Profile fetch result in isAuthenticated:",
        profileResult,
      );

      if (profileResult.success && profileResult.data) {
        console.log("[Auth] Setting user from profile:", profileResult.data);
        userStore.setUser(profileResult.data);
        return true;
      } else {
        console.log(
          "[Auth] Failed to fetch profile in isAuthenticated:",
          profileResult.message,
        );
      }
    }

    console.log("[Auth] Authentication check result:", hasToken);
    return hasToken;
  } catch (error) {
    console.error("[Auth] Error checking authentication:", error);
    return false;
  }
};

// Legacy functions for backward compatibility (can be removed later)
export const jwtTokenManager = tokenManager; // Alias for backward compatibility

// Initialize user store on app startup
export const initializeUserStore = async (): Promise<void> => {
  try {
    console.log("[Auth] Initializing user store...");

    // Check if we have a valid token
    const token = await tokenManager.getAccessToken();
    console.log("[Auth] Access token exists:", !!token);

    if (!token) {
      console.log("[Auth] No token found, clearing user store");
      getUserStore().clearUser();
      return;
    }

    // Check if user is already in store
    const userStore = getUserStore();
    console.log("[Auth] Current user in store:", userStore.user);

    if (userStore.user) {
      console.log("[Auth] User already in store:", userStore.user.email);
      return;
    }

    // Fetch user profile and store it
    console.log("[Auth] Fetching user profile for store initialization");
    const result = await getUserProfile();
    console.log("[Auth] Profile fetch result:", result);

    if (result.success && result.data) {
      console.log("[Auth] ✅ User profile fetched successfully:", result.data);
      console.log("[Auth] Storing user in store:", result.data.email);
      userStore.setUser(result.data);

      // Verify the user was stored
      const updatedStore = getUserStore();
      console.log("[Auth] ✅ User stored in store:", updatedStore.user);
    } else {
      console.log("[Auth] ❌ Failed to fetch user profile:", result.message);
      console.log("[Auth] Clearing user store due to fetch failure");
      userStore.clearUser();
    }
  } catch (error) {
    console.error("[Auth] ❌ Error initializing user store:", error);
    console.error(
      "[Auth] Error details:",
      error instanceof Error ? error.message : String(error),
    );
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
    console.log("[Auth] 🔍 Debug: Testing profile API response");

    const response = await fetchAPI("auth/profile", {
      method: "GET",
      headers: await tokenManager.getAuthHeaders(),
    });

    console.log("[Auth] 🔍 Debug: Raw profile response:", response);
    console.log("[Auth] 🔍 Debug: Response type:", typeof response);
    console.log("[Auth] 🔍 Debug: Response keys:", Object.keys(response || {}));
    console.log("[Auth] 🔍 Debug: Response has data:", !!response?.data);
    console.log("[Auth] 🔍 Debug: Response data:", response?.data);
    console.log("[Auth] 🔍 Debug: Response has user directly:", !!response?.id);
    console.log("[Auth] 🔍 Debug: Response success:", response?.success);
    console.log("[Auth] 🔍 Debug: Response message:", response?.message);

    // Test different extraction methods
    const method1 = response?.data || response;
    const method2 = response?.data;
    const method3 = response;

    console.log("[Auth] 🔍 Debug: Method 1 (data || response):", method1);
    console.log("[Auth] 🔍 Debug: Method 2 (data only):", method2);
    console.log("[Auth] 🔍 Debug: Method 3 (response only):", method3);

    return response;
  } catch (error) {
    console.error("[Auth] 🔍 Debug: Error testing profile response:", error);
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
    console.log(
      "[SessionManager] Activity updated:",
      sessionState.lastActivity,
    );
  },

  // Start automatic logout monitoring
  startAutoLogout: (config: Partial<SessionConfig> = {}) => {
    const sessionConfig = { ...defaultSessionConfig, ...config };

    // Clear existing timer
    if (sessionState.autoLogoutTimer) {
      clearInterval(sessionState.autoLogoutTimer);
    }

    console.log("[SessionManager] Starting auto-logout monitoring", {
      timeout: sessionConfig.autoLogoutTimeout,
      warningTime: sessionConfig.warningTime,
      checkInterval: sessionConfig.checkInterval,
    });

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
        console.warn(
          "[SessionManager] ⚠️ Auto-logout warning: Session will expire soon",
        );

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
          console.warn("[SessionManager] Could not show UI warning:", error);
        }
      }

      // Auto logout when timeout is reached
      if (timeSinceActivity >= sessionConfig.autoLogoutTimeout) {
        console.log(
          "[SessionManager] 🔄 Auto-logout triggered due to inactivity",
        );
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
      console.log("[SessionManager] Auto-logout monitoring stopped");
    }
  },

  // Force logout with reason
  forceLogout: async (reason: string = "Session terminated") => {
    console.log(`[SessionManager] Force logout: ${reason}`);

    try {
      await logoutUser();
      console.log("[SessionManager] ✅ User logged out successfully");
    } catch (error) {
      console.error("[SessionManager] ❌ Error during logout:", error);
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
    console.log("[SessionManager] Session state reset");
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
    console.log("[SessionManager] Session monitoring paused");
  },

  resumeSession: () => {
    sessionState.isActive = true;
    sessionManager.updateActivity(); // Reset activity timer
    console.log("[SessionManager] Session monitoring resumed");
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
