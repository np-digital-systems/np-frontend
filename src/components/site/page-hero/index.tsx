import Image from "next/image";
import { useTranslations } from "next-intl";
import { KolamMandala } from "@/components/site/kolam";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  image: string;
  archImage?: string;
  archAlt?: string;
  children?: React.ReactNode;
}

export function PageHero({
  title,
  subtitle,
  image,
  archImage,
  archAlt = "",
  children,
}: PageHeroProps) {
  const tHero = useTranslations("Home.Hero");

  return (
    <section className="relative isolate overflow-hidden bg-temple-night text-temple-paper">
      <div className="absolute inset-0 -z-10">
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="temple-kenburns object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-temple-night via-temple-night/85 to-temple-maroon/70" />
        <div className="absolute inset-0 temple-kolam-dots text-temple-gold/10" />
        <div className="temple-breathe absolute -left-40 top-1/4 h-[420px] w-[420px] rounded-full bg-temple-saffron/20 blur-[120px]" />
        <div className="temple-breathe absolute -right-24 -top-24 h-[320px] w-[320px] rounded-full bg-temple-kumkum/30 blur-[110px] [animation-delay:2s]" />
      </div>

      <div className="mx-auto grid min-h-[min(70svh,640px)] max-w-[1280px] grid-cols-1 items-center gap-12 px-4 pb-16 pt-32 md:px-16 lg:grid-cols-[1.2fr_0.8fr] lg:pb-20">
        <div className="text-center lg:text-left">
          <p
            className="temple-rise inline-flex items-center gap-3 rounded-full border border-temple-gold/30 bg-temple-gold/10 px-4 py-1.5 text-sm text-temple-gold-soft backdrop-blur-sm"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="font-heading text-base text-temple-gold">ॐ</span>
            {tHero("eyebrow")}
          </p>

          <h1
            className="temple-rise mt-6 font-heading text-4xl font-bold leading-[1.2] sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "0.25s" }}
          >
            <span className="temple-gold-text">{title}</span>
          </h1>

          <svg
            viewBox="0 0 320 20"
            fill="none"
            className="mx-auto mt-4 h-5 w-56 text-temple-gold lg:mx-0"
            aria-hidden="true"
          >
            <path
              d="M2 12 C 60 2, 110 18, 160 10 S 260 4, 318 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              pathLength={1}
              className="temple-draw"
            />
          </svg>

          {subtitle && (
            <p
              className="temple-rise mx-auto mt-5 max-w-xl text-lg leading-relaxed text-temple-paper/75 lg:mx-0"
              style={{ animationDelay: "0.45s" }}
            >
              {subtitle}
            </p>
          )}

          {children && (
            <div className="temple-rise mt-8" style={{ animationDelay: "0.6s" }}>
              {children}
            </div>
          )}
        </div>

        <div
          className="temple-rise relative mx-auto hidden w-full max-w-[340px] lg:block"
          style={{ animationDelay: "0.35s" }}
        >
          <KolamMandala className="temple-spin-slow absolute left-1/2 top-1/2 w-[140%] -translate-x-1/2 -translate-y-1/2 text-temple-gold/25" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-temple-gold/30 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <Image
              src={archImage ?? image}
              alt={archAlt}
              fill
              sizes="340px"
              className="temple-kenburns object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-temple-night/60 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
