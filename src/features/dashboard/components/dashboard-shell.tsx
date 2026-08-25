import type { ReactNode } from 'react';

interface DashboardShellProps {
  children: ReactNode;
}

/** Shared page frame so every role dashboard sits on the same rhythm. */
export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="mx-auto w-full max-w-[var(--content-max-width)] px-4 py-6 lg:px-6">
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
}
