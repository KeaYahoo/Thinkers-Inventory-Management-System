'use client';

import Link from "next/link";
import { Bell, Download, Package, Truck, Repeat } from "lucide-react";
import { NexusBlock } from "@/components/NexusBlock";
import SummaryCard from "@/components/SummaryCard";
import { StatusPill } from "@/components/StatusPill";
import { useLowStockAlerts } from "@/hooks/useLowStockAlerts";
import { useProducts } from "@/hooks/useProducts";
import { useTransfers } from "@/hooks/useTransfers";
import { useVehicles } from "@/hooks/useVehicles";

function getStockTone(remaining: number, minStock: number): "success" | "warning" | "critical" {
  if (remaining <= 0) return "critical";
  if (remaining <= minStock) return "warning";
  return "success";
}

function getStockLabel(remaining: number, minStock: number): string {
  if (remaining <= 0) return "Out of stock";
  if (remaining <= minStock) return "Low stock";
  return "In stock";
}

const currency = (value: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value);

export default function InventoryReportPage() {
  const { products, isLoading, error } = useProducts();
  const { totalCount: lowStockCount, criticalCount } = useLowStockAlerts();
  const { transfers } = useTransfers();
  const { vehicles } = useVehicles();

  const totalUnits = products.reduce((sum, product) => sum + (product.remaining ?? 0), 0);

  const downloadPdf = () => {
    window.location.href = "/api/reports/inventory/pdf";
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <NexusBlock className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary-muted">Reports</p>
            <h1 className="text-3xl font-semibold text-primary">Inventory report</h1>
            <p className="mt-1 text-sm text-primary-muted">
              Full product breakdown with stock status and key metrics.
            </p>
            <div className="mt-3">
              <Link href="/reports" className="text-sm font-semibold text-brand underline">
                Back to reports
              </Link>
            </div>
          </div>
          <button
            type="button"
            onClick={downloadPdf}
            aria-label="Download inventory report PDF"
            className="btn-brand focus-ring inline-flex items-center gap-2"
          >
            <Download size={16} aria-hidden />
            Download PDF
          </button>
        </NexusBlock>

        <NexusBlock className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-widest text-primary-muted">Summary</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryCard icon={Package} label="Total products" value={products.length} />
            <SummaryCard icon={Bell} label="Low-stock items" value={lowStockCount} />
            <SummaryCard icon={Bell} label="Out of stock" value={criticalCount} />
            <SummaryCard icon={Repeat} label="Transfers" value={transfers.length} />
            <SummaryCard icon={Truck} label="Vehicles" value={vehicles.length} />
          </div>
          <div className="mt-4 text-sm text-primary-muted">
            Total remaining units: <span className="font-semibold text-primary">{totalUnits.toLocaleString()}</span>
          </div>
        </NexusBlock>

        {error && (
          <NexusBlock className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error.message}
          </NexusBlock>
        )}

        <NexusBlock className="overflow-x-auto">
          <table className="nexus-table min-w-[980px]">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Remaining / Min</th>
                <th>Cost</th>
                <th>Selling Price</th>
                <th>Status</th>
              </tr>
            </thead>
            {isLoading ? (
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-2">
                      <div className="h-4 w-full rounded bg-brand-light" />
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="text-sm">
                    <td className="font-semibold">{product.code}</td>
                    <td>
                      <div className="font-medium text-primary">{product.name}</div>
                      <div className="text-xs text-primary-muted">{product.description}</div>
                    </td>
                    <td className="text-primary-muted">{product.category}</td>
                    <td className="font-semibold">
                      {product.remaining} / {product.minStock}
                    </td>
                    <td>{currency(product.cost)}</td>
                    <td>{currency(product.sellingPrice)}</td>
                    <td>
                      <StatusPill tone={getStockTone(product.remaining, product.minStock)}>
                        {getStockLabel(product.remaining, product.minStock)}
                      </StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </NexusBlock>
      </div>
    </main>
  );
}

