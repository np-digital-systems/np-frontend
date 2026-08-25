import type { ReactNode } from 'react';

import { PageShell } from '@/components/portal/ui';

interface DashboardShellProps {
  children: ReactNode;
}

/**
 * Dashboard page frame.
 *
 * The frame itself is shared with every other portal screen; this alias
 * exists so the dashboard sections keep reading in their own vocabulary.
 */
export function DashboardShell({ children }: DashboardShellProps) {
  return <PageShell>{children}</PageShell>;
}
