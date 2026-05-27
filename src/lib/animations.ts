// Animation variants for consistent motion design

export const fadeInUp = {
  initial: { opacity: 0, transform: "translateY(24px)" },
  animate: { opacity: 1, transform: "translateY(0)" },
  transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: "opacity 0.5s ease-out",
} as const;

export const scaleIn = {
  initial: { opacity: 0, transform: "scale(0.95)" },
  animate: { opacity: 1, transform: "scale(1)" },
  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

export const staggerDelay = (index: number, base = 0.1) =>
  `${index * base}s`;

// CSS animation class names (defined in animations.css)
export const ANIMATION_CLASSES = {
  fadeInUp: "animate-fade-in-up",
  fadeIn: "animate-fade-in",
  slideInLeft: "animate-slide-in-left",
  slideInRight: "animate-slide-in-right",
  scaleIn: "animate-scale-in",
  softPulse: "animate-soft-pulse",
  shimmer: "animate-shimmer",
  float: "animate-float",
} as const;
