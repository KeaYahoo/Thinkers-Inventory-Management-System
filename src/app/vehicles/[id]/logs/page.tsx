'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { NexusBlock } from "@/components/NexusBlock";
import { useVehicle } from "@/hooks/useVehicles";
import { useVehicleLogs } from "@/hooks/useVehicleLogs";
import { useUI } from "@/context/UIContext";

type PageProps = {
  params: Promise<{ id: string }>;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value);

export default function VehicleLogsPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const vehicleId = Number(id);
  const { vehicle } = useVehicle(id);
  const { logs, isLoading, error, deleteVehicleLog } = useVehicleLogs(vehicleId);
  const { showToast } = useUI();

  const handleEdit = (logId: number) => {
    router.push(`/vehiclelogs/${logId}`);
  };

  const handleDelete = async (logId: number) => {
    const confirmed = window.confirm("Delete this log entry?");
    if (!confirmed) return;
    try {
      await deleteVehicleLog(logId);
      showToast("Log deleted", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete log", "critical");
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <NexusBlock className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary-muted">Fleet</p>
            <h1 className="text-3xl font-semibold text-primary">
              {vehicle ? `${vehicle.regNumber} logs` : "Vehicle logs"}
            </h1>
          </div>
          <Link href={`/vehicles/${id}/logs/new`} className="btn-brand focus-ring inline-flex items-center gap-2">
            + New Log
          </Link>
        </NexusBlock>

        {error && (
          <NexusBlock className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error.message}
          </NexusBlock>
        )}

        <NexusBlock className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 text-sm text-primary-muted">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="p-6 text-sm text-primary-muted">
              No logs yet.{" "}
              <Link href={`/vehicles/${id}/logs/new`} className="text-brand underline">
                Add one
              </Link>
              .
            </div>
          ) : (
            <table className="nexus-table min-w-[980px]">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Litres</th>
                  <th>Cost</th>
                  <th>Trip details</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="text-sm">
                    <td>{new Date(log.date).toLocaleDateString()}</td>
                    <td>{log.location}</td>
                    <td>{log.liters.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td>{formatMoney(log.cost)}</td>
                    <td className="text-primary-muted">{log.tripDetails ?? "—"}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(log.id)}
                          className="rounded-full border border-border-subtle px-3 py-1 text-xs font-semibold text-brand transition hover:border-brand hover:bg-brand hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(log.id)}
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

