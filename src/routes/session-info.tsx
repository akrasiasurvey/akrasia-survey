import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ProgressSteps } from "@/components/ProgressSteps";
import { useResearchStore, type Context } from "@/store/research";

export const Route = createFileRoute("/session-info")({
  component: SessionInfo,
});

const CONTEXTS: { value: Context; label: string }[] = [
  { value: "home", label: "A casa / In un contesto privato di riposo" },
  { value: "workplace", label: "In ufficio / Sul posto di lavoro" },
  {
    value: "workplace_common",
    label: "In uno spazio comune / pausa all'interno del luogo di lavoro",
  },
  { value: "other", label: "Altro / Personalizzato (specifica qui sotto)" },
];

function SessionInfo() {
  const navigate = useNavigate();
  const {
    participantId,
    setParticipantId,
    context,
    setContext,
    contextCustom,
    setContextCustom,
    startSession,
  } = useResearchStore();

  const canProceed =
    participantId.trim().length > 0 &&
    context !== "" &&
    (context !== "other" || contextCustom.trim().length > 0);

  function submit() {
    startSession();
    navigate({ to: "/step1" });
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ProgressSteps current={1} />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Registrazione sessione
        </p>
        <h1 className="mt-3 font-serif text-3xl font-medium">
          Condizione ambientale
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Le seguenti informazioni sono utilizzate esclusivamente per
          contestualizzare le risposte.
        </p>

        <div className="mt-10 space-y-8">
          <div className="space-y-2">
            <Label htmlFor="pid" className="text-sm">
              ID Partecipante <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pid"
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              placeholder="es. P-A472"
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              Codice alfanumerico pseudonimo assegnato per questa sessione.
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm">
              Dove ti trovi in questo momento?{" "}
              <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={context}
              onValueChange={(v) => setContext(v as Context)}
              className="space-y-2"
            >
              {CONTEXTS.map((c) => (
                <label
                  key={c.value}
                  className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-card px-4 py-3 text-sm transition-colors hover:border-foreground/40 has-[[data-state=checked]]:border-foreground"
                >
                  <RadioGroupItem value={c.value} id={c.value} />
                  <span>{c.label}</span>
                </label>
              ))}
            </RadioGroup>
            {context === "other" && (
              <div className="mt-3 space-y-2">
                <Label htmlFor="ctx-custom" className="text-xs">
                  Descrivi il contesto ecologico{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="ctx-custom"
                  value={contextCustom}
                  onChange={(e) => setContextCustom(e.target.value)}
                  placeholder="es. in treno durante il tragitto casa-lavoro, in una sala d'attesa..."
                  rows={2}
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link to="/consent">← Indietro</Link>
          </Button>
          <Button disabled={!canProceed} onClick={submit}>
            Inizia il Test →
          </Button>
        </div>
      </div>
    </main>
  );
}
