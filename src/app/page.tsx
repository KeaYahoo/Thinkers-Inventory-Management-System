'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  FileText,
  Package,
  Repeat,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { NexusBlock } from "@/components/NexusBlock";
import SummaryCard from "@/components/SummaryCard";
import { ChartCard } from "@/components/ChartCard";
import { useLowStockAlerts } from "@/hooks/useLowStockAlerts";
import { useProducts } from "@/hooks/useProducts";
import { useTransfers } from "@/hooks/useTransfers";
import { useVehicles } from "@/hooks/useVehicles";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useConsumption } from "@/hooks/useConsumption";
import { useTrends } from "@/hooks/useTrends";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import type { ActivityItem } from "@/hooks/useRecentActivity";

ChartJS.register(ArcElement, Tooltip, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

type CategoryDatum = { category: string; count: number };
type DirectionDatum = { direction: "TO_VEHICLE" | "FROM_VEHICLE"; count: number };
type ConsumptionPoint = { date: string; quantity: number };

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

function TrendChip({ percent }: { percent: number | undefined }) {
  if (percent === undefined || Number.isNaN(percent)) return null;
  const positive = percent >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
        positive ? "bg-status-success/10 text-status-success" : "bg-status-critical/10 text-status-critical"
      }`}
    >
      <Icon size={12} aria-hidden />
      {Math.abs(percent).toFixed(1)}%
    </span>
  );
}

function RecentActivityItem({ item }: { item: ActivityItem }) {
  const iconMap = {
    transfer: Repeat,
    consumption: ShoppingCart,
    log: Truck,
  } as const;
  const Icon = iconMap[item.type];
  const time = new Date(item.timestamp).toLocaleString("en-ZA");
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface px-3 py-2">
      <div className="mt-0.5 rounded-full bg-brand-light p-2 text-brand">
        <Icon size={14} aria-hidden />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-primary">{item.description}</p>
        <p className="text-xs text-primary-muted">{time}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { products } = useProducts();
  const { totalCount, criticalCount } = useLowStockAlerts();
  const { transfers } = useTransfers();
  const { vehicles } = useVehicles();
  const { suppliers } = useSuppliers();
  const { consumption } = useConsumption();
  const { trends } = useTrends();
  const { activity } = useRecentActivity();

  const [categories, setCategories] = useState<CategoryDatum[]>([]);
  const [transferMix, setTransferMix] = useState<DirectionDatum[]>([]);
  const [consumptionTrend, setConsumptionTrend] = useState<ConsumptionPoint[]>([]);

  useEffect(() => {
    fetch("/api/analytics/categories")
      .then((res) => res.json())
      .then((data: CategoryDatum[]) => setCategories(data))
      .catch(() => {});
    fetch("/api/analytics/transfers/direction")
      .then((res) => res.json())
      .then((data: DirectionDatum[]) => setTransferMix(data))
      .catch(() => {});
    fetch("/api/analytics/consumption/time")
      .then((res) => res.json())
      .then((data: ConsumptionPoint[]) => setConsumptionTrend(data))
      .catch(() => {});
  }, []);

  const brand = getCssVar("--color-brand", "#D10000");
  const muted = getCssVar("--color-primary-muted", "#64748B");
  const borderSubtle = getCssVar("--color-border-subtle", "#E2E8F0");

  const categoryChart = useMemo(() => {
    return {
      labels: categories.map((c) => c.category),
      datasets: [
        {
          data: categories.map((c) => c.count),
          backgroundColor: categories.map((_c, idx) =>
            idx % 2 === 0 ? withAlpha(brand, 0.8) : withAlpha(muted, 0.6),
          ),
          borderColor: borderSubtle,
        },
      ],
    };
  }, [categories, brand, muted, borderSubtle]);

  const transferChart = useMemo(() => {
    return {
      labels: transferMix.map((d) => (d.direction === "TO_VEHICLE" ? "To vehicle" : "From vehicle")),
      datasets: [
        {
          data: transferMix.map((d) => d.count),
          backgroundColor: [withAlpha(brand, 0.85), withAlpha(muted, 0.4)],
          borderColor: borderSubtle,
        },
      ],
    };
  }, [transferMix, brand, muted, borderSubtle]);

  const consumptionChart = useMemo(() => {
    const labels = consumptionTrend.map((p) =>
      new Date(p.date).toLocaleDateString("en-ZA", { month: "short", day: "numeric" }),
    );
    return {
      labels,
      datasets: [
        {
          label: "Units",
          data: consumptionTrend.map((p) => p.quantity),
          borderColor: brand,
          backgroundColor: withAlpha(brand, 0.1),
          tension: 0.35,
          pointRadius: 2,
        },
      ],
    };
  }, [consumptionTrend, brand]);

  const lineOptions: ChartOptions<"line"> = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: muted } },
        y: {
          beginAtZero: true,
          grid: { color: withAlpha(borderSubtle, 0.6) },
          ticks: { color: muted },
        },
      },
    };
  }, [muted, borderSubtle]);

  const pieOptions: ChartOptions<"doughnut"> = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom", labels: { color: muted } } },
    };
  }, [muted]);

  const summaryCards = [
    { label: "Products", value: products.length, icon: Package, trend: trends?.products?.percentChange },
    { label: "Low-stock alerts", value: totalCount, icon: Bell, trend: trends?.products?.percentChange },
    { label: "Vehicles", value: vehicles.length, icon: Truck, trend: trends?.vehicles?.percentChange },
    { label: "Transfers", value: transfers.length, icon: Repeat, trend: trends?.transfers?.percentChange },
    { label: "Suppliers", value: suppliers.length, icon: Users, trend: undefined },
    { label: "Consumptions", value: consumption.length, icon: ShoppingCart, trend: trends?.consumption?.percentChange },
  ];

  const quickActions = [
    { href: "/inventory/new", label: "Add product", Icon: Package },
    { href: "/transfers/new", label: "New transfer", Icon: Repeat },
    { href: "/consumption/new", label: "Log consumption", Icon: ShoppingCart },
    { href: "/vehicles/new", label: "New vehicle", Icon: Truck },
    { href: "/reports", label: "View reports", Icon: FileText },
  ];

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {totalCount > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-status-warning/30 bg-status-warning/10 px-4 py-3 text-sm text-primary">
            <div>
              <span className="font-semibold text-status-warning">{totalCount}</span> low-stock items,{" "}
              <span className="font-semibold text-status-critical">{criticalCount}</span> critical.
            </div>
            <Link href="/alerts" className="text-sm font-semibold text-brand underline">
              Review alerts
            </Link>
          </div>
        )}

        <NexusBlock className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-widest text-primary-muted">Overview</p>
          <h1 className="mt-1 text-3xl font-semibold text-primary">Dashboard</h1>
          <p className="mt-2 text-sm text-primary-muted">Quick snapshot across inventory, fleet and operations.</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {summaryCards.map((card) => (
              <div key={card.label} className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-brand-light/30 p-4">
                <div className="space-y-2">
                  <SummaryCard icon={card.icon} label={card.label} value={card.value} />
                </div>
                <TrendChip percent={card.trend} />
              </div>
            ))}
          </div>
        </NexusBlock>

        <div className="grid gap-4 lg:grid-cols-4">
          <NexusBlock className="p-4 sm:p-6 lg:col-span-3">
            <p className="text-xs uppercase tracking-widest text-primary-muted">Quick actions</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {quickActions.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  className="focus-ring inline-flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface px-3 py-4 text-sm font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-float"
                >
                  <span className="rounded-full bg-brand-light px-3 py-2 text-brand">
                    <Icon size={16} aria-hidden />
                  </span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </NexusBlock>

          <NexusBlock className="p-4 sm:p-6">
            <p className="text-xs uppercase tracking-widest text-primary-muted">Recent activity</p>
            <div className="mt-3 space-y-3">
              {activity.length ? (
                activity.map((item, idx) => <RecentActivityItem key={`${item.timestamp}-${idx}`} item={item} />)
              ) : (
                <p className="text-sm text-primary-muted">No activity yet.</p>
              )}
            </div>
          </NexusBlock>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ChartCard
            title="Inventory by category"
            description="Distribution of products by category."
            chart={
              <div className="h-64">
                {categories.length ? <Doughnut data={categoryChart} options={pieOptions} /> : <p className="text-sm text-primary-muted">No category data.</p>}
              </div>
            }
          />
          <ChartCard
            title="Transfers by direction"
            description="To vs from vehicles."
            chart={
              <div className="h-64">
                {transferMix.length ? <Doughnut data={transferChart} options={pieOptions} /> : <p className="text-sm text-primary-muted">No transfer data.</p>}
              </div>
            }
          />
          <ChartCard
            title="Consumption over time"
            description="Last 30 days usage."
            chart={
              <div className="h-64">
                {consumptionTrend.length ? (
                  <Line data={consumptionChart} options={lineOptions} />
                ) : (
                  <p className="text-sm text-primary-muted">No consumption data.</p>
                )}
              </div>
            }
          />
        </div>
      </div>
    </main>
  );
}
