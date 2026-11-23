"use client";

import { Fragment, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ContributionSkyline } from "@/components/ui/contribution-skyline";
import { SilkShaderBackground } from "@/components/ui/silk-shader-background";
import type { ContributionDay, HeroContent } from "@/data/home";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface HeroProps {
  content: HeroContent;
  contributions?: ContributionDay[];
  active: boolean;
}

function splitChars(text: string, prefix: string) {
  return Array.from(text).map((char, index) => (
    <span
      key={`${prefix}-${index}`}
      className="char inline-block will-change-transform"
    >
      {char === " " ? "\u00A0" : char}
    </span>
  ));
}

/**
 * Full-viewport editorial Hero section with asymmetrical 2-column layout
 * (left identity & narrative, right GitHub Contribution Skyline & scroll cue),
 * staggered character reveal, and reduced-motion support.
 */
export function Hero({ content, contributions, active }: HeroProps) {
  const scope = useRef<HTMLElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const activeRef = useRef(active);
  const hasCompletedRef = useRef(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        hasCompletedRef.current = true;
        gsap.set(
          [
            ".hero-name .char",
            "[data-hero-fade]",
            ".hero-parallax-title-1",
            ".hero-parallax-title-2",
            ".hero-parallax-copy",
            ".hero-parallax-map",
            ".hero-parallax-foot",
          ],
          {
            clearProps: "opacity,visibility,transform",
          },
        );
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({
          paused: true,
          defaults: { ease: "expo.out" },
          onComplete: () => {
            hasCompletedRef.current = true;
          },
        });

        timeline
          .from(
            ".hero-name .char",
            { yPercent: 135, duration: 1.4, stagger: 0.045 },
            0.1,
          )
          .from(
            "[data-hero-fade]",
            { y: 20, autoAlpha: 0, duration: 1.2, stagger: 0.08 },
            0.5,
          );

        timelineRef.current = timeline;

        if (hasCompletedRef.current) {
          timeline.progress(1);
        } else if (activeRef.current) {
          timeline.play();
        }

        return () => {
          timelineRef.current = null;
        };
      });

      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          if (!scope.current) return;

          const parallaxTl = gsap.timeline({
            scrollTrigger: {
              trigger: scope.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          });

          parallaxTl
            .to(
              ".hero-parallax-title-1",
              { y: 48, opacity: 0.22, ease: "none" },
              0,
            )
            .to(
              ".hero-parallax-title-2",
              { y: 78, opacity: 0.18, ease: "none" },
              0,
            )
            .to(".hero-parallax-copy", { y: -22, opacity: 0.28, ease: "none" }, 0)
            .to(".hero-parallax-map", { y: -76, opacity: 0.15, ease: "none" }, 0)
            .to(".hero-parallax-foot", { y: -36, opacity: 0, ease: "none" }, 0);
        },
      );

      return () => {
        mm.revert();
      };
    },
    { scope },
  );

  useEffect(() => {
    activeRef.current = active;
    if (active && timelineRef.current && !hasCompletedRef.current) {
      timelineRef.current.play();
    }
  }, [active]);

  return (
    <section
      ref={scope}
      id="hero"
      aria-label="Apresentação"
      className="relative min-h-svh lg:h-svh w-full overflow-hidden bg-background text-foreground px-[clamp(20px,4vw,56px)] pt-24 pb-6 md:pt-28 md:pb-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <SilkShaderBackground className="size-full" />
        {/* Subtle readability veil preserving WCAG contrast over luminous #916BBF bands */}
        <div className="absolute inset-0 bg-linear-to-r from-background/50 via-background/20 to-background/40" />
        {/* Seamless bottom transition into #sobre (#0D0D0D) */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent to-background md:h-44" />
      </div>

      <div className="mx-auto relative z-10 grid h-full max-w-[1600px] grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:items-stretch lg:gap-8 xl:gap-10">
        <div className="flex flex-col items-start lg:justify-center">
          <h1 className="hero-name max-w-full font-display font-medium text-[clamp(4.5rem,13vw,14.5rem)] lg:text-[clamp(4.5rem,min(13vw,20svh),14.5rem)] leading-[0.84] tracking-[-0.055em]">
            <span className="sr-only">
              {`${content.firstName} ${content.lastName} — ${content.role} em ${content.location}`}
            </span>
            <span
              className="line hero-parallax-title-1 ml-[-0.04em] block overflow-hidden pt-[0.04em] pb-[0.06em] will-change-transform"
              aria-hidden="true"
            >
              <span className="line-inner block pr-[0.04em] will-change-transform">
                {splitChars(content.firstName, "first")}
              </span>
            </span>
            <span
              className="line hero-parallax-title-2 -mt-[0.04em] block overflow-hidden pt-[0.04em] pb-[0.22em] will-change-transform"
              aria-hidden="true"
            >
              <span className="line-inner block pl-[0.75em] pr-[0.04em] lg:pl-[0.85em] will-change-transform">
                {splitChars(content.lastName, "last")}
              </span>
            </span>
          </h1>

          <div className="hero-parallax-copy flex max-w-full flex-col items-start will-change-transform">
            <div
              data-hero-fade=""
              className="hero-eyebrow mt-3 inline-flex max-w-full flex-wrap items-center gap-x-3 gap-y-1.5 rounded-full border border-white/14 bg-white/[0.04] px-4 py-2.5 text-[clamp(13px,1.05vw,15px)] leading-none sm:flex-nowrap sm:whitespace-nowrap backdrop-blur-md"
            >
              <span
                className="size-2 shrink-0 rounded-full bg-brand-bright animate-hero-pulse"
                aria-hidden="true"
              />
              <span className="font-medium text-foreground">{content.role}</span>
              <span className="h-3.5 w-px bg-white/20" aria-hidden="true" />
              <span className="text-muted-foreground">{content.location}</span>
            </div>

            <p
              data-hero-fade=""
              className="hero-lead mt-5 max-w-[48ch] font-sans text-[clamp(0.95rem,1.15vw,1.125rem)] leading-[1.55] text-muted-foreground"
            >
              {content.leadSegments.map((segment, index) =>
                segment.highlight ? (
                  <strong key={index} className="font-medium text-foreground">
                    {segment.text}
                  </strong>
                ) : (
                  <Fragment key={index}>{segment.text}</Fragment>
                ),
              )}
            </p>

            <p
              data-hero-fade=""
              className="hero-bio mt-3 max-w-[52ch] font-sans text-[clamp(0.875rem,1.02vw,0.975rem)] leading-[1.6] text-muted-foreground/90"
            >
              {content.bioSegments.map((segment, index) =>
                segment.highlight ? (
                  <strong key={index} className="font-medium text-foreground/95">
                    {segment.text}
                  </strong>
                ) : (
                  <Fragment key={index}>{segment.text}</Fragment>
                ),
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start lg:h-full lg:items-end lg:justify-end">
          <div className="hero-parallax-map w-full max-w-[400px] lg:mt-auto lg:mb-4 lg:self-end xl:max-w-[440px] will-change-transform">
            <div data-hero-fade="">
              <ContributionSkyline
                {...content.gitMap}
                data={contributions ?? content.gitMap.data}
                animate={active}
                footer={null}
              />
            </div>
          </div>

          <div className="hero-parallax-foot mt-6 w-full lg:mt-0 will-change-transform">
            <div data-hero-fade="" className="hero-foot flex w-full justify-end">
              <a
                href={content.scrollHint.targetHref}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md px-1 font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span>{content.scrollHint.label}</span>
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
