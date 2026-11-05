import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
              Come si articola il percorso
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Parte 1: Compilazione online (circa 15-20 minuti)
                </h3>
                <ul className="mt-2 list-disc space-y-3 pl-5">
                  <li>
                    <span className="font-semibold">La mappa delle "voci":</span>{" "}
                    Ti verrà chiesto di identificare le diverse parti di te che
                    riconosci nella tua vita quotidiana (ad esempio Io-lavoratore,
                    Io-genitore, Io-ambizioso) e le persone o i contesti esterni
                    (ad esempio familiari, amici, colleghi, università o ambiente
                    di lavoro) che influenzano le tue decisioni. Potrai scegliere
                    tra alcuni esempi oppure aggiungere liberamente le "voci" che
                    ritieni più significative, indicando quanto ciascuna sia
                    importante per il tuo senso di identità.
                  </li>
                  <li>
                    <span className="font-semibold">La scala dei valori:</span>{" "}
                    Successivamente dovrai collocare ciascuna voce lungo un
                    continuum tra due orientamenti: da un lato Valori, Relazioni
                    e Benessere, dall'altro Risultati, Numeri e Compiti. Ti
                    chiederemo di indicare verso quale di questi due orientamenti
                    senti che ciascuna voce tende maggiormente.
                  </li>
                  <li>
                    <span className="font-semibold">Convinzioni diffuse:</span>{" "}
                    Ti verranno presentate alcune affermazioni relative al
                    lavoro, alla produttività e al benessere. Per ciascuna potrai
                    individuare le voci che senti "attivarsi" e indicare se,
                    secondo la tua percezione, la adottano, ne subiscono la
                    pressione oppure la rifiutano.
                  </li>
                  <li>
                    <span className="font-semibold">Tre situazioni reali:</span>{" "}
                    Infine ti verranno presentate tre brevi situazioni della vita
                    quotidiana. Ti chiederemo di descrivere liberamente come ti
                    comporteresti, quale decisione prenderesti e come ti
                    sentiresti dopo averla presa.
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Parte 2: Breve colloquio (circa 15-20 minuti)
                </h3>
                <p className="mt-2">
                  A conclusione della compilazione, ci accorderemo per una breve
                  conversazione durante la quale ripercorreremo insieme alcune
                  delle tue risposte. Sarà un'occasione per comprendere meglio le
                  motivazioni delle tue scelte e riflettere sulle eventuali
                  tensioni tra le diverse voci che ti guidano.
                </p>
              </div>
              <p className="border-l-2 border-primary bg-muted/40 px-4 py-3 text-sm font-medium leading-relaxed text-foreground">
                Ricorda: Questo questionario non costituisce un test clinico o
                di personalità, non ci sono risposte giuste o sbagliate. Ci
                interessa unicamente comprendere la tua prospettiva personale e
                il modo in cui interpreti le tue esperienze.
              </p>
            </div>
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
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent-check"
              checked={consent}
              onCheckedChange={(v) => setConsent(v === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor="consent-check"
              className="cursor-pointer text-sm font-normal leading-relaxed"
            >
              Dichiaro di aver letto l'informativa, di avere almeno 18 anni e di
              acconsentire liberamente al trattamento dei miei dati in forma
              pseudonimizzata per gli scopi della presente ricerca.
            </Label>
          </div>
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
