"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { mainNavItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";
import { useScroll } from "@/hooks/use-scroll";
import { useUI } from "@/store/ui.store";

export function Navbar() {
  const { state, dispatch } = useUI();
  const isMobileMenuOpen = state.isMobileMenuOpen;
  const { isScrolled } = useScroll(50);
  const isMobile = useMobile();

  const closeMobileMenu = useCallback(() => {
    dispatch({ type: "CLOSE_MOBILE_MENU" });
  }, [dispatch]);

  const toggleMobileMenu = useCallback(() => {
    dispatch({ type: "TOGGLE_MOBILE_MENU" });
  }, [dispatch]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      id="main-navbar"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(212,175,55,0.08)] py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 md:px-16">
        <Link
          href="/"
          className="flex items-center gap-2 group"
        >
          <div
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 overflow-hidden",
              isScrolled
                ? "bg-gradient-to-br from-[#D4AF37] to-[#F4C430]"
                : "bg-white/20 backdrop-blur-sm border border-white/30"
            )}
          >
            <Image
              src="/logo-dark.png"
              alt={siteConfig.shortName}
              width={34}
              height={34}
              className="object-contain"
            />
          </div>
          <span
            className={cn(
              "font-heading font-semibold text-sm md:text-base transition-colors duration-300 hidden sm:inline-block",
              isScrolled ? "text-[#1A1C1C]" : "text-white"
            )}
          >
            {siteConfig.shortName}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1" role="navigation">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                isScrolled
                  ? "text-[#4D4635] hover:text-[#735C00] hover:bg-[#FAF9F6]"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {isMobile && (
          <button
            id="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
              isScrolled
                ? "text-[#1A1C1C] hover:bg-[#FAF9F6]"
                : "text-white hover:bg-white/10"
            )}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
           <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-white/96 backdrop-blur-md transition-all duration-500 lg:hidden",
          isMobileMenuOpen
            ? "pointer-events-auto opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 -translate-y-4"
        )}
      >
        {isMobile && (
          <button
            id="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            className={cn(
              "absolute right-8 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#D4AF37]/20 bg-[#FAF9F6] text-[#1A1C1C] shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:border-[#D4AF37]/40 hover:bg-[#FFF8E1] hover:text-[#735C00]"
            )}
            aria-label="Close menu"
            aria-expanded={isMobileMenuOpen}
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="flex h-full flex-col items-center justify-center gap-6 px-8 pt-20">
          <Link
            href="/"
            className="mb-8 flex items-center gap-3"
            onClick={closeMobileMenu}
          >
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F4C430] shadow-[0_8px_24px_rgba(212,175,55,0.25)]">
              <Image
                src="/logo-dark.png"
                alt={siteConfig.shortName}
                width={44}
                height={44}
                className="object-contain rounded-full"
              />
            </div>
            <span className="font-heading text-xl font-semibold text-[#1A1C1C]">
              {siteConfig.shortName}
            </span>
          </Link>

          {mainNavItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileMenu}
              className="font-heading text-2xl font-medium text-[#1A1C1C] transition-colors duration-300 hover:text-[#D4AF37]"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
