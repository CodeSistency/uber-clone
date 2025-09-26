import { useState, useEffect, useCallback } from "react";
import { router } from "expo-router";
import { maybeMockResponse, simulateLatency, maybeFail } from '@/lib/dev';
import { endpoints } from '@/lib/endpoints';

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
  retryableStatusCodes: [408, 429, 500, 502, 503, 504]
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
function calculateRetryDelay(retryCount: number, config: RetryConfig = defaultRetryConfig): number {
  const delay = config.baseDelay * Math.pow(config.backoffFactor, retryCount);
  return Math.min(delay, config.maxDelay);
}

function shouldRetry(error: any, retryCount: number, config: RetryConfig = defaultRetryConfig): boolean {
  if (retryCount >= config.maxRetries) {
    return false;
  }

  // Retry on network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }

  // Retry on specific HTTP status codes
  if (error.statusCode && config.retryableStatusCodes.includes(error.statusCode)) {
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
      console.log(`[RequestQueue] Processing queued request: ${queuedRequest.id}`);

      // Calculate delay based on retry count
      if (queuedRequest.retryCount > 0) {
        const delay = calculateRetryDelay(queuedRequest.retryCount - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Execute the request
      const response = await makeRequest(queuedRequest.url, queuedRequest.options);
      queuedRequest.resolve(response);

    } catch (error) {
      console.error(`[RequestQueue] Request ${queuedRequest.id} failed:`, error);

      // Check if we should retry
      if (shouldRetry(error, queuedRequest.retryCount)) {
        console.log(`[RequestQueue] Retrying request ${queuedRequest.id} (attempt ${queuedRequest.retryCount + 1})`);

        // Re-queue with incremented retry count
        const retryRequest: QueuedRequest = {
          ...queuedRequest,
          retryCount: queuedRequest.retryCount + 1,
          timestamp: Date.now()
        };

        // Add back to front of queue for immediate retry
        requestQueue.unshift(retryRequest);

        // Add delay before next attempt
        const delay = calculateRetryDelay(retryRequest.retryCount - 1);
        await new Promise(resolve => setTimeout(resolve, delay));

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
      reject
    };

    requestQueue.push(queuedRequest);
    console.log(`[RequestQueue] Request queued: ${queuedRequest.id}`);

    // Start processing queue
    processRequestQueue();
  });
}

// Core request function (extracted for reuse)
async function makeRequest(url: string, options: RequestInit): Promise<any> {
  const startMs = Date.now();

  // Dev mock path (only for relative endpoints)
  if (!url.startsWith('http')) {
    const mock = await maybeMockResponse((options?.method || 'GET').toUpperCase(), url, options?.body);
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
    headers
  };

  console.log("[fetchAPI] ▶ Request", {
    url,
    options: requestOptions,
    bodyContent: options?.body && typeof options.body === 'string' ? (() => {
      try {
        return JSON.parse(options.body as string);
      } catch {
        return options.body;
      }
    })() : options?.body
  });

  try {
    await simulateLatency();
    maybeFail();
    const response = await fetch(url, requestOptions);
    console.log("[fetchAPI] ◀ ResponseMeta", {
      url,
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
    });

    let body: any = null;
    try {
      const textResponse = await response.text();
      if (textResponse) {
        body = JSON.parse(textResponse);
      }
    } catch (parseError) {
      console.log("[fetchAPI] ⚠ Non-JSON response", { url });
      body = { message: "Non-JSON response received" };
    }

    console.log("[fetchAPI] ◀ Body", { url, body });

    // Handle new backend response structure
    if (!response.ok) {
      // Handle token expiration (401) - try to refresh token automatically
      if (response.status === 401 && (options as any)?.requiresAuth) {
        console.log("[fetchAPI] 🔄 Token expired (401), attempting automatic refresh");

        try {
          // Prevent multiple simultaneous refresh attempts
          if (isRefreshingToken) {
            console.log("[fetchAPI] Refresh already in progress, waiting...");
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
              console.log("[fetchAPI] No refresh token available, redirecting to login");
              throw new Error("No refresh token available");
            }

            refreshPromise = fetch(endpoints.api.buildUrl('auth/refresh'), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${refreshToken}`,
              },
              body: JSON.stringify({ refreshToken }),
            });

            const refreshResponse = await refreshPromise;
            const refreshData = await refreshResponse.json();

            if (refreshResponse.ok && refreshData?.accessToken && refreshData?.refreshToken) {
              console.log("[fetchAPI] ✅ Token refreshed successfully");

              // Store new tokens
              await tokenManager.setAccessToken(refreshData.accessToken);
              await tokenManager.setRefreshToken(refreshData.refreshToken);

              // Retry the original request with new token
              console.log("[fetchAPI] 🔄 Retrying original request with new token");
              const newHeaders = { ...headers };
              if ((options as any)?.requiresAuth) {
                const authHeaders = await tokenManager.getAuthHeaders();
                Object.assign(newHeaders, authHeaders);
              }

              const retryResponse = await fetch(url, {
                ...options,
                headers: newHeaders
              });

              const retryBody = await retryResponse.text();
              let retryData: any = null;
              try {
                retryData = JSON.parse(retryBody);
              } catch {
                retryData = { message: "Non-JSON response received" };
              }

              console.log("[fetchAPI] 🔄 Retry response:", { ok: retryResponse.ok, status: retryResponse.status });

              if (retryResponse.ok) {
                console.log("[fetchAPI] ✅ Retry successful");
                return retryData;
              } else {
                throw new Error(retryData?.message || `HTTP error! status: ${retryResponse.status}`);
              }
            } else {
              console.log("[fetchAPI] ❌ Token refresh failed, redirecting to login");
              throw new Error("Token refresh failed");
            }
          }
        } catch (refreshError) {
          console.error("[fetchAPI] ❌ Token refresh error:", refreshError);

          // Clear tokens and redirect to login
          try {
            const { tokenManager } = require("./auth");
            await tokenManager.clearTokens();

            // Clear user store
            const userStore = require("@/store").useUserStore.getState();
            userStore.clearUser();

            // Redirect to login
            console.log("[fetchAPI] 🔄 Redirecting to login due to authentication failure");
            router.replace("/(auth)/sign-in");
          } catch (cleanupError) {
            console.error("[fetchAPI] Error during cleanup:", cleanupError);
          }

          throw new Error("Authentication expired. Please log in again.");
        } finally {
          isRefreshingToken = false;
          refreshPromise = null;
        }
      }

      const errorMessage = body?.message ||
                          (Array.isArray(body?.message) ? body.message.join(', ') : null) ||
                          `HTTP error! status: ${response.status}`;

      const error = new Error(errorMessage);
      (error as any).statusCode = response.status;
      (error as any).response = body;
      throw error;
    }

    return body;
  } catch (error) {
    console.error("[fetchAPI] ✖ Error", { url, error });

    // Enhance error with backend-specific information
    if (error instanceof Error) {
      const enhancedError = error as any;
      enhancedError.endpoint = url;
      enhancedError.fullUrl = url;
    }

    throw error;
  } finally {
    console.log("[fetchAPI] ⏱ DurationMs", { url, ms: Date.now() - startMs });
  }
}

export const fetchAPI = async (endpoint: string, options?: RequestInit & { requiresAuth?: boolean; skipApiPrefix?: boolean; skipAuth?: boolean; useRetryQueue?: boolean; params?: Record<string, string> }) => {
  // Build full URL using centralized endpoint system
  let fullUrl: string;
  if (endpoint.startsWith('http')) {
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

  // Use intelligent retry queue if requested
  if (options?.useRetryQueue) {
    return queueRequest(fullUrl, options);
  }

  // Use direct request (existing behavior)
  return makeRequest(fullUrl, options || {});
};

export const useFetch = <T>(endpoint: string | null, options?: RequestInit & { requiresAuth?: boolean; skipAuth?: boolean; params?: Record<string, string> }) => {
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
      console.log("[useFetch] ▶ Fetch", { endpoint, options });
      const result = await fetchAPI(endpoint, options);
      console.log("[useFetch] ◀ Result", { endpoint, result });

      // Handle error responses from new backend API
      if (result?.statusCode && result.statusCode >= 400) {
        const errorMessage = Array.isArray(result.message)
          ? result.message.join(', ')
          : result.message || `HTTP ${result.statusCode} error`;
        setError(errorMessage);
        setData(null);
        return;
      }

      // Extract data from new backend response structure
      const extractedData = result?.data ?? result;
      setData(extractedData);
    } catch (err: any) {
      console.error("[useFetch] ✖ Error", { endpoint, err });

      // Handle enhanced error information
      const errorMessage = err.response?.message ||
                          (Array.isArray(err.response?.message) ? err.response.message.join(', ') : null) ||
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
