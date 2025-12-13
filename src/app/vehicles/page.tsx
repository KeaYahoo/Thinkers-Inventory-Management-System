'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { NexusBlock } from "@/components/NexusBlock";
import { useVehicles } from "@/hooks/useVehicles";
import { useUI } from "@/context/UIContext";

export default function VehiclesPage() {
  const router = useRouter();
  const { vehicles, isLoading, error, deleteVehicle } = useVehicles();
  const { showToast } = useUI();

  const handleEdit = (id: number) => {
    router.push(`/vehicles/${id}`);
  };

  const handleViewLogs = (id: number) => {
    router.push(`/vehicles/${id}/logs`);
  };

  const handleViewStock = (id: number) => {
    router.push(`/vehicles/${id}/stock`);
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Delete this vehicle and all its logs?");
    if (!confirmed) return;
    try {
      await deleteVehicle(id);
      showToast("Vehicle deleted", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete vehicle", "critical");
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <NexusBlock className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary-muted">Fleet</p>
            <h1 className="text-3xl font-semibold text-primary">Vehicles</h1>
          </div>
          <Link href="/vehicles/new" className="btn-brand focus-ring inline-flex items-center gap-2">
            + New Vehicle
          </Link>
        </NexusBlock>

        {error && (
          <NexusBlock className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error.message}
          </NexusBlock>
        )}

        <NexusBlock className="overflow-x-auto">
          {isLoading ? (
            <table className="nexus-table min-w-[860px]">
              <thead>
                <tr>
                  <th>Reg Number</th>
                  <th>Description</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={3} className="py-2">
                      <div className="h-4 w-full rounded bg-brand-light" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : vehicles.length === 0 ? (
            <div className="p-6 text-sm text-primary-muted">
              No vehicles yet.{" "}
              <Link href="/vehicles/new" className="text-brand underline">
                Add one
              </Link>
              .
            </div>
          ) : (
            <table className="nexus-table min-w-[860px]">
              <thead>
                <tr>
                  <th>Reg Number</th>
                  <th>Description</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="text-sm">
                    <td className="font-semibold">{vehicle.regNumber}</td>
                    <td className="text-primary-muted">{vehicle.description ?? "—"}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewStock(vehicle.id)}
                          className="rounded-full border border-border-subtle px-3 py-1 text-xs font-semibold text-primary transition hover:bg-canvas"
                        >
                          Stock
                        </button>
                        <button
                          type="button"
                          onClick={() => handleViewLogs(vehicle.id)}
                          className="rounded-full border border-border-subtle px-3 py-1 text-xs font-semibold text-primary transition hover:bg-canvas"
                        >
                          View Logs
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(vehicle.id)}
                          className="rounded-full border border-border-subtle px-3 py-1 text-xs font-semibold text-brand transition hover:border-brand hover:bg-brand hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(vehicle.id)}
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

