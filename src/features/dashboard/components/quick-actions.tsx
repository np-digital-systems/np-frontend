import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface QuickAction {
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
}

interface QuickActionsProps {
  actions: readonly QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(({ label, href, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          className={cn(
            'inline-flex h-8 items-center gap-2 rounded-lg',
            'border border-border bg-surface px-3',
            'text-xs font-medium text-text-secondary',
            'shadow-xs transition-colors',
            'hover:bg-interactive-hover hover:text-text-primary',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          )}
        >
          <Icon className="size-3.5" aria-hidden />
          {label}
        </Link>
      ))}
    </div>
  );
}
