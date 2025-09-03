import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";

import { fetchAPI } from "@/lib/fetch";

// JWT Token management for protected endpoints
export const jwtTokenManager = {
  // Store JWT token for API calls
  async setJwtToken(token: string) {
    try {
      await SecureStore.setItemAsync("jwt_token", token);
      console.log("JWT token stored securely");
    } catch (error) {
      console.error("Error storing JWT token:", error);
    }
  },

  // Get JWT token for API calls
  async getJwtToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync("jwt_token");
      return token;
    } catch (error) {
      console.error("Error retrieving JWT token:", error);
      return null;
    }
  },

  // Clear JWT token (logout)
  async clearJwtToken() {
    try {
      await SecureStore.deleteItemAsync("jwt_token");
      console.log("JWT token cleared");
    } catch (error) {
      console.error("Error clearing JWT token:", error);
    }
  },

  // Get headers for protected API calls
  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getJwtToken();
    if (token) {
      return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      };
    }
    return {
      "Content-Type": "application/json",
    };
  }
};

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

export const googleOAuth = async (startOAuthFlow: any) => {
  try {
    const { createdSessionId, setActive, signUp } = await startOAuthFlow({
      redirectUrl: Linking.createURL("/(root)/(tabs)/home"),
    });

    if (createdSessionId) {
      if (setActive) {
        await setActive({ session: createdSessionId });

        // Use new backend callback endpoint and initialize auth
        if (signUp.createdUserId) {
          try {
            // First try the callback endpoint
            const response = await fetchAPI("user/auth/callback", {
              method: "POST",
              headers: await jwtTokenManager.getAuthHeaders(),
              body: JSON.stringify({
                name: `${signUp.firstName || ''} ${signUp.lastName || ''}`.trim(),
                email: signUp.emailAddress,
              }),
            });

            if (response?.data?.[0]) {
              // Initialize JWT and complete auth setup
              await initializeUserAuth({
                name: `${signUp.firstName || ''} ${signUp.lastName || ''}`.trim(),
                email: signUp.emailAddress,
              });

              console.log("User authenticated via callback:", response.message);
              return {
                success: true,
                code: "success",
                message: response.message || "You have successfully signed in with Google",
                isNewUser: response.isNewUser,
                user: response.data[0]
              };
            }
          } catch (error) {
            console.error("Error in OAuth callback:", error);
            // Fallback: try to initialize auth anyway
            try {
              await initializeUserAuth({
                name: `${signUp.firstName || ''} ${signUp.lastName || ''}`.trim(),
                email: signUp.emailAddress,
              });
            } catch (initError) {
              console.error("Failed to initialize auth:", initError);
            }

            // Still return success since Clerk auth worked
            return {
              success: true,
              code: "success",
              message: "You have successfully signed in with Google",
            };
          }
        }

        return {
          success: true,
          code: "success",
          message: "You have successfully signed in with Google",
        };
      }
    }

    return {
      success: false,
      message: "An error occurred while signing in with Google",
    };
  } catch (err: any) {
    console.error("OAuth error:", err);
    return {
      success: false,
      code: err.code,
      message: err?.errors?.[0]?.longMessage || "An error occurred during Google sign-in",
    };
  }
};

// Helper function to handle user creation with new API
export const createUserWithBackend = async (userData: {
  name: string;
  email: string;
  clerkId?: string;
}) => {
  try {
    const response = await fetchAPI("user", {
      method: "POST",
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
      }),
    });

    if (response?.data?.[0]) {
      console.log("User created successfully:", response.message);
      return {
        success: true,
        user: response.data[0],
        message: response.message
      };
    }

    return {
      success: false,
      message: response?.message || "Failed to create user"
    };
  } catch (error: any) {
    console.error("Error creating user:", error);
    return {
      success: false,
      message: error.message || "Failed to create user",
      statusCode: error.statusCode
    };
  }
};

// Helper function to link existing user with Clerk
export const linkUserWithClerk = async (userData: {
  name: string;
  email: string;
}) => {
  try {
    const response = await fetchAPI("user/link-clerk", {
      method: "POST",
      headers: await jwtTokenManager.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (response?.data?.[0]) {
      console.log("User linked successfully:", response.message);
      return {
        success: true,
        user: response.data[0],
        message: response.message
      };
    }

    return {
      success: false,
      message: response?.message || "Failed to link user"
    };
  } catch (error: any) {
    console.error("Error linking user:", error);
    return {
      success: false,
      message: error.message || "Failed to link user",
      statusCode: error.statusCode
    };
  }
};

// JWT Token acquisition and management
export const setupJwtToken = async () => {
  try {
    // For development, use a test token
    // In production, this would make a call to get a JWT token from the backend
    const devToken = process.env.EXPO_PUBLIC_JWT_DEV_TOKEN || "dev-test-token";

    await jwtTokenManager.setJwtToken(devToken);
    console.log("JWT token set up for development");

    return { success: true };
  } catch (error) {
    console.error("Error setting up JWT token:", error);
    return { success: false, error };
  }
};

// Function to initialize authentication after successful Clerk login
export const initializeUserAuth = async (userData?: { email: string; name?: string }) => {
  try {
    // Set up JWT token
    await setupJwtToken();

    // If user data is provided, ensure backend linkage
    if (userData?.email) {
      const linkResult = await linkUserWithClerk({
        name: userData.name || "",
        email: userData.email,
      });

      if (!linkResult.success && linkResult.statusCode !== 409) {
        console.warn("Backend linkage failed:", linkResult.message);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error initializing user auth:", error);
    return { success: false, error };
  }
};
