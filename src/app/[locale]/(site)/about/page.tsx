import type { Metadata } from "next";
import Image from "next/image";
import { PageContainer } from "@/components/site/page-container";
import { SpiritualDivider } from "@/components/site/spiritual-divider";
import { TEMPLE_STATS } from "@/features/home/constants/temple-info";
import { TempleStat } from "@/features/home/components/temple-stat";
import { useTranslations } from "next-intl";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about the rich spiritual heritage and history of Mallakam Neeliyampathi Pillaiyar Kovil.",
};

const historySections = [
  "location",
  "nameOrigin",
  "earlyHistory",
  "sindhamaniEra",
  "thillaiyambalamEra",
  "landDonations",
  "chariotAndAdministration",
  "1992To2002",
  "2003To2011",
  "2011To2013",
] as const;

export default function AboutPage() {
  const tAbout = useTranslations("About");
  const tTempleInfo = useTranslations("TempleInfo");
  const tHistory = useTranslations("TempleHistory");

  const getParagraphs = (key: string): string[] => {
    return tHistory.raw(
      `sections.${key}.paragraphs`
    ) as string[];
  };

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

          <p className="text-white/80 text-lg font-sans max-w-2xl mx-auto">
            {tAbout("subtitle")}
          </p>
        </div>
      </section>

      <PageContainer className="bg-[#FAF9F6]">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
          {[
            "/images/temple-hero.png",
            "/images/deity-shrine.png",
            "/images/temple-rangoli.png",
          ].map((src, i) => (
            <div
              key={src}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg"
            >
              <Image
                src={src}
                alt={`Temple image ${i + 1}`}
                fill
                className="object-cover"
                sizes="400px"
              />
            </div>
          ))}
        </div>


        {/* <div className="max-w-3xl mx-auto">
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

       */}
        <div className="mt-24">

          {/* History heading */}
          <div className="max-w-3xl mx-auto  mb-16">
            <h2 className="font-heading text-3xl text-center md:text-4xl font-semibold text-[#1A1C1C]">
              {tHistory("title")}
            </h2>


            <blockquote className="border-l-3 border-[#D4AF37] pl-6 my-8">
              <p className="font-heading text-xl align-left text-[#4D4635] italic leading-relaxed">
                &ldquo;{tHistory("intro")}&rdquo;
              </p>
            </blockquote>
          </div>

          <SpiritualDivider variant="om" />

          {/* Timeline */}
          <div className="max-w-4xl mx-auto">
            {historySections.map((sectionKey, index) => (
              <section
                key={sectionKey}
                className="relative"
              >
                <div className="flex gap-6">

                  {/* Number */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37] bg-[#FAF9F6] flex items-center justify-center">
                      <span className="font-heading text-sm font-semibold text-[#8B0000]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Timeline line */}
                    {index !== historySections.length - 1 && (
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-full bg-[#D4AF37]/40" />
                    )}
                  </div>

                  {/* Section content */}
                  <div className="flex-1 pb-16">

                    <h3 className="font-heading text-2xl md:text-3xl font-semibold text-[#1A1C1C] mb-6">
                      {tHistory(
                        `sections.${sectionKey}.title`
                      )}
                    </h3>

                    <div className="space-y-5">
                      {getParagraphs(sectionKey).map(
                        (paragraph, paragraphIndex) => (
                          <p
                            key={paragraphIndex}
                            className="text-base md:text-lg text-[#4D4635] leading-relaxed font-sans"
                          >
                            {paragraph}
                          </p>
                        )
                      )}
                    </div>

                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* =========================
            STATISTICS
        ========================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-20">
          {TEMPLE_STATS.map((stat) => (
            <TempleStat
              key={stat.label}
              value={stat.value}
              label={tTempleInfo(`stats.${stat.id}`)}
              icon={stat.icon}
            />
          ))}
        </div>




      </PageContainer>
    </>
  );
}