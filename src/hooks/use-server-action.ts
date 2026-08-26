'use client';

import { useState, useTransition } from 'react';

import { useRouter } from '@/i18n/routing';

export interface ServerActionResult {
  ok: boolean;
  message?: string;
}

export interface ServerActionRunner {
  /** Runs the write, then refetches the page. Errors surface in `error`. */
  run: (write: () => Promise<ServerActionResult>, onSuccess?: () => void) => void;
  error: string | null;
  clearError: () => void;
  pending: boolean;
}

/**
 * Run a server action and let the server decide what the screen now shows.
 *
 * Nothing is patched into local state on the way past: ids, references and
 * derived balances all belong to the API, and a screen that guessed any of them
 * would eventually disagree with the records it is displaying. The refresh
 * re-renders the server component with what was actually written.
 */
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
