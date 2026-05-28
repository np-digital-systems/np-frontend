export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export const mainNavItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
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
