import { ReactNode } from "react";
import { StatusDot } from "./StatusDot";

interface StatusPillProps {
  tone: "success" | "warning" | "critical";
  children: ReactNode;
  className?: string;
}

const pillClasses: Record<StatusPillProps["tone"], string> = {
  success: "bg-status-success/10 text-status-success",
  warning: "bg-status-warning/10 text-status-warning",
  critical: "bg-status-critical/10 text-status-critical",
};

export function StatusPill({ tone, children, className = "" }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${pillClasses[tone]} ${className}`.trim()}
    >
      <StatusDot tone={tone} />
      {children}
    </span>
  );
}

