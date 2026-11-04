import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressSteps } from "@/components/ProgressSteps";
import { Instruction } from "@/components/Instruction";
import {
  SCENARIOS,
  useResearchStore,
  type ScenarioId,
} from "@/store/research";
import { cn } from "@/lib/utils";
import { StepGate } from "@/lib/stepGating";
import { saveProfileRemote } from "@/lib/sessionsRepo";
import { toast } from "sonner";

export const Route = createFileRoute("/step4")({
  head: () => ({ meta: [{"title": "Vignette — AKRASIA"}, {"name": "description", "content": "Tre scenari per esplorare i processi decisionali akratici e la dinamica dialogica delle voci."}, {"property": "og:title", "content": "Vignette — AKRASIA"}, {"property": "og:description", "content": "Tre scenari per esplorare i processi decisionali akratici e la dinamica dialogica delle voci."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
  component: () => (
    <StepGate level={5}>
      <Step3 />
    </StepGate>
  ),
});

function Step3() {
  const positions = useResearchStore((s) => s.positions);
  const scenarios = useResearchStore((s) => s.scenarios);
  const setResp = useResearchStore((s) => s.setScenarioResponse);
  const lockResp = useResearchStore((s) => s.lockScenarioResponse);
  const setEmotion = useResearchStore((s) => s.setScenarioEmotion);
  const toggleVoice = useResearchStore((s) => s.toggleScenarioVoice);
  const endSession = useResearchStore((s) => s.endSession);
  const archiveAndComplete = useResearchStore((s) => s.archiveAndComplete);

  const [idx, setIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const scenario = SCENARIOS[idx];
  const entry = scenarios[scenario.id];
  const canUnlock = entry.openResponse.trim().length >= 10;

  const complete = (id: ScenarioId) => {
    const e = scenarios[id];
    return (
      e.locked &&
      e.emotionalResponse.trim().length > 0 &&
      (positions.length === 0 ||
        (e.winningVoiceIds.length > 0 && e.losingVoiceIds.length > 0))
    );
  };
  const allComplete = SCENARIOS.every((s) => complete(s.id));

  // Fissa l'istante di completamento sessione quando tutti gli scenari sono chiusi.
  useEffect(() => {
    if (allComplete) endSession();
  }, [allComplete, endSession]);

  // Invio definitivo: archivia la sessione e la salva nell'archivio permanente
  // dell'applicazione, poi porta alla pagina di ringraziamento.
  const handleSubmit = async () => {
    setSubmitting(true);
    endSession();
    archiveAndComplete();
    const state = useResearchStore.getState();
    const profile =
      state.archivedProfiles.find(
        (p) => p.participantId === state.participantId,
      ) ?? null;
    try {
      if (profile) await saveProfileRemote(profile);
    } catch (err) {
      console.error("Salvataggio sessione fallito", err);
      toast.error(
        "Invio all'archivio non riuscito: la sessione resta salvata su questo dispositivo.",
      );
    } finally {
      setSubmitting(false);
      navigate({ to: "/grazie", replace: true });
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ProgressSteps current={5} />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          STEP 4 DI 4
        </p>
        <h1 className="mt-3 font-serif text-3xl font-medium">
          Situazioni Reali
        </h1>

        <div className="mt-6">
          <Instruction>
            Leggi attentamente ciascuno dei seguenti scenari. Per rispondere in
            modo efficace, ti invitiamo a immaginare vividamente la situazione,
            provando a immedesimarti nel protagonista. Se ti aiuta, ripensa a
            eventi del tuo passato che ti hanno fatto sentire in modo simile.
            Rispondi in modo spontaneo e sincero: non esistono risposte giuste
            o sbagliate, ci interessa solo il tuo personale punto di vista.
          </Instruction>
        </div>

        {/* Scenario tabs */}
        <div className="mb-6 flex flex-wrap gap-2 text-xs">
          {SCENARIOS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIdx(i)}
              className={cn(
                "rounded-md border px-3 py-1.5 uppercase tracking-widest transition-colors",
                i === idx
                  ? "border-foreground bg-foreground text-background"
                  : complete(s.id)
                    ? "border-foreground/40 bg-muted text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              Scenario {i + 1}
            </button>
          ))}
        </div>

        <article className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-serif text-2xl font-medium">{scenario.title}</h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground">
            {scenario.text}
          </p>

          {/* Fase A */}
          <div className="mt-8 border-t border-border pt-6">
            <Label
              htmlFor={`resp-${scenario.id}`}
              className="text-xs uppercase tracking-widest text-muted-foreground"
            >
              Fase A — Risposta aperta
            </Label>
            <p className="mt-2 text-sm text-foreground">
              Descrivi in poche righe come affronteresti e risolveresti questa
              situazione se ti trovassi nei panni del protagonista.
            </p>
            <Textarea
              id={`resp-${scenario.id}`}
              value={entry.openResponse}
              onChange={(e) => setResp(scenario.id, e.target.value)}
              disabled={entry.locked}
              placeholder="La tua risposta libera…"
              className="mt-3 min-h-[140px]"
            />
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                {entry.openResponse.trim().length} caratteri
                {!entry.locked && !canUnlock && " · minimo 10 per procedere"}
                {entry.locked &&
                  " · risposta congelata (non più modificabile)"}
              </span>
              {!entry.locked && (
                <Button
                  size="sm"
                  disabled={!canUnlock}
                  onClick={() => lockResp(scenario.id)}
                >
                  Procedi al vissuto emotivo →
                </Button>
              )}
            </div>
          </div>

          {/* Fase B */}
          {entry.locked && (
            <div className="mt-8 border-t border-border pt-6">
              <div className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
                Fase B — Vissuto emotivo & Mappatura delle voci
              </div>

              <Label
                htmlFor={`emotion-${scenario.id}`}
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Vissuto emotivo
              </Label>
              <p className="mt-2 text-sm text-foreground">
                Come ti senti o cosa provi subito dopo aver preso questa
                decisione?
              </p>
              <Textarea
                id={`emotion-${scenario.id}`}
                value={entry.emotionalResponse}
                onChange={(e) => setEmotion(scenario.id, e.target.value)}
                placeholder="Scrivi in poche righe il tuo vissuto emotivo…"
                className="mt-3 min-h-[80px]"
              />

              {positions.length > 0 && (
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <VoiceMultiSelect
                    title="Voci alleate vincenti"
                    hint="Quali parti di te senti che hanno guidato o si sono alleate maggiormente con questa decisione?"
                    positions={positions}
                    selectedIds={entry.winningVoiceIds}
                    onToggle={(pid) =>
                      toggleVoice(scenario.id, "winning", pid)
                    }
                  />
                  <VoiceMultiSelect
                    title="Voci contrarie sconfitte"
                    hint="Quali parti di te senti che sono state messe a tacere, ignorate o sacrificate?"
                    positions={positions}
                    selectedIds={entry.losingVoiceIds}
                    onToggle={(pid) =>
                      toggleVoice(scenario.id, "losing", pid)
                    }
                  />
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={idx === 0}
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
            >
              ← Scenario precedente
            </Button>
            <Button
              size="sm"
              disabled={idx >= SCENARIOS.length - 1 || !complete(scenario.id)}
              onClick={() =>
                setIdx((i) => Math.min(SCENARIOS.length - 1, i + 1))
              }
            >
              Scenario successivo →
            </Button>
          </div>
        </article>

        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          <Button variant="ghost" asChild>
            <Link to="/step3">← Indietro</Link>
          </Button>
          <Button disabled={!allComplete || submitting} onClick={handleSubmit}>
            {submitting ? "Invio in corso…" : "Concludi e invia →"}
          </Button>
        </div>
      </div>
    </main>
  );
}

function VoiceMultiSelect({
  title,
  hint,
  positions,
  selectedIds,
  onToggle,
}: {
  title: string;
  hint: string;
  positions: { id: string; label: string }[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">
        {title}
      </Label>
      <p className="mt-1 mb-3 text-xs text-muted-foreground">{hint}</p>
      <ul className="space-y-1.5">
        {positions.map((p) => {
          const checked = selectedIds.includes(p.id);
          return (
            <li key={p.id}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                  checked
                    ? "border-foreground bg-muted"
                    : "border-border bg-background hover:border-foreground/40",
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => onToggle(p.id)}
                />
                <span>{p.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[10px] text-muted-foreground">
        {selectedIds.length === 0
          ? "Almeno una selezione obbligatoria."
          : `${selectedIds.length} selezionata${selectedIds.length > 1 ? "e" : ""}`}
      </p>
    </div>
  );
}
