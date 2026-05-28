import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        align === "center" && "text-center",
        className
      )}
    >
      {subtitle && (
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#D4AF37] mb-3 font-sans">
          {subtitle}
        </p>
      )}
      <h2
        className={cn(
          "font-heading font-semibold text-[#1A1C1C]",
          "text-3xl md:text-4xl lg:text-[48px] leading-tight"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-base md:text-lg text-[#4D4635] leading-relaxed font-sans",
            align === "center" && "max-w-2xl mx-auto"
          )}
        >
          {description}
        </p>
      )}
      {/* Decorative underline */}
      <div
        className={cn(
          "mt-6 flex items-center gap-2",
          align === "center" ? "justify-center" : "justify-start"
        )}
      >
        <span className="w-8 h-[2px] bg-[#D4AF37]" />
        <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
        <span className="w-8 h-[2px] bg-[#D4AF37]" />
      </div>
    </div>
  );
}
