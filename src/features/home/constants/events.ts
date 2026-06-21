import type { TempleEvent } from "../types/event.types";

export const FEATURED_EVENTS_EN: TempleEvent[] = [
  {
    id: "1",
    title: "Maha Shivaratri Festival",
    description:
      "Join us for the grand celebration of Maha Shivaratri with special abhishekam, archana, and all-night devotional programs at the temple.",
    date: "2026-02-26",
    time: "6:00 PM ",
    image: "/images/ceremony-puja.png",
    category: "festival",
    isFeatured: true,
  },
  {
    id: "2",
    title: "Navaratri Festival",
    description:
      "Nine nights of divine celebration honoring the goddess with special pujas, cultural programs, and traditional music performances.",
    date: "2026-03-22",
    time: "5:30 PM – 9:00 PM",
    image: "/images/festival-navaratri.png",
    category: "festival",
    isFeatured: true,
  },
  {
    id: "3",
    title: "Sangabishekam",
    description:
      "Sacred ritual of bathing the deity with cooked rice, symbolizing abundance and prosperity. All devotees are welcome.",
    date: "2026-04-14",
    time: "10:00 AM – 12:00 PM",
    image: "/images/deity-shrine.png",
    category: "special",
    isFeatured: true,
  },
];

export const FEATURED_EVENTS_TA: TempleEvent[] = [
  {
    id: "1",
    title: "மகா சிவராத்திரி பெருவிழா",
    description:
      "கோயிலில் சிறப்பு அபிஷேகம், அர்ச்சனை மற்றும் இரவு முழுவதுமான பக்தி நிகழ்ச்சிகளுடன் நடைபெறும் மகா சிவராத்திரியின் பிரம்மாண்டமான கொண்டாட்டத்தில் எங்களுடன் இணையுங்கள்.",
    date: "2026-02-26",
    time: "மாலை 6:00 மணி",
    image: "/images/ceremony-puja.png",
    category: "festival",
    isFeatured: true,
  },
  {
    id: "2",
    title: "நவராத்திரி பெருவிழா",
    description:
      "சிறப்பு பூஜைகள், கலாச்சார நிகழ்ச்சிகள் மற்றும் பாரம்பரிய இசை நிகழ்ச்சிகளுடன் அம்பாளைப் போற்றும் ஒன்பது இரவுகளின் தெய்வீகக் கொண்டாட்டம்.",
    date: "2026-03-22",
    time: "மாலை 5:30 – இரவு 9:00 மணி",
    image: "/images/festival-navaratri.png",
    category: "festival",
    isFeatured: true,
  },
  {
    id: "3",
    title: "சங்காபிஷேகம்",
    description:
      "வளம் மற்றும் செழிப்பைக் குறிக்கும் வகையில், இறைவனுக்கு அன்னம் கொண்டு அபிஷேகம் செய்யப்படும் புனிதமான வழிபாடு. பக்தர்கள் அனைவரும் வருக.",
    date: "2026-04-14",
    time: "காலை 10:00 – மதியம் 12:00 மணி",
    image: "/images/deity-shrine.png",
    category: "special",
    isFeatured: true,
  },
];

  
export const FEATURED_EVENTS = {
  en: FEATURED_EVENTS_EN,
  ta: FEATURED_EVENTS_TA,
} as const;