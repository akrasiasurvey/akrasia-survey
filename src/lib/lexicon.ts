import {
  NEOLIB_LEXICON,
  RATIONALIST_LEXICON,
  type Annotation,
} from "@/store/research";

export type LexiconMatrix = "neolib" | "rationalist";

export interface LexiconHit {
  start: number;
  end: number;
  matrix: LexiconMatrix;
  word: string;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildRegex(terms: readonly string[]): RegExp {
  // Word boundaries that also allow accented letters. Use lookarounds on
  // non-letter characters. Sorted longest-first so multi-word phrases win.
  const sorted = [...terms].sort((a, b) => b.length - a.length);
  const alt = sorted.map(escapeRe).join("|");
  return new RegExp(`(?<![\\p{L}\\p{M}])(?:${alt})(?![\\p{L}\\p{M}])`, "giu");
}

const NEOLIB_RE = buildRegex(NEOLIB_LEXICON);
const RAT_RE = buildRegex(RATIONALIST_LEXICON);

export function scanLexicon(text: string): LexiconHit[] {
  const hits: LexiconHit[] = [];
  const push = (re: RegExp, matrix: LexiconMatrix) => {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      hits.push({
        start: m.index,
        end: m.index + m[0].length,
        matrix,
        word: m[0],
      });
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  };
  push(NEOLIB_RE, "neolib");
  push(RAT_RE, "rationalist");
  // Deduplicate overlaps (rationalist yields to neolib on overlap).
  hits.sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: LexiconHit[] = [];
  for (const h of hits) {
    const last = merged[merged.length - 1];
    if (last && h.start < last.end) continue;
    merged.push(h);
  }
  return merged;
}

export interface Segment {
  start: number;
  end: number;
  text: string;
  matrix?: LexiconMatrix;
  annotationIds: string[];
}

/**
 * Splits `text` into non-overlapping segments annotated with the lexicon
 * match (if any) and the ids of the annotations that cover the segment.
 */
export function buildSegments(
  text: string,
  annotations: Annotation[],
): Segment[] {
  if (!text) return [];
  const hits = scanLexicon(text);
  const cuts = new Set<number>([0, text.length]);
  for (const h of hits) {
    cuts.add(h.start);
    cuts.add(h.end);
  }
  for (const a of annotations) {
    cuts.add(Math.max(0, Math.min(text.length, a.start)));
    cuts.add(Math.max(0, Math.min(text.length, a.end)));
  }
  const points = [...cuts].sort((a, b) => a - b);
  const segs: Segment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    if (start === end) continue;
    const hit = hits.find((h) => h.start <= start && h.end >= end);
    const annIds = annotations
      .filter((a) => a.start <= start && a.end >= end)
      .map((a) => a.id);
    segs.push({
      start,
      end,
      text: text.slice(start, end),
      matrix: hit?.matrix,
      annotationIds: annIds,
    });
  }
  return segs;
}

export const MATRIX_LABEL: Record<LexiconMatrix, string> = {
  neolib: "Matrice liberista / neoliberista",
  rationalist: "Matrice razionalista",
};

// Soft background tints, chosen to remain legible on the app card surface.
export const MATRIX_BG: Record<LexiconMatrix, string> = {
  neolib: "rgba(155, 89, 182, 0.18)",
  rationalist: "rgba(70, 130, 200, 0.18)",
};

export const MATRIX_DOT: Record<LexiconMatrix, string> = {
  neolib: "#8e5bb5",
  rationalist: "#3e77b5",
};