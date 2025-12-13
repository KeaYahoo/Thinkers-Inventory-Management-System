"use client";

import { useEffect, useId, useMemo, useState } from "react";
import type { Product } from "@/types/inventory";

export type ProductFormInput = {
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
  remaining?: number;
  sellingPrice: number;
};

type ProductFormProps = {
  initialData?: Product;
  onSubmit: (values: ProductFormInput) => Promise<void>;
};

const toDateInputValue = (iso: string) => iso.slice(0, 10);

export default function ProductForm({ initialData, onSubmit }: ProductFormProps) {
  const prefix = useId();

  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    category: "",
    stock: "",
    unit: "unit",
    cost: "",
    markup: "",
    minStock: "",
    remaining: "",
    purchaseDate: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialData) return;
    setForm({
      code: initialData.code ?? "",
      name: initialData.name ?? "",
      description: initialData.description ?? "",
      category: initialData.category ?? "",
      stock: String(initialData.stock ?? 0),
      unit: initialData.unit ?? "unit",
      cost: String(initialData.cost ?? 0),
      markup: String(initialData.markup ?? 0),
      minStock: String(initialData.minStock ?? 0),
      remaining: String(initialData.remaining ?? 0),
      purchaseDate: toDateInputValue(initialData.purchaseDate),
    });
  }, [initialData]);

  const numeric = useMemo(() => {
    const stock = Number(form.stock);
    const cost = Number(form.cost);
    const markup = Number(form.markup);
    const minStock = Number(form.minStock);
    const remaining = form.remaining === "" ? undefined : Number(form.remaining);

    const sellingPrice = Number.isFinite(cost) && Number.isFinite(markup) ? cost * (1 + markup / 100) : 0;
    return { stock, cost, markup, minStock, remaining, sellingPrice };
  }, [form]);

  const sellingPriceDisplay = useMemo(() => {
    if (!Number.isFinite(numeric.sellingPrice)) return "";
    return numeric.sellingPrice.toFixed(2);
  }, [numeric.sellingPrice]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): string | null => {
    if (!form.code.trim()) return "Product code is required";
    if (!form.name.trim()) return "Name is required";
    if (!form.description.trim()) return "Description is required";
    if (!form.category.trim()) return "Category is required";
    if (!form.purchaseDate) return "Purchase date is required";

    const fields = [
      { label: "Stock", value: numeric.stock },
      { label: "Cost", value: numeric.cost },
      { label: "Markup", value: numeric.markup },
      { label: "Minimum stock", value: numeric.minStock },
    ];
    for (const field of fields) {
      if (!Number.isFinite(field.value) || field.value < 0) return `${field.label} must be 0 or greater`;
    }
    if (!Number.isInteger(numeric.stock)) return "Stock must be a whole number";
    if (!Number.isInteger(numeric.minStock)) return "Minimum stock must be a whole number";

    if (numeric.remaining !== undefined) {
      if (!Number.isFinite(numeric.remaining) || numeric.remaining < 0) return "Remaining must be 0 or greater";
      if (!Number.isInteger(numeric.remaining)) return "Remaining must be a whole number";
    }

    if (!Number.isFinite(numeric.sellingPrice) || numeric.sellingPrice < 0) return "Selling price must be valid";
    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const validationError = validate();
      if (validationError) throw new Error(validationError);

      const sellingPrice = Number(numeric.sellingPrice.toFixed(2));
      const isCreate = !initialData;

      const remainingProvided =
        isCreate ||
        (numeric.remaining !== undefined && numeric.remaining !== initialData?.remaining);

      const payload: ProductFormInput = {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        stock: numeric.stock,
        unit: form.unit,
        cost: numeric.cost,
        markup: numeric.markup,
        minStock: numeric.minStock,
        purchaseDate: form.purchaseDate,
        sellingPrice,
        ...(remainingProvided
          ? { remaining: isCreate ? numeric.stock : (numeric.remaining ?? initialData?.remaining ?? numeric.stock) }
          : {}),
      };

      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          id={`${prefix}-code`}
          label="Product code"
          name="code"
          value={form.code}
          onChange={handleChange}
          required
        />
        <Field
          id={`${prefix}-name`}
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>

      <TextArea
        id={`${prefix}-description`}
        label="Description"
        name="description"
        value={form.description}
        onChange={handleChange}
        rows={3}
        required
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          id={`${prefix}-category`}
          label="Category"
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        />
        <Select
          id={`${prefix}-unit`}
          label="Unit"
          name="unit"
          value={form.unit}
          onChange={handleChange}
        >
          <option value="unit">Unit</option>
          <option value="L">Litre (L)</option>
          <option value="KG">Kilogram (KG)</option>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          id={`${prefix}-stock`}
          label="Stock"
          name="stock"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          value={form.stock}
          onChange={handleChange}
          required
        />
        <Field
          id={`${prefix}-minStock`}
          label="Minimum stock"
          name="minStock"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          value={form.minStock}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          id={`${prefix}-cost`}
          label="Cost"
          name="cost"
          type="number"
          min={0}
          step={0.01}
          inputMode="decimal"
          value={form.cost}
          onChange={handleChange}
          required
        />
        <Field
          id={`${prefix}-markup`}
          label="Markup (%)"
          name="markup"
          type="number"
          min={0}
          step={0.01}
          inputMode="decimal"
          value={form.markup}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          id={`${prefix}-remaining`}
          label="Remaining (optional)"
          name="remaining"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          value={form.remaining}
          onChange={handleChange}
          placeholder={initialData ? String(initialData.remaining) : "Defaults to stock"}
        />
        <Field
          id={`${prefix}-sellingPrice`}
          label="Selling price"
          name="sellingPrice"
          value={sellingPriceDisplay}
          readOnly
          aria-readonly="true"
        />
      </div>

      <Field
        id={`${prefix}-purchaseDate`}
        label="Purchase date"
        name="purchaseDate"
        type="date"
        value={form.purchaseDate}
        onChange={handleChange}
        required
      />

      <button type="submit" disabled={submitting} className="btn-brand focus-ring w-full">
        {submitting ? "Saving..." : initialData ? "Update product" : "Create product"}
      </button>
    </form>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string };

function Field({ label, id, className, ...rest }: InputProps) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-primary-muted">
        {label}
      </label>
      <input id={id} {...rest} className={`nexus-input focus-ring mt-1 ${className ?? ""}`} />
    </div>
  );
}

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; id: string };

function TextArea({ label, id, className, ...rest }: TextAreaProps) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-primary-muted">
        {label}
      </label>
      <textarea id={id} {...rest} className={`nexus-input focus-ring mt-1 ${className ?? ""}`} />
    </div>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; id: string };

function Select({ label, id, className, children, ...rest }: SelectProps) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-primary-muted">
        {label}
      </label>
      <select id={id} {...rest} className={`nexus-input focus-ring mt-1 ${className ?? ""}`}>
        {children}
      </select>
    </div>
  );
}

