import type { Metadata } from "next";
import Image from "next/image";
import { PageContainer } from "@/components/common/page-container";
import { SectionHeader } from "@/components/common/section-header";
import { GalleryCard } from "@/features/home/components/gallery-card";
import { GALLERY_IMAGES } from "@/features/home/constants/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Explore sacred moments captured at Neeliyampathi Pillaiyar Kovil through our photo gallery.",
};

export default function GalleryPage() {
  return (
    <>
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/temple-rangoli.png"
          alt="Sacred flower rangoli"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#8B0000]/60 to-black/50" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Sacred Moments
          </h1>
          <p className="text-white/80 text-lg font-sans max-w-xl mx-auto">
            A visual journey through the divine beauty and spiritual essence of our temple
          </p>
        </div>
      </section>

      <PageContainer className="bg-[#FAF9F6]">
        <SectionHeader
          subtitle="Photo Gallery"
          title="Glimpses of Divinity"
          description="Each photograph captures the sacred atmosphere and timeless beauty of Neeliyampathi Pillaiyar Kovil."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GALLERY_IMAGES.map((image, index) => (
            <GalleryCard
              key={image.id}
              image={image}
              priority={index < 3}
            />
          ))}
        </div>
      </PageContainer>
    </>
  );
}