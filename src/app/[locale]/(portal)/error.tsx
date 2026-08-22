'use client';

import { useEffect } from 'react';

import { ErrorState } from '@/components/portal/ui';

interface PortalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PortalError({ error, reset }: PortalErrorProps) {
  useEffect(() => {
    // TODO: forward to the error reporter once one is wired up.
    console.error(error);
  }, [error]);

  return <ErrorState digest={error.digest} onRetry={reset} />;
}
