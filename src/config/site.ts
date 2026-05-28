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
    address: "Mallakam, Jaffna, Sri Lanka",
    mapUrl: "https://maps.google.com/?q=Mallakam+Jaffna",
  },
  templeHours: {
    morning: "5:30 AM – 12:00 PM",
    evening: "4:00 PM – 8:00 PM",
  },
} as const;

export type SiteConfig = typeof siteConfig;
