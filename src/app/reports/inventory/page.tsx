'use client';

import Link from "next/link";
import useSWR from "swr";
import { useMemo, useState } from "react";
import { Bell, Download, Package } from "lucide-react";
import { NexusBlock } from "@/components/NexusBlock";
import SummaryCard from "@/components/SummaryCard";
import { StatusPill } from "@/components/StatusPill";
import type { Product } from "@/types/inventory";

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

type CategoryCount = { category: string; count: number };

const getPayloadError = (payload: unknown): string | undefined => {
  if (payload && typeof payload === "object" && "error" in payload) {
    const value = (payload as Record<string, unknown>).error;
    if (typeof value === "string") return value;
  }
  return undefined;
};

const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);
  const payload: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(getPayloadError(payload) ?? `Request failed: ${response.status}`);
  }
  return payload as T;
};

const buildQueryString = (filters: { category?: string; from?: string; to?: string }) => {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  const query = params.toString();
  return query ? `?${query}` : "";
};

export default function InventoryReportPage() {
  const [category, setCategory] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const queryString = useMemo(
    () =>
      buildQueryString({
        category: category || undefined,
        from: from || undefined,
        to: to || undefined,
      }),
    [category, from, to],
  );

  const { data: categories = [] } = useSWR<CategoryCount[]>("/api/analytics/categories", fetcher);
  const { data: products = [], isLoading, error } = useSWR<Product[]>(`/api/products${queryString}`, fetcher);

  const totalUnits = products.reduce((sum, product) => sum + (product.remaining ?? 0), 0);
  const lowStockCount = products.filter((product) => product.remaining <= product.minStock).length;
  const criticalCount = products.filter((product) => product.remaining <= 0).length;

  const downloadPdf = () => {
    window.location.href = `/api/reports/inventory/pdf${queryString}`;
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
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-primary-muted">Category</label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-1 w-56 rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm text-primary focus-ring"
              >
                <option value="">All categories</option>
                {categories.map((item) => (
                  <option key={item.category} value={item.category}>
                    {item.category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-primary-muted">From</label>
              <input
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="mt-1 w-40 rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm text-primary focus-ring"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-primary-muted">To</label>
              <input
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className="mt-1 w-40 rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm text-primary focus-ring"
              />
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
          </div>
        </NexusBlock>

        <NexusBlock className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-widest text-primary-muted">Summary</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard icon={Package} label="Total products" value={products.length} />
            <SummaryCard icon={Bell} label="Low-stock items" value={lowStockCount} />
            <SummaryCard icon={Bell} label="Out of stock" value={criticalCount} />
          </div>
          <div className="mt-4 text-sm text-primary-muted">
            Total remaining units: <span className="font-semibold text-primary">{totalUnits.toLocaleString()}</span>
          </div>
          {(category || from || to) && (
            <div className="mt-3 text-sm text-primary-muted">
              Filters:{" "}
              <span className="font-semibold text-primary">
                {category || "All categories"} · {from || "Any"} - {to || "Any"}
              </span>
            </div>
          )}
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
