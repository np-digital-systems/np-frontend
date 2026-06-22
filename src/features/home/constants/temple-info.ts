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
    id: "heritage",
    value: "500+",
    label: "Years of Heritage",
    icon: "🏛️",
  },
  {
    id: "devotees",
    value: "1000+",
    label: "Annual Devotees",
    icon: "🙏",
  },
  {
    id: "festivals",
    value: "100+",
    label: "Annual Festivals",
    icon: "🛕",
  },
  {
    id: "worship",
    value: "365",
    label: "Days of Worship",
    icon: "🕉️",
  },
] as const;

export const DONATION_TIERS_EN = [
  {
    id: "seva",
    title: "Seva Contribution",
    amount: "Rs. 500",
    description:
      "Support daily temple operations and maintenance of sacred grounds.",
    features: ["Daily Puja Offering", "Name in Prayer List", "Monthly Updates", "Annual Report", "Tax Receipt"],
    isFeatured: true,
  },
  {
    id: "gopuram",
    title: "Gopuram Thirupani",
    amount: "Rs. 2,500",
    description:
      "Contribute to the upkeep and beautification of our temple's iconic gopuram.",
    features: [
      "Gopuram Dedication",
      "Name on Donor Plaque",
      "Exclusive Gopuram Tour",
      "Annual Festival Invite",
      "Tax Deduction Receipt",
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

export const DONATION_TIERS_TA = [
  {
    id: "seva",
    title: "சேவைப் பங்களிப்பு",
    amount: "ரூ. 500",
    description:
      "தினசரி கோயில் செயல்பாடுகள் மற்றும் புனித வளாகத்தின் பராமரிப்பிற்கு ஆதரவளியுங்கள்.",
    features: [
      "தினசரி பூஜை வழிபாடு",
      "பிரார்த்தனைப் பட்டியலில் பெயர்",
      "மாதாந்திர அறிவிப்புகள்",
      "ஆண்டு அறிக்கை",
      "வரி ரசீது"
    ],
    isFeatured: true,
  },
  {
    id: "gopuram",
    title: "கோபுர திருப்பணி",
    amount: "ரூ. 2,500",
    description:
      "எங்கள் கோயிலின் சின்னமான கோபுரத்தின் பராமரிப்பு மற்றும் அழகுபடுத்தலுக்குப் பங்களிக்கவும்.",
    features: [
      "கோபுர சமர்ப்பணம்",
      "நன்கொடையாளர் பலகையில் பெயர்",
      "பிரத்தியேக கோபுர உலா",
      "ஆண்டு திருவிழா அழைப்பு",
      "வரி விலக்கு ரசீது"
    ],
    isFeatured: true,
  },
  {
    id: "restoration",
    title: "கோயில் புனரமைப்பு",
    amount: "ரூ. 10,000",
    description:
      "எங்கள் பழமையான கோயிலின் பாதுகாப்பு மற்றும் புனரமைப்பிற்குப் பங்களிக்கவும்.",
    features: [
      "புனரமைப்பு நிதி",
      "நன்கொடையாளர் அங்கீகார சுவர்",
      "சிறப்பு தரிசன அனுமதி",
      "ஆண்டு விழா அழைப்பு",
      "வரி விலக்கு ரசீது"
    ],
    isFeatured: true,
  },
] as const;

export const DONATION_TIERS = {
  en: DONATION_TIERS_EN,
  ta: DONATION_TIERS_TA,
} as const;
