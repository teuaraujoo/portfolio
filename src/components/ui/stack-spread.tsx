"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNearViewport } from "@/hooks/use-near-viewport";
import { cn } from "@/lib/utils";

export interface StackSpreadPlacement {
  linearOffset: { xVw: number; yVh: number };
  linearRotate: number;
  orbitTarget: {
    xVw: number;
    yVh: number;
    rotate: number;
    scale: number;
  };
  zIndex: number;
}

export interface StackSpreadItem {
  id: string;
  placement: StackSpreadPlacement;
}

export interface StackSpreadProps<
  T extends StackSpreadItem = StackSpreadItem,
> {
  id?: string;
  eyebrow?: string;
  metaRight?: ReactNode;
  scrollLength?: number;
  stackScale?: number;
  scrollHint?: string;
  items: readonly T[];
  centerSlot: ReactNode;
  renderCard: (
    item: T,
    state: { isSpread: boolean; index: number },
  ) => ReactNode;
  mobileHeader: ReactNode;
  renderMobileGrid: () => ReactNode;
  afterStage?: ReactNode;
  className?: string;
}

interface ParallaxController {
  depth: number;
  xTo: gsap.QuickToFunc;
  yTo: gsap.QuickToFunc;
}

/**
 * Reusable GSAP ScrollTrigger `Linear -> Orbit` stage primitive.
 *
 * On desktop (`>= 768px`) with motion enabled, renders a sticky orbital stage
 * driven by `ScrollTrigger` (`scrub`) with `gsap.quickTo` pointer parallax on
 * a nested `.skill-parallax-layer` wrapper. On mobile (`< 768px`) or under
 * `prefers-reduced-motion: reduce`, renders a static/staggered vertical grid
 * without artificial scroll height.
 */
export function StackSpread<T extends StackSpreadItem = StackSpreadItem>({
  id = "skills",
  eyebrow,
  metaRight,
  scrollLength = 250,
  stackScale = 0.78,
  scrollHint,
  items,
  centerSlot,
  renderCard,
  mobileHeader,
  renderMobileGrid,
  afterStage,
  className,
}: StackSpreadProps<T>) {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [isSpread, setIsSpread] = useState(false);
  const spreadRef = useRef(false);
  const isNear = useNearViewport(sectionRef, "650px 0px");

  const titleId = `${id}-title`;

  const placementSignature = items
    .map((item) => {
      const { linearOffset, linearRotate, orbitTarget, zIndex } =
        item.placement;
      return `${item.id}:${linearOffset.xVw},${linearOffset.yVh},${linearRotate},${orbitTarget.xVw},${orbitTarget.yVh},${orbitTarget.rotate},${orbitTarget.scale},${zIndex}`;
    })
    .join("|");

  useGSAP(
    () => {
      if (!isNear) return;

      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            ".stack-spread-card",
            ".skill-parallax-layer",
            ".skills-center-copy",
            ".skills-scroll-hint",
            ".skill-mobile-card",
          ],
          { clearProps: "all" },
        );
        gsap.set(
          [
            ".stack-separator",
            ".skill-mobile-separator",
            ".skills-after-separator",
          ],
          { clearProps: "opacity,visibility" },
        );
      });

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const section = sectionRef.current;
          const wrap = wrapRef.current;
          const stage = stageRef.current;
          if (!section || !wrap || !stage) return;

          gsap.from(".stack-separator", {
            autoAlpha: 0,
            duration: 0.85,
            ease: "power2.out",
            clearProps: "opacity,visibility",
            scrollTrigger: {
              trigger: section,
              start: "top 86%",
              once: true,
            },
          });

          const cardEls = gsap.utils.toArray<HTMLElement>(
            ".stack-spread-card",
            stage,
          );

          const parallaxControllers: ParallaxController[] = [];
          cardEls.forEach((cardEl, index) => {
            const layerEl = cardEl.querySelector<HTMLElement>(
              ".skill-parallax-layer",
            );
            if (!layerEl) return;

            parallaxControllers.push({
              depth: 14 + (index % 3) * 7,
              xTo: gsap.quickTo(layerEl, "x", {
                duration: 0.55,
                ease: "power3.out",
              }),
              yTo: gsap.quickTo(layerEl, "y", {
                duration: 0.55,
                ease: "power3.out",
              }),
            });
          });

          const resetParallax = () => {
            for (const controller of parallaxControllers) {
              controller.xTo(0);
              controller.yTo(0);
            }
          };

          const handlePointerMove = (event: PointerEvent) => {
            if (event.pointerType === "touch" || !spreadRef.current) return;

            const rect = stage.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const normalizedX =
              ((event.clientX - rect.left) / rect.width - 0.5) * 2;
            const normalizedY =
              ((event.clientY - rect.top) / rect.height - 0.5) * 2;

            for (const controller of parallaxControllers) {
              controller.xTo(normalizedX * controller.depth);
              controller.yTo(normalizedY * controller.depth);
            }
          };

          stage.addEventListener("pointermove", handlePointerMove);
          stage.addEventListener("pointerleave", resetParallax);

          const masterTl = gsap.timeline({
            scrollTrigger: {
              trigger: wrap,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.65,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const next = self.progress >= 0.84;
                if (next !== spreadRef.current) {
                  spreadRef.current = next;
                  setIsSpread(next);
                  if (!next) {
                    resetParallax();
                  }
                }
              },
            },
          });

          const hintEl = stage.querySelector<HTMLElement>(
            ".skills-scroll-hint",
          );
          if (hintEl) {
            masterTl.fromTo(
              hintEl,
              { autoAlpha: 1 },
              { autoAlpha: 0, duration: 0.15, ease: "none" },
              0,
            );
          }

          const centerEl = stage.querySelector<HTMLElement>(
            ".skills-center-copy",
          );
          if (centerEl) {
            masterTl.fromTo(
              centerEl,
              { autoAlpha: 0, scale: 0.9 },
              { autoAlpha: 1, scale: 1, duration: 0.4, ease: "power2.out" },
              0.26,
            );
          }

          cardEls.forEach((cardEl, index) => {
            const item = items[index];
            if (!item) return;

            masterTl.fromTo(
              cardEl,
              {
                xPercent: -50,
                yPercent: -50,
                x: () =>
                  (item.placement.linearOffset.xVw / 100) * window.innerWidth,
                y: () =>
                  (item.placement.linearOffset.yVh / 100) * window.innerHeight,
                rotation: item.placement.linearRotate,
                scale: stackScale,
              },
              {
                xPercent: -50,
                yPercent: -50,
                x: () =>
                  (item.placement.orbitTarget.xVw / 100) * window.innerWidth,
                y: () =>
                  (item.placement.orbitTarget.yVh / 100) * window.innerHeight,
                rotation: item.placement.orbitTarget.rotate,
                scale: item.placement.orbitTarget.scale,
                duration: 0.75,
                ease: "power2.inOut",
              },
              0.1,
            );
          });

          // Pad timeline duration to 1.0 so normalized positions map 1:1 to ScrollTrigger progress.
          masterTl.to({}, { duration: 0.15 }, 0.85);

          return () => {
            stage.removeEventListener("pointermove", handlePointerMove);
            stage.removeEventListener("pointerleave", resetParallax);
          };
        },
      );

      mm.add(
        "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        () => {
          if (sectionRef.current?.querySelector(".skill-mobile-separator")) {
            gsap.from(".skill-mobile-separator", {
              autoAlpha: 0,
              duration: 0.85,
              ease: "power2.out",
              clearProps: "opacity,visibility",
              scrollTrigger: {
                trigger: ".skill-mobile-separator",
                start: "top 90%",
                once: true,
              },
            });
          }

          const mobileCards = gsap.utils.toArray<HTMLElement>(
            ".skill-mobile-card",
            sectionRef.current,
          );

          if (mobileCards.length > 0) {
            gsap.from(mobileCards, {
              y: 24,
              autoAlpha: 0,
              duration: 0.65,
              ease: "power2.out",
              stagger: 0.05,
              clearProps: "transform",
              scrollTrigger: {
                trigger: mobileCards[0],
                start: "top 88%",
                once: true,
              },
            });
          }
        },
      );

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (sectionRef.current?.querySelector(".skills-after-separator")) {
          gsap.from(".skills-after-separator", {
            autoAlpha: 0,
            duration: 0.85,
            ease: "power2.out",
            clearProps: "opacity,visibility",
            scrollTrigger: {
              trigger: ".skills-after-separator",
              start: "top 92%",
              once: true,
            },
          });
        }
      });

      return () => {
        mm.revert();
      };
    },
    {
      scope: sectionRef,
      dependencies: [placementSignature, stackScale, isNear],
      revertOnUpdate: true,
    },
  );

  return (
    <section
      ref={sectionRef}
      id={id}
      aria-labelledby={titleId}
      className={cn(
        "relative w-full overflow-x-clip bg-background text-foreground",
        className,
      )}
    >
      {/* Desktop Sticky Orbital Stage */}
      <div
        ref={wrapRef}
        style={{ height: `${scrollLength}vh` }}
        className="hidden min-[768px]:block motion-reduce:hidden"
      >
        <div className="sticky top-0 flex h-svh w-full flex-col overflow-hidden pt-20 pb-6 md:pt-24">
          <div className="mx-auto w-full max-w-[1600px] shrink-0 px-[clamp(20px,4vw,56px)]">
            <div className="flex items-center justify-between gap-4 pb-3">
              {eyebrow ? (
                <p className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  {eyebrow}
                </p>
              ) : (
                <span />
              )}

              {metaRight ? (
                <div className="flex flex-wrap items-center justify-end gap-3 font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground tabular-nums">
                  {metaRight}
                </div>
              ) : null}
            </div>
            <div
              aria-hidden="true"
              className="stack-separator h-px w-full bg-border"
            />
          </div>

          <div ref={stageRef} className="relative flex-1">
            {/* Ambient radial glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <div
                className="h-[min(46vw,520px)] w-[min(46vw,520px)] rounded-full blur-[110px]"
                style={{
                  background:
                    "radial-gradient(circle, rgba(72, 17, 237, 0.16) 0%, rgba(121, 60, 255, 0.08) 45%, transparent 72%)",
                }}
              />
            </div>

            {/* Center Editorial Copy */}
            <div className="skills-center-copy pointer-events-none absolute inset-0 z-[5] flex items-center justify-center px-6 text-center">
              {centerSlot}
            </div>

            {/* Cards Layer */}
            <div className="pointer-events-none absolute inset-0 z-10">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  data-index={index}
                  style={{ "--stack-z": item.placement.zIndex } as CSSProperties}
                  className="stack-spread-card pointer-events-auto absolute left-1/2 top-1/2 z-(--stack-z) will-change-transform hover:z-50 focus-within:z-50"
                >
                  <div className="skill-parallax-layer will-change-transform">
                    {renderCard(item, { isSpread, index })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Scroll Hint */}
            {scrollHint ? (
              <div className="skills-scroll-hint pointer-events-none absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-2">
                <span className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {scrollHint}
                </span>
                <span
                  aria-hidden="true"
                  className="h-7 w-px animate-pulse bg-linear-to-b from-brand-bright via-brand-bright/60 to-transparent"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile & Reduced Motion Fallback */}
      <div className="block min-[768px]:hidden motion-reduce:block">
        <div className="mx-auto max-w-[1600px] px-[clamp(20px,4vw,56px)] pt-20 pb-10">
          {mobileHeader}
          {renderMobileGrid()}
        </div>
      </div>

      {afterStage}
    </section>
  );
}
