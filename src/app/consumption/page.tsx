'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConsumptionTable } from "@/components/ConsumptionTable";
import { NexusBlock } from "@/components/NexusBlock";
import { useConsumption } from "@/hooks/useConsumption";
import { useUI } from "@/context/UIContext";

export default function ConsumptionPage() {
  const router = useRouter();
  const { consumption, isLoading, error, deleteConsumption } = useConsumption();
  const { showToast } = useUI();

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Delete this log entry?");
    if (!confirmed) return;

    try {
      await deleteConsumption(id);
      showToast("Consumption entry deleted", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete entry", "critical");
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/consumption/${id}`);
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <NexusBlock className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary-muted">Operational usage</p>
            <h1 className="text-3xl font-semibold text-primary">Consumption</h1>
          </div>
          <Link
            href="/consumption/new"
            className="btn-brand focus-ring inline-flex items-center gap-2"
          >
            + New Entry
          </Link>
        </NexusBlock>
        {error && (
          <NexusBlock className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error.message}
          </NexusBlock>
        )}
        <ConsumptionTable records={consumption} loading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </main>
  );
}
