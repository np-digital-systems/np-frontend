import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function LinkButton({ href, children, className }: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-sm text-xs font-medium text-primary',
        'transition-opacity hover:opacity-70',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        className,
      )}
    >
      {children}
      <ChevronRight className="size-3.5" aria-hidden />
    </Link>
  );
}
