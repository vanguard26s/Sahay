import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { FileSpreadsheet, FileText } from "lucide-react";
import { INCIDENTS, KEY_INSIGHTS, RESOURCES, RESPONSE_TREND, SOURCE_MIX } from "@/lib/sahay/data";
import type { DisasterType } from "@/lib/sahay/types";
import { SEVERITY_ORDER, severityToken, sourceLabel, sourceToken, typeToken } from "@/lib/sahay/utils";
import { SectionTitle } from "@/components/sahay/bits";
import { Button } from "@/components/ui/button";
import { TacticalMap } from "@/components/sahay/TacticalMap";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Response Analytics — SAHAY" },
      {
        name: "description",
        content:
          "Incident volume by type and severity, response-time trend against target, source reliability mix and fleet utilisation with exportable reports.",
      },
      { property: "og:title", content: "Response Analytics — SAHAY" },
      {
        property: "og:description",
        content: "Trends, source reliability and fleet utilisation for after-action review.",
      },
    ],
  }),
  component: Analytics,
});

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
};

function Analytics() {
  const byType = useMemo(() => {
    const types = [...new Set(INCIDENTS.map((i) => i.type))] as DisasterType[];
    return types.map((t) => {
      const row: Record<string, string | number> = { type: t };
      SEVERITY_ORDER.forEach((s) => {
        row[s] = INCIDENTS.filter((i) => i.type === t && i.severity === s).length;
      });
      return row;
    });
  }, []);

  const utilisation = useMemo(() => {
    const types = [...new Set(RESOURCES.map((r) => r.type))];
    return types.map((t) => {
      const all = RESOURCES.filter((r) => r.type === t);
      const busy = all.filter((r) => r.status === "EN_ROUTE" || r.status === "ON_SCENE").length;
      return { type: t.replace("_", " "), utilisation: Math.round((busy / all.length) * 100) };
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="panel flex flex-wrap items-center gap-3 p-4">
        <div>
          <h1 className="text-2xl leading-none">Response Analytics</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Reporting window: 01–31 Oct · {INCIDENTS.length} incidents · {RESOURCES.length} units
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" onClick={() => toast.success("PDF report queued for download")}>
            <FileText className="size-4" /> Export PDF
          </Button>
          <Button variant="outline" onClick={() => toast.success("Excel workbook queued for download")}>
            <FileSpreadsheet className="size-4" /> Export Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-4">
          <SectionTitle hint="Stacked by severity band">Incidents by type</SectionTitle>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={byType}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="type" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {SEVERITY_ORDER.map((s) => (
                  <Bar key={s} dataKey={s} stackId="a" fill={`var(--color-${severityToken[s]})`} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-4">
          <SectionTitle hint="Minutes from first signal to unit dispatch (target 8 min)">
            Response time trend
          </SectionTitle>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={RESPONSE_TREND}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="var(--color-low)"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-4">
          <SectionTitle hint="Share of ingested raw signals">Source breakdown</SectionTitle>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={SOURCE_MIX} dataKey="value" nameKey="source" innerRadius={50} outerRadius={80}>
                  {SOURCE_MIX.map((s) => (
                    <Cell
                      key={s.source}
                      fill={`var(--color-${sourceToken[s.source]})`}
                      stroke="var(--color-background)"
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            {SOURCE_MIX.map((s) => (
              <span key={s.source} style={{ color: `var(--color-${sourceToken[s.source]})` }}>
                {sourceLabel[s.source]} {s.value}%
              </span>
            ))}
          </div>
        </section>

        <section className="panel p-4">
          <SectionTitle hint="Percent of fleet currently committed">Resource utilisation</SectionTitle>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={utilisation} layout="vertical">
                <CartesianGrid stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                <YAxis
                  type="category"
                  dataKey="type"
                  width={110}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="utilisation" fill="var(--color-chart-2)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-4">
          <SectionTitle hint="Geographic clustering of this reporting window">
            Incident density
          </SectionTitle>
          <TacticalMap incidents={INCIDENTS} />
        </section>

        <section className="panel p-4">
          <SectionTitle hint="Auto-generated from the reporting window">Key insights</SectionTitle>
          <ul className="space-y-2">
            {KEY_INSIGHTS.map((k) => {
              const token = k.tone === "good" ? "low" : k.tone === "bad" ? "critical" : "medium";
              return (
                <li
                  key={k.text}
                  className="rounded-lg border p-3 text-sm"
                  style={{
                    borderColor: `color-mix(in oklch, var(--color-${token}) 40%, transparent)`,
                    backgroundColor: `color-mix(in oklch, var(--color-${token}) 10%, transparent)`,
                  }}
                >
                  {k.text}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        Chart palette derived from severity tokens: {SEVERITY_ORDER.join(" · ")} · type palette keyed to{" "}
        {Object.keys(typeToken).length} disaster classes.
      </p>
    </div>
  );
}
