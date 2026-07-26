import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { NARRATIVES_SHUFFLED, useResearchStore } from "@/store/research";

export const STEP_META = [
  { label: "Consenso", to: "/consent" as const },
  { label: "Info Sessione", to: "/session-info" as const },
  { label: "Step 1: Struttura del Sé", to: "/step1" as const },
  { label: "Step 2: Continuum delle Voci", to: "/step2" as const },
  { label: "Step 3: Valutazione delle Narrazioni", to: "/step3" as const },
  { label: "Step 4: Vignette", to: "/step4" as const },
];

export type StepPath = (typeof STEP_META)[number]["to"];

export function useMaxUnlockedLevel(): number {
  const consent = useResearchStore((s) => s.consent);
  const participantId = useResearchStore((s) => s.participantId);
  const context = useResearchStore((s) => s.context);
  const contextCustom = useResearchStore((s) => s.contextCustom);
  const positions = useResearchStore((s) => s.positions);
  const continuumTouched = useResearchStore((s) => s.continuumTouched);
  const narrativesSeen = useResearchStore((s) => s.narrativesSeen ?? 0);

  if (!consent) return 0;
  const idOk = participantId.trim().length > 0;
  const ctxOk =
    context !== "" && (context !== "other" || contextCustom.trim().length > 0);
  if (!idOk || !ctxOk) return 1;
  if (positions.length === 0) return 2;
  const allTouched = positions.every((p) => continuumTouched.includes(p.id));
  if (!allTouched) return 3;
  if (narrativesSeen < NARRATIVES_SHUFFLED.length - 1) return 4;
  return 5;
}

export function StepGate({
  level,
  children,
}: {
  level: number;
  children: ReactNode;
}) {
  const max = useMaxUnlockedLevel();
  if (level <= max) return <>{children}</>;
  const target = STEP_META[Math.min(max, STEP_META.length - 1)];
  const message =
    max === 4
      ? "Per accedere allo Step 4 è necessario aver preso visione di tutte le affermazioni presenti nello Step 3."
      : "Non è possibile accedere a questa sezione prima di aver completato le informazioni e le risposte dello step precedente.";
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          SEZIONE BLOCCATA
        </p>
        <h1 className="mt-4 font-serif text-3xl font-medium">Attenzione</h1>
        <p className="mt-6 text-base leading-relaxed text-foreground/90">
          {message}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Passaggio da completare:{" "}
          <span className="font-medium text-foreground">{target.label}</span>.
        </p>
        <div className="mt-10 flex justify-center">
          <Button asChild size="lg">
            <Link to={target.to}>Torna allo step da completare →</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}