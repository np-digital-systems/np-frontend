import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-heading text-5xl text-primary">404</p>

      <h1 className="mt-4 font-heading text-2xl">Page not found</h1>

      <p className="mt-3 text-sm text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>

      <Button asChild className="mt-6">
        <Link href="/">Back to home</Link>
      </Button>
    </main>
  );
}
