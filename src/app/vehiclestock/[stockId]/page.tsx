'use client';

import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import { NexusBlock } from "@/components/NexusBlock";
import { useVehicleStock, useVehicleStockEntry } from "@/hooks/useVehicleStock";
import { useUI } from "@/context/UIContext";

type PageProps = {
  params: Promise<{ stockId: string }>;
};

export default function EditVehicleStockPage({ params }: PageProps) {
  const { stockId } = use(params);
  const router = useRouter();
  const { stockEntry, isLoading, error: loadError } = useVehicleStockEntry(stockId);
  const { updateVehicleStock } = useVehicleStock(stockEntry?.vehicleId);
  const { showToast } = useUI();

  const backHref = useMemo(() => {
    if (!stockEntry) return "/vehicles";
    return `/vehicles/${stockEntry.vehicleId}/stock`;
  }, [stockEntry]);

  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stockEntry) return;
    setQuantity(stockEntry.quantity.toString());
  }, [stockEntry]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const parsed = Number(quantity);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error("Quantity must be a positive integer");
      }

      await updateVehicleStock(Number(stockId), parsed);
      showToast("Stock updated", "success");
      router.push(backHref);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update stock");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <NexusBlock className="mx-auto w-full max-w-lg p-6 sm:p-8 text-sm text-primary-muted">
          Loading stock entry...
        </NexusBlock>
      </main>
    );
  }

  if (loadError || !stockEntry) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-lg nexus-block border-red-200 bg-red-50 p-6 sm:p-8 text-sm text-red-600">
          {loadError?.message ?? "Stock entry not found"}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <NexusBlock className="mx-auto w-full max-w-lg p-6 sm:p-8">
        <p className="text-xs uppercase tracking-widest text-primary-muted">Fleet</p>
        <h1 className="text-3xl font-semibold text-primary">Edit vehicle stock</h1>
        <p className="text-sm text-primary-muted">{stockEntry.product?.name ?? "Stock item"} — update quantity below.</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-medium text-primary-muted sm:col-span-2">
            Quantity
            <input
              name="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="nexus-input focus-ring mt-1"
              required
            />
          </label>
          <div className="sm:col-span-2">
            <button type="submit" disabled={submitting} className="btn-brand focus-ring w-full">
              {submitting ? "Saving..." : "Update stock"}
            </button>
          </div>
        </form>
      </NexusBlock>
    </main>
  );
}

