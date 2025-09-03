import { useState, useEffect, useCallback } from "react";
import { jwtTokenManager } from "./auth";

// Base URL for the new backend API
const API_BASE_URL = process.env.EXPO_PUBLIC_SERVER_URL || "http://localhost:3000/api";

export const fetchAPI = async (endpoint: string, options?: RequestInit & { requiresAuth?: boolean }) => {
  const startMs = Date.now();
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}/${endpoint}`;

  // Add authentication headers if required
  let headers = { ...options?.headers };
  if (options?.requiresAuth) {
    const authHeaders = await jwtTokenManager.getAuthHeaders();
    headers = { ...headers, ...authHeaders };
  }

  const requestOptions = {
    ...options,
    headers
  };

  console.log("[fetchAPI] ▶ Request", { endpoint, fullUrl, options: requestOptions });

  try {
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
