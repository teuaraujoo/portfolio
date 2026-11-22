"use client";

import { useEffect, useRef } from "react";
import type { ProjectMedia as ProjectMediaData } from "@/data/projetos";
import { cn } from "@/lib/utils";

export interface ProjectMediaProps {
  media: ProjectMediaData;
  priority?: boolean;
  interactive?: boolean;
  className?: string;
}

type PlaceholderVariant = Extract<ProjectMediaData, { type: "placeholder" }>["variant"];

const VARIANT_TAG: Record<PlaceholderVariant, string> = {
  dashboard: "UI / TELEMETRY",
  ecommerce: "STOREFRONT / UI",
  saas: "CLOUD / TOPOLOGY",
  devtools: "CLI / API SPEC",
  editorial: "SYSTEM / LAYOUT",
};

function DashboardMockup() {
  return (
    <div aria-hidden="true" className="relative flex size-full flex-col gap-2 p-2.5 @[300px]:gap-3 @[300px]:p-4 @[420px]:p-5">
      {/* Window chrome */}
      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#141318]/90 px-2.5 py-1.5 @[300px]:px-3 @[300px]:py-2">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-white/25" />
          <span className="size-2 rounded-full bg-white/15" />
          <span className="size-2 rounded-full bg-white/15" />
          <span className="ml-2 hidden h-2 w-24 rounded-full bg-white/10 @[420px]:inline-block" />
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden h-2 w-16 rounded-full bg-white/10 @[300px]:inline-block" />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-bright/40 bg-brand-bright/15 px-2 py-0.5 font-sans text-[8px] font-semibold tracking-[0.08em] text-brand-bright @[300px]:text-[9px]">
            <span className="size-1.5 rounded-full bg-brand-bright" />
            AI LIVE
          </span>
        </div>
      </div>

      {/* Main layout: slim rail + bento workspace */}
      <div className="grid min-h-0 flex-1 grid-cols-[28px_minmax(0,1fr)] gap-2 @[300px]:grid-cols-[36px_minmax(0,1fr)] @[300px]:gap-3 @[420px]:grid-cols-[44px_minmax(0,1fr)]">
        {/* Sidebar rail */}
        <div className="flex flex-col items-center justify-between rounded-lg border border-white/10 bg-[#141318]/80 py-2 @[300px]:py-3">
          <div className="flex flex-col items-center gap-1.5 @[300px]:gap-2.5">
            <span className="size-3.5 rounded-md bg-brand-bright/80 shadow-[0_0_12px_rgba(121,60,255,0.65)] @[300px]:size-4" />
            <span className="h-px w-4 bg-white/10" />
            <span className="size-2.5 rounded bg-white/15 @[300px]:size-3" />
            <span className="size-2.5 rounded bg-white/10 @[300px]:size-3" />
            <span className="hidden size-3 rounded bg-white/10 @[300px]:block" />
          </div>
          <span className="hidden size-3.5 rounded-full border border-white/20 bg-white/5 @[300px]:block" />
        </div>

        <div className="flex min-h-0 flex-col gap-2 @[300px]:gap-3">
          {/* Top KPI row */}
          <div className="grid grid-cols-3 gap-1.5 @[300px]:gap-2.5">
            <div className="rounded-lg border border-brand-bright/35 bg-gradient-to-br from-brand/20 via-[#141318] to-[#141318] p-1.5 @[300px]:p-2.5">
              <div className="hidden h-1.5 w-10 rounded-full bg-white/30 @[300px]:block" />
              <div className="font-display text-[11px] font-semibold tracking-tight text-foreground tabular-nums @[300px]:mt-2 @[300px]:text-sm @[420px]:text-base">
                98.4%
              </div>
              <div className="mt-1 hidden h-1 w-12 rounded-full bg-brand-bright/70 @[300px]:block" />
            </div>
            <div className="rounded-lg border border-white/10 bg-[#141318]/80 p-1.5 @[300px]:p-2.5">
              <div className="hidden h-1.5 w-12 rounded-full bg-white/20 @[300px]:block" />
              <div className="font-display text-[11px] font-semibold tracking-tight text-foreground/90 tabular-nums @[300px]:mt-2 @[300px]:text-sm @[420px]:text-base">
                14.2ms
              </div>
              <div className="mt-1 hidden h-1 w-9 rounded-full bg-white/20 @[300px]:block" />
            </div>
            <div className="rounded-lg border border-white/10 bg-[#141318]/80 p-1.5 @[300px]:p-2.5">
              <div className="hidden h-1.5 w-11 rounded-full bg-white/20 @[300px]:block" />
              <div className="font-display text-[11px] font-semibold tracking-tight text-foreground/90 tabular-nums @[300px]:mt-2 @[300px]:text-sm @[420px]:text-base">
                1.28M
              </div>
              <div className="mt-1 hidden h-1 w-14 rounded-full bg-white/15 @[300px]:block" />
            </div>
          </div>

          {/* Chart + anomaly feed */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 @[300px]:gap-2.5 @[420px]:grid-cols-[minmax(0,1.45fr)_minmax(0,0.85fr)]">
            <div className="relative flex min-h-0 flex-col justify-between overflow-hidden rounded-lg border border-white/10 bg-[#141318]/85 p-2 @[300px]:p-3">
              <div className="hidden items-center justify-between @[300px]:flex">
                <span className="h-2 w-20 rounded-full bg-white/25" />
                <span className="h-2 w-10 rounded-full bg-brand-bright/60" />
              </div>
              <svg
                viewBox="0 0 240 86"
                fill="none"
                className="min-h-0 w-full flex-1 overflow-visible @[300px]:mt-2 @[300px]:h-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="dash-area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#793CFF" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#4811ED" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="20" x2="240" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="0" y1="45" x2="240" y2="45" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="240" y2="70" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <path
                  d="M0 68 C 28 64, 42 40, 72 44 C 102 48, 118 22, 148 26 C 178 30, 196 10, 240 16 L 240 86 L 0 86 Z"
                  fill="url(#dash-area-grad)"
                />
                <path
                  d="M0 68 C 28 64, 42 40, 72 44 C 102 48, 118 22, 148 26 C 178 30, 196 10, 240 16"
                  stroke="#793CFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="148" cy="26" r="3.5" fill="#F5F5F5" stroke="#793CFF" strokeWidth="2" />
              </svg>
            </div>

            <div className="hidden flex-col justify-between rounded-lg border border-white/10 bg-[#141318]/85 p-3 @[420px]:flex">
              <div className="h-2 w-16 rounded-full bg-white/25" />
              <div className="space-y-2">
                {[0.85, 0.65, 0.9, 0.55].map((width, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        index === 0 ? "bg-brand-bright" : "bg-white/25",
                      )}
                    />
                    <div className="h-1.5 flex-1 rounded-full bg-white/8">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          index === 0 ? "bg-brand-bright/70" : "bg-white/20",
                        )}
                        style={{ width: `${width * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-5 rounded border border-white/10 bg-white/[0.03]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EcommerceMockup() {
  return (
    <div aria-hidden="true" className="relative flex size-full flex-col gap-2 p-2.5 @[300px]:gap-3 @[300px]:p-4 @[420px]:p-5">
      {/* Editorial storefront navbar */}
      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#141318]/90 px-2.5 py-1.5 @[300px]:px-3.5 @[300px]:py-2">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rotate-45 bg-brand-bright" />
          <span className="h-2 w-14 rounded-full bg-white/30" />
        </div>
        <div className="hidden items-center gap-3 @[420px]:flex">
          <span className="h-1.5 w-10 rounded-full bg-white/15" />
          <span className="h-1.5 w-10 rounded-full bg-white/15" />
          <span className="h-1.5 w-10 rounded-full bg-white/15" />
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-0.5">
          <span className="size-1.5 rounded-full bg-brand-bright" />
          <span className="font-sans text-[9px] font-semibold tracking-[0.08em] text-white/80 tabular-nums">
            BAG (02)
          </span>
        </div>
      </div>

      {/* Product hero showcase */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 @[300px]:gap-3 @[420px]:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="relative flex min-h-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#191722] via-[#121118] to-[#0D0D0D] p-2 @[300px]:p-4">
          <div className="pointer-events-none absolute -top-10 -right-10 size-36 rounded-full bg-brand/35 blur-2xl" />
          <span className="absolute top-2 left-2 rounded-full border border-brand-bright/40 bg-brand-bright/15 px-2 py-0.5 font-sans text-[8px] font-semibold uppercase tracking-[0.1em] text-brand-bright @[300px]:top-3 @[300px]:left-3 @[300px]:text-[9px]">
            Edition 04
          </span>
          {/* Sculptural object wireframe */}
          <svg viewBox="0 0 180 120" fill="none" className="h-14 w-24 @[300px]:h-24 @[300px]:w-40 @[420px]:h-28 @[420px]:w-44">
            <ellipse cx="90" cy="100" rx="58" ry="8" fill="rgba(121,60,255,0.18)" />
            <rect
              x="44"
              y="22"
              width="92"
              height="68"
              rx="18"
              fill="#141318"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="1.5"
            />
            <rect
              x="54"
              y="32"
              width="72"
              height="48"
              rx="12"
              fill="rgba(72,17,237,0.18)"
              stroke="#793CFF"
              strokeWidth="1.2"
            />
            <circle cx="90" cy="56" r="14" stroke="rgba(245,245,245,0.65)" strokeWidth="1.5" />
            <circle cx="90" cy="56" r="5" fill="#793CFF" />
          </svg>
        </div>

        {/* Product details & CTA */}
        <div className="hidden flex-col justify-between rounded-xl border border-white/10 bg-[#141318]/85 p-3.5 @[300px]:flex">
          <div>
            <div className="flex items-center justify-between">
              <span className="h-1.5 w-14 rounded-full bg-brand-bright/70" />
              <span className="font-display text-xs font-semibold text-foreground/90 tabular-nums">
                R$ 890
              </span>
            </div>
            <div className="mt-3 h-3 w-4/5 rounded bg-white/25" />
            <div className="mt-1.5 h-2 w-3/5 rounded bg-white/12" />

            {/* Swatches */}
            <div className="mt-4 flex items-center gap-2">
              <span className="size-4 rounded-full bg-brand-bright ring-2 ring-white/80 ring-offset-2 ring-offset-[#141318]" />
              <span className="size-4 rounded-full border border-white/25 bg-white/20" />
              <span className="size-4 rounded-full border border-white/20 bg-white/5" />
            </div>

            {/* Size matrix */}
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {["39", "40", "41", "42"].map((size, idx) => (
                <div
                  key={size}
                  className={cn(
                    "flex h-6 items-center justify-center rounded border text-[9px] font-medium tabular-nums",
                    idx === 1
                      ? "border-brand-bright/60 bg-brand-bright/15 text-foreground"
                      : "border-white/10 bg-white/[0.02] text-white/45",
                  )}
                >
                  {size}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex h-8 items-center justify-center rounded-lg bg-brand font-sans text-[10px] font-semibold tracking-[0.08em] text-foreground uppercase shadow-[0_8px_24px_-6px_rgba(72,17,237,0.75)]">
            Checkout Instantâneo
          </div>
        </div>
      </div>
    </div>
  );
}

function SaasMockup() {
  return (
    <div aria-hidden="true" className="relative flex size-full flex-col gap-2 p-2.5 @[300px]:gap-3 @[300px]:p-4 @[420px]:p-5">
      {/* Workspace bar */}
      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#141318]/90 px-2.5 py-1.5 @[300px]:px-3 @[300px]:py-2">
        <div className="flex items-center gap-2">
          <span className="flex size-4 items-center justify-center rounded border border-brand-bright/40 bg-brand/25 font-display text-[8px] font-bold text-foreground @[300px]:size-5 @[300px]:text-[9px]">
            C
          </span>
          <span className="h-2 w-16 rounded-full bg-white/25 @[300px]:w-20" />
          <span className="hidden rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-sans text-[8px] uppercase tracking-[0.08em] text-white/55 @[420px]:inline-block">
            prod-us-east
          </span>
        </div>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-sans text-[8px] font-medium text-emerald-300 tabular-nums @[300px]:text-[9px]">
          99.98% SLA
        </span>
      </div>

      {/* Node topology canvas */}
      <div className="relative flex min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[#111016]/90 p-2 @[300px]:p-3.5">
        <svg
          viewBox="0 0 360 150"
          fill="none"
          className="min-h-0 w-full flex-1"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Connection curves */}
          <path
            d="M 88 75 C 125 75, 130 38, 168 38"
            stroke="rgba(121,60,255,0.6)"
            strokeWidth="1.6"
          />
          <path
            d="M 88 75 C 125 75, 130 112, 168 112"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.4"
            strokeDasharray="4 4"
          />
          <path
            d="M 244 38 C 266 38, 268 75, 290 75"
            stroke="rgba(121,60,255,0.6)"
            strokeWidth="1.6"
          />
          <path
            d="M 244 112 C 266 112, 268 75, 290 75"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.4"
          />

          {/* Left Gateway Node */}
          <rect
            x="16"
            y="53"
            width="72"
            height="44"
            rx="10"
            fill="#141318"
            stroke="rgba(255,255,255,0.18)"
          />
          <circle cx="30" cy="69" r="3.5" fill="#793CFF" />
          <rect x="40" y="66" width="34" height="5" rx="2.5" fill="rgba(255,255,255,0.3)" />
          <rect x="27" y="80" width="46" height="4" rx="2" fill="rgba(255,255,255,0.12)" />

          {/* Top Active Worker Node */}
          <rect
            x="168"
            y="16"
            width="76"
            height="44"
            rx="10"
            fill="#191529"
            stroke="#793CFF"
            strokeWidth="1.4"
          />
          <circle cx="182" cy="32" r="3.5" fill="#793CFF" />
          <rect x="192" y="29" width="38" height="5" rx="2.5" fill="rgba(245,245,245,0.55)" />
          <rect x="179" y="43" width="52" height="4" rx="2" fill="rgba(121,60,255,0.45)" />

          {/* Bottom Worker Node */}
          <rect
            x="168"
            y="90"
            width="76"
            height="44"
            rx="10"
            fill="#141318"
            stroke="rgba(255,255,255,0.15)"
          />
          <circle cx="182" cy="106" r="3.5" fill="rgba(255,255,255,0.35)" />
          <rect x="192" y="103" width="34" height="5" rx="2.5" fill="rgba(255,255,255,0.22)" />
          <rect x="179" y="117" width="48" height="4" rx="2" fill="rgba(255,255,255,0.1)" />

          {/* Output Edge Node */}
          <rect
            x="290"
            y="53"
            width="54"
            height="44"
            rx="10"
            fill="#141318"
            stroke="rgba(255,255,255,0.18)"
          />
          <circle cx="317" cy="70" r="6" fill="rgba(72,17,237,0.35)" stroke="#793CFF" />
          <rect x="302" y="83" width="30" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
        </svg>

        {/* Bottom status bar */}
        <div className="mt-2 hidden grid-cols-3 gap-2 border-t border-white/10 pt-2.5 @[300px]:grid">
          {[
            { label: "Queues", pct: "72%" },
            { label: "Workers", pct: "94%" },
            { label: "Latency", pct: "38%" },
          ].map((item, idx) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between font-sans text-[8px] uppercase tracking-[0.08em] text-white/50">
                <span>{item.label}</span>
                <span className="tabular-nums">{item.pct}</span>
              </div>
              <div className="h-1 w-full rounded-full bg-white/10">
                <div
                  className={cn(
                    "h-full rounded-full",
                    idx === 1 ? "bg-brand-bright" : "bg-white/30",
                  )}
                  style={{ width: item.pct }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DevtoolsMockup() {
  return (
    <div aria-hidden="true" className="relative grid size-full grid-cols-1 gap-2 p-2.5 @[300px]:gap-3 @[300px]:p-4 @[420px]:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] @[420px]:p-5">
      {/* Terminal pane */}
      <div className="flex min-h-0 flex-col justify-between overflow-hidden rounded-xl border border-white/12 bg-[#0B0B0E]/95 p-2.5 font-mono text-[9px] leading-snug @[300px]:p-3.5 @[300px]:text-[10px] @[300px]:leading-relaxed">
        <div>
          <div className="mb-1.5 flex items-center justify-between border-b border-white/10 pb-1.5 @[300px]:mb-3 @[300px]:pb-2">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-white/25" />
              <span className="size-2 rounded-full bg-white/15" />
              <span className="size-2 rounded-full bg-white/15" />
            </div>
            <span className="font-sans text-[8px] uppercase tracking-[0.1em] text-white/45 @[300px]:text-[9px]">
              zsh · cli
            </span>
          </div>

          <div className="space-y-1 text-white/75 @[300px]:space-y-1.5">
            <p className="truncate">
              <span className="text-brand-bright">$</span> npx edge-kit build --strict
            </p>
            <p className="truncate text-white/45">› compiling AST schema (24 routes)</p>
            <p className="truncate text-emerald-300/90">✓ typed SDK generated in 118ms</p>
            <p className="hidden pt-1 @[300px]:block">
              <span className="text-brand-bright">$</span> edge-kit check --openapi
            </p>
            <p className="hidden text-white/55 @[300px]:block">
              › zero breaking diffs · <span className="text-brand-bright">v2.4.0</span>
            </p>
          </div>
        </div>

        <div className="mt-3 hidden items-center gap-1.5 border-t border-white/10 pt-2 text-white/55 @[300px]:flex">
          <span className="text-brand-bright">›</span>
          <span className="h-3 w-1.5 bg-brand-bright/85" />
          <span className="text-[9px] text-white/35">ready on localhost:4000</span>
        </div>
      </div>

      {/* API / Docs Inspector */}
      <div className="hidden flex-col justify-between rounded-xl border border-white/10 bg-[#141318]/90 p-3.5 @[420px]:flex">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="rounded bg-brand/30 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-brand-bright">
              POST
            </span>
            <span className="font-mono text-[9px] text-white/45 tabular-nums">200 OK · 14ms</span>
          </div>
          <div className="rounded border border-white/10 bg-[#0D0D0D] px-2.5 py-1.5 font-mono text-[9px] text-white/75">
            /v2/deployments/verify
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="h-1.5 w-3/4 rounded-full bg-white/20" />
            <div className="h-1.5 w-1/2 rounded-full bg-brand-bright/45" />
            <div className="h-1.5 w-5/6 rounded-full bg-white/12" />
            <div className="h-1.5 w-2/3 rounded-full bg-white/12" />
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
          <div className="flex items-center justify-between">
            <span className="h-1.5 w-12 rounded-full bg-white/25" />
            <span className="size-2 rounded-full bg-emerald-400/80" />
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

function EditorialMockup() {
  return (
    <div aria-hidden="true" className="relative flex size-full flex-col justify-between p-2.5 @[300px]:p-4 @[420px]:p-5">
      {/* Top Swiss hairline meta */}
      <div className="flex items-center justify-between border-b border-white/12 pb-1.5 font-sans text-[8px] font-medium uppercase tracking-[0.14em] text-white/50 @[300px]:pb-2.5 @[300px]:text-[9px]">
        <span>SPECIMEN · 01</span>
        <span className="text-brand-bright">GRID / 12-COL</span>
      </div>

      {/* Asymmetric typographic composition */}
      <div className="my-auto grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] items-center gap-3 py-1 @[300px]:gap-4 @[300px]:py-3">
        <div className="space-y-2 @[300px]:space-y-3">
          <div className="font-display text-2xl font-semibold leading-none tracking-[-0.05em] text-foreground @[300px]:text-4xl @[420px]:text-5xl">
            Aa<span className="text-brand-bright">.</span>
          </div>
          <div className="space-y-1 @[300px]:space-y-1.5">
            <div className="h-1.5 w-full rounded-full bg-white/25 @[300px]:h-2" />
            <div className="h-1.5 w-4/5 rounded-full bg-white/15 @[300px]:h-2" />
            <div className="hidden h-2 w-3/5 rounded-full bg-white/10 @[300px]:block" />
          </div>
        </div>

        <div className="relative h-16 w-12 justify-self-end overflow-hidden rounded-lg border border-white/12 bg-gradient-to-b from-brand/30 via-[#141318] to-[#0D0D0D] p-1.5 @[300px]:aspect-[3/4] @[300px]:h-auto @[300px]:w-auto @[300px]:justify-self-stretch @[300px]:rounded-xl @[300px]:p-3">
          <div className="flex h-full flex-col justify-between border border-dashed border-white/15 p-1 @[300px]:p-2">
            <span className="size-1.5 rounded-full bg-brand-bright @[300px]:size-2.5" />
            <div className="space-y-1">
              <div className="h-1 w-full rounded-full bg-white/30 @[300px]:h-1.5" />
              <div className="h-1 w-2/3 rounded-full bg-white/15 @[300px]:h-1.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom column markers */}
      <div className="hidden grid-cols-3 gap-2 border-t border-white/12 pt-2.5 @[300px]:grid">
        <div className="h-1.5 rounded-full bg-white/20" />
        <div className="h-1.5 rounded-full bg-brand-bright/50" />
        <div className="h-1.5 rounded-full bg-white/12" />
      </div>
    </div>
  );
}

function renderPlaceholderVariant(variant: PlaceholderVariant) {
  switch (variant) {
    case "dashboard":
      return <DashboardMockup />;
    case "ecommerce":
      return <EcommerceMockup />;
    case "saas":
      return <SaasMockup />;
    case "devtools":
      return <DevtoolsMockup />;
    case "editorial":
      return <EditorialMockup />;
  }
}

/**
 * Renders project showcase media: optimized image, viewport-aware video,
 * or an Editorial-Tech dark architectural mockup placeholder per variant.
 */
export function ProjectMedia({
  media,
  priority = false,
  interactive = false,
  className,
}: ProjectMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (media.type !== "video") return;

    const video = videoRef.current;
    if (!video) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const pauseVideo = () => {
      if (!video.paused) {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting && !motionQuery.matches) {
          void video.play().catch(() => {
            // Autoplay might be blocked by browser policy; keep poster visible silently.
          });
        } else {
          pauseVideo();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(video);

    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        pauseVideo();
      }
    };

    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", handleMotionChange);
      pauseVideo();
    };
  }, [media.type]);

  if (media.type === "image") {
    return (
      <div className={cn("relative size-full overflow-hidden bg-[#0D0D0D]", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.src}
          alt={media.alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="size-full object-cover"
        />
      </div>
    );
  }

  if (media.type === "video") {
    return (
      <div className={cn("relative size-full overflow-hidden bg-[#0D0D0D]", className)}>
        <video
          ref={videoRef}
          src={media.src}
          poster={media.poster}
          aria-label={media.alt}
          muted
          loop
          playsInline
          controls={interactive}
          preload={priority ? "auto" : "metadata"}
          className="size-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={media.label}
      className={cn(
        "@container relative size-full overflow-hidden bg-[#0D0D0D] select-none",
        className,
      )}
    >
      {/* Subtle architectural grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:28px_28px]"
      />

      {/* Focused #4811ED / #793CFF architectural glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full bg-[#4811ED]/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-[#793CFF]/18 blur-3xl"
      />

      {/* Variant UI mockup frame */}
      <div className="relative z-10 size-full pb-7 @[300px]:pb-9">
        {renderPlaceholderVariant(media.variant)}
      </div>

      {/* Editorial preview caption / badge */}
      <div className="pointer-events-none absolute inset-x-2.5 bottom-2.5 z-20 flex items-center justify-between gap-2 @[300px]:inset-x-4 @[300px]:bottom-3.5">
        <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border border-white/12 bg-[#141318]/90 px-2.5 py-0.5 backdrop-blur-md @[300px]:gap-2 @[300px]:px-3 @[300px]:py-1">
          <span className="size-1.5 shrink-0 rounded-full bg-[#793CFF] shadow-[0_0_8px_#793CFF]" />
          <span className="truncate font-sans text-[9px] font-medium tracking-[0.04em] text-foreground/85 @[300px]:text-[10px]">
            {media.label}
          </span>
        </span>
        <span className="hidden shrink-0 rounded-full border border-white/10 bg-[#0D0D0D]/80 px-2.5 py-1 font-sans text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground backdrop-blur-md @[300px]:inline-flex">
          {VARIANT_TAG[media.variant]}
        </span>
      </div>
    </div>
  );
}
