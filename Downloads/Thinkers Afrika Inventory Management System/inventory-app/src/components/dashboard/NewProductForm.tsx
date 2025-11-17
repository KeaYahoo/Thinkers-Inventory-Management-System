'use client';

import { useState } from "react";

type NewProductFormProps = {
  onCreated: () => Promise<void> | void;
};

const createInitialForm = () => ({
  code: "",
  name: "",
  description: "",
  category: "",
  stock: 0,
  unit: "unit",
  cost: 0,
  markup: 0,
  minStock: 0,
  purchaseDate: new Date().toISOString().split("T")[0],
});

export function NewProductForm({ onCreated }: NewProductFormProps) {
  const [formState, setFormState] = useState(createInitialForm());
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: name === "stock" || name === "cost" || name === "markup" || name === "minStock" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formState,
          remaining: formState.stock,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Unable to create product");
      }

      setFormState(createInitialForm());
      setMessage("Product created successfully");
      await onCreated();
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unable to create product";
      setMessage(text);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-tims-border bg-tims-surface p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-tims-text">Add product</h2>
      <p className="text-xs text-tims-muted">Capture new inventory items directly into the database.</p>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs font-medium text-tims-muted">
            Code
            <input
              className="mt-1 w-full rounded-xl border border-tims-border bg-white px-3 py-2 text-sm"
              name="code"
              value={formState.code}
              onChange={handleChange}
              required
            />
          </label>
          <label className="text-xs font-medium text-tims-muted">
            Name
            <input
              className="mt-1 w-full rounded-xl border border-tims-border bg-white px-3 py-2 text-sm"
              name="name"
              value={formState.name}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <label className="text-xs font-medium text-tims-muted">
          Description
          <textarea
            className="mt-1 w-full rounded-xl border border-tims-border bg-white px-3 py-2 text-sm"
            name="description"
            value={formState.description}
            onChange={handleChange}
            rows={2}
            required
          />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs font-medium text-tims-muted">
            Category
            <input
              className="mt-1 w-full rounded-xl border border-tims-border bg-white px-3 py-2 text-sm"
              name="category"
              value={formState.category}
              onChange={handleChange}
              required
            />
          </label>
          <label className="text-xs font-medium text-tims-muted">
            Unit
            <select
              className="mt-1 w-full rounded-xl border border-tims-border bg-white px-3 py-2 text-sm"
              name="unit"
              value={formState.unit}
              onChange={handleChange}
            >
              <option value="unit">Unit</option>
              <option value="L">Liters</option>
              <option value="KG">Kilograms</option>
            </select>
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs font-medium text-tims-muted">
            Stock
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-xl border border-tims-border bg-white px-3 py-2 text-sm"
              name="stock"
              value={formState.stock}
              onChange={handleChange}
              required
            />
          </label>
          <label className="text-xs font-medium text-tims-muted">
            Minimum stock
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-xl border border-tims-border bg-white px-3 py-2 text-sm"
              name="minStock"
              value={formState.minStock}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs font-medium text-tims-muted">
            Cost
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-xl border border-tims-border bg-white px-3 py-2 text-sm"
              name="cost"
              value={formState.cost}
              onChange={handleChange}
              required
            />
          </label>
          <label className="text-xs font-medium text-tims-muted">
            Markup %
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-xl border border-tims-border bg-white px-3 py-2 text-sm"
              name="markup"
              value={formState.markup}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <label className="text-xs font-medium text-tims-muted">
          Purchase date
          <input
            type="date"
            className="mt-1 w-full rounded-xl border border-tims-border bg-white px-3 py-2 text-sm"
            name="purchaseDate"
            value={formState.purchaseDate}
            onChange={handleChange}
            required
          />
        </label>

        {message && <p className="text-xs text-tims-muted">{message}</p>}

        <button
          type="submit"
          className="w-full rounded-xl bg-tims-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-tims-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Saving…" : "Save product"}
        </button>
      </form>
    </section>
  );
}
