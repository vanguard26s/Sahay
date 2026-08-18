import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { INCIDENTS, RESOURCES } from "@/lib/sahay/data";
import type { IncidentStatus } from "@/lib/sahay/types";
import {
  compactNumber,
  resourceIcon,
  sourceIcon,
  sourceLabel,
  sourceToken,
  statusLabel,
  timeAgo,
  typeIcon,
  typeToken,
} from "@/lib/sahay/utils";
import { ConfidenceMeter, SectionTitle, SeverityBadge, StatusChip } from "@/components/sahay/bits";
import { TacticalMap } from "@/components/sahay/TacticalMap";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FLOW: IncidentStatus[] = ["REPORTED", "VERIFIED", "EN_ROUTE", "ON_SCENE", "RESOLVED"];

export const Route = createFileRoute("/incidents/$incidentId")({
  loader: ({ params }) => {
    const incident = INCIDENTS.find((i) => i.id === params.incidentId);
    if (!incident) throw notFound();
    return { incident };
  },
  head: ({ loaderData }) => {
    const inc = loaderData?.incident;
    const title = inc ? `${inc.id} · ${inc.title} — SAHAY` : "Incident — SAHAY";
    const description = inc
      ? `${inc.severity} ${inc.type} at ${inc.location.address}, ${inc.location.district}. ${inc.sources.length} sources correlated at ${inc.confidence}% confidence.`
      : "Correlated incident detail with source network and dispatch actions.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: IncidentDetail,
});

function IncidentDetail() {
  const { incident } = Route.useLoaderData();
  const [status, setStatus] = useState<IncidentStatus>(incident.status);
  const token = typeToken[incident.type];

  const recommended = RESOURCES.filter((r) => r.status === "AVAILABLE").slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="panel p-4">
        <Link to="/incidents" className="text-xs text-muted-foreground hover:text-foreground">
          ← Back to register
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span
            className="flex size-11 items-center justify-center rounded-lg text-2xl"
            style={{ backgroundColor: `color-mix(in oklch, var(--color-${token}) 20%, transparent)` }}
            aria-hidden
          >
            {typeIcon[incident.type]}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-primary">{incident.id}</span>
              <SeverityBadge severity={incident.severity} />
              <StatusChip status={status} />
            </div>
            <h1 className="mt-1 text-2xl leading-none">{incident.title}</h1>
            <p className="text-xs text-muted-foreground">
              {incident.location.address}, {incident.location.district}, {incident.location.state} ·{" "}
              {timeAgo(incident.minutesAgo)} · {compactNumber(incident.affectedPopulation)} people in envelope
            </p>
          </div>
          <div className="ml-auto w-40">
            <p className="mb-1 text-[11px] tracking-widest text-muted-foreground uppercase">Confidence</p>
            <ConfidenceMeter value={incident.confidence} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {FLOW.map((s, idx) => {
            const done = FLOW.indexOf(status) >= idx;
            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setStatus(s);
                  toast.success(`${incident.id} status set to ${statusLabel[s]}`);
                }}
                className={cn(
                  "rounded-full border px-3 py-1 font-mono text-[11px] transition-colors",
                  done
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {statusLabel[s]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="panel p-4 lg:col-span-2">
          <SectionTitle hint="Generated from all correlated signals">AI situation summary</SectionTitle>
          <p className="text-sm leading-relaxed text-muted-foreground">{incident.summary}</p>

          <div className="mt-5">
            <SectionTitle hint="How independent signals converged on one verified event">
              Source correlation network
            </SectionTitle>
            <CorrelationNetwork incident={incident} />
          </div>

          <div className="mt-5">
            <SectionTitle hint="Chronological signal arrival">Confidence timeline</SectionTitle>
            <ol className="space-y-2">
              {[...incident.sources]
                .sort((a, b) => b.minutesAgo - a.minutesAgo)
                .map((s, idx, arr) => {
                  const conf = Math.round(
                    (incident.confidence * (idx + 1)) / arr.length,
                  );
                  return (
                    <li key={s.id} className="rounded-lg border border-border bg-card p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="text-xs font-semibold"
                          style={{ color: `var(--color-${sourceToken[s.type]})` }}
                        >
                          {sourceIcon[s.type]} {sourceLabel[s.type]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {s.outlet ?? s.author} · trust {s.credibility}%
                        </span>
                        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                          T-{s.minutesAgo} min
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm">{s.content}</p>
                      <div className="mt-2 max-w-56">
                        <ConfidenceMeter value={conf} />
                      </div>
                    </li>
                  );
                })}
            </ol>
          </div>
        </section>

        <div className="space-y-4">
          <section className="panel p-4">
            <SectionTitle hint="Impact envelope on the national grid">Location</SectionTitle>
            <TacticalMap incidents={[incident]} />
          </section>

          <section className="panel p-4">
            <SectionTitle hint="Nearest matching units by ETA">Recommended dispatch</SectionTitle>
            <ul className="space-y-2">
              {recommended.map((r) => (
                <li key={r.id} className="rounded-lg border border-border bg-card p-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span aria-hidden>{resourceIcon[r.type]}</span>
                    <span className="font-semibold">{r.name}</span>
                    <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                      {r.distanceKm} km · ETA {r.etaMinutes}m
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.agency} · {r.base}
                  </p>
                </li>
              ))}
            </ul>
            <Button
              className="mt-3 w-full"
              onClick={() =>
                toast.success(`${recommended.length} units dispatched to ${incident.id}`, {
                  description: recommended.map((r) => `${r.name} (ETA ${r.etaMinutes}m)`).join(", "),
                })
              }
            >
              Dispatch recommended units
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}

function CorrelationNetwork({ incident }: { incident: (typeof INCIDENTS)[number] }) {
  return (
    <div className="relative rounded-lg border border-border bg-background/60 p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {incident.sources.map((s) => (
          <div
            key={s.id}
            className="rounded-lg border p-2.5"
            style={{
              borderColor: `color-mix(in oklch, var(--color-${sourceToken[s.type]}) 40%, transparent)`,
              backgroundColor: `color-mix(in oklch, var(--color-${sourceToken[s.type]}) 8%, transparent)`,
            }}
          >
            <p
              className="text-xs font-semibold"
              style={{ color: `var(--color-${sourceToken[s.type]})` }}
            >
              {sourceIcon[s.type]} {sourceLabel[s.type]} · {s.credibility}%
            </p>
            <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{s.content}</p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">T-{s.minutesAgo} min</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-primary/40 bg-primary/10 p-3 text-center">
        <p className="font-display text-lg tracking-widest text-primary">AI CORRELATION ENGINE</p>
        <p className="text-xs text-muted-foreground">
          {incident.sources.length} independent sources converge → {incident.confidence}% confidence ·{" "}
          {incident.confidence >= 70 ? "VERIFIED INCIDENT" : "AWAITING CORROBORATION"}
        </p>
      </div>
    </div>
  );
}
