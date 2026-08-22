import { Card } from './card';
import { PageShell } from './page-shell';
import { Skeleton } from './skeleton';

interface PageSkeletonProps {
    stats?: number;
  rows?: number;
}

export function PageSkeleton({ stats = 4, rows = 6 }: PageSkeletonProps) {
  return (
    <PageShell>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {stats > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: stats }, (_, index) => (
            <Card key={index} className="px-5 py-4">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="mt-3 h-6 w-32" />
              <Skeleton className="mt-2.5 h-3 w-20" />
            </Card>
          ))}
        </div>
      )}

      <Card>
        <div className="border-b border-border px-5 py-3.5">
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="divide-y divide-border">
          {Array.from({ length: rows }, (_, index) => (
            <div key={index} className="flex items-center gap-4 px-5 py-3.5">
              <Skeleton className="h-4 w-28 shrink-0" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20 shrink-0" />
              <Skeleton className="h-4 w-16 shrink-0" />
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
