'use client';

import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  type TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

type TrendPoint = {
  date: string;
  remainingStock: number;
};

const withAlpha = (hex: string, alpha: number) => {
  const cleaned = hex.replace("#", "").trim();
  if (cleaned.length !== 6) return hex;
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getCssVar = (name: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

export function InventoryTrendChart() {
  const [series, setSeries] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/analytics/trends?days=14");
        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload.error ?? "Failed to fetch trends");
        }
        const data = (await response.json()) as TrendPoint[];
        setSeries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load trends");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartData = useMemo(() => {
    const brand = getCssVar("--color-brand", "#0284c7");
    const labels = series.map((point) =>
      new Date(point.date).toLocaleDateString("en-ZA", { month: "short", day: "numeric" }),
    );
    return {
      labels,
      datasets: [
        {
          data: series.map((point) => point.remainingStock),
          borderColor: brand,
          backgroundColor: withAlpha(brand, 0.12),
          fill: true,
          tension: 0.35,
          pointRadius: 2,
          pointHoverRadius: 4,
        },
      ],
    };
  }, [series]);

  const options = useMemo(() => {
    const borderSubtle = getCssVar("--color-border-subtle", "#e2e8f0");
    const primaryMuted = getCssVar("--color-primary-muted", "#64748b");
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<"line">) => `${context.parsed.y} units`,
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

  if (loading) {
    return <p className="text-sm text-primary-muted">Loading trend...</p>;
  }

  if (error) {
    return <p className="text-sm text-status-critical">{error}</p>;
  }

  if (!series.length) {
    return <p className="text-sm text-primary-muted">No trend data yet.</p>;
  }

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
}
