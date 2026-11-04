import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SelfGraph } from "@/components/SelfGraph";
import { InterviewSection } from "@/components/InterviewSection";
import { buildSegments, MATRIX_LABEL } from "@/lib/lexicon";
import {
  COLONIZATION_BADGE,
  PERFORMATIVE_NARRATIVES,
  PROTECTIVE_NARRATIVES,
  SCENARIOS,
  contextLabel,
  narrativeDomain,
  useResearchStore,
  type ScenarioId,
  type InterviewData,
} from "@/store/research";
import type { Profile } from "@/store/research";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import { renderToStaticMarkup } from "react-dom/server";

import { deleteProfileRemote, fetchProfilesRemote } from "@/lib/sessionsRepo";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/researcher")({
  head: () => ({ meta: [{"title": "Dashboard Ricercatore — AKRASIA"}, {"name": "description", "content": "Analisi dialogica dei processi decisionali akratici nelle sessioni raccolte."}, {"property": "og:title", "content": "Dashboard Ricercatore — AKRASIA"}, {"property": "og:description", "content": "Analisi dialogica dei processi decisionali akratici nelle sessioni raccolte."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
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

  const liveProfile: { profile: Profile; inProgress: boolean } | null = useMemo(() => {
    if (
      !store.participantId ||
      !store.context
    ) {
      return null;
    }
    const allScenariosComplete = SCENARIOS.every((s) => {
      const e = store.scenarios[s.id];
      return (
        e.locked &&
        e.emotionalResponse.trim().length > 0 &&
        e.winningVoiceIds.length > 0 &&
        e.losingVoiceIds.length > 0
      );
    });
    const profile: Profile = {
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
    return { profile, inProgress: !allScenariosComplete };
  }, [store]);

  const profileMeta: Record<string, { inProgress: boolean }> = useMemo(() => {
    const m: Record<string, { inProgress: boolean }> = {};
    if (liveProfile) {
      m[liveProfile.profile.participantId] = { inProgress: liveProfile.inProgress };
    }
    return m;
  }, [liveProfile]);

  const [remoteProfiles, setRemoteProfiles] = useState<Profile[]>([]);
  // Identificativi rimossi in questa sessione di dashboard: servono a nascondere
  // anche le copie locali (sessione in corso / archivio su questo dispositivo).
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  // Archivio permanente condiviso: tutte le sessioni inviate dai partecipanti.
  useEffect(() => {
    let alive = true;
    fetchProfilesRemote()
      .then((rows) => {
        if (alive) setRemoteProfiles(rows);
      })
      .catch((err) => console.error("Lettura archivio non riuscita", err));
    return () => {
      alive = false;
    };
  }, []);

  const profiles: Profile[] = useMemo(() => {
    const seen = new Set<string>();
    const out: Profile[] = [];
    const push = (p: Profile) => {
      if (seen.has(p.participantId)) return;
      seen.add(p.participantId);
      out.push(p);
    };
    if (liveProfile) push(liveProfile.profile);
    remoteProfiles.forEach(push);
    store.archivedProfiles.forEach(push);
    return out.filter((p) => !deletedIds.includes(p.participantId));
  }, [liveProfile, remoteProfiles, store.archivedProfiles, deletedIds]);

  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "in_progress"
  >("all");

  const isInProgress = (p: Profile) =>
    profileMeta[p.participantId]?.inProgress ?? false;

  const visibleProfiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = profiles.filter((p) =>
      q ? p.participantId.toLowerCase().includes(q) : true,
    );
    if (statusFilter !== "all") {
      const want = statusFilter === "in_progress";
      list = list.filter((p) => isInProgress(p) === want);
    }
    list = [...list].sort((a, b) =>
      sortDir === "desc"
        ? b.startedAt - a.startedAt
        : a.startedAt - b.startedAt,
    );
    return list;
  }, [profiles, query, sortDir, statusFilter, profileMeta]);

  const [selectedId, setSelectedId] = useState<string>(
    profiles[0]?.participantId ?? "",
  );
  const selected =
    visibleProfiles.find((p) => p.participantId === selectedId) ??
    visibleProfiles[0] ??
    profiles[0];
  const [view, setView] = useState<"individual" | "aggregate">("individual");
  const [showNumbers, setShowNumbers] = useState(false);

  const removeArchivedProfile = useResearchStore(
    (s) => s.removeArchivedProfile,
  );
  const [pendingDelete, setPendingDelete] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    const target = pendingDelete;
    if (!target) return;
    setDeleting(true);
    try {
      // La rimozione dalla UI avviene solo dopo la conferma dal database cloud.
      if (!target.demo) await deleteProfileRemote(target.participantId);
      setRemoteProfiles((rows) =>
        rows.filter((r) => r.participantId !== target.participantId),
      );
      removeArchivedProfile(target.participantId);
      setDeletedIds((ids) =>
        ids.includes(target.participantId) ? ids : [...ids, target.participantId],
      );
      // Se la sessione eliminata è quella ancora attiva su questo dispositivo,
      // azzera lo stato locale per non farla riapparire.
      if (useResearchStore.getState().participantId === target.participantId) {
        useResearchStore.getState().resetSession();
      }
      if (selectedId === target.participantId) setSelectedId("");
      toast.success(`Sessione "${target.participantId}" eliminata.`);
      setPendingDelete(null);
    } catch (err) {
      console.error("[Dashboard] Errore durante l'eliminazione dal database", err);
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "";
      toast.error(
        `Errore durante l'eliminazione dal database${msg ? `: ${msg}` : ""}`,
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              DASHBOARD RICERCATORE — AKRASIA E SÉ DIALOGICO
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
            <span>
              {visibleProfiles.length}/{profiles.length}
            </span>
          </div>
          <div className="space-y-2 rounded-md border border-border bg-card p-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca username…"
              className="h-8 text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Ordina
                <select
                  value={sortDir}
                  onChange={(e) =>
                    setSortDir(e.target.value as "desc" | "asc")
                  }
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
                >
                  <option value="desc">Più recenti</option>
                  <option value="asc">Meno recenti</option>
                </select>
              </label>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Stato
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as "all" | "completed" | "in_progress",
                    )
                  }
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
                >
                  <option value="all">Tutti</option>
                  <option value="completed">Completata</option>
                  <option value="in_progress">In corso</option>
                </select>
              </label>
            </div>
          </div>
          {visibleProfiles.length === 0 && (
            <p className="rounded-md border border-dashed border-border bg-card px-3 py-4 text-center text-[11px] text-muted-foreground">
              {profiles.length === 0
                ? "Nessuna sessione registrata. Le nuove compilazioni dei partecipanti compariranno qui in tempo reale."
                : "Nessun profilo corrisponde ai filtri."}
            </p>
          )}
          {visibleProfiles.map((p) => {
            const isSel = p.participantId === selected?.participantId;
            const isLive = true;
            const inProg = isInProgress(p);
            return (
              <div key={p.participantId} className="relative">
              <button
                onClick={() => setSelectedId(p.participantId)}
                className={cn(
                  "w-full rounded-md border px-3 py-3 pr-10 text-left transition-colors",
                  isSel
                    ? "border-foreground bg-muted"
                    : "border-border bg-card hover:border-foreground/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {p.participantId}
                  </span>
                  <div className="flex items-center gap-1">
                    {inProg ? (
                      <span className="rounded border border-amber-500/60 bg-amber-500/10 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-amber-700 dark:text-amber-300">
                        In corso
                      </span>
                    ) : (
                      <span className="rounded border border-emerald-600/60 bg-emerald-600/10 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
                        Completata
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {contextLabel(p.context, p.contextCustom)}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {formatDateTime(p.startedAt)}
                </div>
              </button>
              {isLive && (
                <button
                  type="button"
                  aria-label={`Elimina la sessione di ${p.participantId}`}
                  title="Elimina sessione"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingDelete(p);
                  }}
                  className="absolute right-2 top-2 rounded-md px-1.5 py-1 text-[9px] uppercase tracking-widest text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  Elimina
                </button>
              )}
              </div>
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
              {profiles.length === 0
                ? "Nessuna sessione registrata. Le nuove compilazioni dei partecipanti compariranno qui in tempo reale."
                : "Nessun profilo selezionato."}
            </div>
          )}
        </section>
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare la sessione?</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare la sessione di{" "}
              <span className="font-medium text-foreground">
                {pendingDelete?.participantId}
              </span>
              ? Questa azione è irreversibile e rimuoverà permanentemente i
              dati dal database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Eliminazione…" : "Conferma ed Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
  const clinicalNotes = useResearchStore(
    (s) => s.clinicalNotes[profile.participantId],
  ) as Partial<Record<ScenarioId, string>> | undefined;
  const displayId = pinnedId ?? hoverId;
  const hovered = profile.positions.find((p) => p.id === displayId);
  const hoveredValue =
    displayId != null ? profile.continuum[displayId]?.value ?? 50 : null;

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
            onClick={() => {
              void exportProfilePDF(
                profile,
                interview,
                clinicalNotes,
              );
            }}
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
                    Scenario {i + 1}
                  </button>
                ))}
              </div>
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
            title="Narrazioni neoliberiste-razionaliste-individualiste"
            tone="performative"
            items={PERFORMATIVE_NARRATIVES}
            profile={profile}
          />
          <NarrativeBlock
            title="Contronarrazioni relazionali-del benessere"
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
            return (
              <article
                key={s.id}
                className="rounded-md border-l-4 border border-border bg-background p-5"
                style={{ borderLeftColor: "var(--color-foreground)" }}
              >
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.theme}
                </div>
                <h3 className="mt-1 font-serif text-lg">{s.title}</h3>

                <blockquote className="mt-4 border-l-2 border-foreground/40 bg-muted/40 py-2 pl-4 text-sm italic leading-relaxed">
                  «{e.openResponse}»
                </blockquote>

                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Vissuto emotivo
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">
                    {e.emotionalResponse?.trim() || "—"}
                  </p>
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
          const entries = Object.entries(
            profile.narrativeColonization[n] ?? {},
          );
          return (
            <li
              key={n}
              className="rounded-md border border-border bg-background p-3"
            >
              <p className="text-xs italic text-foreground">«{n}»</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {entries.length === 0 ? (
                  <span className="text-[10px] text-muted-foreground">
                    Nessuna voce attivata.
                  </span>
                ) : (
                  entries.map(([id, mode]) => {
                    const p = profile.positions.find((x) => x.id === id);
                    if (!p) return null;
                    return (
                      <span
                        key={id}
                        className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px]"
                      >
                        {p.label}
                        <span className="ml-1 text-muted-foreground">
                          · {COLONIZATION_BADGE[mode]}
                        </span>
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
    for (const [narr, modes] of Object.entries(profile.narrativeColonization)) {
      if (!(p.id in modes)) continue;
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
  if (rational && perf >= 3) return "Voce razionale intensamente colonizzata dalle narrazioni performative.";
  if (moral && prot >= 3) return "Voce morale sostenuta da contro-narrazioni del benessere.";
  if (moral && perf >= 2) return "Voce morale sotto pressione performativa (rischio di sacrificio).";
  if (rational && prot >= 2) return "Voce razionale attraversata da contro-narrazioni del benessere (potenziale attrito).";
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

  // Ranking narrazioni più diffuse (totale attivazioni)
  const narrTotals = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of profiles) {
      for (const [narr, modes] of Object.entries(p.narrativeColonization)) {
        counts[narr] = (counts[narr] ?? 0) + Object.keys(modes).length;
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
            onClick={() => exportAggregatePDF(profiles)}
          >
            Esporta report aggregato (PDF)
          </Button>
        </div>
      </Card>

      <Card title="Narrazioni più attivanti">
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
                      {count} attivazioni
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
    JSON.stringify(
      {
        ...profile,
        interview: interview ?? null,
        scenarioDefinitions: SCENARIOS.map((s) => ({
          id: s.id,
          title: s.title,
          theme: s.theme,
          text: s.text,
        })),
      },
      null,
      2,
    ),
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
        scenarioDefinitions: SCENARIOS.map((s) => ({
          id: s.id,
          title: s.title,
          theme: s.theme,
          text: s.text,
        })),
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

async function svgElementToPngDataUrl(
  svgMarkup: string,
  targetWidth: number,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const withXmlns = svgMarkup.includes("xmlns=")
    ? svgMarkup
    : svgMarkup.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  const svg64 = btoa(unescape(encodeURIComponent(withXmlns)));
  const src = `data:image/svg+xml;base64,${svg64}`;
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const w = img.width || 620;
      const h = img.height || 620;
      const scale = targetWidth / w;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(w * scale * 2);
      canvas.height = Math.round(h * scale * 2);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("canvas ctx"));
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve({
        dataUrl: canvas.toDataURL("image/png"),
        width: targetWidth,
        height: targetWidth * (h / w),
      });
    };
    img.onerror = () => reject(new Error("svg image load failed"));
    img.src = src;
  });
}

async function renderSelfGraphImage(
  profile: Profile,
  targetWidth: number,
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  try {
    const markup = renderToStaticMarkup(
      <SelfGraph
        positions={profile.positions}
        continuum={profile.continuum}
      />,
    );
    // Inline SVG colors (SelfGraph uses CSS custom properties). Replace
    // the few var(--...) references with concrete values so the raster
    // rendering does not depend on the current document stylesheet.
    const inlined = markup
      .replace(/var\(--color-border\)/g, "#dcdce0")
      .replace(/var\(--color-muted\)/g, "#f4f4f2")
      .replace(/currentColor/g, "#6e7480");
    // Force explicit width so the browser can measure the SVG.
    const sized = inlined.replace(
      /<svg([^>]*)>/,
      '<svg$1 width="620" height="620">',
    );
    return await svgElementToPngDataUrl(sized, targetWidth);
  } catch {
    return null;
  }
}

async function exportProfilePDF(
  profile: Profile,
  interview?: InterviewData,
  clinicalNotes?: Partial<Record<ScenarioId, string>>,
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
    const gap = opts.lineGap ?? Math.round(size * 1.5);
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
    const size = opts.size ?? 8;
    ensureSpace(size + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setCharSpace(1.4);
    setInk(opts.color ?? MUTED);
    doc.text(txt.toUpperCase(), opts.x ?? M, y);
    doc.setCharSpace(0);
    y += size + 6;
  };

  const rule = () => {
    ensureSpace(12);
    setStroke(BORDER);
    doc.setLineWidth(0.6);
    doc.line(M, y, M + CONTENT_W, y);
    y += 14;
  };

  const currentPage = () => doc.getCurrentPageInfo().pageNumber;

  // Draws a card frame (border + left accent) across every page the card
  // spans, so long content can flow onto new pages without being clipped.
  const drawCardFrame = (
    startPage: number,
    startY: number,
    endPage: number,
    endY: number,
    accent?: [number, number, number],
  ) => {
    const last = currentPage();
    for (let p = startPage; p <= endPage; p++) {
      doc.setPage(p);
      const top = p === startPage ? startY - 6 : M - 14;
      const bottom = p === endPage ? endY : PAGE_H - M + 6;
      if (bottom - top < 6) continue;
      setStroke(BORDER);
      doc.setLineWidth(0.6);
      doc.roundedRect(M - 6, top, CONTENT_W + 12, bottom - top, 6, 6, "S");
      if (accent) {
        setFill(accent);
        doc.rect(M - 6, top, 3, bottom - top, "F");
      }
    }
    doc.setPage(last);
  };

  // Simple, page-break-aware table renderer
  const table = (
    headers: string[],
    rows: string[][],
    widths: number[],
  ) => {
    const colX = (i: number) =>
      M + widths.slice(0, i).reduce((a, b) => a + b, 0);
    const header = () => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setCharSpace(0.8);
      setInk(MUTED);
      headers.forEach((h, i) =>
        doc.text(doc.splitTextToSize(h.toUpperCase(), widths[i] - 6)[0], colX(i), y),
      );
      doc.setCharSpace(0);
      y += 8;
      setStroke(BORDER);
      doc.setLineWidth(0.6);
      doc.line(M, y, M + CONTENT_W, y);
      y += 12;
    };
    ensureSpace(46);
    header();
    for (const row of rows) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const cells = row.map((c, i) =>
        doc.splitTextToSize(c || "—", widths[i] - 8),
      );
      const h = Math.max(...cells.map((c) => c.length)) * 12 + 8;
      if (y + h > PAGE_H - M) {
        doc.addPage();
        y = M;
        header();
      }
      setInk(INK);
      cells.forEach((lines, i) => {
        lines.forEach((l: string, li: number) => {
          setInk(i === 0 ? INK : MUTED);
          doc.text(l, colX(i), y + li * 12);
        });
      });
      y += h;
      setStroke(BORDER);
      doc.setLineWidth(0.4);
      doc.line(M, y - 6, M + CONTENT_W, y - 6);
    }
    y += 8;
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
  doc.text("STRUMENTO DI RICERCA — AKRASIA E SÉ DIALOGICO", M, 36);
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
  doc.roundedRect(M - 6, y - 4, CONTENT_W + 12, 96, 6, 6, "FD");
  y += 16;
  kv("ID Partecipante", profile.participantId, 0);
  kv("Contesto ecologico", contextLabel(profile.context, profile.contextCustom), 1);
  y += 40;
  kv("Apertura sessione", formatDateTime(profile.startedAt), 0);
  kv("Durata sessione", formatDuration(profile.startedAt, profile.endedAt), 1);
  y += 44;

  // Section: Grafico del Sé (raster snapshot of the on-screen SVG)
  uppercase("Grafico del Sé — Società del Sé", { size: 8 });
  rule();
  const graph = await renderSelfGraphImage(profile, CONTENT_W * 0.72);
  if (graph) {
    ensureSpace(graph.height + 20);
    const gx = M + (CONTENT_W - graph.width) / 2;
    doc.addImage(graph.dataUrl, "PNG", gx, y, graph.width, graph.height);
    y += graph.height + 22;
  }

  // Section: Struttura del Sé
  uppercase("Sezione 1 · Struttura del Sé", { size: 8 });
  rule();
  for (const p of profile.positions) {
    const v = profile.continuum[p.id]?.value ?? 50;
    ensureSpace(34);
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
    y += 32;
  }
  y += 10;

  // Section: Valutazione continuum (mirrors dashboard section 3)
  uppercase("Sezione 3 · Valutazione Continuum", { size: 8 });
  rule();
  table(
    ["I-Position", "Appartenenza", "Importanza", "Continuum", "Orientamento"],
    profile.positions.map((p) => {
      const v = profile.continuum[p.id]?.value ?? 50;
      return [
        p.label,
        p.belonging === "internal" ? "Sé Interno" : "Sé Esterno",
        String(p.dimension),
        `${v}/100`,
        orientation(v),
      ];
    }),
    [150, 78, 78, 62, CONTENT_W - 368],
  );
  y += 6;

  // Section: Mappa delle narrazioni (mirrors dashboard section 4)
  uppercase("Sezione 4 · Mappa delle Narrazioni", { size: 8 });
  rule();
  const narrativeGroup = (title: string, items: readonly string[]) => {
    uppercase(title, { size: 7.5, color: MUTED });
    for (const n of items) {
      ensureSpace(30);
      text(`« ${n} »`, {
        size: 9.5,
        italic: true,
        font: "times",
        lineGap: 13,
        x: M + 8,
        maxW: CONTENT_W - 16,
      });
      const entries = Object.entries(profile.narrativeColonization[n] ?? {});
      const labels = entries
        .map(([id, mode]) => {
          const label = profile.positions.find((p) => p.id === id)?.label;
          return label ? `${label} (${COLONIZATION_BADGE[mode]})` : null;
        })
        .filter(Boolean)
        .join(" · ");
      text(labels || "Nessuna voce attivata.", {
        size: 9,
        color: MUTED,
        lineGap: 12,
        x: M + 8,
        maxW: CONTENT_W - 16,
      });
      y += 6;
    }
    y += 6;
  };
  narrativeGroup(
    "Narrazioni neoliberiste-razionaliste-individualiste",
    PERFORMATIVE_NARRATIVES,
  );
  narrativeGroup(
    "Contronarrazioni relazionali-del benessere",
    PROTECTIVE_NARRATIVES,
  );

  // Section: Matrice continuum × colonizzazione (dashboard section 4b)
  uppercase("Sezione 4b · Matrice Continuum × Colonizzazione", { size: 8 });
  rule();
  table(
    [
      "I-Position",
      "Orientamento",
      "Performative",
      "Benessere",
      "Sintesi",
    ],
    profile.positions.map((p) => {
      const v = profile.continuum[p.id]?.value ?? 50;
      let perf = 0;
      let prot = 0;
      for (const [narr, modes] of Object.entries(profile.narrativeColonization)) {
        if (!(p.id in modes)) continue;
        const d = narrativeDomain(narr);
        if (d === "performative") perf++;
        else if (d === "protective") prot++;
      }
      return [
        p.label,
        `${orientation(v)} (${v})`,
        `${perf}/${PERFORMATIVE_NARRATIVES.length}`,
        `${prot}/${PROTECTIVE_NARRATIVES.length}`,
        matrixSynthesis(v, perf, prot),
      ];
    }),
    [104, 92, 82, 78, CONTENT_W - 356],
  );
  y += 6;

  // Section: Scenari (dashboard section 5)
  uppercase("Sezione 5 · Analisi Scenari Akratici", { size: 8 });
  rule();
  for (const s of SCENARIOS) {
    const e = profile.scenarios[s.id];
    const rgb: [number, number, number] = ACCENT;
    ensureSpace(120);
    const top = y;
    const startPage = currentPage();
    y += 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setCharSpace(1.4);
    setInk(MUTED);
    doc.text(s.theme.toUpperCase().slice(0, 90), M + 10, y);
    doc.setCharSpace(0);
    y += 16;

    text(s.title, {
      size: 14,
      font: "times",
      x: M + 10,
      maxW: CONTENT_W - 24,
      lineGap: 18,
    });
    y += 6;

    // Testo integrale della vignetta
    text(s.text, {
      size: 9.5,
      color: MUTED,
      x: M + 10,
      maxW: CONTENT_W - 24,
      lineGap: 13,
    });
    y += 12;

    // Open response — as blockquote
    uppercase("Riflessione del partecipante", { size: 7.5, color: MUTED, x: M + 10 });
    text(`« ${e.openResponse} »`, {
      size: 10.5,
      italic: true,
      font: "times",
      color: INK,
      x: M + 18,
      maxW: CONTENT_W - 36,
      lineGap: 16,
    });

    // Vissuto emotivo
    y += 6;
    uppercase("Vissuto emotivo", { size: 7.5, color: MUTED, x: M + 10 });
    text(e.emotionalResponse?.trim() || "(Non compilato.)", {
      size: 10,
      color: e.emotionalResponse?.trim() ? INK : MUTED,
      x: M + 18,
      maxW: CONTENT_W - 36,
      lineGap: 15,
    });

    const winLabels = e.winningVoiceIds
      .map((id) => profile.positions.find((p) => p.id === id)?.label)
      .filter(Boolean)
      .join(" · ");
    const loseLabels = e.losingVoiceIds
      .map((id) => profile.positions.find((p) => p.id === id)?.label)
      .filter(Boolean)
      .join(" · ");

    y += 10;
    uppercase("Voci vincenti (alleanza)", { size: 7.5, color: MUTED, x: M + 10 });
    text(winLabels || "—", { size: 10, lineGap: 14, x: M + 10, maxW: CONTENT_W - 24 });
    y += 6;
    uppercase("Voci perdenti (sottomissione)", { size: 7.5, color: MUTED, x: M + 10 });
    text(loseLabels || "—", { size: 10, lineGap: 14, x: M + 10, maxW: CONTENT_W - 24 });

    // Note cliniche del ricercatore
    const note = clinicalNotes?.[s.id]?.trim();
    y += 8;
    uppercase("Note cliniche del ricercatore", { size: 7.5, color: MUTED, x: M + 10 });
    text(note || "(Nessuna nota inserita.)", {
      size: 9.5,
      color: note ? INK : MUTED,
      x: M + 10,
      maxW: CONTENT_W - 24,
      lineGap: 14,
    });

    const bottom = y + 8;
    drawCardFrame(startPage, top, currentPage(), bottom, rgb);
    y = bottom + 22;
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
    doc.text("Sezione 6 · Intervista post-test", M, 40);
    y = 88;

    uppercase("Trascrizione integrale", { size: 8 });
    rule();
    text(
      interview.transcript.trim() || "(Nessuna trascrizione inserita.)",
      { size: 10.5, font: "times", lineGap: 16 },
    );
    y += 14;

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
            lineGap: 15,
          });
        } else {
          text(s.text, { size: 10, font: "times", lineGap: 15 });
        }
      }
    } else {
      text("(Nessuna trascrizione inserita.)", { size: 10, color: MUTED });
    }
    y += 14;

    uppercase("Annotazioni e note analitiche", { size: 8 });
    rule();
    if (interview.annotations.length === 0) {
      text("(Nessuna annotazione inserita.)", { size: 10, color: MUTED });
    } else {
      const sorted = [...interview.annotations].sort(
        (a, b) => a.start - b.start,
      );
      sorted.forEach((a, i) => {
        ensureSpace(60);
        const top = y;
        y += 8;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        setInk(ACCENT);
        doc.text(`Nota #${i + 1}`, M + 10, y + 8);
        y += 22;
        text(`« ${a.quote} »`, {
          size: 10,
          italic: true,
          font: "times",
          x: M + 18,
          maxW: CONTENT_W - 28,
          lineGap: 15,
        });
        y += 2;
        text(a.note || "(senza nota)", {
          size: 10,
          color: MUTED,
          x: M + 18,
          maxW: CONTENT_W - 28,
          lineGap: 14,
        });
        const bottom = y + 10;
        setStroke(BORDER);
        doc.setLineWidth(0.6);
        doc.roundedRect(M - 6, top, CONTENT_W + 12, bottom - top, 5, 5, "S");
        y = bottom + 14;
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

function exportAggregatePDF(profiles: Profile[]) {
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
  line("STRUMENTO DI RICERCA — AKRASIA E SÉ DIALOGICO — Report aggregato", 14, true);
  line(`Partecipanti totali: ${profiles.length}`);
  line(`Generato il ${formatDateTime(Date.now())}`);
  y += 8;

  line("Scenari somministrati", 12, true);
  for (const s of SCENARIOS) {
    line(`  ${s.title} — ${s.theme}`);
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
