"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUp } from "lucide-react";
import { KilnWordmark } from "@/components/ui/kiln-wordmark";
import type { FooterContent } from "@/data/footer";
import { cn } from "@/lib/utils";
import { useSmoothScroll } from "./smooth-scroll";

export interface FooterProps {
  content: FooterContent;
}

/**
 * Minimalist Editorial-Tech footer featuring the full-width interactive
 * Space Grotesk wordmark, a hairline separator, copyright notice, centered brand logo, and a smooth-scroll back-to-top action.
 */
export function Footer({ content }: FooterProps) {
  const { scrollTo } = useSmoothScroll();
  const footerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      const id = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative w-full overflow-x-clip bg-background px-[clamp(20px,3vw,48px)] pt-6 pb-6 text-foreground md:pt-8 md:pb-8"
    >
      <KilnWordmark
        text={content.wordmark}
        weight={content.wordmarkWeight}
        lens={content.enableLens}
      />

      <div
        aria-hidden="true"
        className={cn(
          "mt-2 h-px w-full bg-border transition-opacity duration-700 ease-out md:mt-3 motion-reduce:opacity-100 motion-reduce:transition-none",
          isVisible ? "opacity-100" : "opacity-0",
        )}
      />

      <div className="mt-4 flex flex-col-reverse items-center justify-between gap-4 md:mt-5 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6">
        <p className="text-center font-sans text-xs font-medium tracking-[0.04em] text-muted-foreground md:justify-self-start md:text-left">
          {content.copyright}
        </p>
        <a
          href="#hero"
          aria-label={content.logoAlt}
          className="inline-flex items-center justify-center rounded-md px-1 py-1 opacity-90 transition-opacity duration-200 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright md:justify-self-center"
        >
          <Image
            src={content.logoSrc}
            alt={content.logoAlt}
            width={1193}
            height={240}
            unoptimized
            className="h-5 w-auto md:h-6"
          />
        </a>
        <button
          type="button"
          onClick={() => scrollTo(0)}
          aria-label={content.backToTopAriaLabel}
          className="group inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full px-2 py-1 font-sans text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright md:justify-self-end"
        >
          <span>{content.backToTopLabel}</span>
          <ArrowUp
            aria-hidden="true"
            className="size-4 text-muted-foreground transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:text-brand-bright motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
          />
        </button>
      </div>
    </footer>
  );
}
