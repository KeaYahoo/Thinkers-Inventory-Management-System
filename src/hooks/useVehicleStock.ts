'use client';

import useSWR, { mutate as globalMutate } from "swr";
import { VehicleStock } from "@/types/inventory";

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

type VehicleStockCreateInput = {
  productId: number;
  quantity: number;
};

export function useVehicleStock(vehicleId?: number | string) {
  const key = vehicleId !== undefined ? `/api/vehicles/${vehicleId}/stock` : null;
  const { data, error, mutate, isLoading } = useSWR<VehicleStock[]>(key, fetcher);

  const addVehicleStock = async (
    vehicleIdValue: number,
    input: VehicleStockCreateInput,
  ) => {
    const response = await fetch(`/api/vehicles/${vehicleIdValue}/stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to add vehicle stock");
    }
    await globalMutate(`/api/vehicles/${vehicleIdValue}/stock`);
    return payload as VehicleStock;
  };

  const updateVehicleStock = async (stockId: number, quantity: number) => {
    const response = await fetch(`/api/vehiclestock/${stockId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to update vehicle stock");
    }
    await globalMutate(`/api/vehiclestock/${stockId}`);
    if (vehicleId !== undefined) {
      await mutate();
    }
    return payload as VehicleStock;
  };

  const deleteVehicleStock = async (stockId: number) => {
    const response = await fetch(`/api/vehiclestock/${stockId}`, { method: "DELETE" });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to delete vehicle stock");
    }
    if (vehicleId !== undefined) {
      await mutate();
    }
    return payload as VehicleStock;
  };

  return {
    stockItems: data ?? [],
    isLoading: isLoading || (!data && !error),
    error: error as Error | undefined,
    mutate,
    addVehicleStock,
    updateVehicleStock,
    deleteVehicleStock,
  };
}

export function useVehicleStockEntry(stockId?: number | string) {
  const key = stockId !== undefined ? `/api/vehiclestock/${stockId}` : null;
  const { data, error, mutate, isLoading } = useSWR<VehicleStock>(key, fetcher);
  return {
    stockEntry: data,
    isLoading: isLoading || (!data && !error),
    error: error as Error | undefined,
    mutate,
  };
}

