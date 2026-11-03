import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressSteps } from "@/components/ProgressSteps";
import { useResearchStore } from "@/store/research";

export const Route = createFileRoute("/consent")({
  head: () => ({ meta: [{"title": "Consenso informato — AKRASIA"}, {"name": "description", "content": "Informazioni sulla partecipazione alla ricerca AKRASIA e sul trattamento dei dati personali."}, {"property": "og:title", "content": "Consenso informato — AKRASIA"}, {"property": "og:description", "content": "Informazioni sulla partecipazione alla ricerca AKRASIA e sul trattamento dei dati personali."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
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
          INFORMATIVA E CONSENSO
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
              Benvenuta/o! Di cosa si tratta? Questo studio universitario
              esplora come prendiamo le nostre decisioni quando siamo
              sottoposti ad aspettative quotidiane di successo e produttività.
              Ti è mai capitato di fare una scelta (sul lavoro o nella
              gestione del tempo) sapendo che l'opzione migliore per il tuo
              benessere sarebbe stata un'altra? Questa ricerca indaga i
              meccanismi psicologici dietro le nostre decisioni, per capire
              come la pressione all'efficienza e al rendimento influenzi i
              nostri comportamenti.
            </p>
          </section>
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Modalità di restituzione
            </h2>
            <p className="mt-2">
              I risultati aggregati e le successive analisi saranno riportati
              esclusivamente all'interno della tesi di ricerca per la quale si
              stanno raccogliendo i dati. Per qualsiasi dubbio o interesse
              specifico saranno fornite tutte le informazioni aggiuntive
              necessarie a chiarirli.
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
