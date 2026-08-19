import { Check, CheckSquare, X } from 'lucide-react';

import { Card, CardHeader } from '../../components';
import { CASHIER_ACTIVITY } from '../../constants/mock-data';

const OUTCOME = {
  submitted: { icon: Check, wrapper: 'bg-success-subtle text-success' },
  approved: { icon: CheckSquare, wrapper: 'bg-info-subtle text-info' },
  rejected: { icon: X, wrapper: 'bg-danger-subtle text-danger' },
} as const;

export function MyActivity() {
  return (
    <Card>
      <CardHeader title="My Recent Activity" />

      <ol className="divide-y divide-border">
        {CASHIER_ACTIVITY.map((item) => {
          const { icon: Icon, wrapper } = OUTCOME[item.outcome];

          return (
            <li key={item.id} className="flex items-center gap-3 px-5 py-3">
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full ${wrapper}`}
                aria-hidden
              >
                <Icon className="size-3.5" />
              </span>

              <p className="min-w-0 flex-1 text-[13px] text-text-primary">
                {item.action}
                <span className="ml-1.5 text-xs font-medium text-primary ref">
                  {item.ref}
                </span>
              </p>

              <span className="shrink-0 text-xs text-text-muted">
                {item.time}
              </span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
