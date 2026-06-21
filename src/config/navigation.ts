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
    { id: "about", label: "About Temple", href: "/about" },
    { id: "events", label: "Upcoming Events", href: "/events" },
    { id: "gallery", label: "Photo Gallery", href: "/gallery" },
    { id: "contact", label: "Contact Us", href: "/contact" },
  ],
  services: [
    { id: "puja", label: "Puja Booking", href: "/bookings" },
    { id: "donations", label: "Donations", href: "/donations" },
    { id: "notices", label: "Notices", href: "/notices" },
    { id: "calendar", label: "Temple Calendar", href: "/events" },
  ],
} as const;
