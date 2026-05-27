import { cn } from "@/lib/utils";

interface TempleStatProps {
  value: string;
  label: string;
  icon: string;
  className?: string;
}

export function TempleStat({ value, label, icon, className }: TempleStatProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 p-6 rounded-2xl",
        "bg-white/80 backdrop-blur-sm border border-[#D4AF37]/10",
        "transition-all duration-300 hover:shadow-[0_8px_24px_rgba(212,175,55,0.12)]",
        className
      )}
    >
      <span className="text-2xl mb-1">{icon}</span>
      <span className="text-2xl md:text-3xl font-heading font-bold text-[#735C00]">
        {value}
      </span>
      <span className="text-xs font-semibold uppercase tracking-wider text-[#7F7663]">
        {label}
      </span>
    </div>
  );
}
