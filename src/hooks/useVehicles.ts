'use client';

import useSWR, { mutate as globalMutate } from "swr";
import { Vehicle } from "@/types/inventory";

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

type VehicleInput = Pick<Vehicle, "regNumber"> & { description?: string };

export function useVehicles() {
  const { data, error, mutate, isLoading } = useSWR<Vehicle[]>("/api/vehicles", fetcher);

  const createVehicle = async (input: VehicleInput) => {
    const response = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to create vehicle");
    }
    await mutate();
    return payload as Vehicle;
  };

  const updateVehicle = async (id: number, input: Partial<VehicleInput>) => {
    const response = await fetch(`/api/vehicles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to update vehicle");
    }
    await mutate();
    await globalMutate(`/api/vehicles/${id}`);
    return payload as Vehicle;
  };

  const deleteVehicle = async (id: number) => {
    const response = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to delete vehicle");
    }
    await mutate();
    return payload as { success: boolean };
  };

  return {
    vehicles: data ?? [],
    isLoading: isLoading || (!data && !error),
    error: error as Error | undefined,
    mutate,
    createVehicle,
    updateVehicle,
    deleteVehicle,
  };
}

export function useVehicle(id?: number | string) {
  const key = id !== undefined ? `/api/vehicles/${id}` : null;
  const { data, error, mutate, isLoading } = useSWR<Vehicle>(key, fetcher);
  return {
    vehicle: data,
    isLoading: isLoading || (!data && !error),
    error: error as Error | undefined,
    mutate,
  };
}

