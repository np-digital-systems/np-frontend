// Portal theme without portal chrome: there's no session yet for a sidebar or user menu.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="portal-theme min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
