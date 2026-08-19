import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
      <Icon className="size-5 text-text-disabled" aria-hidden />

      <p className="mt-3 text-[13px] font-medium text-text-secondary">
        {title}
      </p>

      {description && (
        <p className="mt-1 max-w-xs text-xs text-text-muted">{description}</p>
      )}
    </div>
  );
}
