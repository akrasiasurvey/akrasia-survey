import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProgressSteps } from "@/components/ProgressSteps";
import { Instruction } from "@/components/Instruction";
import { SelfGraph } from "@/components/SelfGraph";
import {
  DIMENSIONS,
  useResearchStore,
  type Belonging,
  type DimensionKey,
} from "@/store/research";
import { X } from "lucide-react";

export const Route = createFileRoute("/step1")({
  component: Step1,
});

function Step1() {
  const positions = useResearchStore((s) => s.positions);
  const addPosition = useResearchStore((s) => s.addPosition);
  const removePosition = useResearchStore((s) => s.removePosition);

  const [label, setLabel] = useState("");
  const [belonging, setBelonging] = useState<Belonging>("internal");
  const [dimension, setDimension] = useState<DimensionKey>("intermedia");

  function handleAdd() {
    const trimmed = label.trim();
    if (!trimmed) return;
    const dim = DIMENSIONS.find((d) => d.key === dimension)!;
    addPosition({ label: trimmed, belonging, dimension, radius: dim.radius });
    setLabel("");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ProgressSteps current={2} />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Step 1 di 3
        </p>
        <h1 className="mt-3 font-serif text-3xl font-medium">
          Mappatura della Struttura del Sé
        </h1>

        <div className="mt-6">
          <Instruction>
            Digita le posizioni che descrivono chi sei (es. "Io-Professionista",
            "Io-Padre") e definisci per ognuna se appartiene al tuo Sé Interno o
            Esterno e la sua importanza. Compariranno automaticamente nel
            grafico a fianco.
          </Instruction>
        </div>

        <div className="mt-2 grid gap-8 lg:grid-cols-[380px_1fr]">
          <section className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-semibold">Nuova I-Position</h2>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="label"
                    className="text-xs uppercase tracking-widest text-muted-foreground"
                  >
                    Denominazione
                  </Label>
                  <Input
                    id="label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="es. Io-Professionista"
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Appartenenza
                  </Label>
                  <RadioGroup
                    value={belonging}
                    onValueChange={(v) => setBelonging(v as Belonging)}
                    className="grid grid-cols-2 gap-2"
                  >
                    {(
                      [
                        { v: "internal", l: "Sé Interno" },
                        { v: "external", l: "Sé Esterno" },
                      ] as const
                    ).map((o) => (
                      <label
                        key={o.v}
                        className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors hover:border-foreground/40 has-[[data-state=checked]]:border-foreground has-[[data-state=checked]]:bg-muted"
                      >
                        <RadioGroupItem value={o.v} />
                        <span>{o.l}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Importanza percepita
                  </Label>
                  <Select
                    value={dimension}
                    onValueChange={(v) => setDimension(v as DimensionKey)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIMENSIONS.map((d) => (
                        <SelectItem key={d.key} value={d.key}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleAdd}
                  className="w-full"
                  disabled={!label.trim()}
                >
                  Aggiungi Posizione
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-semibold">
                Posizioni dichiarate ({positions.length})
              </h2>
              {positions.length === 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Nessuna voce inserita.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {positions.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{p.label}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {p.belonging === "internal" ? "Interno" : "Esterno"} ·{" "}
                          {DIMENSIONS.find((d) => d.key === p.dimension)?.label}
                        </div>
                      </div>
                      <button
                        onClick={() => removePosition(p.id)}
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                        aria-label={`Elimina ${p.label}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>Società del Sé</span>
              <span>Visualizzazione automatica</span>
            </div>
            <div className="flex justify-center">
              <SelfGraph positions={positions} />
            </div>
          </section>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          <Button variant="ghost" asChild>
            <Link to="/session-info">← Indietro</Link>
          </Button>
          <Button asChild disabled={positions.length === 0}>
            <Link to="/step2">Avanti →</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
