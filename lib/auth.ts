import * as SecureStore from "expo-secure-store";
import { fetchAPI } from "@/lib/fetch";
import { resetOnboardingStatus } from "@/lib/onboarding";

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
  deviceType?: 'ios' | 'android' | 'web';
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
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  preferredLanguage?: 'es' | 'en';
  timezone?: string;
  firebaseToken?: string;
  deviceType?: 'ios' | 'android' | 'web';
  deviceId?: string;
}

// Internal JWT Token management
export const tokenManager = {
  // Store access token
  async setAccessToken(token: string) {
    try {
      await SecureStore.setItemAsync("access_token", token);
      console.log("[Auth] Access token stored securely");
    } catch (error) {
      console.error("[Auth] Error storing access token:", error);
    }
  },

  // Get access token
  async getAccessToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync("access_token");
      return token;
    } catch (error) {
      console.error("[Auth] Error retrieving access token:", error);
      return null;
    }
  },

  // Store refresh token
  async setRefreshToken(token: string) {
    try {
      await SecureStore.setItemAsync("refresh_token", token);
      console.log("[Auth] Refresh token stored securely");
    } catch (error) {
      console.error("[Auth] Error storing refresh token:", error);
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

  // Clear all tokens (logout)
  async clearTokens() {
    try {
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
      console.log("[Auth] All tokens cleared");
    } catch (error) {
      console.error("[Auth] Error clearing tokens:", error);
    }
  },

  // Get headers for protected API calls
  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken();
    if (token) {
      return {
        "Authorization": `Bearer ${token}`,
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
        "Authorization": `Bearer ${refreshToken}`,
        "Content-Type": "application/json",
      };
    }
    return {
      "Content-Type": "application/json",
    };
  }
};

// Legacy token cache for Clerk compatibility (can be removed later)
export const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log("No values stored under key: " + key);
      }
      return item;
    } catch (error) {
      console.error("SecureStore get item error: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

// Internal Authentication Functions

// Register a new user
export const registerUser = async (userData: RegisterData): Promise<{ success: boolean; message: string; data?: AuthResponse }> => {
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
      timezone: userData.timezone
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
        console.log("[Auth] Firebase token obtained and added to registration data");
      } else {
        console.log("[Auth] Could not obtain Firebase token, proceeding without it");
      }
    }

    // For compatibility with current backend, do NOT send Firebase fields on register either
    const requestBody: any = { ...baseUserData };
    if (userData.firebaseToken || userData.deviceType || userData.deviceId) {
      console.log("[Auth] Firebase fields obtained but will NOT be sent in registration request (backend rejects them)");
    } else {
      console.log("[Auth] Sending basic registration without Firebase fields");
    }

    console.log("[Auth] Final request body:", JSON.stringify(requestBody, null, 2));

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
    console.log("[Auth] accessToken value:", accessToken ? accessToken.substring(0, 20) + "..." : "undefined");
    console.log("[Auth] refreshToken value:", refreshToken ? refreshToken.substring(0, 20) + "..." : "undefined");
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
    console.log("[Auth] Final condition result:", hasAccessToken && hasRefreshToken);

    // Check if we have a successful response regardless of token extraction
    const isSuccessful = response?.statusCode === 201 ||
                        response?.message === "Success" ||
                        (accessToken && refreshToken);

    console.log("[Auth] isSuccessful check:", isSuccessful);
    console.log("[Auth] statusCode check:", response?.statusCode === 201);
    console.log("[Auth] message check:", response?.message === "Success");
    console.log("[Auth] tokens check:", !!(accessToken && refreshToken));

    if (isSuccessful) {
      console.log("[Auth] Registration successful, proceeding with token storage");

      // Store tokens securely (use extracted tokens or try alternative extraction)
      const finalAccessToken = accessToken || response?.data?.accessToken || response?.accessToken;
      const finalRefreshToken = refreshToken || response?.data?.refreshToken || response?.refreshToken;
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
          user: finalUser
        }
      };
    }

    console.log("[Auth] Tokens are missing, registration failed");
    console.log("[Auth] accessToken exists:", !!accessToken);
    console.log("[Auth] refreshToken exists:", !!refreshToken);
    console.log("[Auth] response.message:", response?.message);

    return {
      success: false,
      message: response?.message || "Registration failed"
    };
  } catch (error: any) {
    console.error("[Auth] Registration error:", error);
            return {
      success: false,
      message: error.message || "Registration failed"
    };
  }
};

// Login user
export const loginUser = async (credentials: LoginCredentials): Promise<{ success: boolean; message: string; data?: AuthResponse }> => {
  try {
    console.log("[Auth] Logging in user:", credentials.email);

    // Prepare base credentials without Firebase fields
    const baseCredentials = {
      email: credentials.email,
      password: credentials.password
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
        console.log("[Auth] Firebase token obtained and added to login credentials");
      } else {
        console.log("[Auth] Could not obtain Firebase token, proceeding without it");
      }
    }

    // Build request body and include Firebase fields only when all are present
    const requestBody: any = { ...baseCredentials };

    const hasValidFirebaseToken = typeof credentials.firebaseToken === 'string' && credentials.firebaseToken.trim().length > 0;
    const hasValidDeviceType = typeof credentials.deviceType === 'string' && credentials.deviceType.trim().length > 0;
    const hasValidDeviceId = typeof credentials.deviceId === 'string' && credentials.deviceId.trim().length > 0;

    if (hasValidFirebaseToken && hasValidDeviceType && hasValidDeviceId) {
      requestBody.firebaseToken = credentials.firebaseToken;
      requestBody.deviceType = credentials.deviceType;
      requestBody.deviceId = credentials.deviceId;
      console.log("[Auth] Including Firebase fields in login request");
    } else {
      console.log("[Auth] Firebase fields missing or invalid, sending basic login");
    }

    console.log("[Auth] Final request body:", JSON.stringify(requestBody, null, 2));

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
    console.log("[Auth] accessToken value:", accessToken ? accessToken.substring(0, 20) + "..." : "undefined");
    console.log("[Auth] refreshToken value:", refreshToken ? refreshToken.substring(0, 20) + "..." : "undefined");

    // Check if we have a successful response regardless of token extraction
    const isSuccessful = response?.statusCode === 201 ||
                        response?.message === "Success" ||
                        (accessToken && refreshToken);

    if (isSuccessful) {
      console.log("[Auth] Login successful, proceeding with token storage");

      // Store tokens securely (use extracted tokens or try alternative extraction)
      const finalAccessToken = accessToken || response?.data?.accessToken || response?.accessToken;
      const finalRefreshToken = refreshToken || response?.data?.refreshToken || response?.refreshToken;
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
          user: finalUser
        }
      };
    }

    return {
      success: false,
      message: response?.message || "Login failed"
    };
  } catch (error: any) {
    console.error("[Auth] Login error:", error);
    return {
      success: false,
      message: error.message || "Login failed"
    };
  }
};

// Logout user
export const logoutUser = async (): Promise<{ success: boolean; message: string }> => {
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
      console.log("[Auth] Onboarding status reset locally (and API if available)");
    } catch (e) {
      console.warn("[Auth] Failed to reset onboarding status:", e);
    }

    console.log("[Auth] User logged out successfully");
    return {
      success: true,
      message: response?.message || "Logout successful"
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
      message: "Logged out locally"
    };
  }
};

// Get user profile
export const getUserProfile = async (): Promise<{ success: boolean; message: string; data?: User }> => {
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
    if ((response?.statusCode === 200 || response?.statusCode === 201) && userData?.id && userData?.email) {
      console.log("[Auth] ✅ HTTP success with valid user data");
      return {
        success: true,
        message: response.message || "Profile retrieved successfully",
        data: userData
      };
    }

    if (userData?.id && userData?.email) {
      console.log("[Auth] Valid user data found:", userData);
      return {
        success: true,
        message: "Profile retrieved successfully",
        data: userData
      };
    }

    // Check if response has success/message structure
    if (response?.success === true && response?.data) {
      console.log("[Auth] Success response with data:", response.data);
      return {
        success: true,
        message: response.message || "Profile retrieved successfully",
        data: response.data
      };
    }

    // Check if response has success/message structure without data wrapper
    if (response?.success === true && userData?.id) {
      console.log("[Auth] Success response with user data:", userData);
      return {
        success: true,
        message: response.message || "Profile retrieved successfully",
        data: userData
      };
    }

    console.log("[Auth] ❌ No valid condition matched, treating as error");
    console.log("[Auth] Response success:", response?.success);
    console.log("[Auth] Response statusCode:", response?.statusCode);
    console.log("[Auth] Response message:", response?.message);
    console.log("[Auth] UserData id:", userData?.id);
    console.log("[Auth] UserData email:", userData?.email);
    console.log("[Auth] Full response for debugging:", JSON.stringify(response, null, 2));

    return {
      success: false,
      message: response?.message || "Failed to get profile - invalid response structure"
    };
  } catch (error: any) {
    console.error("[Auth] Profile error:", error);
    return {
      success: false,
      message: error.message || "Failed to get profile"
    };
  }
};

// Refresh access token
export const refreshAccessToken = async (): Promise<{ success: boolean; message: string; data?: { accessToken: string; refreshToken: string } }> => {
  try {
    console.log("[Auth] Refreshing access token");

    const refreshToken = await tokenManager.getRefreshToken();
    if (!refreshToken) {
      return {
        success: false,
        message: "No refresh token available"
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
          refreshToken: response.refreshToken
        }
      };
    }

    return {
      success: false,
      message: response?.message || "Token refresh failed"
    };
  } catch (error: any) {
    console.error("[Auth] Token refresh error:", error);
    return {
      success: false,
      message: error.message || "Token refresh failed"
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
      console.log("[Auth] Token exists but no user in store, attempting to fetch user profile");
      // Try to refresh user data if we have token but no user in store
      const profileResult = await getUserProfile();
      console.log("[Auth] Profile fetch result in isAuthenticated:", profileResult);

      if (profileResult.success && profileResult.data) {
        console.log("[Auth] Setting user from profile:", profileResult.data);
        userStore.setUser(profileResult.data);
        return true;
      } else {
        console.log("[Auth] Failed to fetch profile in isAuthenticated:", profileResult.message);
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
    console.error("[Auth] Error details:", error instanceof Error ? error.message : String(error));
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

  return { ensureUserData, user: userStore.user, isLoading: userStore.isLoading };
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
import { useUIStore } from "@/store";

export const uiHelpers = {
  // Quick login with UI feedback
  loginWithUI: async (credentials: { email: string; password: string }) => {
    const { withUI } = useUIStore.getState() as any; // Type workaround
    return await withUI(
      () => loginUser(credentials),
      {
        loadingMessage: "Signing you in...",
        successMessage: "Welcome back!",
        errorTitle: "Login Failed",
      }
    );
  },

  // Quick register with UI feedback
  registerWithUI: async (userData: { name: string; email: string; password: string }) => {
    const { withUI } = useUIStore.getState() as any; // Type workaround
    return await withUI(
      () => registerUser(userData),
      {
        loadingMessage: "Creating your account...",
        successMessage: "Account created successfully!",
        errorTitle: "Registration Failed",
      }
    );
  },

  // Quick logout with UI feedback
  logoutWithUI: async () => {
    const { withUI } = useUIStore.getState() as any; // Type workaround
    return await withUI(
      () => logoutUser(),
      {
        loadingMessage: "Signing out...",
        successMessage: "Signed out successfully",
        errorTitle: "Logout Error",
      }
    );
  },
};
