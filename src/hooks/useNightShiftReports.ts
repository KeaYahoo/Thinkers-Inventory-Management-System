'use client';

import useSWR, { mutate as globalMutate } from "swr";
import { NightShiftReport } from "@/types/inventory";

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

export type NightShiftReportInput = {
  date: string;
  vehicleId?: number | null;
  staff: string;
  shiftSummary: string;
  incidents?: string | null;
  nonCompliance?: string | null;
};

export function useNightShiftReports() {
  const { data, error, mutate, isLoading } = useSWR<NightShiftReport[]>("/api/nightshift", fetcher);

  const createReport = async (input: NightShiftReportInput) => {
    const response = await fetch("/api/nightshift", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to create report");
    }
    await mutate();
    return payload as NightShiftReport;
  };

  const updateReport = async (id: number, input: Partial<NightShiftReportInput>) => {
    const response = await fetch(`/api/nightshift/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to update report");
    }
    await mutate();
    await globalMutate(`/api/nightshift/${id}`);
    return payload as NightShiftReport;
  };

  const deleteReport = async (id: number) => {
    const response = await fetch(`/api/nightshift/${id}`, { method: "DELETE" });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to delete report");
    }
    await mutate();
    await globalMutate(`/api/nightshift/${id}`);
    return payload as { success: boolean };
  };

  return {
    reports: data ?? [],
    isLoading: isLoading || (!data && !error),
    error: error as Error | undefined,
    mutate,
    createReport,
    updateReport,
    deleteReport,
  };
}

export function useNightShiftReport(id?: number | string) {
  const key = id !== undefined ? `/api/nightshift/${id}` : null;
  const { data, error, mutate, isLoading } = useSWR<NightShiftReport>(key, fetcher);
  return {
    report: data,
    isLoading: isLoading || (!data && !error),
    error: error as Error | undefined,
    mutate,
  };
}

