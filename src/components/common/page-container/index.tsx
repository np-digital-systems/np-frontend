import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div" | "main";
  id?: string;
  fullWidth?: boolean;
}

export function PageContainer({
  children,
  className,
  as: Component = "section",
  id,
  fullWidth = false,
}: PageContainerProps) {
  return (
    <Component
      id={id}
      className={cn(
        "py-[60px] md:py-[120px]",
        !fullWidth && "px-4 md:px-16",
        className
      )}
    >
      <div
        className={cn(
          !fullWidth && "mx-auto max-w-[1280px]"
        )}
      >
        {children}
      </div>
    </Component>
  );
}
