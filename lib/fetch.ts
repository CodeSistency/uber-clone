/**
 * Advanced Fetch API with Offline Queue Support
 *
 * This module provides intelligent HTTP request handling with:
 * - Automatic offline queue management for supported operations
 * - Selective offline capability based on endpoint type
 * - Intelligent retry strategies with exponential backoff
 * - Authentication token refresh handling
 *
 * OFFLINE CAPABILITY CONFIGURATION:
 * - ALWAYS_ONLINE_ENDPOINTS: Operations that require immediate network connectivity
 *   (auth, registration, password reset, profile updates)
 * - OFFLINE_CAPABLE_ENDPOINTS: Operations that can be queued for later processing
 *   (ride operations, location updates, messages during active rides)
 *
 * Use OfflineConfig utility to manage offline capabilities:
 * ```typescript
 * import { OfflineConfig } from '@/lib/fetch';
 *
 * // Check if endpoint can work offline
 * if (OfflineConfig.canWorkOffline('/ride/create')) {
 *   // Safe to queue
 * }
 *
 * // Add new offline-capable endpoint
 * OfflineConfig.addOfflineCapableEndpoint('/new/endpoint');
 * ```
 */

import { router } from "expo-router";
import { useState, useEffect, useCallback } from "react";

import { connectivityManager } from "@/lib/connectivity";
import { maybeMockResponse, simulateLatency, maybeFail } from "@/lib/dev";
import { endpoints } from "@/lib/endpoints";

// Advanced retry system
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableStatusCodes: number[];
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

interface QueuedRequest {
  id: string;
  url: string;
  options: RequestInit;
  retryCount: number;
  timestamp: number;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

// Request queue for intelligent retries
const requestQueue: QueuedRequest[] = [];
let isProcessingQueue = false;

// Track if we're currently refreshing token to avoid multiple refresh attempts
let isRefreshingToken = false;
let refreshPromise: Promise<any> | null = null;

// Intelligent retry utilities
function calculateRetryDelay(
  retryCount: number,
  config: RetryConfig = defaultRetryConfig,
): number {
  const delay = config.baseDelay * Math.pow(config.backoffFactor, retryCount);
  return Math.min(delay, config.maxDelay);
}

function shouldRetry(
  error: any,
  retryCount: number,
  config: RetryConfig = defaultRetryConfig,
): boolean {
  if (retryCount >= config.maxRetries) {
    return false;
  }

  // Retry on network errors
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    return true;
  }

  // Retry on specific HTTP status codes
  if (
    error.statusCode &&
    config.retryableStatusCodes.includes(error.statusCode)
  ) {
    return true;
  }

  // Retry on token expiration (401) if we can refresh
  if (error.statusCode === 401) {
    return true;
  }

  return false;
}

async function processRequestQueue(): Promise<void> {
  if (isProcessingQueue || requestQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const queuedRequest = requestQueue.shift();
    if (!queuedRequest) continue;

    try {
      

      // Calculate delay based on retry count
      if (queuedRequest.retryCount > 0) {
        const delay = calculateRetryDelay(queuedRequest.retryCount - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      // Execute the request
      const response = await makeRequest(
        queuedRequest.url,
        queuedRequest.options,
      );
      queuedRequest.resolve(response);
    } catch (error) {
      

      // Check if we should retry (but never retry auth endpoints)
      const isAuthEndpoint = ALWAYS_ONLINE_ENDPOINTS.some((pattern) =>
        queuedRequest.url.includes(pattern),
      );

      if (shouldRetry(error, queuedRequest.retryCount) && !isAuthEndpoint) {
        

        // Re-queue with incremented retry count
        const retryRequest: QueuedRequest = {
          ...queuedRequest,
          retryCount: queuedRequest.retryCount + 1,
          timestamp: Date.now(),
        };

        // Add back to front of queue for immediate retry
        requestQueue.unshift(retryRequest);

        // Add delay before next attempt
        const delay = calculateRetryDelay(retryRequest.retryCount - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));

        continue; // Don't reject yet, try again
      }

      // Max retries reached or non-retryable error
      queuedRequest.reject(error);
    }
  }

  isProcessingQueue = false;
}

function queueRequest(url: string, options: RequestInit): Promise<any> {
  return new Promise((resolve, reject) => {
    const queuedRequest: QueuedRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url,
      options,
      retryCount: 0,
      timestamp: Date.now(),
      resolve,
      reject,
    };

    requestQueue.push(queuedRequest);
    

    // Start processing queue
    processRequestQueue();
  });
}

// Core request function (extracted for reuse)
async function makeRequest(url: string, options: RequestInit): Promise<any> {
  const startMs = Date.now();

  // Dev mock path (only for relative endpoints)
  if (!url.startsWith("http")) {
    const mock = await maybeMockResponse(
      (options?.method || "GET").toUpperCase(),
      url,
      options?.body,
    );
    if (mock) {
      return mock;
    }
  }

  // Add authentication headers if required
  let headers = { ...options?.headers };
  if ((options as any)?.requiresAuth) {
    // Lazy import to avoid circular dependency
    const { tokenManager } = require("./auth");
    const authHeaders = await tokenManager.getAuthHeaders();
    headers = { ...headers, ...authHeaders };
  }

  const requestOptions = {
    ...options,
    headers,
  };

  
            } catch {
              return options.body;
            }
          })()
        : options?.body,
  });

  try {
    await simulateLatency();
    maybeFail();
    const response = await fetch(url, requestOptions);
    

    let body: any = null;
    try {
      const textResponse = await response.text();
      if (textResponse) {
        body = JSON.parse(textResponse);
      }
    } catch (parseError) {
      
      body = { message: "Non-JSON response received" };
    }

    

    // Handle new backend response structure
    if (!response.ok) {
      // Handle token expiration (401) - try to refresh token automatically
      if (response.status === 401 && (options as any)?.requiresAuth) {
        

        try {
          // Prevent multiple simultaneous refresh attempts
          if (isRefreshingToken) {
            
            if (refreshPromise) {
              await refreshPromise;
            }
          } else {
            isRefreshingToken = true;

            // Lazy import to avoid circular dependency
            const { tokenManager } = require("./auth");

            // Attempt to refresh token
            const refreshToken = await tokenManager.getRefreshToken();
            if (!refreshToken) {
              
              throw new Error("No refresh token available");
            }

            refreshPromise = fetch(endpoints.api.buildUrl("auth/refresh"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${refreshToken}`,
              },
              body: JSON.stringify({ refreshToken }),
            });

            const refreshResponse = await refreshPromise;
            const refreshData = await refreshResponse.json();

            if (
              refreshResponse.ok &&
              refreshData?.accessToken &&
              refreshData?.refreshToken
            ) {
              

              // Store new tokens
              await tokenManager.setAccessToken(refreshData.accessToken);
              await tokenManager.setRefreshToken(refreshData.refreshToken);

              // Retry the original request with new token
              
              const newHeaders = { ...headers };
              if ((options as any)?.requiresAuth) {
                const authHeaders = await tokenManager.getAuthHeaders();
                Object.assign(newHeaders, authHeaders);
              }

              const retryResponse = await fetch(url, {
                ...options,
                headers: newHeaders,
              });

              const retryBody = await retryResponse.text();
              let retryData: any = null;
              try {
                retryData = JSON.parse(retryBody);
              } catch {
                retryData = { message: "Non-JSON response received" };
              }

              

              if (retryResponse.ok) {
                
                return retryData;
              } else {
                throw new Error(
                  retryData?.message ||
                    `HTTP error! status: ${retryResponse.status}`,
                );
              }
            } else {
              
              throw new Error("Token refresh failed");
            }
          }
        } catch (refreshError) {
          

          // Clear tokens and redirect to login
          try {
            const { tokenManager } = require("./auth");
            await tokenManager.clearTokens();

            // Clear user store
            const userStore = require("@/store").useUserStore.getState();
            userStore.clearUser();

            // Redirect to login
            
            router.replace("/(auth)/sign-in");
          } catch (cleanupError) {
            
          }

          throw new Error("Authentication expired. Please log in again.");
        } finally {
          isRefreshingToken = false;
          refreshPromise = null;
        }
      }

      const errorMessage =
        body?.message ||
        (Array.isArray(body?.message) ? body.message.join(", ") : null) ||
        `HTTP error! status: ${response.status}`;

      const error = new Error(errorMessage);
      (error as any).statusCode = response.status;
      (error as any).response = body;
      throw error;
    }

    return body;
  } catch (error) {
    

    // Enhance error with backend-specific information
    if (error instanceof Error) {
      const enhancedError = error as any;
      enhancedError.endpoint = url;
      enhancedError.fullUrl = url;
    }

    throw error;
  } finally {
    
  }
}

export const fetchAPI = async (
  endpoint: string,
  options?: RequestInit & {
    requiresAuth?: boolean;
    skipApiPrefix?: boolean;
    skipAuth?: boolean;
    useRetryQueue?: boolean;
    params?: Record<string, string>;
  },
) => {
  // Build full URL using centralized endpoint system
  let fullUrl: string;
  if (endpoint.startsWith("http")) {
    // External URL, use as-is
    fullUrl = endpoint;
  } else if (options?.skipApiPrefix) {
    // Skip API prefix, build from server URL directly
    const serverUrl = endpoints.api.baseUrl();
    fullUrl = `${serverUrl}/${endpoint}`;
  } else {
    // Use API endpoint with version
    fullUrl = endpoints.api.buildUrl(endpoint);
  }

  // Add query parameters if provided
  if (options?.params && Object.keys(options.params).length > 0) {
    const url = new URL(fullUrl);
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    fullUrl = url.toString();
  }

  // Lazy import offline queue to avoid circular dependencies
  const { offlineQueue } = await import("./offline/OfflineQueue");

  // Check if we should attempt network operation
  const shouldAttemptNetwork =
    connectivityManager.shouldAttemptNetworkOperation();

  // If no network, check if this operation can work offline
  if (!shouldAttemptNetwork && !options?.useRetryQueue) {
    const method = (options?.method || "GET").toUpperCase();

    // Check if this endpoint is allowed to work offline
    if (canWorkOffline(endpoint, method)) {
      

      // Queue request with appropriate priority
      const priority = determineRequestPriority(endpoint, options);
      return offlineQueue.add({
        endpoint: fullUrl,
        method: (options?.method as any) || "GET",
        data: options?.body ? JSON.parse(options.body as string) : undefined,
        headers: options?.headers as any,
        priority,
        requiresAuth: options?.requiresAuth,
      });
    } else {
      // This operation requires network connectivity
      

      throw new Error(
        "Esta operación requiere conexión a internet. Por favor, verifica tu conexión e intenta nuevamente.",
      );
    }
  }

  // Use intelligent retry queue only for specific endpoints (like messages)
  // Check if this endpoint should use the retry queue
  const shouldUseQueue =
    options?.useRetryQueue ||
    (shouldAttemptNetwork &&
      canWorkOffline(endpoint, (options?.method || "GET").toUpperCase()));

  if (shouldUseQueue) {
    return queueRequest(fullUrl, options || {});
  }

  // Use direct request (existing behavior)
  return makeRequest(fullUrl, options || {});
};

// Configuration for offline-capable endpoints
const OFFLINE_CAPABLE_ENDPOINTS = [
  // Rides operations
  "/ride/create",
  "/ride/update",
  "/ride/cancel",
  // Location updates (critical for active rides)
  "/location/update",
  // Messages during active rides
  "/message/send",
  // Status updates
  "/status/update",
  // Emergency operations
  "/emergency",
];

// Endpoints that should NEVER work offline
const ALWAYS_ONLINE_ENDPOINTS = [
  "/auth/register",
  "/auth/login",
  "/auth/refresh",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/user/profile", // Profile updates might need server validation
];

// Utility functions for managing offline capabilities
export const OfflineConfig = {
  // Check if endpoint can work offline
  canWorkOffline: (endpoint: string, method: string = "GET"): boolean => {
    // Auth operations should always require connection
    if (ALWAYS_ONLINE_ENDPOINTS.some((pattern) => endpoint.includes(pattern))) {
      return false;
    }

    // Check if this endpoint is explicitly allowed offline
    return OFFLINE_CAPABLE_ENDPOINTS.some((pattern) =>
      endpoint.includes(pattern),
    );
  },

  // Check if endpoint requires online connection
  requiresOnline: (endpoint: string): boolean => {
    return ALWAYS_ONLINE_ENDPOINTS.some((pattern) =>
      endpoint.includes(pattern),
    );
  },

  // Get all offline-capable endpoints
  getOfflineCapableEndpoints: (): string[] => [...OFFLINE_CAPABLE_ENDPOINTS],

  // Get all always-online endpoints
  getAlwaysOnlineEndpoints: (): string[] => [...ALWAYS_ONLINE_ENDPOINTS],

  // Add new offline-capable endpoint (for runtime configuration)
  addOfflineCapableEndpoint: (endpoint: string): void => {
    if (!OFFLINE_CAPABLE_ENDPOINTS.includes(endpoint)) {
      OFFLINE_CAPABLE_ENDPOINTS.push(endpoint);
      
    }
  },

  // Add new always-online endpoint (for runtime configuration)
  addAlwaysOnlineEndpoint: (endpoint: string): void => {
    if (!ALWAYS_ONLINE_ENDPOINTS.includes(endpoint)) {
      ALWAYS_ONLINE_ENDPOINTS.push(endpoint);
      
    }
  },
};

// Helper function to check if endpoint can work offline
function canWorkOffline(endpoint: string, method: string): boolean {
  return OfflineConfig.canWorkOffline(endpoint, method);
}

// Helper function to determine request priority based on endpoint
function determineRequestPriority(
  endpoint: string,
  options?: RequestInit & { requiresAuth?: boolean },
): "low" | "medium" | "high" | "critical" {
  const method = (options?.method || "GET").toUpperCase();

  // Critical operations
  if (
    method === "POST" &&
    (endpoint.includes("/ride/create") ||
      endpoint.includes("/payment") ||
      endpoint.includes("/emergency"))
  ) {
    return "critical";
  }

  // High priority operations
  if (
    method === "POST" &&
    (endpoint.includes("/location") ||
      endpoint.includes("/message") ||
      endpoint.includes("/status"))
  ) {
    return "high";
  }

  // Medium priority operations
  if (method === "POST" || method === "PUT") {
    return "medium";
  }

  // GET requests are generally low priority
  if (method === "GET") {
    return "low";
  }

  return "medium"; // Default fallback
}

export const useFetch = <T>(
  endpoint: string | null,
  options?: RequestInit & {
    requiresAuth?: boolean;
    skipAuth?: boolean;
    params?: Record<string, string>;
  },
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Don't fetch if no endpoint provided
    if (!endpoint) {
      setLoading(false);
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      
      const result = await fetchAPI(endpoint, options);
      

      // Handle error responses from new backend API
      if (result?.statusCode && result.statusCode >= 400) {
        const errorMessage = Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message || `HTTP ${result.statusCode} error`;
        setError(errorMessage);
        setData(null);
        return;
      }

      // Extract data from new backend response structure
      const extractedData = result?.data ?? result;
      setData(extractedData);
    } catch (err: any) {
      

      // Handle enhanced error information
      const errorMessage =
        err.response?.message ||
        (Array.isArray(err.response?.message)
          ? err.response.message.join(", ")
          : null) ||
        err.message ||
        "An error occurred while fetching data";

      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
