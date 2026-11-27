"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AutoSlideProps {
  children: React.ReactNode;
  className?: string;
  interval?: number;
}

const RESUME_AFTER = 6000;

export function AutoSlide({ children, className, interval = 3500 }: AutoSlideProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = ref.current;
    if (!track) return;

    // Only the mobile layout scrolls sideways; on desktop the items sit in a grid.
    const mobile = window.matchMedia("(max-width: 767px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let paused = false;
    let resumeTimer: number | undefined;

    const pause = () => {
      paused = true;
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        paused = false;
      }, RESUME_AFTER);
    };

    const advance = () => {
      if (paused || !mobile.matches || reducedMotion.matches) return;

      const items = Array.from(track.children) as HTMLElement[];
      if (items.length < 2) return;

      const centre = track.scrollLeft + track.clientWidth / 2;
      let current = 0;
      let closest = Infinity;

      items.forEach((item, index) => {
        const distance = Math.abs(item.offsetLeft + item.offsetWidth / 2 - centre);
        if (distance < closest) {
          closest = distance;
          current = index;
        }
      });

      const next = items[(current + 1) % items.length];
      track.scrollTo({
        left: next.offsetLeft - (track.clientWidth - next.offsetWidth) / 2,
        behavior: "smooth",
      });
    };

    const timer = window.setInterval(advance, interval);
    track.addEventListener("pointerdown", pause);
    track.addEventListener("touchstart", pause, { passive: true });
    track.addEventListener("wheel", pause, { passive: true });

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(resumeTimer);
      track.removeEventListener("pointerdown", pause);
      track.removeEventListener("touchstart", pause);
      track.removeEventListener("wheel", pause);
    };
  }, [interval]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {children}
    </div>
  );
}
