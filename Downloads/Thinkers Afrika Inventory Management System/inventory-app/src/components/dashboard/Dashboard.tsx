'use client';

import { useCallback, useEffect, useState } from "react";
import { KPICards } from "./KPICards";
import { ProductTable } from "./ProductTable";
import { NewProductForm } from "./NewProductForm";
import { Consumption, Product } from "@/types/inventory";

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
      <header className="rounded-3xl border border-transparent bg-gradient-to-r from-tims-accent to-tims-secondary p-8 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.35em] text-white/75">Thinkers Afrika</p>
        <h1 className="mt-2 text-3xl font-semibold">Inventory command centre</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/80">
          Real-time visibility over lubricants, electrical parts, and fleet consumables.
        </p>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <KPICards products={products} consumption={consumption} loading={loading} />

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <ProductTable products={products} loading={loading} />
        <div className="space-y-6">
          <NewProductForm onCreated={loadData} />
          <section className="rounded-2xl border border-tims-border bg-tims-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-tims-text">Recent usage</h2>
            <ul className="mt-4 space-y-3 text-xs text-tims-muted">
              {consumption.slice(0, 5).map((entry) => (
                <li key={entry.id} className="rounded-xl border border-dashed border-tims-border px-3 py-2">
                  <p className="font-medium text-tims-text">
                    {entry.product?.name ?? "Unknown item"} · {entry.quantity} {entry.product?.unit ?? ""}
                  </p>
                  <p>
                    {entry.consumer} ({entry.type}) ·{" "}
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                </li>
              ))}
              {!consumption.length && (
                <li className="text-center text-tims-muted">No consumption logged yet.</li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
