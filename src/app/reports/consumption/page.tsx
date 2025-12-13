'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, type TooltipItem } from "chart.js";
import { Download, Droplets, Package, Users, Truck } from "lucide-react";
import { NexusBlock } from "@/components/NexusBlock";
import SummaryCard from "@/components/SummaryCard";
import { useConsumptionAnalytics } from "@/hooks/useConsumptionAnalytics";
import { useProducts } from "@/hooks/useProducts";
import { useVehicles } from "@/hooks/useVehicles";

ChartJS.register(ArcElement, Tooltip);

const getCssVar = (name: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

const withAlpha = (hex: string, alpha: number) => {
  const cleaned = hex.replace("#", "").trim();
  if (cleaned.length !== 6) return hex;
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const buildQueryString = (filters: {
  from?: string;
  to?: string;
  productId?: string;
  vehicleId?: string;
}) => {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.productId) params.set("productId", filters.productId);
  if (filters.vehicleId) params.set("vehicleId", filters.vehicleId);
  const query = params.toString();
  return query ? `?${query}` : "";
};

export default function ConsumptionReportPage() {
  const { products, isLoading: productsLoading } = useProducts();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();

  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [productId, setProductId] = useState<string>("");
  const [vehicleId, setVehicleId] = useState<string>("");

  const { totals, byType, byProduct, isLoading, error } = useConsumptionAnalytics({
    from: from || undefined,
    to: to || undefined,
    productId: productId ? Number(productId) : undefined,
    vehicleId: vehicleId ? Number(vehicleId) : undefined,
  });

  const { thinkersQuantity, otherQuantity } = useMemo(() => {
    let thinkers = 0;
    let other = 0;
    for (const entry of byType) {
      const t = entry.type.trim().toLowerCase();
      if (t === "internal") thinkers += entry.quantity;
      else other += entry.quantity;
    }
    return { thinkersQuantity: thinkers, otherQuantity: other };
  }, [byType]);

  const downloadHref = useMemo(
    () =>
      `/api/reports/consumption/pdf${buildQueryString({
        from,
        to,
        productId,
        vehicleId,
      })}`,
    [from, to, productId, vehicleId],
  );

  const chartData = useMemo(() => {
    const brand = getCssVar("--color-brand", "#D10000");
    const muted = getCssVar("--color-primary-muted", "#64748B");
    return {
      labels: ["Thinkers", "Other"],
      datasets: [
        {
          data: [thinkersQuantity, otherQuantity],
          backgroundColor: [withAlpha(brand, 0.85), withAlpha(muted, 0.35)],
          borderColor: [brand, muted],
          borderWidth: 1,
        },
      ],
    };
  }, [thinkersQuantity, otherQuantity]);

  const chartOptions = useMemo(() => {
    const primaryMuted = getCssVar("--color-primary-muted", "#64748B");
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<"doughnut">) =>
              `${context.label}: ${context.parsed.toLocaleString()} units`,
          },
          bodyColor: primaryMuted,
        },
      },
    };
  }, []);

  const totalsSafe = totals ?? { totalEntries: 0, totalQuantity: 0 };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <NexusBlock className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div className="min-w-[240px]">
            <p className="text-xs uppercase tracking-widest text-primary-muted">Reports</p>
            <h1 className="text-3xl font-semibold text-primary">Consumption report</h1>
            <p className="mt-1 text-sm text-primary-muted">
              Usage analysis by product and type (Thinkers vs other).
            </p>
            <div className="mt-3">
              <Link href="/reports" className="text-sm font-semibold text-brand underline">
                Back to reports
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
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
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-primary-muted">Product</label>
              <select
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                disabled={productsLoading}
                className="mt-1 w-56 rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm text-primary focus-ring"
              >
                <option value="">All products</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.code} - {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-primary-muted">Vehicle</label>
              <select
                value={vehicleId}
                onChange={(event) => setVehicleId(event.target.value)}
                disabled={vehiclesLoading}
                className="mt-1 w-44 rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm text-primary focus-ring"
              >
                <option value="">All vehicles</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.regNumber}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                window.location.href = downloadHref;
              }}
              aria-label="Download consumption report PDF"
              className="btn-brand focus-ring inline-flex items-center gap-2"
            >
              <Download size={16} aria-hidden />
              Download PDF
            </button>
          </div>
        </NexusBlock>

        <NexusBlock className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-widest text-primary-muted">Summary</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard icon={Users} label="Entries" value={totalsSafe.totalEntries} />
            <SummaryCard icon={Droplets} label="Total units" value={totalsSafe.totalQuantity} />
            <SummaryCard icon={Package} label="Thinkers units" value={thinkersQuantity} />
            <SummaryCard icon={Truck} label="Other units" value={otherQuantity} />
          </div>
          {(from || to || productId || vehicleId) && (
            <div className="mt-4 text-sm text-primary-muted">
              Active filters:{" "}
              <span className="font-semibold text-primary">
                {from || "Any"} - {to || "Any"}
              </span>
              {productId ? (
                <>
                  {" "}
                  &middot; <span className="font-semibold text-primary">Product #{productId}</span>
                </>
              ) : null}
              {vehicleId ? (
                <>
                  {" "}
                  &middot; <span className="font-semibold text-primary">Vehicle #{vehicleId}</span>
                </>
              ) : null}
            </div>
          )}
        </NexusBlock>

        {error && (
          <NexusBlock className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error.message}
          </NexusBlock>
        )}

        <div className="grid gap-4 lg:grid-cols-5">
          <NexusBlock className="p-6 sm:p-8 lg:col-span-2">
            <p className="text-xs uppercase tracking-widest text-primary-muted">Type distribution</p>
            <div className="mt-4 h-64">
              {isLoading ? (
                <div className="h-full animate-pulse rounded-xl bg-brand-light" />
              ) : totalsSafe.totalEntries ? (
                <Doughnut data={chartData} options={chartOptions} />
              ) : (
                <p className="text-sm text-primary-muted">No consumption records found for this filter.</p>
              )}
            </div>
          </NexusBlock>

          <NexusBlock className="overflow-x-auto lg:col-span-3">
            <table className="nexus-table min-w-[760px]">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th className="text-right">Thinkers</th>
                  <th className="text-right">Other</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              {isLoading ? (
                <tbody>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="py-2">
                        <div className="h-4 w-full rounded bg-brand-light" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody>
                  {byProduct.map((row) => (
                    <tr key={row.productId} className="text-sm">
                      <td className="font-semibold">{row.code}</td>
                      <td>
                        <div className="font-medium text-primary">{row.name}</div>
                        <div className="text-xs text-primary-muted">{row.unit}</div>
                      </td>
                      <td className="text-primary-muted">{row.category}</td>
                      <td className="text-right font-semibold">{row.thinkersQuantity.toLocaleString()}</td>
                      <td className="text-right font-semibold">{row.otherQuantity.toLocaleString()}</td>
                      <td className="text-right font-semibold">{row.totalQuantity.toLocaleString()}</td>
                    </tr>
                  ))}
                  {!byProduct.length ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-sm text-primary-muted">
                        No consumption data for selected filters.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              )}
            </table>
          </NexusBlock>
        </div>
      </div>
    </main>
  );
}
