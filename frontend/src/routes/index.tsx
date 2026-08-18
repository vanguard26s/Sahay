import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";
import { AlertTriangle, FileText, Megaphone, Send } from "lucide-react";
import { INCIDENTS, RESOURCES, SOURCE_MIX } from "@/lib/sahay/data";
import type { DisasterType, SeverityLevel } from "@/lib/sahay/types";
import {
  compactNumber,
  SEVERITY_ORDER,
  severityToken,
  sourceLabel,
  sourceToken,
  typeIcon,
  typeToken,
} from "@/lib/sahay/utils";
import { IncidentCard } from "@/components/sahay/IncidentCard";
import { ConfidenceMeter, SectionTitle } from "@/components/sahay/bits";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SAHAY Command Dashboard — Live Disaster Intelligence" },
      {
        name: "description",
        content:
          "Live command dashboard: active incidents by severity, disaster type mix, source breakdown and resource readiness across India.",
      },
      { property: "og:title", content: "SAHAY Command Dashboard" },
      {
        property: "og:description",
        content: "Active incidents, severity split, source mix and resource readiness at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [typeFilter, setTypeFilter] = useState<DisasterType | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (tick === 1) {
      toast.error("New CRITICAL signal correlated", {
        description: "INC-104 · Flood · Sector 4 Bridge, Ahmedabad · 94% confidence",
      });
    }
  }, [tick]);

  const severityCounts = useMemo(
    () =>
      SEVERITY_ORDER.map((s) => ({
        severity: s,
        count: INCIDENTS.filter((i) => i.severity === s).length,
      })),
    [],
  );

  const typeData = useMemo(() => {
    const map = new Map<DisasterType, number>();
    INCIDENTS.forEach((i) => map.set(i.type, (map.get(i.type) ?? 0) + 1));
    return [...map.entries()].map(([type, value]) => ({ type, value }));
  }, []);

  const feed = useMemo(
    () =>
      [...INCIDENTS]
        .filter((i) => !typeFilter || i.type === typeFilter)
        .sort((a, b) => a.minutesAgo - b.minutesAgo)
        .slice(0, 6),
    [typeFilter],
  );

  const available = RESOURCES.filter((r) => r.status === "AVAILABLE").length;
  const deployed = RESOURCES.filter((r) => r.status === "EN_ROUTE" || r.status === "ON_SCENE").length;
  const affected = INCIDENTS.reduce((sum, i) => sum + i.affectedPopulation, 0);

  return (
    <div className="space-y-4">
      <div className="panel flex flex-wrap items-center gap-3 p-3">
        <h1 className="text-2xl leading-none">Command Dashboard</h1>
        <span className="font-mono text-[11px] text-muted-foreground">
          synced {tick * 5}s ago · {INCIDENTS.length} active incidents · 1,201 raw signals ingested
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          {severityCounts.map(({ severity, count }) => (
            <Link
              key={severity}
              to="/segregated"
              search={{ tab: severity }}
              className="rounded-full border px-3 py-1 font-mono text-xs transition-transform hover:-translate-y-0.5"
              style={{
                color: `var(--color-${severityToken[severity as SeverityLevel]})`,
                borderColor: `color-mix(in oklch, var(--color-${severityToken[severity as SeverityLevel]}) 45%, transparent)`,
              }}
            >
              {severity} {count}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Stat label="Active incidents" value={String(INCIDENTS.length)} sub="across 12 states" />
        <Stat label="Population in envelope" value={compactNumber(affected)} sub="estimated exposure" />
        <Stat label="Avg. verification time" value="2.4 min" sub="target 3 min" tone="low" />
        <Stat label="Resources ready" value={`${available}/${RESOURCES.length}`} sub={`${deployed} deployed`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="panel p-4">
          <SectionTitle hint="Click a slice to filter the feed">Incident type mix</SectionTitle>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={typeData}
                  dataKey="value"
                  nameKey="type"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={2}
                  onClick={(d: { type?: DisasterType }) =>
                    setTypeFilter((prev) => (prev === d.type ? null : (d.type ?? null)))
                  }
                >
                  {typeData.map((d) => (
                    <Cell
                      key={d.type}
                      fill={`var(--color-${typeToken[d.type]})`}
                      opacity={!typeFilter || typeFilter === d.type ? 1 : 0.3}
                      stroke="var(--color-background)"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {typeData.map((d) => (
              <button
                key={d.type}
                type="button"
                onClick={() => setTypeFilter((p) => (p === d.type ? null : d.type))}
                className="rounded-md border border-border px-1.5 py-0.5 text-[11px] hover:bg-secondary"
                style={{ color: `var(--color-${typeToken[d.type]})` }}
              >
                {typeIcon[d.type]} {d.type} {d.value}
              </button>
            ))}
          </div>
        </section>

        <section className="panel p-4 lg:col-span-2">
          <SectionTitle
            hint={typeFilter ? `Filtered by ${typeFilter}` : "Newest correlated incidents first"}
            action={
              <Link to="/incidents" className="text-xs font-semibold text-primary hover:underline">
                View all →
              </Link>
            }
          >
            Live incident feed
          </SectionTitle>
          <div className="space-y-2">
            {feed.map((i) => (
              <IncidentCard key={i.id} incident={i} />
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="panel p-4">
          <SectionTitle hint="Share of raw signals ingested today">Source breakdown</SectionTitle>
          <ul className="space-y-3">
            {SOURCE_MIX.map((s) => (
              <li key={s.source}>
                <div className="mb-1 flex justify-between text-xs">
                  <span style={{ color: `var(--color-${sourceToken[s.source]})` }}>
                    {sourceLabel[s.source]}
                  </span>
                  <span className="font-mono text-muted-foreground">{s.value}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${s.value}%`,
                      backgroundColor: `var(--color-${sourceToken[s.source]})`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel p-4">
          <SectionTitle hint="Fleet readiness by state">Resource summary</SectionTitle>
          <div className="space-y-3 text-sm">
            <Readiness label="Available" value={available} total={RESOURCES.length} token="low" />
            <Readiness label="Deployed" value={deployed} total={RESOURCES.length} token="high" />
            <Readiness
              label="Offline / maintenance"
              value={RESOURCES.length - available - deployed}
              total={RESOURCES.length}
              token="critical"
            />
          </div>
          <Link
            to="/resources"
            className="mt-4 inline-flex text-xs font-semibold text-primary hover:underline"
          >
            Open resource center →
          </Link>
        </section>

        <section className="panel p-4">
          <SectionTitle hint="One-click operator actions">Quick actions</SectionTitle>
          <div className="grid gap-2">
            <Button variant="default" onClick={() => toast.success("Incident draft opened")}>
              <AlertTriangle className="size-4" /> Create incident
            </Button>
            <Button variant="secondary" asChild>
              <Link to="/dispatch">
                <Send className="size-4" /> Dispatch resources
              </Link>
            </Button>
            <Button variant="secondary" onClick={() => toast.success("Public alert queued for approval")}>
              <Megaphone className="size-4" /> Send public alert
            </Button>
            <Button variant="outline" asChild>
              <Link to="/analytics">
                <FileText className="size-4" /> Generate report
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone = "primary",
}: {
  label: string;
  value: string;
  sub: string;
  tone?: string;
}) {
  return (
    <div className="panel p-4">
      <p className="text-[11px] tracking-widest text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 font-display text-3xl" style={{ color: `var(--color-${tone})` }}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function Readiness({
  label,
  value,
  total,
  token,
}: {
  label: string;
  value: number;
  total: number;
  token: string;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span>{label}</span>
        <span className="font-mono text-muted-foreground">
          {value}/{total}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{ width: `${(value / total) * 100}%`, backgroundColor: `var(--color-${token})` }}
        />
      </div>
    </div>
  );
}

export { ConfidenceMeter };
