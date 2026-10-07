"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useScrollReveal
 *
 * Observes an element via IntersectionObserver and returns `isVisible`
 * once the element scrolls into view (with a configurable threshold).
 *
 * Typical usage:
 *
 *   const ref = useRef<HTMLDivElement>(null);
 *   const visible = useScrollReveal(ref);
 *   <div ref={ref} className={cn("reveal-on-scroll", visible && "is-visible")} />
 *
 * The element starts hidden (opacity-0, translateY) via the `reveal-on-scroll`
 * base class, then transitions to visible when `is-visible` is added.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  ref: React.RefObject<T | null>,
  options?: { threshold?: number; once?: boolean; rootMargin?: string }
) {
  const { threshold = 0.15, once = true, rootMargin = "0px 0px -10% 0px" } = options ?? {};
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Fallback: if IntersectionObserver is unavailable, just show.
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold, once, rootMargin]);

  return isVisible;
}
