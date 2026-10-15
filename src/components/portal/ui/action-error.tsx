'use client';

import { AlertTriangle } from 'lucide-react';

interface ActionErrorProps {
  /** Null when the last write succeeded. */
  message: string | null;
}

// Shows the API's message verbatim; it is written for the user.
export function ActionError({ message }: ActionErrorProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger-subtle px-3.5 py-2.5 text-sm text-danger"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p className="min-w-0">{message}</p>
    </div>
  );
}
