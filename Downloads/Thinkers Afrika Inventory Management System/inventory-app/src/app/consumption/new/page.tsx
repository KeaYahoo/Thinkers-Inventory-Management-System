'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/inventory";

const initialState = {
  productId: "",
  quantity: 0,
  type: "internal",
  consumer: "",
  date: new Date().toISOString().split("T")[0],
};

export default function NewConsumptionPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(initialState);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = (await response.json()) as Product[];
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load products");
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
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

      const response = await fetch("/api/consumption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to log consumption");
      }

      router.push("/consumption");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log consumption");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-tims-bg px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-tims-border bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-tims-muted">Operational usage</p>
        <h1 className="text-3xl mb-1 font-semibold text-tims-text">Log consumption</h1>
        <p className="text-sm text-tims-muted">Record internal or external usage of stock items.</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="text-xs font-medium text-tims-muted">
            Product
            <select
              name="productId"
              value={form.productId}
              onChange={handleChange}
              required
              disabled={loadingProducts}
              className="mt-1 w-full rounded-2xl border border-tims-border bg-white px-3 py-2 text-sm text-tims-text focus:border-tims-accent focus:outline-none"
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.code} · {product.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs font-medium text-tims-muted">
              Quantity
              <input
                type="number"
                min="1"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-tims-border bg-white px-3 py-2 text-sm text-tims-text focus:border-tims-accent focus:outline-none"
              />
            </label>
            <label className="text-xs font-medium text-tims-muted">
              Type
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="mt-1 w-full rounded-2xl border border-tims-border bg-white px-3 py-2 text-sm text-tims-text focus:border-tims-accent focus:outline-none"
              >
                <option value="internal">Internal</option>
                <option value="external">External</option>
              </select>
            </label>
          </div>
          <label className="text-xs font-medium text-tims-muted">
            Consumer
            <input
              name="consumer"
              value={form.consumer}
              onChange={handleChange}
              placeholder="Maintenance team, Fleet client, etc."
              required
              className="mt-1 w-full rounded-2xl border border-tims-border bg-white px-3 py-2 text-sm text-tims-text focus:border-tims-accent focus:outline-none"
            />
          </label>
          <label className="text-xs font-medium text-tims-muted">
            Date
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-2xl border border-tims-border bg-white px-3 py-2 text-sm text-tims-text focus:border-tims-accent focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-tims-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-tims-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Log consumption"}
          </button>
        </form>
      </div>
    </main>
  );
}
