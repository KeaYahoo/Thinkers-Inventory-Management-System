'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { NexusBlock } from "@/components/NexusBlock";
import { useProducts } from "@/hooks/useProducts";
import { useVehicles } from "@/hooks/useVehicles";
import { useTransfers } from "@/hooks/useTransfers";
import { useUI } from "@/context/UIContext";

type Direction = "TO_VEHICLE" | "FROM_VEHICLE";

type VehicleOption = { id: number; regNumber: string };

export default function NewTransferPage() {
  const router = useRouter();
  const { products } = useProducts();
  const { vehicles } = useVehicles();
  const { createTransfer } = useTransfers();
  const { showToast } = useUI();

  const [direction, setDirection] = useState<Direction>("TO_VEHICLE");
  const [productId, setProductId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const parsedProductId = Number(productId);
  const parsedVehicleId = Number(vehicleId);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === parsedProductId),
    [products, parsedProductId],
  );

  useEffect(() => {
    let active = true;

    const loadVehicles = async () => {
      setLoadingVehicles(true);
      try {
        if (direction !== "FROM_VEHICLE" || !Number.isInteger(parsedProductId) || parsedProductId <= 0) {
          if (active) setVehicleOptions(vehicles.map((v) => ({ id: v.id, regNumber: v.regNumber })));
          return;
        }

        const results = await Promise.all(
          vehicles.map(async (vehicle) => {
            const response = await fetch(`/api/vehicles/${vehicle.id}/stock`);
            const payload: unknown = await response.json().catch(() => ([]));
            if (!response.ok || !Array.isArray(payload)) {
              return null;
            }
            const hasProduct = payload.some(
              (item) =>
                item &&
                typeof item === "object" &&
                "productId" in item &&
                (item as Record<string, unknown>).productId === parsedProductId,
            );
            return hasProduct ? { id: vehicle.id, regNumber: vehicle.regNumber } : null;
          }),
        );

        const filtered = results.filter((value): value is VehicleOption => Boolean(value));
        if (active) setVehicleOptions(filtered);
      } catch {
        if (active) {
          setVehicleOptions(vehicles.map((v) => ({ id: v.id, regNumber: v.regNumber })));
        }
      } finally {
        if (active) setLoadingVehicles(false);
      }
    };

    loadVehicles();

    return () => {
      active = false;
    };
  }, [direction, parsedProductId, vehicles]);

  useEffect(() => {
    if (vehicleId && !vehicleOptions.some((v) => v.id === parsedVehicleId)) {
      setVehicleId("");
    }
  }, [vehicleId, vehicleOptions, parsedVehicleId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const quantityValue = Number(quantity);
      if (!Number.isInteger(parsedProductId) || parsedProductId <= 0) throw new Error("Please select a product");
      if (!Number.isInteger(quantityValue) || quantityValue <= 0) throw new Error("Quantity must be a positive integer");

      if (direction === "TO_VEHICLE" || direction === "FROM_VEHICLE") {
        if (!Number.isInteger(parsedVehicleId) || parsedVehicleId <= 0) throw new Error("Please select a vehicle");
      }

      await createTransfer({
        productId: parsedProductId,
        vehicleId: parsedVehicleId,
        quantity: quantityValue,
        direction,
        notes: notes.trim() || undefined,
      });

      showToast("Transfer created", "success");
      router.push("/transfers");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create transfer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <NexusBlock className="mx-auto max-w-3xl p-6 sm:p-8">
        <p className="text-xs uppercase tracking-widest text-primary-muted">Operations</p>
        <h1 className="text-3xl font-semibold text-primary">New transfer</h1>
        <p className="text-sm text-primary-muted">
          Move inventory between the warehouse and a vehicle. Warehouse stock updates immediately.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="text-xs font-medium text-primary-muted">
            Direction
            <select
              name="direction"
              value={direction}
              onChange={(e) => setDirection(e.target.value as Direction)}
              className="nexus-input focus-ring mt-1"
            >
              <option value="TO_VEHICLE">To vehicle</option>
              <option value="FROM_VEHICLE">From vehicle</option>
            </select>
          </label>

          <label className="text-xs font-medium text-primary-muted">
            Product
            <select
              name="productId"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="nexus-input focus-ring mt-1"
              required
            >
              <option value="">Select a product</option>
              {products
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((product) => (
                  <option key={product.id} value={String(product.id)}>
                    {product.name} {product.code ? `(${product.code})` : ""}
                  </option>
                ))}
            </select>
          </label>

          <label className="text-xs font-medium text-primary-muted">
            Vehicle
            <select
              name="vehicleId"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="nexus-input focus-ring mt-1"
              required
              disabled={loadingVehicles}
            >
              <option value="">
                {loadingVehicles
                  ? "Loading vehicles..."
                  : direction === "FROM_VEHICLE" && selectedProduct
                    ? "Select a vehicle carrying this product"
                    : "Select a vehicle"}
              </option>
              {vehicleOptions.map((vehicle) => (
                <option key={vehicle.id} value={String(vehicle.id)}>
                  {vehicle.regNumber}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-medium text-primary-muted">
            Quantity
            <input
              name="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="nexus-input focus-ring mt-1"
              placeholder="e.g. 5"
              required
            />
          </label>

          <label className="text-xs font-medium text-primary-muted">
            Notes (optional)
            <textarea
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="nexus-input focus-ring mt-1"
            />
          </label>

          <button type="submit" disabled={submitting} className="btn-brand focus-ring w-full">
            {submitting ? "Saving..." : "Create transfer"}
          </button>
        </form>
      </NexusBlock>
    </main>
  );
}
