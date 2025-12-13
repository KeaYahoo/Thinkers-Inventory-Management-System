'use client';

import useSWR from "swr";

export type LowStockAlert = {
  id: number;
  code: string;
  name: string;
  category: string;
  remaining: number;
  minStock: number;
  status: "critical" | "warning";
};

type AlertsResponse = {
  alerts: LowStockAlert[];
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

export function useLowStockAlerts(limit?: number) {
  const key =
    limit !== undefined ? `/api/alerts/low-stock?limit=${encodeURIComponent(String(limit))}` : "/api/alerts/low-stock";
  const { data, error, isLoading } = useSWR<AlertsResponse>(key, fetcher);

  const alerts = data?.alerts ?? [];
  const criticalCount = alerts.filter((alert) => alert.status === "critical").length;
  const warningCount = alerts.filter((alert) => alert.status === "warning").length;

  return {
    alerts,
    totalCount: alerts.length,
    criticalCount,
    warningCount,
    isLoading: isLoading || (!data && !error),
    error: error as Error | undefined,
  };
}

