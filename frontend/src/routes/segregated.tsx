import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { INCIDENTS } from "@/lib/sahay/data";
import type { Incident, SeverityLevel, SourceType } from "@/lib/sahay/types";
import { SEVERITY_ORDER, severityToken, sourceLabel, sourceToken } from "@/lib/sahay/utils";
import { IncidentCard } from "@/components/sahay/IncidentCard";
import { SectionTitle, SourceBadge } from "@/components/sahay/bits";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Tab = "ALL" | SeverityLevel | SourceType;

export const Route = createFileRoute("/segregated")({
  validateSearch: (search: Record<string, unknown>): { tab?: Tab } => ({
    tab: (search.tab as Tab) ?? undefined,
  }),
  head: () => ({
    meta: [
      { title: "Segregated Intelligence — SAHAY" },
      {
        name: "description",
        content:
          "Every disaster signal segregated by severity band and by source: social, news, government alerts, citizen reports and IoT sensors.",
      },
      { property: "og:title", content: "Segregated Intelligence — SAHAY" },
      {
        property: "og:description",
        content: "Signals organised by severity and source so agencies can act without triage overhead.",
      },
    ],
  }),
  component: Segregated,
});

const SOURCE_TABS: SourceType[] = ["NEWS", "TWITTER", "GOVT_API", "CITIZEN", "IOT"];

function Segregated() {
  const { tab: initial } = Route.useSearch();
  const [tab, setTab] = useState<Tab>(initial ?? "ALL");
  const [query, setQuery] = useState("");

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return INCIDENTS;
    return INCIDENTS.filter((i) =>
      [i.id, i.title, i.type, i.location.district, i.location.state, i.summary]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  const visible = useMemo(() => {
    if (tab === "ALL") return searched;
    if (SEVERITY_ORDER.includes(tab as SeverityLevel)) return searched.filter((i) => i.severity === tab);
    return searched.filter((i) => i.sources.some((s) => s.type === tab));
  }, [searched, tab]);

  const counts = useMemo(() => {
    const bySeverity = Object.fromEntries(
      SEVERITY_ORDER.map((s) => [s, searched.filter((i) => i.severity === s).length]),
    ) as Record<SeverityLevel, number>;
    const bySource = Object.fromEntries(
      SOURCE_TABS.map((s) => [
        s,
        searched.reduce((n, i) => n + i.sources.filter((x) => x.type === s).length, 0),
      ]),
    ) as Record<SourceType, number>;
    return { bySeverity, bySource };
  }, [searched]);

  const totalSignals = searched.reduce((n, i) => n + i.sources.length, 0);

  return (
    <div className="space-y-4">
      <div className="panel p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl leading-none">Segregated Intelligence</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {searched.length} incidents · {totalSignals} correlated signals · organised for direct
              agency consumption
            </p>
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search incidents, districts, types…"
            aria-label="Search segregated intelligence"
            className="w-full sm:w-72"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <TabButton active={tab === "ALL"} onClick={() => setTab("ALL")} label={`ALL ${searched.length}`} />
          {SEVERITY_ORDER.map((s) => (
            <TabButton
              key={s}
              active={tab === s}
              onClick={() => setTab(s)}
              label={`${s} ${counts.bySeverity[s]}`}
              token={severityToken[s]}
            />
          ))}
          {SOURCE_TABS.map((s) => (
            <TabButton
              key={s}
              active={tab === s}
              onClick={() => setTab(s)}
              label={`${sourceLabel[s].toUpperCase()} ${counts.bySource[s]}`}
              token={sourceToken[s]}
            />
          ))}
        </div>
      </div>

      {tab === "ALL" || SEVERITY_ORDER.includes(tab as SeverityLevel) ? (
        <div className="space-y-4">
          {SEVERITY_ORDER.filter((s) => tab === "ALL" || s === tab).map((s) => (
            <SeverityGroup key={s} severity={s} incidents={visible.filter((i) => i.severity === s)} />
          ))}
        </div>
      ) : (
        <SourceGroup source={tab as SourceType} incidents={visible} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  token = "primary",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  token?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 font-mono text-[11px] tracking-wider transition-colors",
        active ? "border-transparent" : "border-border text-muted-foreground hover:text-foreground",
      )}
      style={
        active
          ? {
              color: `var(--color-${token})`,
              backgroundColor: `color-mix(in oklch, var(--color-${token}) 18%, transparent)`,
            }
          : undefined
      }
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function SeverityGroup({ severity, incidents }: { severity: SeverityLevel; incidents: Incident[] }) {
  const [open, setOpen] = useState(severity !== "LOW");
  const token = severityToken[severity];

  return (
    <section className="panel overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50"
      >
        <span className="size-2.5 rounded-full" style={{ backgroundColor: `var(--color-${token})` }} />
        <span className="font-display text-lg tracking-wider" style={{ color: `var(--color-${token})` }}>
          {severity} SEVERITY
        </span>
        <span className="font-mono text-xs text-muted-foreground">{incidents.length} incidents</span>
        <ChevronDown
          className={cn("ml-auto size-4 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open && (
        <div className="space-y-2 border-t border-border p-3">
          {incidents.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">No incidents in this band.</p>
          ) : (
            incidents.map((i) => <IncidentCard key={i.id} incident={i} />)
          )}
        </div>
      )}
    </section>
  );
}

function SourceGroup({ source, incidents }: { source: SourceType; incidents: Incident[] }) {
  const items = incidents.flatMap((i) =>
    i.sources.filter((s) => s.type === source).map((s) => ({ signal: s, incident: i })),
  );

  return (
    <section className="panel p-4">
      <SectionTitle hint={`${items.length} raw signals matched to incidents`}>
        {sourceLabel[source]} stream
      </SectionTitle>
      <ul className="space-y-2">
        {items.map(({ signal, incident }) => (
          <li key={signal.id} className="rounded-lg border border-border bg-card p-3">
            <div className="flex flex-wrap items-center gap-2">
              <SourceBadge type={signal.type} />
              <span className="text-xs text-muted-foreground">
                {signal.outlet ?? signal.author} · trust {signal.credibility}%
              </span>
              <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                {signal.minutesAgo} min ago
              </span>
            </div>
            <p className="mt-2 text-sm">{signal.content}</p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Matches <span className="font-mono text-primary">{incident.id}</span> ·{" "}
              {incident.confidence}% confidence · {incident.location.district}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
