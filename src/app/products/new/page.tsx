'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NexusBlock } from "@/components/NexusBlock";

type FormState = {
  code: string;
  name: string;
  description: string;
  category: string;
  stock: number;
  unit: string;
  cost: number;
  markup: number;
  minStock: number;
  purchaseDate: string;
};

const initialState: FormState = {
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
};

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        ["stock", "cost", "markup", "minStock"].includes(name) && value !== ""
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (form.stock < 0 || form.cost < 0 || form.markup < 0 || form.minStock < 0) {
        throw new Error("Numeric values cannot be negative");
      }

      const sellingPrice = Number((form.cost * (1 + form.markup / 100)).toFixed(2));
      const payload = {
        ...form,
        sellingPrice,
        remaining: form.stock,
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to create product");
      }
      router.push("/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <NexusBlock className="mx-auto max-w-3xl p-6 sm:p-8">
        <p className="text-xs uppercase tracking-widest text-primary-muted">Inventory</p>
        <h1 className="text-3xl font-semibold text-primary">New product</h1>
        <p className="text-sm text-primary-muted">Capture items into the inventory catalogue.</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="Product code" name="code" value={form.code} onChange={handleChange} required />
            <InputField label="Name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <TextareaField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="Category" name="category" value={form.category} onChange={handleChange} required />
            <SelectField label="Unit" name="unit" value={form.unit} onChange={handleChange}>
              <option value="unit">Unit</option>
              <option value="L">Litre (L)</option>
              <option value="KG">Kilogram (KG)</option>
            </SelectField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              type="number"
              min="0"
              label="Stock"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              required
            />
            <InputField
              type="number"
              min="0"
              label="Minimum stock"
              name="minStock"
              value={form.minStock}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              type="number"
              min="0"
              step="0.01"
              label="Cost"
              name="cost"
              value={form.cost}
              onChange={handleChange}
              required
            />
            <InputField
              type="number"
              min="0"
              step="0.01"
              label="Markup (%)"
              name="markup"
              value={form.markup}
              onChange={handleChange}
              required
            />
          </div>
          <InputField
            type="date"
            label="Purchase date"
            name="purchaseDate"
            value={form.purchaseDate}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="btn-brand focus-ring w-full"
          >
            {submitting ? "Saving..." : "Create product"}
          </button>
        </form>
      </NexusBlock>
    </main>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

function InputField({ label, name, className, ...rest }: FieldProps) {
  return (
    <label className="text-xs font-medium text-primary-muted">
      {label}
      <input
        {...rest}
        name={name}
        className={`nexus-input focus-ring mt-1 ${className ?? ""}`}
      />
    </label>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string };

function TextareaField({ label, name, className, ...rest }: TextareaProps) {
  return (
    <label className="text-xs font-medium text-primary-muted">
      {label}
      <textarea
        {...rest}
        name={name}
        className={`nexus-input focus-ring mt-1 ${className ?? ""}`}
      />
    </label>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { label: string };

function SelectField({ label, name, className, children, ...rest }: SelectProps) {
  return (
    <label className="text-xs font-medium text-primary-muted">
      {label}
      <select
        {...rest}
        name={name}
        className={`nexus-input focus-ring mt-1 ${className ?? ""}`}
      >
        {children}
      </select>
    </label>
  );
}

