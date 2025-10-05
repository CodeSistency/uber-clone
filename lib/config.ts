// import { z } from 'zod'; // Temporarily commented out due to missing dependency

// Environment validation schema - temporarily commented out due to missing zod dependency
// const envSchema = z.object({ ... });

// Type for validated environment - temporarily simplified
export type EnvironmentConfig = {
  EXPO_PUBLIC_SERVER_URL?: string;
  EXPO_PUBLIC_WS_URL?: string;
  EXPO_PUBLIC_PLACES_API_KEY?: string;
  EXPO_PUBLIC_DIRECTIONS_API_KEY?: string;
  EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  EXPO_PUBLIC_FIREBASE_API_KEY?: string;
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
  EXPO_PUBLIC_FIREBASE_PROJECT_ID?: string;
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?: string;
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string;
  EXPO_PUBLIC_FIREBASE_APP_ID?: string;
  EXPO_PUBLIC_GEOAPIFY_API_KEY?: string;
  DATABASE_URL?: string;
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  NODE_ENV?: string;
};

// Default values for development
const defaultConfig: Partial<EnvironmentConfig> = {
  EXPO_PUBLIC_SERVER_URL: "http://localhost:3000",
  EXPO_PUBLIC_WS_URL: "ws://localhost:3000",
  NODE_ENV: "development",
};

// Critical environment variables that must be present
const criticalEnvVars = [
  "EXPO_PUBLIC_PLACES_API_KEY",
  "EXPO_PUBLIC_DIRECTIONS_API_KEY",
  "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  // Firebase variables are now optional for basic functionality
  // 'EXPO_PUBLIC_FIREBASE_API_KEY',
  // 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  // 'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  // 'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  // 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  // 'EXPO_PUBLIC_FIREBASE_APP_ID',
];

/**
 * Validates and loads environment configuration
 * Throws an error if critical environment variables are missing
 * Note: Zod validation temporarily commented out due to missing dependency
 */
export function validateEnvironment(): EnvironmentConfig {
  

  try {
    // Load environment variables
    const envVars = {
      EXPO_PUBLIC_SERVER_URL: process.env.EXPO_PUBLIC_SERVER_URL,
      EXPO_PUBLIC_WS_URL: process.env.EXPO_PUBLIC_WS_URL,
      EXPO_PUBLIC_PLACES_API_KEY: process.env.EXPO_PUBLIC_PLACES_API_KEY,
      EXPO_PUBLIC_DIRECTIONS_API_KEY:
        process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY,
      EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY:
        process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN:
        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      EXPO_PUBLIC_FIREBASE_PROJECT_ID:
        process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET:
        process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
        process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      EXPO_PUBLIC_GEOAPIFY_API_KEY: process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY,
      DATABASE_URL: process.env.DATABASE_URL,
      EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:
        process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      NODE_ENV: process.env.NODE_ENV,
    };

    

    // Check critical variables are present (not just default values)
    const missingCriticalVars = criticalEnvVars.filter((key) => {
      const value = (envVars as any)[key];
      return !value || value.trim() === "";
    });

    if (missingCriticalVars.length > 0) {
      const errorMsg =
        `[Config] ❌ Critical environment variables missing: ${missingCriticalVars.join(", ")}\n` +
        `Please check your .env file and ensure all required variables are set.`;
      
      throw new Error(errorMsg);
    }

    return envVars as EnvironmentConfig;
  } catch (error) {
    
    throw error;
  }
}

// Global configuration instance
let globalConfig: EnvironmentConfig | null = null;

/**
 * Get validated configuration (singleton pattern)
 * This ensures configuration is only validated once
 */
export function getConfig(): EnvironmentConfig {
  if (!globalConfig) {
    globalConfig = validateEnvironment();
  }
  return globalConfig;
}

/**
 * Reset configuration (useful for testing)
 */
export function resetConfig(): void {
  globalConfig = null;
}

// Export specific configuration getters for convenience
export const config = {
  get apiUrl(): string {
    return getConfig().EXPO_PUBLIC_SERVER_URL || "http://localhost:3000";
  },

  get wsUrl(): string {
    return getConfig().EXPO_PUBLIC_WS_URL || "ws://localhost:3000";
  },

  get googleMaps(): {
    placesApiKey: string;
    directionsApiKey: string;
  } {
    const config = getConfig();
    return {
      placesApiKey: config.EXPO_PUBLIC_PLACES_API_KEY || "",
      directionsApiKey: config.EXPO_PUBLIC_DIRECTIONS_API_KEY || "",
    };
  },

  get stripe(): {
    publishableKey: string;
    secretKey?: string;
  } {
    const config = getConfig();
    return {
      publishableKey: config.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      secretKey: config.STRIPE_SECRET_KEY,
    };
  },

  get firebase(): {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  } {
    const config = getConfig();
    return {
      apiKey: config.EXPO_PUBLIC_FIREBASE_API_KEY || "",
      authDomain: config.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
      projectId: config.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
      storageBucket: config.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: config.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: config.EXPO_PUBLIC_FIREBASE_APP_ID || "",
    };
  },

  get geoapify(): {
    apiKey?: string;
  } {
    return {
      apiKey: getConfig().EXPO_PUBLIC_GEOAPIFY_API_KEY,
    };
  },

  get database(): {
    url?: string;
  } {
    return {
      url: getConfig().DATABASE_URL,
    };
  },

  get clerk(): {
    publishableKey?: string;
  } {
    return {
      publishableKey: getConfig().EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    };
  },

  get environment(): "development" | "staging" | "production" {
    return (
      (getConfig().NODE_ENV as "development" | "staging" | "production") ||
      "development"
    );
  },

  get isDevelopment(): boolean {
    return getConfig().NODE_ENV === "development";
  },

  get isProduction(): boolean {
    return getConfig().NODE_ENV === "production";
  },

  get isStaging(): boolean {
    return getConfig().NODE_ENV === "staging";
  },
};

// Export for easy importing
export default config;
