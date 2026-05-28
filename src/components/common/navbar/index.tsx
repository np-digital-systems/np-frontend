"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, MapPin } from "lucide-react";
import { mainNavItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { useUI } from "@/store/ui.store";

export function Navbar() {
  const { state, dispatch } = useUI();
  const isMobileMenuOpen = state.isMobileMenuOpen;
  const { isScrolled } = useScroll(50);

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
      <div className="mx-auto max-w-[1280px] px-4 md:px-16 flex items-center justify-between">
        
        {/* Logo / Temple Name */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          onClick={closeMobileMenu}
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

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className={cn(
              "hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
              "bg-[#8B0000] text-white hover:bg-[#A00000] hover:shadow-[0_4px_16px_rgba(139,0,0,0.3)]"
            )}
          >
            <MapPin className="w-4 h-4" />
            Donate
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            id="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            className={cn(
              "lg:hidden flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
              isScrolled
                ? "text-[#1A1C1C] hover:bg-[#FAF9F6]"
                : "text-white hover:bg-white/10"
            )}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 top-0 bg-white z-40 transition-all duration-500 lg:hidden",
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto translate-y-0"
            : "opacity-0 pointer-events-none -translate-y-4"
        )}
      >
        <div className="flex flex-col items-center justify-center h-full gap-6 px-8">
          <Link
            href="/"
            className="flex items-center gap-3 mb-8"
            onClick={closeMobileMenu}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F4C430] overflow-hidden">
              <Image
                src="/images/logo.png"
                alt={siteConfig.shortName}
                width={44}
                height={44}
                className="object-contain"
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
              className="text-2xl font-heading font-medium text-[#1A1C1C] hover:text-[#D4AF37] transition-colors duration-300"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/contact"
            onClick={closeMobileMenu}
            className="mt-4 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#8B0000] text-white font-semibold text-lg hover:bg-[#A00000] transition-all duration-300"
          >
            <MapPin className="w-5 h-5" />
            Donate
          </Link>
        </div>
      </div>
    </header>
  );
}
