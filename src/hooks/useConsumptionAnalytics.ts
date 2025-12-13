'use client';

import useSWR from "swr";

type ConsumptionTypeSummary = {
  type: string;
  entries: number;
  quantity: number;
};

export type ConsumptionProductRow = {
  productId: number;
  code: string;
  name: string;
  category: string;
  unit: string;
  thinkersQuantity: number;
  otherQuantity: number;
  totalQuantity: number;
};

export type ConsumptionAnalyticsResponse = {
  totals: { totalEntries: number; totalQuantity: number };
  byType: ConsumptionTypeSummary[];
  byProduct: ConsumptionProductRow[];
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

export type ConsumptionAnalyticsParams = {
  from?: string;
  to?: string;
  productId?: number;
  vehicleId?: number;
};

const buildQueryString = (params?: ConsumptionAnalyticsParams) => {
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  if (params?.productId) search.set("productId", String(params.productId));
  if (params?.vehicleId) search.set("vehicleId", String(params.vehicleId));
  const query = search.toString();
  return query ? `?${query}` : "";
};

export function useConsumptionAnalytics(params?: ConsumptionAnalyticsParams) {
  const key = `/api/analytics/consumption${buildQueryString(params)}`;
  const { data, error, mutate, isLoading } = useSWR<ConsumptionAnalyticsResponse>(key, fetcher);
  return {
    analytics: data,
    totals: data?.totals,
    byType: data?.byType ?? [],
    byProduct: data?.byProduct ?? [],
    isLoading: isLoading || (!data && !error),
    error: error as Error | undefined,
    mutate,
  };
}

