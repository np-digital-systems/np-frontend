export interface TempleEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  image: string;
  category: "puja" | "festival" | "special" | "monthly";
  location?: string;
  isFeatured?: boolean;
}
