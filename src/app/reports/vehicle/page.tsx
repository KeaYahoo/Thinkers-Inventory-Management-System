'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { Download, Truck, Package, FileText, Repeat } from "lucide-react";
import { NexusBlock } from "@/components/NexusBlock";
import SummaryCard from "@/components/SummaryCard";
import { useVehicleAnalytics } from "@/hooks/useVehicleAnalytics";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

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

const buildQueryString = (from?: string, to?: string) => {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();
  return query ? `?${query}` : "";
};

export default function VehicleReportPage() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const { vehicles, totals, isLoading, error } = useVehicleAnalytics({
    from: from || undefined,
    to: to || undefined,
  });

  const downloadHref = useMemo(() => `/api/reports/vehicle/pdf${buildQueryString(from, to)}`, [from, to]);

  const chartData = useMemo(() => {
    const brand = getCssVar("--color-brand", "#D10000");
    return {
      labels: vehicles.map((vehicle) => vehicle.regNumber),
      datasets: [
        {
          label: "On-road units",
          data: vehicles.map((vehicle) => vehicle.onRoadUnits),
          backgroundColor: withAlpha(brand, 0.2),
          borderColor: brand,
          borderWidth: 1,
          borderRadius: 8,
          maxBarThickness: 42,
        },
      ],
    };
  }, [vehicles]);

  const chartOptions = useMemo(() => {
    const borderSubtle = getCssVar("--color-border-subtle", "#E2E8F0");
    const primaryMuted = getCssVar("--color-primary-muted", "#64748B");
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<"bar">) => `${context.parsed.y} units`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: primaryMuted },
          border: { display: false },
        },
        y: {
          beginAtZero: true,
          grid: { color: withAlpha(borderSubtle, 0.7) },
          ticks: { color: primaryMuted },
          border: { display: false },
        },
      },
    };
  }, []);

  const totalsSafe = totals ?? {
    totalVehicles: 0,
    totalOnRoadUnits: 0,
    totalLogs: 0,
    totalTransfers: 0,
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <NexusBlock className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div className="min-w-[220px]">
            <p className="text-xs uppercase tracking-widest text-primary-muted">Reports</p>
            <h1 className="text-3xl font-semibold text-primary">Vehicle report</h1>
            <p className="mt-1 text-sm text-primary-muted">On-road stock totals and activity by vehicle.</p>
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

            <button
              type="button"
              onClick={() => {
                window.location.href = downloadHref;
              }}
              aria-label="Download vehicle report PDF"
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
            <SummaryCard icon={Truck} label="Total vehicles" value={totalsSafe.totalVehicles} />
            <SummaryCard icon={Package} label="On-road units" value={totalsSafe.totalOnRoadUnits} />
            <SummaryCard icon={FileText} label="Log entries" value={totalsSafe.totalLogs} />
            <SummaryCard icon={Repeat} label="Transfers" value={totalsSafe.totalTransfers} />
          </div>
          {(from || to) && (
            <div className="mt-4 text-sm text-primary-muted">
              Filters:{" "}
              <span className="font-semibold text-primary">
                {from || "Any"} - {to || "Any"}
              </span>
            </div>
          )}
        </NexusBlock>

        {error && (
          <NexusBlock className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error.message}
          </NexusBlock>
        )}

        <NexusBlock className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-widest text-primary-muted">On-road stock by vehicle</p>
          <div className="mt-4 h-72">
            {isLoading ? (
              <div className="h-full animate-pulse rounded-xl bg-brand-light" />
            ) : vehicles.length ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <p className="text-sm text-primary-muted">No vehicles found.</p>
            )}
          </div>
        </NexusBlock>

        <NexusBlock className="overflow-x-auto">
          <table className="nexus-table min-w-[820px]">
            <thead>
              <tr>
                <th>Registration</th>
                <th>Description</th>
                <th className="text-right">On-road units</th>
                <th className="text-right">Logs</th>
                <th className="text-right">Transfers</th>
                <th>Actions</th>
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
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="text-sm">
                    <td className="font-semibold">{vehicle.regNumber}</td>
                    <td className="text-primary-muted">{vehicle.description || "—"}</td>
                    <td className="text-right font-semibold">{vehicle.onRoadUnits.toLocaleString()}</td>
                    <td className="text-right font-semibold">{vehicle.logCount.toLocaleString()}</td>
                    <td className="text-right font-semibold">{vehicle.transferCount.toLocaleString()}</td>
                    <td>
                      <Link
                        href={`/vehicles/${vehicle.id}/logs`}
                        className="text-sm font-semibold text-brand underline"
                      >
                        View logs
                      </Link>
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

