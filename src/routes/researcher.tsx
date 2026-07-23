import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SelfGraph, type DiagnosticColor } from "@/components/SelfGraph";
import { InterviewSection } from "@/components/InterviewSection";
import { buildSegments, MATRIX_LABEL } from "@/lib/lexicon";
import {
  CHOICE_POLARITY,
  PERFORMATIVE_NARRATIVES,
  PROTECTIVE_NARRATIVES,
  SCENARIOS,
  contextLabel,
  narrativeDomain,
  useResearchStore,
  type ScenarioId,
  type InterviewData,
} from "@/store/research";
import { DEMO_PROFILES, type Profile } from "@/data/demoProfiles";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";

export const Route = createFileRoute("/researcher")({
  component: Researcher,
});

function Researcher() {
  const [pw, setPw] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw === "ricerca2026") {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (unlocked) return <Dashboard />;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <Link
          to="/"
          className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          ← Home
        </Link>
        <h1 className="mt-6 font-serif text-2xl font-medium">
          Accesso Ricercatore
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Inserisci la password per accedere alla dashboard.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pw">Password</Label>
            <Input
              id="pw"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoFocus
            />
            {error && (
              <p className="text-xs text-destructive">Password non valida.</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Accedi
          </Button>
        </form>
      </div>
    </main>
  );
}

function Dashboard() {
  const store = useResearchStore();

  const liveProfile: Profile | null = useMemo(() => {
    const allScenariosComplete = SCENARIOS.every((s) => {
      const e = store.scenarios[s.id];
      return (
        e.locked &&
        !!e.choice &&
        e.winningVoiceIds.length > 0 &&
        e.losingVoiceIds.length > 0
      );
    });
    if (
      !allScenariosComplete ||
      !store.participantId ||
      !store.context ||
      store.positions.length === 0
    ) {
      return null;
    }
    return {
      participantId: store.participantId,
      context: store.context,
      contextCustom: store.contextCustom,
      startedAt: store.startedAt ?? Date.now(),
      endedAt: store.endedAt ?? Date.now(),
      positions: store.positions,
      continuum: store.continuum,
      narrativeColonization: store.narrativeColonization,
      scenarios: store.scenarios,
    };
  }, [store]);

  const profiles: Profile[] = useMemo(() => {
    return liveProfile ? [liveProfile, ...DEMO_PROFILES] : DEMO_PROFILES;
  }, [liveProfile]);

  const [selectedId, setSelectedId] = useState<string>(
    profiles[0]?.participantId ?? "",
  );
  const selected =
    profiles.find((p) => p.participantId === selectedId) ?? profiles[0];
  const [view, setView] = useState<"individual" | "aggregate">("individual");
  const [showNumbers, setShowNumbers] = useState(false);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Dashboard Ricercatore
            </p>
            <h1 className="font-serif text-xl font-medium">
              Analisi dialogica dei processi decisionali akratici
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="inline-flex rounded-md border border-border bg-background p-1 text-[10px]">
              <button
                onClick={() => setView("individual")}
                className={cn(
                  "rounded px-3 py-1 uppercase tracking-widest",
                  view === "individual"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Individuale
              </button>
              <button
                onClick={() => setView("aggregate")}
                className={cn(
                  "rounded px-3 py-1 uppercase tracking-widest",
                  view === "aggregate"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Aggregata
              </button>
            </div>
            <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Switch
                checked={showNumbers}
                onCheckedChange={setShowNumbers}
              />
              Mostra valori numerici
            </label>
            <Link
              to="/"
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 pt-6">
        <div
          role="note"
          className="rounded-md border-l-4 border border-border bg-muted/40 p-4 text-sm leading-relaxed"
          style={{ borderLeftColor: "#4a9d6c" }}
        >
          <div className="mb-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Avvertenza metodologica
          </div>
          <p>
            I dati e gli esiti visualizzati in questa dashboard hanno un valore
            puramente euristico e di orientamento per il ricercatore. Servono
            da guida per la conduzione dell'intervista semistrutturata e per
            la successiva Analisi Dialogica del Discorso (DDA), a cui è
            subordinata ogni interpretazione finale del fenomeno.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[280px_1fr]">
        {/* LEFT: participants list */}
        <aside className="space-y-2">
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>Partecipanti</span>
            <span>{profiles.length}</span>
          </div>
          {profiles.map((p) => {
            const isSel = p.participantId === selected?.participantId;
            const isLive = !p.demo;
            return (
              <button
                key={p.participantId}
                onClick={() => setSelectedId(p.participantId)}
                className={cn(
                  "w-full rounded-md border px-3 py-3 text-left transition-colors",
                  isSel
                    ? "border-foreground bg-muted"
                    : "border-border bg-card hover:border-foreground/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {p.participantId}
                  </span>
                  {isLive ? (
                    <span className="rounded border border-foreground/40 px-1.5 py-0.5 text-[9px] uppercase tracking-widest">
                      Live
                    </span>
                  ) : (
                    <span className="rounded border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">
                      Demo
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {contextLabel(p.context, p.contextCustom)}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {formatDateTime(p.startedAt)}
                </div>
              </button>
            );
          })}
        </aside>

        {/* RIGHT: analysis */}
        <section className="space-y-6">
          {view === "aggregate" ? (
            <AggregateAnalysis profiles={profiles} showNumbers={showNumbers} />
          ) : selected ? (
            <ProfileAnalysis profile={selected} showNumbers={showNumbers} />
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card p-16 text-center text-sm text-muted-foreground">
              Nessun profilo selezionato.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ProfileAnalysis({
  profile,
  showNumbers,
}: {
  profile: Profile;
  showNumbers: boolean;
}) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<ScenarioId | null>(null);
  const interview = useResearchStore(
    (s) => s.interviews[profile.participantId],
  ) as InterviewData | undefined;
  const displayId = pinnedId ?? hoverId;
  const hovered = profile.positions.find((p) => p.id === displayId);
  const hoveredValue =
    displayId != null ? profile.continuum[displayId]?.value ?? 50 : null;

  const diagnostics = useMemo(
    () =>
      Object.fromEntries(
        SCENARIOS.map((s) => [s.id, classifyScenario(profile, s.id)] as const),
      ) as Record<ScenarioId, DiagnosticColor>,
    [profile],
  );

  const highlights: Record<string, DiagnosticColor> | undefined = useMemo(() => {
    if (!activeScenario) return undefined;
    const e = profile.scenarios[activeScenario];
    const color = diagnostics[activeScenario];
    const map: Record<string, DiagnosticColor> = {};
    e.winningVoiceIds.forEach((id) => (map[id] = color));
    e.losingVoiceIds.forEach((id) => (map[id] = color));
    return map;
  }, [activeScenario, diagnostics, profile]);

  const emphasizedIds: string[] | undefined = useMemo(() => {
    if (!activeScenario) return undefined;
    return profile.scenarios[activeScenario].winningVoiceIds;
  }, [activeScenario, profile]);

  return (
    <>
      {/* Section 1: session info */}
      <Card title="Sezione 1 · Informazioni Sessione">
        <div className="grid gap-4 sm:grid-cols-4 text-sm">
          <Field label="ID Partecipante" value={profile.participantId} />
          <Field
            label="Contesto Ecologico"
            value={contextLabel(profile.context, profile.contextCustom)}
          />
          <Field
            label="Apertura sessione"
            value={formatDateTime(profile.startedAt)}
          />
          <Field
            label="Durata sessione"
            value={formatDuration(profile.startedAt, profile.endedAt)}
          />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportProfileJSON(profile, interview)}
          >
            Esporta JSON
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportProfilePDF(profile, diagnostics, interview)}
          >
            Esporta PDF
          </Button>
        </div>
      </Card>

      {/* Section 2: graph */}
      <Card title="Sezione 2 · Grafico del Sé & Esiti Scenari Akratici">
        <div className="grid gap-4 md:grid-cols-[1fr_260px] items-start">
          <div
            className="flex justify-center"
            onMouseLeave={() => setHoverId(null)}
          >
            <div
              onMouseMove={(e) => {
                const target = (e.target as SVGElement).closest("g");
                const label = target?.querySelector("text")?.textContent;
                const match = profile.positions.find((p) => p.label === label);
                setHoverId(match?.id ?? null);
              }}
            >
              <SelfGraph
                positions={profile.positions}
                continuum={profile.continuum}
                highlights={highlights}
                emphasizedIds={emphasizedIds}
                selectedIds={pinnedId ? [pinnedId] : undefined}
                onSelect={(id) =>
                  setPinnedId((prev) => (prev === id ? null : id))
                }
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-md border border-border bg-background p-4 text-xs">
              <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                Esito Vignetta Narrativa
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setActiveScenario(null)}
                  className={cn(
                    "rounded border px-2 py-0.5 text-[11px]",
                    !activeScenario
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  Nessuno
                </button>
                {SCENARIOS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveScenario(s.id)}
                    className={cn(
                      "rounded border px-2 py-0.5 text-[11px]",
                      activeScenario === s.id
                        ? "border-foreground bg-muted"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span
                      className="mr-1 inline-block h-2 w-2 rounded-full align-middle"
                      style={{ background: diagnosticHex(diagnostics[s.id]) }}
                    />
                    Scenario {i + 1}
                  </button>
                ))}
              </div>
              <DiagnosticLegend />
            </div>
            <div className="rounded-md border border-border bg-background p-4 text-xs">
            {hovered ? (
              <>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {hovered.belonging === "internal"
                    ? "Sé Interno"
                    : "Sé Esterno"}
                </div>
                <div className="mt-1 font-serif text-lg">{hovered.label}</div>
                <div className="mt-2 text-muted-foreground">
                  Importanza: <span className="text-foreground">{hovered.dimension}</span>
                </div>
                <div className="text-muted-foreground">
                  Orientamento:{" "}
                  <span className="text-foreground">
                    {orientation(hoveredValue ?? 50)}
                  </span>
                  {showNumbers && (
                    <span className="ml-1 text-muted-foreground">
                      ({hoveredValue}/100)
                    </span>
                  )}
                </div>
                {pinnedId === hovered.id && (
                  <button
                    onClick={() => setPinnedId(null)}
                    className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground underline hover:text-foreground"
                  >
                    Sblocca dettagli
                  </button>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">
                Passa il mouse su un cerchio per visualizzare i dettagli, o
                clicca per fissarli a schermo.
              </p>
            )}
            </div>
          </div>
        </div>
      </Card>

      {/* Section 3: continuum table */}
      <Card title="Sezione 3 · Valutazione Continuum">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="py-2 pr-4">I-Position</th>
                <th className="py-2 pr-4">Appartenenza</th>
                <th className="py-2 pr-4">Importanza</th>
                <th className="py-2 pr-4">Continuum</th>
                <th className="py-2">Orientamento</th>
              </tr>
            </thead>
            <tbody>
              {profile.positions.map((p) => {
                const v = profile.continuum[p.id]?.value ?? 50;
                return (
                  <tr key={p.id} className="border-b border-border/60">
                    <td className="py-2 pr-4 font-medium">{p.label}</td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {p.belonging === "internal" ? "Sé Interno" : "Sé Esterno"}
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {p.dimension}
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-32 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-foreground"
                            style={{ width: `${v}%` }}
                          />
                        </div>
                        {showNumbers && (
                          <span className="tabular-nums text-xs">{v}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 text-xs">{orientation(v)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section 4: narratives */}
      <Card title="Sezione 4 · Mappa delle Narrazioni">
        <div className="grid gap-6 md:grid-cols-2">
          <NarrativeBlock
            title="Narrazioni Performative"
            tone="performative"
            items={PERFORMATIVE_NARRATIVES}
            profile={profile}
          />
          <NarrativeBlock
            title="Contro-Narrazioni del Benessere"
            tone="protective"
            items={PROTECTIVE_NARRATIVES}
            profile={profile}
          />
        </div>
      </Card>

      {/* Section 4b: continuum × colonization matrix */}
      <Card title="Sezione 4b · Matrice Continuum × Colonizzazione">
        <ContinuumMatrix profile={profile} showNumbers={showNumbers} />
      </Card>

      {/* Section 5: scenarios */}
      <Card title="Sezione 5 · Analisi Scenari Akratici">
        <div className="space-y-6">
          {SCENARIOS.map((s) => {
            const e = profile.scenarios[s.id];
            const diag = diagnostics[s.id];
            return (
              <article
                key={s.id}
                className="rounded-md border-l-4 border border-border bg-background p-5"
                style={{ borderLeftColor: diagnosticHex(diag) }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {s.theme}
                  </div>
                  <div
                    className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest text-background"
                    style={{ background: diagnosticHex(diag) }}
                  >
                    {DIAGNOSTIC_LABEL[diag]}
                  </div>
                </div>
                <h3 className="mt-1 font-serif text-lg">{s.title}</h3>

                <blockquote className="mt-4 border-l-2 border-foreground/40 bg-muted/40 py-2 pl-4 text-sm italic leading-relaxed">
                  «{e.openResponse}»
                </blockquote>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full border border-foreground/60 bg-foreground px-2.5 py-0.5 text-background">
                    Opzione {e.choice ?? "—"}
                  </span>
                  {e.choice && (
                    <span className="text-muted-foreground">
                      Polarità: {CHOICE_POLARITY[e.choice]}
                    </span>
                  )}
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <VoiceList
                    title="Voci Vincenti (Alleanza)"
                    ids={e.winningVoiceIds}
                    profile={profile}
                    tone="win"
                  />
                  <VoiceList
                    title="Voci Perdenti (Sottomissione)"
                    ids={e.losingVoiceIds}
                    profile={profile}
                    tone="lose"
                  />
                </div>
                <ClinicalNoteField
                  participantId={profile.participantId}
                  scenarioId={s.id}
                />
              </article>
            );
          })}
        </div>
      </Card>

      {/* Section 6: interview */}
      <Card title="Sezione 6 · Intervista Post-Test & Analisi Dialogica del Discorso">
        <InterviewSection participantId={profile.participantId} />
      </Card>
    </>
  );
}

function ClinicalNoteField({
  participantId,
  scenarioId,
}: {
  participantId: string;
  scenarioId: ScenarioId;
}) {
  const value = useResearchStore(
    (s) => s.clinicalNotes[participantId]?.[scenarioId] ?? "",
  );
  const setClinicalNote = useResearchStore((s) => s.setClinicalNote);
  return (
    <div className="mt-4">
      <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        Note cliniche del ricercatore
      </div>
      <Textarea
        value={value}
        onChange={(e) =>
          setClinicalNote(participantId, scenarioId, e.target.value)
        }
        placeholder="Digita qui le tue note, riflessioni e ipotesi cliniche relative a questo scenario…"
        className="min-h-[120px] text-sm leading-relaxed"
      />
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 font-medium">{value}</div>
    </div>
  );
}

function NarrativeBlock({
  title,
  tone,
  items,
  profile,
}: {
  title: string;
  tone: "performative" | "protective";
  items: readonly string[];
  profile: Profile;
}) {
  return (
    <div>
      <div
        className={cn(
          "mb-3 inline-block rounded px-2 py-0.5 text-[10px] uppercase tracking-widest",
          tone === "performative"
            ? "bg-foreground text-background"
            : "border border-foreground/40 text-foreground",
        )}
      >
        {title}
      </div>
      <ul className="space-y-3">
        {items.map((n) => {
          const ids = profile.narrativeColonization[n] ?? [];
          return (
            <li
              key={n}
              className="rounded-md border border-border bg-background p-3"
            >
              <p className="text-xs italic text-foreground">«{n}»</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {ids.length === 0 ? (
                  <span className="text-[10px] text-muted-foreground">
                    Nessuna voce colonizzata.
                  </span>
                ) : (
                  ids.map((id) => {
                    const p = profile.positions.find((x) => x.id === id);
                    if (!p) return null;
                    return (
                      <span
                        key={id}
                        className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px]"
                      >
                        {p.label}
                      </span>
                    );
                  })
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function VoiceList({
  title,
  ids,
  profile,
  tone,
}: {
  title: string;
  ids: string[];
  profile: Profile;
  tone: "win" | "lose";
}) {
  return (
    <div>
      <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ids.length === 0 ? (
          <span className="text-[11px] text-muted-foreground">—</span>
        ) : (
          ids.map((id) => {
            const p = profile.positions.find((x) => x.id === id);
            if (!p) return null;
            return (
              <span
                key={id}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px]",
                  tone === "win"
                    ? "border-foreground/60 bg-muted text-foreground"
                    : "border-border bg-background text-muted-foreground",
                )}
              >
                {p.label}
              </span>
            );
          })
        )}
      </div>
    </div>
  );
}

function orientation(v: number): string {
  if (v <= 20) return "Fortemente qualitativo";
  if (v <= 40) return "Qualitativo";
  if (v <= 60) return "Bilanciato";
  if (v <= 80) return "Quantitativo";
  return "Fortemente quantitativo";
}

function formatDateTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(startedAt: number, endedAt?: number): string {
  if (!endedAt) return "In corso";
  const ms = Math.max(0, endedAt - startedAt);
  const totalMin = Math.round(ms / 60000);
  if (totalMin < 1) return "< 1 min";
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}min` : `${m} min`;
}

// ---------- Diagnostic classification ----------

const DIAGNOSTIC_LABEL: Record<DiagnosticColor, string> = {
  green: "Continente",
  yellow: "Continente razionalizzato",
  orange: "Akrasia razionalizzata",
  red: "Akrasia neoliberista",
};

const DIAGNOSTIC_DESCRIPTION: Record<DiagnosticColor, string> = {
  green:
    "Le voci più centrali e orientate al benessere prevalgono senza essere ricodificate in termini performativi: la decisione è coerente con il Sé morale e l'akrasia non emerge.",
  yellow:
    "Il partecipante mantiene la coerenza con le voci più orientate al benessere: l'akrasia è contenuta e la decisione è razionalizzata come atto di autodeterminazione.",
  orange:
    "La scelta è razionalizzata a favore della logica produttiva: le voci morali vengono argomentativamente ridimensionate per legittimare la sottomissione al KPI.",
  red:
    "Le voci morali e centrali vengono messe a tacere in favore di voci quantitative anche periferiche: la razionalità neoliberista colonizza il Sé e l'akrasia diventa dissonanza aperta.",
};

const DIAGNOSTIC_HEX: Record<DiagnosticColor, string> = {
  green: "#4a9d6c",
  yellow: "#d4b23a",
  orange: "#d78544",
  red: "#c14b45",
};

function diagnosticHex(c: DiagnosticColor): string {
  return DIAGNOSTIC_HEX[c];
}

function DiagnosticLegend() {
  return (
    <div className="mt-3 space-y-1 border-t border-border pt-2">
      {(Object.keys(DIAGNOSTIC_LABEL) as DiagnosticColor[]).map((k) => (
        <div key={k} className="flex items-center gap-2 text-[10px]">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: DIAGNOSTIC_HEX[k] }}
          />
          <span className="uppercase tracking-widest text-muted-foreground">
            {DIAGNOSTIC_LABEL[k]}
          </span>
        </div>
      ))}
    </div>
  );
}

function avg(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function classifyScenario(profile: Profile, sid: ScenarioId): DiagnosticColor {
  const e = profile.scenarios[sid];
  const posById = (id: string) => profile.positions.find((p) => p.id === id);
  const contById = (id: string) => profile.continuum[id]?.value ?? 50;

  const wins = e.winningVoiceIds
    .map(posById)
    .filter(Boolean) as NonNullable<ReturnType<typeof posById>>[];
  const loses = e.losingVoiceIds
    .map(posById)
    .filter(Boolean) as NonNullable<ReturnType<typeof posById>>[];

  if (wins.length === 0 || loses.length === 0) {
    // fallback su polarità della scelta
    if (e.choice === "A") return "green";
    if (e.choice === "C") return "yellow";
    if (e.choice === "B") return "orange";
    return "green";
  }

  const avgRadWin = avg(wins.map((p) => p.radius));
  const avgRadLose = avg(loses.map((p) => p.radius));
  const avgContWin = avg(wins.map((p) => contById(p.id)));
  const avgContLose = avg(loses.map((p) => contById(p.id)));

  // Quota di voci colonizzate da narrazioni performative in ciascun gruppo
  const colonizedBy = (id: string, dom: "performative" | "protective") => {
    for (const [narr, ids] of Object.entries(profile.narrativeColonization)) {
      if (ids.includes(id) && narrativeDomain(narr) === dom) return true;
    }
    return false;
  };
  const winPerfShare =
    wins.filter((p) => colonizedBy(p.id, "performative")).length / wins.length;
  const losePerfShare =
    loses.filter((p) => colonizedBy(p.id, "performative")).length /
    loses.length;

  // Regole:
  //  - YELLOW (Continente razionalizzato): le vincenti sono più morali
  //    (continuum più basso) e almeno tanto grandi quanto le perdenti →
  //    coerenza con il Sé centrale morale.
  if (avgContWin < avgContLose - 5 && avgRadWin >= avgRadLose - 2) {
    // Continente puro: nessuna colonizzazione performativa sulle vincenti
    // e nessuna razionalizzazione manifesta sulle perdenti.
    if (winPerfShare === 0 && losePerfShare < 0.34) return "green";
    return "yellow";
  }
  //  - RED: le perdenti sono più morali e più grandi delle vincenti che
  //    invece sono razionali → sottomissione aperta.
  if (
    avgContWin > avgContLose + 5 &&
    avgRadWin < avgRadLose - 2 &&
    losePerfShare < 0.4
  ) {
    return "red";
  }
  //  - ORANGE: vincenti razionali che neutralizzano perdenti (di solito
  //    piccole/marginali o già colonizzate dal performativo).
  if (avgContWin > avgContLose && winPerfShare >= 0.5) {
    return "orange";
  }
  //  - YELLOW: compromesso, o entrambi i gruppi mescolano performativo e cura.
  return "yellow";
}

// ---------- Continuum × Colonization matrix ----------

function ContinuumMatrix({
  profile,
  showNumbers,
}: {
  profile: Profile;
  showNumbers: boolean;
}) {
  const rows = profile.positions.map((p) => {
    const v = profile.continuum[p.id]?.value ?? 50;
    let perf = 0;
    let prot = 0;
    for (const [narr, ids] of Object.entries(profile.narrativeColonization)) {
      if (!ids.includes(p.id)) continue;
      const d = narrativeDomain(narr);
      if (d === "performative") perf++;
      else if (d === "protective") prot++;
    }
    return { p, v, perf, prot };
  });
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[10px] uppercase tracking-widest text-muted-foreground">
            <th className="py-2 pr-4">I-Position</th>
            <th className="py-2 pr-4">Orientamento</th>
            <th className="py-2 pr-4">Colonizzazione performativa</th>
            <th className="py-2 pr-4">Colonizzazione benessere</th>
            <th className="py-2">Sintesi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ p, v, perf, prot }) => (
            <tr key={p.id} className="border-b border-border/60">
              <td className="py-2 pr-4 font-medium">{p.label}</td>
              <td className="py-2 pr-4 text-muted-foreground">
                {orientation(v)}
                {showNumbers && <span className="ml-1">({v})</span>}
              </td>
              <td className="py-2 pr-4">
                <Bar
                  n={perf}
                  max={PERFORMATIVE_NARRATIVES.length}
                  tone="performative"
                  showNumbers={showNumbers}
                />
              </td>
              <td className="py-2 pr-4">
                <Bar
                  n={prot}
                  max={PROTECTIVE_NARRATIVES.length}
                  tone="protective"
                  showNumbers={showNumbers}
                />
              </td>
              <td className="py-2 text-xs italic text-muted-foreground">
                {matrixSynthesis(v, perf, prot)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Bar({
  n,
  max,
  tone,
  showNumbers,
}: {
  n: number;
  max: number;
  tone: "performative" | "protective";
  showNumbers: boolean;
}) {
  const pct = max > 0 ? (n / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-28 rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full",
            tone === "performative" ? "bg-foreground" : "bg-foreground/60",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showNumbers && (
        <span className="text-[11px] text-muted-foreground">
          {n}/{max}
        </span>
      )}
    </div>
  );
}

function matrixSynthesis(v: number, perf: number, prot: number): string {
  const rational = v > 60;
  const moral = v < 40;
  if (rational && perf >= 3) return "Voce razionale intensamente colonizzata dalle spinte performative.";
  if (moral && prot >= 3) return "Voce morale sostenuta da contro-narrazioni del benessere.";
  if (moral && perf >= 2) return "Voce morale sotto pressione performativa (rischio di sacrificio).";
  if (rational && prot >= 2) return "Voce razionale attraversata da controspinte del benessere (potenziale attrito).";
  if (perf === 0 && prot === 0) return "Voce non colonizzata da alcuna narrazione.";
  return "Configurazione mista.";
}

// ---------- Aggregate view ----------

function AggregateAnalysis({
  profiles,
  showNumbers,
}: {
  profiles: Profile[];
  showNumbers: boolean;
}) {
  const interviews = useResearchStore((s) => s.interviews);
  const n = profiles.length;

  // distribuzione diagnostica per scenario
  const dist = useMemo(() => {
    const out: Record<ScenarioId, Record<DiagnosticColor, number>> = {
      s1: { green: 0, yellow: 0, orange: 0, red: 0 },
      s2: { green: 0, yellow: 0, orange: 0, red: 0 },
      s3: { green: 0, yellow: 0, orange: 0, red: 0 },
    };
    for (const p of profiles) {
      for (const s of SCENARIOS) {
        out[s.id][classifyScenario(p, s.id)]++;
      }
    }
    return out;
  }, [profiles]);

  // Ranking narrazioni performative più diffuse (totale colonizzazioni)
  const narrTotals = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of profiles) {
      for (const [narr, ids] of Object.entries(p.narrativeColonization)) {
        counts[narr] = (counts[narr] ?? 0) + ids.length;
      }
    }
    return counts;
  }, [profiles]);

  return (
    <>
      <Card title="Vista Aggregata · Sintesi campione">
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <Field label="Partecipanti totali" value={String(n)} />
          <Field
            label="Media I-Positions"
            value={
              n === 0
                ? "—"
                : (
                    profiles.reduce((s, p) => s + p.positions.length, 0) / n
                  ).toFixed(1)
            }
          />
          <Field
            label="Durata media"
            value={
              n === 0
                ? "—"
                : formatDuration(
                    0,
                    profiles.reduce(
                      (s, p) =>
                        s + Math.max(0, (p.endedAt ?? p.startedAt) - p.startedAt),
                      0,
                    ) / n,
                  )
            }
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportAllJSON(profiles, interviews)}
          >
            Esporta database (JSON)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportAggregatePDF(profiles, dist)}
          >
            Esporta report aggregato (PDF)
          </Button>
        </div>
      </Card>

      <Card title="Distribuzione diagnostica per scenario">
        <div className="space-y-4">
          {SCENARIOS.map((s, i) => (
            <div key={s.id}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium">
                  Scenario {i + 1} — {s.title.replace(/^Scenario \d+ — /, "")}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {n} risposte
                </span>
              </div>
              <div className="flex h-4 w-full overflow-hidden rounded">
                {(Object.keys(DIAGNOSTIC_LABEL) as DiagnosticColor[]).map(
                  (k) => {
                    const c = dist[s.id][k];
                    if (c === 0) return null;
                    const pct = (c / Math.max(n, 1)) * 100;
                    return (
                      <div
                        key={k}
                        title={`${DIAGNOSTIC_LABEL[k]}: ${c}`}
                        style={{
                          width: `${pct}%`,
                          background: DIAGNOSTIC_HEX[k],
                        }}
                        className="flex items-center justify-center text-[10px] text-background"
                      >
                        {showNumbers && pct > 8 ? c : ""}
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          ))}
          <DiagnosticLegend />
        </div>
      </Card>

      <Card title="Narrazioni più colonizzanti">
        <ul className="space-y-2">
          {Object.entries(narrTotals)
            .sort((a, b) => b[1] - a[1])
            .map(([narr, count]) => {
              const dom = narrativeDomain(narr);
              return (
                <li
                  key={narr}
                  className="flex items-start gap-3 rounded-md border border-border bg-background p-3 text-xs"
                >
                  <span
                    className={cn(
                      "mt-0.5 rounded px-2 py-0.5 text-[9px] uppercase tracking-widest",
                      dom === "performative"
                        ? "bg-foreground text-background"
                        : "border border-foreground/40",
                    )}
                  >
                    {dom === "performative" ? "Performativa" : "Benessere"}
                  </span>
                  <span className="flex-1 italic">«{narr}»</span>
                  {showNumbers && (
                    <span className="tabular-nums text-muted-foreground">
                      {count} colonizzazioni
                    </span>
                  )}
                </li>
              );
            })}
        </ul>
      </Card>
    </>
  );
}

// ---------- Export helpers ----------

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportProfileJSON(profile: Profile, interview?: InterviewData) {
  download(
    `${profile.participantId}.json`,
    JSON.stringify({ ...profile, interview: interview ?? null }, null, 2),
    "application/json",
  );
}

function exportAllJSON(
  profiles: Profile[],
  interviews: Record<string, InterviewData>,
) {
  download(
    `dataset-akrasia.json`,
    JSON.stringify(
      {
        exportedAt: Date.now(),
        profiles: profiles.map((p) => ({
          ...p,
          interview: interviews[p.participantId] ?? null,
        })),
      },
      null,
      2,
    ),
    "application/json",
  );
}

function exportProfilePDF(
  profile: Profile,
  diagnostics: Record<ScenarioId, DiagnosticColor>,
  interview?: InterviewData,
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const PAGE_W = 595.28;
  const PAGE_H = 841.89;
  const M = 44;
  const CONTENT_W = PAGE_W - M * 2;

  // Palette — mirrors the site design tokens
  const INK: [number, number, number] = [21, 24, 32];
  const MUTED: [number, number, number] = [110, 116, 128];
  const BORDER: [number, number, number] = [220, 220, 224];
  const CARD_BG: [number, number, number] = [250, 250, 248];
  const HEADER_BG: [number, number, number] = [21, 24, 32];
  const HEADER_FG: [number, number, number] = [248, 248, 244];
  const ACCENT: [number, number, number] = [110, 116, 128];

  let y = M;

  const ensureSpace = (h: number) => {
    if (y + h > PAGE_H - M) {
      doc.addPage();
      y = M;
    }
  };

  const setInk = (rgb: [number, number, number]) =>
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
  const setFill = (rgb: [number, number, number]) =>
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  const setStroke = (rgb: [number, number, number]) =>
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);

  const text = (
    txt: string,
    opts: {
      size?: number;
      bold?: boolean;
      italic?: boolean;
      color?: [number, number, number];
      x?: number;
      maxW?: number;
      lineGap?: number;
      font?: "helvetica" | "times";
    } = {},
  ) => {
    const size = opts.size ?? 10;
    const font = opts.font ?? "helvetica";
    const style = opts.bold
      ? opts.italic
        ? "bolditalic"
        : "bold"
      : opts.italic
        ? "italic"
        : "normal";
    doc.setFont(font, style);
    doc.setFontSize(size);
    setInk(opts.color ?? INK);
    const maxW = opts.maxW ?? CONTENT_W;
    const x = opts.x ?? M;
    const lines = doc.splitTextToSize(txt, maxW);
    const gap = opts.lineGap ?? size + 3;
    for (const l of lines) {
      ensureSpace(gap);
      doc.text(l, x, y);
      y += gap;
    }
  };

  const uppercase = (
    txt: string,
    opts: { size?: number; color?: [number, number, number]; x?: number } = {},
  ) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(opts.size ?? 8);
    doc.setCharSpace(1.4);
    setInk(opts.color ?? MUTED);
    doc.text(txt.toUpperCase(), opts.x ?? M, y);
    doc.setCharSpace(0);
    y += (opts.size ?? 8) + 4;
  };

  const rule = () => {
    ensureSpace(10);
    setStroke(BORDER);
    doc.setLineWidth(0.6);
    doc.line(M, y, M + CONTENT_W, y);
    y += 10;
  };

  const cardOpen = (title: string) => {
    ensureSpace(60);
    const top = y;
    y += 14;
    uppercase(title, { size: 8, color: MUTED });
    y += 4;
    return top;
  };

  const cardClose = (top: number) => {
    const bottom = y + 8;
    setFill(CARD_BG);
    setStroke(BORDER);
    doc.setLineWidth(0.7);
    doc.roundedRect(M - 6, top - 4, CONTENT_W + 12, bottom - top, 6, 6, "FD");
    // redraw contents on top
    // jsPDF renders in order — we need to redraw. Workaround: draw
    // background BEFORE content is not possible here without buffering.
    // Instead we draw only a thin left accent bar + border so background
    // stays clean.
    y = bottom + 12;
  };

  // Header banner
  setFill(HEADER_BG);
  doc.rect(0, 0, PAGE_W, 96, "F");
  setInk([180, 180, 180]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setCharSpace(2);
  doc.text("STUDIO AKRASIA · SÉ DIALOGICO", M, 36);
  doc.setCharSpace(0);
  setInk(HEADER_FG);
  doc.setFont("times", "normal");
  doc.setFontSize(22);
  doc.text("Report individuale", M, 68);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setInk([180, 180, 180]);
  doc.text(
    `Analisi dialogica dei processi decisionali akratici`,
    M,
    84,
  );
  y = 128;

  // Session card — key/value grid
  const kv = (label: string, value: string, col: number) => {
    const colW = CONTENT_W / 2;
    const x = M + col * colW;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setCharSpace(1.2);
    setInk(MUTED);
    doc.text(label.toUpperCase(), x, y);
    doc.setCharSpace(0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    setInk(INK);
    doc.text(value, x, y + 14);
  };

  ensureSpace(60);
  setFill(CARD_BG);
  setStroke(BORDER);
  doc.setLineWidth(0.7);
  doc.roundedRect(M - 6, y - 4, CONTENT_W + 12, 74, 6, 6, "FD");
  y += 12;
  kv("ID Partecipante", profile.participantId, 0);
  kv("Contesto ecologico", contextLabel(profile.context, profile.contextCustom), 1);
  y += 32;
  kv("Apertura sessione", formatDateTime(profile.startedAt), 0);
  kv("Durata sessione", formatDuration(profile.startedAt, profile.endedAt), 1);
  y += 32;

  // Section: Struttura del Sé
  uppercase("Sezione 1 · Struttura del Sé", { size: 8 });
  rule();
  for (const p of profile.positions) {
    const v = profile.continuum[p.id]?.value ?? 50;
    ensureSpace(28);
    // bullet dot sized like radius
    const rr = Math.max(3, Math.min(9, p.radius / 4));
    setFill(p.belonging === "internal" ? [70, 90, 130] : [120, 130, 150]);
    doc.circle(M + 6, y - 3, rr, "F");
    doc.setFont("times", "italic");
    doc.setFontSize(12);
    setInk(INK);
    doc.text(p.label, M + 22, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setInk(MUTED);
    doc.text(
      `${p.belonging === "internal" ? "Sé Interno" : "Sé Esterno"} · importanza ${p.dimension} · ${orientation(v)}`,
      M + 22,
      y + 12,
    );
    y += 26;
  }
  y += 6;

  // Section: Scenari
  uppercase("Sezione 2 · Scenari di Akrasia", { size: 8 });
  rule();
  for (const s of SCENARIOS) {
    const e = profile.scenarios[s.id];
    const d = diagnostics[s.id];
    const hex = DIAGNOSTIC_HEX[d];
    const rgb: [number, number, number] = [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
    ensureSpace(110);
    const top = y;
    y += 14;
    // Left accent bar
    setFill(rgb);
    doc.rect(M - 6, top - 4, 3, 0, "F"); // placeholder; final height set later

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setCharSpace(1.4);
    setInk(MUTED);
    doc.text(s.theme.toUpperCase().slice(0, 90), M + 6, y);
    doc.setCharSpace(0);
    y += 12;

    doc.setFont("times", "normal");
    doc.setFontSize(14);
    setInk(INK);
    doc.text(s.title, M + 6, y);
    y += 18;

    // Diagnostic badge
    setFill(rgb);
    const badge = DIAGNOSTIC_LABEL[d].toUpperCase();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setCharSpace(1.2);
    const badgeW = doc.getTextWidth(badge) + 14;
    doc.roundedRect(M + 6, y - 9, badgeW, 14, 7, 7, "F");
    setInk([255, 255, 255]);
    doc.text(badge, M + 6 + 7, y);
    doc.setCharSpace(0);
    // Choice pill
    const choiceStr = `SCELTA ${e.choice ?? "—"}`;
    const chX = M + 6 + badgeW + 8;
    setFill(INK);
    const chW = doc.getTextWidth(choiceStr) + 14;
    doc.roundedRect(chX, y - 9, chW, 14, 7, 7, "F");
    setInk([255, 255, 255]);
    doc.text(choiceStr, chX + 7, y);
    y += 16;

    // Open response — as blockquote
    text(`« ${e.openResponse} »`, {
      size: 10.5,
      italic: true,
      font: "times",
      color: INK,
      x: M + 14,
      maxW: CONTENT_W - 20,
    });
    // Left quote line
    setStroke(rgb);
    doc.setLineWidth(1.4);

    const winLabels = e.winningVoiceIds
      .map((id) => profile.positions.find((p) => p.id === id)?.label)
      .filter(Boolean)
      .join(" · ");
    const loseLabels = e.losingVoiceIds
      .map((id) => profile.positions.find((p) => p.id === id)?.label)
      .filter(Boolean)
      .join(" · ");

    y += 4;
    uppercase("Voci vincenti (alleanza)", { size: 7.5, color: MUTED });
    text(winLabels || "—", { size: 10 });
    uppercase("Voci perdenti (sottomissione)", { size: 7.5, color: MUTED });
    text(loseLabels || "—", { size: 10 });

    y += 2;
    // description
    text(DIAGNOSTIC_DESCRIPTION[d], {
      size: 9.5,
      italic: true,
      color: MUTED,
      font: "times",
    });

    // Border around the scenario card
    const bottom = y + 6;
    setStroke(BORDER);
    doc.setLineWidth(0.6);
    doc.roundedRect(M - 6, top - 4, CONTENT_W + 12, bottom - top, 6, 6, "S");
    // left color bar
    setFill(rgb);
    doc.rect(M - 6, top - 4, 3, bottom - top, "F");
    y = bottom + 12;
  }

  // Interview section
  if (interview && (interview.transcript || interview.annotations.length)) {
    doc.addPage();
    y = M;
    // Header ribbon
    setFill(HEADER_BG);
    doc.rect(0, 0, PAGE_W, 60, "F");
    setInk(HEADER_FG);
    doc.setFont("times", "normal");
    doc.setFontSize(18);
    doc.text("Intervista post-test", M, 40);
    y = 88;

    uppercase("Trascrizione integrale", { size: 8 });
    rule();
    text(
      interview.transcript.trim() || "(Nessuna trascrizione inserita.)",
      { size: 10.5, font: "times", lineGap: 14 },
    );
    y += 8;

    uppercase("Testo con lessico critico evidenziato", { size: 8 });
    rule();
    if (interview.transcript.trim()) {
      const segs = buildSegments(interview.transcript, interview.annotations);
      for (const s of segs) {
        if (s.matrix) {
          const label = MATRIX_LABEL[s.matrix].split(" ").slice(-1)[0];
          text(`⟦${label}: ${s.text}⟧`, {
            size: 10,
            bold: true,
            color: s.matrix === "neolib" ? [140, 60, 155] : [45, 90, 165],
          });
        } else {
          text(s.text, { size: 10, font: "times", lineGap: 13 });
        }
      }
    } else {
      text("(Nessuna trascrizione inserita.)", { size: 10, color: MUTED });
    }
    y += 8;

    uppercase("Annotazioni e note analitiche", { size: 8 });
    rule();
    if (interview.annotations.length === 0) {
      text("(Nessuna annotazione inserita.)", { size: 10, color: MUTED });
    } else {
      const sorted = [...interview.annotations].sort(
        (a, b) => a.start - b.start,
      );
      sorted.forEach((a, i) => {
        ensureSpace(40);
        const top = y;
        y += 4;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        setInk(ACCENT);
        doc.text(`Nota #${i + 1}`, M + 6, y + 8);
        y += 18;
        text(`« ${a.quote} »`, {
          size: 10,
          italic: true,
          font: "times",
          x: M + 14,
          maxW: CONTENT_W - 20,
        });
        text(a.note || "(senza nota)", { size: 10, color: MUTED, x: M + 14, maxW: CONTENT_W - 20 });
        const bottom = y + 6;
        setStroke(BORDER);
        doc.setLineWidth(0.6);
        doc.roundedRect(M - 6, top, CONTENT_W + 12, bottom - top, 5, 5, "S");
        y = bottom + 10;
      });
    }
  }

  // Footer with page numbers
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setInk(MUTED);
    doc.text(
      `${profile.participantId}  ·  ${formatDateTime(Date.now())}`,
      M,
      PAGE_H - 20,
    );
    doc.text(`${i} / ${total}`, PAGE_W - M, PAGE_H - 20, { align: "right" });
  }

  doc.save(`${profile.participantId}.pdf`);
  // suppress unused-var lint for helpers we keep for future use
  void cardOpen;
  void cardClose;
}

function exportAggregatePDF(
  profiles: Profile[],
  dist: Record<ScenarioId, Record<DiagnosticColor, number>>,
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const M = 40;
  let y = M;
  const line = (txt: string, size = 10, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(txt, 515);
    for (const l of lines) {
      if (y > 780) {
        doc.addPage();
        y = M;
      }
      doc.text(l, M, y);
      y += size + 4;
    }
  };
  line("Studio Akrasia & Sé Dialogico — Report aggregato", 14, true);
  line(`Partecipanti totali: ${profiles.length}`);
  line(`Generato il ${formatDateTime(Date.now())}`);
  y += 8;

  for (const s of SCENARIOS) {
    line(s.title, 12, true);
    (Object.keys(DIAGNOSTIC_LABEL) as DiagnosticColor[]).forEach((k) => {
      line(`  ${DIAGNOSTIC_LABEL[k]}: ${dist[s.id][k]}`);
    });
    y += 4;
  }

  y += 8;
  line("Elenco partecipanti", 12, true);
  for (const p of profiles) {
    line(
      `• ${p.participantId} — ${contextLabel(p.context, p.contextCustom)} — ${formatDateTime(p.startedAt)}`,
    );
  }
  doc.save("report-aggregato.pdf");
}
