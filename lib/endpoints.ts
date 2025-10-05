import { config } from "./config";

/**
 * Endpoint Types and Structures
 * Centralized endpoint management for the Uber Clone application
 */

// Base endpoint interface
export interface BaseEndpoint {
  url: string;
  timeout?: number;
  retries?: number;
  enabled: boolean;
}

// API Endpoint types
export interface APIEndpoint extends BaseEndpoint {
  type: "api";
  basePath?: string;
  version?: string;
  requiresAuth?: boolean;
}

export interface WebSocketEndpoint extends BaseEndpoint {
  type: "websocket";
  protocols?: string[];
  heartbeat?: number; // in milliseconds
  reconnectDelay?: number;
}

export interface CDNEndpoint extends BaseEndpoint {
  type: "cdn";
  regions?: string[];
}

export interface ThirdPartyEndpoint extends BaseEndpoint {
  type: "third-party";
  provider: string;
  apiKey?: string;
}

// Union type for all endpoint types
export type Endpoint =
  | APIEndpoint
  | WebSocketEndpoint
  | CDNEndpoint
  | ThirdPartyEndpoint;

// Environment-specific endpoint configurations
export interface EnvironmentEndpoints {
  development: Record<string, Endpoint>;
  staging: Record<string, Endpoint>;
  production: Record<string, Endpoint>;
}

// Main endpoints registry
export const ENDPOINTS: EnvironmentEndpoints = {
  development: {
    // Core API endpoints
    api: {
      type: "api",
      url: config.apiUrl,
      timeout: 30000,
      retries: 3,
      enabled: true,
      requiresAuth: false,
      version: "v1",
    } as APIEndpoint,

    // WebSocket for real-time features
    websocket: {
      type: "websocket",
      url: config.wsUrl,
      timeout: 30000,
      retries: 5,
      enabled: true,
      heartbeat: 30000,
      reconnectDelay: 1000,
    } as WebSocketEndpoint,

    // Google Maps APIs
    googleMapsPlaces: {
      type: "third-party",
      provider: "google-maps",
      url: "https://maps.googleapis.com/maps/api/place",
      timeout: 10000,
      retries: 2,
      enabled: true,
      apiKey: config.googleMaps.placesApiKey,
    } as ThirdPartyEndpoint,

    googleMapsDirections: {
      type: "third-party",
      provider: "google-maps",
      url: "https://maps.googleapis.com/maps/api/directions",
      timeout: 15000,
      retries: 2,
      enabled: true,
      apiKey: config.googleMaps.directionsApiKey,
    } as ThirdPartyEndpoint,

    // Stripe payment processing
    stripe: {
      type: "third-party",
      provider: "stripe",
      url: "https://api.stripe.com/v1",
      timeout: 30000,
      retries: 2,
      enabled: true,
      apiKey: config.stripe.publishableKey,
    } as ThirdPartyEndpoint,

    // Geoapify (alternative geocoding)
    geoapify: {
      type: "third-party",
      provider: "geoapify",
      url: "https://api.geoapify.com/v1",
      timeout: 10000,
      retries: 2,
      enabled: !!config.geoapify.apiKey,
      apiKey: config.geoapify.apiKey,
    } as ThirdPartyEndpoint,
  },

  staging: {
    // Staging environment endpoints - same structure but different URLs
    api: {
      type: "api",
      url: "https://api-staging.uber-clone.com",
      timeout: 30000,
      retries: 3,
      enabled: true,
      requiresAuth: false,
      version: "v1",
    } as APIEndpoint,

    websocket: {
      type: "websocket",
      url: "wss://ws-staging.uber-clone.com",
      timeout: 30000,
      retries: 5,
      enabled: true,
      heartbeat: 30000,
      reconnectDelay: 1000,
    } as WebSocketEndpoint,

    googleMapsPlaces: {
      type: "third-party",
      provider: "google-maps",
      url: "https://maps.googleapis.com/maps/api/place",
      timeout: 10000,
      retries: 2,
      enabled: true,
      apiKey:
        process.env.EXPO_PUBLIC_PLACES_API_KEY_STAGING ||
        config.googleMaps.placesApiKey,
    } as ThirdPartyEndpoint,

    googleMapsDirections: {
      type: "third-party",
      provider: "google-maps",
      url: "https://maps.googleapis.com/maps/api/directions",
      timeout: 15000,
      retries: 2,
      enabled: true,
      apiKey:
        process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY_STAGING ||
        config.googleMaps.directionsApiKey,
    } as ThirdPartyEndpoint,

    stripe: {
      type: "third-party",
      provider: "stripe",
      url: "https://api.stripe.com/v1",
      timeout: 30000,
      retries: 2,
      enabled: true,
      apiKey:
        process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY_STAGING ||
        config.stripe.publishableKey,
    } as ThirdPartyEndpoint,

    geoapify: {
      type: "third-party",
      provider: "geoapify",
      url: "https://api.geoapify.com/v1",
      timeout: 10000,
      retries: 2,
      enabled: !!config.geoapify.apiKey,
      apiKey: config.geoapify.apiKey,
    } as ThirdPartyEndpoint,
  },

  production: {
    // Production environment endpoints
    api: {
      type: "api",
      url: "https://api.uber-clone.com",
      timeout: 30000,
      retries: 3,
      enabled: true,
      requiresAuth: false,
      version: "v1",
    } as APIEndpoint,

    websocket: {
      type: "websocket",
      url: "wss://ws.uber-clone.com",
      timeout: 30000,
      retries: 5,
      enabled: true,
      heartbeat: 30000,
      reconnectDelay: 2000,
    } as WebSocketEndpoint,

    googleMapsPlaces: {
      type: "third-party",
      provider: "google-maps",
      url: "https://maps.googleapis.com/maps/api/place",
      timeout: 10000,
      retries: 2,
      enabled: true,
      apiKey:
        process.env.EXPO_PUBLIC_PLACES_API_KEY_PROD ||
        config.googleMaps.placesApiKey,
    } as ThirdPartyEndpoint,

    googleMapsDirections: {
      type: "third-party",
      provider: "google-maps",
      url: "https://maps.googleapis.com/maps/api/directions",
      timeout: 15000,
      retries: 2,
      enabled: true,
      apiKey:
        process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY_PROD ||
        config.googleMaps.directionsApiKey,
    } as ThirdPartyEndpoint,

    stripe: {
      type: "third-party",
      provider: "stripe",
      url: "https://api.stripe.com/v1",
      timeout: 30000,
      retries: 2,
      enabled: true,
      apiKey:
        process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY_PROD ||
        config.stripe.publishableKey,
    } as ThirdPartyEndpoint,

    geoapify: {
      type: "third-party",
      provider: "geoapify",
      url: "https://api.geoapify.com/v1",
      timeout: 10000,
      retries: 2,
      enabled: !!config.geoapify.apiKey,
      apiKey: config.geoapify.apiKey,
    } as ThirdPartyEndpoint,
  },
};

/**
 * Get endpoint configuration for current environment
 */
export function getEndpoint(name: string): Endpoint | null {
  const env = config.environment;
  const endpoints = ENDPOINTS[env];

  if (!endpoints || !endpoints[name]) {
    
    return null;
  }

  return endpoints[name];
}

/**
 * Get all endpoints for current environment
 */
export function getAllEndpoints(): Record<string, Endpoint> {
  const env = config.environment;
  return ENDPOINTS[env] || {};
}

/**
 * Check if an endpoint is available/enabled
 */
export function isEndpointEnabled(name: string): boolean {
  const endpoint = getEndpoint(name);
  return endpoint ? endpoint.enabled : false;
}

/**
 * Get API base URL for current environment
 */
export function getApiBaseUrl(): string {
  // Use EXPO_PUBLIC_SERVER_URL directly as the main API URL
  return config.apiUrl;
}

/**
 * Get WebSocket URL for current environment
 */
export function getWebSocketUrl(): string {
  // Use EXPO_PUBLIC_WS_URL directly as the WebSocket URL
  return config.wsUrl;
}

/**
 * Build full API URL with path
 */
export function buildApiUrl(path: string, version?: string): string {
  const baseUrl = getApiBaseUrl();

  // Remove leading slash from path if present
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;

  // For backward compatibility, use the same format as the original fetch.ts
  // Original: `${API_BASE_URL}/${endpoint}` where API_BASE_URL = `${serverUrl}/api`
  return `${baseUrl}/api/${cleanPath}`;
}

/**
 * Build third-party API URL with authentication
 */
export function buildThirdPartyUrl(
  provider: string,
  path: string,
  params?: Record<string, string>,
): string {
  const endpoint = getEndpoint(provider) as ThirdPartyEndpoint;

  if (!endpoint || !endpoint.enabled) {
    throw new Error(`Third-party endpoint '${provider}' is not available`);
  }

  let url = `${endpoint.url}${path}`;

  // Add API key if required
  if (endpoint.apiKey && params) {
    const urlObj = new URL(url);
    urlObj.searchParams.set("key", endpoint.apiKey);

    // Add additional parameters
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value);
    });

    url = urlObj.toString();
  } else if (endpoint.apiKey) {
    const separator = url.includes("?") ? "&" : "?";
    url += `${separator}key=${endpoint.apiKey}`;
  }

  return url;
}

// Health check results
export interface HealthCheckResult {
  endpoint: string;
  available: boolean;
  responseTime?: number;
  error?: string;
  timestamp: Date;
}

// Connectivity validation functions
export async function checkEndpointConnectivity(
  endpointName: string,
): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const endpoint = getEndpoint(endpointName);

  if (!endpoint) {
    return {
      endpoint: endpointName,
      available: false,
      error: `Endpoint '${endpointName}' not configured`,
      timestamp: new Date(),
    };
  }

  if (!endpoint.enabled) {
    return {
      endpoint: endpointName,
      available: false,
      error: `Endpoint '${endpointName}' is disabled`,
      timestamp: new Date(),
    };
  }

  try {
    switch (endpoint.type) {
      case "api":
        return await checkApiEndpoint(endpoint as APIEndpoint, startTime);
      case "websocket":
        return await checkWebSocketEndpoint(
          endpoint as WebSocketEndpoint,
          startTime,
        );
      case "third-party":
        return await checkThirdPartyEndpoint(
          endpoint as ThirdPartyEndpoint,
          startTime,
        );
      default:
        return {
          endpoint: endpointName,
          available: false,
          error: `Unknown endpoint type: ${endpoint.type}`,
          timestamp: new Date(),
          responseTime: Date.now() - startTime,
        };
    }
  } catch (error) {
    return {
      endpoint: endpointName,
      available: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
      responseTime: Date.now() - startTime,
    };
  }
}

async function checkApiEndpoint(
  endpoint: APIEndpoint,
  startTime: number,
): Promise<HealthCheckResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      endpoint.timeout || 5000,
    );

    const response = await fetch(`${endpoint.url}/health`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        endpoint: "api",
        available: true,
        responseTime,
        timestamp: new Date(),
      };
    } else {
      return {
        endpoint: "api",
        available: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        responseTime,
        timestamp: new Date(),
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      endpoint: "api",
      available: false,
      error: error instanceof Error ? error.message : "Network error",
      responseTime,
      timestamp: new Date(),
    };
  }
}

async function checkWebSocketEndpoint(
  endpoint: WebSocketEndpoint,
  startTime: number,
): Promise<HealthCheckResult> {
  return new Promise(async (resolve) => {
    try {
      // Use Socket.IO for WebSocket health check instead of native WebSocket
      // This matches the actual client implementation
      const { io } = await import("socket.io-client");

      const socket = io(endpoint.url.replace("/uber-realtime", ""), {
        transports: ["websocket"],
        timeout: endpoint.timeout || 5000,
        forceNew: true,
      });

      const timeout = setTimeout(() => {
        socket.disconnect();
        resolve({
          endpoint: "websocket",
          available: false,
          error: "Connection timeout",
          responseTime: Date.now() - startTime,
          timestamp: new Date(),
        });
      }, endpoint.timeout || 5000);

      socket.on("connect", () => {
        clearTimeout(timeout);
        socket.disconnect();
        resolve({
          endpoint: "websocket",
          available: true,
          responseTime: Date.now() - startTime,
          timestamp: new Date(),
        });
      });

      socket.on("connect_error", (error) => {
        clearTimeout(timeout);
        socket.disconnect();
        resolve({
          endpoint: "websocket",
          available: false,
          error: `Socket.IO connection failed: ${error.message}`,
          responseTime: Date.now() - startTime,
          timestamp: new Date(),
        });
      });
    } catch (error) {
      resolve({
        endpoint: "websocket",
        available: false,
        error:
          error instanceof Error
            ? error.message
            : "Socket.IO initialization failed",
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
      });
    }
  });
}

async function checkThirdPartyEndpoint(
  endpoint: ThirdPartyEndpoint,
  startTime: number,
): Promise<HealthCheckResult> {
  try {
    // For third-party endpoints, we'll do a simple connectivity check
    // This is a basic implementation - in production you might want more sophisticated checks
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      endpoint.timeout || 5000,
    );

    // Try to reach the base URL
    const response = await fetch(endpoint.url, {
      method: "HEAD", // Use HEAD to avoid downloading content
      signal: controller.signal,
      headers: endpoint.apiKey
        ? { Authorization: `Bearer ${endpoint.apiKey}` }
        : undefined,
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (response.ok || response.status === 401 || response.status === 403) {
      // 401/403 might indicate API key issues but the endpoint is reachable
      return {
        endpoint: endpoint.provider,
        available: true,
        responseTime,
        timestamp: new Date(),
      };
    } else {
      return {
        endpoint: endpoint.provider,
        available: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        responseTime,
        timestamp: new Date(),
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      endpoint: endpoint.provider,
      available: false,
      error:
        error instanceof Error
          ? error.message
          : "Third-party service unreachable",
      responseTime,
      timestamp: new Date(),
    };
  }
}

/**
 * Check connectivity for all critical endpoints
 */
export async function checkAllEndpoints(): Promise<HealthCheckResult[]> {
  const criticalEndpoints = ["api", "websocket"];
  const results: HealthCheckResult[] = [];

  for (const endpointName of criticalEndpoints) {
    const result = await checkEndpointConnectivity(endpointName);
    results.push(result);
  }

  return results;
}

/**
 * Check if all critical endpoints are available
 */
export async function areAllEndpointsAvailable(): Promise<boolean> {
  const results = await checkAllEndpoints();
  return results.every((result) => result.available);
}

// Export specific endpoint getters for convenience
export const endpoints = {
  api: {
    baseUrl: getApiBaseUrl,
    buildUrl: buildApiUrl,
    endpoint: () => getEndpoint("api") as APIEndpoint,
  },
  websocket: {
    url: getWebSocketUrl,
    namespace: "/uber-realtime", // ✅ Separar namespace
    fullUrl: () => `${getWebSocketUrl()}/uber-realtime`, // ✅ URL completa con namespace
    endpoint: () => getEndpoint("websocket") as WebSocketEndpoint,
  },
  googleMaps: {
    apiKey: {
      places: () => config.googleMaps.placesApiKey,
      directions: () => config.googleMaps.directionsApiKey,
    },
    places: (path: string, params?: Record<string, string>) =>
      buildThirdPartyUrl("googleMapsPlaces", path, params),
    directions: (path: string, params?: Record<string, string>) =>
      buildThirdPartyUrl("googleMapsDirections", path, params),
  },
  stripe: {
    apiKey: () => config.stripe.publishableKey,
    url: (path: string, params?: Record<string, string>) =>
      buildThirdPartyUrl("stripe", path, params),
  },
  geoapify: {
    apiKey: () => config.geoapify.apiKey,
    url: (path: string, params?: Record<string, string>) =>
      buildThirdPartyUrl("geoapify", path, params),
  },
};
