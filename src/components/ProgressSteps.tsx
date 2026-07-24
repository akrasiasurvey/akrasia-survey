import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { STEP_META, useMaxUnlockedLevel } from "@/lib/stepGating";

const STEPS = STEP_META;

export function ProgressSteps({ current }: { current: number }) {
  const maxUnlocked = useMaxUnlockedLevel();
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
          return (
            <li key={step.label} className="flex items-center gap-2">
              <Link
                to={step.to}
                className={cn(
                  "flex items-center gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-muted/60",
                  locked && "opacity-60",
                )}
                title={
                  locked
                    ? "Sezione bloccata: completa prima gli step precedenti."
                    : undefined
                }
              >
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
                  <Lock
                    aria-hidden
                    className="h-3 w-3 text-muted-foreground/70"
                  />
                )}
              </Link>
              {i < STEPS.length - 1 && (
                <span className="mx-1 text-muted-foreground/40">›</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { STEPS };
