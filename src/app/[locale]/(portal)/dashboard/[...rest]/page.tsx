import { notFound } from 'next/navigation';

// Renders unmatched paths as the portal 404 (with sidebar), not the site's.
export default function PortalCatchAll() {
  notFound();
}
