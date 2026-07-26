import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResearchStore } from "@/store/research";

export const Route = createFileRoute("/grazie")({
  head: () => ({
    meta: [
      { title: "Grazie per la tua partecipazione — AKRASIA" },
      {
        name: "description",
        content:
          "Le risposte del test sulla dinamica dialogica dei processi decisionali akratici sono state registrate correttamente.",
      },
      { property: "og:title", content: "Grazie per la tua partecipazione — AKRASIA" },
      {
        property: "og:description",
        content: "Conferma di invio dei dati della sessione di ricerca.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ThankYou,
});

function ThankYou() {
  const navigate = useNavigate();
  const sessionCompleted = useResearchStore((s) => s.sessionCompleted);

  // Impedisce il ritorno agli step del test già inviato tramite il tasto
  // "indietro" del browser: ogni popstate riporta alla pagina finale.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.pushState(null, "", window.location.href);
    const onPop = () => {
      window.history.pushState(null, "", window.location.href);
      navigate({ to: "/grazie", replace: true });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [navigate]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-600/40 bg-emerald-600/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Dati inviati correttamente
        </span>

        <h1 className="mt-8 font-serif text-3xl font-medium sm:text-4xl">
          Grazie per la tua partecipazione!
        </h1>

        <p className="mt-6 text-base leading-relaxed text-foreground/90">
          Le tue risposte e le tue riflessioni sono state registrate con
          successo. Il tuo contributo è fondamentale per questa ricerca!
        </p>

        {!sessionCompleted && (
          <p className="mt-4 text-xs text-muted-foreground">
            Se la conferma non compare nell'archivio, contatta il ricercatore.
          </p>
        )}

        <div className="mt-10">
          <Button asChild size="lg" variant="outline">
            <Link to="/">Torna alla Home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
