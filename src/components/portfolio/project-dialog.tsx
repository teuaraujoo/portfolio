"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Maximize2, X } from "lucide-react";
import { PROJECT_STATUS_META, type ProjectItem } from "@/data/projetos";
import { cn } from "@/lib/utils";
import { ProjectMedia } from "./project-media";
import { useSmoothScroll } from "./smooth-scroll";

export interface ProjectDialogProps {
  project: ProjectItem | null;
  open: boolean;
  onClose: () => void;
  closeAriaLabel?: string;
  ctaLiveLabel?: string;
  ctaRepoLabel?: string;
}

const EXIT_DURATION_MS = 420;

/**
 * Case Study modal dialog displaying the project's navigable media gallery,
 * overview narrative, optional deep-dive blocks (O desafio, A solução, highlights),
 * technology stack, and external links.
 */
export function ProjectDialog({
  project,
  open,
  onClose,
  closeAriaLabel = "Fechar modal do projeto",
  ctaLiveLabel = "Acessar projeto",
  ctaRepoLabel = "Ver código no GitHub",
}: ProjectDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const fullscreenCloseRef = useRef<HTMLButtonElement>(null);
  const fullscreenTriggerRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const isFullscreenRef = useRef(false);
  const wasFullscreenRef = useRef(false);
  const { stop, start } = useSmoothScroll();

  const [cachedProject, setCachedProject] = useState<ProjectItem | null>(project);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (project && project !== cachedProject) {
    setCachedProject(project);
    setSlideIndex(0);
    setIsFullscreen(false);
  }

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    isFullscreenRef.current = isFullscreen;
    if (isFullscreen) {
      wasFullscreenRef.current = true;
      fullscreenCloseRef.current?.focus({ preventScroll: true });
      return;
    }

    if (wasFullscreenRef.current) {
      wasFullscreenRef.current = false;
      if (open) {
        fullscreenTriggerRef.current?.focus({ preventScroll: true });
      }
    }
  }, [isFullscreen, open]);

  useEffect(() => {
    if (open && project) {
      const raf = window.requestAnimationFrame(() => {
        setIsActive(true);
      });
      return () => window.cancelAnimationFrame(raf);
    }

    const raf = window.requestAnimationFrame(() => {
      setIsActive(false);
      setIsFullscreen(false);
    });

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = window.setTimeout(
      () => {
        setCachedProject(null);
      },
      reducedMotion ? 0 : EXIT_DURATION_MS,
    );

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
  }, [open, project]);

  const gallery = cachedProject
    ? cachedProject.details.gallery.length > 0
      ? cachedProject.details.gallery
      : [cachedProject.cover]
    : [];
  const totalSlides = gallery.length;
  const safeIndex = totalSlides > 0 ? Math.min(slideIndex, totalSlides - 1) : 0;

  useEffect(() => {
    if (!open || !cachedProject) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    stop();

    if (panelRef.current) {
      panelRef.current.scrollTop = 0;
    }

    closeButtonRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (isFullscreenRef.current) {
          setIsFullscreen(false);
          return;
        }
        onCloseRef.current();
        return;
      }

      if (
        totalSlides >= 2 &&
        (event.key === "ArrowLeft" || event.key === "ArrowRight") &&
        !(event.target instanceof HTMLVideoElement)
      ) {
        event.preventDefault();
        setSlideIndex((current) =>
          event.key === "ArrowLeft"
            ? (current - 1 + totalSlides) % totalSlides
            : (current + 1) % totalSlides,
        );
        return;
      }

      if (event.key === "Tab") {
        const container = isFullscreenRef.current
          ? fullscreenRef.current
          : panelRef.current;
        if (!container) return;

        const focusables = container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );

        if (focusables.length === 0) {
          event.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (!container.contains(active)) {
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
      document.body.style.overflow = previousBodyOverflow;
      start();

      if (previouslyFocused && previouslyFocused.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [open, cachedProject, totalSlides, start, stop]);

  if (!cachedProject) {
    return null;
  }

  const currentMedia = gallery[safeIndex] ?? cachedProject.cover;
  const accentColor = cachedProject.accentColor ?? "#793CFF";
  const statusMeta = PROJECT_STATUS_META[cachedProject.status];
  const showLiveLink = Boolean(cachedProject.liveUrl);
  const showRepoLink =
    cachedProject.visibility === "public" && Boolean(cachedProject.repoUrl);

  const handlePrevSlide = () => {
    if (totalSlides < 2) return;
    setSlideIndex((current) => (current - 1 + totalSlides) % totalSlides);
  };

  const handleNextSlide = () => {
    if (totalSlides < 2) return;
    setSlideIndex((current) => (current + 1) % totalSlides);
  };

  return (
    <div
      data-open={isActive && open}
      inert={!open}
      aria-hidden={!open}
      data-lenis-prevent
      className={cn(
        "group/projectmodal fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 md:p-8",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        data-lenis-prevent
        onClick={onClose}
        className="absolute inset-0 bg-black/0 backdrop-blur-none transition-[background-color,backdrop-filter] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[open=true]/projectmodal:bg-black/75 group-data-[open=true]/projectmodal:backdrop-blur-xl motion-reduce:transition-none"
      />

      {/* Scrollable dialog panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-dialog-title"
        aria-describedby="project-dialog-subtitle"
        data-lenis-prevent
        className="relative z-10 max-h-[90svh] w-full max-w-5xl translate-y-4 scale-[0.98] overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-card/95 text-foreground opacity-0 shadow-[0_32px_90px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-[transform,opacity] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[open=true]/projectmodal:translate-y-0 group-data-[open=true]/projectmodal:scale-100 group-data-[open=true]/projectmodal:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:transition-none"
      >
        {/* Subtle project accent hairline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-80"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
          }}
        />

        <div className="p-5 sm:p-8 lg:p-10">
          {/* Top meta bar */}
          <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex flex-wrap items-center gap-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.12em]">
              <span className="text-brand-bright">{cachedProject.category}</span>
              <span aria-hidden="true" className="text-white/25">
                ·
              </span>
              <span className="text-muted-foreground tabular-nums">{cachedProject.year}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-medium tracking-[0.08em] text-foreground/80">
                <span
                  aria-hidden="true"
                  className={cn("size-1.5 rounded-full", statusMeta.dotClass)}
                />
                <span>{statusMeta.label}</span>
              </span>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              aria-label={closeAriaLabel}
              onClick={onClose}
              className="relative z-20 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/80 transition-[background-color,rotate,color,border-color] duration-300 hover:rotate-90 hover:border-white/25 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          {/* Monumental header */}
          <header className="mt-6">
            <h2
              id="project-dialog-title"
              className="font-display text-[clamp(1.75rem,4vw,3.15rem)] font-semibold leading-[1.06] tracking-[-0.035em] text-foreground"
            >
              {cachedProject.title}
            </h2>
            <p
              id="project-dialog-subtitle"
              className="mt-2.5 max-w-[64ch] font-sans text-sm leading-[1.6] font-medium text-muted-foreground sm:text-base"
            >
              {cachedProject.subtitle}
            </p>
          </header>

          {/* Gallery viewer */}
          <div className="mt-7">
            <div className="relative aspect-[19/9] w-full overflow-hidden rounded-xl border border-white/10 bg-[#0D0D0D]">
              {currentMedia.type === "image" ? (
                <button
                  type="button"
                  aria-label="Ampliar imagem em tela cheia"
                  onClick={() => setIsFullscreen(true)}
                  className="block size-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                  <ProjectMedia
                    key={`${cachedProject.slug}-${safeIndex}`}
                    media={currentMedia}
                    priority
                    interactive
                  />
                </button>
              ) : (
                <ProjectMedia
                  key={`${cachedProject.slug}-${safeIndex}`}
                  media={currentMedia}
                  priority
                  interactive
                />
              )}

              {currentMedia.type === "image" ? (
                <button
                  ref={fullscreenTriggerRef}
                  type="button"
                  aria-label="Ver imagem em tela cheia"
                  onClick={() => setIsFullscreen(true)}
                  className="absolute top-3 right-3 z-20 inline-flex min-h-[36px] min-w-[36px] cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[#0D0D0D]/80 text-white/90 backdrop-blur-md transition-[background-color,border-color,color] duration-200 hover:border-brand-bright/70 hover:bg-[#141318] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:top-4 sm:right-4"
                >
                  <Maximize2 className="size-4" aria-hidden="true" />
                </button>
              ) : null}

              {totalSlides >= 2 ? (
                <>
                  <button
                    type="button"
                    aria-label="Slide anterior"
                    onClick={handlePrevSlide}
                    className="absolute top-1/2 left-3 z-20 inline-flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[#0D0D0D]/80 text-white/90 backdrop-blur-md transition-[background-color,border-color,transform] duration-200 hover:border-brand-bright/70 hover:bg-[#141318] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:left-4"
                  >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    aria-label="Próximo slide"
                    onClick={handleNextSlide}
                    className="absolute top-1/2 right-3 z-20 inline-flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[#0D0D0D]/80 text-white/90 backdrop-blur-md transition-[background-color,border-color,transform] duration-200 hover:border-brand-bright/70 hover:bg-[#141318] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:right-4"
                  >
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                </>
              ) : null}
            </div>

            {totalSlides >= 2 ? (
              <div className="mt-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5" role="tablist" aria-label="Slides do projeto">
                  {gallery.map((_, idx) => {
                    const isCurrent = idx === safeIndex;
                    return (
                      <button
                        key={idx}
                        type="button"
                        role="tab"
                        aria-selected={isCurrent}
                        aria-label={`Ir para slide ${idx + 1} de ${totalSlides}`}
                        onClick={() => setSlideIndex(idx)}
                        className={cn(
                          "h-2 cursor-pointer rounded-full transition-[width,background-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isCurrent
                            ? "w-7 bg-brand-bright"
                            : "w-2 bg-white/20 hover:bg-white/40",
                        )}
                      />
                    );
                  })}
                </div>

                <span className="font-sans text-xs font-medium tracking-[0.08em] text-muted-foreground tabular-nums">
                  {safeIndex + 1} / {totalSlides}
                </span>
              </div>
            ) : null}
          </div>

          {/* Two-column Case Study body */}
          <div className="mt-9 grid grid-cols-1 gap-8 border-t border-border pt-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)] lg:gap-12">
            {/* Main narrative column: 3 mandatory sections + Destaques */}
            <div className="space-y-8">
              <section aria-labelledby="case-overview-heading">
                <h3
                  id="case-overview-heading"
                  className="font-display text-lg font-semibold tracking-[-0.02em] text-foreground sm:text-xl"
                >
                  Descrição geral
                </h3>
                <p className="mt-2.5 max-w-[65ch] whitespace-pre-line font-sans text-[15px] leading-[1.7] text-muted-foreground sm:text-base">
                  {cachedProject.details.overview}
                </p>
              </section>

              {cachedProject.details.challenge ? (
                <section aria-labelledby="case-challenge-heading">
                  <h3
                    id="case-challenge-heading"
                    className="font-display text-lg font-semibold tracking-[-0.02em] text-foreground sm:text-xl"
                  >
                    O desafio
                  </h3>
                  <p className="mt-2.5 max-w-[65ch] whitespace-pre-line font-sans text-[15px] leading-[1.7] text-muted-foreground sm:text-base">
                    {cachedProject.details.challenge}
                  </p>
                </section>
              ) : null}

              {cachedProject.details.solution ? (
                <section aria-labelledby="case-solution-heading">
                  <h3
                    id="case-solution-heading"
                    className="font-display text-lg font-semibold tracking-[-0.02em] text-foreground sm:text-xl"
                  >
                    A solução
                  </h3>
                  <p className="mt-2.5 max-w-[65ch] whitespace-pre-line font-sans text-[15px] leading-[1.7] text-muted-foreground sm:text-base">
                    {cachedProject.details.solution}
                  </p>
                </section>
              ) : null}

              {cachedProject.details.highlights &&
              cachedProject.details.highlights.length > 0 ? (
                <section aria-labelledby="case-highlights-heading">
                  <h3
                    id="case-highlights-heading"
                    className="font-display text-lg font-semibold tracking-[-0.02em] text-foreground sm:text-xl"
                  >
                    Destaques
                  </h3>
                  <ul className="mt-3 space-y-2.5">
                    {cachedProject.details.highlights.map((highlight, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 font-sans text-[15px] leading-[1.6] text-muted-foreground"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-bright"
                        />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>

            {/* Sidebar: Tech stack & external links */}
            <aside className="space-y-7 lg:border-l lg:border-border lg:pl-8">
              <div>
                <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Tecnologias
                </h3>
                <ul className="mt-3.5 flex flex-wrap gap-2">
                  {cachedProject.techs.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-sans text-xs font-medium tracking-[0.02em] text-foreground/85"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>

              {showLiveLink || showRepoLink ? (
                <div className="space-y-3 border-t border-border pt-6">
                  <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Links
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {showLiveLink ? (
                      <a
                        href={cachedProject.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] w-full items-center justify-between gap-2 rounded-full bg-brand px-5 py-2.5 font-sans text-sm font-semibold text-foreground transition-[filter,transform] duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span>{ctaLiveLabel}</span>
                        <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                      </a>
                    ) : null}

                    {showRepoLink ? (
                      <a
                        href={cachedProject.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] w-full items-center justify-between gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 py-2.5 font-sans text-sm font-medium text-foreground transition-[border-color,background-color] duration-200 hover:border-white/30 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span>{ctaRepoLabel}</span>
                        <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </div>

      {open && isFullscreen && currentMedia.type === "image" ? (
        <div
          ref={fullscreenRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Visualização em tela cheia — ${cachedProject.title}`}
          data-lenis-prevent
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsFullscreen(false);
            }
          }}
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md sm:p-8"
        >
          <button
            ref={fullscreenCloseRef}
            type="button"
            aria-label="Fechar visualização em tela cheia"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-20 inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[#0D0D0D]/85 text-white/90 backdrop-blur-md transition-[background-color,border-color,color,rotate] duration-200 hover:rotate-90 hover:border-white/30 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:top-6 sm:right-6"
          >
            <X className="size-5" aria-hidden="true" />
          </button>

          {totalSlides >= 2 ? (
            <>
              <button
                type="button"
                aria-label="Slide anterior"
                onClick={handlePrevSlide}
                className="absolute top-1/2 left-3 z-20 inline-flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[#0D0D0D]/85 text-white/90 backdrop-blur-md transition-[background-color,border-color] duration-200 hover:border-brand-bright/70 hover:bg-[#141318] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:left-6"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                aria-label="Próximo slide"
                onClick={handleNextSlide}
                className="absolute top-1/2 right-3 z-20 inline-flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[#0D0D0D]/85 text-white/90 backdrop-blur-md transition-[background-color,border-color] duration-200 hover:border-brand-bright/70 hover:bg-[#141318] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:right-6"
              >
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </>
          ) : null}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentMedia.src}
            alt={currentMedia.alt}
            className="max-h-[92svh] max-w-[96vw] rounded-lg object-contain select-none"
          />

          {totalSlides >= 2 ? (
            <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-[#0D0D0D]/80 px-3 py-1 font-sans text-xs font-medium tracking-[0.08em] text-white/80 tabular-nums backdrop-blur-md sm:bottom-6">
              {safeIndex + 1} / {totalSlides}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
