'use client';

import useSWR, { mutate as globalMutate } from "swr";
import { Supplier } from "@/types/inventory";

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

type SupplierInput = Omit<Supplier, "id" | "createdAt" | "updatedAt">;

export function useSuppliers() {
  const { data, error, mutate, isLoading } = useSWR<Supplier[]>("/api/suppliers", fetcher);

  const createSupplier = async (input: SupplierInput) => {
    const response = await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to create supplier");
    }
    await mutate();
    return payload as Supplier;
  };

  const updateSupplier = async (id: number, input: Partial<SupplierInput>) => {
    const response = await fetch(`/api/suppliers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to update supplier");
    }
    await mutate();
    await globalMutate(`/api/suppliers/${id}`);
    return payload as Supplier;
  };

  const deleteSupplier = async (id: number) => {
    const response = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to delete supplier");
    }
    await mutate();
    return payload as { success: boolean };
  };

  return {
    suppliers: data ?? [],
    isLoading: isLoading || (!data && !error),
    error: error as Error | undefined,
    mutate,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
}

export function useSupplier(id?: number | string) {
  const key = id !== undefined ? `/api/suppliers/${id}` : null;
  const { data, error, mutate, isLoading } = useSWR<Supplier>(key, fetcher);
  return {
    supplier: data,
    isLoading: isLoading || (!data && !error),
    error: error as Error | undefined,
    mutate,
  };
}

