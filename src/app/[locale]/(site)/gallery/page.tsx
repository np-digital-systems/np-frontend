import type { Metadata } from "next";
import { PageContainer } from "@/components/site/page-container";
import { SectionHeader } from "@/components/site/section-header";
import { GalleryCard } from "@/features/home/components/gallery-card";
import { GALLERY_IMAGES } from "@/features/home/constants/gallery";
import { useTranslations } from "next-intl";
import { PageHero } from "@/components/site/page-hero";
import { ScrollReveal } from "@/features/home/components/scroll-reveal";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Explore sacred moments captured at Neeliyampathi Pillaiyar Kovil through our photo gallery.",
};

export default function GalleryPage() {
 const tGallery = useTranslations("Gallery");

  return (
    <>
      <ScrollReveal />
      <PageHero
        title={tGallery("title")}
        subtitle={tGallery("subtitle")}
        image="/images/temple-rangoli.png"
        archImage="/images/festival-navaratri.png"
      />

      <PageContainer className="bg-temple-paper">
        <SectionHeader
          subtitle={tGallery("section1.subtitle")}
          title={tGallery("section1.title")}
          description={tGallery("section1.description")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 reveal">
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