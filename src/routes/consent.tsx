import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressSteps } from "@/components/ProgressSteps";
import { useResearchStore } from "@/store/research";

export const Route = createFileRoute("/consent")({
  component: Consent,
});

function Consent() {
  const navigate = useNavigate();
  const consent = useResearchStore((s) => s.consent);
  const setConsent = useResearchStore((s) => s.setConsent);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ProgressSteps current={0} />
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Informativa e consenso
        </p>
        <h1 className="mt-3 font-serif text-3xl font-medium">
          Consenso Informato
        </h1>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Ambito e scopo
            </h2>
            <p className="mt-2">
              Ricerca universitaria sulla dinamica del Sé e sui processi
              decisionali in contesti professionali ad alta performance. Lo
              studio intende indagare la possibilità che l'akrasia —
              intesa come fenomeno del fallimento dell'agire secondo il
              proprio miglior giudizio, ovvero l'incontinenza decisionale in
              cui la persona compie consapevolmente un'azione che va contro
              la propria valutazione morale o priorità profonda — sia
              negoziata dialogicamente in contesti altamente performativi,
              sotto la spinta delle narrazioni neoliberiste dell'efficienza
              e dell'ottimizzazione.
            </p>
          </section>
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Metodologia
            </h2>
            <p className="mt-2">
              Mappatura grafica del Sé e risposta a scenari di dilemma
              quotidiano. La procedura include: il posizionamento delle voci
              del Sé sul continuum di commisurazione, la valutazione delle
              narrazioni sociali che le colonizzano, la risposta a tre
              vignette di scelta akratica e la successiva intervista
              dialogica di approfondimento. Durata stimata: 15-20 minuti
              per la prima parte e 10-15 minuti per l'intervista.
            </p>
          </section>
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Modalità di restituzione
            </h2>
            <p className="mt-2">
              I risultati aggregati saranno analizzati esclusivamente
              all'interno della tesi di ricerca dell'autore.
            </p>
          </section>
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Volontarietà
            </h2>
            <p className="mt-2">
              La partecipazione è completamente volontaria. È possibile
              ritirarsi in qualsiasi momento chiudendo la finestra del browser,
              senza alcuna conseguenza.
            </p>
          </section>
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Privacy e GDPR
            </h2>
            <p className="mt-2">
              Il trattamento dei dati rispetta il Regolamento Generale sulla
              Protezione dei Dati (GDPR — Reg. UE 2016/679). I dati raccolti
              sono trattati in forma rigorosamente pseudonimizzata tramite ID
              alfanumerico e conservati su server sicuri. Nessun dato
              identificativo diretto (nome, email o altro) verrà memorizzato.
            </p>
          </section>
        </div>

        <div className="mt-10 rounded-lg border border-border bg-card p-5">
          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox
              checked={consent}
              onCheckedChange={(v) => setConsent(v === true)}
              className="mt-0.5"
            />
            <span className="text-sm leading-relaxed">
              Dichiaro di aver letto l'informativa, di avere almeno 18 anni e di
              acconsentire liberamente al trattamento dei miei dati in forma
              pseudonimizzata per gli scopi della presente ricerca.
            </span>
          </label>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link to="/">← Indietro</Link>
          </Button>
          <Button
            disabled={!consent}
            onClick={() => navigate({ to: "/session-info" })}
          >
            Procedi alla Ricerca →
          </Button>
        </div>
      </div>
    </main>
  );
}
