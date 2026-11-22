"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import type { HeaderContent, NavItem } from "@/data/home";
import { cn } from "@/lib/utils";
import { useSmoothScroll } from "./smooth-scroll";

export interface HeaderProps {
  content: HeaderContent;
}

const MANUAL_SCROLL_LOCK_MS = 1000;
const DESKTOP_BREAKPOINT_PX = 1024;

/**
 * Floating centered glass dock navbar housing the brand mark, sliding-pill
 * section links, primary CTA, and accessible mobile/tablet drawer trigger.
 */
export function Header({ content }: HeaderProps) {
  const [activeId, setActiveId] = useState<string>(() => content.items[0]?.id ?? "inicio");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const hasPositionedRef = useRef(false);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const manualLockUntilRef = useRef(0);
  const { scrollTo, stop, start } = useSmoothScroll();

  const updateIndicator = useCallback(() => {
    const indicator = indicatorRef.current;
    const activeEl = linkRefs.current.get(activeId);

    if (!indicator) return;

    if (!activeEl || activeEl.offsetWidth === 0) {
      indicator.style.opacity = "0";
      return;
    }

    if (!hasPositionedRef.current) {
      indicator.style.transition = "none";
      indicator.style.opacity = "1";
      indicator.style.width = `${activeEl.offsetWidth}px`;
      indicator.style.translate = `${activeEl.offsetLeft}px 0`;
      void indicator.offsetWidth;
      indicator.style.transition = "";
      hasPositionedRef.current = true;
      return;
    }

    indicator.style.opacity = "1";
    indicator.style.width = `${activeEl.offsetWidth}px`;
    indicator.style.translate = `${activeEl.offsetLeft}px 0`;
  }, [activeId]);

  useLayoutEffect(() => {
    updateIndicator();

    window.addEventListener("resize", updateIndicator, { passive: true });

    const navEl = navRef.current;
    const observer =
      typeof ResizeObserver !== "undefined" && navEl
        ? new ResizeObserver(updateIndicator)
        : null;
    if (observer && navEl) {
      observer.observe(navEl);
    }

    let cancelled = false;
    if (typeof document !== "undefined" && document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        if (!cancelled) updateIndicator();
      });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("resize", updateIndicator);
      observer?.disconnect();
    };
  }, [updateIndicator, content.items]);

  useEffect(() => {
    let rafId = 0;

    const updateActiveSection = () => {
      if (performance.now() < manualLockUntilRef.current) {
        return;
      }

      const anchorItems = content.items.filter((item) => item.href.startsWith("#"));
      if (anchorItems.length === 0) return;

      const scrollY = window.scrollY;
      if (scrollY <= 40) {
        setActiveId(anchorItems[0].id);
        return;
      }

      const sections = anchorItems
        .map((item) => ({
          id: item.id,
          el: document.getElementById(item.href.slice(1)),
        }))
        .filter((entry): entry is { id: string; el: HTMLElement } => entry.el !== null);

      if (sections.length === 0) return;

      const nearBottom =
        window.innerHeight + scrollY >= document.documentElement.scrollHeight - 24;
      if (nearBottom) {
        setActiveId(sections[sections.length - 1].id);
        return;
      }

      const triggerLine = window.innerHeight * 0.42;
      let currentId = sections[0].id;

      for (const section of sections) {
        if (section.el.getBoundingClientRect().top <= triggerLine) {
          currentId = section.id;
        }
      }

      setActiveId(currentId);
    };

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveSection);
    };

    rafId = requestAnimationFrame(updateActiveSection);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [content.items]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    stop();
    document.documentElement.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= DESKTOP_BREAKPOINT_PX) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      document.documentElement.style.overflow = "";
      start();
    };
  }, [mobileMenuOpen, start, stop]);

  const navigateToHref = useCallback(
    (
      event: MouseEvent<HTMLAnchorElement>,
      href: string,
      nextActiveId?: string,
      fromMobileMenu = false,
    ) => {
      if (fromMobileMenu) {
        setMobileMenuOpen(false);
        document.documentElement.style.overflow = "";
        start();
      }

      if (nextActiveId) {
        setActiveId(nextActiveId);
      } else {
        const matched = content.items.find((item) => item.href === href);
        if (matched) setActiveId(matched.id);
      }

      if (href.startsWith("#")) {
        event.preventDefault();
        manualLockUntilRef.current = performance.now() + MANUAL_SCROLL_LOCK_MS;
        scrollTo(href, {
          onComplete: () => {
            manualLockUntilRef.current = 0;
          },
        });
      }
    },
    [content.items, scrollTo, start],
  );

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    item: NavItem,
    fromMobileMenu = false,
  ) => {
    navigateToHref(event, item.href, item.id, fromMobileMenu);
  };

  const ctaIsExternal = Boolean(content.cta.external);

  return (
    <>
      <header
        id="navbar"
        className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4"
      >
        <div className="pointer-events-auto relative flex w-max max-w-full items-center gap-1 rounded-(--dock-radius) border border-white/25 bg-linear-to-b from-white/18 to-white/6 p-(--dock-pad) shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_12px_40px_-12px_rgb(0_0_0/0.5)] backdrop-blur-xl backdrop-saturate-150 [--dock-radius:14px] [--dock-pad:6px] [--dock-inner-radius:max(4px,calc(var(--dock-radius)_-_var(--dock-pad)))]">
          <a
            href={content.brandHref}
            onClick={(event) => navigateToHref(event, content.brandHref, content.items[0]?.id)}
            className="nav-brand group/brand flex h-10 shrink-0 items-center rounded-(--dock-inner-radius) px-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:px-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.brandLogoPath}
              alt={content.brandName}
              width={268}
              height={239}
              className="h-5 w-auto shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/brand:-rotate-12 group-hover/brand:scale-110 group-focus-visible/brand:-rotate-12 group-focus-visible/brand:scale-110 motion-reduce:transition-none sm:h-6"
            />
          </a>

          <span
            aria-hidden="true"
            className="mx-1 hidden h-5 w-px shrink-0 bg-white/15 lg:block"
          />

          <nav
            ref={navRef}
            aria-label="Navegação principal"
            className="relative hidden items-center gap-1 lg:flex"
          >
            <span
              ref={indicatorRef}
              aria-hidden="true"
              className="pointer-events-none absolute top-0 bottom-0 left-0 rounded-(--dock-inner-radius) bg-white/18 opacity-0 shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] transition-[translate,width,opacity] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
            />
            {content.items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  ref={(el) => {
                    if (el) {
                      linkRefs.current.set(item.id, el);
                    } else {
                      linkRefs.current.delete(item.id);
                    }
                  }}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={(event) => handleNavClick(event, item)}
                  className={cn(
                    "relative z-10 flex h-10 items-center gap-2 rounded-(--dock-inner-radius) px-3 font-sans text-[0.95rem] font-semibold tracking-[-0.01em] whitespace-nowrap outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-white/70 xl:px-4",
                    isActive ? "text-white" : "text-white/75 hover:text-white",
                  )}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <a
            href={content.cta.href}
            target={ctaIsExternal ? "_blank" : undefined}
            rel={ctaIsExternal ? "noopener noreferrer" : undefined}
            onClick={(event) => navigateToHref(event, content.cta.href)}
            className="group ml-1 hidden h-10 shrink-0 items-center gap-1.5 rounded-(--dock-inner-radius) bg-brand px-3.5 font-sans text-sm font-bold tracking-[-0.01em] whitespace-nowrap text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] transition-[filter] duration-300 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 min-[420px]:flex sm:px-4 lg:text-[0.95rem]"
          >
            <span>{content.cta.label}</span>
            <ArrowUpRight
              strokeWidth={2.5}
              className="size-4 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </a>

          <button
            ref={menuButtonRef}
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="ml-1 flex h-10 min-w-[44px] shrink-0 items-center justify-center gap-1.5 rounded-(--dock-inner-radius) bg-white/12 px-3 font-sans text-xs font-semibold text-white transition-colors duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:text-sm lg:hidden"
          >
            <Menu className="size-4 shrink-0" aria-hidden="true" />
            <span>Menu</span>
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
          className="mobile-menu fixed inset-0 z-[60] flex h-svh flex-col justify-between bg-background px-[clamp(20px,4vw,56px)] py-4 text-foreground animate-in fade-in duration-200 lg:hidden"
        >
          <div className="flex items-center justify-between">
            <a
              href={content.brandHref}
              onClick={(event) =>
                navigateToHref(event, content.brandHref, content.items[0]?.id, true)
              }
              className="group/brand inline-flex items-center rounded-[8px] px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.brandLogoPath}
                alt={content.brandName}
                width={268}
                height={239}
                className="h-6 w-auto shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/brand:-rotate-12 group-hover/brand:scale-110 group-focus-visible/brand:-rotate-12 group-focus-visible/brand:scale-110 motion-reduce:transition-none sm:h-7"
              />
            </a>

            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Fechar menu de navegação"
              onClick={() => {
                setMobileMenuOpen(false);
                menuButtonRef.current?.focus();
              }}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[14px] border border-white/25 bg-linear-to-b from-white/18 to-white/6 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35)] backdrop-blur-xl backdrop-saturate-150 transition-colors duration-200 hover:from-white/24 hover:to-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Links de navegação mobile" className="my-auto flex flex-col gap-2">
            {content.items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={(event) => handleNavClick(event, item, true)}
                  className={cn(
                    "inline-flex min-h-[48px] items-center justify-between rounded-[14px] px-3 py-2 font-display text-[clamp(2rem,8vw,3rem)] font-medium leading-[1.08] tracking-[-0.04em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "bg-white/[0.06] text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="size-2 rounded-full bg-brand-bright" aria-hidden="true" />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="pb-2">
            <a
              href={content.cta.href}
              target={ctaIsExternal ? "_blank" : undefined}
              rel={ctaIsExternal ? "noopener noreferrer" : undefined}
              onClick={(event) => navigateToHref(event, content.cta.href, undefined, true)}
              className="group flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[14px] bg-brand px-5 py-3 font-sans text-base font-bold tracking-[-0.01em] text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_8px_24px_-8px_rgba(72,17,237,0.65)] transition-[filter] duration-300 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>{content.cta.label}</span>
              <ArrowUpRight
                strokeWidth={2.5}
                className="size-4 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
