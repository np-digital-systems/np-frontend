import { cn } from "@/lib/utils";

interface SpiritualDividerProps {
  className?: string;
  variant?: "default" | "lotus" | "om";
}

export function SpiritualDivider({
  className,
  variant = "default",
}: SpiritualDividerProps) {
  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <div className="flex items-center gap-4 w-full max-w-xs">
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/40" />
        <div className="relative">
          {variant === "om" ? (
            <span className="text-[#D4AF37] text-xl font-heading">ॐ</span>
          ) : variant === "lotus" ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[#D4AF37]"
            >
              <path
                d="M12 2C12 2 8 8 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 8 12 2 12 2Z"
                fill="currentColor"
                opacity="0.3"
              />
              <path
                d="M12 6C12 6 9 10 9 12.5C9 14.43 10.34 16 12 16C13.66 16 15 14.43 15 12.5C15 10 12 6 12 6Z"
                fill="currentColor"
                opacity="0.6"
              />
              <circle cx="12" cy="13" r="2" fill="currentColor" />
              <path
                d="M12 16V22"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M9 19C9 19 10.5 18 12 18C13.5 18 15 19 15 19"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <div className="w-3 h-3 rounded-full border-2 border-[#D4AF37] bg-[#D4AF37]/20" />
          )}
        </div>
        <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/40" />
      </div>
    </div>
  );
}
