import type { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
}

/** Shared page frame so every portal screen sits on the same rhythm. */
export function PageShell({ children }: PageShellProps) {
  return (
    <div className="mx-auto w-full max-w-[var(--content-max-width)] px-4 py-6 lg:px-6">
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
}
