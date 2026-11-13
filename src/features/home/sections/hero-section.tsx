import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { KolamMandala } from "@/components/site/kolam";

export function HeroSection() {
  const t = useTranslations("TempleInfo");
  const tHero = useTranslations("Home.Hero");
  const tContact = useTranslations("Home.Contact");

  return (
    <section
      id="hero-section"
      className="relative isolate overflow-hidden bg-temple-night text-temple-paper"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/temple-hero.png"
          alt=""
          fill
          priority
          quality={85}
          sizes="100vw"
          className="temple-kenburns object-cover object-center opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-temple-night via-temple-night/90 to-temple-maroon/70" />
        <div className="absolute inset-0 temple-kolam-dots text-temple-gold/10" />
        <div className="temple-breathe absolute -left-40 top-1/3 h-[480px] w-[480px] rounded-full bg-temple-saffron/20 blur-[120px]" />
        <div className="temple-breathe absolute -right-24 -top-24 h-[360px] w-[360px] rounded-full bg-temple-kumkum/30 blur-[110px] [animation-delay:2s]" />
      </div>

      <div className="mx-auto grid min-h-[min(100svh,960px)] max-w-[1280px] grid-cols-1 items-center gap-14 px-4 pb-20 pt-32 md:px-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:pt-28">
        <div className="text-center lg:text-left">
          <p
            className="temple-rise inline-flex items-center gap-3 rounded-full border border-temple-gold/30 bg-temple-gold/10 px-4 py-1.5 text-sm text-temple-gold-soft backdrop-blur-sm"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="font-heading text-base text-temple-gold">ॐ</span>
            {tHero("eyebrow")}
          </p>

          <h1
            className="temple-rise mt-7 font-heading text-[2.6rem] font-bold leading-[1.15] text-temple-paper sm:text-5xl lg:text-[4.25rem]"
            style={{ animationDelay: "0.25s" }}
          >
            <span className="temple-gold-text">{t("name")}</span>
          </h1>

          <svg
            viewBox="0 0 320 20"
            fill="none"
            className="mx-auto mt-4 h-5 w-64 text-temple-gold lg:mx-0"
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

          <p
            className="temple-rise mx-auto mt-6 max-w-xl text-lg leading-relaxed text-temple-paper/75 md:text-xl lg:mx-0"
            style={{ animationDelay: "0.45s" }}
          >
            {t("tagline")}
          </p>

          <div
            className="temple-rise mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
            style={{ animationDelay: "0.6s" }}
          >
            <Link
              href="/about"
              className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-temple-gold to-temple-saffron px-8 py-3.5 text-base font-semibold text-temple-night shadow-[0_12px_32px_rgba(226,134,31,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(226,134,31,0.5)]"
            >
              {tHero("about")}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2.5 rounded-full border border-temple-gold/40 px-8 py-3.5 text-base font-semibold text-temple-paper transition-all duration-300 hover:border-temple-gold hover:bg-temple-gold/10"
            >
              {tHero("upcomingEvents")}
            </Link>
          </div>

          <dl
            className="temple-rise mt-12 grid grid-cols-3 gap-3 border-t border-temple-gold/15 pt-6 text-left"
            style={{ animationDelay: "0.75s" }}
          >
            {(["morning", "afternoon", "evening"] as const).map((slot) => (
              <div key={slot}>
                <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-temple-gold">
                  <Clock className="h-3.5 w-3.5" />
                  {tContact(slot)}
                </dt>
                <dd className="mt-1 text-sm text-temple-paper/80">
                  {t(`templeHours.${slot}`)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div
          className="temple-rise relative mx-auto w-full max-w-[420px]"
          style={{ animationDelay: "0.35s" }}
        >
          <KolamMandala className="temple-spin-slow absolute left-1/2 top-1/2 w-[135%] -translate-x-1/2 -translate-y-1/2 text-temple-gold/25" />

          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-temple-gold/30 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <Image
              src="/images/temple-hero.png"
              alt={t("name")}
              fill
              sizes="(max-width: 1024px) 90vw, 420px"
              className="temple-kenburns object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-temple-night/70 via-transparent to-transparent" />
          </div>

          <div className="animate-float absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl border border-temple-gold/30 bg-temple-night/85 p-3 pr-5 shadow-2xl backdrop-blur-md sm:-left-10">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-temple-gold">
              <Image
                src="/images/deity-shrine.png"
                alt=""
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-heading text-sm font-semibold text-temple-gold-soft">
                {t("shortName")}
              </p>
              <p className="text-xs text-temple-paper/60">{tHero("eyebrow")}</p>
            </div>
          </div>

          <div className="absolute -right-2 -top-4 flex h-16 w-16 items-center justify-center rounded-full border border-temple-gold/40 bg-temple-night/80 backdrop-blur-md sm:-right-6">
            <svg viewBox="0 0 24 32" className="h-9 w-7" aria-hidden="true">
              <path
                className="temple-flame"
                d="M12 2 C 16 8, 18 12, 15 17 C 14 19, 10 19, 9 17 C 6 12, 8 8, 12 2 Z"
                fill="url(#flame)"
              />
              <path d="M3 22 H21 L18 28 H6 Z" fill="var(--temple-gold)" />
              <defs>
                <linearGradient id="flame" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fff3c4" />
                  <stop offset="0.6" stopColor="var(--temple-saffron)" />
                  <stop offset="1" stopColor="var(--temple-kumkum)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
