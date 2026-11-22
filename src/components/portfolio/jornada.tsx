"use client";

import type { LucideIcon } from "lucide-react";
import { Award, Building2, GraduationCap, Terminal } from "lucide-react";
import { Timeline } from "@/components/ui/timeline";
import type {
  JornadaCategory,
  JornadaCategoryMeta,
  JornadaContent,
  JornadaStop,
} from "@/data/jornada";
import { cn } from "@/lib/utils";

export interface JornadaProps {
  content: JornadaContent;
}

const CATEGORY_ICONS: Record<JornadaCategory, LucideIcon> = {
  tech: Terminal,
  curso: GraduationCap,
  programa: Award,
  empresa: Building2,
};

function JornadaStopMediaPlaceholder({
  scene,
  caption,
  accentColor,
}: {
  scene: JornadaCategory;
  caption: string;
  accentColor: string;
}) {
  const Icon = CATEGORY_ICONS[scene];

  return (
    <div
      aria-label={caption}
      className="relative flex size-full flex-col justify-between overflow-hidden bg-[#111016] p-3"
    >
      {/* Subtle architectural grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Ambient radial studio glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 28% 24%, rgba(121,60,255,0.28), transparent 56%), radial-gradient(circle at 78% 82%, rgba(72,17,237,0.34), transparent 62%)",
        }}
      />

      {/* Fine corner framing reticles */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-2.5 left-2.5 size-2.5 border-t border-l border-white/25"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-2.5 right-2.5 size-2.5 border-t border-r border-white/25"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-2.5 left-2.5 size-2.5 border-b border-l border-white/25"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 bottom-2.5 size-2.5 border-r border-b border-white/25"
      />

      {/* Center studio emblem */}
      <div className="relative z-10 flex flex-1 items-center justify-center">
        <div className="flex size-11 items-center justify-center rounded-xl border border-white/15 bg-[#141318]/85 shadow-[0_0_24px_rgba(121,60,255,0.22)] backdrop-blur-sm">
          <Icon
            className="size-5 text-brand-bright"
            strokeWidth={1.6}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Bottom studio caption */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-t border-white/10 pt-2">
        <span className="truncate font-sans text-[9px] font-medium uppercase tracking-[0.12em] text-white/65">
          {caption}
        </span>
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
      </div>
    </div>
  );
}

function JornadaStopCard({
  stop,
  category,
  layout,
}: {
  stop: JornadaStop;
  category: JornadaCategoryMeta;
  layout: "desktop" | "mobile";
}) {
  const isDesktop = layout === "desktop";

  return (
    <article
      className={cn(
        "group/stop-photo",
        isDesktop ? "flex items-center gap-4 lg:gap-5" : "flex flex-col",
      )}
    >
      <figure
        className={cn(
          isDesktop
            ? "w-[clamp(164px,23svh,268px)] shrink-0"
            : "w-full max-w-[380px]",
        )}
      >
        <div className="journey-stop-media relative aspect-square w-full overflow-hidden rounded-[12px] border border-white/10 bg-card transition-colors duration-300 group-hover/stop-photo:border-brand-bright/50 motion-reduce:transition-none">
          <div className="journey-stop-media-inner size-full">
            <div className="size-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/stop-photo:scale-[1.03] motion-reduce:transition-none">
              {stop.media.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={stop.media.src}
                  alt={stop.media.alt}
                  width={800}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="size-full object-cover object-center"
                />
              ) : (
                <JornadaStopMediaPlaceholder
                  scene={stop.media.scene}
                  caption={stop.media.caption}
                  accentColor={category.accentColor}
                />
              )}
            </div>
          </div>
        </div>

        <figcaption className="mt-2 flex items-center justify-between gap-2 font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground sm:text-[11px]">
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: category.accentColor }}
            />
            <span>{category.label}</span>
          </span>
          <span className="tabular-nums">
            {stop.year} · {stop.monthLabel}
          </span>
        </figcaption>
      </figure>

      <div
        className={cn(
          "journey-stop-copy",
          isDesktop ? "min-w-0 flex-1" : "mt-3",
        )}
      >
        <h3
          className={cn(
            "font-display font-semibold leading-snug text-foreground",
            isDesktop ? "line-clamp-2 text-sm lg:text-base" : "text-base",
          )}
        >
          {stop.title}
        </h3>
        <p
          className={cn(
            "font-medium text-brand-bright",
            isDesktop ? "mt-1 truncate text-xs" : "mt-1 text-xs",
          )}
        >
          {stop.organization}
        </p>
        <p
          className={cn(
            "text-muted-foreground",
            isDesktop
              ? "mt-1.5 line-clamp-3 text-xs leading-relaxed"
              : "mt-1.5 line-clamp-none text-sm leading-relaxed",
          )}
        >
          {stop.description}
        </p>
      </div>
    </article>
  );
}

/**
 * Section 4 ("Jornada"): horizontal sticky timeline on desktop and vertical
 * editorial timeline on mobile/reduced-motion, featuring square 1:1 portraits.
 */
export function Jornada({ content }: JornadaProps) {
  const categories = Object.values(content.categories);

  const legendBar = (
    <ul
      aria-label="Categorias da jornada"
      className="flex flex-wrap items-center gap-1.5"
    >
      {categories.map((category) => (
        <li
          key={category.id}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-card/70 px-2.5 py-0.5 font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground"
        >
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full"
            style={{ backgroundColor: category.accentColor }}
          />
          <span>{category.label}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <Timeline
      id="jornada"
      eyebrow={content.eyebrow}
      titleLine1={content.titleLine1}
      titleLine2={content.titleLine2}
      periodLabel={content.periodLabel}
      intro={content.intro}
      scrollCue={content.scrollCue}
      headerExtra={legendBar}
      items={content.stops}
      renderStop={(stop, _index, layout) => (
        <JornadaStopCard
          stop={stop}
          category={content.categories[stop.category]}
          layout={layout}
        />
      )}
    />
  );
}
