import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronDown } from "lucide-react";
import { useTranslations } from 'next-intl';
export function HeroSection() {

  const t = useTranslations('TempleInfo');  
  const tHero = useTranslations('Hero');
  return (
    <section
      id="hero-section"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/temple-hero.png"
          alt="Mallakam Neeliyampathi Pillaiyar Kovil"
          fill
          className="object-cover object-center"
          priority
          quality={90}
          sizes="100vw"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#8B0000]/70 via-[#8B0000]/30 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1280px] px-4 md:px-16 text-center pt-24">
        {/* Decorative Om */}
        <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm">
          <span className="text-[#F4C430] text-xl font-heading">ॐ</span>
        </div>

        {/* Temple Name */}
        <h1 className="font-heading text-4xl md:text-5xl lg:text-[64px] font-bold text-white leading-[1.1] tracking-[-0.02em] mb-6 max-w-4xl mx-auto">
          {t('name')}
        </h1>

        {/* Tagline */}
        <p className="text-base md:text-lg text-white/80 font-sans leading-relaxed max-w-2xl mx-auto mb-10">
          {t('tagline')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2.5 px-8 py-3 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4C430] text-white font-semibold text-base shadow-[0_8px_24px_rgba(212,175,55,0.3)] hover:shadow-[0_12px_32px_rgba(212,175,55,0.45)] transition-all duration-300 hover:scale-[1.02]"
          >
            <MapPin className="w-5 h-5" />
            {tHero('locateUs')}
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center gap-2.5 px-8 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-base hover:bg-white/20 transition-all duration-300"
          >
            {tHero('upcomingEvents')}
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-white/50 text-xs font-sans tracking-wider uppercase">
          Explore
        </span>
        <ChevronDown className="w-5 h-5 text-white/50" />
      </div>

      {/* Decorative bottom curve */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80V60C240 20 480 0 720 0C960 0 1200 20 1440 60V80H0Z"
            fill="#FAF9F6"
          />
        </svg>
      </div>
    </section>
  );
}
