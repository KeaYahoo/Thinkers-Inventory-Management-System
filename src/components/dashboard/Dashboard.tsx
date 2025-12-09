'use client';

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KPICards } from "./KPICards";
import { Consumption, Product } from "@/types/inventory";
import { NexusBlock } from "@/components/NexusBlock";
import { ProductTable } from "@/components/ProductTable";
import { NewProductForm } from "@/components/NewProductForm";

async function fetchJSON<T>(input: RequestInfo): Promise<T> {
  const response = await fetch(input);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

export function Dashboard() {
  const router = useRouter();
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

  const handleEdit = useCallback(
    (id: number) => {
      router.push(`/products/${id}`);
    },
    [router],
  );

  const handleDelete = useCallback(
    async (id: number) => {
      const confirmed = window.confirm("Are you sure you want to delete this product?");
      if (!confirmed) return;
      try {
        const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload.error ?? "Failed to delete product");
        }
        await loadData();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to delete product";
        setError(message);
      }
    },
    [loadData],
  );

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

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <ProductTable products={products} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
        <div className="space-y-6">
          <NewProductForm onCreated={loadData} />
          <NexusBlock className="p-6">
            <h2 className="text-lg font-semibold text-primary">Recent usage</h2>
            <ul className="mt-4 space-y-3 text-xs text-primary-muted">
              {consumption.slice(0, 5).map((entry) => (
                <li key={entry.id} className="rounded-xl border border-dashed border-border-subtle px-3 py-2">
                  <p className="font-medium text-primary">
                    {entry.product?.name ?? "Unknown item"} · {entry.quantity} {entry.product?.unit ?? ""}
                  </p>
                  <p>
                    {entry.consumer} ({entry.type}) ·{" "}
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                </li>
              ))}
              {!consumption.length && (
                <li className="text-center text-primary-muted">No consumption logged yet.</li>
              )}
            </ul>
          </NexusBlock>
        </div>
      </div>
    </div>
  );
}



