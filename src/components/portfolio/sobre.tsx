"use client";

import { Fragment, useEffect, useRef, useState, type MouseEvent } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { QuoteSegment, SobreContent } from "@/data/sobre";
import {
  BrushHighlight,
  DoubleUnderline,
  HandCircle,
  SparkAsterisk,
} from "./hand-drawn-annotations";
import { SobreDialog } from "./sobre-dialog";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface SobreProps {
  content: SobreContent;
}

function renderAnnotatedText(segment: QuoteSegment) {
  switch (segment.annotation) {
    case "brush":
      return (
        <BrushHighlight tone={segment.tone ?? "brand"} delayMs={segment.delayMs}>
          {segment.text}
        </BrushHighlight>
      );
    case "circle":
      return <HandCircle delayMs={segment.delayMs}>{segment.text}</HandCircle>;
    case "underline":
      return (
        <DoubleUnderline delayMs={segment.delayMs}>{segment.text}</DoubleUnderline>
      );
    default:
      return segment.text;
  }
}

/**
 * Editorial About section (`#sobre`) combining an annotated narrative quote,
 * a clip-revealed portrait with scroll parallax, and 3 animated stats.
 */
export function Sobre({ content }: SobreProps) {
  const scope = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [shown, setShown] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOrigin, setModalOrigin] = useState<{ x: number; y: number } | null>(null);

  const handleOpenModal = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.clientX === 0 && event.clientY === 0) {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        setModalOrigin({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      } else {
        setModalOrigin(null);
      }
    } else {
      setModalOrigin({ x: event.clientX, y: event.clientY });
    }

    setModalOpen(true);
  };

  useEffect(() => {
    const section = scope.current;
    if (!section) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      queueMicrotask(() => {
        setShown(true);
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(section);

    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setShown(true);
        observer.disconnect();
      }
    };

    mediaQuery.addEventListener("change", handleMotionChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".about-photo-inner", { clearProps: "clipPath" });
        gsap.set(".about-photo-parallax", { clearProps: "transform" });
        gsap.set(".about-stats-separator", { clearProps: "all" });
        gsap.set(".about-stat-item", { clearProps: "opacity,visibility,transform" });

        const counters = gsap.utils.toArray<HTMLElement>("[data-count]", scope.current);
        for (const el of counters) {
          if (el.dataset.count !== undefined) {
            el.textContent = el.dataset.count;
          }
        }
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".about-photo-inner",
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.4,
            ease: "expo.inOut",
            scrollTrigger: {
              trigger: ".about-photo",
              start: "top 80%",
              once: true,
            },
          },
        );

        gsap.fromTo(
          ".about-photo-parallax",
          { yPercent: -8 },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: ".about-photo",
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );

        gsap.from(".about-stats-separator", {
          autoAlpha: 0,
          duration: 0.85,
          ease: "power2.out",
          clearProps: "opacity,visibility",
          scrollTrigger: {
            trigger: ".about-stats",
            start: "top 80%",
            once: true,
          },
        });

        gsap.from(".about-stat-item", {
          y: 18,
          autoAlpha: 0,
          duration: 0.75,
          stagger: 0.12,
          ease: "expo.out",
          clearProps: "opacity,visibility,transform",
          scrollTrigger: {
            trigger: ".about-stats",
            start: "top 80%",
            once: true,
          },
        });

        const counters = gsap.utils.toArray<HTMLElement>("[data-count]", scope.current);
        const restoreTargets: Array<{ el: HTMLElement; targetValue: number }> = [];

        counters.forEach((el, i) => {
          const targetValue = Number(el.dataset.count ?? 0);
          if (!Number.isFinite(targetValue)) return;

          restoreTargets.push({ el, targetValue });
          const counter = { value: 0 };
          el.textContent = "0";

          gsap.to(counter, {
            value: targetValue,
            duration: 1.5,
            delay: i * 0.14,
            ease: "power1.out",
            scrollTrigger: {
              trigger: ".about-stats",
              start: "top 80%",
              once: true,
            },
            onUpdate: () => {
              el.textContent = String(Math.floor(counter.value));
            },
            onComplete: () => {
              el.textContent = String(targetValue);
            },
          });
        });

        return () => {
          for (const { el, targetValue } of restoreTargets) {
            el.textContent = String(targetValue);
          }
        };
      });

      return () => {
        mm.revert();
      };
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      id="sobre"
      aria-labelledby="sobre-title"
      data-shown={shown}
      className="group/sobre relative w-full bg-background px-[clamp(20px,4vw,56px)] py-24 text-foreground md:py-32 lg:py-36"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.85fr)] lg:gap-16 xl:gap-20">
          <div>
            <p className="mb-6 font-sans text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {content.eyebrow}
            </p>
            <h2
              id="sobre-title"
              aria-label={content.quoteAriaLabel}
              className="font-display text-[clamp(1.75rem,3.3vw,3.4rem)] font-semibold leading-[1.16] tracking-[-0.03em] text-foreground"
            >
              {content.segments.map((segment, index) => {
                const sparkDelayMs =
                  segment.annotation && segment.annotation !== "none"
                    ? (segment.delayMs ?? 0) + 150
                    : segment.delayMs;

                return (
                  <Fragment key={index}>
                    {renderAnnotatedText(segment)}
                    {segment.sparkAfter ? (
                      <SparkAsterisk delayMs={sparkDelayMs} />
                    ) : null}
                  </Fragment>
                );
              })}
            </h2>
          </div>

          <figure className="about-photo w-full max-w-[400px] lg:justify-self-end">
            <button
              ref={triggerRef}
              type="button"
              onClick={handleOpenModal}
              aria-label={content.modal.triggerAriaLabel}
              aria-haspopup="dialog"
              aria-expanded={modalOpen}
              className="group/photo relative block w-full cursor-pointer rounded-[12px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              <div className="about-photo-inner relative aspect-square w-full overflow-hidden rounded-[12px] border border-white/10 bg-card transition-colors duration-300 group-hover/photo:border-brand-bright/50 motion-reduce:transition-none">
                <div className="h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/photo:scale-[1.03] motion-reduce:transition-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={content.photo.src}
                    alt={content.photo.alt}
                    width={800}
                    height={800}
                    loading="lazy"
                    decoding="async"
                    className="about-photo-parallax h-[115%] w-full max-w-none object-cover object-[50%_25%] will-change-transform"
                  />
                </div>
              </div>

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-4 right-5 z-10 flex flex-col items-center"
              >
                <div className="flex items-center rounded-lg border border-white/15 bg-[#141318]/85 px-3 py-1.5 text-xs font-semibold text-white/95 shadow-lg backdrop-blur-md transition-[translate,background-color,border-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/photo:-translate-y-1 group-hover/photo:border-brand-bright/65 group-hover/photo:bg-[#141318] motion-reduce:transition-none">
                  <span>{content.modal.triggerLabel}</span>
                </div>
                <span
                  aria-hidden="true"
                  className="h-6 w-px bg-white/55 transition-[height,background-color] duration-300 group-hover/photo:h-8 group-hover/photo:bg-brand-bright/80 motion-reduce:transition-none"
                />
                <span aria-hidden="true" className="relative size-3">
                  <span className="absolute inset-0 animate-ping rounded-full bg-brand-bright/65 motion-reduce:animate-none" />
                  <span className="absolute inset-0 rounded-full border-2 border-white/90 bg-brand-bright" />
                </span>
              </div>
            </button>

            <figcaption className="mt-3 flex items-center justify-between font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              <span>{content.photo.captionLeft}</span>
              <span>{content.photo.captionRight}</span>
            </figcaption>
          </figure>
        </div>

        <div className="mx-auto mt-20 max-w-4xl lg:mt-28">
          <div
            aria-hidden="true"
            className="about-stats-separator h-px w-full bg-border"
          />
          <ul className="about-stats grid grid-cols-1 gap-x-8 sm:grid-cols-3">
            {content.stats.map((stat) => (
              <li
                key={stat.id}
                className="about-stat-item flex flex-col items-center gap-3 border-b border-border py-6 text-center md:py-8"
              >
                <span className="stat-num font-display text-[clamp(3rem,6vw,6rem)] font-medium leading-[0.9] tracking-[-0.045em] text-foreground tabular-nums">
                  {stat.prefix ? (
                    <sup className="-top-[1.05em] mr-1 text-[0.34em] tracking-normal text-brand-bright">
                      {stat.prefix}
                    </sup>
                  ) : null}
                  <span data-count={stat.value}>{stat.value}</span>
                  {stat.suffix ? (
                    <sup className="-top-[1.05em] ml-1 text-[0.34em] tracking-normal text-brand-bright">
                      {stat.suffix}
                    </sup>
                  ) : null}
                </span>
                <span className="font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  {stat.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <SobreDialog
        open={modalOpen}
        origin={modalOrigin}
        photoSrc={content.photo.src}
        content={content.modal}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}
