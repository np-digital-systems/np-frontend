import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/common/page-container";
import { SpiritualDivider } from "@/components/common/spiritual-divider";
import { TEMPLE_INFO, TEMPLE_STATS } from "../constants/temple-info";
import { TempleStat } from "../components/temple-stat";

export function AboutSection() {
  return (
    <PageContainer id="about-section" className="bg-[#FAF9F6]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left: Image Composition */}
        <div className="relative reveal-left">
          {/* Main Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.08)] aspect-[4/5]">
            <Image
              src="/images/temple-lamps.png"
              alt="Temple interior with sacred oil lamps"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Floating accent image */}
          <div className="absolute -bottom-6 -right-4 md:-right-8 w-36 md:w-44 h-36 md:h-44 rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.12)] border-4 border-white">
            <Image
              src="/images/deity-shrine.png"
              alt="Lord Pillaiyar deity"
              fill
              className="object-cover"
              sizes="200px"
            />
          </div>

          {/* Decorative gold border accent */}
          <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-[#D4AF37]/40 rounded-tl-3xl" />
        </div>

        {/* Right: Content */}
        <div className="reveal-right">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#D4AF37] mb-4 font-sans">
            About Our Temple
          </p>

          <h2 className="font-heading text-3xl md:text-4xl lg:text-[48px] font-semibold text-[#1A1C1C] leading-[1.2] mb-6 whitespace-pre-line">
            {TEMPLE_INFO.aboutTitle}
          </h2>

          <p className="text-base md:text-lg text-[#4D4635] leading-relaxed mb-6 font-sans">
            {TEMPLE_INFO.aboutDescription}
          </p>

          {/* Sacred Quote */}
          <blockquote className="border-l-3 border-[#D4AF37] pl-5 my-8">
            <p className="font-heading text-lg md:text-xl text-[#4D4635] italic leading-relaxed">
              &ldquo;{TEMPLE_INFO.aboutQuote}&rdquo;
            </p>
          </blockquote>

          <SpiritualDivider variant="om" className="py-4 justify-start" />

          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37] hover:text-[#735C00] transition-colors duration-300 group mt-4"
          >
            Discover Our History
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-20 reveal">
        {TEMPLE_STATS.map((stat, index) => (
          <TempleStat
            key={stat.label}
            value={stat.value}
            label={stat.label}
            icon={stat.icon}
            className={`delay-${(index + 1) * 100}`}
          />
        ))}
      </div>

      {/* Bottom Gallery Strip */}
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
