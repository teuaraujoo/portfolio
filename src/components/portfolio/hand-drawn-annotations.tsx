import type { ReactNode } from "react";
import type { BrushTone } from "@/data/sobre";
import { cn } from "@/lib/utils";

const BRUSH_PATH =
  "M1.5 5.5C14 3.2 31 4.6 48 3.4S83 2 98.6 4.2L99.2 9 97.8 15.5 98.8 20.6C82 22.4 64 20.8 47 22.2S14 23.4 1.2 21 2.4 14 1 9.6Z";

const BRUSH_TONE_COLORS: Record<BrushTone, string> = {
  brand: "rgba(72, 17, 237, 0.78)",
  bright: "rgba(121, 60, 255, 0.65)",
  subtle: "rgba(245, 245, 245, 0.16)",
};

function buildBrushDataUri(tone: BrushTone): string {
  const color = BRUSH_TONE_COLORS[tone];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 24" preserveAspectRatio="none"><path d="${BRUSH_PATH}" fill="${color}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export interface BrushHighlightProps {
  tone?: BrushTone;
  delayMs?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Organic marker brushstroke rendered behind highlighted inline text,
 * animating horizontally when an ancestor `.group/sobre` gets `data-shown="true"`.
 */
export function BrushHighlight({
  tone = "brand",
  delayMs,
  className,
  children,
}: BrushHighlightProps) {
  return (
    <span
      className={cn(
        "bg-[length:0%_74%] bg-[position:0_88%] bg-no-repeat px-[0.08em] transition-[background-size] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] [box-decoration-break:clone] group-data-[shown=true]/sobre:bg-[length:100%_74%] motion-reduce:bg-[length:100%_74%] motion-reduce:transition-none",
        className,
      )}
      style={{
        backgroundImage: buildBrushDataUri(tone),
        transitionDelay: delayMs !== undefined ? `${delayMs}ms` : undefined,
      }}
    >
      {children}
    </span>
  );
}

export interface HandCircleProps {
  delayMs?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Hand-drawn oval SVG stroke around a key phrase, animated via `stroke-dashoffset`.
 */
export function HandCircle({ delayMs, className, children }: HandCircleProps) {
  return (
    <span className={cn("relative inline-block whitespace-nowrap", className)}>
      {children}
      <svg
        viewBox="0 0 200 80"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-[0.35em] -inset-y-[0.12em] h-[calc(100%+0.24em)] w-[calc(100%+0.7em)] overflow-visible"
      >
        <path
          d="M150 8C110 -2 40 2 14 22C-6 38 6 66 60 74C120 82 188 70 196 44C204 18 160 4 96 6C70 7 50 10 40 14"
          pathLength={1}
          fill="none"
          stroke="var(--brand-bright)"
          strokeWidth={3}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="transition-[stroke-dashoffset] duration-900 ease-[cubic-bezier(0.65,0,0.35,1)] [stroke-dasharray:1] [stroke-dashoffset:1] group-data-[shown=true]/sobre:[stroke-dashoffset:0] motion-reduce:[stroke-dashoffset:0] motion-reduce:transition-none"
          style={delayMs !== undefined ? { transitionDelay: `${delayMs}ms` } : undefined}
        />
      </svg>
    </span>
  );
}

export interface SparkAsteriskProps {
  delayMs?: number;
  className?: string;
}

/**
 * Decorative superscript asterisk that scales and rotates into place after a word.
 */
export function SparkAsterisk({ delayMs, className }: SparkAsteriskProps) {
  return (
    <span aria-hidden="true" className={cn("relative inline-block w-0 align-top", className)}>
      <svg
        viewBox="0 0 24 24"
        className="absolute -top-[0.1em] left-[0.04em] size-[0.55em] scale-0 -rotate-90 text-brand-bright transition-[scale,rotate] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-data-[shown=true]/sobre:scale-100 group-data-[shown=true]/sobre:rotate-0 motion-reduce:scale-100 motion-reduce:rotate-0 motion-reduce:transition-none"
        style={delayMs !== undefined ? { transitionDelay: `${delayMs}ms` } : undefined}
      >
        <path
          d="M12 2v20M3.5 7l17 10M3.5 17l17-10"
          stroke="currentColor"
          strokeWidth={2.6}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </span>
  );
}

export interface DoubleUnderlineProps {
  delayMs?: number;
  className?: string;
  children: ReactNode;
}

const UNDERLINE_STROKE_CLASS =
  "transition-[stroke-dashoffset] duration-900 ease-[cubic-bezier(0.65,0,0.35,1)] [stroke-dasharray:1] [stroke-dashoffset:1] group-data-[shown=true]/sobre:[stroke-dashoffset:0] motion-reduce:[stroke-dashoffset:0] motion-reduce:transition-none";

/**
 * Two sequential hand-drawn curved strokes beneath a closing expression.
 */
export function DoubleUnderline({
  delayMs = 0,
  className,
  children,
}: DoubleUnderlineProps) {
  return (
    <span className={cn("relative inline-block whitespace-nowrap", className)}>
      {children}
      <svg
        viewBox="0 0 200 20"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[0.22em] -left-[0.05em] h-[0.4em] w-[calc(100%+0.1em)] overflow-visible"
      >
        <path
          d="M2 6C60 3 130 4 198 6"
          pathLength={1}
          fill="none"
          stroke="var(--brand-bright)"
          strokeWidth={2.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className={UNDERLINE_STROKE_CLASS}
          style={delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined}
        />
        <path
          d="M8 15C70 11 140 12 186 14"
          pathLength={1}
          fill="none"
          stroke="var(--brand-bright)"
          strokeWidth={2.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className={UNDERLINE_STROKE_CLASS}
          style={{ transitionDelay: `${delayMs + 250}ms` }}
        />
      </svg>
    </span>
  );
}
