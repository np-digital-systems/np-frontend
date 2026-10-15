import { notFound } from 'next/navigation';

// Routes unmatched paths to [locale]/not-found.tsx; Next's default 404 renders outside the locale layout.
export default function CatchAllPage() {
  notFound();
}
