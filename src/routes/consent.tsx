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
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Come si articola il percorso
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold">
                  Parte 1: Compilazione online (circa 15-20 minuti)
                </h3>
                <ul className="mt-2 list-disc space-y-2 pl-5">
                  <li>
                    <span className="font-medium">La mappa delle "voci":</span>{" "}
                    ti verrà chiesto di identificare i ruoli che ricopri nel
                    quotidiano (es. madre/padre-lavoratrice/lavoratore) e le
                    persone (es. genitori-amici-colleghi-capi) esterne che
                    guidano le tue decisioni. Mentre le elenchi dovrai
                    definire l'importanza che queste "voci" hanno per te.
                  </li>
                  <li>
                    <span className="font-medium">La scala dei valori:</span>{" "}
                    successivamente dovrai disporre le "voci" che hai
                    identificato su un asse tra produttività e cura di sé in
                    base a quanto le senti compatibili con un estremo o
                    l'altro.
                  </li>
                  <li>
                    <span className="font-medium">I modi di pensare:</span> in
                    questo passaggio ti sarà chiesto di associare alcune
                    affermazioni di senso comune alle diverse voci in base a
                    quanto le senti compatibili.
                  </li>
                  <li>
                    <span className="font-medium">Tre situazioni reali:</span>{" "}
                    infine dovrai descrivere brevemente come ti comporteresti
                    in tre semplici scenari quotidiani.
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold">
                  Parte 2: Breve colloquio (circa 15-20 minuti)
                </h3>
                <p className="mt-2">
                  A conclusione del percorso, ci accorderemo per una breve
                  conversazione per commentare insieme le tue risposte.
                </p>
              </div>
              <p className="rounded-md bg-muted/50 px-4 py-3 text-sm font-medium">
                Ricorda: non ci sono risposte giuste o sbagliate, ci interessa
                solo la tua prospettiva personale.
              </p>
            </div>
          </section>
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Metodologia
            </h2>
            <p className="mt-2">
              La procedura include: la mappatura grafica delle voci che
              costituiscono il Sé, il posizionamento delle voci del Sé
              all'interno di un continuum di commisurazione, la valutazione
              delle narrazioni che le colonizzano, la risposta a tre
              vignette di scelta akratica e la successiva intervista
              dialogica di approfondimento. Durata stimata: 15-20 minuti per
              la prima parte e 15-20 minuti per l'intervista.
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
