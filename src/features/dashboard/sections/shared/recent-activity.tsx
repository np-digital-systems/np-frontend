import { Card, CardHeader } from '../../components';
import { RECENT_ACTIVITY } from '../../constants/mock-data';

export function RecentActivity() {
  return (
    <Card>
      <CardHeader title="Recent Activity" />

      <ol className="divide-y divide-border">
        {RECENT_ACTIVITY.map((item) => (
          <li key={item.id} className="flex items-start gap-3 px-5 py-3">
            <span
              className="mt-1.5 size-1.5 shrink-0 rounded-full bg-border-strong"
              aria-hidden
            />

            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-text-primary">
                {item.action}
                {item.ref && (
                  <span className="ml-1.5 text-xs font-medium text-primary ref">
                    {item.ref}
                  </span>
                )}
              </p>

              <p className="mt-0.5 text-xs text-text-muted">
                {item.user} · {item.time}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
