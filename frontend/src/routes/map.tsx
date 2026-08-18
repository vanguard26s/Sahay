import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { INCIDENTS } from "@/lib/sahay/data";
import type { DisasterType, SeverityLevel } from "@/lib/sahay/types";
import { SEVERITY_ORDER, severityToken, typeIcon, typeToken } from "@/lib/sahay/utils";
import { TacticalMap } from "@/components/sahay/TacticalMap";
import { SectionTitle } from "@/components/sahay/bits";
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

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Live Disaster Map — SAHAY" },
      {
        name: "description",
        content:
          "National tactical map of active disaster incidents with severity and type layer filters, impact pulses and unit positions.",
      },
      { property: "og:title", content: "Live Disaster Map — SAHAY" },
      {
        property: "og:description",
        content: "National tactical view of every active incident, filterable by type and severity.",
      },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const [types, setTypes] = useState<DisasterType[]>([]);
  const [severities, setSeverities] = useState<SeverityLevel[]>([]);

  const visible = useMemo(
    () =>
      INCIDENTS.filter(
        (i) =>
          (types.length === 0 || types.includes(i.type)) &&
          (severities.length === 0 || severities.includes(i.severity)),
      ),
    [types, severities],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_17rem]">
      <section className="panel p-4">
        <SectionTitle hint={`${visible.length} incidents plotted · click a marker for detail`}>
          Live disaster map — India
        </SectionTitle>
        <TacticalMap incidents={visible} />
      </section>

      <aside className="panel h-max space-y-4 p-4">
        <div>
          <p className="mb-1.5 text-[11px] tracking-widest text-muted-foreground uppercase">
            Severity layers
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SEVERITY_ORDER.map((s) => (
              <Toggle
                key={s}
                active={severities.includes(s)}
                token={severityToken[s]}
                label={s}
                onClick={() =>
                  setSeverities((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
                }
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] tracking-widest text-muted-foreground uppercase">Type layers</p>
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map((t) => (
              <Toggle
                key={t}
                active={types.includes(t)}
                token={typeToken[t]}
                label={`${typeIcon[t]} ${t}`}
                onClick={() =>
                  setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
                }
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] tracking-widest text-muted-foreground uppercase">Legend</p>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {SEVERITY_ORDER.map((s) => (
              <li key={s} className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: `var(--color-${severityToken[s]})` }}
                />
                {s} · {INCIDENTS.filter((i) => i.severity === s).length} active
              </li>
            ))}
            <li className="pt-1">Pulsing halo = critical, live escalation</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function Toggle({
  active,
  onClick,
  label,
  token,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  token: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md border px-1.5 py-0.5 text-[11px]",
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
