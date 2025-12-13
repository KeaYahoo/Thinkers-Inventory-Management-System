'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NexusBlock } from "@/components/NexusBlock";
import { useProducts } from "@/hooks/useProducts";
import { useConsumption } from "@/hooks/useConsumption";
import { useUI } from "@/context/UIContext";

const initialState = {
  productId: "",
  quantity: 0,
  type: "internal",
  consumer: "",
  date: new Date().toISOString().split("T")[0],
};

export default function NewConsumptionPage() {
  const router = useRouter();
  const { products, isLoading: loadingProducts, error: productsError } = useProducts();
  const { createConsumption } = useConsumption();
  const { showToast } = useUI();
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (form.quantity <= 0) {
        throw new Error("Quantity must be greater than zero");
      }

      const payload = {
        ...form,
        productId: Number(form.productId),
      };

      await createConsumption(payload);
      showToast("Consumption logged", "success");
      router.push("/consumption");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log consumption");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <NexusBlock className="mx-auto w-full max-w-lg p-6 sm:p-8">
        <p className="text-xs uppercase tracking-widest text-primary-muted">Operational usage</p>
        <h1 className="mb-1 text-3xl font-semibold text-primary">Log consumption</h1>
        <p className="text-sm text-primary-muted">Record internal or external usage of stock items.</p>

        {(error || productsError) && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error ?? productsError?.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-medium text-primary-muted sm:col-span-2">
            Product
            <select
              name="productId"
              value={form.productId}
              onChange={handleChange}
              required
              disabled={loadingProducts}
              className="nexus-input focus-ring mt-1"
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.code} — {product.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-medium text-primary-muted">
            Quantity
            <input
              type="number"
              min="1"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              required
              className="nexus-input focus-ring mt-1"
            />
          </label>

          <label className="text-xs font-medium text-primary-muted">
            Type
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="nexus-input focus-ring mt-1"
            >
              <option value="internal">Internal</option>
              <option value="external">External</option>
            </select>
          </label>

          <label className="text-xs font-medium text-primary-muted sm:col-span-2">
            Consumer
            <input
              name="consumer"
              value={form.consumer}
              onChange={handleChange}
              placeholder="Maintenance team, Fleet client, etc."
              required
              className="nexus-input focus-ring mt-1"
            />
          </label>

          <label className="text-xs font-medium text-primary-muted">
            Date
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="nexus-input focus-ring mt-1"
            />
          </label>

          <div className="sm:col-span-2">
            <button type="submit" disabled={submitting} className="btn-brand focus-ring w-full">
              {submitting ? "Saving..." : "Log consumption"}
            </button>
          </div>
        </form>
      </NexusBlock>
    </main>
  );
}

