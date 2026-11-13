import type { Metadata } from "next";
import Image from "next/image";
import { PageContainer } from "@/components/site/page-container";
import { SpiritualDivider } from "@/components/site/spiritual-divider";
import { TEMPLE_STATS } from "@/features/home/constants/temple-info";
import { TempleStat } from "@/features/home/components/temple-stat";
import { useTranslations } from "next-intl";
import { PageHero } from "@/components/site/page-hero";
import { ScrollReveal } from "@/features/home/components/scroll-reveal";

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
      <ScrollReveal />
      <PageHero
        title={tAbout("title")}
        subtitle={tAbout("subtitle")}
        image="/images/temple-lamps.png"
        archImage="/images/deity-shrine.png"
        archAlt={tTempleInfo("shortName")}
      />

      <PageContainer className="overflow-hidden bg-temple-paper">

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 reveal">
          {[
            "/images/temple-hero.png",
            "/images/deity-shrine.png",
            "/images/temple-rangoli.png",
          ].map((src, i) => (
            <div
              key={src}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-temple-sand shadow-[0_20px_50px_rgba(74,16,22,0.14)]"
            >
              <Image
                src={src}
                alt={`Temple image ${i + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          ))}
        </div>

        <div className="mt-24">

          <div className="max-w-3xl mx-auto mb-16 reveal">
            <h2 className="font-heading text-3xl text-center md:text-4xl font-semibold text-temple-ink">
              {tHistory("title")}
            </h2>

            <blockquote className="border-l-3 border-temple-kumkum/70 bg-temple-sand/50 rounded-r-2xl py-5 pl-6 pr-5 my-8">
              <p className="font-heading text-xl align-left text-temple-soft italic leading-relaxed">
                &ldquo;{tHistory("intro")}&rdquo;
              </p>
            </blockquote>
          </div>

          <SpiritualDivider variant="om" />

          <div className="max-w-4xl mx-auto">
            {historySections.map((sectionKey, index) => (
              <section
                key={sectionKey}
                className="relative reveal"
              >
                <div className="flex gap-6">

                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full border-2 border-temple-gold bg-temple-night shadow-[0_0_0_6px_rgba(217,164,58,0.12)] flex items-center justify-center">
                      <span className="font-heading text-sm font-semibold text-temple-gold-soft">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {index !== historySections.length - 1 && (
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-temple-gold/60 to-temple-gold/10" />
                    )}
                  </div>

                  <div className="flex-1 pb-16">

                    <h3 className="font-heading text-2xl md:text-3xl font-semibold text-temple-ink mb-6">
                      {tHistory(
                        `sections.${sectionKey}.title`
                      )}
                    </h3>

                    <div className="space-y-5">
                      {getParagraphs(sectionKey).map(
                        (paragraph, paragraphIndex) => (
                          <p
                            key={paragraphIndex}
                            className="text-base md:text-lg text-temple-soft leading-relaxed font-sans"
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-20 reveal">
          {TEMPLE_STATS.map((stat) => (
            <TempleStat
              key={stat.label}
              value={stat.value}
              label={tTempleInfo(`stats.${stat.id}`)}
              icon={stat.id}
            />
          ))}
        </div>

      </PageContainer>
    </>
  );
}