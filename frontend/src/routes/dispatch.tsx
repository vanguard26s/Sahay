import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mic, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { INCIDENTS, RESOURCES } from "@/lib/sahay/data";
import { resourceIcon } from "@/lib/sahay/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dispatch")({
  head: () => ({
    meta: [
      { title: "AI Dispatch Console — SAHAY" },
      {
        name: "description",
        content:
          "Natural-language command console: query incidents, dispatch units, update statuses and confirm actions by text or voice.",
      },
      { property: "og:title", content: "AI Dispatch Console — SAHAY" },
      {
        property: "og:description",
        content: "Issue dispatch commands in plain language and confirm them in one click.",
      },
    ],
  }),
  component: DispatchConsole,
});

type Line = { role: "officer" | "ai"; text: string; pending?: boolean };

const SUGGESTIONS = [
  "Show me all flood incidents in Gujarat",
  "Dispatch 2 boats to Sector 4",
  "What resources are available in Ahmedabad?",
  "Update incident INC-104 to on scene",
];

function respond(command: string): Line {
  const c = command.toLowerCase();

  if (c.startsWith("show") || c.includes("incidents in")) {
    const state = ["gujarat", "maharashtra", "delhi", "bihar", "kerala", "karnataka"].find((s) =>
      c.includes(s),
    );
    const type = ["flood", "fire", "cyclone", "earthquake", "landslide", "drought", "epidemic"].find((t) =>
      c.includes(t),
    );
    const matches = INCIDENTS.filter(
      (i) =>
        (!state || i.location.state.toLowerCase() === state) &&
        (!type || i.type.toLowerCase() === type),
    ).slice(0, 5);
    if (matches.length === 0) return { role: "ai", text: "🔍 No incidents match that query." };
    return {
      role: "ai",
      text: `🔍 Found ${matches.length} matching incident(s):\n${matches
        .map(
          (m) =>
            `• ${m.id}: ${m.location.address}, ${m.location.district} — ${m.severity} ${m.type} (${m.confidence}%)`,
        )
        .join("\n")}`,
    };
  }

  if (c.startsWith("dispatch")) {
    const count = Number(c.match(/\d+/)?.[0] ?? 1);
    const units = RESOURCES.filter((r) => r.status === "AVAILABLE").slice(0, count);
    return {
      role: "ai",
      pending: true,
      text: `🤔 Parsed command.\n✅ Confirm: dispatch ${units.length} unit(s) to INC-104 · Sector 4 Bridge, Ahmedabad\n${units
        .map((u) => `${resourceIcon[u.type]} ${u.name} (${u.distanceKm} km, ETA ${u.etaMinutes} min)`)
        .join("\n")}`,
    };
  }

  if (c.startsWith("update") || c.includes("resolve")) {
    const id = command.match(/INC-\d+/i)?.[0]?.toUpperCase() ?? "INC-104";
    return { role: "ai", text: `📋 Status of ${id} updated. Field units and control room notified.` };
  }

  if (c.includes("available")) {
    const avail = RESOURCES.filter((r) => r.status === "AVAILABLE");
    return {
      role: "ai",
      text: `🚁 ${avail.length} units available:\n${avail
        .slice(0, 6)
        .map((r) => `${resourceIcon[r.type]} ${r.name} — ${r.base} (ETA ${r.etaMinutes} min)`)
        .join("\n")}`,
    };
  }

  if (c.startsWith("create")) {
    return { role: "ai", text: "📝 Draft incident created and queued for verification (INC-136)." };
  }

  return {
    role: "ai",
    text: "🤖 I can handle: SHOW <type> incidents in <state> · DISPATCH <n> <unit> to <location> · UPDATE incident <id> to <status> · WHAT resources are available in <location>.",
  };
}

function DispatchConsole() {
  const [lines, setLines] = useState<Line[]>([
    {
      role: "ai",
      text: "🤖 SAHAY dispatch AI online. 32 active incidents monitored across 5 source streams. How can I help, Commander?",
    },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    setLines((prev) => [...prev, { role: "officer", text }, respond(text)]);
    setInput("");
  };

  const confirm = (index: number) => {
    setLines((prev) => [
      ...prev.map((l, i) => (i === index ? { ...l, pending: false } : l)),
      { role: "officer", text: "Confirm" },
      {
        role: "ai",
        text: "✅ Dispatch confirmed. Boat-07 EN-ROUTE (ETA 8 min), AMB-04 EN-ROUTE (ETA 6 min). Live tracking active on map.",
      },
    ]);
    toast.success("Dispatch confirmed — units en-route");
  };

  const startVoice = () => {
    setListening(true);
    setTimeout(() => {
      setListening(false);
      send("Dispatch 2 boats to Sector 4");
    }, 1600);
  };

  return (
    <div className="panel flex h-[calc(100vh-11rem)] min-h-125 flex-col p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl leading-none">AI Command Center</h1>
        <span className="font-mono text-[11px] text-muted-foreground">
          natural-language dispatch · voice enabled
        </span>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => setLines(lines.slice(0, 1))}
        >
          <Trash2 className="size-4" /> Clear
        </Button>
      </div>

      <div ref={scrollRef} className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
        {lines.map((l, i) => (
          <div
            key={i}
            className={cn(
              "animate-rise max-w-[85%] rounded-lg border p-3 text-sm whitespace-pre-line",
              l.role === "officer"
                ? "ml-auto border-primary/40 bg-primary/10"
                : "border-border bg-card",
            )}
          >
            <p className="mb-1 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              {l.role === "officer" ? "Officer" : "SAHAY AI"}
            </p>
            {l.text}
            {l.pending && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => confirm(i)}>
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setLines((prev) => [...prev, { role: "ai", text: "❌ Dispatch cancelled." }])
                  }
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        ))}
        {listening && (
          <p className="font-mono text-xs text-accent">🎤 Listening… "dispatch two boats to sector four"</p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => send(s)}
            className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a command…"
          aria-label="Dispatch command"
        />
        <Button type="button" variant="secondary" aria-label="Voice command" onClick={startVoice}>
          <Mic className={cn("size-4", listening && "text-accent")} />
        </Button>
        <Button type="submit" aria-label="Send command">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
