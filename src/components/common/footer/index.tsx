import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { siteConfig } from "@/config/site";
import { footerNavItems } from "@/config/navigation";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

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
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4AF37] transition-all duration-300 text-white/60 hover:text-white text-xs font-semibold uppercase"
                  aria-label={name}
                >
                  {name[0].toUpperCase()}
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
