'use client';

import { useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import { NexusBlock } from "@/components/NexusBlock";
import { useProducts } from "@/hooks/useProducts";
import { useVehicle } from "@/hooks/useVehicles";
import { useVehicleStock } from "@/hooks/useVehicleStock";
import { useUI } from "@/context/UIContext";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function NewVehicleStockPage({ params }: PageProps) {
  const { id } = use(params);
  const vehicleId = Number(id);
  const router = useRouter();

  const { vehicle } = useVehicle(id);
  const { products } = useProducts();
  const { stockItems, addVehicleStock } = useVehicleStock(vehicleId);
  const { showToast } = useUI();

  const [form, setForm] = useState({ productId: "", quantity: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingProductIds = useMemo(
    () => new Set(stockItems.map((item) => item.productId)),
    [stockItems],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const productId = Number(form.productId);
      const quantity = Number(form.quantity);

      if (!Number.isInteger(productId) || productId <= 0) {
        throw new Error("Please select a product");
      }
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("Quantity must be a positive integer");
      }
      if (existingProductIds.has(productId)) {
        throw new Error("That product is already on this vehicle");
      }

      await addVehicleStock(vehicleId, { productId, quantity });
      showToast("Stock item added", "success");
      router.push(`/vehicles/${id}/stock`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add stock item");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <NexusBlock className="mx-auto w-full max-w-lg p-6 sm:p-8">
        <p className="text-xs uppercase tracking-widest text-primary-muted">Fleet</p>
        <h1 className="text-3xl font-semibold text-primary">
          {vehicle ? `Add stock to ${vehicle.regNumber}` : "Add vehicle stock"}
        </h1>
        <p className="text-sm text-primary-muted">Assign on-road inventory to a vehicle (no central deductions yet).</p>

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
              className="nexus-input focus-ring mt-1"
              required
            >
              <option value="">Select a product</option>
              {products
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((product) => (
                  <option
                    key={product.id}
                    value={String(product.id)}
                    disabled={existingProductIds.has(product.id)}
                  >
                    {product.name} {product.code ? `(${product.code})` : ""}
                  </option>
                ))}
            </select>
          </label>

          <div className="sm:col-span-2">
            <InputField
              label="Quantity"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              placeholder="e.g. 5"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <button type="submit" disabled={submitting} className="btn-brand focus-ring w-full">
              {submitting ? "Saving..." : "Add stock"}
            </button>
          </div>
        </form>
      </NexusBlock>
    </main>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string };

function InputField({ label, name, className, ...rest }: FieldProps) {
  return (
    <label className="text-xs font-medium text-primary-muted">
      {label}
      <input {...rest} name={name} className={`nexus-input focus-ring mt-1 ${className ?? ""}`} />
    </label>
  );
}
