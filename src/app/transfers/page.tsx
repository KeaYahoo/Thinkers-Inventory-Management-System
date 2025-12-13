'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { NexusBlock } from "@/components/NexusBlock";
import { StatusPill } from "@/components/StatusPill";
import { useTransfers } from "@/hooks/useTransfers";

const formatDate = (value: string) => new Date(value).toLocaleDateString();

export default function TransfersPage() {
  const router = useRouter();
  const { transfers, isLoading, error } = useTransfers();

  const handleView = (id: number) => {
    router.push(`/transfers/${id}`);
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <NexusBlock className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary-muted">Operations</p>
            <h1 className="text-3xl font-semibold text-primary">Transfers</h1>
            <p className="mt-1 text-sm text-primary-muted">Move stock between warehouse and vehicles.</p>
          </div>
          <Link href="/transfers/new" className="btn-brand focus-ring inline-flex items-center gap-2">
            + New Transfer
          </Link>
        </NexusBlock>

        {error && (
          <NexusBlock className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error.message}
          </NexusBlock>
        )}

        <NexusBlock className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 text-sm text-primary-muted">Loading transfers...</div>
          ) : transfers.length === 0 ? (
            <div className="p-6 text-sm text-primary-muted">
              No transfers yet.{" "}
              <Link href="/transfers/new" className="text-brand underline">
                Create one
              </Link>
              .
            </div>
          ) : (
            <table className="nexus-table min-w-[980px]">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Direction</th>
                  <th>Product</th>
                  <th>Vehicle</th>
                  <th>Quantity</th>
                  <th>Notes</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((transfer) => {
                  const isToVehicle = transfer.direction === "TO_VEHICLE";
                  return (
                    <tr key={transfer.id} className="text-sm">
                      <td>{formatDate(transfer.date)}</td>
                      <td>
                        <StatusPill tone={isToVehicle ? "success" : "warning"}>
                          {isToVehicle ? "To vehicle" : "From vehicle"}
                        </StatusPill>
                      </td>
                      <td>
                        <div className="font-medium text-primary">
                          {transfer.product ? `${transfer.product.code} — ${transfer.product.name}` : `#${transfer.productId}`}
                        </div>
                        {transfer.product?.category && (
                          <div className="text-xs text-primary-muted">{transfer.product.category}</div>
                        )}
                      </td>
                      <td className="text-primary-muted">
                        {transfer.vehicle?.regNumber ?? "Warehouse"}
                      </td>
                      <td className="font-semibold">{transfer.quantity.toLocaleString()}</td>
                      <td className="text-primary-muted">{transfer.notes ?? "—"}</td>
                      <td className="text-right">
                        <button
                          type="button"
                          onClick={() => handleView(transfer.id)}
                          className="rounded-full border border-border-subtle px-3 py-1 text-xs font-semibold text-primary transition hover:bg-canvas"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </NexusBlock>
      </div>
    </main>
  );
}

