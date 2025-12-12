'use client';

import { useEffect, useMemo, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, type TooltipItem } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip);

type CategoryPoint = {
  category: string;
  count: number;
};

const getCssVar = (name: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

export function CategoryBreakdownChart() {
  const [categories, setCategories] = useState<CategoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/analytics/categories");
        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload.error ?? "Failed to fetch categories");
        }
        const data = (await response.json()) as CategoryPoint[];
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load categories");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartData = useMemo(() => {
    const palette = [
      getCssVar("--color-brand", "#0284c7"),
      getCssVar("--color-brand-hover", "#0369a1"),
      getCssVar("--color-status-success", "#10b981"),
      getCssVar("--color-status-warning", "#f59e0b"),
      getCssVar("--color-status-critical", "#ef4444"),
      getCssVar("--color-primary-muted", "#64748b"),
    ];

    const labels = categories.map((entry) => entry.category);
    return {
      labels,
      datasets: [
        {
          data: categories.map((entry) => entry.count),
          backgroundColor: labels.map((_, index) => palette[index % palette.length]),
          borderWidth: 0,
        },
      ],
    };
  }, [categories]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "60%",
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<"doughnut">) =>
              `${context.label}: ${context.parsed} item${context.parsed === 1 ? "" : "s"}`,
          },
        },
      },
    }),
    [],
  );

  if (loading) {
    return <p className="text-sm text-primary-muted">Loading categories...</p>;
  }

  if (error) {
    return <p className="text-sm text-status-critical">{error}</p>;
  }

  if (!categories.length) {
    return <p className="text-sm text-primary-muted">No categories yet.</p>;
  }

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
