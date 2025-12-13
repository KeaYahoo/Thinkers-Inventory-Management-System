'use client';

import Link from "next/link";
import { use } from "react";
import { NexusBlock } from "@/components/NexusBlock";
import { StatusPill } from "@/components/StatusPill";
import { useTransfer } from "@/hooks/useTransfers";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function TransferDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const { transfer, isLoading, error } = useTransfer(id);

  if (isLoading) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <NexusBlock className="mx-auto w-full max-w-lg p-6 sm:p-8 text-sm text-primary-muted">
          Loading transfer...
        </NexusBlock>
      </main>
    );
  }

  if (error || !transfer) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-lg nexus-block border-red-200 bg-red-50 p-6 sm:p-8 text-sm text-red-600">
          {error?.message ?? "Transfer not found"}
        </div>
      </main>
    );
  }

  const isToVehicle = transfer.direction === "TO_VEHICLE";

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <NexusBlock className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-widest text-primary-muted">Operations</p>
          <h1 className="text-3xl font-semibold text-primary">Transfer #{transfer.id}</h1>
          <p className="mt-1 text-sm text-primary-muted">Read-only transfer details.</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link href="/transfers" className="text-sm font-semibold text-brand underline">
              Back to transfers
            </Link>
          </div>
        </NexusBlock>

        <NexusBlock className="p-6 sm:p-8">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-widest text-primary-muted">Date</dt>
              <dd className="mt-1 text-sm font-semibold text-primary">{new Date(transfer.date).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-primary-muted">Direction</dt>
              <dd className="mt-1">
                <StatusPill tone={isToVehicle ? "success" : "warning"}>
                  {isToVehicle ? "To vehicle" : "From vehicle"}
                </StatusPill>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-widest text-primary-muted">Product</dt>
              <dd className="mt-1 text-sm font-semibold text-primary">
                {transfer.product ? `${transfer.product.code} — ${transfer.product.name}` : `#${transfer.productId}`}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-primary-muted">Vehicle</dt>
              <dd className="mt-1 text-sm font-semibold text-primary">{transfer.vehicle?.regNumber ?? "Warehouse"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-primary-muted">Quantity</dt>
              <dd className="mt-1 text-sm font-semibold text-primary">{transfer.quantity.toLocaleString()}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-widest text-primary-muted">Notes</dt>
              <dd className="mt-1 text-sm text-primary">{transfer.notes ?? "—"}</dd>
            </div>
          </dl>
        </NexusBlock>
      </div>
    </main>
  );
}

