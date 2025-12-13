'use client';

import useSWR, { mutate as globalMutate } from "swr";
import { VehicleLog } from "@/types/inventory";

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

type VehicleLogInput = Omit<VehicleLog, "id" | "vehicle" | "createdAt" | "updatedAt">;

export function useVehicleLogs(vehicleId?: number | string) {
  const key = vehicleId !== undefined ? `/api/vehicles/${vehicleId}/logs` : null;
  const { data, error, mutate, isLoading } = useSWR<VehicleLog[]>(key, fetcher);

  const createVehicleLog = async (vehicleIdValue: number, input: Omit<VehicleLogInput, "vehicleId">) => {
    const response = await fetch(`/api/vehicles/${vehicleIdValue}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to create vehicle log");
    }
    await globalMutate(`/api/vehicles/${vehicleIdValue}/logs`);
    return payload as VehicleLog;
  };

  const updateVehicleLog = async (logId: number, input: Partial<Omit<VehicleLogInput, "vehicleId">>) => {
    const response = await fetch(`/api/vehiclelogs/${logId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to update vehicle log");
    }
    await globalMutate(`/api/vehiclelogs/${logId}`);
    if (vehicleId !== undefined) {
      await mutate();
    }
    return payload as VehicleLog;
  };

  const deleteVehicleLog = async (logId: number) => {
    const response = await fetch(`/api/vehiclelogs/${logId}`, { method: "DELETE" });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to delete vehicle log");
    }
    if (vehicleId !== undefined) {
      await mutate();
    }
    return payload as VehicleLog;
  };

  return {
    logs: data ?? [],
    isLoading: isLoading || (!data && !error),
    error: error as Error | undefined,
    mutate,
    createVehicleLog,
    updateVehicleLog,
    deleteVehicleLog,
  };
}

export function useVehicleLog(logId?: number | string) {
  const key = logId !== undefined ? `/api/vehiclelogs/${logId}` : null;
  const { data, error, mutate, isLoading } = useSWR<VehicleLog>(key, fetcher);
  return {
    log: data,
    isLoading: isLoading || (!data && !error),
    error: error as Error | undefined,
    mutate,
  };
}

