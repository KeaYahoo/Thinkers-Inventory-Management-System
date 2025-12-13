'use client';

import useSWR, { mutate as globalMutate } from "swr";
import { Product } from "@/types/inventory";

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

type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt"> & {
  remaining?: number;
  sellingPrice?: number;
};

export function useProducts() {
  const {
    data,
    error,
    mutate,
    isLoading,
  } = useSWR<Product[]>("/api/products", fetcher);

  const createProduct = async (input: ProductInput) => {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to create product");
    }
    await mutate();
    await globalMutate("/api/alerts/low-stock");
    return payload as Product;
  };

  const updateProduct = async (id: number, input: Partial<ProductInput>) => {
    const response = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to update product");
    }
    await mutate();
    await globalMutate(`/api/products/${id}`);
    await globalMutate("/api/alerts/low-stock");
    return payload as Product;
  };

  const deleteProduct = async (id: number) => {
    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getPayloadError(payload) ?? "Failed to delete product");
    }
    await mutate();
    await globalMutate("/api/alerts/low-stock");
    return payload as { success: boolean };
  };

  return {
    products: data ?? [],
    isLoading: isLoading || (!data && !error),
    error: error as Error | undefined,
    mutate,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

export function useProduct(id?: number | string) {
  const key = id !== undefined ? `/api/products/${id}` : null;
  const { data, error, mutate, isLoading } = useSWR<Product>(key, fetcher);
  return {
    product: data,
    isLoading: isLoading || (!data && !error),
    error: error as Error | undefined,
    mutate,
  };
}
