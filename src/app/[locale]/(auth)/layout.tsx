/**
 * Auth lives in its own group: it wears the portal's tokens — it is the portal's
 * front door — but none of the portal's chrome, since there is no session yet to
 * build a sidebar or a user menu from.
 */
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
