"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import { mainNavItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { useUI } from "@/store/ui.store";

export function Navbar() {
  const { state, dispatch } = useUI();
  const isMobileMenuOpen = state.isMobileMenuOpen;
  const { isScrolled } = useScroll(50);
  const pathname = usePathname();

  const closeMobileMenu = useCallback(() => {
    dispatch({ type: "CLOSE_MOBILE_MENU" });
  }, [dispatch]);

  const toggleMobileMenu = useCallback(() => {
    dispatch({ type: "TOGGLE_MOBILE_MENU" });
  }, [dispatch]);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = isMobileMenuOpen ? "hidden" : previousOverflow;

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [closeMobileMenu]);

  const isDarkOnTop = !isScrolled && !isMobileMenuOpen;

  return (
    <>
      <header
        id="main-navbar"
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          isScrolled || isMobileMenuOpen
            ? "bg-[#FAF9F6]/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(26,28,28,0.08)] "
            : "bg-transparent "
        )}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 md:px-16 lg:py-5">
          <Link
            href="/"
            className="group flex items-center gap-3"
            onClick={closeMobileMenu}
            aria-label={siteConfig.shortName}
          >
            <div
              className={cn(
                "flex items-center justify-center overflow-hidden rounded-2xl border transition-all duration-300",
                isDarkOnTop
                  ? "border-white/20 bg-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                  : "border-[#D4AF37]/20 bg-gradient-to-br from-[#D4AF37] to-[#F4C430] shadow-[0_10px_24px_rgba(212,175,55,0.22)]"
              )}
            >
              <Image
                src="/logo-dark.png"
                alt={siteConfig.shortName}
                width={40}
                height={40}
                className="object-contain rounded-full transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="hidden sm:block">
              
              <p
                className={cn(
                  "font-heading text-sm font-semibold md:text-base transition-colors duration-300",
                  isDarkOnTop ? "text-white" : "text-[#1A1C1C]"
                )}
              >
                {siteConfig.shortName}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex" aria-label="Primary">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                    isDarkOnTop
                      ? "text-white/80 hover:bg-white/10 hover:text-white"
                      : "text-[#4D4635] hover:bg-[#FFFFFF] hover:text-[#735C00]",
                    isActive &&
                      (isDarkOnTop
                        ? "bg-white/12 text-white"
                        : "bg-[#FFF8E1] text-[#735C00]")
                  )}
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className={cn(
                "hidden items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 lg:inline-flex",
                isDarkOnTop
                  ? "border-white/15 bg-white/8 text-white/85 hover:bg-white/12"
                  : "border-[#D4AF37]/20 bg-white text-[#4D4635] hover:border-[#D4AF37]/40 hover:text-[#735C00]"
              )}
            >
              <Phone className="h-4 w-4" />
              Call Temple
            </a>

            <button
              id="mobile-menu-toggle"
              type="button"
              onClick={toggleMobileMenu}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 lg:hidden",
                isMobileMenuOpen
                  ? "border-[#D4AF37]/20 bg-[#FFF8E1] text-[#1A1C1C]"
                  : isDarkOnTop
                    ? "border-white/15 bg-white/10 text-white"
                    : "border-[#D4AF37]/20 bg-white text-[#1A1C1C]"
              )}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-[60] lg:hidden transition-all duration-300",
          isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!isMobileMenuOpen}
      >
        <button
          type="button"
          aria-label="Close mobile menu"
          className={cn(
            "absolute inset-0 bg-[#1A1C1C]/55 backdrop-blur-sm transition-opacity duration-300",
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={closeMobileMenu}
          tabIndex={-1}
        />

        <aside
          id="mobile-navigation"
          className={cn(
            "absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-[#FAF9F6] px-6 pb-8 pt-6 shadow-[0_24px_80px_rgba(26,28,28,0.2)] transition-transform duration-300",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F4C430] shadow-[0_10px_24px_rgba(212,175,55,0.22)]">
                <Image
                  src="/logo-dark.png"
                  alt={siteConfig.shortName}
                  width={34}
                  height={34}
                  className="object-contain"
                />
              </div>
              <div>
                <p className="font-heading text-sm font-semibold text-[#1A1C1C]">
                  {siteConfig.shortName}
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={closeMobileMenu}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#D4AF37]/20 bg-white text-[#1A1C1C]"
              aria-label="Close mobile menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          

          <nav className="mt-8 flex flex-1 flex-col gap-3 overflow-y-auto pr-1" aria-label="Mobile primary">
            {mainNavItems.map((item, index) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={cn(
                    "group flex items-center justify-between rounded-[22px] border px-5 py-4 transition-all duration-300",
                    isActive
                      ? "border-[#D4AF37]/25 bg-[#FFF8E1] text-[#735C00]"
                      : "border-transparent bg-white text-[#1A1C1C] shadow-[0_8px_24px_rgba(26,28,28,0.04)] hover:border-[#D4AF37]/15 hover:bg-[#FFFCF1]",
                    "animate-[fadeIn_0.35s_ease-out_both]"
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span className="font-heading text-xl font-semibold">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1A1C1C] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2A2C2C]"
            >
              <Phone className="h-4 w-4" />
              Call temple
            </a>
            <Link
              href="/contact"
              onClick={closeMobileMenu}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D4AF37]/20 bg-white px-5 py-3 text-sm font-medium text-[#4D4635] transition-colors hover:border-[#D4AF37]/35 hover:text-[#735C00]"
            >
              Visit us
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}