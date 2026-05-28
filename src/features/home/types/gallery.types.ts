export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  category: "temple" | "festival" | "ceremony" | "decoration" | "deity";
  width?: number;
  height?: number;
}
