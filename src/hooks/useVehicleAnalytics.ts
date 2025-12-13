'use client';

import useSWR from "swr";

type VehicleAnalyticsItem = {
  id: number;
  regNumber: string;
  description: string | null;
  onRoadUnits: number;
  logCount: number;
  transferCount: number;
};

export type VehicleAnalyticsResponse = {
  totals: {
    totalVehicles: number;
    totalOnRoadUnits: number;
    totalLogs: number;
    totalTransfers: number;
  };
  vehicles: VehicleAnalyticsItem[];
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

type VehicleAnalyticsParams = { from?: string; to?: string };

const buildQueryString = (params?: VehicleAnalyticsParams) => {
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  const query = search.toString();
  return query ? `?${query}` : "";
};

export function useVehicleAnalytics(params?: VehicleAnalyticsParams) {
  const key = `/api/analytics/vehicles${buildQueryString(params)}`;
  const { data, error, mutate, isLoading } = useSWR<VehicleAnalyticsResponse>(key, fetcher);
  return {
    analytics: data,
    vehicles: data?.vehicles ?? [],
    totals: data?.totals,
    isLoading: isLoading || (!data && !error),
    error: error as Error | undefined,
    mutate,
  };
}

