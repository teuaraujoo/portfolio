"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { ContatoContent } from "@/data/contato";
import type { FooterContent } from "@/data/footer";
import type { ContributionDay, HomePageData } from "@/data/home";
import type { JornadaContent } from "@/data/jornada";
import type { ProjetosContent } from "@/data/projetos";
import type { SkillsContent } from "@/data/skills";
import type { SobreContent } from "@/data/sobre";
import { Header } from "./header";
import { Hero } from "./hero";
import { Preloader } from "./preloader";
import { SmoothScrollProvider } from "./smooth-scroll";

const Sobre = dynamic(
  () => import("./sobre").then((mod) => mod.Sobre),
  { ssr: true },
);
const Projetos = dynamic(
  () => import("./projetos").then((mod) => mod.Projetos),
  { ssr: true },
);
const Jornada = dynamic(
  () => import("./jornada").then((mod) => mod.Jornada),
  { ssr: true },
);
const Skills = dynamic(
  () => import("./skills").then((mod) => mod.Skills),
  { ssr: true },
);
const Contato = dynamic(
  () => import("./contato").then((mod) => mod.Contato),
  { ssr: true },
);
const Footer = dynamic(
  () => import("./footer").then((mod) => mod.Footer),
  { ssr: true },
);

export interface HomeShellProps {
  data: HomePageData;
  sobre: SobreContent;
  projetos: ProjetosContent;
  jornada: JornadaContent;
  skills: SkillsContent;
  contato: ContatoContent;
  footer: FooterContent;
  contributions?: ContributionDay[];
}

/**
 * Orchestrates smooth scrolling, Preloader handoff, synchronized Header entrance,
 * and Hero timeline playback.
 */
export function HomeShell({
  data,
  sobre,
  projetos,
  jornada,
  skills,
  contato,
  footer,
  contributions,
}: HomeShellProps) {
  const [heroActive, setHeroActive] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const navTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const heroActiveRef = useRef(heroActive);
  const navCompletedRef = useRef(false);

  const handlePreloaderExitStart = useCallback(() => {
    setHeroActive(true);
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        navCompletedRef.current = true;
        gsap.set("#navbar", { clearProps: "opacity,visibility,transform" });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const navTimeline = gsap.timeline({
          paused: true,
          onComplete: () => {
            navCompletedRef.current = true;
          },
        });

        navTimeline.fromTo(
          "#navbar",
          { autoAlpha: 0, y: -12 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1.0,
            delay: 0.6,
            ease: "expo.out",
            clearProps: "transform",
          },
        );

        navTimelineRef.current = navTimeline;

        if (navCompletedRef.current) {
          navTimeline.progress(1);
        } else if (heroActiveRef.current) {
          navTimeline.play();
        }

        return () => {
          navTimelineRef.current = null;
        };
      });

      return () => {
        mm.revert();
      };
    },
    { scope: shellRef },
  );

  useEffect(() => {
    heroActiveRef.current = heroActive;
    if (heroActive && navTimelineRef.current && !navCompletedRef.current) {
      navTimelineRef.current.play();
    }
  }, [heroActive]);

  return (
    <SmoothScrollProvider>
      <div ref={shellRef} className="relative min-h-svh">
        <Preloader
          content={data.preloader}
          onExitStart={handlePreloaderExitStart}
        />
        <Header content={data.header} />
        <main>
          <Hero
            content={data.hero}
            contributions={contributions}
            active={heroActive}
          />
          <Sobre content={sobre} />
          <Projetos content={projetos} />
          <Jornada content={jornada} />
          <Skills content={skills} />
          <Contato content={contato} />
        </main>
        <Footer content={footer} />
      </div>
    </SmoothScrollProvider>
  );
}
