"use client";

import { Timeline } from "@/components/ui/timeline";
import type {
  JornadaCategoryMeta,
  JornadaContent,
  JornadaStop,
} from "@/data/jornada";
import { cn } from "@/lib/utils";

export interface JornadaProps {
  content: JornadaContent;
}

function JornadaStopMeta({
  category,
  year,
  monthLabel,
}: {
  category: JornadaCategoryMeta;
  year: string;
  monthLabel: string;
}) {
  return (
    <>
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: category.accentColor }}
        />
        <span>{category.label}</span>
      </span>
      <span className="tabular-nums">
        {year} · {monthLabel}
      </span>
    </>
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
  const hasMedia = stop.media.type !== "none";

  return (
    <article
      className={cn(
        "group/stop-photo",
        isDesktop ? "flex items-center gap-4 lg:gap-5" : "flex flex-col",
      )}
    >
      {stop.media.type === "image" ? (
        <figure
          className={cn(
            isDesktop
              ? "w-[clamp(210px,29svh,315px)] shrink-0"
              : "w-full max-w-[460px]",
          )}
        >
          <div className="journey-stop-media relative aspect-square w-full overflow-hidden rounded-[12px] border border-white/10 bg-card transition-colors duration-300 group-hover/stop-photo:border-brand-bright/50 motion-reduce:transition-none">
            <div className="journey-stop-media-inner size-full">
              <div className="size-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/stop-photo:scale-[1.03] motion-reduce:transition-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
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
              </div>
            </div>
          </div>

          <figcaption className="mt-2 flex items-center justify-between gap-2 font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground sm:text-[11px]">
            <JornadaStopMeta
              category={category}
              year={stop.year}
              monthLabel={stop.monthLabel}
            />
          </figcaption>
        </figure>
      ) : null}

      {stop.media.type === "gallery" ? (
        <figure
          className={cn(
            isDesktop
              ? "w-[clamp(300px,42svh,440px)] shrink-0"
              : "w-full max-w-[580px]",
          )}
        >
          <div className="journey-stop-media relative w-full overflow-hidden rounded-[12px] border border-white/10 bg-card p-1.5 transition-colors duration-300 group-hover/stop-photo:border-brand-bright/50 motion-reduce:transition-none">
            <div className="journey-stop-media-inner grid grid-cols-2 gap-2">
              {stop.media.images.map((image) => (
                <div
                  key={image.src}
                  className="aspect-[4/5] overflow-hidden rounded-[8px]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.src}
                    alt={image.alt}
                    width={640}
                    height={800}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="size-full object-cover object-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/stop-photo:scale-[1.03] motion-reduce:transition-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <figcaption className="mt-2 flex items-center justify-between gap-2 font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground sm:text-[11px]">
            <JornadaStopMeta
              category={category}
              year={stop.year}
              monthLabel={stop.monthLabel}
            />
          </figcaption>
        </figure>
      ) : null}

      <div
        className={cn(
          "journey-stop-copy",
          hasMedia
            ? isDesktop
              ? "min-w-0 flex-1"
              : "mt-3"
            : isDesktop
              ? "min-w-0 max-w-[36ch]"
              : "py-1",
        )}
      >
        {!hasMedia ? (
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground sm:text-[11px]">
            <JornadaStopMeta
              category={category}
              year={stop.year}
              monthLabel={stop.monthLabel}
            />
          </div>
        ) : null}

        <h3
          className={cn(
            "font-display font-semibold leading-snug text-foreground",
            isDesktop ? "text-sm lg:text-base" : "text-base",
          )}
        >
          {stop.title}
        </h3>
        <p className="mt-1 text-xs font-medium text-brand-bright">
          {stop.organization}
        </p>
        <p
          className={cn(
            "text-muted-foreground",
            isDesktop
              ? "mt-1.5 text-xs leading-relaxed"
              : "mt-1.5 text-sm leading-relaxed",
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
 * editorial timeline on mobile/reduced-motion, supporting single-photo,
 * dual-photo gallery, and photo-less timeline-point stops.
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
      isWideStop={(stop) => stop.media.type === "gallery"}
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
