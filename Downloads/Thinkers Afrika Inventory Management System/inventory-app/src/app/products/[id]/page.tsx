'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/inventory";

type PageProps = {
  params: { id: string };
};

export default function EditProductPage({ params }: PageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error ?? "Failed to load product");
        }
        const data = (await response.json()) as Product;
        setProduct(data);
        setForm({
          code: data.code,
          name: data.name,
          description: data.description,
          category: data.category,
          stock: data.stock,
          unit: data.unit,
          cost: data.cost,
          markup: data.markup,
          minStock: data.minStock,
          purchaseDate: data.purchaseDate.slice(0, 10),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

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
      const sellingPrice = Number((form.cost * (1 + form.markup / 100)).toFixed(2));
      const payload = {
        ...form,
        sellingPrice,
        remaining: form.stock,
      };
      const response = await fetch(`/api/products/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to update product");
      }
      router.push("/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-tims-bg px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-tims-border bg-white p-8 text-sm text-tims-muted">
          Loading product…
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-tims-bg px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-red-50 p-8 text-sm text-red-500">
          {error ?? "Product not found"}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-tims-bg px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-tims-border bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-tims-muted">Inventory</p>
        <h1 className="text-3xl font-semibold text-tims-text">Edit product</h1>
        <p className="text-sm text-tims-muted">Update product details below.</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-500">
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
            className="w-full rounded-xl bg-tims-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-tims-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Update product"}
          </button>
        </form>
      </div>
    </main>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string };

function InputField({ label, name, className, ...rest }: FieldProps) {
  return (
    <label className="text-xs font-medium text-tims-muted">
      {label}
      <input
        {...rest}
        name={name}
        className={`mt-1 w-full rounded-2xl border border-tims-border bg-white px-3 py-2 text-sm text-tims-text focus:border-tims-accent focus:outline-none ${className ?? ""}`}
      />
    </label>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string };

function TextareaField({ label, name, className, ...rest }: TextareaProps) {
  return (
    <label className="text-xs font-medium text-tims-muted">
      {label}
      <textarea
        {...rest}
        name={name}
        className={`mt-1 w-full rounded-2xl border border-tims-border bg-white px-3 py-2 text-sm text-tims-text focus:border-tims-accent focus:outline-none ${className ?? ""}`}
      />
    </label>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { label: string };

function SelectField({ label, name, className, children, ...rest }: SelectProps) {
  return (
    <label className="text-xs font-medium text-tims-muted">
      {label}
      <select
        {...rest}
        name={name}
        className={`mt-1 w-full rounded-2xl border border-tims-border bg-white px-3 py-2 text-sm text-tims-text focus:border-tims-accent focus:outline-none ${className ?? ""}`}
      >
        {children}
      </select>
    </label>
  );
}
