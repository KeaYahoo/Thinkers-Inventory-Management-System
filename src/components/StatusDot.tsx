interface StatusDotProps {
  tone: "success" | "warning" | "critical";
  className?: string;
}

const toneClasses: Record<StatusDotProps["tone"], string> = {
  success: "bg-status-success",
  warning: "bg-status-warning",
  critical: "bg-status-critical",
};

export function StatusDot({ tone, className = "" }: StatusDotProps) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${toneClasses[tone]} ${className}`.trim()}
      aria-hidden="true"
    />
  );
}

