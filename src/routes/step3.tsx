import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressSteps } from "@/components/ProgressSteps";
import { Instruction } from "@/components/Instruction";
import {
  SCENARIOS,
  useResearchStore,
  type ScenarioChoice,
  type ScenarioId,
} from "@/store/research";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/step3")({
  component: Step3,
});

function Step3() {
  const positions = useResearchStore((s) => s.positions);
  const scenarios = useResearchStore((s) => s.scenarios);
  const setResp = useResearchStore((s) => s.setScenarioResponse);
  const lockResp = useResearchStore((s) => s.lockScenarioResponse);
  const setChoice = useResearchStore((s) => s.setScenarioChoice);
  const toggleVoice = useResearchStore((s) => s.toggleScenarioVoice);

  const [idx, setIdx] = useState(0);

  if (positions.length === 0) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <ProgressSteps current={4} />
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="font-serif text-2xl font-medium">
            Nessuna I-Position dichiarata
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Le vignette richiedono le posizioni identitarie dello Step 1.
          </p>
          <Button asChild className="mt-6">
            <Link to="/step1">← Torna allo Step 1</Link>
          </Button>
        </div>
      </main>
    );
  }

  const scenario = SCENARIOS[idx];
  const entry = scenarios[scenario.id];
  const canUnlock = entry.openResponse.trim().length >= 10;

  const complete = (id: ScenarioId) => {
    const e = scenarios[id];
    return (
      e.locked &&
      !!e.choice &&
      e.winningVoiceIds.length > 0 &&
      e.losingVoiceIds.length > 0
    );
  };
  const allComplete = SCENARIOS.every((s) => complete(s.id));

  const OPTIONS: {
    k: ScenarioChoice;
    tag: string;
    polarity: string;
    label: string;
  }[] = [
    { k: "A", tag: "Opzione A", polarity: "Autotutela", label: scenario.optionA },
    {
      k: "B",
      tag: "Opzione B",
      polarity: "Iper-performance",
      label: scenario.optionB,
    },
    {
      k: "C",
      tag: "Opzione C",
      polarity: "Via di mezzo",
      label: scenario.optionC,
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ProgressSteps current={4} />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Step 3 di 3
        </p>
        <h1 className="mt-3 font-serif text-3xl font-medium">
          La Dinamica Dialogica — Vignette Cliniche
        </h1>

        <div className="mt-6">
          <Instruction>
            Leggi attentamente ciascuno dei seguenti scenari. Per rispondere in
            modo efficace, ti invitiamo a immaginare vivamente la situazione,
            provando a immedesimarti nel protagonista. Se ti aiuta, ripensa a
            eventi del tuo passato che ti hanno fatto sentire in modo simile.
            Rispondi nel modo più sincero e autentico possibile: non esistono
            risposte giuste o sbagliate, ma solo modi diversi di dialogare con
            se stessi.
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
              {complete(s.id) && " ✓"}
            </button>
          ))}
        </div>

        <article className="rounded-lg border border-border bg-card p-6">
          <div className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            {scenario.theme}
          </div>
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
                  Procedi alla scelta guidata →
                </Button>
              )}
            </div>
          </div>

          {/* Fase B */}
          {entry.locked && (
            <div className="mt-8 border-t border-border pt-6">
              <div className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
                Fase B — Scelta guidata & Mappatura delle voci
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {OPTIONS.map((o) => {
                  const selected = entry.choice === o.k;
                  return (
                    <button
                      key={o.k}
                      onClick={() => setChoice(scenario.id, o.k)}
                      className={cn(
                        "rounded-md border p-4 text-left text-sm leading-relaxed transition-colors",
                        selected
                          ? "border-foreground bg-muted"
                          : "border-border bg-background hover:border-foreground/40",
                      )}
                    >
                      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                        <span>{o.tag}</span>
                        <span>{o.polarity}</span>
                      </div>
                      {o.label}
                    </button>
                  );
                })}
              </div>

              {entry.choice && (
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <VoiceMultiSelect
                    title="Voci Vincenti (Alleanza)"
                    hint="Quali parti di te senti che hanno guidato o si sono alleate maggiormente con questa decisione?"
                    positions={positions}
                    selectedIds={entry.winningVoiceIds}
                    onToggle={(pid) =>
                      toggleVoice(scenario.id, "winning", pid)
                    }
                  />
                  <VoiceMultiSelect
                    title="Voci Perdenti (Sottomissione)"
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
            <Link to="/step2">← Indietro</Link>
          </Button>
          <Button asChild disabled={!allComplete}>
            <Link to="/researcher">Concludi →</Link>
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
