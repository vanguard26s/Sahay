import { cn } from "@/lib/utils";
import type { IncidentStatus, SeverityLevel, SourceType } from "@/lib/sahay/types";
import { severityToken, sourceIcon, sourceLabel, sourceToken, statusLabel } from "@/lib/sahay/utils";

export function SeverityBadge({ severity, className }: { severity: SeverityLevel; className?: string }) {
  const token = severityToken[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wider uppercase",
        className,
      )}
      style={{
        color: `var(--color-${token})`,
        borderColor: `color-mix(in oklch, var(--color-${token}) 45%, transparent)`,
        backgroundColor: `color-mix(in oklch, var(--color-${token}) 14%, transparent)`,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: `var(--color-${token})` }} />
      {severity}
    </span>
  );
}

export function SourceBadge({ type, count }: { type: SourceType; count?: number }) {
  const token = sourceToken[type];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium"
      style={{
        color: `var(--color-${token})`,
        borderColor: `color-mix(in oklch, var(--color-${token}) 40%, transparent)`,
        backgroundColor: `color-mix(in oklch, var(--color-${token}) 12%, transparent)`,
      }}
    >
      <span aria-hidden>{sourceIcon[type]}</span>
      {sourceLabel[type]}
      {count !== undefined && <span className="font-mono opacity-80">{count}</span>}
    </span>
  );
}

export function StatusChip({ status }: { status: IncidentStatus }) {
  const map: Record<IncidentStatus, string> = {
    REPORTED: "muted-foreground",
    VERIFIED: "primary",
    EN_ROUTE: "high",
    ON_SCENE: "critical",
    RESOLVED: "resolved",
    FALSE_ALARM: "muted-foreground",
  };
  const token = map[status];
  return (
    <span
      className="rounded-sm px-1.5 py-0.5 font-mono text-[10px] tracking-widest uppercase"
      style={{
        color: `var(--color-${token})`,
        backgroundColor: `color-mix(in oklch, var(--color-${token}) 16%, transparent)`,
      }}
    >
      {statusLabel[status]}
    </span>
  );
}

export function ConfidenceMeter({ value, label = true }: { value: number; label?: boolean }) {
  const token = value >= 85 ? "low" : value >= 60 ? "medium" : value >= 35 ? "high" : "critical";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full min-w-16 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: `var(--color-${token})` }}
        />
      </div>
      {label && (
        <span className="font-mono text-xs tabular-nums" style={{ color: `var(--color-${token})` }}>
          {value}%
        </span>
      )}
    </div>
  );
}

export function SectionTitle({
  children,
  hint,
  action,
}: {
  children: React.ReactNode;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl leading-none">{children}</h2>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {action}
    </div>
  );
}
