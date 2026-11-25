"use client";

import dynamic from "next/dynamic";
import {
  Fragment,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Globe, Lock } from "lucide-react";
import {
  InteractiveHoverLinks,
  type InteractiveHoverLinkItem,
} from "@/components/ui/interactive-hover-links";
import {
  PROJECT_STATUS_META,
  PROJECT_VISIBILITY_META,
  type ProjectItem,
  type ProjetosContent,
} from "@/data/projetos";
import { ProjectMedia } from "./project-media";

const ProjectDialog = dynamic(
  () => import("./project-dialog").then((mod) => mod.ProjectDialog),
  { ssr: false },
);

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STACK_STEP_PX = 14;

export interface ProjetosProps {
  content: ProjetosContent;
}

/**
 * Editorial Projects section (`#projetos`) with Sticky Card Stacking on desktop,
 * pointer spotlight accents, secondary archive list, and full Case Study dialog.
 */
export function Projetos({ content }: ProjetosProps) {
  const scope = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [hasOpenedDialog, setHasOpenedDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(
    null,
  );

  const featuredItems = content.items.filter((item) => item.featured);
  const archiveItems = content.items.filter((item) => !item.featured);
  const archiveLinkItems: InteractiveHoverLinkItem[] = archiveItems.map(
    (project, index) => ({
      id: project.slug,
      indexLabel: String(featuredItems.length + index + 1).padStart(2, "0"),
      heading: project.title,
      preview: <ProjectMedia media={project.cover} />,
      onClick: (triggerEl) => handleOpenProject(project, triggerEl),
      ariaHasPopup: "dialog",
      ariaExpanded: selectedProject?.slug === project.slug,
    }),
  );

  const handleOpenProject = (project: ProjectItem, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setHasOpenedDialog(true);
    setSelectedProject(project);
  };

  const handleCloseDialog = () => {
    const triggerToRestore = triggerRef.current;
    setSelectedProject(null);
    requestAnimationFrame(() => {
      triggerToRestore?.focus({ preventScroll: true });
      triggerRef.current = null;
    });
  };

  const handleCardPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    card.style.setProperty("--spot-opacity", "1");
  };

  const handleCardPointerLeave = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--spot-opacity", "0");
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".project-card", { clearProps: "all" });
        gsap.set(".project-card-inner", { clearProps: "transform" });
        gsap.set(".project-shade", { clearProps: "opacity" });
        gsap.set(".project-row", { clearProps: "opacity,transform" });
        gsap.set(
          [
            ".projects-meta-row",
            ".projects-separator",
            ".projects-title",
            ".projects-lead",
            ".projects-more-header",
            ".projects-list-separator",
          ],
          { clearProps: "all" },
        );
      });

      mm.add(
        "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
        () => {
          const getBaseTop = () =>
            Math.min(112, Math.max(88, window.innerHeight * 0.11));

          const cards = gsap.utils.toArray<HTMLElement>(
            ".project-card",
            scope.current,
          );

          for (let i = 0; i < cards.length - 1; i += 1) {
            const nextCard = cards[i + 1];
            const cardInner =
              cards[i].querySelector<HTMLElement>(".project-card-inner");
            const cardShade =
              cards[i].querySelector<HTMLElement>(".project-shade");

            const scrollTriggerConfig: ScrollTrigger.Vars = {
              trigger: nextCard,
              start: "top bottom",
              end: () => `top ${getBaseTop() + (i + 1) * STACK_STEP_PX}px`,
              scrub: true,
              invalidateOnRefresh: true,
            };

            if (cardInner) {
              gsap.to(cardInner, {
                scale: 0.92,
                ease: "none",
                scrollTrigger: scrollTriggerConfig,
              });
            }

            if (cardShade) {
              gsap.to(cardShade, {
                opacity: 0.65,
                ease: "none",
                scrollTrigger: scrollTriggerConfig,
              });
            }
          }
        },
      );

      mm.add(
        "(max-width: 899px) and (prefers-reduced-motion: no-preference)",
        () => {
          const cards = gsap.utils.toArray<HTMLElement>(
            ".project-card",
            scope.current,
          );

          for (const card of cards) {
            gsap.from(card, {
              y: 40,
              autoAlpha: 0,
              duration: 0.9,
              ease: "expo.out",
              scrollTrigger: {
                trigger: card,
                start: "top 86%",
                once: true,
              },
            });
          }
        },
      );

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".projects-meta-row", {
          y: 10,
          autoAlpha: 0,
          duration: 0.7,
          ease: "power2.out",
          clearProps: "opacity,visibility,transform",
          scrollTrigger: {
            trigger: ".projects-meta",
            start: "top 88%",
            once: true,
          },
        });

        gsap.from(".projects-separator", {
          autoAlpha: 0,
          duration: 0.85,
          ease: "power2.out",
          clearProps: "opacity,visibility",
          scrollTrigger: {
            trigger: ".projects-meta",
            start: "top 88%",
            once: true,
          },
        });

        gsap.from([".projects-title", ".projects-lead"], {
          y: 18,
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          clearProps: "opacity,visibility,transform",
          scrollTrigger: {
            trigger: ".projects-header",
            start: "top 86%",
            once: true,
          },
        });

        const rows = gsap.utils.toArray<HTMLElement>(
          ".project-row",
          scope.current,
        );

        if (rows.length > 0) {
          gsap.from(".projects-more-header", {
            y: 14,
            autoAlpha: 0,
            duration: 0.75,
            ease: "power2.out",
            clearProps: "opacity,visibility,transform",
            scrollTrigger: {
              trigger: ".projects-more",
              start: "top 88%",
              once: true,
            },
          });

          gsap.from(".projects-list-separator", {
            autoAlpha: 0,
            duration: 0.85,
            ease: "power2.out",
            clearProps: "opacity,visibility",
            scrollTrigger: {
              trigger: ".projects-more",
              start: "top 88%",
              once: true,
            },
          });

          gsap.from(rows, {
            y: 20,
            opacity: 0,
            duration: 0.75,
            stagger: 0.06,
            ease: "expo.out",
            clearProps: "transform",
            scrollTrigger: {
              trigger: ".projects-list",
              start: "top 88%",
              once: true,
            },
          });
        }
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
      id="projetos"
      aria-labelledby="projetos-title"
      className="relative w-full overflow-x-clip bg-background px-[clamp(20px,4vw,56px)] py-24 text-foreground md:py-32 lg:py-36"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="projects-meta mb-10">
          <div className="projects-meta-row flex items-center justify-between pb-4 font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            <span>{content.eyebrow}</span>
            <span className="tabular-nums">
              {content.items.length} {content.countSuffix}
            </span>
          </div>
          <div
            aria-hidden="true"
            className="projects-separator h-px w-full bg-border"
          />
        </div>

        <div className="projects-header grid grid-cols-1 items-end gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-12">
          <h2
            id="projetos-title"
            className="projects-title font-display text-[clamp(2.25rem,5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-foreground"
          >
            <span className="block">{content.titleLine1}</span>
            <span className="block">{content.titleLine2}</span>
          </h2>
          <p className="projects-lead max-w-[46ch] text-[clamp(0.95rem,1.15vw,1.1rem)] leading-[1.65] text-muted-foreground lg:justify-self-end">
            {content.lead}
          </p>
        </div>

        <div className="projects-stack relative mt-14 md:mt-20">
          {featuredItems.map((project, index) => (
            <Fragment key={project.slug}>
              <div
                style={
                  {
                    zIndex: index + 1,
                    "--stack-index": index,
                  } as CSSProperties
                }
                className="project-card relative min-[900px]:motion-safe:sticky min-[900px]:motion-safe:top-[calc(clamp(88px,11vh,112px)+var(--stack-index)*14px)]"
              >
                <article
                  onPointerMove={handleCardPointerMove}
                  onPointerLeave={handleCardPointerLeave}
                  onClick={(event) => {
                    const target = event.target as HTMLElement | null;
                    if (target?.closest("a, button")) return;
                    const trigger =
                      event.currentTarget.querySelector<HTMLButtonElement>(
                        "[data-case-trigger]",
                      ) ?? event.currentTarget;
                    handleOpenProject(project, trigger);
                  }}
                  style={
                    {
                      "--card-accent":
                        project.accentColor ?? "var(--brand-bright)",
                    } as CSSProperties
                  }
                  className="project-card-inner group/card relative flex cursor-pointer flex-col origin-top overflow-hidden rounded-[24px] border border-white/10 bg-card p-3 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] transition-colors duration-300 hover:border-white/20 will-change-transform md:p-5 min-[900px]:grid min-[900px]:h-auto min-[900px]:min-h-[400px] min-[900px]:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] min-[900px]:items-stretch"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-10 hidden rounded-[24px] opacity-[var(--spot-opacity,0)] transition-opacity duration-300 min-[900px]:block motion-reduce:hidden"
                    style={{
                      background:
                        "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--card-accent) 14%, transparent), transparent 65%)",
                    }}
                  />

                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-10 hidden rounded-[24px] p-px opacity-[var(--spot-opacity,0)] transition-opacity duration-300 min-[900px]:block motion-reduce:hidden"
                    style={{
                      background:
                        "radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--card-accent) 55%, transparent), transparent 65%)",
                      WebkitMask:
                        "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      WebkitMaskComposite: "xor",
                      mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      maskComposite: "exclude",
                    }}
                  />

                  <div className="relative aspect-[19/9] w-full self-center overflow-hidden rounded-[14px] border border-white/8 bg-[#0D0D0D]">
                    <div className="size-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.01] motion-reduce:transition-none">
                      <ProjectMedia
                        media={project.cover}
                        priority={index === 0}
                      />
                    </div>
                  </div>

                  <div className="relative z-10 flex flex-col justify-between gap-6 p-4 pt-6 min-[900px]:p-8 xl:p-10">
                    <div className="flex items-start justify-end">
                      <span
                        aria-hidden="true"
                        className="font-display text-3xl font-semibold leading-none text-white/18 tabular-nums"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display text-[clamp(1.6rem,2.6vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground">
                        {project.title}
                      </h3>
                      <p className="mt-2 text-sm font-medium text-muted-foreground">
                        {project.subtitle}
                      </p>
                      <p className="mt-4 max-w-[44ch] text-[0.95rem] leading-[1.65] text-muted-foreground">
                        {project.summary}
                      </p>
                      <ul
                        className="mt-6 flex flex-wrap gap-2"
                        aria-label={`Tecnologias de ${project.title}`}
                      >
                        {project.techs.map((tech) => (
                          <li
                            key={tech}
                            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium tracking-[0.02em] text-foreground/80"
                          >
                            {tech}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                      <button
                        type="button"
                        data-case-trigger
                        aria-haspopup="dialog"
                        aria-expanded={selectedProject?.slug === project.slug}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleOpenProject(project, event.currentTarget);
                        }}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-foreground transition-[filter] duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                      >
                        <span>{content.ctaCaseLabel}</span>
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </button>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-sans text-[11px] font-medium tracking-[0.02em] text-foreground/85">
                          <span
                            aria-hidden="true"
                            className={`size-1.5 rounded-full ${PROJECT_STATUS_META[project.status].dotClass}`}
                          />
                          <span>{PROJECT_STATUS_META[project.status].label}</span>
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-sans text-[11px] font-medium tracking-[0.02em] text-muted-foreground">
                          {project.visibility === "public" ? (
                            <Globe
                              className="size-3 text-brand-bright"
                              aria-hidden="true"
                            />
                          ) : (
                            <Lock
                              className="size-3 text-muted-foreground"
                              aria-hidden="true"
                            />
                          )}
                          <span>
                            {PROJECT_VISIBILITY_META[project.visibility].label}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    aria-hidden="true"
                    className="project-shade pointer-events-none absolute inset-0 z-20 rounded-[24px] bg-background opacity-0"
                  />
                </article>
              </div>

              {index < featuredItems.length - 1 ? (
                <div
                  aria-hidden="true"
                  className="h-8 min-[900px]:h-[36vh]"
                />
              ) : null}
            </Fragment>
          ))}

          {featuredItems.length > 0 ? (
            <div
              aria-hidden="true"
              className="hidden min-[900px]:block min-[900px]:h-[16vh]"
            />
          ) : null}
        </div>

        {archiveItems.length > 0 ? (
          <div className="projects-more mt-20 md:mt-28">
            <div className="projects-more-header flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <h3 className="font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-semibold tracking-[-0.02em] text-foreground">
                {content.moreTitle}
              </h3>
              <p className="text-sm text-muted-foreground">
                {content.moreSubtitle}
              </p>
            </div>

            <div
              aria-hidden="true"
              className="projects-list-separator mt-6 h-px w-full bg-border"
            />
            <InteractiveHoverLinks
              className="projects-list"
              rowClassName="project-row"
              items={archiveLinkItems}
            />
          </div>
        ) : null}
      </div>

      {hasOpenedDialog ? (
        <ProjectDialog
          project={selectedProject}
          open={Boolean(selectedProject)}
          onClose={handleCloseDialog}
          closeAriaLabel={content.closeDialogAriaLabel}
          ctaLiveLabel={content.ctaLiveLabel}
          ctaRepoLabel={content.ctaRepoLabel}
        />
      ) : null}
    </section>
  );
}
