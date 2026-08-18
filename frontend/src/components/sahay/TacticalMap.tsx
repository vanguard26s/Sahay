import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Incident } from "@/lib/sahay/types";
import { projectIndia, severityToken, timeAgo, typeIcon, typeToken } from "@/lib/sahay/utils";
import { SeverityBadge } from "./bits";
import { cn } from "@/lib/utils";

export function TacticalMap({
  incidents,
  className,
}: {
  incidents: Incident[];
  className?: string;
}) {
  const [active, setActive] = useState<Incident | null>(null);

  return (
    <div
      className={cn(
        "grid-lines relative overflow-hidden rounded-lg border border-border bg-background",
        className,
      )}
    >
      {/* Stylised India landmass */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id="landmass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-surface)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <path
          d="M24,14 L38,9 L52,13 L63,10 L74,17 L79,29 L72,36 L68,48 L60,60 L54,76 L47,92 L39,74 L31,58 L22,44 L18,30 Z"
          fill="url(#landmass)"
          stroke="var(--color-border)"
          strokeWidth="0.4"
        />
      </svg>

      <div className="relative aspect-4/3 w-full sm:aspect-16/10">
        {incidents.map((inc) => {
          const { x, y } = projectIndia(inc.location.lat, inc.location.lng);
          const token = severityToken[inc.severity];
          return (
            <button
              key={inc.id}
              type="button"
              onClick={() => setActive(inc)}
              aria-label={`${inc.id} ${inc.type} ${inc.severity} at ${inc.location.district}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {inc.severity === "CRITICAL" && (
                <span
                  className="animate-pulse-ring absolute inset-0 -m-1 rounded-full"
                  style={{ backgroundColor: `var(--color-${token})` }}
                />
              )}
              <span
                className="relative flex size-5 items-center justify-center rounded-full border text-[9px]"
                style={{
                  borderColor: `var(--color-${token})`,
                  backgroundColor: `color-mix(in oklch, var(--color-${typeToken[inc.type]}) 45%, var(--color-background))`,
                }}
              >
                {typeIcon[inc.type]}
              </span>
            </button>
          );
        })}

        {active && (
          <div className="absolute inset-x-3 bottom-3 rounded-lg border border-border bg-popover/95 p-3 backdrop-blur sm:inset-x-auto sm:right-3 sm:w-72">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-primary">{active.id}</span>
              <SeverityBadge severity={active.severity} />
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Close incident preview"
                className="ml-auto text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <p className="mt-1.5 text-sm font-semibold">{active.title}</p>
            <p className="text-xs text-muted-foreground">
              {active.location.district}, {active.location.state} · {timeAgo(active.minutesAgo)}
            </p>
            <Link
              to="/incidents/$incidentId"
              params={{ incidentId: active.id }}
              className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline"
            >
              Open incident detail →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
