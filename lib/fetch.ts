import { useState, useEffect, useCallback } from "react";
import { router } from "expo-router";
import { maybeMockResponse, simulateLatency, maybeFail } from '@/lib/dev';

// Base URL for the new backend API
const API_BASE_URL = `${process.env.EXPO_PUBLIC_SERVER_URL || "http://localhost:3000"}/api`;

// Track if we're currently refreshing token to avoid multiple refresh attempts
let isRefreshingToken = false;
let refreshPromise: Promise<any> | null = null;

export const fetchAPI = async (endpoint: string, options?: RequestInit & { requiresAuth?: boolean; skipApiPrefix?: boolean }) => {
  const startMs = Date.now();
  const fullUrl = endpoint.startsWith('http') ? endpoint : options?.skipApiPrefix ? `${process.env.EXPO_PUBLIC_SERVER_URL || "https://gnuhealth-back.alcaravan.com.ve"}/${endpoint}` : `${API_BASE_URL}/${endpoint}`;

  // Dev mock path (only for relative endpoints)
  if (!endpoint.startsWith('http')) {
    const mock = await maybeMockResponse((options?.method || 'GET').toUpperCase(), endpoint, options?.body);
    if (mock) {
      return mock;
    }
  }

  // Add authentication headers if required
  let headers = { ...options?.headers };
  if (options?.requiresAuth) {
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
    endpoint,
    fullUrl,
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
    const response = await fetch(fullUrl, requestOptions);
    console.log("[fetchAPI] ◀ ResponseMeta", {
      endpoint,
      fullUrl,
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
      console.log("[fetchAPI] ⚠ Non-JSON response", { endpoint, fullUrl });
      body = { message: "Non-JSON response received" };
    }

    console.log("[fetchAPI] ◀ Body", { endpoint, fullUrl, body });

    // Handle new backend response structure
    if (!response.ok) {
      // Handle token expiration (401) - try to refresh token automatically
      if (response.status === 401 && options?.requiresAuth) {
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

            refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
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
              if (options?.requiresAuth) {
                const authHeaders = await tokenManager.getAuthHeaders();
                Object.assign(newHeaders, authHeaders);
              }

              const retryResponse = await fetch(fullUrl, {
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
    console.error("[fetchAPI] ✖ Error", { endpoint, fullUrl, error });

    // Enhance error with backend-specific information
    if (error instanceof Error) {
      const enhancedError = error as any;
      enhancedError.endpoint = endpoint;
      enhancedError.fullUrl = fullUrl;
    }

    throw error;
  } finally {
    console.log("[fetchAPI] ⏱ DurationMs", { endpoint, fullUrl, ms: Date.now() - startMs });
  }
};

export const useFetch = <T>(endpoint: string | null, options?: RequestInit & { requiresAuth?: boolean }) => {
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