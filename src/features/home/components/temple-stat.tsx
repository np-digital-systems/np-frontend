import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { TEMPLE_STATS } from "../constants/temple-info";

export type TempleStatIcon = "heritage" | "devotees" | "festivals" | "worship";

interface TempleStatProps {
  value: string;
  label: string;
  icon: TempleStatIcon;
  className?: string;
}

function StatIllustration({ icon }: { icon: TempleStatIcon }) {
  if (icon === "worship") {
    return (
      <span className="text-xl leading-none md:text-[2.25rem]" aria-hidden="true">
        ॐ
      </span>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 md:h-9 md:w-9"
      aria-hidden="true"
    >
      {icon === "heritage" && (
        <>
          <path d="M3.5 21h17" />
          <path d="M5.5 21v-3.5h13V21" />
          <path d="M7 17.5V14h10v3.5" />
          <path d="M8.5 14v-3.5h7V14" />
          <path d="M10 10.5V7.5h4v3" />
          <path d="M12 7.5V4.5" />
          <circle cx="12" cy="3.5" r="1" fill="currentColor" stroke="none" />
          <path d="M10.8 21v-2a1.2 1.2 0 0 1 2.4 0v2" />
          <path d="M9.5 12.2h.01M14.5 12.2h.01M8.5 15.8h.01M15.5 15.8h.01" strokeWidth="2" />
        </>
      )}
      {icon === "devotees" && (
        <>
          <path d="M11.6 3.5c-1 0-1.6.9-1.6 2l-.4 6.3-3.1 3.6c-.6.7-.5 1.6.1 2.1l2.6 2.9" />
          <path d="M12.4 3.5c1 0 1.6.9 1.6 2l.4 6.3 3.1 3.6c.6.7.5 1.6-.1 2.1l-2.6 2.9" />
          <path d="M12 3.6V17" />
          <path d="M8.6 20.4h6.8" />
          <path d="M5 6.5 3.8 5.6M19 6.5l1.2-.9M4.5 10H3M19.5 10H21" />
        </>
      )}
      {icon === "festivals" && (
        <>
          <path
            d="M12 2.8c1.7 2.1 2.3 3.6 1.7 5A1.8 1.8 0 0 1 12 9a1.8 1.8 0 0 1-1.7-1.2c-.6-1.4 0-2.9 1.7-5Z"
            fill="currentColor"
            fillOpacity="0.35"
          />
          <path d="M12 9v3" />
          <path d="M3.5 12.5h17c0 3-3.8 5.5-8.5 5.5s-8.5-2.5-8.5-5.5Z" />
          <path d="m20.5 12.5 1.8-1.6" />
          <path d="M12 18v2.5M8.5 20.8h7" />
          <path d="m6.2 6.4 1 .9M17.8 6.4l-1 .9M12 .9v.01" />
        </>
      )}
    </svg>
  );
}

function CornerKolam({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      className={cn("pointer-events-none absolute hidden h-12 w-12 text-temple-gold/40 md:block", className)}
      aria-hidden="true"
    >
      <path d="M0 18a18 18 0 0 1 18-18" strokeWidth="1" />
      <path d="M0 30A30 30 0 0 1 30 0" strokeWidth="0.8" strokeDasharray="2 3" />
      <circle cx="7" cy="7" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="14" cy="3.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="14" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TempleStat({ value, label, icon, className }: TempleStatProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col items-center px-1 py-5 text-center",
        "md:overflow-hidden md:rounded-2xl md:border md:border-temple-sand md:bg-temple-card md:px-5 md:pb-7 md:pt-9",
        "md:shadow-[0_6px_24px_rgba(74,16,22,0.06)] md:transition-all md:duration-500",
        "md:hover:-translate-y-1.5 md:hover:border-temple-gold/50 md:hover:shadow-[0_20px_44px_rgba(217,164,58,0.2)]",
        className
      )}
    >
      <span className="absolute inset-x-0 top-0 hidden h-1 bg-gradient-to-r from-temple-gold via-temple-saffron to-temple-gold md:block" />
      <CornerKolam className="left-0 top-1" />
      <CornerKolam className="bottom-0 right-0 rotate-180" />

      <div className="relative mb-1.5 flex items-center justify-center md:mb-5 md:h-[4.5rem] md:w-[4.5rem]">
        <svg
          viewBox="0 0 80 80"
          fill="none"
          className="temple-spin-slow absolute inset-0 hidden h-full w-full text-temple-gold md:block"
          aria-hidden="true"
        >
          <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="1.5" strokeDasharray="1 5" strokeLinecap="round" />
        </svg>
        <span className="flex items-center justify-center text-temple-gold transition-transform duration-500 md:h-14 md:w-14 md:rounded-full md:bg-gradient-to-br md:from-temple-maroon md:to-temple-night md:text-temple-gold-soft md:shadow-[0_8px_20px_rgba(74,16,22,0.3)] md:group-hover:scale-110">
          <StatIllustration icon={icon} />
        </span>
      </div>

      <span className="font-heading text-lg font-bold leading-tight text-temple-gold-soft md:text-4xl md:text-temple-kumkum">
        {value}
      </span>

      <span className="my-3 hidden items-center gap-1.5 text-temple-gold md:flex" aria-hidden="true">
        <span className="h-px w-6 bg-current" />
        <span className="h-1.5 w-1.5 rotate-45 bg-current" />
        <span className="h-px w-6 bg-current" />
      </span>

      <span className="mt-0.5 text-[10px] leading-tight text-temple-paper/70 md:mt-0 md:text-sm md:font-medium md:text-temple-soft">
        {label}
      </span>
    </div>
  );
}

export function TempleStats({ className }: { className?: string }) {
  const t = useTranslations("TempleInfo");

  return (
    <div
      className={cn(
        "grid grid-cols-4 divide-x divide-temple-gold/20 overflow-hidden rounded-2xl bg-gradient-to-br from-temple-maroon to-temple-night shadow-[0_16px_40px_rgba(74,16,22,0.25)]",
        "md:gap-6 md:divide-x-0 md:overflow-visible md:rounded-none md:bg-none md:shadow-none",
        className
      )}
    >
      {TEMPLE_STATS.map((stat) => (
        <TempleStat
          key={stat.id}
          value={stat.value}
          label={t(`stats.${stat.id}`)}
          icon={stat.id}
        />
      ))}
    </div>
  );
}
