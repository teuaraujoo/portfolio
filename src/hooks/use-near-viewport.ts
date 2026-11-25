"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Defers below-the-fold initialization until the target element approaches
 * the viewport (`rootMargin`), unlocking reduced-motion or unsupported environments immediately.
 */
export function useNearViewport(
  ref: RefObject<Element | null>,
  rootMargin = "650px 0px",
): boolean {
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    if (isNear || typeof window === "undefined") return;

    if (
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      const frameId = requestAnimationFrame(() => setIsNear(true));
      return () => cancelAnimationFrame(frameId);
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isNear, ref, rootMargin]);

  return isNear;
}
