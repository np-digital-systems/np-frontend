import { PortalShell } from '@/components/layouts/portal-layout/portal-shell';

import { requireSession } from '@/features/auth/lib/session';
import { getPortalNavigation } from '@/features/auth/lib/navigation';
import { getNotifications } from '@/features/notification/lib/notification-service';
import { getFinancialYearContext } from '@/lib/financial-year';

interface PortalLayoutProps {
  children: React.ReactNode;
}

export default async function PortalLayout({ children }: PortalLayoutProps) {
  // Nav is filtered by the same permissions the pages check.
  const { user, permissions } = await requireSession();

  const navigation = getPortalNavigation(permissions, user.role);

  const notifications = await getNotifications().catch(() => []);

  // Resolved here so every page uses the year shown in the header.
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
