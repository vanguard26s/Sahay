import { Link } from "@tanstack/react-router";
import type { Incident } from "@/lib/sahay/types";
import { timeAgo, typeIcon, typeToken, compactNumber } from "@/lib/sahay/utils";
import { ConfidenceMeter, SeverityBadge, SourceBadge, StatusChip } from "./bits";

export function IncidentCard({ incident, compact }: { incident: Incident; compact?: boolean }) {
  const token = typeToken[incident.type];
  const uniqueSources = Array.from(new Set(incident.sources.map((s) => s.type)));

  return (
    <Link
      to="/incidents/$incidentId"
      params={{ incidentId: incident.id }}
      className="group animate-rise block rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/50 hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-md text-lg"
          style={{ backgroundColor: `color-mix(in oklch, var(--color-${token}) 18%, transparent)` }}
          aria-hidden
        >
          {typeIcon[incident.type]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-primary">{incident.id}</span>
            <SeverityBadge severity={incident.severity} />
            <StatusChip status={incident.status} />
            <span className="ml-auto font-mono text-[11px] text-muted-foreground">
              {timeAgo(incident.minutesAgo)}
            </span>
          </div>
          <p className="mt-1.5 truncate text-sm font-semibold">{incident.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {incident.location.address}, {incident.location.district}, {incident.location.state}
            {incident.affectedPopulation > 0 && ` · ${compactNumber(incident.affectedPopulation)} affected`}
          </p>
          {!compact && (
            <>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {uniqueSources.map((s) => (
                  <SourceBadge key={s} type={s} />
                ))}
                <span className="font-mono text-[11px] text-muted-foreground">
                  {incident.sources.length} signals correlated
                </span>
              </div>
              <div className="mt-2 max-w-56">
                <ConfidenceMeter value={incident.confidence} />
              </div>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
