import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  buildSegments,
  MATRIX_BG,
  MATRIX_DOT,
  MATRIX_LABEL,
  type LexiconMatrix,
} from "@/lib/lexicon";
import {
  useResearchStore,
  type Annotation,
  type InterviewData,
} from "@/store/research";

const ANN_BG = "rgba(212, 178, 58, 0.35)";
const ANN_UNDERLINE = "#a07f18";

export function InterviewSection({ participantId }: { participantId: string }) {
  const interview = useResearchStore(
    (s) => s.interviews[participantId],
  ) as InterviewData | undefined;
  const setTranscript = useResearchStore((s) => s.setInterviewTranscript);
  const addAnnotation = useResearchStore((s) => s.addAnnotation);
  const updateAnnotation = useResearchStore((s) => s.updateAnnotation);
  const removeAnnotation = useResearchStore((s) => s.removeAnnotation);

  const transcript = interview?.transcript ?? "";
  const annotations = interview?.annotations ?? [];

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(transcript);
  useEffect(() => setDraft(transcript), [transcript, editing]);

  const [pending, setPending] = useState<{
    start: number;
    end: number;
    quote: string;
  } | null>(null);
  const [pendingNote, setPendingNote] = useState("");
  const [editAnn, setEditAnn] = useState<Annotation | null>(null);
  const [editNote, setEditNote] = useState("");

  const renderRef = useRef<HTMLDivElement>(null);

  function handleMouseUp() {
    if (editing) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const container = renderRef.current;
    if (!container) return;
    const range = sel.getRangeAt(0);
    if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) return;
    const start = getTextOffset(container, range.startContainer, range.startOffset);
    const end = getTextOffset(container, range.endContainer, range.endOffset);
    const a = Math.min(start, end);
    const b = Math.max(start, end);
    if (b - a < 2) return;
    setPending({ start: a, end: b, quote: transcript.slice(a, b) });
    setPendingNote("");
    sel.removeAllRanges();
  }

  function confirmAnnotation() {
    if (!pending) return;
    addAnnotation(participantId, {
      start: pending.start,
      end: pending.end,
      quote: pending.quote,
      note: pendingNote.trim(),
    });
    setPending(null);
    setPendingNote("");
  }

  function saveEdit() {
    if (!editAnn) return;
    updateAnnotation(participantId, editAnn.id, editNote.trim());
    setEditAnn(null);
  }

  const segments = useMemo(
    () => buildSegments(transcript, annotations),
    [transcript, annotations],
  );

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-border bg-background p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Trascrizione integrale dell'intervista
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDraft(transcript);
                    setEditing(false);
                  }}
                >
                  Annulla
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setTranscript(participantId, draft);
                    setEditing(false);
                  }}
                >
                  Salva trascrizione
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(true)}
              >
                {transcript ? "Modifica trascrizione" : "Inserisci trascrizione"}
              </Button>
            )}
          </div>
        </div>

        {editing ? (
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Incolla o digita qui la trascrizione integrale dell'intervista post-test…"
            className="min-h-[320px] font-mono text-sm leading-relaxed"
          />
        ) : transcript ? (
          <div
            ref={renderRef}
            onMouseUp={handleMouseUp}
            className="max-h-[520px] overflow-y-auto whitespace-pre-wrap rounded border border-border/60 bg-card p-4 text-sm leading-relaxed selection:bg-foreground/20"
          >
            {segments.map((seg, i) => {
              const hasAnn = seg.annotationIds.length > 0;
              const style: React.CSSProperties = {};
              if (seg.matrix) {
                style.backgroundColor = MATRIX_BG[seg.matrix];
                style.borderRadius = "2px";
                style.padding = "0 1px";
              }
              if (hasAnn) {
                style.backgroundColor = ANN_BG;
                style.borderBottom = `2px solid ${ANN_UNDERLINE}`;
                style.cursor = "pointer";
              }
              return (
                <span
                  key={i}
                  style={style}
                  title={
                    hasAnn
                      ? annotations
                          .filter((a) => seg.annotationIds.includes(a.id))
                          .map((a) => a.note || "(senza nota)")
                          .join("\n")
                      : seg.matrix
                      ? MATRIX_LABEL[seg.matrix]
                      : undefined
                  }
                  onClick={
                    hasAnn
                      ? (e) => {
                          e.stopPropagation();
                          const first = annotations.find(
                            (a) => a.id === seg.annotationIds[0],
                          );
                          if (first) {
                            setEditAnn(first);
                            setEditNote(first.note);
                          }
                        }
                      : undefined
                  }
                >
                  {seg.text}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="rounded border border-dashed border-border/60 bg-card p-8 text-center text-xs text-muted-foreground">
            Nessuna trascrizione ancora inserita per questo partecipante.
          </p>
        )}

        {transcript && !editing && (
          <p className="mt-2 text-[11px] italic text-muted-foreground">
            Seleziona con il mouse una porzione di testo per aprire il pannello
            di annotazione qualitativa. Le porzioni già annotate sono
            sottolineate; clicca per rivedere o modificare la nota.
          </p>
        )}
      </div>

      <LexiconLegend />

      <AnnotationList
        annotations={annotations}
        onEdit={(a) => {
          setEditAnn(a);
          setEditNote(a.note);
        }}
        onRemove={(id) => removeAnnotation(participantId, id)}
      />

      {/* Add annotation dialog */}
      <Dialog
        open={!!pending}
        onOpenChange={(o) => {
          if (!o) setPending(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuova annotazione</DialogTitle>
          </DialogHeader>
          <blockquote className="rounded border-l-2 border-foreground/40 bg-muted/40 py-2 pl-3 text-sm italic">
            «{pending?.quote}»
          </blockquote>
          <div className="space-y-2">
            <Label htmlFor="ann-note">Nota di analisi teorica</Label>
            <Textarea
              id="ann-note"
              value={pendingNote}
              onChange={(e) => setPendingNote(e.target.value)}
              placeholder="Osservazioni interpretative, riferimenti teorici, codici emergenti…"
              className="min-h-[140px]"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPending(null)}>
              Annulla
            </Button>
            <Button onClick={confirmAnnotation}>Salva annotazione</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit annotation dialog */}
      <Dialog
        open={!!editAnn}
        onOpenChange={(o) => {
          if (!o) setEditAnn(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica annotazione</DialogTitle>
          </DialogHeader>
          <blockquote className="rounded border-l-2 border-foreground/40 bg-muted/40 py-2 pl-3 text-sm italic">
            «{editAnn?.quote}»
          </blockquote>
          <div className="space-y-2">
            <Label htmlFor="ann-note-edit">Nota di analisi teorica</Label>
            <Textarea
              id="ann-note-edit"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              className="min-h-[140px]"
            />
          </div>
          <DialogFooter className="justify-between sm:justify-between">
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                if (editAnn) removeAnnotation(participantId, editAnn.id);
                setEditAnn(null);
              }}
            >
              Elimina
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setEditAnn(null)}>
                Annulla
              </Button>
              <Button onClick={saveEdit}>Salva</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LexiconLegend() {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        Legenda — scansione semantica critica
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
        {(["neolib", "rationalist"] as LexiconMatrix[]).map((m) => (
          <div key={m} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-6 rounded-sm"
              style={{ background: MATRIX_BG[m], borderBottom: `2px solid ${MATRIX_DOT[m]}` }}
            />
            <span>{MATRIX_LABEL[m]}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-6 rounded-sm"
            style={{ background: ANN_BG, borderBottom: `2px solid ${ANN_UNDERLINE}` }}
          />
          <span>Annotazione del ricercatore</span>
        </div>
      </div>
      <p className="mt-2 text-[11px] italic text-muted-foreground">
        La scansione è una guida visiva qualitativa: segnala la presenza dei
        lemmi appartenenti alle due matrici senza produrre metriche numeriche.
      </p>
    </div>
  );
}

function AnnotationList({
  annotations,
  onEdit,
  onRemove,
}: {
  annotations: Annotation[];
  onEdit: (a: Annotation) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>Note di analisi</span>
        <span>{annotations.length}</span>
      </div>
      {annotations.length === 0 ? (
        <p className="text-xs italic text-muted-foreground">
          Nessuna annotazione ancora inserita.
        </p>
      ) : (
        <ol className="space-y-3">
          {annotations
            .slice()
            .sort((a, b) => a.start - b.start)
            .map((a, i) => (
              <li
                key={a.id}
                className="rounded border border-border bg-card p-3 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Nota #{i + 1}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
                      onClick={() => onEdit(a)}
                    >
                      Modifica
                    </button>
                    <button
                      className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive"
                      onClick={() => onRemove(a.id)}
                    >
                      Elimina
                    </button>
                  </div>
                </div>
                <blockquote className="mt-2 border-l-2 border-foreground/30 pl-3 italic">
                  «{a.quote}»
                </blockquote>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed">
                  {a.note || (
                    <span className="italic text-muted-foreground">
                      (senza nota)
                    </span>
                  )}
                </p>
              </li>
            ))}
        </ol>
      )}
    </div>
  );
}

function getTextOffset(root: HTMLElement, node: Node, offset: number): number {
  let total = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let cur = walker.nextNode();
  while (cur) {
    if (cur === node) return total + offset;
    total += cur.textContent?.length ?? 0;
    cur = walker.nextNode();
  }
  // If node is an element node (e.g. selection ends at a span boundary),
  // fall back to accumulating text up to that node.
  if (node.nodeType === Node.ELEMENT_NODE) {
    total = 0;
    const w2 = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n = w2.nextNode();
    while (n) {
      if (node.contains(n)) return total;
      total += n.textContent?.length ?? 0;
      n = w2.nextNode();
    }
  }
  return total;
}