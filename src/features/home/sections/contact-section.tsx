import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { PageContainer } from "@/components/common/page-container";
import { SectionHeader } from "@/components/common/section-header";
import { siteConfig } from "@/config/site";

export function ContactSection() {
  return (
    <PageContainer id="contact-section" className="bg-[#FAF9F6]">
      <SectionHeader
        subtitle="Find Us"
        title="Visit Our Sacred Grounds"
        align="left"
        description="We welcome all devotees and visitors to experience the divine presence of Lord Pillaiyar."
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
                Temple Address
              </h4>
              <p className="text-sm text-[#4D4635] leading-relaxed">
                {siteConfig.contact.address}
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
                Phone
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
                Email
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
                Temple Hours
              </h4>
              <div className="space-y-1">
                <p className="text-sm text-[#4D4635]">
                  <span className="text-[#7F7663]">Morning:</span>{" "}
                  {siteConfig.templeHours.morning}
                </p>
                <p className="text-sm text-[#4D4635]">
                  <span className="text-[#7F7663]">Evening:</span>{" "}
                  {siteConfig.templeHours.evening}
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
            Get Directions
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Map Area */}
        <div className="reveal-right">
          <div className="relative h-full min-h-[400px] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[#D0C5AF]/20">
            {/* Static map placeholder - replace with Google Maps embed */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.8!2d80.0!3d9.8!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sMallakam%2C%20Jaffna!5e0!3m2!1sen!2slk!4v1"
              width="100%"
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
                {siteConfig.shortName}
              </p>
              <p className="text-xs text-[#7F7663] leading-relaxed">
                {siteConfig.contact.address}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
