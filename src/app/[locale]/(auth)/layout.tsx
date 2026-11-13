import { siteFontClassName } from "@/components/site/site-fonts";
import { cn } from "@/lib/utils";

// Site look without site chrome: sign-in sits between the public website and the portal.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn(siteFontClassName, "site-shell min-h-screen")}>
      {children}
    </div>
  );
}
