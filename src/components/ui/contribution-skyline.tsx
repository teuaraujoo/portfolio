"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Box, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                Tipos Públicos                              */
/* -------------------------------------------------------------------------- */

export interface ContributionDay {
  date: string;
  count: number;
}

export interface Cell {
  col: number;
  row: number;
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  inRange: boolean;
}

export interface Streak {
  length: number;
  start: string;
  end: string;
}

export interface ContributionStats {
  total: number;
  activeDays: number;
  maxCount: number;
  busiest: ContributionDay | null;
  longestStreak: Streak;
  currentStreak: Streak;
}

export type RGB = [number, number, number];

export type PaletteName =
  | "brand"
  | "github"
  | "emerald"
  | "violet"
  | "amber"
  | "sky"
  | "rose";

export interface CustomPalette {
  dark: [string, string, string, string];
  light: [string, string, string, string];
}

export type PaletteInput = PaletteName | CustomPalette;

export type ContributionSkylineView = "2d" | "3d";

export interface ContributionSkylineProps {
  data?: ContributionDay[];
  endDate?: string;
  days?: number;
  seed?: number;
  weekStart?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  palette?: PaletteInput;
  defaultView?: ContributionSkylineView;
  heightScale?: number;
  duration?: number;
  showStats?: boolean;
  showLegend?: boolean;
  showToggle?: boolean;
  orbit?: boolean;
  animate?: boolean;
  locale?: string;
  unit?: string;
  unitPlural?: string;
  username?: string;
  title?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*                           Constantes & Engine Pura                         */
/* -------------------------------------------------------------------------- */

export const DAY_MS = 86_400_000;
export const WAVE = 0.42;
export const YAW_3D = -0.45;
export const ELEV_3D = 0.92;
export const YAW_RANGE: readonly [number, number] = [-0.85, 0.85];
export const ELEV_RANGE: readonly [number, number] = [-0.45, 0.35];

const DEFAULT_END_DATE = "2026-11-21";
const DEFAULT_DURATION = 1300;
const DEFAULT_CELL_HALF = 0.39;

const DEFAULT_PALETTE_OBJ: CustomPalette = {
  dark: ["#241445", "#38189c", "#4811ed", "#793cff"],
  light: ["#e4d4fb", "#9f75ff", "#793cff", "#4811ed"],
};

export const PALETTES: Record<PaletteName, CustomPalette> = {
  brand: DEFAULT_PALETTE_OBJ,
  github: {
    dark: ["#0e4429", "#006d32", "#26a641", "#39d353"],
    light: ["#9be9a8", "#40c463", "#30a14e", "#216e39"],
  },
  emerald: {
    dark: ["#064e3b", "#047857", "#10b981", "#34d399"],
    light: ["#a7f3d0", "#34d399", "#059669", "#065f46"],
  },
  violet: {
    dark: ["#2e1065", "#5b21b6", "#7c3aed", "#a78bfa"],
    light: ["#ddd6fe", "#a78bfa", "#7c3aed", "#5b21b6"],
  },
  amber: {
    dark: ["#451a03", "#92400e", "#d97706", "#fbbf24"],
    light: ["#fde68a", "#fbbf24", "#d97706", "#92400e"],
  },
  sky: {
    dark: ["#0c4a6e", "#0369a1", "#0ea5e9", "#38bdf8"],
    light: ["#bae6fd", "#38bdf8", "#0284c7", "#075985"],
  },
  rose: {
    dark: ["#4c0519", "#9f1239", "#e11d48", "#fb7185"],
    light: ["#fecdd3", "#fb7185", "#e11d48", "#9f1239"],
  },
};

export function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeInOutCubic(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function easeOutCubic(t: number): number {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 3);
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function toKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function dayMs(key: string): number {
  const parts = key.split("-").map(Number);
  const y = parts[0] || 1970;
  const m = (parts[1] || 1) - 1;
  const d = parts[2] || 1;
  return Date.UTC(y, m, d);
}

export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateContributions(
  endDate: string = DEFAULT_END_DATE,
  seed: number = 7,
  days: number = 365,
): ContributionDay[] {
  const rand = rng(seed);
  const safeDays = Math.max(7, Math.min(372, Math.round(days)));
  const end = dayMs(endDate);
  const start = end - (safeDays - 1) * DAY_MS;
  const result: ContributionDay[] = [];

  let momentum = 0.45;
  for (let i = 0; i < safeDays; i++) {
    const ms = start + i * DAY_MS;
    const dt = new Date(ms);
    const dow = dt.getUTCDay();
    const isWeekend = dow === 0 || dow === 6;

    if (rand() < 0.08) {
      momentum = 0.25 + rand() * 0.75;
    } else {
      momentum = lerp(momentum, 0.45, 0.12);
    }

    const activeChance = isWeekend ? 0.34 * momentum : 0.72 * momentum + 0.12;
    let count = 0;
    if (rand() < activeChance) {
      const burst = rand() < 0.08 ? 1.8 + rand() * 1.4 : 1;
      const base = isWeekend ? 1 + rand() * 4 : 1 + rand() * 8 * momentum;
      count = Math.max(1, Math.round(base * burst));
    }

    result.push({ date: toKey(dt), count });
  }

  return result;
}

export function levelOf(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0 || maxCount <= 0) return 0;
  const r = Math.pow(clamp01(count / maxCount), 0.75);
  if (r <= 0.25) return 1;
  if (r <= 0.5) return 2;
  if (r <= 0.75) return 3;
  return 4;
}

export function buildGrid(
  days: ContributionDay[],
  weekStart: number = 0,
): { cells: Cell[]; cols: number; maxCount: number } {
  if (days.length === 0) {
    return { cells: [], cols: 0, maxCount: 0 };
  }

  const byDate = new Map<string, number>();
  let minMs = Number.POSITIVE_INFINITY;
  let maxMs = Number.NEGATIVE_INFINITY;

  for (const item of days) {
    if (!item.date) continue;
    const ms = dayMs(item.date);
    const key = toKey(new Date(ms));
    const safeCount = Math.max(0, Math.round(item.count));
    byDate.set(key, (byDate.get(key) ?? 0) + safeCount);
    if (ms < minMs) minMs = ms;
    if (ms > maxMs) maxMs = ms;
  }

  if (!Number.isFinite(minMs) || !Number.isFinite(maxMs)) {
    return { cells: [], cols: 0, maxCount: 0 };
  }

  let maxCount = 0;
  for (const val of byDate.values()) {
    if (val > maxCount) maxCount = val;
  }

  const normalizedWeekStart = ((weekStart % 7) + 7) % 7;
  const firstDow = new Date(minMs).getUTCDay();
  const leadPad = (firstDow - normalizedWeekStart + 7) % 7;
  const gridStartMs = minMs - leadPad * DAY_MS;

  const lastDow = new Date(maxMs).getUTCDay();
  const trailPad = (normalizedWeekStart + 6 - lastDow + 7) % 7;
  const gridEndMs = maxMs + trailPad * DAY_MS;

  const totalSlots = Math.round((gridEndMs - gridStartMs) / DAY_MS) + 1;
  const cols = Math.ceil(totalSlots / 7);
  const cells: Cell[] = [];

  for (let i = 0; i < cols * 7; i++) {
    const ms = gridStartMs + i * DAY_MS;
    const key = toKey(new Date(ms));
    const inRange = ms >= minMs && ms <= maxMs;
    const count = inRange ? (byDate.get(key) ?? 0) : 0;
    cells.push({
      col: Math.floor(i / 7),
      row: i % 7,
      date: key,
      count,
      level: inRange ? levelOf(count, maxCount) : 0,
      inRange,
    });
  }

  return { cells, cols, maxCount };
}

export function computeStats(days: ContributionDay[]): ContributionStats {
  const emptyStreak: Streak = { length: 0, start: "", end: "" };
  if (days.length === 0) {
    return {
      total: 0,
      activeDays: 0,
      maxCount: 0,
      busiest: null,
      longestStreak: emptyStreak,
      currentStreak: emptyStreak,
    };
  }

  const byDate = new Map<string, number>();
  let minMs = Number.POSITIVE_INFINITY;
  let maxMs = Number.NEGATIVE_INFINITY;

  for (const item of days) {
    const ms = dayMs(item.date);
    const key = toKey(new Date(ms));
    const safeCount = Math.max(0, Math.round(item.count));
    byDate.set(key, (byDate.get(key) ?? 0) + safeCount);
    if (ms < minMs) minMs = ms;
    if (ms > maxMs) maxMs = ms;
  }

  const span = Math.round((maxMs - minMs) / DAY_MS) + 1;
  const timeline: ContributionDay[] = [];
  for (let i = 0; i < span; i++) {
    const key = toKey(new Date(minMs + i * DAY_MS));
    timeline.push({ date: key, count: byDate.get(key) ?? 0 });
  }

  let total = 0;
  let activeDays = 0;
  let maxCount = 0;
  let busiest: ContributionDay | null = null;
  let longestStreak: Streak = { ...emptyStreak };
  let runLen = 0;
  let runStart = "";

  for (let i = 0; i < timeline.length; i++) {
    const entry = timeline[i];
    total += entry.count;
    if (entry.count > 0) {
      activeDays++;
      if (entry.count > maxCount) {
        maxCount = entry.count;
        busiest = { date: entry.date, count: entry.count };
      }
      if (runLen === 0) runStart = entry.date;
      runLen++;
      if (runLen >= longestStreak.length) {
        longestStreak = { length: runLen, start: runStart, end: entry.date };
      }
    } else {
      runLen = 0;
      runStart = "";
    }
  }

  // Sequência atual: permite 1 dia de tolerância no final caso hoje ainda não tenha commits
  let currentStreak: Streak = { ...emptyStreak };
  let tailIdx = timeline.length - 1;
  if (tailIdx >= 0 && timeline[tailIdx].count === 0 && tailIdx - 1 >= 0 && timeline[tailIdx - 1].count > 0) {
    tailIdx--;
  }
  if (tailIdx >= 0 && timeline[tailIdx].count > 0) {
    const endKey = timeline[tailIdx].date;
    let startIdx = tailIdx;
    while (startIdx > 0 && timeline[startIdx - 1].count > 0) {
      startIdx--;
    }
    currentStreak = {
      length: tailIdx - startIdx + 1,
      start: timeline[startIdx].date,
      end: endKey,
    };
  }

  return {
    total,
    activeDays,
    maxCount,
    busiest,
    longestStreak,
    currentStreak,
  };
}

export function monthLabels(
  cells: Cell[],
  cols: number,
  locale: string = "pt-BR",
): Array<{ col: number; label: string }> {
  if (cols === 0 || cells.length === 0) return [];
  const fmt = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });
  const labels: Array<{ col: number; label: string }> = [];
  let lastMonth = -1;
  let lastCol = -99;

  for (let col = 0; col < cols; col++) {
    let target: Cell | undefined;
    for (let row = 0; row < 7; row++) {
      const c = cells[col * 7 + row];
      if (c && c.inRange) {
        target = c;
        break;
      }
    }
    if (!target) continue;
    const dt = new Date(dayMs(target.date));
    const m = dt.getUTCMonth();
    if (m !== lastMonth) {
      lastMonth = m;
      if (col - lastCol >= 3) {
        const raw = fmt.format(dt).replace(/\.$/, "");
        const clean = raw.charAt(0).toUpperCase() + raw.slice(1);
        labels.push({ col, label: clean });
        lastCol = col;
      }
    }
  }

  return labels;
}

export function barHeight(
  count: number,
  maxCount: number,
  heightScale: number = 1,
): number {
  if (count <= 0 || maxCount <= 0) return 0.07;
  const ratio = Math.pow(clamp01(count / maxCount), 0.72);
  return (0.38 + ratio * 4.1) * Math.max(0.2, heightScale);
}

export function riseAt(col: number, cols: number, t: number): number {
  const u = cols > 1 ? col / (cols - 1) : 0;
  const start = u * WAVE;
  const local = clamp01((t - start) / (1 - WAVE));
  return easeOutCubic(local);
}

export interface Cam {
  cx: number;
  cy: number;
  scale: number;
  cosY: number;
  sinY: number;
  cosE: number;
  sinE: number;
}

export function camera(
  w: number,
  h: number,
  cols: number,
  maxBar: number,
  e: number,
  yawOffset: number = 0,
  elevOffset: number = 0,
  showCornerStats: boolean = false,
  bigSize: number = 28,
): Cam {
  const safeCols = Math.max(1, cols);
  const compactStage = !showCornerStats && w < 500;
  const padX2D = compactStage ? 10 : 14;
  const topLabel2D = compactStage ? 20 : 22;
  const padB2D = compactStage ? 10 : 12;
  const scale2D = Math.min(
    (w - padX2D * 2) / safeCols,
    (h - topLabel2D - padB2D) / 7,
  );
  const cx2D = w * 0.5;
  const cy2D = topLabel2D + (h - topLabel2D - padB2D) * 0.5;

  const targetYaw =
    YAW_3D + Math.max(YAW_RANGE[0], Math.min(YAW_RANGE[1], yawOffset));
  const targetElev =
    ELEV_3D + Math.max(ELEV_RANGE[0], Math.min(ELEV_RANGE[1], elevOffset));

  // Auto-encaixe usando os limites da pose 3D padrão para manter escala estável durante órbita
  const refCosY = Math.cos(YAW_3D);
  const refSinY = Math.sin(YAW_3D);
  const refCosE = Math.cos(ELEV_3D);
  const refSinE = Math.sin(ELEV_3D);

  const halfW = (safeCols - 1) * 0.5 + DEFAULT_CELL_HALF;
  const halfH = 3 + DEFAULT_CELL_HALF;

  const spanX = 2 * (halfW * Math.abs(refCosY) + halfH * Math.abs(refSinY));
  const spanYBase =
    2 * (halfW * Math.abs(refSinY) + halfH * Math.abs(refCosY)) * refCosE;
  const barLift = maxBar * refSinE;

  const topClear = showCornerStats ? bigSize + 44 : w < 500 ? 12 : 16;
  const bottomClear = showCornerStats ? bigSize + 42 : w < 500 ? 10 : 14;
  const sideClear = w < 500 ? 14 : 18;

  const availW = Math.max(120, w - sideClear * 2);
  const availH = Math.max(90, h - topClear - bottomClear);
  const scale3D = Math.min(availW / spanX, availH / (spanYBase + barLift));
  const usedH = (spanYBase + barLift) * scale3D;
  const extraY = Math.max(0, (availH - usedH) * 0.5);

  const cx3D = w * 0.5;
  const cy3D =
    topClear + extraY + barLift * scale3D + spanYBase * scale3D * 0.5;

  const tCam = easeInOutCubic(clamp01(e));
  const yaw = lerp(0, targetYaw, tCam);
  const elev = lerp(0, targetElev, tCam);
  const scale = lerp(scale2D, scale3D, tCam);
  const cx = lerp(cx2D, cx3D, tCam);
  const cy = lerp(cy2D, cy3D, tCam);

  return {
    cx,
    cy,
    scale,
    cosY: Math.cos(yaw),
    sinY: Math.sin(yaw),
    cosE: Math.cos(elev),
    sinE: Math.sin(elev),
  };
}

export function project(
  wx: number,
  wy: number,
  wz: number,
  cam: Cam,
): [number, number] {
  const x1 = wx * cam.cosY - wy * cam.sinY;
  const y1 = wx * cam.sinY + wy * cam.cosY;
  return [
    cam.cx + x1 * cam.scale,
    cam.cy + (y1 * cam.cosE - wz * cam.sinE) * cam.scale,
  ];
}

export function depthOf(
  wx: number,
  wy: number,
  wz: number,
  cam: Cam,
): number {
  const y1 = wx * cam.sinY + wy * cam.cosY;
  return y1 * cam.sinE + wz * cam.cosE;
}

export function mixRGB(a: RGB, b: RGB, t: number): RGB {
  const k = clamp01(t);
  return [
    Math.round(lerp(a[0], b[0], k)),
    Math.round(lerp(a[1], b[1], k)),
    Math.round(lerp(a[2], b[2], k)),
  ];
}

export function luminance([r, g, b]: RGB): number {
  const linearize = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function parseHexOrRgb(color: string): RGB {
  const trimmed = color.trim();
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16) || 0,
        parseInt(hex[1] + hex[1], 16) || 0,
        parseInt(hex[2] + hex[2], 16) || 0,
      ];
    }
    if (hex.length >= 6) {
      return [
        parseInt(hex.slice(0, 2), 16) || 0,
        parseInt(hex.slice(2, 4), 16) || 0,
        parseInt(hex.slice(4, 6), 16) || 0,
      ];
    }
  }
  const match = trimmed.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (match) {
    return [
      Math.max(0, Math.min(255, Math.round(Number(match[1])))),
      Math.max(0, Math.min(255, Math.round(Number(match[2])))),
      Math.max(0, Math.min(255, Math.round(Number(match[3])))),
    ];
  }
  return [121, 60, 255];
}

export function resolvePalette(
  input: PaletteInput | undefined,
  isDark: boolean,
): [RGB, RGB, RGB, RGB] {
  const source: CustomPalette =
    typeof input === "string"
      ? (PALETTES[input] ?? PALETTES.brand)
      : (input ?? PALETTES.brand);
  const stops = isDark ? source.dark : source.light;
  return [
    parseHexOrRgb(stops[0]),
    parseHexOrRgb(stops[1]),
    parseHexOrRgb(stops[2]),
    parseHexOrRgb(stops[3]),
  ];
}

/* -------------------------------------------------------------------------- */
/*                           Helpers de Canvas & UI                           */
/* -------------------------------------------------------------------------- */

function rgbCss([r, g, b]: RGB, alpha: number = 1): string {
  return alpha >= 1
    ? `rgb(${r}, ${g}, ${b})`
    : `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function pointInPoly(
  px: number,
  py: number,
  poly: ReadonlyArray<readonly [number, number]>,
): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function drawPoly(
  ctx: CanvasRenderingContext2D,
  pts: ReadonlyArray<readonly [number, number]>,
): void {
  if (pts.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i][0], pts[i][1]);
  }
  ctx.closePath();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
}

interface ThemeColors {
  bg: RGB;
  card: RGB;
  fg: RGB;
  isDark: boolean;
}

const DEFAULT_THEME: ThemeColors = {
  bg: [13, 13, 13],
  card: [20, 19, 24],
  fg: [245, 245, 245],
  isDark: true,
};

function parseCssColor(
  probeCanvas: HTMLCanvasElement,
  raw: string,
): RGB | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "transparent") return null;

  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (hex.length === 8 && parseInt(hex.slice(6, 8), 16) === 0) return null;
    if (hex.length === 4 && parseInt(hex[3] + hex[3], 16) === 0) return null;
    return parseHexOrRgb(trimmed);
  }

  const rgbaMatch = trimmed.match(
    /rgba?\(\s*[\d.]+[\s,]+[\d.]+[\s,]+[\d.]+(?:[\s,/]+([\d.]+%?))?\s*\)/i,
  );
  if (rgbaMatch) {
    if (rgbaMatch[1] !== undefined) {
      const alpha = rgbaMatch[1].endsWith("%")
        ? parseFloat(rgbaMatch[1]) / 100
        : parseFloat(rgbaMatch[1]);
      if (!Number.isFinite(alpha) || alpha <= 0.01) return null;
    }
    return parseHexOrRgb(trimmed);
  }

  const pCtx = probeCanvas.getContext("2d", { willReadFrequently: true });
  if (!pCtx) return null;
  pCtx.clearRect(0, 0, 1, 1);
  pCtx.fillStyle = "rgba(0, 0, 0, 0)";
  pCtx.fillStyle = trimmed;
  pCtx.fillRect(0, 0, 1, 1);
  const data = pCtx.getImageData(0, 0, 1, 1).data;
  if (data[3] === 0) return null;
  return [data[0], data[1], data[2]];
}

function readCssColor(
  probeCanvas: HTMLCanvasElement,
  el: HTMLElement,
  varNames: string[],
  fallback: RGB,
): RGB {
  const styles = getComputedStyle(el);
  for (const name of varNames) {
    const value = styles.getPropertyValue(name).trim();
    if (!value) continue;
    const parsed = parseCssColor(probeCanvas, value);
    if (parsed) return parsed;
  }
  return fallback;
}

interface ProjectedBar {
  cellIndex: number;
  cell: Cell;
  polys: Array<Array<[number, number]>>;
  tipX: number;
  tipY: number;
}

interface BarScratch {
  bar: ProjectedBar;
  b0: [number, number];
  b1: [number, number];
  b2: [number, number];
  b3: [number, number];
  t0: [number, number];
  t1: [number, number];
  t2: [number, number];
  t3: [number, number];
  tip: [number, number];
  faceY: Array<[number, number]>;
  faceX: Array<[number, number]>;
  topFace: Array<[number, number]>;
}

interface DrawScratch {
  depths: Float64Array;
  sortedIndices: number[];
  hitList: ProjectedBar[];
  barPool: BarScratch[];
  focusColor: RGB;
}

function createBarScratch(placeholderCell: Cell): BarScratch {
  const b0: [number, number] = [0, 0];
  const b1: [number, number] = [0, 0];
  const b2: [number, number] = [0, 0];
  const b3: [number, number] = [0, 0];
  const t0: [number, number] = [0, 0];
  const t1: [number, number] = [0, 0];
  const t2: [number, number] = [0, 0];
  const t3: [number, number] = [0, 0];
  const tip: [number, number] = [0, 0];
  const faceY: Array<[number, number]> = [t0, t1, b1, b0];
  const faceX: Array<[number, number]> = [t1, t2, b2, b1];
  const topFace: Array<[number, number]> = [t0, t1, t2, t3];
  return {
    bar: {
      cellIndex: 0,
      cell: placeholderCell,
      polys: [],
      tipX: 0,
      tipY: 0,
    },
    b0,
    b1,
    b2,
    b3,
    t0,
    t1,
    t2,
    t3,
    tip,
    faceY,
    faceX,
    topFace,
  };
}

function projectInto(
  wx: number,
  wy: number,
  wz: number,
  cam: Cam,
  out: [number, number],
): [number, number] {
  const x1 = wx * cam.cosY - wy * cam.sinY;
  const y1 = wx * cam.sinY + wy * cam.cosY;
  out[0] = cam.cx + x1 * cam.scale;
  out[1] = cam.cy + (y1 * cam.cosE - wz * cam.sinE) * cam.scale;
  return out;
}

function mixRGBInto(a: RGB, b: RGB, t: number, out: RGB): RGB {
  const k = clamp01(t);
  out[0] = Math.round(lerp(a[0], b[0], k));
  out[1] = Math.round(lerp(a[1], b[1], k));
  out[2] = Math.round(lerp(a[2], b[2], k));
  return out;
}

function mixRgbCss(a: RGB, b: RGB, t: number, alpha: number = 1): string {
  const k = clamp01(t);
  const r = Math.round(lerp(a[0], b[0], k));
  const g = Math.round(lerp(a[1], b[1], k));
  const bl = Math.round(lerp(a[2], b[2], k));
  return alpha >= 1
    ? `rgb(${r}, ${g}, ${bl})`
    : `rgba(${r}, ${g}, ${bl}, ${alpha})`;
}

const WHITE_RGB: RGB = [255, 255, 255];

const subscribeReducedMotion = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
};

const getReducedMotionSnapshot = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const getReducedMotionServerSnapshot = () => false;

function computeCanvasMetrics(width: number, showStats: boolean) {
  const safeWidth = Math.max(240, width);
  const isCornerLayout = showStats && safeWidth >= 500;
  const bigSize = Math.round(Math.max(22, Math.min(38, safeWidth * 0.055)));
  const h2 = Math.round(Math.max(96, Math.min(168, safeWidth * 0.24)));
  const h3 =
    safeWidth >= 500
      ? Math.round(
          Math.max(
            showStats ? 276 : 220,
            Math.min(
              showStats ? 400 : 320,
              safeWidth * (showStats ? 0.58 : 0.46),
            ),
          ),
        )
      : Math.round(
          Math.max(
            showStats ? 176 : 168,
            Math.min(
              showStats ? 224 : 212,
              safeWidth * (showStats ? 0.5 : 0.46),
            ),
          ),
        );

  return { safeWidth, isCornerLayout, bigSize, h2, h3 };
}

/* -------------------------------------------------------------------------- */
/*                                 Componente                                 */
/* -------------------------------------------------------------------------- */

export function ContributionSkyline({
  data,
  endDate,
  days = 365,
  seed = 7,
  weekStart = 0,
  palette = DEFAULT_PALETTE_OBJ,
  defaultView = "3d",
  heightScale = 1,
  duration = DEFAULT_DURATION,
  showStats = true,
  showLegend = true,
  showToggle = true,
  orbit = true,
  animate = true,
  locale = "pt-BR",
  unit = "contribuição",
  unitPlural = "contribuições",
  username,
  title,
  footer,
  className,
}: ContributionSkylineProps) {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const rawDays = useMemo(() => {
    if (data && data.length > 0) return data;
    return generateContributions(endDate ?? DEFAULT_END_DATE, seed, days);
  }, [data, endDate, seed, days]);

  const { cells, cols, maxCount } = useMemo(
    () => buildGrid(rawDays, weekStart),
    [rawDays, weekStart],
  );

  const stats = useMemo(() => computeStats(rawDays), [rawDays]);
  const months = useMemo(
    () => monthLabels(cells, cols, locale),
    [cells, cols, locale],
  );

  const [view, setView] = useState<ContributionSkylineView>(defaultView);
  const [hasEntered, setHasEntered] = useState(false);
  const [width, setWidth] = useState(400);
  const [hasMeasuredWidth, setHasMeasuredWidth] = useState(false);
  const [theme, setTheme] = useState<ThemeColors>(DEFAULT_THEME);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [pinnedIdx, setPinnedIdx] = useState<number | null>(null);
  const [hoverLevel, setHoverLevel] = useState<number | null>(null);
  const [lockedLevel, setLockedLevel] = useState<number | null>(null);
  const [isModeSwitching, setIsModeSwitching] = useState(false);

  const activeLevel = lockedLevel ?? hoverLevel;

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<HTMLDivElement>(null);
  const modeSwitchTimerRef = useRef<number | null>(null);
  const morphDelayTimerRef = useRef<number | null>(null);
  const hasManuallyToggledRef = useRef(false);

  const paletteColors = useMemo(
    () => resolvePalette(palette, theme.isDark),
    [palette, theme.isDark],
  );

  const emptyCellColor = useMemo(
    () => mixRGB(theme.bg, theme.fg, theme.isDark ? 0.095 : 0.07),
    [theme],
  );

  const levelColors = useMemo<[RGB, RGB, RGB, RGB, RGB]>(
    () => [
      emptyCellColor,
      paletteColors[0],
      paletteColors[1],
      paletteColors[2],
      paletteColors[3],
    ],
    [emptyCellColor, paletteColors],
  );

  // Refs mutáveis de animação (atualizados apenas em effects/callbacks)
  const animRef = useRef({
    e: 0,
    targetE: 0,
    fromE: 0,
    animStart: 0,
    animating: false,
    yawOffset: 0,
    elevOffset: 0,
    resettingOrbit: false,
    orbitFromYaw: 0,
    orbitFromElev: 0,
    orbitStart: 0,
    rafId: 0,
  });

  const dragRef = useRef({
    active: false,
    moved: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    baseYaw: 0,
    baseElev: 0,
  });

  const projectedRef = useRef<ProjectedBar[]>([]);
  const scratchRef = useRef<DrawScratch>({
    depths: new Float64Array(0),
    sortedIndices: [],
    hitList: [],
    barPool: [],
    focusColor: [0, 0, 0],
  });
  const paramsRef = useRef({
    cells,
    cols,
    maxCount,
    months,
    heightScale,
    duration,
    width,
    view,
    theme,
    palette,
    levelColors,
    showStats,
    activeIdx,
    activeLevel,
    reducedMotion,
    orbit,
  });

  // Dimensões responsivas (encaixe compacto na Hero 100svh, CSS cqw evita salto SSR -> ResizeObserver)
  const { isCornerLayout, bigSize } = computeCanvasMetrics(width, showStats);
  const stageHeight =
    view === "2d"
      ? "clamp(96px, 24cqw, 168px)"
      : showStats
        ? hasMeasuredWidth && width >= 500
          ? "clamp(276px, 58cqw, 400px)"
          : "clamp(176px, 50cqw, 224px)"
        : hasMeasuredWidth && width >= 500
          ? "clamp(220px, 46cqw, 320px)"
          : "clamp(168px, 46cqw, 212px)";

  const nf = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const longDateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }),
    [locale],
  );
  const shortDateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
      }),
    [locale],
  );

  const noun = useCallback(
    (count: number) => (count === 1 ? unit : unitPlural),
    [unit, unitPlural],
  );

  const dayWord = useCallback((d: number) => (d === 1 ? "dia" : "dias"), []);

  const formatDate = useCallback(
    (dateKey: string) => longDateFmt.format(new Date(dayMs(dateKey))),
    [longDateFmt],
  );

  const formatShortDate = useCallback(
    (dateKey: string) =>
      shortDateFmt.format(new Date(dayMs(dateKey))).replace(/\.$/, ""),
    [shortDateFmt],
  );

  const formatRange = useCallback(
    (streak: Streak) => {
      if (!streak.start || !streak.end || streak.length <= 0) return "—";
      if (streak.start === streak.end) return formatShortDate(streak.start);
      return `${formatShortDate(streak.start)} – ${formatShortDate(streak.end)}`;
    },
    [formatShortDate],
  );

  const levelLabels = useMemo(
    () => [
      `Nenhuma ${unit}`,
      "Baixa",
      "Moderada",
      "Alta",
      "Muito alta",
    ],
    [unit],
  );

  const describe = useCallback(
    (index: number | null): string => {
      if (index === null) return "";
      const cell = cells[index];
      if (!cell || !cell.inRange) return "";
      const dateStr = formatDate(cell.date);
      if (cell.count <= 0) {
        return `Nenhuma ${unit} em ${dateStr}.`;
      }
      return `${nf.format(cell.count)} ${noun(cell.count)} em ${dateStr}, intensidade ${levelLabels[cell.level].toLowerCase()}.`;
    },
    [cells, formatDate, unit, nf, noun, levelLabels],
  );

  const swatchColors = useMemo(
    () => [
      rgbCss(emptyCellColor),
      rgbCss(paletteColors[0]),
      rgbCss(paletteColors[1]),
      rgbCss(paletteColors[2]),
      rgbCss(paletteColors[3]),
    ],
    [emptyCellColor, paletteColors],
  );

  const updateTooltipDOM = useCallback(
    (tipX: number, tipY: number, containerW: number) => {
      const el = tooltipRef.current;
      if (!el) return;
      const halfTip = Math.min(120, Math.max(70, el.offsetWidth * 0.5 || 90));
      const x = Math.max(halfTip + 8, Math.min(containerW - halfTip - 8, tipX));
      const placeBelow = tipY < 48;
      const y = placeBelow ? tipY + 14 : tipY - 10;
      el.style.left = `${Math.round(x)}px`;
      el.style.top = `${Math.round(y)}px`;
      el.style.transform = placeBelow
        ? "translate(-50%, 0)"
        : "translate(-50%, -100%)";
    },
    [],
  );

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const p = paramsRef.current;
    const a = animRef.current;
    const {
      safeWidth: w,
      isCornerLayout: cornerActive,
      bigSize: curBigSize,
      h2: curH2,
      h3: curH3,
    } = computeCanvasMetrics(p.width, p.showStats);
    const h = p.view === "3d" ? curH3 : curH2;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.round(w * dpr);
    const targetH = Math.round(h * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (p.cols === 0 || p.cells.length === 0) return;

    const e = clamp01(a.e);
    const maxBar = barHeight(p.maxCount, p.maxCount, p.heightScale);
    const cam = camera(
      w,
      h,
      p.cols,
      maxBar,
      e,
      a.yawOffset,
      a.elevOffset,
      cornerActive,
      curBigSize,
    );

    const activeLevelColors = p.levelColors;
    const shadeBase = p.theme.bg;
    const scratch = scratchRef.current;

    // Rótulos de meses visíveis no estado 2D (desaparecem suavemente no morph 3D)
    const monthAlpha = 1 - smoothstep(0, 0.45, e);
    if (monthAlpha > 0.01) {
      ctx.save();
      ctx.font = "500 10px var(--font-sans), Montserrat, system-ui, sans-serif";
      ctx.fillStyle = rgbCss(p.theme.fg, 0.58 * monthAlpha);
      ctx.textBaseline = "bottom";
      ctx.textAlign = "left";
      const monthPt: [number, number] = [0, 0];
      for (let mIdx = 0; mIdx < p.months.length; mIdx++) {
        const m = p.months[mIdx];
        const wx = m.col - (p.cols - 1) * 0.5 - DEFAULT_CELL_HALF;
        const wy = -3 - DEFAULT_CELL_HALF;
        projectInto(wx, wy, 0, cam, monthPt);
        ctx.fillText(m.label, monthPt[0], monthPt[1] - 5);
      }
      ctx.restore();
    }

    // Lista ordenada back-to-front via profundidade na câmera (buffers reutilizados)
    if (scratch.depths.length < p.cells.length) {
      scratch.depths = new Float64Array(p.cells.length);
    }
    const depths = scratch.depths;
    const sortedIndices = scratch.sortedIndices;
    sortedIndices.length = 0;

    for (let i = 0; i < p.cells.length; i++) {
      const c = p.cells[i];
      if (!c.inRange) continue;
      const wx = c.col - (p.cols - 1) * 0.5;
      const wy = c.row - 3;
      depths[i] = depthOf(wx, wy, 0, cam);
      sortedIndices.push(i);
    }
    sortedIndices.sort((ia, ib) => depths[ia] - depths[ib]);

    while (scratch.barPool.length < sortedIndices.length) {
      scratch.barPool.push(createBarScratch(p.cells[0]));
    }

    // Vetor direção da câmera para culling exato de faces laterais em qualquer ângulo de órbita
    const viewX = cam.sinY * cam.sinE;
    const viewY = cam.cosY * cam.sinE;

    const hitList = scratch.hitList;
    hitList.length = 0;
    let hasTooltipPos = false;
    let tooltipTipX = 0;
    let tooltipTipY = 0;

    const drawFlatRounded = e < 0.015;
    const focusMix = p.theme.isDark ? 0.24 : 0.14;
    const topHighlightMix = p.theme.isDark ? 0.07 : 0.03;

    for (let s = 0; s < sortedIndices.length; s++) {
      const idx = sortedIndices[s];
      const cell = p.cells[idx];
      const slot = scratch.barPool[s];
      const polys = slot.bar.polys;
      polys.length = 0;

      const wx = cell.col - (p.cols - 1) * 0.5;
      const wy = cell.row - 3;
      const rise = riseAt(cell.col, p.cols, e);
      const targetH = barHeight(cell.count, p.maxCount, p.heightScale);
      const barH = e <= 0 ? 0 : targetH * rise;

      const isFocused = p.activeIdx === idx;
      const matchesFilter =
        p.activeLevel === null || cell.level === p.activeLevel;
      const dimAlpha = matchesFilter ? 1 : 0.16;

      let baseColor = activeLevelColors[cell.level];
      if (isFocused) {
        baseColor = mixRGBInto(baseColor, WHITE_RGB, focusMix, scratch.focusColor);
      }

      const x0 = wx - DEFAULT_CELL_HALF;
      const x1 = wx + DEFAULT_CELL_HALF;
      const y0 = wy - DEFAULT_CELL_HALF;
      const y1 = wy + DEFAULT_CELL_HALF;

      if (drawFlatRounded) {
        projectInto(x0, y0, 0, cam, slot.t0);
        projectInto(x1, y1, 0, cam, slot.t2);
        const tlx = slot.t0[0];
        const tly = slot.t0[1];
        const brx = slot.t2[0];
        const bry = slot.t2[1];
        const cw = Math.max(2, brx - tlx);
        const ch = Math.max(2, bry - tly);
        drawRoundedRect(ctx, tlx, tly, cw, ch, Math.min(2.5, cw * 0.24));
        ctx.fillStyle = rgbCss(baseColor, dimAlpha);
        ctx.fill();

        if (isFocused) {
          ctx.strokeStyle = rgbCss(p.theme.fg, 0.95);
          ctx.lineWidth = 1.4;
          ctx.stroke();
        } else if (cell.level > 0 && matchesFilter) {
          ctx.strokeStyle = rgbCss(WHITE_RGB, 0.06);
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }

        slot.t1[0] = brx;
        slot.t1[1] = tly;
        slot.t3[0] = tlx;
        slot.t3[1] = bry;
        slot.topFace[0] = slot.t0;
        slot.topFace[1] = slot.t1;
        slot.topFace[2] = slot.t2;
        slot.topFace[3] = slot.t3;
        polys.push(slot.topFace);

        const tipX = tlx + cw * 0.5;
        const tipY = tly;
        slot.bar.cellIndex = idx;
        slot.bar.cell = cell;
        slot.bar.tipX = tipX;
        slot.bar.tipY = tipY;
        hitList.push(slot.bar);

        if (isFocused) {
          hasTooltipPos = true;
          tooltipTipX = tipX;
          tooltipTipY = tipY;
        }
        continue;
      }

      projectInto(x0, y0, 0, cam, slot.b0);
      projectInto(x1, y0, 0, cam, slot.b1);
      projectInto(x1, y1, 0, cam, slot.b2);
      projectInto(x0, y1, 0, cam, slot.b3);

      projectInto(x0, y0, barH, cam, slot.t0);
      projectInto(x1, y0, barH, cam, slot.t1);
      projectInto(x1, y1, barH, cam, slot.t2);
      projectInto(x0, y1, barH, cam, slot.t3);

      // Faces laterais visíveis (ordem correta pelo culling do vetor de visão)
      if (barH > 0.002) {
        if (viewY < 0) {
          slot.faceY[0] = slot.t0;
          slot.faceY[1] = slot.t1;
          slot.faceY[2] = slot.b1;
          slot.faceY[3] = slot.b0;
          drawPoly(ctx, slot.faceY);
          ctx.fillStyle = mixRgbCss(baseColor, shadeBase, 0.48, dimAlpha);
          ctx.fill();
          polys.push(slot.faceY);
        } else if (viewY > 0) {
          slot.faceY[0] = slot.t2;
          slot.faceY[1] = slot.t3;
          slot.faceY[2] = slot.b3;
          slot.faceY[3] = slot.b2;
          drawPoly(ctx, slot.faceY);
          ctx.fillStyle = mixRgbCss(baseColor, shadeBase, 0.44, dimAlpha);
          ctx.fill();
          polys.push(slot.faceY);
        }

        if (viewX > 0) {
          slot.faceX[0] = slot.t1;
          slot.faceX[1] = slot.t2;
          slot.faceX[2] = slot.b2;
          slot.faceX[3] = slot.b1;
          drawPoly(ctx, slot.faceX);
          ctx.fillStyle = mixRgbCss(baseColor, shadeBase, 0.28, dimAlpha);
          ctx.fill();
          polys.push(slot.faceX);
        } else if (viewX < 0) {
          slot.faceX[0] = slot.t3;
          slot.faceX[1] = slot.t0;
          slot.faceX[2] = slot.b0;
          slot.faceX[3] = slot.b3;
          drawPoly(ctx, slot.faceX);
          ctx.fillStyle = mixRgbCss(baseColor, shadeBase, 0.3, dimAlpha);
          ctx.fill();
          polys.push(slot.faceX);
        }
      }

      // Face superior
      slot.topFace[0] = slot.t0;
      slot.topFace[1] = slot.t1;
      slot.topFace[2] = slot.t2;
      slot.topFace[3] = slot.t3;
      drawPoly(ctx, slot.topFace);
      ctx.fillStyle =
        cell.level > 0
          ? mixRgbCss(baseColor, WHITE_RGB, topHighlightMix, dimAlpha)
          : rgbCss(baseColor, dimAlpha);
      ctx.fill();
      polys.push(slot.topFace);

      if (isFocused) {
        ctx.strokeStyle = rgbCss(p.theme.fg, 0.95);
        ctx.lineWidth = 1.4;
        ctx.stroke();
      } else if (cell.level > 0 && matchesFilter) {
        ctx.strokeStyle = rgbCss(WHITE_RGB, 0.14);
        ctx.lineWidth = 0.65;
        ctx.stroke();
      }

      projectInto(wx, wy, barH, cam, slot.tip);
      slot.bar.cellIndex = idx;
      slot.bar.cell = cell;
      slot.bar.tipX = slot.tip[0];
      slot.bar.tipY = slot.tip[1];
      hitList.push(slot.bar);

      if (isFocused) {
        hasTooltipPos = true;
        tooltipTipX = slot.tip[0];
        tooltipTipY = slot.tip[1];
      }
    }

    projectedRef.current = hitList;

    if (tooltipRef.current) {
      if (hasTooltipPos && p.activeIdx !== null) {
        updateTooltipDOM(tooltipTipX, tooltipTipY, w);
        tooltipRef.current.style.opacity = "1";
      } else {
        tooltipRef.current.style.opacity = "0";
      }
    }

    if (cornersRef.current) {
      const cornerAlpha = cornerActive ? smoothstep(0.32, 0.95, e) : 0;
      cornersRef.current.style.opacity = String(cornerAlpha);
    }
  }, [updateTooltipDOM]);

  const stopAnimation = useCallback(() => {
    if (animRef.current.rafId) {
      cancelAnimationFrame(animRef.current.rafId);
      animRef.current.rafId = 0;
    }
    animRef.current.animating = false;
    animRef.current.resettingOrbit = false;
  }, []);

  const stepAnimation = useCallback(
    function tick(now: number) {
      const a = animRef.current;
      const dur = Math.max(150, paramsRef.current.duration);
      let keepGoing = false;

      if (a.animating) {
        const rawT = clamp01((now - a.animStart) / dur);
        a.e = lerp(a.fromE, a.targetE, rawT);
        if (rawT >= 1) {
          a.e = a.targetE;
          a.animating = false;
        } else {
          keepGoing = true;
        }
      }

      if (a.resettingOrbit) {
        const rawO = clamp01((now - a.orbitStart) / 420);
        const easedO = easeOutCubic(rawO);
        a.yawOffset = lerp(a.orbitFromYaw, 0, easedO);
        a.elevOffset = lerp(a.orbitFromElev, 0, easedO);
        if (rawO >= 1) {
          a.yawOffset = 0;
          a.elevOffset = 0;
          a.resettingOrbit = false;
        } else {
          keepGoing = true;
        }
      }

      drawFrame();

      if (keepGoing) {
        a.rafId = requestAnimationFrame(tick);
      } else {
        a.rafId = 0;
      }
    },
    [drawFrame],
  );

  const startMorph = useCallback(
    (targetE: number) => {
      const a = animRef.current;
      if (paramsRef.current.reducedMotion) {
        stopAnimation();
        a.e = targetE;
        a.targetE = targetE;
        drawFrame();
        return;
      }
      if (Math.abs(a.e - targetE) < 0.001 && !a.animating) {
        drawFrame();
        return;
      }
      a.fromE = a.e;
      a.targetE = targetE;
      a.animStart = performance.now();
      a.animating = true;
      if (!a.rafId) {
        a.rafId = requestAnimationFrame(stepAnimation);
      }
    },
    [drawFrame, stepAnimation, stopAnimation],
  );

  // Sincroniza paramsRef e redesenha quando props/estados visuais mudam
  useEffect(() => {
    paramsRef.current = {
      cells,
      cols,
      maxCount,
      months,
      heightScale,
      duration,
      width,
      view,
      theme,
      palette,
      levelColors,
      showStats,
      activeIdx,
      activeLevel,
      reducedMotion,
      orbit,
    };
    drawFrame();
  }, [
    cells,
    cols,
    maxCount,
    months,
    heightScale,
    duration,
    width,
    view,
    theme,
    palette,
    levelColors,
    showStats,
    activeIdx,
    activeLevel,
    reducedMotion,
    orbit,
    drawFrame,
  ]);

  // Observa largura do container
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const nextW = Math.round(entry.contentRect.width);
      if (nextW > 0) {
        setHasMeasuredWidth(true);
        setWidth((prev) => (prev === nextW ? prev : nextW));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Resolve tema CSS via tokens semânticos de globals.css (`retheme`)
  useEffect(() => {
    const root = document.documentElement;
    const probeCanvas = document.createElement("canvas");
    probeCanvas.width = 1;
    probeCanvas.height = 1;

    const retheme = () => {
      const bodyBg = document.body
        ? parseCssColor(
            probeCanvas,
            getComputedStyle(document.body).backgroundColor,
          )
        : null;
      const rootBg = parseCssColor(
        probeCanvas,
        getComputedStyle(root).backgroundColor,
      );
      const bg = readCssColor(
        probeCanvas,
        root,
        ["--color-background", "--background"],
        bodyBg ?? rootBg ?? DEFAULT_THEME.bg,
      );
      const card = readCssColor(
        probeCanvas,
        root,
        ["--color-card", "--card"],
        DEFAULT_THEME.card,
      );
      const fg = readCssColor(
        probeCanvas,
        root,
        ["--color-foreground", "--foreground"],
        DEFAULT_THEME.fg,
      );
      const isDark = luminance(bg) < 0.5;
      setTheme((prev) => {
        if (
          prev.isDark === isDark &&
          prev.bg[0] === bg[0] &&
          prev.bg[1] === bg[1] &&
          prev.bg[2] === bg[2] &&
          prev.card[0] === card[0] &&
          prev.card[1] === card[1] &&
          prev.card[2] === card[2] &&
          prev.fg[0] === fg[0] &&
          prev.fg[1] === fg[1] &&
          prev.fg[2] === fg[2]
        ) {
          return prev;
        }
        return { bg, card, fg, isDark };
      });
    };

    const raf = requestAnimationFrame(retheme);
    const mo = new MutationObserver(retheme);
    mo.observe(root, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", retheme);

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      mql.removeEventListener("change", retheme);
    };
  }, []);

  // Gatilho automático ao entrar na viewport (`IntersectionObserver`, threshold 0.35)
  useEffect(() => {
    const target = containerRef.current;
    if (!target || !animate) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            setHasEntered(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: [0.35] },
    );
    io.observe(target);
    return () => io.disconnect();
  }, [animate]);

  // Orquestra estado alvo de morph (2D = 0, 3D = 1), adiando o morph inicial pós-Hero
  useEffect(() => {
    if (morphDelayTimerRef.current !== null) {
      window.clearTimeout(morphDelayTimerRef.current);
      morphDelayTimerRef.current = null;
    }

    const targetE =
      view === "3d" && (hasEntered || reducedMotion) && animate ? 1 : 0;

    if (reducedMotion) {
      startMorph(targetE);
      return;
    }

    if (targetE === 1 && !hasManuallyToggledRef.current) {
      morphDelayTimerRef.current = window.setTimeout(() => {
        morphDelayTimerRef.current = null;
        startMorph(1);
      }, 350);
      return () => {
        if (morphDelayTimerRef.current !== null) {
          window.clearTimeout(morphDelayTimerRef.current);
          morphDelayTimerRef.current = null;
        }
      };
    }

    if (
      targetE === 0 &&
      Math.abs(animRef.current.e) < 0.001 &&
      !animRef.current.animating
    ) {
      return;
    }

    startMorph(targetE);
  }, [view, hasEntered, reducedMotion, animate, startMorph]);

  useEffect(() => {
    return () => {
      stopAnimation();
      if (modeSwitchTimerRef.current !== null) {
        window.clearTimeout(modeSwitchTimerRef.current);
        modeSwitchTimerRef.current = null;
      }
      if (morphDelayTimerRef.current !== null) {
        window.clearTimeout(morphDelayTimerRef.current);
        morphDelayTimerRef.current = null;
      }
    };
  }, [stopAnimation]);

  const hitTest = useCallback((mx: number, my: number): number | null => {
    const bars = projectedRef.current;
    // Percorre de frente para trás para respeitar oclusão 3D
    for (let i = bars.length - 1; i >= 0; i--) {
      const bar = bars[i];
      for (const poly of bar.polys) {
        if (pointInPoly(mx, my, poly)) {
          return bar.cellIndex;
        }
      }
    }
    return null;
  }, []);

  const handleViewChange = useCallback(
    (nextView: ContributionSkylineView) => {
      hasManuallyToggledRef.current = true;
      if (nextView !== view) {
        if (modeSwitchTimerRef.current !== null) {
          window.clearTimeout(modeSwitchTimerRef.current);
        }
        setIsModeSwitching(true);
        modeSwitchTimerRef.current = window.setTimeout(() => {
          setIsModeSwitching(false);
          modeSwitchTimerRef.current = null;
        }, 350);
      }
      setHasEntered(true);
      setView(nextView);
    },
    [view],
  );

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLCanvasElement>) => {
      if (e.button !== 0) return;
      const d = dragRef.current;
      d.active = true;
      d.moved = false;
      d.pointerId = e.pointerId;
      d.startX = e.clientX;
      d.startY = e.clientY;
      d.baseYaw = animRef.current.yawOffset;
      d.baseElev = animRef.current.elevOffset;
      animRef.current.resettingOrbit = false;
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const d = dragRef.current;
      if (d.active && view === "3d" && orbit) {
        const dx = e.clientX - d.startX;
        const dy = e.clientY - d.startY;
        if (d.moved || Math.hypot(dx, dy) > 4) {
          d.moved = true;
          const nextYaw = Math.max(
            YAW_RANGE[0],
            Math.min(YAW_RANGE[1], d.baseYaw + dx * 0.0055),
          );
          const nextElev = Math.max(
            ELEV_RANGE[0],
            Math.min(ELEV_RANGE[1], d.baseElev + dy * 0.0045),
          );
          animRef.current.yawOffset = nextYaw;
          animRef.current.elevOffset = nextElev;
          if (!animRef.current.rafId) {
            drawFrame();
          }
          return;
        }
      }

      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const hit = hitTest(mx, my);
      if (hit !== activeIdx && pinnedIdx === null) {
        setActiveIdx(hit);
      } else if (hit !== null && pinnedIdx === null) {
        const match = projectedRef.current.find((b) => b.cellIndex === hit);
        if (match) {
          updateTooltipDOM(match.tipX, match.tipY, width);
        }
      }
    },
    [
      view,
      orbit,
      hitTest,
      activeIdx,
      pinnedIdx,
      drawFrame,
      updateTooltipDOM,
      width,
    ],
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent<HTMLCanvasElement>) => {
      const d = dragRef.current;
      const wasMoved = d.moved;
      if (d.active) {
        d.active = false;
        d.moved = false;
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      }
      if (!wasMoved) {
        const rect = e.currentTarget.getBoundingClientRect();
        const hit = hitTest(e.clientX - rect.left, e.clientY - rect.top);
        if (hit !== null) {
          setPinnedIdx((prev) => (prev === hit ? null : hit));
          setActiveIdx(hit);
        } else {
          setPinnedIdx(null);
          setActiveIdx(null);
        }
      }
    },
    [hitTest],
  );

  const handlePointerLeave = useCallback(() => {
    if (dragRef.current.active) return;
    if (pinnedIdx !== null) {
      setActiveIdx(pinnedIdx);
    } else {
      setActiveIdx(null);
    }
  }, [pinnedIdx]);

  const handleDoubleClick = useCallback(() => {
    if (view !== "3d" || !orbit) return;
    const a = animRef.current;
    if (reducedMotion) {
      a.yawOffset = 0;
      a.elevOffset = 0;
      a.resettingOrbit = false;
      drawFrame();
      return;
    }
    a.orbitFromYaw = a.yawOffset;
    a.orbitFromElev = a.elevOffset;
    a.orbitStart = performance.now();
    a.resettingOrbit = true;
    if (!a.rafId) {
      a.rafId = requestAnimationFrame(stepAnimation);
    }
  }, [view, orbit, reducedMotion, drawFrame, stepAnimation]);

  const findNextInRange = useCallback(
    (startIdx: number, dCol: number, dRow: number): number => {
      const current = cells[startIdx];
      if (!current) {
        return cells.findIndex((c) => c.inRange);
      }
      let nextCol = current.col + dCol;
      let nextRow = current.row + dRow;

      if (dRow !== 0) {
        while (nextRow >= 0 && nextRow < 7) {
          const candidate = cells[nextCol * 7 + nextRow];
          if (candidate && candidate.inRange) return nextCol * 7 + nextRow;
          nextRow += dRow;
        }
        return startIdx;
      }

      if (dCol !== 0) {
        while (nextCol >= 0 && nextCol < cols) {
          const direct = cells[nextCol * 7 + nextRow];
          if (direct && direct.inRange) return nextCol * 7 + nextRow;
          // Ajusta para o dia válido mais próximo na primeira/última coluna incompleta
          for (let offset = 1; offset < 7; offset++) {
            const up = nextRow - offset;
            if (up >= 0 && cells[nextCol * 7 + up]?.inRange) {
              return nextCol * 7 + up;
            }
            const down = nextRow + offset;
            if (down < 7 && cells[nextCol * 7 + down]?.inRange) {
              return nextCol * 7 + down;
            }
          }
          nextCol += dCol;
        }
      }
      return startIdx;
    },
    [cells, cols],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLCanvasElement>) => {
      const firstValid = cells.findIndex((c) => c.inRange);
      if (firstValid < 0) return;

      let lastValid = cells.length - 1;
      while (lastValid >= 0 && !cells[lastValid].inRange) lastValid--;

      const cur = activeIdx ?? pinnedIdx ?? firstValid;
      let next = cur;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          next = activeIdx === null ? lastValid : findNextInRange(cur, -1, 0);
          break;
        case "ArrowRight":
          e.preventDefault();
          next = activeIdx === null ? firstValid : findNextInRange(cur, 1, 0);
          break;
        case "ArrowUp":
          e.preventDefault();
          next = activeIdx === null ? firstValid : findNextInRange(cur, 0, -1);
          break;
        case "ArrowDown":
          e.preventDefault();
          next = activeIdx === null ? firstValid : findNextInRange(cur, 0, 1);
          break;
        case "Home":
          e.preventDefault();
          next = firstValid;
          break;
        case "End":
          e.preventDefault();
          next = lastValid;
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (activeIdx !== null) {
            setPinnedIdx((prev) => (prev === activeIdx ? null : activeIdx));
          } else {
            setActiveIdx(firstValid);
            setPinnedIdx(firstValid);
          }
          return;
        case "Escape":
          e.preventDefault();
          setPinnedIdx(null);
          setActiveIdx(null);
          setLockedLevel(null);
          return;
        default:
          return;
      }

      setPinnedIdx(null);
      setActiveIdx(next);
    },
    [cells, activeIdx, pinnedIdx, findNextInRange],
  );

  const activeCell = activeIdx !== null ? cells[activeIdx] : undefined;
  const statItems = useMemo(
    () => [
      {
        id: "total",
        label: "Total no ano",
        value: nf.format(stats.total),
        sub: `${nf.format(stats.activeDays)} ${dayWord(stats.activeDays)} ativos`,
        align: "left" as const,
        pos: "top-2.5 left-3.5",
      },
      {
        id: "busiest",
        label: "Dia mais ativo",
        value: stats.busiest ? nf.format(stats.busiest.count) : "0",
        sub: stats.busiest ? formatShortDate(stats.busiest.date) : "sem registros",
        align: "right" as const,
        pos: "top-2.5 right-3.5",
      },
      {
        id: "longest",
        label: "Maior sequência",
        value: `${nf.format(stats.longestStreak.length)} ${dayWord(stats.longestStreak.length)}`,
        sub: formatRange(stats.longestStreak),
        align: "left" as const,
        pos: "bottom-2.5 left-3.5",
      },
      {
        id: "current",
        label: "Sequência atual",
        value: `${nf.format(stats.currentStreak.length)} ${dayWord(stats.currentStreak.length)}`,
        sub: stats.currentStreak.length > 0 ? "ativa" : "inativa",
        highlight: stats.currentStreak.length > 0,
        align: "right" as const,
        pos: "bottom-2.5 right-3.5",
      },
    ],
    [nf, stats, dayWord, formatShortDate, formatRange],
  );

  const canvasAriaLabel = useMemo(() => {
    const owner = username ? ` de ${username}` : "";
    const streakInfo = showStats
      ? ` Maior sequência de ${stats.longestStreak.length} ${dayWord(stats.longestStreak.length)}.`
      : "";
    return `Mapa de contribuições${owner}: ${nf.format(stats.total)} ${noun(stats.total)} no último ano.${streakInfo} Use as setas do teclado para navegar pelos dias.`;
  }, [username, showStats, nf, stats.total, stats.longestStreak.length, noun, dayWord]);

  const isCompactGrid = width < 480;
  const defaultFooter =
    view === "3d" && orbit
      ? "Arraste para girar · duplo clique para resetar"
      : "Passe o mouse para detalhes · setas para navegar";
  const resolvedFooter = footer === undefined ? defaultFooter : footer;
  const hasFooter =
    resolvedFooter !== null &&
    resolvedFooter !== false &&
    resolvedFooter !== "";
  const isMinimal = !showStats && !showLegend && !hasFooter;

  return (
    <section
      ref={containerRef}
      aria-label="Contribuições no GitHub"
      style={{ containerType: "inline-size" }}
      className={cn(
        "border-0 bg-transparent p-0 font-sans text-foreground",
        className,
      )}
    >
      {/* Cabeçalho */}
      <div
        className={cn(
          "flex items-center justify-between gap-2.5",
          isMinimal ? "mb-1.5" : "mb-2.5",
        )}
      >
        <div className="min-w-0 text-xs leading-snug text-muted-foreground">
          {title ?? (
            <p className="truncate">
              <span className="font-semibold text-foreground tabular-nums">
                {nf.format(stats.total)}
              </span>{" "}
              {noun(stats.total)} no último ano
            </p>
          )}
        </div>

        {showToggle && (
          <div
            role="group"
            aria-label="Alternar visualização"
            className="inline-flex shrink-0 items-center rounded-lg border border-white/10 bg-transparent p-0.5"
          >
            <button
              type="button"
              onClick={() => handleViewChange("2d")}
              aria-label="Mapa 2D"
              title="Mapa 2D"
              aria-pressed={view === "2d"}
              className={cn(
                "inline-flex min-h-[36px] min-w-[36px] items-center justify-center gap-1 rounded-md px-2 text-[11px] font-medium transition-colors sm:min-h-[26px] sm:min-w-[26px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                view === "2d"
                  ? "bg-brand text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="size-3.5" aria-hidden="true" />
              <span>2D</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewChange("3d")}
              aria-label="Skyline 3D"
              title="Skyline 3D"
              aria-pressed={view === "3d"}
              className={cn(
                "inline-flex min-h-[36px] min-w-[36px] items-center justify-center gap-1 rounded-md px-2 text-[11px] font-medium transition-colors sm:min-h-[26px] sm:min-w-[26px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                view === "3d"
                  ? "bg-brand text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Box className="size-3.5" aria-hidden="true" />
              <span>3D</span>
            </button>
          </div>
        )}
      </div>

      {/* Palco do Canvas 2D/3D */}
      <div
        ref={stageRef}
        className="relative overflow-visible"
        style={{
          height: stageHeight,
          transition:
            !reducedMotion && isModeSwitching
              ? "height 320ms cubic-bezier(0.16, 1, 0.3, 1)"
              : undefined,
        }}
      >
        <canvas
          ref={canvasRef}
          tabIndex={0}
          role="img"
          aria-roledescription="gráfico interativo de contribuições"
          aria-label={canvasAriaLabel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onDoubleClick={handleDoubleClick}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (pinnedIdx === null) setActiveIdx(null);
          }}
          className={cn(
            "block h-full w-full select-none rounded-xl touch-pan-y",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
            view === "3d" && orbit
              ? "cursor-grab active:cursor-grabbing"
              : "cursor-crosshair",
          )}
        />

        {/* Stats nos 4 cantos em 3D (>= 500px) */}
        {showStats && isCornerLayout && view === "3d" && (
          <div
            ref={cornersRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ opacity: reducedMotion ? 1 : 0 }}
          >
            {statItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "absolute max-w-[44%] select-none",
                  item.pos,
                  item.align === "right" ? "text-right" : "text-left",
                )}
              >
                <div className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                  {item.label}
                </div>
                <div
                  className="mt-0.5 whitespace-nowrap font-display font-medium leading-none tracking-[-0.03em] text-foreground tabular-nums"
                  style={{ fontSize: `${bigSize}px` }}
                >
                  {item.value}
                </div>
                <div
                  className={cn(
                    "mt-0.5 inline-flex items-center gap-1.5 text-[10px] leading-tight text-muted-foreground",
                    item.align === "right" && "justify-end",
                  )}
                >
                  {item.highlight && (
                    <span
                      className="size-1.5 rounded-full bg-brand-bright"
                      aria-hidden="true"
                    />
                  )}
                  <span>{item.sub}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tooltip flutuante */}
        <div
          ref={tooltipRef}
          aria-hidden="true"
          style={{ opacity: 0 }}
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-border bg-popover/95 px-2.5 py-1.5 text-[11px] leading-tight text-popover-foreground shadow-lg backdrop-blur-md transition-opacity duration-150"
        >
          {activeCell && activeCell.inRange ? (
            activeCell.count > 0 ? (
              <>
                <span className="font-semibold text-foreground tabular-nums">
                  {nf.format(activeCell.count)}
                </span>{" "}
                {noun(activeCell.count)} em{" "}
                <span className="text-muted-foreground">
                  {formatDate(activeCell.date)}
                </span>
              </>
            ) : (
              <>
                Nenhuma {unit} em{" "}
                <span className="text-muted-foreground">
                  {formatDate(activeCell.date)}
                </span>
              </>
            )
          ) : null}
        </div>
      </div>

      {/* Região acessível para leitores de tela (navegação por teclado) */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {describe(activeIdx)}
      </div>

      {/* Stats em grade compacta para 2D ou telas estreitas (< 500px), + semântica acessível */}
      {showStats && (
        <dl
          className={cn(
            "mt-2 grid gap-x-4 gap-y-1.5 border-t border-border/60 pt-2",
            isCompactGrid ? "grid-cols-2" : "grid-cols-4",
            isCornerLayout && view === "3d" && "sr-only",
          )}
        >
          {statItems.map((item) => (
            <div key={item.id} className="min-w-0">
              <dt className="truncate text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                {item.label}
              </dt>
              <dd
                className={cn(
                  "mt-0.5 font-display font-medium leading-none tracking-[-0.02em] text-foreground tabular-nums",
                  isCompactGrid ? "text-base" : "text-lg",
                )}
              >
                {item.value}
              </dd>
              <dd className="mt-0.5 flex items-center gap-1 truncate text-[10px] leading-tight text-muted-foreground">
                {item.highlight && (
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-brand-bright"
                    aria-hidden="true"
                  />
                )}
                <span className="truncate">{item.sub}</span>
              </dd>
            </div>
          ))}
        </dl>
      )}

      {/* Rodapé: Dica de interação opcional + Legenda */}
      {(hasFooter || showLegend) && (
        <div
          className={cn(
            "mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground",
            hasFooter ? "justify-between" : "justify-end",
          )}
        >
          {hasFooter &&
            (typeof resolvedFooter === "string" ||
            typeof resolvedFooter === "number" ? (
              <p className="truncate">{resolvedFooter}</p>
            ) : (
              resolvedFooter
            ))}

          {showLegend && (
            <div
              role="group"
              aria-label="Legenda de intensidade"
              className={cn(
                "flex items-center gap-1.5",
                hasFooter && "ml-auto",
              )}
            >
              <span>Menos</span>
              <div className="flex items-center gap-1">
                {([0, 1, 2, 3, 4] as const).map((lvl) => {
                  const label = levelLabels[lvl];
                  const isActive = activeLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      aria-label={`Filtrar nível: ${label}`}
                      title={label}
                      aria-pressed={isActive}
                      onMouseEnter={() => setHoverLevel(lvl)}
                      onMouseLeave={() => setHoverLevel(null)}
                      onClick={() =>
                        setLockedLevel((prev) => (prev === lvl ? null : lvl))
                      }
                      className={cn(
                        "relative size-3 rounded-[3px] border transition-transform duration-150",
                        "before:absolute before:-inset-2 before:content-['']",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                        isActive
                          ? "scale-125 border-foreground"
                          : "border-white/10 hover:scale-110",
                      )}
                      style={{ backgroundColor: swatchColors[lvl] }}
                    />
                  );
                })}
              </div>
              <span>Mais</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default ContributionSkyline;
