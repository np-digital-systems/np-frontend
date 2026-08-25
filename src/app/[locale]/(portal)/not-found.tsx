import Link from 'next/link';
import { Compass } from 'lucide-react';

import { Card, PageShell } from '@/components/portal/ui';
import { Button } from '@/components/ui/button';

export default function PortalNotFound() {
  return (
    <PageShell>
      <Card className="mx-auto w-full max-w-md">
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <div
            className="flex size-10 items-center justify-center rounded-full bg-neutral-subtle"
            aria-hidden
          >
            <Compass className="size-4 text-text-muted" />
          </div>

          <h1 className="mt-4 text-[15px] font-semibold text-text-primary">
            This page does not exist
          </h1>

          <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted">
            The link may be out of date, or the screen may have moved. Use the
            sidebar to find what you were looking for.
          </p>

          <Button asChild className="mt-5">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}
