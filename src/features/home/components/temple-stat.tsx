import { cn } from "@/lib/utils";

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
      <span className="text-[2.25rem] leading-none" aria-hidden="true">
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
      className="h-9 w-9"
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
      className={cn("pointer-events-none absolute h-12 w-12 text-temple-gold/40", className)}
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
        "group relative flex flex-col items-center overflow-hidden rounded-2xl border border-temple-sand bg-temple-card px-5 pb-7 pt-9 text-center",
        "shadow-[0_6px_24px_rgba(74,16,22,0.06)] transition-all duration-500",
        "hover:-translate-y-1.5 hover:border-temple-gold/50 hover:shadow-[0_20px_44px_rgba(217,164,58,0.2)]",
        className
      )}
    >
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-temple-gold via-temple-saffron to-temple-gold" />
      <CornerKolam className="left-0 top-1" />
      <CornerKolam className="bottom-0 right-0 rotate-180" />

      <div className="relative mb-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center">
        <svg
          viewBox="0 0 80 80"
          fill="none"
          className="temple-spin-slow absolute inset-0 h-full w-full text-temple-gold"
          aria-hidden="true"
        >
          <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="1.5" strokeDasharray="1 5" strokeLinecap="round" />
        </svg>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-temple-maroon to-temple-night text-temple-gold-soft shadow-[0_8px_20px_rgba(74,16,22,0.3)] transition-transform duration-500 group-hover:scale-110">
          <StatIllustration icon={icon} />
        </span>
      </div>

      <span className="font-heading text-3xl font-bold text-temple-kumkum md:text-4xl">
        {value}
      </span>

      <span className="my-3 flex items-center gap-1.5 text-temple-gold" aria-hidden="true">
        <span className="h-px w-6 bg-current" />
        <span className="h-1.5 w-1.5 rotate-45 bg-current" />
        <span className="h-px w-6 bg-current" />
      </span>

      <span className="text-sm font-medium text-temple-soft">{label}</span>
    </div>
  );
}
