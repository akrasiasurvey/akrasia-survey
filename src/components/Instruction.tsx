import type { ReactNode } from "react";

export function Instruction({ children }: { children: ReactNode }) {
  return (
    <div className="mb-8 rounded-md border border-border bg-muted/40 px-5 py-4">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        Consegna
      </div>
      <p className="text-sm leading-relaxed text-foreground">{children}</p>
    </div>
  );
}
