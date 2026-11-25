"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface TimelineItem {
  id: string;
  [key: string]: unknown;
}

export interface TimelineProps<T extends { id: string } = TimelineItem> {
  id?: string;
  eyebrow?: string;
  titleLine1: string;
  titleLine2?: string;
  periodLabel: string;
  intro?: string;
  scrollCue?: string;
  headerExtra?: ReactNode;
  items: readonly T[];
  renderStop: (
    item: T,
    index: number,
    layout: "desktop" | "mobile",
  ) => ReactNode;
  isWideStop?: (item: T, index: number) => boolean;
  className?: string;
}

/**
 * Reusable editorial timeline primitive.
 *
 * On desktop (`>= 900px`) with motion enabled, renders a sticky horizontal
 * scrub track with alternating top/bottom stops driven by `ScrollTrigger` and
 * `containerAnimation`. On mobile (`< 900px`) or under
 * `prefers-reduced-motion: reduce`, switches to a clean vertical timeline.
 */
export function Timeline<T extends { id: string } = TimelineItem>({
  id = "jornada",
  eyebrow,
  titleLine1,
  titleLine2,
  periodLabel,
  intro,
  scrollCue,
  headerExtra,
  items,
  renderStop,
  isWideStop,
  className,
}: TimelineProps<T>) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const titleId = `${id}-title`;
  const mobileTitleId = `${id}-title-mobile`;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (sectionRef.current) {
          sectionRef.current.style.height = "";
        }
        gsap.set(
          [
            ".journey-line",
            ".jd-dot",
            ".jl-stem",
            ".journey-stop-media",
            ".journey-stop-media-inner",
            ".journey-stop-copy",
            ".journey-stop-card",
            ".journey-mobile-stop",
          ],
          { clearProps: "all" },
        );
        gsap.set([".timeline-separator", ".timeline-mobile-separator"], {
          clearProps: "opacity,visibility",
        });
        if (trackRef.current) {
          gsap.set(trackRef.current, { clearProps: "transform" });
        }
      });

      mm.add(
        "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
        () => {
          const section = sectionRef.current;
          const stage = stageRef.current;
          const track = trackRef.current;
          if (!section || !stage || !track) return;

          gsap.from(".timeline-separator", {
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

          const getScrollDistance = () =>
            Math.max(0, track.scrollWidth - stage.clientWidth + 64);

          let lastDistance = getScrollDistance();
          let resizeRafId = 0;

          const updateHeight = (measuredDistance?: number) => {
            const distance = measuredDistance ?? getScrollDistance();
            lastDistance = distance;
            const nextHeight =
              distance > 0 ? `${window.innerHeight + distance}px` : "";
            if (section.style.height !== nextHeight) {
              section.style.height = nextHeight;
            }
          };

          const handleRefreshInit = () => updateHeight();

          updateHeight(lastDistance);
          ScrollTrigger.addEventListener("refreshInit", handleRefreshInit);

          const resizeObserver =
            typeof ResizeObserver !== "undefined"
              ? new ResizeObserver(() => {
                  if (resizeRafId !== 0) return;
                  resizeRafId = requestAnimationFrame(() => {
                    resizeRafId = 0;
                    const nextDistance = getScrollDistance();
                    if (Math.abs(nextDistance - lastDistance) > 2) {
                      updateHeight(nextDistance);
                      ScrollTrigger.refresh();
                    }
                  });
                })
              : null;

          resizeObserver?.observe(track);
          resizeObserver?.observe(stage);

          const horizontalTween = gsap.to(track, {
            x: () => -getScrollDistance(),
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${getScrollDistance()}`,
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });

          gsap.fromTo(
            ".journey-line",
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "none",
              transformOrigin: "left center",
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: () => `+=${getScrollDistance()}`,
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );

          const hasHorizontalScroll = getScrollDistance() > 0;
          const stops = gsap.utils.toArray<HTMLElement>(
            ".journey-stop",
            section,
          );

          for (const [index, stopEl] of stops.entries()) {
            const isTop = stopEl.dataset.top === "true";
            const isInitiallyVisible = !hasHorizontalScroll || index < 2;

            const dotEl = stopEl.querySelector<HTMLElement>(".jd-dot");
            const stemEl = stopEl.querySelector<HTMLElement>(".jl-stem");
            const mediaEl =
              stopEl.querySelector<HTMLElement>(".journey-stop-media");
            const mediaInnerEl = stopEl.querySelector<HTMLElement>(
              ".journey-stop-media-inner",
            );
            const copyEl =
              stopEl.querySelector<HTMLElement>(".journey-stop-copy");
            const cardEl =
              stopEl.querySelector<HTMLElement>(".journey-stop-card");

            const tl = gsap.timeline({
              delay: isInitiallyVisible ? index * 0.18 : 0,
              scrollTrigger: isInitiallyVisible
                ? {
                    trigger: section,
                    start: "top 72%",
                    once: true,
                  }
                : {
                    trigger: stopEl,
                    containerAnimation: horizontalTween,
                    start: "left 88%",
                    toggleActions: "play none none reverse",
                  },
            });

            if (dotEl) {
              tl.fromTo(
                dotEl,
                { scale: 0 },
                { scale: 1, duration: 0.45, ease: "back.out(2.6)" },
                0,
              );
            }

            if (stemEl) {
              tl.fromTo(
                stemEl,
                { scaleY: 0 },
                {
                  scaleY: 1,
                  duration: 0.45,
                  ease: "expo.out",
                  transformOrigin: isTop ? "bottom center" : "top center",
                },
                0.06,
              );
            }

            if (mediaEl) {
              tl.fromTo(
                mediaEl,
                {
                  clipPath: isTop
                    ? "inset(100% 0% 0% 0% round 12px)"
                    : "inset(0% 0% 100% 0% round 12px)",
                  y: isTop ? 36 : -36,
                  scale: 0.88,
                  autoAlpha: 0,
                },
                {
                  clipPath: "inset(0% 0% 0% 0% round 12px)",
                  y: 0,
                  scale: 1,
                  autoAlpha: 1,
                  duration: 0.9,
                  ease: "expo.out",
                },
                0.1,
              );
            }

            if (mediaInnerEl) {
              tl.fromTo(
                mediaInnerEl,
                { scale: 1.24 },
                { scale: 1, duration: 1.15, ease: "expo.out" },
                0.1,
              );
            }

            if (copyEl) {
              tl.fromTo(
                copyEl,
                { x: 28, autoAlpha: 0 },
                { x: 0, autoAlpha: 1, duration: 0.75, ease: "expo.out" },
                0.22,
              );
            }

            if (!mediaEl && !copyEl && cardEl) {
              tl.fromTo(
                cardEl,
                { y: isTop ? -24 : 24, autoAlpha: 0, scale: 0.92 },
                { y: 0, autoAlpha: 1, scale: 1, duration: 0.85, ease: "expo.out" },
                0.1,
              );
            }
          }

          return () => {
            if (resizeRafId !== 0) {
              cancelAnimationFrame(resizeRafId);
              resizeRafId = 0;
            }
            ScrollTrigger.removeEventListener("refreshInit", handleRefreshInit);
            resizeObserver?.disconnect();
            section.style.height = "";
          };
        },
      );

      mm.add(
        "(max-width: 899px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.from(".timeline-mobile-separator", {
            autoAlpha: 0,
            duration: 0.85,
            ease: "power2.out",
            clearProps: "opacity,visibility",
            scrollTrigger: {
              trigger: ".timeline-mobile-separator",
              start: "top 90%",
              once: true,
            },
          });

          const mobileStops = gsap.utils.toArray<HTMLElement>(
            ".journey-mobile-stop",
            sectionRef.current,
          );

          for (const stopEl of mobileStops) {
            gsap.from(stopEl, {
              y: 36,
              scale: 0.96,
              autoAlpha: 0,
              duration: 0.85,
              ease: "expo.out",
              clearProps: "transform",
              scrollTrigger: {
                trigger: stopEl,
                start: "top 88%",
                once: true,
              },
            });
          }
        },
      );

      return () => {
        mm.revert();
      };
    },
    {
      scope: sectionRef,
      dependencies: [items.length],
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
      {/* Desktop Sticky Horizontal Timeline */}
      <div className="hidden h-full min-[900px]:block motion-reduce:hidden">
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

              <div className="flex flex-wrap items-center justify-end gap-3">
                <span className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground tabular-nums">
                  {periodLabel}
                </span>
                {headerExtra}
              </div>
            </div>
            <div
              aria-hidden="true"
              className="timeline-separator h-px w-full bg-border"
            />
          </div>

          <div
            ref={stageRef}
            className="relative flex min-h-0 flex-1 items-center overflow-hidden px-[clamp(20px,4vw,56px)]"
          >
            <div
              ref={trackRef}
              className="relative flex h-full w-max items-center pr-[12vw] will-change-transform"
            >
              <div className="w-[clamp(380px,42vw,680px)] shrink-0 pl-[clamp(36px,7vw,140px)] pr-[clamp(48px,6vw,112px)]">
                <h2
                  id={titleId}
                  className="font-display text-[clamp(3.15rem,5.8vw,6rem)] font-semibold leading-[0.94] tracking-[-0.045em] text-foreground"
                >
                  <span className="block">{titleLine1}</span>
                  {titleLine2 ? (
                    <span className="block text-brand-bright">
                      {titleLine2}
                    </span>
                  ) : null}
                </h2>
                {intro ? (
                  <p className="mt-5 max-w-[36ch] text-sm lg:text-base leading-relaxed text-muted-foreground">
                    {intro}
                  </p>
                ) : null}
                {scrollCue ? (
                  <div className="mt-6 inline-flex items-center gap-2 font-sans text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    <span>{scrollCue}</span>
                    <ArrowRight
                      className="size-3.5 text-brand-bright"
                      aria-hidden="true"
                    />
                  </div>
                ) : null}
              </div>

              <div className="relative flex h-full items-center">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center"
                >
                  <span className="size-2.5 shrink-0 rounded-full bg-brand-bright shadow-[0_0_14px_rgba(121,60,255,0.6)]" />
                  <div className="relative h-px flex-1 bg-white/10">
                    <div className="journey-line h-full w-full origin-left bg-linear-to-r from-brand via-brand-bright to-brand-bright/70 shadow-[0_0_12px_rgba(121,60,255,0.45)]" />
                  </div>
                  <span className="size-2 shrink-0 rounded-full bg-brand-bright/70" />
                </div>

                <ol className="relative flex h-full items-stretch gap-x-[clamp(44px,5.5vw,92px)]">
                  {items.map((item, index) => {
                    const isTop = index % 2 === 0;
                    const wide = isWideStop?.(item, index) ?? false;
                    return (
                      <li
                        key={item.id}
                        data-top={isTop ? "true" : "false"}
                        className={cn(
                          "journey-stop relative flex h-full shrink-0 flex-col",
                          wide
                            ? "w-[clamp(540px,48vw,760px)]"
                            : "w-[clamp(420px,38vw,580px)]",
                        )}
                      >
                        <div className="relative flex h-1/2 flex-col justify-end pb-5">
                          {isTop ? (
                            <>
                              <div className="journey-stop-card pl-5">
                                {renderStop(item, index, "desktop")}
                              </div>
                              <span
                                aria-hidden="true"
                                className="jl-stem pointer-events-none absolute bottom-0 left-1.5 h-5 w-px -translate-x-1/2 bg-brand-bright/75"
                              />
                              <span
                                aria-hidden="true"
                                className="jd-dot pointer-events-none absolute bottom-0 left-1.5 z-10 size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-bright ring-4 ring-brand-bright/20 shadow-[0_0_12px_rgba(121,60,255,0.7)]"
                              />
                            </>
                          ) : null}
                        </div>

                        <div className="relative flex h-1/2 flex-col justify-start pt-5">
                          {!isTop ? (
                            <>
                              <span
                                aria-hidden="true"
                                className="jd-dot pointer-events-none absolute top-0 left-1.5 z-10 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-bright ring-4 ring-brand-bright/20 shadow-[0_0_12px_rgba(121,60,255,0.7)]"
                              />
                              <span
                                aria-hidden="true"
                                className="jl-stem pointer-events-none absolute top-0 left-1.5 h-5 w-px -translate-x-1/2 bg-brand-bright/75"
                              />
                              <div className="journey-stop-card pl-5">
                                {renderStop(item, index, "desktop")}
                              </div>
                            </>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile & Reduced Motion Vertical Fallback */}
      <div className="block min-[900px]:hidden motion-reduce:block">
        <div className="mx-auto max-w-[1600px] px-[clamp(20px,4vw,56px)] py-20 md:py-28">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
              {eyebrow ? (
                <p className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  {eyebrow}
                </p>
              ) : (
                <span />
              )}
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground tabular-nums">
                {periodLabel}
              </span>
            </div>
            <div
              aria-hidden="true"
              className="timeline-mobile-separator h-px w-full bg-border"
            />
          </div>

          <div className="mt-8 space-y-4">
            <h2
              id={mobileTitleId}
              className="font-display text-[clamp(2.1rem,6vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-foreground"
            >
              <span className="block">{titleLine1}</span>
              {titleLine2 ? (
                <span className="block text-brand-bright">{titleLine2}</span>
              ) : null}
            </h2>
            {intro ? (
              <p className="max-w-[54ch] text-sm leading-relaxed text-muted-foreground md:text-base">
                {intro}
              </p>
            ) : null}
            {headerExtra ? <div className="pt-2">{headerExtra}</div> : null}
          </div>

          <ol className="relative mt-12 ml-2.5 space-y-10 border-l border-brand-bright/35 pl-6 sm:pl-8">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="journey-mobile-stop relative"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-5 -left-[29px] size-2.5 rounded-full bg-brand-bright ring-4 ring-brand-bright/20 shadow-[0_0_12px_rgba(121,60,255,0.75)] sm:-left-[37px]"
                />
                {renderStop(item, index, "mobile")}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
