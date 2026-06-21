import type { TempleEvent } from "../types/event.types";

export const FEATURED_EVENTS: TempleEvent[] = [
  {
    id: "1",
    title: "மஹா சிவராத்திரி விழா (Maha Shivaratri Festival)",
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
    title: "நவராத்திரி விழா (Navaratri Festival)",
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
    title: "சங்காபிஷேகம் (Sangabishekam)",
    description:
      "Sacred ritual of bathing the deity with cooked rice, symbolizing abundance and prosperity. All devotees are welcome.",
    date: "2026-04-14",
    time: "10:00 AM – 12:00 PM",
    image: "/images/deity-shrine.png",
    category: "special",
    isFeatured: true,
  },
];
