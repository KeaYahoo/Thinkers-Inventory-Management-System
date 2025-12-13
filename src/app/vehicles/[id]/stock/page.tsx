'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { NexusBlock } from "@/components/NexusBlock";
import { useVehicle } from "@/hooks/useVehicles";
import { useVehicleStock } from "@/hooks/useVehicleStock";
import { useUI } from "@/context/UIContext";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function VehicleStockPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const vehicleId = Number(id);
  const { vehicle } = useVehicle(id);
  const { stockItems, isLoading, error, deleteVehicleStock } = useVehicleStock(vehicleId);
  const { showToast } = useUI();

  const handleEdit = (stockId: number) => {
    router.push(`/vehiclestock/${stockId}`);
  };

  const handleDelete = async (stockId: number) => {
    const confirmed = window.confirm("Remove this item from the vehicle stock?");
    if (!confirmed) return;
    try {
      await deleteVehicleStock(stockId);
      showToast("Stock item removed", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to remove stock item", "critical");
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <NexusBlock className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary-muted">Fleet</p>
            <h1 className="text-3xl font-semibold text-primary">
              {vehicle ? `${vehicle.regNumber} stock` : "Vehicle stock"}
            </h1>
            <p className="text-sm text-primary-muted">On-road inventory currently assigned to this vehicle.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/vehicles/${id}/logs`}
              className="rounded-full border border-border-subtle px-4 py-2 text-xs font-semibold text-primary transition hover:bg-canvas"
            >
              View Logs
            </Link>
            <Link href={`/vehicles/${id}/stock/new`} className="btn-brand focus-ring inline-flex items-center gap-2">
              + Add Stock
            </Link>
          </div>
        </NexusBlock>

        {error && (
          <NexusBlock className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error.message}
          </NexusBlock>
        )}

        <NexusBlock className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 text-sm text-primary-muted">Loading stock...</div>
          ) : stockItems.length === 0 ? (
            <div className="p-6 text-sm text-primary-muted">
              No on-road stock yet.{" "}
              <Link href={`/vehicles/${id}/stock/new`} className="text-brand underline">
                Add one
              </Link>
              .
            </div>
          ) : (
            <table className="nexus-table min-w-[860px]">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stockItems.map((item) => (
                  <tr key={item.id} className="text-sm">
                    <td>
                      <div className="font-semibold text-primary">{item.product?.name ?? `Product #${item.productId}`}</div>
                      {item.product?.code && (
                        <div className="text-xs text-primary-muted">{item.product.code}</div>
                      )}
                    </td>
                    <td className="font-semibold">{item.quantity.toLocaleString()}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(item.id)}
                          className="rounded-full border border-border-subtle px-3 py-1 text-xs font-semibold text-brand transition hover:border-brand hover:bg-brand hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-500 hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </NexusBlock>
      </div>
    </main>
  );
}

