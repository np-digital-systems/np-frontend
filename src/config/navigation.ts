export interface NavItem {
  id: string;
  label: string;
  href: string;
  description?: string;
}

export const mainNavItems: NavItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "about", label: "About", href: "/about" },
  { id: "events", label: "Events", href: "/events" },
  { id: "gallery", label: "Gallery", href: "/gallery" },
  { id: "contact", label: "Contact", href: "/contact" },
];

export const footerNavItems = {
  quickLinks: [
    { label: "About Temple", href: "/about" },
    { label: "Upcoming Events", href: "/events" },
    { label: "Photo Gallery", href: "/gallery" },
    { label: "Contact Us", href: "/contact" },
  ],
  services: [
    { label: "Puja Booking", href: "/bookings" },
    { label: "Donations", href: "/donations" },
    { label: "Notices", href: "/notices" },
    { label: "Temple Calendar", href: "/events" },
  ],
} as const;
