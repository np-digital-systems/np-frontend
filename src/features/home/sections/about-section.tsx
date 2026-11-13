import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/site/page-container";
import { SpiritualDivider } from "@/components/site/spiritual-divider";
import { KolamMandala } from "@/components/site/kolam";
import { TEMPLE_STATS } from "../constants/temple-info";
import { TempleStat } from "../components/temple-stat";
import { useTranslations } from 'next-intl';

export function AboutSection() {
const t = useTranslations('Home.About');
const tTemple = useTranslations('TempleInfo');

  return (
    <PageContainer id="about-section" className="overflow-hidden bg-temple-paper">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="relative isolate reveal-left">
          <KolamMandala className="temple-spin-slow absolute left-1/2 top-1/2 -z-10 w-[120%] -translate-x-1/2 -translate-y-1/2 text-temple-gold/20" />
          <div className="relative overflow-hidden rounded-2xl border border-temple-sand shadow-[0_24px_60px_rgba(74,16,22,0.18)] aspect-[4/5]">
            <Image
              src="/images/temple-lamps.png"
              alt="Temple interior with sacred oil lamps"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="absolute -bottom-6 -right-4 md:-right-8 w-36 md:w-44 h-36 md:h-44 rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.12)] border-4 border-white">
            <Image
              src="/images/deity-shrine.png"
              alt="Lord Pillaiyar deity"
              fill
              className="object-cover"
              sizes="200px"
            />
          </div>

        </div>

        <div className="reveal-right">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-temple-kumkum mb-4 font-sans">
            {t('aboutOurTemple')}
          </p>

          <h2 className="font-heading text-3xl md:text-4xl lg:text-[48px] font-semibold text-temple-ink leading-[1.2] mb-6 whitespace-pre-line">
            {tTemple('aboutTitle')}
          </h2>

          <p className="text-base md:text-lg text-temple-soft leading-relaxed mb-6 font-sans">
            {tTemple('aboutDescription')}
          </p>

          <blockquote className="border-l-3 border-temple-kumkum/70 bg-temple-sand/50 rounded-r-2xl py-4 pl-5 pr-4 my-8">
            <p className="font-heading text-lg md:text-xl text-temple-soft italic leading-relaxed">
              &ldquo;{tTemple('aboutQuote')}&rdquo;
            </p>
          </blockquote>

          <SpiritualDivider variant="om" className="py-4 justify-start" />

          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-base font-semibold text-temple-kumkum hover:text-temple-maroon transition-colors duration-300 group mt-4"
          >
            {t('discoverOurHistory')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-20 reveal">
        {TEMPLE_STATS.map((stat, index) => (
          <TempleStat
            key={stat.label}
            value={stat.value}
            label={tTemple(`stats.${stat.id}`)}
            icon={stat.id}
            className={`delay-${(index + 1) * 100}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mt-16 reveal">
        {["/images/temple-rangoli.png", "/images/ceremony-puja.png", "/images/festival-navaratri.png"].map(
          (src, index) => (
            <div
              key={src}
              className="relative aspect-[3/2] rounded-2xl overflow-hidden group cursor-pointer"
            >
              <Image
                src={src}
                alt={`Temple gallery image ${index + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 33vw, 400px"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </div>
          )
        )}
      </div>
    </PageContainer>
  );
}
