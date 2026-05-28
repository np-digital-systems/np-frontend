import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/common/page-container";
import { SectionHeader } from "@/components/common/section-header";
import { GalleryCard } from "../components/gallery-card";
import { GALLERY_IMAGES } from "../constants/gallery";

export function GallerySection() {
  return (
    <PageContainer id="gallery-section" className="bg-[#FAF9F6]">
      <SectionHeader
        subtitle="Photo Gallery"
        title="Sacred Moments"
        description="Glimpses of divine celebrations, sacred rituals, and the timeless beauty of our temple grounds."
      />

      {/* Masonry-style Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 reveal">
        {/* Large featured image */}
        <div className="col-span-2 row-span-2">
          <GalleryCard
            image={GALLERY_IMAGES[0]}
            className="h-full"
            priority
          />
        </div>

        {/* Regular images */}
        {GALLERY_IMAGES.slice(1, 5).map((image, index) => (
          <GalleryCard
            key={image.id}
            image={image}
            className={`delay-${(index + 1) * 100}`}
          />
        ))}
      </div>

      <div className="flex justify-center mt-12 reveal">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-[#D4AF37] text-sm font-semibold text-[#735C00] hover:bg-[#D4AF37] hover:text-white transition-all duration-300 group"
        >
          View Full Gallery
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </PageContainer>
  );
}
