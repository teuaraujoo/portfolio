"use client";

import type { PointerEvent, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InteractiveHoverLinkItem {
  id: string;
  heading: string;
  subheading?: string;
  indexLabel?: string;
  category?: string;
  year?: string;
  imgSrc?: string;
  imgAlt?: string;
  preview?: ReactNode;
  href?: string;
  onClick?: (triggerEl: HTMLElement) => void;
  ariaHasPopup?: "dialog" | "menu" | "listbox" | "tree" | "grid" | boolean;
  ariaExpanded?: boolean;
}

export interface InteractiveHoverLinksProps {
  items: InteractiveHoverLinkItem[];
  className?: string;
  rowClassName?: string;
}

interface HeadingToken {
  text: string;
  startIndex: number;
  isSpace: boolean;
}

function tokenizeHeading(heading: string): HeadingToken[] {
  const tokens: HeadingToken[] = [];
  let cursor = 0;

  for (const segment of heading.split(/(\s)/)) {
    if (!segment) continue;
    tokens.push({
      text: segment,
      startIndex: cursor,
      isSpace: /^\s$/.test(segment),
    });
    cursor += Array.from(segment).length;
  }

  return tokens;
}

/**
 * Interactive editorial link list with per-character hover stagger and a
 * pointer-tracked tilted floating preview card.
 */
export function InteractiveHoverLinks({
  items,
  className,
  rowClassName,
}: InteractiveHoverLinksProps) {
  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const row = event.currentTarget;
    const rect = row.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const xPct = (event.clientX - rect.left) / rect.width - 0.5;
    const yPct = (event.clientY - rect.top) / rect.height - 0.5;

    row.style.setProperty("--hover-x", xPct.toFixed(4));
    row.style.setProperty("--hover-y", yPct.toFixed(4));
  };

  const handlePointerLeave = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--hover-x", "0");
    event.currentTarget.style.setProperty("--hover-y", "0");
  };

  return (
    <div className={cn("w-full", className)}>
      {items.map((item) => {
        const tokens = tokenizeHeading(item.heading);
        const hasPreview = Boolean(item.preview || item.imgSrc);

        const isInteractive = Boolean(item.onClick || item.href);

        const sharedClassName = cn(
          "group/row relative z-0 flex w-full items-center justify-between gap-4 border-b border-border py-5 text-left transition-colors duration-500 hover:z-20 hover:border-white/30 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset md:py-7",
          isInteractive && "cursor-pointer",
          rowClassName,
        );

        const rowBody = (
          <>
            <div className="relative z-10 flex min-w-0 items-baseline gap-4 sm:gap-6">
              {item.indexLabel ? (
                <span className="shrink-0 tabular-nums text-xs text-muted-foreground">
                  {item.indexLabel}
                </span>
              ) : null}

              <div className="min-w-0">
                <span className="block font-display text-2xl font-semibold tracking-[-0.03em] text-muted-foreground transition-colors duration-500 group-hover/row:text-foreground group-focus-visible/row:text-foreground sm:text-3xl lg:text-4xl">
                  <span className="sr-only">{item.heading}</span>
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:group-hover/row:-translate-x-2 motion-safe:group-focus-visible/row:-translate-x-2 motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    {tokens.map((token, tokenIdx) =>
                      token.isSpace ? (
                        <span
                          key={`${item.id}-sp-${tokenIdx}`}
                          className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:group-hover/row:translate-x-2 motion-safe:group-focus-visible/row:translate-x-2 motion-reduce:transform-none motion-reduce:transition-none"
                          style={{
                            transitionDelay: `${Math.min(token.startIndex * 22, 320)}ms`,
                          }}
                        >
                          {"\u00A0"}
                        </span>
                      ) : (
                        <span
                          key={`${item.id}-wd-${tokenIdx}`}
                          className="inline-block whitespace-nowrap"
                        >
                          {Array.from(token.text).map((ch, charOffset) => {
                            const charIdx = token.startIndex + charOffset;
                            return (
                              <span
                                key={`${item.id}-ch-${charIdx}`}
                                className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:group-hover/row:translate-x-2 motion-safe:group-focus-visible/row:translate-x-2 motion-reduce:transform-none motion-reduce:transition-none"
                                style={{
                                  transitionDelay: `${Math.min(charIdx * 22, 320)}ms`,
                                }}
                              >
                                {ch === " " ? "\u00A0" : ch}
                              </span>
                            );
                          })}
                        </span>
                      ),
                    )}
                  </span>
                </span>

                {item.subheading ? (
                  <p className="mt-1.5 line-clamp-2 max-w-[54ch] text-sm text-muted-foreground transition-colors duration-300 group-hover/row:text-foreground/80 group-focus-visible/row:text-foreground/80">
                    {item.subheading}
                  </p>
                ) : null}
              </div>
            </div>

            {hasPreview ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute z-0 hidden aspect-[19/9] w-64 overflow-hidden rounded-[16px] border border-white/15 bg-card opacity-0 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.85),0_0_0_1px_rgba(121,60,255,0.2)] transition-[transform,opacity,top,left] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [transform:translate(-50%,-50%)_scale(0)_rotate(-12.5deg)] group-hover/row:opacity-100 group-hover/row:[transform:translate(-50%,-50%)_scale(1)_rotate(10deg)] group-focus-visible/row:opacity-100 group-focus-visible/row:[transform:translate(-50%,-50%)_scale(1)_rotate(10deg)] md:block lg:w-80 motion-reduce:hidden"
                style={{
                  left: "calc(58% + var(--hover-x, 0) * -12%)",
                  top: "calc(50% + var(--hover-y, 0) * -28%)",
                }}
              >
                {item.preview ??
                  (item.imgSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imgSrc}
                      alt={item.imgAlt ?? item.heading}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null)}
              </div>
            ) : null}

            <div className="relative z-10 flex shrink-0 items-center gap-4">
              {item.category ? (
                <span className="hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-muted-foreground transition-colors duration-300 group-hover/row:border-white/20 group-hover/row:text-foreground group-focus-visible/row:border-white/20 group-focus-visible/row:text-foreground sm:inline-flex">
                  {item.category}
                </span>
              ) : null}

              {item.year ? (
                <span className="tabular-nums text-xs text-muted-foreground transition-colors duration-300 group-hover/row:text-foreground/80 group-focus-visible/row:text-foreground/80">
                  {item.year}
                </span>
              ) : null}

              <span className="inline-flex size-8 items-center justify-center overflow-hidden text-muted-foreground transition-colors duration-300 group-hover/row:text-brand-bright group-focus-visible/row:text-brand-bright">
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-5 opacity-70 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:-translate-x-2 md:opacity-0 md:group-hover/row:translate-x-0 md:group-hover/row:opacity-100 md:group-focus-visible/row:translate-x-0 md:group-focus-visible/row:opacity-100 motion-reduce:translate-x-0 motion-reduce:transition-none"
                />
              </span>
            </div>
          </>
        );

        if (item.onClick) {
          return (
            <button
              key={item.id}
              type="button"
              onClick={(event) => item.onClick?.(event.currentTarget)}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              aria-haspopup={item.ariaHasPopup}
              aria-expanded={item.ariaExpanded}
              className={sharedClassName}
            >
              {rowBody}
            </button>
          );
        }

        if (item.href) {
          return (
            <a
              key={item.id}
              href={item.href}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              aria-haspopup={item.ariaHasPopup}
              aria-expanded={item.ariaExpanded}
              className={sharedClassName}
            >
              {rowBody}
            </a>
          );
        }

        return (
          <div
            key={item.id}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            className={sharedClassName}
          >
            {rowBody}
          </div>
        );
      })}
    </div>
  );
}
