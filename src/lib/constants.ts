// Sacred color palette from DESIGN.md
export const COLORS = {
  gold: "#D4AF37",
  saffron: "#F4C430",
  deepRed: "#8B0000",
  kumkum: "#B52619",
  pureWhite: "#FFFFFF",
  backgroundTint: "#FAF9F6",
  onSurface: "#1A1C1C",
  outline: "#7F7663",
} as const;

// Gradient definitions
export const GRADIENTS = {
  goldToSaffron: "linear-gradient(45deg, #D4AF37, #F4C430)",
  heroOverlay:
    "linear-gradient(180deg, rgba(139,0,0,0.7) 0%, rgba(139,0,0,0.4) 40%, rgba(0,0,0,0.6) 100%)",
  sacredGlow: "0 10px 30px rgba(212, 175, 55, 0.15)",
} as const;

// Spacing system based on 8px grid
export const SPACING = {
  unit: 8,
  containerMax: 1280,
  gutter: 24,
  marginMobile: 16,
  marginDesktop: 64,
  sectionGap: 120,
} as const;

// Breakpoints
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;
