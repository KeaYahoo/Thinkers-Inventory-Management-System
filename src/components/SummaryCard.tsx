"use client";

import { ComponentType } from "react";

type SummaryCardProps = {
  icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  label: string;
  value: number;
};

export default function SummaryCard({ icon: Icon, label, value }: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-brand-light p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold text-primary">{value.toLocaleString()}</div>
          <div className="mt-1 text-xs uppercase tracking-widest text-primary-muted">{label}</div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-brand shadow-sm">
          <Icon size={18} aria-hidden />
        </div>
      </div>
    </div>
  );
}

