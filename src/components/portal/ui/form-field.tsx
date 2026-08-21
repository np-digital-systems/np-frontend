import type { ReactNode } from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  id: string;
  label: string;
  /** Explains an adaptive field — what `instance_identifier` means here. */
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * One labelled control.
 *
 * The hint sits under the input rather than above it so it reads as an
 * answer to "what do I type here?" at the moment the field has focus.
 */
export function FormField({
  id,
  label,
  hint,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id} className="text-xs font-medium text-text-secondary">
        {label}
        {required && (
          <span className="text-danger" aria-hidden>
            *
          </span>
        )}
      </Label>

      {children}

      {hint && (
        <p
          id={`${id}-hint`}
          className="text-[11px] leading-snug text-text-muted"
        >
          {hint}
        </p>
      )}
    </div>
  );
}
