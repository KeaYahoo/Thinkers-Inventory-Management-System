'use client';

import { useState } from "react";
import { NexusBlock } from "./NexusBlock";

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
      [name]:
        name === "stock" || name === "cost" || name === "markup" || name === "minStock"
          ? Number(value)
          : value,
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
    <NexusBlock className="p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-primary">Add product</h2>
      <p className="text-xs text-primary-muted">Capture new inventory items directly into the database.</p>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs font-medium text-primary-muted">
            Code
            <input
              className="nexus-input focus-ring mt-1"
              name="code"
              value={formState.code}
              onChange={handleChange}
              required
            />
          </label>
          <label className="text-xs font-medium text-primary-muted">
            Name
            <input
              className="nexus-input focus-ring mt-1"
              name="name"
              value={formState.name}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <label className="text-xs font-medium text-primary-muted">
          Description
          <textarea
            className="nexus-input focus-ring mt-1"
            name="description"
            value={formState.description}
            onChange={handleChange}
            rows={2}
            required
          />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs font-medium text-primary-muted">
            Category
            <input
              className="nexus-input focus-ring mt-1"
              name="category"
              value={formState.category}
              onChange={handleChange}
              required
            />
          </label>
          <label className="text-xs font-medium text-primary-muted">
            Unit
            <select
              className="nexus-input focus-ring mt-1"
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
          <label className="text-xs font-medium text-primary-muted">
            Stock
            <input
              type="number"
              min={0}
              className="nexus-input focus-ring mt-1"
              name="stock"
              value={formState.stock}
              onChange={handleChange}
              required
            />
          </label>
          <label className="text-xs font-medium text-primary-muted">
            Minimum stock
            <input
              type="number"
              min={0}
              className="nexus-input focus-ring mt-1"
              name="minStock"
              value={formState.minStock}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs font-medium text-primary-muted">
            Cost
            <input
              type="number"
              min={0}
              className="nexus-input focus-ring mt-1"
              name="cost"
              value={formState.cost}
              onChange={handleChange}
              required
            />
          </label>
          <label className="text-xs font-medium text-primary-muted">
            Markup %
            <input
              type="number"
              min={0}
              className="nexus-input focus-ring mt-1"
              name="markup"
              value={formState.markup}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <label className="text-xs font-medium text-primary-muted">
          Purchase date
          <input
            type="date"
            className="nexus-input focus-ring mt-1"
            name="purchaseDate"
            value={formState.purchaseDate}
            onChange={handleChange}
            required
          />
        </label>

        {message && <p className="text-xs text-primary-muted">{message}</p>}

        <button type="submit" className="btn-brand focus-ring w-full" disabled={submitting}>
          {submitting ? "Saving..." : "Save product"}
        </button>
      </form>
    </NexusBlock>
  );
}
