'use client';

import Link from "next/link";
import { FileText, Download } from "lucide-react";
import { NexusBlock } from "@/components/NexusBlock";
import { useLowStockAlerts } from "@/hooks/useLowStockAlerts";
import { useProducts } from "@/hooks/useProducts";
import { useTransfers } from "@/hooks/useTransfers";
import { useVehicles } from "@/hooks/useVehicles";

type ReportCardProps = {
  title: string;
  description: string;
  viewHref?: string;
  downloadHref?: string;
  disabled?: boolean;
};

function ReportCard({ title, description, viewHref, downloadHref, disabled }: ReportCardProps) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-primary">{title}</h2>
          <p className="mt-1 text-sm text-primary-muted">{description}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-brand shadow-sm">
          <FileText size={18} aria-hidden />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {viewHref ? (
          <Link
            href={viewHref}
            aria-label={`View ${title}`}
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
              disabled
                ? "cursor-not-allowed border-border-subtle text-primary-muted opacity-60"
                : "border-border-subtle text-primary hover:bg-canvas"
            }`}
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled ? "true" : undefined}
          >
            View report
          </Link>
        ) : null}

        {downloadHref ? (
          <a
            href={downloadHref}
            aria-label={`Download ${title} as PDF`}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
              disabled
                ? "cursor-not-allowed border-border-subtle text-primary-muted opacity-60"
                : "border-brand text-brand hover:bg-brand hover:text-white"
            }`}
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled ? "true" : undefined}
          >
            <Download size={14} aria-hidden />
            Download PDF
          </a>
        ) : null}

        {disabled ? (
          <span className="rounded-full bg-canvas px-3 py-2 text-xs font-semibold text-primary-muted">
            Coming soon
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function ReportsIndexPage() {
  const { products } = useProducts();
  const { transfers } = useTransfers();
  const { vehicles } = useVehicles();
  const { totalCount } = useLowStockAlerts();

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <NexusBlock className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-widest text-primary-muted">Reports</p>
          <h1 className="mt-1 text-3xl font-semibold text-primary">Reporting</h1>
          <p className="mt-2 text-sm text-primary-muted">
            Generate on-screen and downloadable PDFs for inventory and operations.
          </p>

          <div className="mt-4 text-sm text-primary-muted">
            <span className="font-semibold text-primary">{products.length}</span> products
            <span aria-hidden> • </span>
            <span className="font-semibold text-primary">{totalCount}</span> low-stock alerts
            <span aria-hidden> • </span>
            <span className="font-semibold text-primary">{vehicles.length}</span> vehicles
            <span aria-hidden> • </span>
            <span className="font-semibold text-primary">{transfers.length}</span> transfers
          </div>
        </NexusBlock>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ReportCard
            title="Inventory Report"
            description="Detailed breakdown of products in stock, status and key metrics."
            viewHref="/reports/inventory"
            downloadHref="/api/reports/inventory/pdf"
          />
          <ReportCard
            title="Vehicle Report"
            description="Stock and activity by vehicle (logs, on-road inventory)."
            disabled
          />
          <ReportCard
            title="Consumption Report"
            description="Usage analysis by type, consumer, and time period."
            disabled
          />
        </div>
      </div>
    </main>
  );
}

