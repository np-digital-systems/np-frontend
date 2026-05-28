export const TEMPLE_INFO = {
  name: "Mallakam Neeliyampanai Pillaiyar Kovil",
  tagline: "Where Faith Meets Eternity & Divine Grace Awaits Every Seeker",
  aboutTitle: "Spiritual Legacy &\nTimeless Devotion",
  aboutDescription:
    "Founded on the sacred grounds of Mallakam in the Jaffna peninsula, the Neeliyampathi Pillaiyar Kovil stands as a beacon of spiritual heritage and devotion. Our temple is a sacred sanctuary where the divine presence of Lord Pillaiyar blesses all who enter through its hallowed archway.",
  aboutQuote:
    "Like a lotus of Realised divine glory of Ganapathy – Mallakam temple is a spiritual fortress that has stood the test of time, nurturing generations of devotees.",
  history:
    "With centuries of unbroken tradition, this temple has been the spiritual heart of Mallakam, witnessing and nurturing the faith of countless families across generations.",
} as const;

export const TEMPLE_STATS = [
  {
    value: "500+",
    label: "Years of Heritage",
    icon: "🏛️",
  },
  {
    value: "10,000+",
    label: "Annual Devotees",
    icon: "🙏",
  },
  {
    value: "50+",
    label: "Annual Festivals",
    icon: "🎆",
  },
  {
    value: "365",
    label: "Days of Worship",
    icon: "🕉️",
  },
] as const;

export const DONATION_TIERS = [
  {
    id: "seva",
    title: "Seva Contribution",
    amount: "Rs. 500",
    description:
      "Support daily temple operations and maintenance of sacred grounds.",
    features: ["Daily Puja Offering", "Name in Prayer List", "Monthly Updates"],
    isFeatured: false,
  },
  {
    id: "annadhanam",
    title: "Annadhanam",
    amount: "Rs. 2,500",
    description:
      "Sponsor a meal service for devotees and visitors to the temple.",
    features: [
      "Feed 100+ Devotees",
      "Special Prayer Dedication",
      "Commemorative Certificate",
      "Annual Report",
    ],
    isFeatured: true,
  },
  {
    id: "restoration",
    title: "Temple Restoration",
    amount: "Rs. 10,000",
    description:
      "Contribute to the preservation and restoration of our ancient temple.",
    features: [
      "Restoration Fund",
      "Donor Recognition Wall",
      "Special Darshan Access",
      "Annual Celebration Invite",
      "Tax Deduction Receipt",
    ],
    isFeatured: true,
  },
] as const;
