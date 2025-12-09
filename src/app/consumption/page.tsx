'use client';

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Consumption } from "@/types/inventory";
import { ConsumptionTable } from "@/components/ConsumptionTable";
import { NexusBlock } from "@/components/NexusBlock";
import { NexusBlock } from "@/components/NexusBlock";

export default function ConsumptionPage() {
  const router = useRouter();
  const [records, setRecords] = useState<Consumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConsumption = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/consumption");
      if (!response.ok) {
        throw new Error("Failed to fetch consumption history");
      }
      const data = (await response.json()) as Consumption[];
      setRecords(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load consumption history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConsumption();
  }, [loadConsumption]);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Delete this log entry?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/consumption/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Failed to delete entry");
      }
      await loadConsumption();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete entry");
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
          <NexusBlock className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</NexusBlock>
        )}
        <ConsumptionTable records={records} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </main>
  );
}

