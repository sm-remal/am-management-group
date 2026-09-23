"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    let frameId = 0;

    const handleScroll = () => {
      if (frameId) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        const nextIsVisible = window.scrollY > 300;

        if (isVisibleRef.current !== nextIsVisible) {
          isVisibleRef.current = nextIsVisible;
          setIsVisible(nextIsVisible);
        }
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleScrollToTop}
      aria-label="Go to top"
      title="Go to top"
      className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center cursor-pointer rounded-md bg-[var(--am-harbour)] text-white shadow-lg ring-2 ring-secondary transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent/50 ${
        isVisible
          ? "pointer-events-auto scale-100 opacity-100"
          : "pointer-events-none scale-0 opacity-0"
      }`}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
};

export default ScrollToTopButton;
