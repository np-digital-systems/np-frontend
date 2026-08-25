import { cn } from '@/lib/utils';

interface EventNameProps {
    name: string;
    nameEn?: string;
    instanceLabel?: string;
  className?: string;
}

export function EventName({
  name,
  nameEn,
  instanceLabel,
  className,
}: EventNameProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <p className="truncate text-[13px] font-medium text-text-primary">
        {name}
      </p>

      {(nameEn || instanceLabel) && (
        <p className="mt-0.5 truncate text-xs text-text-muted">
          {[nameEn, instanceLabel].filter(Boolean).join(' · ')}
        </p>
      )}
    </div>
  );
}
