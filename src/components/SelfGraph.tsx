import { useMemo } from "react";
import type { IPosition } from "@/store/research";

export const SVG_SIZE = 620;
const CENTER = SVG_SIZE / 2;
const INNER_RADIUS = 170;
const OUTER_RADIUS = 290;

// Phase offset so no circle sits directly on the top axis where the
// zone labels ("Sé Interno" / "Sé Esterno") are anchored.
const PHASE = Math.PI / 5;

type LaidOut = IPosition & { x: number; y: number };

export function computeLayout(positions: IPosition[], voiceMap = false): LaidOut[] {
  const internal = positions.filter((p) => p.belonging === "internal");
  const external = positions.filter((p) => p.belonging === "external");

  const place = (list: IPosition[], isInternal: boolean): LaidOut[] => {
    const n = list.length;
    return list.map((p, i) => {
      const angle = (i / Math.max(n, 1)) * Math.PI * 2 - Math.PI / 2 + PHASE;
      let r: number;
      if (isInternal) {
        if (n === 1) {
          r = 0;
        } else {
          const maxR = Math.max(INNER_RADIUS - p.radius - 14, 0);
          const ring = i % 2 === 0 ? 0.45 : 0.85;
          r = maxR * ring;
        }
      } else {
        const min = INNER_RADIUS + p.radius + 16;
        const max = OUTER_RADIUS - p.radius - 12;
        const width = Math.max(max - min, 0);
        const ring = (i % 3) / 2;
        r = min + width * ring;
      }
      return {
        ...p,
        x: CENTER + Math.cos(angle) * r,
        y: CENTER + Math.sin(angle) * r,
      };
    });
  };

  const nodes = [...place(internal, true), ...place(external, false)];

  // ---- Collision resolution ----
  // Iterative pairwise separation: se due cerchi si sovrappongono, li
  // allontaniamo lungo la loro linea di congiunzione. Vincolo di zona:
  // i nodi interni restano dentro INNER_RADIUS; gli esterni restano
  // nella corona INNER..OUTER.
  const PAD = voiceMap ? 14 : 4;
  const ITER = 80;
  for (let iter = 0; iter < ITER; iter++) {
    let moved = false;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x || (voiceMap && b.y === a.y ? 0.001 : 0);
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.0001;
        const minDist = a.radius + b.radius + PAD;
        if (dist < minDist) {
          const overlap = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;
          moved = true;
        }
      }
    }
    // constrain each node into its belonging zone
    for (const p of nodes) {
      const dx = p.x - CENTER;
      const dy = p.y - CENTER;
      const d = Math.hypot(dx, dy) || 0.0001;
      const ux = dx / d;
      const uy = dy / d;
      if (p.belonging === "internal") {
        const maxD = Math.max(INNER_RADIUS - p.radius - 4, 0);
        if (d > maxD) {
          p.x = CENTER + ux * maxD;
          p.y = CENTER + uy * maxD;
          moved = true;
        }
      } else {
        const minD = INNER_RADIUS + p.radius + 6;
        const maxD = OUTER_RADIUS - p.radius - 6;
        if (d < minD) {
          p.x = CENTER + ux * minD;
          p.y = CENTER + uy * minD;
          moved = true;
        } else if (d > maxD) {
          p.x = CENTER + ux * maxD;
          p.y = CENTER + uy * maxD;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }

  return nodes;
}

function dasharrayFor(value: number): string | undefined {
  if (value >= 98) return undefined;
  const t = value / 100;
  const dash = 1 + t * 20;
  const gap = 8 - t * 7.5;
  return `${dash.toFixed(2)} ${gap.toFixed(2)}`;
}

function strokeWidthFor(value: number) {
  return 1 + (value / 100) * 1.5;
}

export interface SelfGraphProps {
  positions: IPosition[];
  continuum?: Record<string, { value: number }>;
  activeId?: string | null;
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  emptyMessage?: string;
  /** Short display labels and fitted text, without changing research data. */
  compactLabels?: boolean;
  /** Step 1-only neutral selection and label wrapping; other views stay unchanged. */
  voiceMap?: boolean;
  /**
   * Sottoinsieme di id (tipicamente le "voci vincenti" di uno scenario) da
   * mettere maggiormente in evidenza: fill più carico, contorno più marcato
   * e leggero incremento di raggio.
   */
  emphasizedIds?: string[];
  /**
   * Piccole etichette testuali mostrate sotto ciascun cerchio (es. la
   * reazione della voce a un'affermazione: Adotta / Subisce / Rifiuta).
   */
  nodeBadges?: Record<string, string>;
}

export function SelfGraph({
  positions,
  continuum,
  activeId,
  selectedIds,
  onSelect,
  emptyMessage = "Aggiungi una I-Position per iniziare",
  emphasizedIds,
  nodeBadges,
  compactLabels = false,
  voiceMap = false,
}: SelfGraphProps) {
  const laidOut = useMemo(() => computeLayout(positions, voiceMap), [positions, voiceMap]);
  const selected = new Set(selectedIds ?? []);
  const emphasized = new Set(emphasizedIds ?? []);
  const clickable = !!onSelect;

  return (
    <svg
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      className="w-full max-w-[620px]"
      role={clickable ? "group" : "img"}
      aria-label="Grafico del Sé"
    >
      <circle
        cx={CENTER}
        cy={CENTER}
        r={OUTER_RADIUS}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={1}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={INNER_RADIUS}
        fill="var(--color-muted)"
        stroke="var(--color-border)"
        strokeDasharray="4 4"
        strokeWidth={1}
      />

      <text
        x={CENTER}
        y={CENTER - INNER_RADIUS - 10}
        textAnchor="middle"
        className="fill-muted-foreground"
        style={{ fontSize: 11, letterSpacing: 2 }}
      >
        Sé Interno
      </text>
      <text
        x={CENTER}
        y={CENTER - OUTER_RADIUS - 10}
        textAnchor="middle"
        className="fill-muted-foreground"
        style={{ fontSize: 11, letterSpacing: 2 }}
      >
        Sé Esterno
      </text>

      {laidOut.map((p) => {
        const v = continuum?.[p.id]?.value ?? 50;
        const useDash = !!continuum;
        const dash = useDash ? dasharrayFor(v) : undefined;
        const sw = useDash ? strokeWidthFor(v) : 1;
        const isActive = activeId === p.id;
        const isSelected = selected.has(p.id);
        const showInside = p.radius >= 22;
        const isEmphasized = emphasized.has(p.id);
        const displayRadius = isEmphasized ? p.radius + 4 : p.radius;
        const displayLabel = compactLabels ? p.label.split("/")[0]?.trim() || p.label : p.label;
        const labelSize = Math.max(9, Math.min(12, displayRadius / 3.5));
        const labelWidth = displayRadius * 2 - 8;
        const fitLabel = compactLabels && showInside && displayLabel.length * labelSize * 0.55 > labelWidth;
        const badge = nodeBadges?.[p.id];

        const baseStroke = voiceMap ? "var(--color-primary)" : isActive
          ? "oklch(0.55 0.18 25)"
          : isSelected
            ? "oklch(0.55 0.18 145)"
            : "oklch(0.35 0.05 240)";
        const baseFill = voiceMap ? "var(--color-muted-foreground)" : isSelected
          ? "oklch(0.75 0.15 145)"
          : "oklch(0.55 0.05 240)";
        const fillOpacity = voiceMap ? (isSelected ? 0.4 : 0.18) : continuum ? 0.15 : 0.55;
        const words = displayLabel.split(/(?<=-)|\s+/);
        const lines: string[] = [];
        if (voiceMap) {
          const maxChars = showInside ? Math.max(5, Math.floor(labelWidth / 5.5)) : 18;
          for (const word of words) {
            const last = lines[lines.length - 1];
            if (last && last.length + word.length + 1 <= maxChars) lines[lines.length - 1] = `${last} ${word}`;
            else lines.push(word);
          }
        }
        const strokeW = isEmphasized
          ? Math.max(sw, 2.5)
          : isActive
            ? Math.max(sw, 2.5)
            : sw;

        return (
          <g
            key={p.id}
            onClick={clickable ? () => onSelect?.(p.id) : undefined}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            aria-label={clickable ? p.label : undefined}
            aria-pressed={clickable ? isSelected : undefined}
            onKeyDown={clickable ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect?.(p.id); } } : undefined}
            className={voiceMap ? "outline-none focus-visible:stroke-primary" : undefined}
            style={{ cursor: clickable ? "pointer" : "default" }}
          >
            {(compactLabels || voiceMap) && <title>{p.label}</title>}
            {isSelected && (
              <circle
                cx={p.x}
                cy={p.y}
                r={displayRadius + 5}
                fill="none"
                stroke={voiceMap ? "var(--color-primary)" : "oklch(0.55 0.18 145)"}
                strokeWidth={2}
              />
            )}
            {isEmphasized && (
              <circle
                cx={p.x}
                cy={p.y}
                r={displayRadius + 3}
                fill="none"
                stroke={baseStroke}
                strokeOpacity={0.35}
                strokeWidth={2}
              />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={displayRadius}
              fill={baseFill}
              fillOpacity={fillOpacity}
              stroke={baseStroke}
              strokeOpacity={isEmphasized || isActive || isSelected ? 1 : 0.85}
              strokeWidth={strokeW}
              strokeDasharray={dash}
              style={{
                transition:
                  "stroke-dasharray 200ms, stroke-width 200ms, stroke 200ms, fill 200ms",
              }}
            />
            {voiceMap ? (
              <text x={p.x} y={showInside ? p.y - (lines.length - 1) * 5.5 : p.y + displayRadius + 11} textAnchor="middle" dominantBaseline="middle" className="pointer-events-none fill-foreground" fontSize={showInside ? labelSize : 10} fontWeight={500}>
                {lines.map((line, i) => <tspan key={i} x={p.x} dy={i === 0 ? 0 : 11} textLength={showInside && line.length * labelSize * 0.55 > labelWidth ? labelWidth : undefined} lengthAdjust="spacingAndGlyphs">{line}</tspan>)}
              </text>
            ) : showInside ? (
              <text
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                textLength={fitLabel ? labelWidth : undefined}
                lengthAdjust={fitLabel ? "spacingAndGlyphs" : undefined}
                className="pointer-events-none fill-foreground"
                style={{
                  fontSize: labelSize,
                  fontWeight: 500,
                }}
              >
                {displayLabel}
              </text>
            ) : (
              <text
                x={p.x}
                y={p.y + displayRadius + 11}
                textAnchor="middle"
                className="pointer-events-none fill-foreground"
                style={{ fontSize: 10, fontWeight: 500 }}
              >
                {displayLabel}
              </text>
            )}
            {badge && (
              <text
                x={p.x}
                y={p.y + displayRadius + (showInside ? 12 : 23)}
                textAnchor="middle"
                className="pointer-events-none fill-muted-foreground"
                style={{ fontSize: 8.5, letterSpacing: 1, fontWeight: 600 }}
              >
                {badge.toUpperCase()}
              </text>
            )}
          </g>
        );
      })}

      {positions.length === 0 && (
        <text
          x={CENTER}
          y={CENTER}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 12 }}
        >
          {emptyMessage}
        </text>
      )}
    </svg>
  );
}
