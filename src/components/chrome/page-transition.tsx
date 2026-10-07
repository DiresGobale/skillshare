"use client";

import React, { useEffect, useState, useRef } from "react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

// Wraps page content with a zoom-in animation on every navigation.
// When the `view` changes, the old content zooms out and the new
// content zooms in with a smooth cubic-bezier transition.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const { view } = useApp();
  const [animKey, setAnimKey] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevView = useRef(view);

  useEffect(() => {
    if (prevView.current !== view) {
      prevView.current = view;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAnimating(true);
      setAnimKey((k) => k + 1);
      // Reset the animating flag after the animation completes
      const timer = setTimeout(() => setIsAnimating(false), 450);
      return () => clearTimeout(timer);
    }
  }, [view]);

  return (
    <div
      key={animKey}
      className={cn(
        "page-zoom-in",
        isAnimating && "page-zoom-in"
      )}
      style={{
        animationDuration: "0.4s",
        animationTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        animationFillMode: "forwards",
      }}
    >
      {children}
    </div>
  );
}
