'use client';

import useSWR, { mutate as globalMutate } from "swr";
import { Transfer } from "@/types/inventory";

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

type TransferInput = {
  productId: number;
  vehicleId?: number;
  quantity: number;
  direction: "TO_VEHICLE" | "FROM_VEHICLE";
  notes?: string;
  date?: string;
};

export function useTransfers() {
  const { data, error, mutate, isLoading } = useSWR<Transfer[]>("/api/transfers", fetcher);

  const createTransfer = async (input: TransferInput) => {
    const response = await fetch("/api/transfers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to create transfer");
    }

    const created = payload as Transfer;

    await mutate();
    await globalMutate("/api/products");
    await globalMutate("/api/alerts/low-stock");
    if (created.vehicleId) {
      await globalMutate(`/api/vehicles/${created.vehicleId}/stock`);
    }

    return created;
  };

  return {
    transfers: data ?? [],
    isLoading: isLoading || (!data && !error),
    error: error as Error | undefined,
    mutate,
    createTransfer,
  };
}

export function useTransfer(id?: number | string) {
  const key = id !== undefined ? `/api/transfers/${id}` : null;
  const { data, error, mutate, isLoading } = useSWR<Transfer>(key, fetcher);
  return {
    transfer: data,
    isLoading: isLoading || (!data && !error),
    error: error as Error | undefined,
    mutate,
  };
}

