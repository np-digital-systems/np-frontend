import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { PageContainer } from "@/components/common/page-container";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Neeliyampathi Pillaiyar Kovil. Find temple location, hours, and contact information.",
};

export default function ContactPage() {
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
            Visit Our Sacred Grounds
          </h1>
          <p className="text-white/80 text-lg font-sans max-w-xl mx-auto">
            We welcome all devotees and seekers to experience the divine presence
          </p>
        </div>
      </section>

      <PageContainer className="bg-[#FAF9F6]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="font-heading text-3xl font-semibold text-[#1A1C1C] mb-2">
              Send Us a Message
            </h2>
            <p className="text-[#4D4635] font-sans mb-8">
              Have a question or want to learn more? We&apos;d love to hear from you.
            </p>

            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-semibold text-[#1A1C1C] mb-2"
                  >
                    Full Name
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
                    Email Address
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
                  Subject
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
                  Message
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
                Send Message
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                <MapPin className="w-6 h-6 text-[#D4AF37] mb-3" />
                <h4 className="font-heading text-sm font-semibold text-[#1A1C1C] mb-1">Address</h4>
                <p className="text-xs text-[#4D4635]">{siteConfig.contact.address}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                <Phone className="w-6 h-6 text-[#D4AF37] mb-3" />
                <h4 className="font-heading text-sm font-semibold text-[#1A1C1C] mb-1">Phone</h4>
                <p className="text-xs text-[#4D4635]">{siteConfig.contact.phone}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                <Mail className="w-6 h-6 text-[#D4AF37] mb-3" />
                <h4 className="font-heading text-sm font-semibold text-[#1A1C1C] mb-1">Email</h4>
                <p className="text-xs text-[#4D4635]">{siteConfig.contact.email}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                <Clock className="w-6 h-6 text-[#D4AF37] mb-3" />
                <h4 className="font-heading text-sm font-semibold text-[#1A1C1C] mb-1">Hours</h4>
                <p className="text-xs text-[#4D4635]">{siteConfig.templeHours.morning}</p>
                <p className="text-xs text-[#4D4635]">{siteConfig.templeHours.evening}</p>
              </div>
            </div>

            <div className="relative h-[350px] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[#D0C5AF]/20">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.8!2d80.0!3d9.8!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sMallakam%2C%20Jaffna!5e0!3m2!1sen!2slk!4v1"
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