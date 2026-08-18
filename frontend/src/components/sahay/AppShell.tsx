import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Boxes,
  LayoutDashboard,
  ListTree,
  Map as MapIcon,
  PlayCircle,
  Radio,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { INCIDENTS } from "@/lib/sahay/data";

const NAV = [
  { to: "/", label: "Command Dashboard", icon: LayoutDashboard },
  { to: "/segregated", label: "Segregated Intel", icon: ListTree },
  { to: "/incidents", label: "Incidents", icon: Activity },
  { to: "/map", label: "Live Map", icon: MapIcon },
  { to: "/resources", label: "Resource Center", icon: Boxes },
  { to: "/dispatch", label: "AI Dispatch", icon: Terminal },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/demo", label: "Demo Showcase", icon: PlayCircle },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const criticalCount = INCIDENTS.filter((i) => i.severity === "CRITICAL").length;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-4 px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary font-display text-lg text-primary-foreground">
              स
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg tracking-widest">SAHAY</span>
              <span className="block text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                From Chaos to Command
              </span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted-foreground sm:flex">
              <Radio className="size-3 animate-pulse text-accent" aria-hidden />
              LIVE FEED · 5 SOURCES
            </span>
            <span
              className="rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold"
              style={{
                color: "var(--color-critical)",
                backgroundColor: "color-mix(in oklch, var(--color-critical) 16%, transparent)",
              }}
            >
              {criticalCount} CRITICAL
            </span>
            <span className="hidden text-right text-xs sm:block">
              <span className="block font-semibold">Cdr. A. Rathore</span>
              <span className="block text-muted-foreground">NDRF · Gujarat Region</span>
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 gap-4 px-4 py-4">
        <nav aria-label="Primary" className="hidden w-56 shrink-0 lg:block">
          <ul className="panel sticky top-[4.5rem] space-y-1 p-2">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary/15 font-semibold text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <nav
        aria-label="Primary mobile"
        className="sticky bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur lg:hidden"
      >
        <ul className="flex overflow-x-auto">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <li key={to} className="flex-1">
                <Link
                  to={to}
                  aria-label={label}
                  className={cn(
                    "flex min-h-11 flex-col items-center justify-center gap-0.5 px-3 py-2 text-[10px]",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {label.split(" ")[0]}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <footer className="border-t border-border px-4 py-3 text-center text-[11px] text-muted-foreground">
        SAHAY v1.0.0 · Multi-Source Disaster Intelligence · Simulated data for demonstration
      </footer>
    </div>
  );
}
