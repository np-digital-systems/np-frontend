import { notFound } from 'next/navigation';

/**
 * Catch-all so an unmatched path reaches `[locale]/not-found.tsx` rather
 * than Next's built-in 404, which renders outside the locale layout.
 */
export default function CatchAllPage() {
  notFound();
}
