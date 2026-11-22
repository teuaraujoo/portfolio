"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { StackSpread } from "@/components/ui/stack-spread";
import type { SkillsContent } from "@/data/skills";
import { cn } from "@/lib/utils";
import { SkillIcon } from "./skill-icons";

export interface SkillsProps {
  content: SkillsContent;
}

/**
 * Seção 5 (`#skills`): palco orbital interativo no desktop (`Linear -> Orbit`)
 * com atualização dinâmica de contexto via hover/focus e fallback estático
 * em grid para mobile ou `prefers-reduced-motion: reduce`.
 */
export function Skills({ content }: SkillsProps) {
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);

  const activeSkill =
    content.items.find((item) => item.id === activeSkillId) ?? null;

  const metaRight = `${content.centerEyebrowDefault} · ${String(
    content.items.length,
  ).padStart(2, "0")} ${content.countSuffix}`;

  const centerSlot = (
    <div className="mx-auto flex max-w-full flex-col items-center px-2 text-center">
      <p
        aria-live="polite"
        className={cn(
          "mb-2 max-w-[30ch] font-sans text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-200 sm:max-w-[34ch]",
          activeSkill ? "text-brand-bright" : "text-muted-foreground",
        )}
      >
        {activeSkill ? activeSkill.category : content.centerEyebrowDefault}
      </p>

      <h2
        id="skills-title"
        className="font-display text-[clamp(1.75rem,3.1vw,3.35rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-foreground"
      >
        <span className="inline-block whitespace-nowrap">
          {content.titleLine1}
          {content.titleConnector ? (
            <>
              {" "}
              <span className="font-normal opacity-50">
                {content.titleConnector}
              </span>
            </>
          ) : null}
        </span>
        <br />
        <span className="inline-block whitespace-nowrap">
          {content.titleLine2}
        </span>
      </h2>

      <p className="mt-3 max-w-[30ch] font-sans text-sm leading-relaxed text-muted-foreground sm:max-w-[34ch] md:text-[15px]">
        {content.defaultDescription}
      </p>
    </div>
  );

  const mobileHeader = (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {content.eyebrow}
        </p>
        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground tabular-nums">
          {metaRight}
        </p>
      </div>

      <h2 className="font-display text-[clamp(1.65rem,6.5vw,2.75rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-foreground">
        <span className="inline-block whitespace-nowrap">
          {content.titleLine1}
          {content.titleConnector ? (
            <>
              {" "}
              <span className="font-normal opacity-50">
                {content.titleConnector}
              </span>
            </>
          ) : null}
        </span>
        <br />
        <span className="inline-block whitespace-nowrap">
          {content.titleLine2}
        </span>
      </h2>

      <p className="max-w-[42ch] font-sans text-sm leading-relaxed text-muted-foreground">
        {content.defaultDescription}
      </p>

      <div
        aria-hidden="true"
        className="skill-mobile-separator mt-2 h-px w-full bg-border"
      />
    </div>
  );

  const afterStage = (
    <div className="mx-auto max-w-[1600px] px-[clamp(20px,4vw,56px)] pb-24">
      <div
        aria-hidden="true"
        className="skills-after-separator mb-10 h-px w-full bg-border/60"
      />
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {content.secondaryTitle}
        </p>
        <ul
          aria-label={content.secondaryTitle}
          className="flex flex-wrap gap-2"
        >
          {content.secondaryTools.map((tool) => (
            <li
              key={tool}
              className="rounded-full border border-white/10 bg-[#141318]/80 px-3.5 py-1.5 font-sans text-xs font-medium text-muted-foreground transition-colors hover:border-white/25 hover:text-foreground"
            >
              {tool}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <StackSpread
      id="skills"
      eyebrow={content.eyebrow}
      metaRight={metaRight}
      scrollHint={content.scrollHint}
      items={content.items}
      centerSlot={centerSlot}
      mobileHeader={mobileHeader}
      afterStage={afterStage}
      renderCard={(skill, { isSpread }) => {
        const isActive = activeSkillId === skill.id;

        return (
          <button
            type="button"
            style={{ "--skill-accent": skill.accentColor } as CSSProperties}
            aria-label={`${skill.name} — ${skill.category}`}
            onMouseEnter={() => setActiveSkillId(skill.id)}
            onFocus={() => setActiveSkillId(skill.id)}
            onMouseLeave={() =>
              setActiveSkillId((prev) => (prev === skill.id ? null : prev))
            }
            onBlur={() =>
              setActiveSkillId((prev) => (prev === skill.id ? null : prev))
            }
            className={cn(
              "group pointer-events-auto relative flex size-[clamp(88px,9vw,126px)] flex-col items-center justify-between overflow-hidden rounded-[16px] border border-white/12 bg-[#141318]/92 p-2.5 text-center shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85)] backdrop-blur-md transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright lg:p-3",
              isSpread
                ? "cursor-pointer hover:-translate-y-2 hover:scale-[1.08] hover:border-white/30 focus-visible:-translate-y-2 focus-visible:scale-[1.08]"
                : "cursor-default",
              isActive &&
                isSpread &&
                "border-white/30 shadow-[0_28px_70px_-18px_color-mix(in_srgb,var(--skill-accent)_45%,transparent)]",
            )}
          >
            <div className="flex w-full items-center justify-between gap-1">
              <span className="font-sans text-[8px] font-medium uppercase leading-none tracking-[0.08em] text-muted-foreground lg:text-[9px]">
                {skill.category}
              </span>
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: "var(--skill-accent)",
                  boxShadow: "0 0 8px var(--skill-accent)",
                }}
              />
            </div>

            <div className="relative flex items-center justify-center">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-2.5 rounded-full opacity-75 blur-md transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle, color-mix(in srgb, var(--skill-accent) 24%, transparent) 0%, transparent 72%)",
                }}
              />
              <SkillIcon
                iconKey={skill.iconKey}
                className="relative size-7 text-[28px] lg:size-8 lg:text-[32px]"
              />
            </div>

            <span className="w-full text-balance text-center font-display text-[11px] font-semibold leading-tight tracking-[-0.02em] text-foreground lg:text-xs">
              {skill.name}
            </span>
          </button>
        );
      }}
      renderMobileGrid={() => (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
          {content.items.map((skill) => (
            <article
              key={skill.id}
              style={{ "--skill-accent": skill.accentColor } as CSSProperties}
              className="skill-mobile-card flex flex-col justify-between gap-3.5 rounded-[18px] border border-white/12 bg-[#141318]/92 p-4 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.8)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-sans text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                  {skill.category}
                </span>
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full"
                  style={{
                    backgroundColor: "var(--skill-accent)",
                    boxShadow: "0 0 8px var(--skill-accent)",
                  }}
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex shrink-0 items-center justify-center">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-2 rounded-full blur-sm"
                    style={{
                      background:
                        "radial-gradient(circle, color-mix(in srgb, var(--skill-accent) 24%, transparent) 0%, transparent 72%)",
                    }}
                  />
                  <SkillIcon
                    iconKey={skill.iconKey}
                    className="relative size-8 text-[32px]"
                  />
                </div>
                <h3 className="font-display text-sm font-semibold tracking-[-0.02em] text-foreground">
                  {skill.name}
                </h3>
              </div>
            </article>
          ))}
        </div>
      )}
    />
  );
}
