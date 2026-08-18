import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { INCIDENTS } from "@/lib/sahay/data";
import type { DisasterType, IncidentStatus, SeverityLevel } from "@/lib/sahay/types";
import { SEVERITY_ORDER, severityToken, typeIcon, typeToken } from "@/lib/sahay/utils";
import { IncidentCard } from "@/components/sahay/IncidentCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TYPES: DisasterType[] = [
  "FLOOD",
  "FIRE",
  "CYCLONE",
  "EARTHQUAKE",
  "LANDSLIDE",
  "DROUGHT",
  "INDUSTRIAL",
  "EPIDEMIC",
];

const STATUSES: IncidentStatus[] = [
  "REPORTED",
  "VERIFIED",
  "EN_ROUTE",
  "ON_SCENE",
  "RESOLVED",
  "FALSE_ALARM",
];

export const Route = createFileRoute("/incidents/")({
  head: () => ({
    meta: [
      { title: "Incident Register — SAHAY" },
      {
        name: "description",
        content:
          "Filter and sort every correlated disaster incident by type, severity, status, confidence and geography.",
      },
      { property: "og:title", content: "Incident Register — SAHAY" },
      {
        property: "og:description",
        content: "Every correlated incident, filterable by type, severity, status and confidence.",
      },
    ],
  }),
  component: IncidentList,
});

function IncidentList() {
  const [keyword, setKeyword] = useState("");
  const [types, setTypes] = useState<DisasterType[]>([]);
  const [severities, setSeverities] = useState<SeverityLevel[]>([]);
  const [status, setStatus] = useState<IncidentStatus | "ALL">("ALL");
  const [minConfidence, setMinConfidence] = useState(0);
  const [sortBy, setSortBy] = useState<"timestamp" | "confidence" | "severity">("timestamp");

  const results = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    const rank = (s: SeverityLevel) => SEVERITY_ORDER.indexOf(s);
    return INCIDENTS.filter(
      (i) =>
        (types.length === 0 || types.includes(i.type)) &&
        (severities.length === 0 || severities.includes(i.severity)) &&
        (status === "ALL" || i.status === status) &&
        i.confidence >= minConfidence &&
        (!q ||
          [i.id, i.title, i.location.district, i.location.state, i.summary]
            .join(" ")
            .toLowerCase()
            .includes(q)),
    ).sort((a, b) =>
      sortBy === "confidence"
        ? b.confidence - a.confidence
        : sortBy === "severity"
          ? rank(a.severity) - rank(b.severity) || a.minutesAgo - b.minutesAgo
          : a.minutesAgo - b.minutesAgo,
    );
  }, [keyword, types, severities, status, minConfidence, sortBy]);

  const toggle = <T,>(list: T[], value: T, set: (v: T[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
      <aside className="panel h-max space-y-4 p-4">
        <div>
          <h1 className="text-xl leading-none">Incident register</h1>
          <p className="mt-1 text-xs text-muted-foreground">{results.length} matching incidents</p>
        </div>

        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Keyword or incident ID"
          aria-label="Search incidents"
        />

        <Filter label="Disaster type">
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map((t) => (
              <Chip
                key={t}
                active={types.includes(t)}
                token={typeToken[t]}
                onClick={() => toggle(types, t, setTypes)}
                label={`${typeIcon[t]} ${t}`}
              />
            ))}
          </div>
        </Filter>

        <Filter label="Severity">
          <div className="flex flex-wrap gap-1.5">
            {SEVERITY_ORDER.map((s) => (
              <Chip
                key={s}
                active={severities.includes(s)}
                token={severityToken[s]}
                onClick={() => toggle(severities, s, setSeverities)}
                label={s}
              />
            ))}
          </div>
        </Filter>

        <Filter label="Status">
          <div className="flex flex-wrap gap-1.5">
            <Chip active={status === "ALL"} onClick={() => setStatus("ALL")} label="ALL" />
            {STATUSES.map((s) => (
              <Chip key={s} active={status === s} onClick={() => setStatus(s)} label={s.replace("_", " ")} />
            ))}
          </div>
        </Filter>

        <Filter label={`Minimum confidence: ${minConfidence}%`}>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={minConfidence}
            onChange={(e) => setMinConfidence(Number(e.target.value))}
            aria-label="Minimum confidence"
            className="w-full accent-[var(--color-primary)]"
          />
        </Filter>

        <Filter label="Sort by">
          <div className="flex flex-wrap gap-1.5">
            {(["timestamp", "severity", "confidence"] as const).map((s) => (
              <Chip key={s} active={sortBy === s} onClick={() => setSortBy(s)} label={s.toUpperCase()} />
            ))}
          </div>
        </Filter>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setKeyword("");
            setTypes([]);
            setSeverities([]);
            setStatus("ALL");
            setMinConfidence(0);
          }}
        >
          Reset filters
        </Button>
      </aside>

      <section className="space-y-2">
        {results.length === 0 ? (
          <div className="panel p-10 text-center text-sm text-muted-foreground">
            No incidents match the current filters.
          </div>
        ) : (
          results.map((i) => <IncidentCard key={i.id} incident={i} />)
        )}
      </section>
    </div>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] tracking-widest text-muted-foreground uppercase">{label}</p>
      {children}
    </div>
  );
}

function Chip({
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
      aria-pressed={active}
      className={cn(
        "rounded-md border px-1.5 py-0.5 text-[11px] transition-colors",
        active ? "border-transparent font-semibold" : "border-border text-muted-foreground hover:text-foreground",
      )}
      style={
        active
          ? {
              color: `var(--color-${token})`,
              backgroundColor: `color-mix(in oklch, var(--color-${token}) 18%, transparent)`,
            }
          : undefined
      }
    >
      {label}
    </button>
  );
}
