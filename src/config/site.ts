export const siteConfig = {
  name: "Mallakam Neeliyampanai Pillaiyar Kovil",
  shortName: "Neeliyampanai Pillaiyar Kovil",
  description:
    "Experience divine blessings at Mallakam Neeliyampanai Pillaiyar Kovil. A sacred sanctuary of spirituality, tradition, and timeless devotion.",
  url: "https://neeliyampanaipillaiyarkovil.com",
  ogImage: "/images/temple-hero.png",
  links: {
    facebook: "https://facebook.com/neeliyampanaipillaiyarkovil",
    instagram: "https://instagram.com/neeliyampanaipillaiyarkovil",
    youtube: "https://youtube.com/@neeliyampanaipillaiyarkovil",
  },
  contact: {
    phone: "+94 21 234 5678",
    email: "info@neeliyampanaipillaiyarkovil.com",
    address: "Neeliyampanai, Mallakam, Jaffna, Sri Lanka",
    mapUrl: "https://maps.app.goo.gl/hYoV7dwJjD5hjvdQ6",
  },
  templeHours: {
    morning: "6:30 AM – 08:00 AM",
    afternoon: "12:00 PM – 01:00 PM",
    evening: "06:00 PM – 07:00 PM",
  },
} as const;

export type SiteConfig = typeof siteConfig;
