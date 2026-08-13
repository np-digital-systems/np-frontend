import { getPortalNavigation } from '@/features/auth/lib/navigation';
import { PortalSidebar } from '@/components/portal/sidebar';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Temporary while authentication isn't implemented.
  const userRole = 'accountant';

  const navigation = getPortalNavigation(userRole);

  return (
    <div className="portal-theme flex min-h-screen bg-background text-foreground">
      <PortalSidebar navigation={navigation} />

      <main className="min-w-0 flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}