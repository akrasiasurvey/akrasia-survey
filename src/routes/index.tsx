import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useResearchStore } from "@/store/research";

export const Route = createFileRoute("/")({
  component: Welcome,
});

function Welcome() {
  const participantId = useResearchStore((s) => s.participantId);
  const positions = useResearchStore((s) => s.positions);
  const sessionCompleted = useResearchStore((s) => s.sessionCompleted);
  const resetSession = useResearchStore((s) => s.resetSession);
  const hasPending =
    !sessionCompleted &&
    (participantId.trim().length > 0 || positions.length > 0);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Studio di ricerca — Akrasia e Sé Dialogico
        </p>
        <h1 className="mt-4 text-4xl font-serif font-medium leading-tight tracking-tight sm:text-5xl">
          Analisi dialogica dei processi decisionali akratici
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Strumento di ricerca qualitativa. Seleziona la modalità di accesso.
          L'area del ricercatore è protetta da credenziali dedicate.
        </p>

        {hasPending && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-foreground/30 bg-muted/40 p-4">
            <div className="text-sm">
              <p className="font-medium">Sessione in sospeso rilevata</p>
              <p className="text-xs text-muted-foreground">
                {participantId ? `Partecipante: ${participantId}. ` : ""}
                Puoi riprendere dall'ultimo passaggio o iniziare da capo.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link
                  to={
                    positions.length > 0
                      ? "/step1"
                      : participantId
                        ? "/session-info"
                        : "/consent"
                  }
                >
                  Riprendi sessione →
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => resetSession()}
              >
                Nuova sessione
              </Button>
            </div>
          </div>
        )}

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <Link to="/consent" className="group">
            <div className="flex h-full flex-col justify-between rounded-lg border border-border bg-card p-6 transition-colors group-hover:border-foreground/40">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Area partecipante
                </p>
                <h2 className="mt-3 text-lg font-medium">
                  Accedi come Partecipante
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Avvia il test. Durata stimata: 15-20 minuti per la prima
                  parte e 10-15 minuti per l'intervista.
                </p>
              </div>
              <span className="mt-8 text-xs uppercase tracking-widest text-foreground">
                Avvia il test →
              </span>
            </div>
          </Link>

          <Link to="/researcher" className="group">
            <div className="flex h-full flex-col justify-between rounded-lg border border-border bg-card p-6 transition-colors group-hover:border-foreground/40">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Area riservata
                </p>
                <h2 className="mt-3 text-lg font-medium">
                  Accedi come Ricercatore
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Accesso alla dashboard di analisi. Richiede password.
                </p>
              </div>
              <span className="mt-8 text-xs uppercase tracking-widest text-foreground">
                Entra →
              </span>
            </div>
          </Link>
        </div>

        <p className="mt-16 text-xs text-muted-foreground">
          I dati sono trattati in forma pseudonimizzata ai sensi del GDPR.
        </p>
      </div>
    </main>
  );
}
