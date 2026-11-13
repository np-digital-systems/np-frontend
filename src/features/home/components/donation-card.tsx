import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface DonationCardProps {
  title: string;
  amount: string;
  description: string;
  features: readonly string[];
  isFeatured?: boolean;
  className?: string;
}

export function DonationCard({
  title,
  description,
  features,
  isFeatured,
  className,
}: DonationCardProps) {

  const tDonation=useTranslations("Home.Donation");
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl p-8 transition-all duration-500",
        isFeatured
          ? "bg-gradient-to-br from-temple-kumkum to-temple-maroon text-temple-paper shadow-[0_16px_48px_rgba(160,31,40,0.25)] scale-[1.02]"
          : "bg-white text-temple-ink shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(217,164,58,0.15)]",
        "hover:-translate-y-1",
        className
      )}
    >
      <h3
        className={cn(
          "font-heading text-xl font-semibold mb-2",
          isFeatured ? "text-white" : "text-temple-ink"
        )}
      >
        {title}
      </h3>

     
      <p
        className={cn(
          "text-sm leading-relaxed mb-6",
          isFeatured ? "text-white/80" : "text-temple-soft"
        )}
      >
        {description}
      </p>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-3 text-sm">
            <Check
              className={cn(
                "w-4 h-4 shrink-0",
                isFeatured ? "text-temple-saffron" : "text-temple-gold"
              )}
            />
            <span className={isFeatured ? "text-white/90" : "text-temple-soft"}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button
        className={cn(
          "w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300",
          isFeatured
            ? "bg-white text-temple-kumkum hover:bg-temple-saffron hover:text-white hover:shadow-lg"
            : "bg-gradient-to-r from-temple-gold to-temple-saffron text-white hover:shadow-[0_4px_16px_rgba(217,164,58,0.3)]"
        )}
      >
        {tDonation("donateNow")}
      </button>
    </div>
  );
}
