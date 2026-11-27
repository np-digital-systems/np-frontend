import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  description,
  align = "center",
  tone = "light",
  className,
}: SectionHeaderProps) {
  const onDark = tone === "dark";

  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        align === "center" && "text-center",
        className
      )}
    >
      {subtitle && (
        <p
          className={cn(
            "mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em]",
            onDark ? "text-temple-gold" : "text-temple-kumkum"
          )}
        >
          <span className="h-1.5 w-1.5 rotate-45 bg-current" />
          {subtitle}
          <span className="h-1.5 w-1.5 rotate-45 bg-current" />
        </p>
      )}
      <h2
        className={cn(
          "font-heading font-semibold",
          "text-3xl md:text-4xl lg:text-[3.25rem] leading-tight",
          onDark ? "text-temple-paper" : "text-temple-ink"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-5 text-base md:text-lg leading-relaxed",
            onDark ? "text-temple-paper/70" : "text-temple-soft",
            align === "center" && "max-w-2xl mx-auto"
          )}
        >
          {description}
        </p>
      )}
      <svg
        viewBox="0 0 120 16"
        fill="none"
        className={cn(
          "mt-6 h-4 w-28 text-temple-gold",
          align === "center" && "mx-auto"
        )}
        aria-hidden="true"
      >
        <path d="M2 8 H44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M76 8 H118" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M60 1 L67 8 L60 15 L53 8 Z" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="60" cy="8" r="2" fill="currentColor" />
        <circle cx="48" cy="8" r="1.5" fill="currentColor" />
        <circle cx="72" cy="8" r="1.5" fill="currentColor" />
      </svg>
    </div>
  );
}
