'use client';

import Link from "next/link";
import { NexusBlock } from "@/components/NexusBlock";
import { StatusPill } from "@/components/StatusPill";
import { useLowStockAlerts } from "@/hooks/useLowStockAlerts";

export default function AlertsPage() {
  const { alerts, totalCount, criticalCount, warningCount, isLoading, error } = useLowStockAlerts();

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <NexusBlock className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-widest text-primary-muted">Alerts</p>
          <h1 className="text-3xl font-semibold text-primary">Low-stock alerts</h1>
          <p className="mt-1 text-sm text-primary-muted">
            These items are at or below their minimum stock threshold and should be restocked soon.
          </p>

          {!isLoading && !error && totalCount > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-primary-muted">
              <span className="font-medium text-primary">{totalCount}</span> total
              <span aria-hidden>•</span>
              <span className="font-medium text-primary">{criticalCount}</span> out of stock
              <span aria-hidden>•</span>
              <span className="font-medium text-primary">{warningCount}</span> low stock
            </div>
          )}
        </NexusBlock>

        {error && (
          <NexusBlock className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error.message}
          </NexusBlock>
        )}

        <NexusBlock className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 text-sm text-primary-muted">Loading alerts...</div>
          ) : totalCount === 0 ? (
            <div className="p-6 text-sm text-primary-muted">All stock levels are healthy.</div>
          ) : (
            <table className="nexus-table min-w-[860px]">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Code</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Remaining / Min</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id} className="text-sm">
                    <td>
                      <StatusPill tone={alert.status === "critical" ? "critical" : "warning"}>
                        {alert.status === "critical" ? "Out of stock" : "Low stock"}
                      </StatusPill>
                    </td>
                    <td className="font-semibold">{alert.code}</td>
                    <td className="font-medium text-primary">{alert.name}</td>
                    <td className="text-primary-muted">{alert.category}</td>
                    <td className="font-semibold">
                      {alert.remaining} / {alert.minStock}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/inventory/${alert.id}`}
                        className="rounded-full border border-border-subtle px-3 py-1 text-xs font-semibold text-brand transition hover:border-brand hover:bg-brand hover:text-white"
                      >
                        Edit
                      </Link>
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

