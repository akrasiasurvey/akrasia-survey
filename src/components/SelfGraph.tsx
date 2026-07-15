import { useMemo } from "react";
import type { IPosition } from "@/store/research";

const SVG_SIZE = 620;
const CENTER = SVG_SIZE / 2;
const INNER_RADIUS = 170;
const OUTER_RADIUS = 290;

// Phase offset so no circle sits directly on the top axis where the
// zone labels ("Sé Interno" / "Sé Esterno") are anchored.
const PHASE = Math.PI / 5;

type LaidOut = IPosition & { x: number; y: number };

function computeLayout(positions: IPosition[]): LaidOut[] {
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

  return [...place(internal, true), ...place(external, false)];
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
}

export function SelfGraph({
  positions,
  continuum,
  activeId,
  selectedIds,
  onSelect,
  emptyMessage = "Aggiungi una I-Position per iniziare",
}: SelfGraphProps) {
  const laidOut = useMemo(() => computeLayout(positions), [positions]);
  const selected = new Set(selectedIds ?? []);
  const clickable = !!onSelect;

  return (
    <svg
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      className="w-full max-w-[620px]"
      role="img"
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

        const baseStroke = isActive
          ? "oklch(0.55 0.18 25)"
          : isSelected
            ? "oklch(0.55 0.18 145)"
            : "oklch(0.35 0.05 240)";
        const baseFill = isSelected
          ? "oklch(0.75 0.15 145)"
          : "oklch(0.55 0.05 240)";
        const fillOpacity = continuum ? 0.15 : 0.55;

        return (
          <g
            key={p.id}
            onClick={clickable ? () => onSelect!(p.id) : undefined}
            style={{ cursor: clickable ? "pointer" : "default" }}
          >
            {isSelected && (
              <circle
                cx={p.x}
                cy={p.y}
                r={p.radius + 5}
                fill="none"
                stroke="oklch(0.55 0.18 145)"
                strokeWidth={2}
              />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={p.radius}
              fill={baseFill}
              fillOpacity={fillOpacity}
              stroke={baseStroke}
              strokeOpacity={isActive || isSelected ? 1 : 0.85}
              strokeWidth={isActive ? Math.max(sw, 2.5) : sw}
              strokeDasharray={dash}
              style={{
                transition:
                  "stroke-dasharray 200ms, stroke-width 200ms, stroke 200ms, fill 200ms",
              }}
            />
            {showInside ? (
              <text
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none fill-foreground"
                style={{
                  fontSize: Math.max(9, Math.min(12, p.radius / 3.5)),
                  fontWeight: 500,
                }}
              >
                {p.label}
              </text>
            ) : (
              <text
                x={p.x}
                y={p.y + p.radius + 11}
                textAnchor="middle"
                className="pointer-events-none fill-foreground"
                style={{ fontSize: 10, fontWeight: 500 }}
              >
                {p.label}
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
