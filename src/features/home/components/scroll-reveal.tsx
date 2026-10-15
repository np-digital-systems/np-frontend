"use client";

import { useHome } from "../hooks/use-home";

// Client boundary for the scroll-reveal animations, so the home page can stay a server component.
export function ScrollReveal() {
  useHome();

  return null;
}
