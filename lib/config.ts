import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  // API Configuration
  EXPO_PUBLIC_SERVER_URL: z.string().url().default('http://localhost:3000'),
  EXPO_PUBLIC_WS_URL: z.string().url().default('ws://localhost:3000'),

  // Google Maps APIs
  EXPO_PUBLIC_PLACES_API_KEY: z.string().min(1, 'Google Places API key is required'),
  EXPO_PUBLIC_DIRECTIONS_API_KEY: z.string().min(1, 'Google Directions API key is required'),

  // Stripe Configuration
  EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1, 'Stripe publishable key is required'),
  STRIPE_SECRET_KEY: z.string().min(1, 'Stripe secret key is required').optional(), // Only needed on backend

  // Firebase Configuration
  EXPO_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'Firebase API key is required'),
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase auth domain is required'),
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase project ID is required'),
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'Firebase storage bucket is required'),
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'Firebase messaging sender ID is required'),
  EXPO_PUBLIC_FIREBASE_APP_ID: z.string().min(1, 'Firebase app ID is required'),

  // Geoapify (optional)
  EXPO_PUBLIC_GEOAPIFY_API_KEY: z.string().optional(),

  // Database URL (for Neon/PostgreSQL)
  DATABASE_URL: z.string().url().optional(), // Only needed when connecting to database

  // Clerk Authentication (legacy - being phased out)
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),

  // Environment
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
});

// Type for validated environment
export type EnvironmentConfig = z.infer<typeof envSchema>;

// Default values for development
const defaultConfig: Partial<EnvironmentConfig> = {
  EXPO_PUBLIC_SERVER_URL: 'http://localhost:3000',
  EXPO_PUBLIC_WS_URL: 'ws://localhost:3000',
  NODE_ENV: 'development',
};

// Critical environment variables that must be present
const criticalEnvVars = [
  'EXPO_PUBLIC_PLACES_API_KEY',
  'EXPO_PUBLIC_DIRECTIONS_API_KEY',
  'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

/**
 * Validates and loads environment configuration
 * Throws an error if critical environment variables are missing
 */
export function validateEnvironment(): EnvironmentConfig {
  console.log('[Config] Validating environment configuration...');

  try {
    // Load environment variables
    const envVars = {
      EXPO_PUBLIC_SERVER_URL: process.env.EXPO_PUBLIC_SERVER_URL,
      EXPO_PUBLIC_WS_URL: process.env.EXPO_PUBLIC_WS_URL,
      EXPO_PUBLIC_PLACES_API_KEY: process.env.EXPO_PUBLIC_PLACES_API_KEY,
      EXPO_PUBLIC_DIRECTIONS_API_KEY: process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY,
      EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      EXPO_PUBLIC_GEOAPIFY_API_KEY: process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY,
      DATABASE_URL: process.env.DATABASE_URL,
      EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      NODE_ENV: process.env.NODE_ENV,
    };

    // Validate with zod schema
    const validatedConfig = envSchema.parse(envVars);

    console.log('[Config] ✅ Environment configuration validated successfully');

    // Check critical variables are present (not just default values)
    const missingCriticalVars = criticalEnvVars.filter(key => {
      const value = (envVars as any)[key];
      return !value || value.trim() === '';
    });

    if (missingCriticalVars.length > 0) {
      const errorMsg = `[Config] ❌ Critical environment variables missing: ${missingCriticalVars.join(', ')}\n` +
                      `Please check your .env file and ensure all required variables are set.`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    return validatedConfig;

  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
      console.error('[Config] ❌ Environment validation failed:', errorMessages.join('\n'));
      throw new Error(`Environment validation failed:\n${errorMessages.join('\n')}`);
    }

    console.error('[Config] ❌ Environment configuration error:', error);
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
    return getConfig().EXPO_PUBLIC_SERVER_URL;
  },

  get wsUrl(): string {
    return getConfig().EXPO_PUBLIC_WS_URL;
  },

  get googleMaps(): {
    placesApiKey: string;
    directionsApiKey: string;
  } {
    const config = getConfig();
    return {
      placesApiKey: config.EXPO_PUBLIC_PLACES_API_KEY,
      directionsApiKey: config.EXPO_PUBLIC_DIRECTIONS_API_KEY,
    };
  },

  get stripe(): {
    publishableKey: string;
    secretKey?: string;
  } {
    const config = getConfig();
    return {
      publishableKey: config.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
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
      apiKey: config.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: config.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: config.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: config.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: config.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: config.EXPO_PUBLIC_FIREBASE_APP_ID,
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

  get environment(): 'development' | 'staging' | 'production' {
    return getConfig().NODE_ENV;
  },

  get isDevelopment(): boolean {
    return getConfig().NODE_ENV === 'development';
  },

  get isProduction(): boolean {
    return getConfig().NODE_ENV === 'production';
  },

  get isStaging(): boolean {
    return getConfig().NODE_ENV === 'staging';
  },
};

// Export for easy importing
export default config;
