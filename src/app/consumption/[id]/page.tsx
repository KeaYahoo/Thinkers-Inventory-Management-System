'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Consumption, Product } from "@/types/inventory";
import { NexusBlock } from "@/components/NexusBlock";

type PageProps = {
  params: { id: string };
};

export default function EditConsumptionPage({ params }: PageProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [record, setRecord] = useState<Consumption | null>(null);
  const [form, setForm] = useState({
    productId: "",
    quantity: 0,
    type: "internal",
    consumer: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = (await response.json()) as Product[];
      setProducts(data);
    };

    const loadConsumption = async () => {
      const response = await fetch(`/api/consumption/${params.id}`);
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Failed to load consumption entry");
      }
      const data = (await response.json()) as Consumption;
      setRecord(data);
      setForm({
        productId: data.productId.toString(),
        quantity: data.quantity,
        type: data.type,
        consumer: data.consumer,
        date: data.date.slice(0, 10),
      });
    };

    Promise.allSettled([loadProducts(), loadConsumption()])
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [params.id]);

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
      const payload = {
        ...form,
        productId: Number(form.productId),
      };

      const response = await fetch(`/api/consumption/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to update entry");
      }
      router.push("/consumption");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update entry");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !record) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <NexusBlock className="mx-auto max-w-3xl p-6 sm:p-8 text-sm text-primary-muted">
          Loading consumption entry…
        </NexusBlock>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <NexusBlock className="mx-auto max-w-3xl p-6 sm:p-8">
        <p className="text-xs uppercase tracking-widest text-primary-muted">Operational usage</p>
        <h1 className="text-3xl font-semibold text-primary">Edit consumption</h1>
        <p className="text-sm text-primary-muted">Adjust quantities or reassign to a different product.</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="text-xs font-medium text-primary-muted">
            Product
            <select
              name="productId"
              value={form.productId}
              onChange={handleChange}
              required
              className="nexus-input focus-ring mt-1"
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
          </div>
          <label className="text-xs font-medium text-primary-muted">
            Consumer
            <input
              name="consumer"
              value={form.consumer}
              onChange={handleChange}
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
          <button
            type="submit"
            disabled={submitting}
            className="btn-brand focus-ring w-full"
          >
            {submitting ? "Saving..." : "Update entry"}
          </button>
        </form>
      </NexusBlock>
    </main>
  );
}



