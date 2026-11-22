"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { X } from "lucide-react";
import type { SobreModalContent } from "@/data/sobre";
import { cn } from "@/lib/utils";
import { useSmoothScroll } from "./smooth-scroll";

export interface SobreDialogProps {
  open: boolean;
  origin: { x: number; y: number } | null;
  photoSrc: string;
  content: SobreModalContent;
  onClose: () => void;
}

/**
 * Editorial-tech modal dialog with radial `clip-path` expansion anchored to
 * the trigger click coordinates. Displays the extended About narrative.
 */
export function SobreDialog({ open, origin, content, onClose }: SobreDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const { stop, start } = useSmoothScroll();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (!origin) {
      panel.style.setProperty("--ox", "50%");
      panel.style.setProperty("--oy", "50%");
      if (open) {
        const rect = panel.getBoundingClientRect();
        const maxR = Math.ceil(Math.hypot(rect.width / 2, rect.height / 2)) + 20;
        panel.style.setProperty("--or", `${maxR}px`);
        panel.scrollTop = 0;
      } else {
        panel.style.setProperty("--or", "750px");
      }
      return;
    }

    if (open) {
      const rect = panel.getBoundingClientRect();
      const ox = Math.max(0, Math.min(rect.width, origin.x - rect.left));
      const oy = Math.max(0, Math.min(rect.height, origin.y - rect.top));
      const maxR =
        Math.ceil(Math.hypot(Math.max(ox, rect.width - ox), Math.max(oy, rect.height - oy))) + 20;

      panel.style.setProperty("--ox", `${ox}px`);
      panel.style.setProperty("--oy", `${oy}px`);
      panel.style.setProperty("--or", `${maxR}px`);
      panel.scrollTop = 0;
    }
  }, [open, origin]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    stop();
    closeButtonRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key === "Tab") {
        const panel = panelRef.current;
        if (!panel) return;

        const focusables = panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );

        if (focusables.length === 0) {
          event.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (!panel.contains(active)) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      start();
      if (previouslyFocused && previouslyFocused.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [open, start, stop]);

  return (
    <div
      data-open={open}
      inert={!open}
      aria-hidden={!open}
      className={cn(
        "group/aboutmodal fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/0 transition-colors duration-400 ease-out group-data-[open=true]/aboutmodal:bg-black/65 motion-reduce:transition-none"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sobre-modal-title"
        data-lenis-prevent
        className="relative w-full max-w-[36rem] max-h-[84svh] overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-card/95 p-6 text-foreground shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)] backdrop-blur-xl scale-[0.96] opacity-0 transition-[clip-path,transform,opacity] duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] [clip-path:circle(0px_at_var(--ox,50%)_var(--oy,50%))] group-data-[open=true]/aboutmodal:scale-100 group-data-[open=true]/aboutmodal:opacity-100 group-data-[open=true]/aboutmodal:[clip-path:circle(var(--or,750px)_at_var(--ox,50%)_var(--oy,50%))] motion-reduce:scale-100 motion-reduce:transition-opacity motion-reduce:[clip-path:none] sm:p-8"
      >
        <header className="translate-y-4 opacity-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[open=true]/aboutmodal:translate-y-0 group-data-[open=true]/aboutmodal:opacity-100 group-data-[open=true]/aboutmodal:delay-150 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none">
          <h2
            id="sobre-modal-title"
            className="pr-12 font-display text-[clamp(1.65rem,4vw,2.25rem)] font-bold leading-[1.08] tracking-[-0.03em] text-foreground"
          >
            {content.title}
          </h2>
          <p className="mt-2 font-sans text-sm font-medium text-brand-bright sm:text-base">
            {content.subtitle}
          </p>
        </header>

        <div className="mt-6 translate-y-4 space-y-4 font-sans text-[15px] leading-[1.7] text-muted-foreground opacity-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[open=true]/aboutmodal:translate-y-0 group-data-[open=true]/aboutmodal:opacity-100 group-data-[open=true]/aboutmodal:delay-200 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none sm:text-base">
          {content.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <button
          ref={closeButtonRef}
          type="button"
          aria-label={content.closeAriaLabel}
          onClick={onClose}
          className="absolute top-6 right-6 z-20 inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 transition-[background-color,rotate,color] duration-300 hover:rotate-90 hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:top-8 sm:right-8"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
