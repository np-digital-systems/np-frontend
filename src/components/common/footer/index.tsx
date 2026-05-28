import Link from "next/link";
import React from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { siteConfig } from "@/config/site";
import { footerNavItems } from "@/config/navigation";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialMediaIcons: Record<string, React.ReactNode> = {
    facebook: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4"
        aria-hidden="true"
      >
        <path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 4.99 3.66 9.12 8.44 9.93v-7.03H8.9v-2.9h1.54V9.41c0-1.52.9-2.36 2.28-2.36.66 0 1.35.12 1.35.12v1.49h-.76c-.75 0-.98.47-.98.95v1.15h1.67l-.27 2.9h-1.4V22c4.78-.81 8.44-4.94 8.44-9.93z" />
      </svg>
    ),
    instagram: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="w-4 h-4"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17.5" cy="6.5" r="0.5" />
      </svg>
    ),
    youtube: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4"
        aria-hidden="true"
      >
        <path d="M23.5 7.1a3 3 0 0 0-2.1-2.1C19.8 4.5 12 4.5 12 4.5s-7.8 0-9.4.5A3 3 0 0 0 .5 7.1 30 30 0 0 0 0 12a30 30 0 0 0 .5 4.9 3 3 0 0 0 2.1 2.1c1.6.5 9.4.5 9.4.5s7.8 0 9.4-.5a3 3 0 0 0 2.1-2.1A30 30 0 0 0 24 12a30 30 0 0 0-.5-4.9zM10 15V9l5 3-5 3z" />
      </svg>
    ),
  };

  return (
    <footer
      id="site-footer"
      className="bg-[#1A1C1C] text-white/80 relative overflow-hidden"
    >
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

      <div className="mx-auto max-w-[1280px] px-4 md:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Temple Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center rounded-full">
                <Image
                  src="/logo-light.png"
                  alt={siteConfig.shortName}
                  width={48}
                  height={48}
                  className="object-contain rounded-full"
                />
              </div>
              <h3 className="font-heading text-lg font-semibold text-white">
                {siteConfig.shortName}
              </h3>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              A sacred sanctuary of spirituality, tradition, and timeless
              devotion in the heart of Mallakam.
            </p>
            <div className="flex gap-4">
              {Object.entries(siteConfig.links).map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4AF37] transition-colors duration-300 text-white/60 hover:text-white"
                  aria-label={name}
                  title={name}
                >
                  {socialMediaIcons[name.toLowerCase()] ?? (
                    <span className="text-sm font-semibold">{name[0].toUpperCase()}</span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-[#D4AF37] uppercase tracking-wider mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {footerNavItems.quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/60 hover:text-[#D4AF37] transition-colors duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-[#D4AF37] uppercase tracking-wider mb-6">
              Services
            </h4>
            <ul className="space-y-3">
              {footerNavItems.services.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/60 hover:text-[#D4AF37] transition-colors duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-[#D4AF37] uppercase tracking-wider mb-6">
              Visit Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                {siteConfig.contact.address}
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/60">
                <Clock className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <div>
                  <p>{siteConfig.templeHours.morning}</p>
                  <p>{siteConfig.templeHours.evening}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Built with devotion by{" "}
            <a
              href="#"
              className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors"
            >
              NP Digital
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
