import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { PageContainer } from "@/components/common/page-container";
import { siteConfig } from "@/config/site";
import { useTranslations } from "next-intl";

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
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/temple-hero.png"
          alt="Temple gopuram"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#8B0000]/60 to-black/50" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {tContact("title")}
          </h1>
          <p className="text-white/80 text-lg font-sans max-w-xl mx-auto">
            {tContact("subtitle")}
          </p>
        </div>
      </section>

      <PageContainer className="bg-[#FAF9F6]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="font-heading text-3xl font-semibold text-[#1A1C1C] mb-2">
              {tContact("form.title")}
            </h2>
            <p className="text-[#4D4635] font-sans mb-8">
                  {tContact("form.subtitle")}
            </p>

            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-semibold text-[#1A1C1C] mb-2"
                  >
                    {tContact("form.fullName")}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#D0C5AF]/50 text-[#1A1C1C] placeholder:text-[#7F7663]/50 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all duration-300 font-sans text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-semibold text-[#1A1C1C] mb-2"
                  >
                    {tContact("form.email")}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#D0C5AF]/50 text-[#1A1C1C] placeholder:text-[#7F7663]/50 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all duration-300 font-sans text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-sm font-semibold text-[#1A1C1C] mb-2"
                >
                  {tContact("form.subject")}
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#D0C5AF]/50 text-[#1A1C1C] placeholder:text-[#7F7663]/50 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all duration-300 font-sans text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-semibold text-[#1A1C1C] mb-2"
                >
                  {tContact("form.message")}
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  placeholder="Tell us more..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#D0C5AF]/50 text-[#1A1C1C] placeholder:text-[#7F7663]/50 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all duration-300 font-sans text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C430] text-white font-semibold text-sm hover:shadow-[0_4px_16px_rgba(212,175,55,0.3)] transition-all duration-300 hover:scale-[1.01]"
              >
                <Send className="w-4 h-4" />
                {tContact("form.sendMeassage")}
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                <MapPin className="w-6 h-6 text-[#D4AF37] mb-3" />
                <h4 className="font-heading text-sm font-semibold text-[#1A1C1C] mb-1">{tContact("templeAddress")}</h4>
                <p className="text-xs text-[#4D4635]">{tTempleInfo("address")}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                <Phone className="w-6 h-6 text-[#D4AF37] mb-3" />
                <h4 className="font-heading text-sm font-semibold text-[#1A1C1C] mb-1">{tContact("phone")}</h4>
                <p className="text-xs text-[#4D4635]">{siteConfig.contact.phone}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                <Mail className="w-6 h-6 text-[#D4AF37] mb-3" />
                <h4 className="font-heading text-sm font-semibold text-[#1A1C1C] mb-1">{tContact("email")}</h4>
                <p className="text-xs text-[#4D4635]">{siteConfig.contact.email}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                <Clock className="w-6 h-6 text-[#D4AF37] mb-3" />
                <h4 className="font-heading text-sm font-semibold text-[#1A1C1C] mb-1">{tContact("hours")}</h4>
                <p className="text-xs text-[#4D4635]">{tTempleInfo("templeHours.morning")}</p>
                <p className="text-xs text-[#4D4635]">{tTempleInfo("templeHours.evening")}</p>
              </div>
            </div>

            <div className="relative h-[350px] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[#D0C5AF]/20">
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