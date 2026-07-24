import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STEP_META, useMaxUnlockedLevel } from "@/lib/stepGating";

const STEPS = STEP_META;

export function ProgressSteps({ current }: { current: number }) {
  const maxUnlocked = useMaxUnlockedLevel();
  const navigate = useNavigate();
  const [blocked, setBlocked] = useState<null | number>(null);
  return (
    <nav
      aria-label="Avanzamento ricerca"
      className="border-b border-border bg-card"
    >
      <ol className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-1 px-6 py-4 text-xs tracking-wide text-muted-foreground">
        {STEPS.map((step, i) => {
          const active = i === current;
          const done = i < current;
          const locked = i > maxUnlocked;
          const inner = (
            <>
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-medium",
                  active && "border-foreground bg-foreground text-background",
                  done && "border-muted-foreground/40 bg-muted text-foreground",
                  !active && !done && "border-border text-muted-foreground",
                )}
              >
                {i + 1}
              </span>
              <span
                className={cn(
                  "uppercase",
                  active && "font-semibold text-foreground",
                  done && "text-foreground/70",
                )}
              >
                {step.label}
              </span>
              {locked && (
                <Lock aria-hidden className="h-3 w-3 text-muted-foreground/70" />
              )}
            </>
          );
          return (
            <li key={step.label} className="flex items-center gap-2">
              {locked ? (
                <button
                  type="button"
                  aria-disabled="true"
                  onClick={() => setBlocked(i)}
                  title="Sezione bloccata: completa prima gli step precedenti."
                  className="flex cursor-not-allowed items-center gap-2 rounded-md px-1 py-0.5 opacity-50"
                >
                  {inner}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate({ to: step.to })}
                  className="flex items-center gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-muted/60"
                >
                  {inner}
                </button>
              )}
              {i < STEPS.length - 1 && (
                <span className="mx-1 text-muted-foreground/40">›</span>
              )}
            </li>
          );
        })}
      </ol>
      {blocked !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background px-6"
        >
          <div className="mx-auto max-w-xl text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Sezione bloccata
            </p>
            <h2 className="mt-4 font-serif text-3xl font-medium">Attenzione</h2>
            <p className="mt-6 text-base leading-relaxed text-foreground/90">
              Non è possibile accedere a questa sezione prima di aver
              completato le informazioni e le risposte dello step precedente.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Passaggio da completare:{" "}
              <span className="font-medium text-foreground">
                {STEPS[Math.min(maxUnlocked, STEPS.length - 1)].label}
              </span>
              .
            </p>
            <div className="mt-10 flex justify-center">
              <Button
                size="lg"
                onClick={() => {
                  const target = STEPS[Math.min(maxUnlocked, STEPS.length - 1)];
                  setBlocked(null);
                  navigate({ to: target.to });
                }}
              >
                Torna allo step da compilare →
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export { STEPS };
