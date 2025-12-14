'use client';

import useSWR from "swr";

export type Trend = {
  current: number;
  previous: number;
  percentChange: number;
};

export type TrendsResponse = {
  products: Trend;
  transfers: Trend;
  vehicles: Trend;
  consumption: Trend;
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

export function useTrends() {
  const { data, error, isLoading } = useSWR<TrendsResponse>("/api/analytics/trends/summary", fetcher);
  return {
    trends: data,
    isLoading: isLoading || (!data && !error),
    error: error as Error | undefined,
  };
}

