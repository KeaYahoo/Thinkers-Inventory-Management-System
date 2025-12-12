'use client';

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { KPICards } from "./KPICards";
import { Consumption, Product } from "@/types/inventory";
import { NexusBlock } from "@/components/NexusBlock";
import { InventoryTrendChart } from "@/components/charts/InventoryTrendChart";
import { CategoryBreakdownChart } from "@/components/charts/CategoryBreakdownChart";

async function fetchJSON<T>(input: RequestInfo): Promise<T> {
  const response = await fetch(input);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

export function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [consumption, setConsumption] = useState<Consumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productResponse, consumptionResponse] = await Promise.all([
        fetchJSON<Product[]>("/api/products"),
        fetchJSON<Consumption[]>("/api/consumption"),
      ]);
      setProducts(productResponse);
      setConsumption(consumptionResponse);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load inventory data";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-8">
      <NexusBlock className="p-6 sm:p-8">
        <p className="text-xs uppercase tracking-widest text-primary-muted">Thinkers Afrika</p>
        <h1 className="mt-2 text-3xl font-semibold text-primary">Inventory command centre</h1>
        <p className="mt-2 max-w-2xl text-sm text-primary-muted">
          Real-time visibility over lubricants, electrical parts, and fleet consumables.
        </p>
      </NexusBlock>

      {error && (
        <div className="nexus-block border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <KPICards products={products} consumption={consumption} loading={loading} />

      <div className="grid gap-6 lg:grid-cols-2">
        <NexusBlock className="p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold text-primary">Inventory trend</h2>
          <InventoryTrendChart />
        </NexusBlock>
        <NexusBlock className="p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold text-primary">Category breakdown</h2>
          <CategoryBreakdownChart />
        </NexusBlock>
      </div>

      <NexusBlock className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-primary">Inventory summary</h2>
          {!loading && products.length === 0 ? (
            <p className="text-sm text-primary-muted">
              No products yet. Start by adding one in the Inventory page.
            </p>
          ) : (
            <p className="text-sm text-primary-muted">
              Manage products and stock movements from the Inventory and Consumption pages.
            </p>
          )}
        </div>
        <Link href="/inventory" className="btn-brand focus-ring">
          Manage Inventory
        </Link>
      </NexusBlock>
    </div>
  );
}
