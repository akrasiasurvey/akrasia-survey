import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Consenso", to: "/consent" },
  { label: "Info Sessione", to: "/session-info" },
  { label: "Step 1: Struttura del Sé", to: "/step1" },
  { label: "Step 2: Continuum & Narrazioni", to: "/step2" },
  { label: "Step 3: Vignette", to: "/step3" },
];

export function ProgressSteps({ current }: { current: number }) {
  return (
    <nav
      aria-label="Avanzamento ricerca"
      className="border-b border-border bg-card"
    >
      <ol className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-1 px-6 py-4 text-xs tracking-wide text-muted-foreground">
        {STEPS.map((step, i) => {
          const active = i === current;
          const done = i < current;
          return (
            <li key={step.label} className="flex items-center gap-2">
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
