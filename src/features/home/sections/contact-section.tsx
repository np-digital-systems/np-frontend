import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { PageContainer } from "@/components/common/page-container";
import { SectionHeader } from "@/components/common/section-header";
import { siteConfig } from "@/config/site";
import { useTranslations } from "next-intl";

export function ContactSection() {

  const tContact = useTranslations("Home.Contact");
  const templeInfo = useTranslations("TempleInfo");
  return (
    <PageContainer id="contact-section" className="bg-[#FAF9F6]">
      <SectionHeader
        subtitle={tContact("subtitle")}
        title={tContact("title")}
        align="left"
        description={tContact("description")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Contact Information */}
        <div className="space-y-8 reveal-left">
          {/* Address */}
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-[#F4C430]/10 shrink-0">
              <MapPin className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="font-heading text-base font-semibold text-[#1A1C1C] mb-1">
                {tContact("templeAddress")}
              </h4>
              <p className="text-sm text-[#4D4635] leading-relaxed">
                {templeInfo("address")}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-[#F4C430]/10 shrink-0">
              <Phone className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="font-heading text-base font-semibold text-[#1A1C1C] mb-1">
                {tContact("Phone")}
              </h4>
              <a
                href={`tel:${siteConfig.contact.phone}`}
                className="text-sm text-[#4D4635] hover:text-[#D4AF37] transition-colors"
              >
                {siteConfig.contact.phone}
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-[#F4C430]/10 shrink-0">
              <Mail className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="font-heading text-base font-semibold text-[#1A1C1C] mb-1">
                {tContact("Email")}
              </h4>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="text-sm text-[#4D4635] hover:text-[#D4AF37] transition-colors"
              >
                {siteConfig.contact.email}
              </a>
            </div>
          </div>

          {/* Temple Hours */}
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-[#F4C430]/10 shrink-0">
              <Clock className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="font-heading text-base font-semibold text-[#1A1C1C] mb-1">
                {tContact("templeHours")}
              </h4>
              <div className="space-y-1">
                <p className="text-sm text-[#4D4635]">
                  <span className="text-[#7F7663]">{tContact("morning")}:</span>{" "}
                  {templeInfo("templeHours.morning")}
                </p>
                <p className="text-sm text-[#4D4635]">
                  <span className="text-[#7F7663]">{tContact("afternoon")}:</span>{" "}
                  {templeInfo("templeHours.afternoon")}
                </p>
                <p className="text-sm text-[#4D4635]">
                  <span className="text-[#7F7663]">{tContact("evening")}:</span>{" "}
                  {templeInfo("templeHours.evening")}
                </p>
              </div>
            </div>
          </div>

          {/* Get Directions Button */}
          <a
            href={siteConfig.contact.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4C430] text-white text-sm font-semibold hover:shadow-[0_4px_16px_rgba(212,175,55,0.3)] transition-all duration-300"
          >
            <MapPin className="w-4 h-4" />
            {tContact("getDirections")}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Map Area */}
        <div className="reveal-right">
          <div className="relative h-full min-h-[400px] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[#D0C5AF]/20">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3932.061618582315!2d80.0182781!3d9.7608483!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3affab4e1c493f45%3A0x841075c87fa8270a!2z4K6u4K6y4K-N4K6y4K6-4K6V4K6u4K-NIOCuqOCvgOCusuCuv-Cur-CuruCvjeCuquCuqeCviCDgrqrgrr_grrPgr43grrPgr4jgrq_grr7grrDgr40g4K6G4K6y4K6v4K6u4K-NIHwgTWFsbGFrYW0gTmVlbGl5YW1wYW5haSBQaWxsYWl5YXIgS292aWw!5e0!3m2!1sen!2slk!4v1779983305229!5m2!1sen!2slk" width="100%"
              height="100%"
              style={{ border: 0, minHeight: "400px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Temple location map"
              className="rounded-3xl"
            />

            {/* Map overlay card */}
            <div className="absolute top-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-md shadow-lg max-w-[200px]">
              <p className="font-heading text-sm font-semibold text-[#1A1C1C] mb-1">
                {templeInfo("shortName")}
              </p>
              <p className="text-xs text-[#7F7663] leading-relaxed">
                {templeInfo("address")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
