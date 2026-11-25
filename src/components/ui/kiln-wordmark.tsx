"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
} from "react";
import { cn } from "@/lib/utils";

const REF_FONT_SIZE = 100;
const MIN_WGHT = 300;
const MAX_WGHT = 700;
const DEFAULT_BASE_WGHT = 450;

interface SlotMeta {
  centerX: number;
  width: number;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function normalizeBaseWeight(weight?: number): number {
  if (weight === undefined || !Number.isFinite(weight)) {
    return DEFAULT_BASE_WGHT;
  }
  // Support both legacy 0.45–1.5 procedural factors and Space Grotesk 300–700 weights.
  if (weight <= 10) {
    return Math.round(clamp(300 + (clamp(weight, 0.3, 1.5) / 1.5) * 240, MIN_WGHT, 620));
  }
  return Math.round(clamp(weight, MIN_WGHT, 620));
}

function approach(cur: number, target: number, rate: number, dt: number): number {
  const next = target + (cur - target) * Math.exp(-rate * dt);
  if (Math.abs(target - next) < 0.0015) return target;
  return next;
}

function applyCharVisual(
  el: HTMLSpanElement | null,
  baseWeight: number,
  intensity: number,
) {
  if (!el) return;
  const clamped = clamp(intensity, 0, 1.15);
  if (clamped <= 0.001) {
    el.style.fontVariationSettings = `"wght" ${baseWeight}`;
    el.style.transform = "";
    el.style.textShadow = "";
    el.style.filter = "";
    return;
  }

  const w = Math.round(
    clamp(baseWeight + clamped * (MAX_WGHT - baseWeight), MIN_WGHT, MAX_WGHT),
  );
  const scale = 1 + clamped * 0.07;

  el.style.fontVariationSettings = `"wght" ${w}`;
  el.style.transform = `scale(${scale.toFixed(4)})`;
  el.style.textShadow = `0 0 0.018em rgba(245, 245, 245, ${(clamped * 0.28).toFixed(3)}), 0 0 22px rgba(121, 60, 255, ${(clamped * 0.16).toFixed(3)})`;
  el.style.filter = `brightness(${(1 + clamped * 0.08).toFixed(3)})`;
}

const subscribeReducedMotion = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
};

const getReducedMotionSnapshot = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const getReducedMotionServerSnapshot = () => false;

export interface KilnWordmarkProps {
  text: string;
  weight?: number;
  lens?: boolean;
  className?: string;
}

/**
 * Full-width Space Grotesk wordmark matching the Home hero typography with
 * baseline stagger reveal, pointer-tracked variable weight lens (`wght` +
 * subtle scale without horizontal reflow), and elastic click stamp.
 */
export function KilnWordmark({
  text,
  weight = DEFAULT_BASE_WGHT,
  lens = true,
  className,
}: KilnWordmarkProps) {
  const chars = useMemo(() => Array.from(text), [text]);
  const baseWeight = useMemo(() => normalizeBaseWeight(weight), [weight]);

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const innerLineRef = useRef<HTMLSpanElement>(null);
  const slotRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const stampRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const charRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const slotsMetaRef = useRef<SlotMeta[]>([]);
  const lineWidthRef = useRef(0);

  const anim = useRef<{ p: number[]; pT: number[]; raf: number; last: number }>({
    p: [],
    pT: [],
    raf: 0,
    last: 0,
  });

  const [shown, setShown] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const startRaf = useCallback(() => {
    const a = anim.current;
    if (a.raf) return;
    a.last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - a.last) / 1000));
      a.last = now;
      let moving = false;

      for (let i = 0; i < chars.length; i++) {
        if (chars[i] === " ") continue;
        const cur = a.p[i] ?? 0;
        const target = a.pT[i] ?? 0;
        const next = approach(cur, target, 14, dt);
        if (Math.abs(next - cur) > 0.0005 || (next === target && cur !== target)) {
          a.p[i] = next;
          applyCharVisual(charRefs.current[i], baseWeight, next);
        }
        if (next !== target) {
          moving = true;
        }
      }

      if (moving) {
        a.raf = requestAnimationFrame(tick);
      } else {
        a.raf = 0;
      }
    };

    a.raf = requestAnimationFrame(tick);
  }, [baseWeight, chars]);

  useLayoutEffect(() => {
    const a = anim.current;
    if (a.raf) {
      cancelAnimationFrame(a.raf);
      a.raf = 0;
    }

    const len = chars.length;
    a.p = Array.from({ length: len }, () => 0);
    a.pT = Array.from({ length: len }, () => 0);
    slotRefs.current.length = len;
    stampRefs.current.length = len;
    charRefs.current.length = len;
    slotsMetaRef.current.length = len;

    for (let i = 0; i < len; i++) {
      applyCharVisual(charRefs.current[i], baseWeight, 0);
    }
  }, [baseWeight, chars, reduced]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measureEl = measureRef.current;
    const lineEl = lineRef.current;
    const innerLineEl = innerLineRef.current;
    if (!container || !measureEl || !lineEl || !innerLineEl) return;

    let cancelled = false;
    let resizeRafId = 0;

    const fitAndLockSlots = () => {
      if (cancelled) return;
      const containerWidth = container.clientWidth;
      const naturalWidth = measureEl.getBoundingClientRect().width;
      if (containerWidth <= 0 || naturalWidth <= 0) return;

      const fittedPx =
        Math.floor(((containerWidth * 0.996) / naturalWidth) * REF_FONT_SIZE * 100) /
        100;
      const nextFontSize = `${fittedPx}px`;
      if (lineEl.style.fontSize !== nextFontSize) {
        lineEl.style.fontSize = nextFontSize;
      }

      // Temporarily release locked widths and resting font weight to read true advance boxes.
      for (let i = 0; i < chars.length; i++) {
        const slot = slotRefs.current[i];
        if (slot && slot.style.width !== "") {
          slot.style.width = "";
        }
        applyCharVisual(charRefs.current[i], baseWeight, 0);
      }

      // Batch all DOM geometry reads together before applying slot width writes.
      const lineRect = lineEl.getBoundingClientRect();
      const innerRect = innerLineEl.getBoundingClientRect();
      const widths: number[] = new Array(chars.length).fill(0);
      const centersX: number[] = new Array(chars.length).fill(0);

      for (let i = 0; i < chars.length; i++) {
        const slot = slotRefs.current[i];
        if (!slot) continue;
        const rect = slot.getBoundingClientRect();
        widths[i] = rect.width;
        centersX[i] = rect.left - lineRect.left + rect.width * 0.5;
      }

      lineWidthRef.current = innerRect.width;

      const a = anim.current;
      for (let i = 0; i < chars.length; i++) {
        const slotWidth = widths[i];
        const slot = slotRefs.current[i];
        if (slot && slotWidth > 0) {
          slot.style.width = `${slotWidth.toFixed(3)}px`;
          slotsMetaRef.current[i] = {
            centerX: centersX[i],
            width: slotWidth,
          };
        }
        applyCharVisual(charRefs.current[i], baseWeight, a.p[i] ?? 0);
      }
    };

    const scheduleFit = () => {
      if (cancelled || resizeRafId !== 0) return;
      resizeRafId = requestAnimationFrame(() => {
        resizeRafId = 0;
        fitAndLockSlots();
      });
    };

    fitAndLockSlots();

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(scheduleFit)
        : null;
    ro?.observe(container);

    if (typeof document !== "undefined" && document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        if (!cancelled) scheduleFit();
      });
    }

    return () => {
      cancelled = true;
      if (resizeRafId !== 0) {
        cancelAnimationFrame(resizeRafId);
        resizeRafId = 0;
      }
      ro?.disconnect();
    };
  }, [baseWeight, chars]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    const a = anim.current;
    return () => {
      if (a.raf) {
        cancelAnimationFrame(a.raf);
        a.raf = 0;
      }
    };
  }, []);

  const onWordMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!lens || reduced || e.pointerType === "touch") return;
      const lineEl = lineRef.current;
      if (!lineEl) return;
      const lineRect = lineEl.getBoundingClientRect();
      if (lineRect.width <= 0) return;

      const pointerX = e.clientX - lineRect.left;
      const sigma = Math.max(58, (lineWidthRef.current || lineRect.width) * 0.085);
      const twoSigmaSq = 2 * sigma * sigma;
      const a = anim.current;

      for (let i = 0; i < chars.length; i++) {
        if (chars[i] === " ") {
          a.pT[i] = 0;
          continue;
        }
        const meta = slotsMetaRef.current[i];
        if (!meta) continue;
        const d = pointerX - meta.centerX;
        const g = Math.exp(-(d * d) / twoSigmaSq);
        a.pT[i] = g < 0.004 ? 0 : g;
      }
      startRaf();
    },
    [chars, lens, reduced, startRaf],
  );

  const onWordLeave = useCallback(() => {
    if (!lens || reduced) return;
    const a = anim.current;
    for (let i = 0; i < chars.length; i++) {
      a.pT[i] = 0;
    }
    startRaf();
  }, [chars.length, lens, reduced, startRaf]);

  const stamp = useCallback(
    (i: number) => {
      if (reduced || chars[i] === " ") return;
      const a = anim.current;
      a.p[i] = 1.08;
      applyCharVisual(charRefs.current[i], baseWeight, a.p[i]);

      const stampEl = stampRefs.current[i];
      if (stampEl && typeof stampEl.animate === "function") {
        stampEl.animate(
          [
            { transform: "scale(1, 1)", color: "var(--brand-bright)" },
            {
              transform: "scale(1.06, 0.82)",
              color: "var(--brand-bright)",
              offset: 0.24,
            },
            {
              transform: "scale(0.97, 1.05)",
              color: "var(--foreground)",
              offset: 0.64,
            },
            { transform: "scale(1, 1)", color: "var(--foreground)" },
          ],
          {
            duration: 440,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          },
        );
      }

      startRaf();
    },
    [baseWeight, chars, reduced, startRaf],
  );

  return (
    <div ref={containerRef} className={cn("relative w-full select-none", className)}>
      <span className="sr-only">{text}</span>

      {/* Hidden reference line at fixed 100px for exact full-width scaling */}
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          fontSize: `${REF_FONT_SIZE}px`,
          fontVariationSettings: `"wght" ${baseWeight}`,
        }}
        className="pointer-events-none invisible absolute top-0 left-0 inline-block whitespace-nowrap px-[0.02em] font-display font-medium leading-[0.88] tracking-[-0.055em]"
      >
        {chars.map((ch, i) => (
          <span key={`m-${i}`} className="inline-flex items-baseline justify-center">
            {ch === " " ? "\u00A0" : ch}
          </span>
        ))}
      </div>

      <div
        ref={lineRef}
        aria-hidden="true"
        onPointerMove={onWordMove}
        onPointerLeave={onWordLeave}
        className="w-full touch-pan-y overflow-hidden pt-[0.06em] pb-[0.15em] font-display text-[clamp(2.6rem,12.6vw,15.5rem)] font-medium leading-[0.88] tracking-[-0.055em] whitespace-nowrap text-foreground"
      >
        <span ref={innerLineRef} className="inline-block px-[0.02em] whitespace-nowrap">
          {chars.map((ch, i) => {
            const isSpace = ch === " ";
            return (
              <span
                key={`${i}-${ch}`}
                ref={(el) => {
                  slotRefs.current[i] = el;
                }}
                onClick={isSpace ? undefined : () => stamp(i)}
                className={cn(
                  "inline-flex items-baseline justify-center",
                  !isSpace && "cursor-pointer",
                )}
              >
                <span
                  style={{
                    transitionDelay: `${120 + i * 55}ms`,
                  }}
                  className={cn(
                    "inline-block transition-transform duration-[950ms] ease-[cubic-bezier(0.16,0.9,0.18,1)] will-change-transform motion-reduce:translate-y-0 motion-reduce:transition-none",
                    shown || reduced ? "translate-y-0" : "translate-y-[118%]",
                  )}
                >
                  <span
                    ref={(el) => {
                      stampRefs.current[i] = el;
                    }}
                    style={{ transformOrigin: "50% 82%" }}
                    className="inline-block will-change-transform"
                  >
                    <span
                      ref={(el) => {
                        charRefs.current[i] = el;
                      }}
                      style={{
                        fontVariationSettings: `"wght" ${baseWeight}`,
                        transformOrigin: "50% 82%",
                      }}
                      className="inline-block will-change-transform"
                    >
                      {isSpace ? "\u00A0" : ch}
                    </span>
                  </span>
                </span>
              </span>
            );
          })}
        </span>
      </div>
    </div>
  );
}
