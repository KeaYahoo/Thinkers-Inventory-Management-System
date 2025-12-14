'use client';

import useSWR from "swr";

export type ActivityItem = {
  type: "transfer" | "consumption" | "log";
  timestamp: string;
  description: string;
};

const getPayloadError = (payload: unknown): string | undefined => {
  if (payload && typeof payload === "object" && "error" in payload) {
    const value = (payload as Record<string, unknown>).error;
    if (typeof value === "string") return value;
  }
  return undefined;
};

const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);
  const payload: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(getPayloadError(payload) ?? `Request failed: ${response.status}`);
  }
  return payload as T;
};

export function useRecentActivity() {
  const { data, error, isLoading } = useSWR<ActivityItem[]>("/api/analytics/recent", fetcher, {
    refreshInterval: 30_000,
  });
  return {
    activity: data ?? [],
    isLoading: isLoading || (!data && !error),
    error: error as Error | undefined,
  };
}

