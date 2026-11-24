"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { PreloaderContent } from "@/data/home";
import { useSmoothScroll } from "./smooth-scroll";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const MIN_MS = 1600;
const LERP_FACTOR = 0.12;
const COMPLETE_SNAP_THRESHOLD = 0.995;

const SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
  "Spacebar",
]);

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export interface PreloaderProps {
  content: PreloaderContent;
  /** Disparado em 0.48s (logo após ambas as metades da cortina iniciarem a subida) para sincronizar a entrada da Hero */
  onExitStart?: () => void;
  /** Disparado após as cortinas saírem completamente da viewport e liberarem o scroll */
  onComplete?: () => void;
}

/**
 * Full-viewport editorial preloader with 0->100 counter, progress bar,
 * two-half staggered curtain exit transition, and zero-shift scroll blocking via Lenis + input guards.
 */
export function Preloader({ content, onExitStart, onComplete }: PreloaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const scope = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const onExitStartRef = useRef(onExitStart);
  const onCompleteRef = useRef(onComplete);
  const { stop, start } = useSmoothScroll();

  useEffect(() => {
    onExitStartRef.current = onExitStart;
    onCompleteRef.current = onComplete;
  }, [onExitStart, onComplete]);

  useGSAP(
    () => {
      if (!isVisible) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        start();
        setIsVisible(false);
        onExitStartRef.current?.();
        onCompleteRef.current?.();
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const introEl = scope.current;
        const leftEl = leftPanelRef.current;
        const rightEl = rightPanelRef.current;
        const contentEl = contentRef.current;
        const countEl = countRef.current;
        const barEl = barRef.current;

        if (!introEl || !leftEl || !rightEl || !contentEl || !countEl || !barEl) return;

        const preventScrollEvent = (event: Event) => {
          if (event.cancelable) {
            event.preventDefault();
          }
        };

        const preventScrollKeys = (event: KeyboardEvent) => {
          if (!SCROLL_KEYS.has(event.key) && event.code !== "Space") return;
          if (isEditableTarget(event.target) || isEditableTarget(document.activeElement)) {
            return;
          }
          event.preventDefault();
        };

        const unlockScrollEvents = () => {
          window.removeEventListener("wheel", preventScrollEvent);
          window.removeEventListener("touchmove", preventScrollEvent);
          window.removeEventListener("keydown", preventScrollKeys);
        };

        stop();
        window.addEventListener("wheel", preventScrollEvent, { passive: false });
        window.addEventListener("touchmove", preventScrollEvent, { passive: false });
        window.addEventListener("keydown", preventScrollKeys);

        let shown = 0;
        let completed = false;
        let exitTl: gsap.core.Timeline | null = null;
        const startTime = performance.now();

        countEl.textContent = "0";
        gsap.set(barEl, { scaleX: 0 });
        gsap.set([leftEl, rightEl], { yPercent: 0 });
        gsap.set(contentEl, { autoAlpha: 1, y: 0 });

        const tick = () => {
          const elapsed = performance.now() - startTime;
          const target = Math.min(elapsed / MIN_MS, 1);
          shown += (target - shown) * LERP_FACTOR;

          if (target === 1 && shown > COMPLETE_SNAP_THRESHOLD) {
            shown = 1;
          }

          countEl.textContent = String(Math.round(shown * 100));
          gsap.set(barEl, { scaleX: shown });

          if (shown === 1 && !completed) {
            completed = true;
            gsap.ticker.remove(tick);
            gsap.set(introEl, { pointerEvents: "none" });

            exitTl = gsap.timeline({
              onComplete: () => {
                unlockScrollEvents();
                start();
                ScrollTrigger.refresh();
                setIsVisible(false);
                onCompleteRef.current?.();
              },
            });

            exitTl
              .to(
                contentEl,
                {
                  y: -14,
                  autoAlpha: 0,
                  duration: 0.28,
                  ease: "power2.in",
                },
                0.1,
              )
              .to(
                leftEl,
                {
                  yPercent: -100,
                  duration: 0.95,
                  ease: "expo.inOut",
                },
                0.2,
              )
              .to(
                rightEl,
                {
                  yPercent: -100,
                  duration: 0.95,
                  ease: "expo.inOut",
                },
                0.36,
              )
              .add(() => {
                onExitStartRef.current?.();
              }, 0.48);
          }
        };

        gsap.ticker.add(tick);

        return () => {
          gsap.ticker.remove(tick);
          exitTl?.kill();
          unlockScrollEvents();
          start();
        };
      });

      return () => {
        mm.revert();
      };
    },
    { scope, dependencies: [start, stop] },
  );

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={scope}
      id="intro"
      aria-hidden="true"
      data-lenis-prevent
      className="fixed inset-0 z-[10000] h-svh overscroll-none bg-transparent text-foreground select-none"
    >
      <div
        ref={leftPanelRef}
        aria-hidden="true"
        className="intro-curtain-left pointer-events-none absolute inset-y-0 left-0 z-0 w-[calc(50%+1px)] bg-background will-change-transform"
      />
      <div
        ref={rightPanelRef}
        aria-hidden="true"
        className="intro-curtain-right pointer-events-none absolute inset-y-0 right-0 z-0 w-1/2 bg-background will-change-transform"
      />

      <div
        ref={contentRef}
        className="intro-content relative z-10 flex h-full w-full flex-col justify-between p-[clamp(20px,4vw,56px)]"
      >
        <div className="intro-top flex items-end justify-between font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          <span>{content.author}</span>
          <span>{content.yearLabel}</span>
        </div>

        <div className="intro-bottom flex items-end justify-between">
          <span className="font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {content.loadingLabel}
          </span>
          <span
            ref={countRef}
            className="intro-count font-display text-[clamp(4.5rem,14vw,12.5rem)] font-medium leading-[0.8] tracking-[-0.05em] text-foreground tabular-nums"
          >
            0
          </span>
        </div>

        <div
          ref={barRef}
          className="intro-bar absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-brand-bright"
        />
      </div>
    </div>
  );
}
