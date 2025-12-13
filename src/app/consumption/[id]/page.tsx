'use client';

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { NexusBlock } from "@/components/NexusBlock";
import { useProducts } from "@/hooks/useProducts";
import { useConsumption, useConsumptionRecord } from "@/hooks/useConsumption";
import { useUI } from "@/context/UIContext";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EditConsumptionPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { products, isLoading: productsLoading, error: productsError } = useProducts();
  const { record, isLoading: recordLoading, error: recordError } = useConsumptionRecord(id);
  const { updateConsumption } = useConsumption();
  const { showToast } = useUI();

  const [form, setForm] = useState({
    productId: "",
    quantity: 0,
    type: "internal",
    consumer: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!record) return;
    setForm({
      productId: record.productId.toString(),
      quantity: record.quantity,
      type: record.type,
      consumer: record.consumer,
      date: record.date.slice(0, 10),
    });
  }, [record]);

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

      await updateConsumption(Number(id), payload);
      showToast("Consumption updated", "success");
      router.push("/consumption");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update entry");
    } finally {
      setSubmitting(false);
    }
  };

  const loading = productsLoading || recordLoading;
  const combinedError = productsError ?? recordError;

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <NexusBlock className="mx-auto w-full max-w-lg p-6 sm:p-8 text-sm text-primary-muted">
          Loading consumption entry...
        </NexusBlock>
      </main>
    );
  }

  if (combinedError || !record) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-lg nexus-block border-red-200 bg-red-50 p-6 sm:p-8 text-sm text-red-600">
          {combinedError?.message ?? "Consumption not found"}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <NexusBlock className="mx-auto w-full max-w-lg p-6 sm:p-8">
        <p className="text-xs uppercase tracking-widest text-primary-muted">Operational usage</p>
        <h1 className="text-3xl font-semibold text-primary">Edit consumption</h1>
        <p className="text-sm text-primary-muted">Adjust quantities or reassign to a different product.</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
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
            <select name="type" value={form.type} onChange={handleChange} className="nexus-input focus-ring mt-1">
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
              {submitting ? "Saving..." : "Update entry"}
            </button>
          </div>
        </form>
      </NexusBlock>
    </main>
  );
}

