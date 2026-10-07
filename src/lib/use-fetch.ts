"use client";

import { useEffect, useState, useCallback } from "react";

// Small typed fetch hook for client components.
// Usage: const { data, loading, error, refetch } = useFetch<MyType>("/api/whatever");

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetch<T = any>(url: string | null, options?: RequestInit): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!url);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!url) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(url, options)
      .then(async (res) => {
        const json = await res.json();
        if (cancelled) return;
        if (!json.ok) {
          setError(json.error || "Request failed");
          setData(null);
        } else {
          setData(json);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Network error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
  }, [url, nonce]);

  return { data, loading, error, refetch };
}
