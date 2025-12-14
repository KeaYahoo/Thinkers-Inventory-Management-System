"use client";

import { ReactNode } from "react";
import { NexusBlock } from "./NexusBlock";

type ChartCardProps = {
  title: string;
  chart: ReactNode;
  description?: string;
};

export function ChartCard({ title, chart, description }: ChartCardProps) {
  return (
    <NexusBlock className="flex h-full flex-col gap-3 p-4 sm:p-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-primary-muted">{title}</p>
        {description ? <p className="mt-1 text-sm text-primary-muted">{description}</p> : null}
      </div>
      <div className="flex-1">{chart}</div>
    </NexusBlock>
  );
}

