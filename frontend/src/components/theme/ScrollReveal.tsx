"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Site-wide scroll reveal. Elements marked `data-reveal` (or the children of
 * `data-reveal-stagger`) fade up once as they enter the viewport.
 * The hiding CSS only applies after this runs, and never with reduced motion.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      root.classList.remove("am-reveal-ready");
      return;
    }

    let disposed = false;
    let frame = 0;
    let initFrame = 0;
    let initTimer = 0;

    const reveal = (element: Element) => {
      element.classList.add("is-in");
      observer.unobserve(element);
      // entrance done: switch to normal hover timing (see globals.css)
      window.setTimeout(() => element.classList.add("is-done"), 1300);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    const scan = () =>
      document
        .querySelectorAll("[data-reveal]:not(.is-in), [data-reveal-stagger]:not(.is-in)")
        .forEach((element) => observer.observe(element));

    // Fail-safe for fast flings/jumps (End key, anchor links): anything already
    // scrolled past is revealed too, so no content can stay hidden above the fold.
    const sweep = () => {
      frame = 0;
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in), [data-reveal-stagger]:not(.is-in)")
        .forEach((element) => {
          if (element.getBoundingClientRect().top < window.innerHeight * 0.92) {
            reveal(element);
          }
        });
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(sweep);
    };

    // Client-rendered sections (API data) appear later; pick them up too.
    const mutations = new MutationObserver(scan);

    const start = () => {
      if (disposed) return;

      window.addEventListener("scroll", onScroll, { passive: true });
      root.classList.add("am-reveal-ready");
      scan();
      sweep();
      mutations.observe(document.body, { childList: true, subtree: true });
    };

    // Defer DOM mutations until after the initial hydration pass has had a turn.
    initTimer = window.setTimeout(() => {
      initFrame = window.requestAnimationFrame(start);
    }, 0);

    return () => {
      disposed = true;
      window.clearTimeout(initTimer);
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      if (initFrame) window.cancelAnimationFrame(initFrame);
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}