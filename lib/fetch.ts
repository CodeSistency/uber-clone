import { useState, useEffect, useCallback } from "react";

export const fetchAPI = async (url: string, options?: RequestInit) => {
  const startMs = Date.now();
  console.log("[fetchAPI] ▶ Request", { url, options });
  try {
    const response = await fetch(url, options);
    console.log("[fetchAPI] ◀ ResponseMeta", {
      url,
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
    });

    let body: unknown = null;
    try {
      body = await response.json();
    } catch (parseError) {
      console.log("[fetchAPI] ⚠ Non-JSON response", { url });
    }

    console.log("[fetchAPI] ◀ Body", { url, body });

    if (!response.ok) {
      // Keep original behavior (do not throw), just create an Error instance
      // so callers relying on current semantics are not broken while debugging.
      // eslint-disable-next-line no-new
      new Error(`HTTP error! status: ${response.status}`);
    }

    return body as any;
  } catch (error) {
    console.error("[fetchAPI] ✖ Error", { url, error });
    throw error;
  } finally {
    console.log("[fetchAPI] ⏱ DurationMs", { url, ms: Date.now() - startMs });
  }
};

export const useFetch = <T>(url: string | null, options?: RequestInit) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Don't fetch if no URL provided
    if (!url) {
      setLoading(false);
      setData([] as T); // Set empty array for array types
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("[useFetch] ▶ Fetch", { url, options });
      const result = await fetchAPI(url, options);
      console.log("[useFetch] ◀ Result", { url, result });

      // Handle error responses from API
      if ((result as any)?.error) {
        setError((result as any).error);
        setData([] as T); // Set empty array for array types
        return;
      }

      // Extract data or use result as fallback
      const data = (result as any)?.data ?? (result as any);
      setData(data);
    } catch (err) {
      console.error("[useFetch] ✖ Error", { url, err });
      setError((err as Error).message);
      setData([] as T); // Set empty array for array types
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
