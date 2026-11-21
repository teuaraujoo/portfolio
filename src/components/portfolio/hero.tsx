"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const stack = ["Next.js", "Tailwind", "shadcn/ui", "GSAP"];

export function Hero() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({ defaults: { ease: "expo.out" } });

        timeline
          .from("[data-reveal='nav']", { autoAlpha: 0, y: -20, duration: 0.8 })
          .from(
            "[data-reveal='hero']",
            { autoAlpha: 0, y: 56, duration: 1.1, stagger: 0.1 },
            "-=0.45",
          )
          .from(
            "[data-reveal='stack']",
            { autoAlpha: 0, x: -18, duration: 0.7, stagger: 0.07 },
            "-=0.65",
          );
      });

      return () => media.revert();
    },
    { scope },
  );

  return (
    <main ref={scope} className="relative isolate min-h-[100dvh] overflow-hidden px-4 py-6 sm:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-brand-bright to-transparent opacity-70"
      />

      <nav
        data-reveal="nav"
        aria-label="Navegação principal"
        className="mx-auto flex max-w-[90rem] items-center justify-between"
      >
        <a href="#inicio" className="font-display text-sm font-semibold tracking-[-0.02em]">
          Portfolio<span className="text-brand-bright">.</span>
        </a>
        <span className="flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-brand-bright" aria-hidden="true" />
          Em construção
        </span>
      </nav>

      <section
        id="inicio"
        className="mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-[90rem] content-center gap-16 py-24 md:grid-cols-[minmax(0,1fr)_18rem] md:items-end md:gap-8 md:py-32"
      >
        <div className="max-w-5xl">
          <p
            data-reveal="hero"
            className="mb-8 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-brand-bright"
          >
            Creative developer · 2026
          </p>
          <h1 className="font-display text-[clamp(4rem,12vw,11rem)] font-medium leading-[0.8] tracking-[-0.075em]">
            <span data-reveal="hero" className="block">
              Digital
            </span>
            <span data-reveal="hero" className="block text-muted-foreground">
              experiences
            </span>
            <span data-reveal="hero" className="block">
              with intent<span className="text-brand-bright">.</span>
            </span>
          </h1>
        </div>

        <div className="md:pb-2">
          <p data-reveal="hero" className="mb-8 max-w-xs text-sm leading-7 text-muted-foreground">
            Uma base enxuta para construir um portfólio autoral, performático e guiado por movimento.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-3" aria-label="Tecnologias principais">
            {stack.map((item) => (
              <span
                key={item}
                data-reveal="stack"
                className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground/70"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
