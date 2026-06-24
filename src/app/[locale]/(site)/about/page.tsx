import type { Metadata } from "next";
import Image from "next/image";
import { PageContainer } from "@/components/common/page-container";
import { SpiritualDivider } from "@/components/common/spiritual-divider";
import { TEMPLE_INFO, TEMPLE_STATS } from "@/features/home/constants/temple-info";
import { TempleStat } from "@/features/home/components/temple-stat";
import { useTranslations } from "next-intl";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about the rich spiritual heritage and history of Mallakam Neeliyampathi Pillaiyar Kovil.",
};

export default function AboutPage() {
  const tAbout = useTranslations("About");
  const tTempleInfo = useTranslations("TempleInfo")
  return (
    <>
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/temple-lamps.png"
          alt="Temple interior"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#8B0000]/60 to-black/50" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {tAbout("title")}
          </h1>
          <p className="text-white/80 text-lg font-sans max-w-xl mx-auto">
            {tAbout("subtitle")}
          </p>
        </div>
      </section>

      <PageContainer className="bg-[#FAF9F6]">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-[#1A1C1C] mb-6 text-center">
            {tTempleInfo("aboutTitle")}
          </h2>
          <p className="text-base md:text-lg text-[#4D4635] leading-relaxed mb-8 font-sans text-center">
            {tTempleInfo("aboutDescription")}

          </p>

          <SpiritualDivider variant="om" />

          <blockquote className="border-l-3 border-[#D4AF37] pl-6 my-8">
            <p className="font-heading text-xl text-[#4D4635] italic leading-relaxed">
              &ldquo;{tTempleInfo("aboutQuote")}&rdquo;
            </p>
          </blockquote>

          <p className="text-base text-[#4D4635] leading-relaxed font-sans">
            {tTempleInfo("history")}

          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-20">
          {TEMPLE_STATS.map((stat) => (
            <TempleStat
              key={stat.label}
              value={stat.value}
              label={stat.label}
              icon={stat.icon}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {[
            "/images/temple-hero.png",
            "/images/deity-shrine.png",
            "/images/temple-rangoli.png",
          ].map((src, i) => (
            <div key={src} className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
              <Image src={src} alt={`Temple image ${i + 1}`} fill className="object-cover" sizes="400px" />
            </div>
          ))}
        </div>
      </PageContainer>
    </>
  );
}