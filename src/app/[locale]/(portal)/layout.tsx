import { PortalShell } from '@/components/layouts/portal-layout/portal-shell';

import { getCurrentUser } from '@/features/auth/lib/session';
import { getPortalNavigation } from '@/features/auth/lib/navigation';

interface PortalLayoutProps {
  children: React.ReactNode;
}

export default async function PortalLayout({ children }: PortalLayoutProps) {
  // Identity is resolved once, here, and the navigation is filtered from the
  // same role the dashboard renders for — so the sidebar can never offer a
  // destination the page itself would refuse.
  const user = await getCurrentUser();

  const navigation = getPortalNavigation(user.role);

  return (
    <div className="portal-theme min-h-screen bg-background text-foreground">
      <PortalShell navigation={navigation} user={user}>
        {children}
      </PortalShell>
    </div>
  );
}
