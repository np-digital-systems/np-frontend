'use client';

import { useState, useTransition } from 'react';

import { useRouter } from '@/i18n/routing';

export interface ServerActionResult {
  ok: boolean;
  message?: string;
}

export interface ServerActionRunner {
  run: (write: () => Promise<ServerActionResult>, onSuccess?: () => void) => void;
  error: string | null;
  clearError: () => void;
  pending: boolean;
}

// Refreshes from the server after a write instead of patching local state.
export function useServerAction(): ServerActionRunner {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(write: () => Promise<ServerActionResult>, onSuccess?: () => void) {
    startTransition(async () => {
      const result = await write();

      if (!result.ok) {
        setError(result.message ?? 'That change was refused.');
        return;
      }

      setError(null);
      onSuccess?.();
      router.refresh();
    });
  }

  return { run, error, clearError: () => setError(null), pending };
}
