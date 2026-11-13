import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { siteFontClassName } from "@/components/site/site-fonts";
import { cn } from "@/lib/utils";

interface SiteLayoutProps {
  children: React.ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div
      className={cn(siteFontClassName, "site-shell flex flex-1 flex-col")}
    >
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
