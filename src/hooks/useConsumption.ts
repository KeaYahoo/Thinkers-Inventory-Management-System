'use client';

import useSWR, { mutate as globalMutate } from "swr";
import { Consumption } from "@/types/inventory";

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

type ConsumptionInput = Omit<Consumption, "id" | "product" | "vehicle">;

export function useConsumption() {
  const { data, error, mutate, isLoading } = useSWR<Consumption[]>(
    "/api/consumption",
    fetcher,
  );

  const createConsumption = async (input: ConsumptionInput) => {
    const response = await fetch("/api/consumption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to log consumption");
    }
    await mutate();
    await globalMutate("/api/products");
    await globalMutate("/api/alerts/low-stock");
    return payload as Consumption;
  };

  const updateConsumption = async (id: number, input: Partial<ConsumptionInput>) => {
    const response = await fetch(`/api/consumption/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to update consumption");
    }
    await mutate();
    await globalMutate(`/api/consumption/${id}`);
    await globalMutate("/api/products");
    await globalMutate("/api/alerts/low-stock");
    return payload as Consumption;
  };

  const deleteConsumption = async (id: number) => {
    const response = await fetch(`/api/consumption/${id}`, { method: "DELETE" });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to delete entry");
    }
    await mutate();
    await globalMutate("/api/products");
    await globalMutate("/api/alerts/low-stock");
    return payload as Consumption;
  };

  return {
    consumption: data ?? [],
    isLoading: isLoading || (!data && !error),
    error: error as Error | undefined,
    mutate,
    createConsumption,
    updateConsumption,
    deleteConsumption,
  };
}

export function useConsumptionRecord(id?: number | string) {
  const key = id !== undefined ? `/api/consumption/${id}` : null;
  const { data, error, mutate, isLoading } = useSWR<Consumption>(key, fetcher);
  return {
    record: data,
    isLoading: isLoading || (!data && !error),
    error: error as Error | undefined,
    mutate,
  };
}
