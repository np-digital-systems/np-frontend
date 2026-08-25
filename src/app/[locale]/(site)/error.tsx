'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

interface SiteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SiteError({ error, reset }: SiteErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-2xl">Something went wrong</h1>

      <p className="mt-3 text-sm text-muted-foreground">
        This page could not be loaded. Please try again in a moment.
      </p>

      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
