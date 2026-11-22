"use client";

import { useEffect, useRef, useState } from "react";
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
 * Space Grotesk wordmark, a hairline separator, and a smooth-scroll back-to-top action.
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

      <div className="mt-4 flex justify-end md:mt-5">
        <button
          type="button"
          onClick={() => scrollTo(0)}
          aria-label={content.backToTopAriaLabel}
          className="group inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full px-2 py-1 font-sans text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright"
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
