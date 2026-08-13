import { PortalShell } from '@/components/layouts/portal-layout/portal-shell';

import { getPortalNavigation } from '@/features/auth/lib/navigation';

interface PortalLayoutProps {
  children: React.ReactNode;
}

export default async function PortalLayout({
  children,
}: PortalLayoutProps) {
  // Temporary until authentication is implemented.
  const userRole = 'accountant';

  const navigation = getPortalNavigation(userRole);

  return (
    <div className="portal-theme min-h-screen bg-background text-foreground">
      <PortalShell navigation={navigation}>
        {children}
      </PortalShell>
    </div>
  );
}