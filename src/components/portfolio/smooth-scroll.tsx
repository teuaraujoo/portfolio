"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis, { type ScrollToOptions } from "lenis";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type ScrollTarget = string | number | HTMLElement;

export interface StopScrollOptions {
  /** Opcionalmente aplica `overflow: hidden` no `<html>` (desabilitado por padrão para evitar flicker da scrollbar). */
  lockOverflow?: boolean;
}

export interface SmoothScrollContextValue {
  lenis: Lenis | null;
  scrollTo: (target: ScrollTarget, options?: ScrollToOptions) => void;
  stop: (options?: StopScrollOptions) => void;
  start: () => void;
}

const LENIS_DURATION = 1.2;
const lenisEasing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

function normalizeAnchorTarget(target: ScrollTarget): ScrollTarget {
  if (target === "#hero" || target === "#") {
    return 0;
  }
  return target;
}

function nativeScrollTo(target: ScrollTarget, options?: ScrollToOptions) {
  if (typeof window === "undefined") return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior: ScrollBehavior = options?.immediate || prefersReduced ? "auto" : "smooth";
  const offset = options?.offset ?? 0;
  const normalized = normalizeAnchorTarget(target);

  if (typeof normalized === "number") {
    window.scrollTo({ top: Math.max(0, normalized + offset), behavior });
    return;
  }

  const element =
    typeof normalized === "string" ? document.querySelector<HTMLElement>(normalized) : normalized;

  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top: Math.max(0, top), behavior });
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  scrollTo: nativeScrollTo,
  stop: () => {},
  start: () => {},
});

export interface SmoothScrollProviderProps {
  children: ReactNode;
}

/**
 * Provides a shared Lenis smooth-scroll instance synchronized with GSAP ScrollTrigger.
 * Disables smoothing automatically when `prefers-reduced-motion: reduce` is active.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const isStoppedRef = useRef(false);
  const lockedOverflowRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cleanupCurrent: (() => void) | null = null;
    let disposed = false;

    const setup = () => {
      cleanupCurrent?.();
      cleanupCurrent = null;

      if (disposed || mediaQuery.matches) {
        lenisRef.current = null;
        queueMicrotask(() => {
          if (!disposed) setLenis(null);
        });
        return;
      }

      const instance = new Lenis({
        duration: LENIS_DURATION,
        easing: lenisEasing,
      });

      const handleScroll = () => {
        ScrollTrigger.update();
      };

      const handleTick = (time: number) => {
        instance.raf(time * 1000);
      };

      instance.on("scroll", handleScroll);
      gsap.ticker.add(handleTick);
      gsap.ticker.lagSmoothing(0);

      if (isStoppedRef.current) {
        instance.stop();
      }

      lenisRef.current = instance;
      queueMicrotask(() => {
        if (!disposed) setLenis(instance);
      });

      cleanupCurrent = () => {
        gsap.ticker.remove(handleTick);
        instance.off("scroll", handleScroll);
        instance.destroy();
        if (lenisRef.current === instance) {
          lenisRef.current = null;
        }
      };
    };

    setup();
    mediaQuery.addEventListener("change", setup);

    return () => {
      disposed = true;
      mediaQuery.removeEventListener("change", setup);
      cleanupCurrent?.();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  const stop = useCallback((options?: StopScrollOptions) => {
    isStoppedRef.current = true;
    if (options?.lockOverflow) {
      lockedOverflowRef.current = true;
      document.documentElement.style.overflow = "hidden";
    }
    lenisRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    isStoppedRef.current = false;
    if (lockedOverflowRef.current) {
      lockedOverflowRef.current = false;
      document.documentElement.style.overflow = "";
    }
    lenisRef.current?.start();
  }, []);

  const scrollTo = useCallback((target: ScrollTarget, options?: ScrollToOptions) => {
    const normalized = normalizeAnchorTarget(target);
    const instance = lenisRef.current;

    if (!instance) {
      nativeScrollTo(normalized, options);
      return;
    }

    if (typeof normalized === "string" && !document.querySelector(normalized)) {
      return;
    }

    instance.scrollTo(normalized, options);
  }, []);

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      const normalized = normalizeAnchorTarget(href);
      if (typeof normalized === "string" && !document.querySelector(normalized)) {
        return;
      }

      event.preventDefault();
      scrollTo(normalized);
    };

    document.addEventListener("click", handleAnchorClick);
    return () => {
      document.removeEventListener("click", handleAnchorClick);
    };
  }, [scrollTo]);

  const value = useMemo<SmoothScrollContextValue>(
    () => ({ lenis, scrollTo, stop, start }),
    [lenis, scrollTo, stop, start],
  );

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}

/**
 * Accesses the smooth-scroll controller (`lenis`, `scrollTo`, `stop`, `start`).
 */
export function useSmoothScroll(): SmoothScrollContextValue {
  return useContext(SmoothScrollContext);
}
