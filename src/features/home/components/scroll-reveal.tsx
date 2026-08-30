"use client";

import { useHome } from "../hooks/use-home";

/**
 * Arms the scroll-reveal observer for the page it sits on.
 *
 * It renders nothing and holds no state of its own — it exists so the home
 * page can be a server component (and so fetch the temple calendar) while the
 * reveal animations, which need the browser, stay in a client boundary.
 */
export function ScrollReveal() {
  useHome();

  return null;
}
