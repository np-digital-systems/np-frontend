import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { PageContainer } from "@/components/site/page-container";
import { siteConfig } from "@/config/site";
import { useTranslations } from "next-intl";
import { PageHero } from "@/components/site/page-hero";
import { ScrollReveal } from "@/features/home/components/scroll-reveal";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Neeliyampathi Pillaiyar Kovil. Find temple location, hours, and contact information.",
};

export default function ContactPage() {
  const tContact = useTranslations("Contact");
  const tTempleInfo = useTranslations("TempleInfo");
  return (
    <>
      <ScrollReveal />
      <PageHero
        title={tContact("title")}
        subtitle={tContact("subtitle")}
        image="/images/temple-hero.png"
        archImage="/images/temple-lamps.png"
        archAlt={tTempleInfo("shortName")}
      />

      <PageContainer className="bg-temple-paper">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="reveal-left rounded-3xl border border-temple-sand bg-temple-card p-6 shadow-[0_20px_60px_rgba(74,16,22,0.08)] md:p-10">
            <h2 className="font-heading text-3xl font-semibold text-temple-ink mb-2">
              {tContact("form.title")}
            </h2>
            <p className="text-temple-soft font-sans mb-8">
                  {tContact("form.subtitle")}
            </p>

            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-semibold text-temple-ink mb-2"
                  >
                    {tContact("form.fullName")}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl bg-temple-paper border border-temple-sand text-temple-ink placeholder:text-temple-soft/50 focus:outline-none focus:border-temple-gold focus:ring-1 focus:ring-temple-gold/30 transition-all duration-300 font-sans text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-semibold text-temple-ink mb-2"
                  >
                    {tContact("form.email")}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-temple-paper border border-temple-sand text-temple-ink placeholder:text-temple-soft/50 focus:outline-none focus:border-temple-gold focus:ring-1 focus:ring-temple-gold/30 transition-all duration-300 font-sans text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-sm font-semibold text-temple-ink mb-2"
                >
                  {tContact("form.subject")}
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 rounded-xl bg-temple-paper border border-temple-sand text-temple-ink placeholder:text-temple-soft/50 focus:outline-none focus:border-temple-gold focus:ring-1 focus:ring-temple-gold/30 transition-all duration-300 font-sans text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-semibold text-temple-ink mb-2"
                >
                  {tContact("form.message")}
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  placeholder="Tell us more..."
                  className="w-full px-4 py-3 rounded-xl bg-temple-paper border border-temple-sand text-temple-ink placeholder:text-temple-soft/50 focus:outline-none focus:border-temple-gold focus:ring-1 focus:ring-temple-gold/30 transition-all duration-300 font-sans text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-temple-gold to-temple-saffron text-temple-night font-semibold text-sm hover:shadow-[0_4px_16px_rgba(217,164,58,0.3)] transition-all duration-300 hover:scale-[1.01]"
              >
                <Send className="w-4 h-4" />
                {tContact("form.sendMeassage")}
              </button>
            </form>
          </div>

          <div className="space-y-8 reveal-right">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="group p-6 rounded-2xl border border-temple-sand bg-temple-card shadow-[0_4px_16px_rgba(74,16,22,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-temple-gold/50 hover:shadow-[0_16px_40px_rgba(217,164,58,0.18)]">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-temple-night text-temple-gold transition-transform duration-300 group-hover:scale-110"><MapPin className="h-5 w-5" /></span>
                <h4 className="font-heading text-sm font-semibold text-temple-ink mb-1">{tContact("templeAddress")}</h4>
                <p className="text-xs text-temple-soft">{tTempleInfo("address")}</p>
              </div>
              <div className="group p-6 rounded-2xl border border-temple-sand bg-temple-card shadow-[0_4px_16px_rgba(74,16,22,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-temple-gold/50 hover:shadow-[0_16px_40px_rgba(217,164,58,0.18)]">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-temple-night text-temple-gold transition-transform duration-300 group-hover:scale-110"><Phone className="h-5 w-5" /></span>
                <h4 className="font-heading text-sm font-semibold text-temple-ink mb-1">{tContact("phone")}</h4>
                <p className="text-xs text-temple-soft">{siteConfig.contact.phone}</p>
              </div>
              <div className="group p-6 rounded-2xl border border-temple-sand bg-temple-card shadow-[0_4px_16px_rgba(74,16,22,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-temple-gold/50 hover:shadow-[0_16px_40px_rgba(217,164,58,0.18)]">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-temple-night text-temple-gold transition-transform duration-300 group-hover:scale-110"><Mail className="h-5 w-5" /></span>
                <h4 className="font-heading text-sm font-semibold text-temple-ink mb-1">{tContact("email")}</h4>
                <p className="text-xs text-temple-soft">{siteConfig.contact.email}</p>
              </div>
              <div className="group p-6 rounded-2xl border border-temple-sand bg-temple-card shadow-[0_4px_16px_rgba(74,16,22,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-temple-gold/50 hover:shadow-[0_16px_40px_rgba(217,164,58,0.18)]">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-temple-night text-temple-gold transition-transform duration-300 group-hover:scale-110"><Clock className="h-5 w-5" /></span>
                <h4 className="font-heading text-sm font-semibold text-temple-ink mb-1">{tContact("hours")}</h4>
                <p className="text-xs text-temple-soft">{tTempleInfo("templeHours.morning")}</p>
                <p className="text-xs text-temple-soft">{tTempleInfo("templeHours.evening")}</p>
              </div>
            </div>

            <div className="relative h-[350px] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(74,16,22,0.15)] border-[5px] border-temple-gold/40">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3932.061618582315!2d80.0182781!3d9.7608483!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3affab4e1c493f45%3A0x841075c87fa8270a!2z4K6u4K6y4K-N4K6y4K6-4K6V4K6u4K-NIOCuqOCvgOCusuCuv-Cur-CuruCvjeCuquCuqeCviCDgrqrgrr_grrPgr43grrPgr4jgrq_grr7grrDgr40g4K6G4K6y4K6v4K6u4K-NIHwgTWFsbGFrYW0gTmVlbGl5YW1wYW5haSBQaWxsYWl5YXIgS292aWw!5e0!3m2!1sen!2slk!4v1779983305229!5m2!1sen!2slk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Temple location"
                className="rounded-3xl"
              />
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}