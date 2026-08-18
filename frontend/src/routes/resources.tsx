import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { INCIDENTS, RESOURCES } from "@/lib/sahay/data";
import type { Agency, ResourceStatus, ResourceType } from "@/lib/sahay/types";
import { resourceIcon, resourceStatusLabel } from "@/lib/sahay/utils";
import { SectionTitle } from "@/components/sahay/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TYPES: ResourceType[] = [
  "BOAT",
  "AMBULANCE",
  "FIRE_TRUCK",
  "RESCUE_VEHICLE",
  "DRONE",
  "HELICOPTER",
  "PERSONNEL",
];
const STATUSES: ResourceStatus[] = ["AVAILABLE", "EN_ROUTE", "ON_SCENE", "OFFLINE", "MAINTENANCE"];
const AGENCIES: Agency[] = ["NDRF", "SDRF", "POLICE", "FIRE", "MEDICAL"];

const statusToken: Record<ResourceStatus, string> = {
  AVAILABLE: "low",
  EN_ROUTE: "high",
  ON_SCENE: "critical",
  OFFLINE: "muted-foreground",
  MAINTENANCE: "medium",
};

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resource Center — SAHAY" },
      {
        name: "description",
        content:
          "Track boats, ambulances, fire tenders, drones, helicopters and personnel by agency and readiness, with AI dispatch recommendations.",
      },
      { property: "og:title", content: "Resource Center — SAHAY" },
      {
        property: "og:description",
        content: "Fleet readiness by type, agency and status with AI-recommended deployments.",
      },
    ],
  }),
  component: ResourceCenter,
});

function ResourceCenter() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ResourceType | "ALL">("ALL");
  const [status, setStatus] = useState<ResourceStatus | "ALL">("ALL");
  const [agency, setAgency] = useState<Agency | "ALL">("ALL");
  const [selected, setSelected] = useState<string[]>([]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESOURCES.filter(
      (r) =>
        (type === "ALL" || r.type === type) &&
        (status === "ALL" || r.status === status) &&
        (agency === "ALL" || r.agency === agency) &&
        (!q || `${r.id} ${r.name} ${r.base}`.toLowerCase().includes(q)),
    );
  }, [query, type, status, agency]);

  const critical = INCIDENTS.find((i) => i.severity === "CRITICAL")!;
  const recommended = RESOURCES.filter((r) => r.status === "AVAILABLE").slice(0, 3);

  const dispatch = (ids: string[]) => {
    if (ids.length === 0) {
      toast.error("Select at least one unit to dispatch");
      return;
    }
    toast.success(`${ids.length} unit(s) dispatched to ${critical.id}`, {
      description: `${critical.location.address}, ${critical.location.district} · status set to EN-ROUTE`,
    });
    setSelected([]);
  };

  return (
    <div className="space-y-4">
      <div className="panel p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl leading-none">Resource Center</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {results.length} of {RESOURCES.length} units · segregated by type, agency and readiness
            </p>
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search units or bases"
            aria-label="Search resources"
            className="w-full sm:w-64"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Pill active={type === "ALL"} onClick={() => setType("ALL")} label="ALL TYPES" />
          {TYPES.map((t) => (
            <Pill
              key={t}
              active={type === t}
              onClick={() => setType(t)}
              label={`${resourceIcon[t]} ${t.replace("_", " ")}`}
            />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Pill active={status === "ALL"} onClick={() => setStatus("ALL")} label="ALL STATUS" />
          {STATUSES.map((s) => (
            <Pill
              key={s}
              active={status === s}
              onClick={() => setStatus(s)}
              label={resourceStatusLabel[s]}
              token={statusToken[s]}
            />
          ))}
          <span className="mx-1 w-px bg-border" />
          <Pill active={agency === "ALL"} onClick={() => setAgency("ALL")} label="ALL AGENCIES" />
          {AGENCIES.map((a) => (
            <Pill key={a} active={agency === a} onClick={() => setAgency(a)} label={a} />
          ))}
        </div>
      </div>

      <section className="panel p-4">
        <SectionTitle hint={`For ${critical.id} · ${critical.type} · ${critical.location.district}`}>
          AI deployment recommendation
        </SectionTitle>
        <ul className="grid gap-2 sm:grid-cols-3">
          {recommended.map((r) => (
            <li key={r.id} className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm">
              <p className="font-semibold">
                {resourceIcon[r.type]} {r.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {r.distanceKm} km away · ETA {r.etaMinutes} min · {r.agency}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Chosen for shortest access route and matching capability profile.
              </p>
            </li>
          ))}
        </ul>
        <Button className="mt-3" onClick={() => dispatch(recommended.map((r) => r.id))}>
          Accept recommendation and dispatch
        </Button>
      </section>

      <section className="panel p-4">
        <SectionTitle
          hint="Select units then dispatch"
          action={
            <Button variant="secondary" onClick={() => dispatch(selected)}>
              Dispatch selected ({selected.length})
            </Button>
          }
        >
          Fleet
        </SectionTitle>
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((r) => {
            const isSelected = selected.includes(r.id);
            return (
              <li key={r.id}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() =>
                    setSelected((prev) =>
                      prev.includes(r.id) ? prev.filter((x) => x !== r.id) : [...prev, r.id],
                    )
                  }
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-colors",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg" aria-hidden>
                      {resourceIcon[r.type]}
                    </span>
                    <span className="text-sm font-semibold">{r.name}</span>
                    <span
                      className="ml-auto rounded-sm px-1.5 py-0.5 font-mono text-[10px] tracking-wider uppercase"
                      style={{
                        color: `var(--color-${statusToken[r.status]})`,
                        backgroundColor: `color-mix(in oklch, var(--color-${statusToken[r.status]}) 16%, transparent)`,
                      }}
                    >
                      {resourceStatusLabel[r.status]}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {r.agency} · {r.base}
                  </p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    cap {r.capacity} · {r.distanceKm} km · ETA {r.etaMinutes}m
                    {r.deployedTo ? ` · → ${r.deployedTo}` : ""}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Pill({
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
        "rounded-full border px-2.5 py-1 text-[11px]",
        active ? "border-transparent font-semibold" : "border-border text-muted-foreground",
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
