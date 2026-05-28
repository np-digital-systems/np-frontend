import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function Loading({ className, size = "md", text }: LoadingProps) {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className
      )}
    >
      <div className="relative">
        <div
          className={cn(
            "rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin",
            sizeMap[size]
          )}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[#D4AF37] text-xs font-heading">ॐ</span>
        </div>
      </div>
      {text && (
        <p className="text-sm text-[#4D4635] font-sans animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
      <Loading size="lg" text="Loading sacred content..." />
    </div>
  );
}
