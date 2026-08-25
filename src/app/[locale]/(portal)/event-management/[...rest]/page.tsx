import { notFound } from 'next/navigation';

// Keeps unmatched portal paths inside the portal shell so they render the
// portal-themed 404 with the sidebar, rather than the public site's.
export default function PortalCatchAll() {
  notFound();
}
