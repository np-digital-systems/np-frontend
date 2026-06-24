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
  // amount,
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
          ? "bg-gradient-to-br from-[#8B0000] to-[#6B0000] text-white shadow-[0_16px_48px_rgba(139,0,0,0.25)] scale-[1.02]"
          : "bg-white text-[#1A1C1C] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(212,175,55,0.15)]",
        "hover:-translate-y-1",
        className
      )}
    >
      {/* {isFeatured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F4C430] text-xs font-bold text-white uppercase tracking-wider shadow-lg">
          Most Popular
        </span>
      )} */}

      <h3
        className={cn(
          "font-heading text-xl font-semibold mb-2",
          isFeatured ? "text-white" : "text-[#1A1C1C]"
        )}
      >
        {title}
      </h3>

     
      <p
        className={cn(
          "text-sm leading-relaxed mb-6",
          isFeatured ? "text-white/80" : "text-[#4D4635]"
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
                isFeatured ? "text-[#F4C430]" : "text-[#D4AF37]"
              )}
            />
            <span className={isFeatured ? "text-white/90" : "text-[#4D4635]"}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button
        className={cn(
          "w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300",
          isFeatured
            ? "bg-white text-[#8B0000] hover:bg-[#F4C430] hover:text-white hover:shadow-lg"
            : "bg-gradient-to-r from-[#D4AF37] to-[#F4C430] text-white hover:shadow-[0_4px_16px_rgba(212,175,55,0.3)]"
        )}
      >
        {tDonation("donateNow")}
      </button>
    </div>
  );
}
