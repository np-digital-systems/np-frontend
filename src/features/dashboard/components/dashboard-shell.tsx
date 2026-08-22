import type { ReactNode } from 'react';

import { PageShell } from '@/components/portal/ui';

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return <PageShell>{children}</PageShell>;
}
