import { PortalShell } from '@/components/layouts/portal-layout/portal-shell';

import { requireSession } from '@/features/auth/lib/session';
import { getPortalNavigation } from '@/features/auth/lib/navigation';
import { getNotifications } from '@/features/notification/lib/notification-service';
import { getFinancialYearContext } from '@/lib/financial-year';

interface PortalLayoutProps {
  children: React.ReactNode;
}

export default async function PortalLayout({ children }: PortalLayoutProps) {
  // Identity is resolved once, here, and the navigation is filtered from the
  // same role the dashboard renders for — so the sidebar can never offer a
  // destination the page itself would refuse.
  const { user, permissions } = await requireSession();

  const navigation = getPortalNavigation(permissions, user.role);

  // The header's badge counts the same inbox the notifications page shows.
  const notifications = await getNotifications().catch(() => []);

  // Resolved here rather than in the header so every page under this layout
  // reads the same year the header is showing.
  const { years, active } = await getFinancialYearContext();

  return (
    <div className="portal-theme min-h-screen bg-background text-foreground">
      <PortalShell
        navigation={navigation}
        notifications={notifications}
        user={user}
        financialYears={years}
        activeFinancialYear={active}
      >
        {children}
      </PortalShell>
    </div>
  );
}
