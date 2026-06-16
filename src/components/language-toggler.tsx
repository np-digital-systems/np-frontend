"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

interface LanguageTogglerProps {
  isDarkOnTop?: boolean;
}

export function LanguageToggler({ isDarkOnTop }: LanguageTogglerProps) {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const nextLocale: Locale = currentLocale === "ta" ? "en" : "ta";
    
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-300",
        isDarkOnTop
          ? "border-white/15 bg-white/10 text-white hover:bg-white/20"
          : "border-[#D4AF37]/20 bg-white text-[#4D4635] hover:border-[#D4AF37]/40 hover:text-[#735C00]"
      )}
      aria-label={currentLocale === "ta" ? "Switch to English" : "ஆங்கிலத்திற்கு மாற்றவும்"}
    >
      <Globe className="h-4 w-4" />
{currentLocale === "ta" ? (
        <span>
          <span className="sm:hidden">EN</span>
          <span className="hidden sm:inline">English</span>
        </span>
      ) : (
        <span className="font-sans">
          <span className="sm:hidden">த</span>
          <span className="hidden sm:inline">தமிழ்</span>
        </span>
      )}    </button>
  );
}