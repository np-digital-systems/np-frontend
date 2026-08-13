import { PortalHeader } from '@/components/portal/header'
import { PortalSidebar } from '@/components/portal/sidebar'

import { getPortalNavigation } from '@/features/auth/lib/navigation'

interface PortalLayoutProps {
  children: React.ReactNode
}

export default async function PortalLayout({
  children,
}: PortalLayoutProps) {

  // Temporary while authentication isn't implemented.
  const userRole = 'accountant';

  const navigation = getPortalNavigation(userRole);

  return (
    <div className="portal-theme min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <PortalSidebar
          navigation={navigation}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <PortalHeader />

          <main className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}