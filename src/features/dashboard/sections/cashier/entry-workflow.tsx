import { AlertTriangle } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Card, CardHeader } from '../../components';
import { WORKFLOW_STEPS } from '../../constants/dashboard-shapes';

const STEP_STYLES = {
  done: 'bg-primary text-primary-foreground',
  current: 'bg-warning-subtle text-warning ring-1 ring-warning',
  upcoming: 'bg-surface-2 text-text-muted ring-1 ring-border',
} as const;

export function EntryWorkflow() {
  return (
    <Card>
      <CardHeader title="My Entry Workflow" />

      <div className="p-5">
        <p className="mb-5 flex gap-2 rounded-lg bg-warning-subtle px-3 py-2.5 text-xs leading-relaxed text-warning">
          <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden />
          <span>
            <strong className="font-semibold">Note:</strong> creating a voucher
            does not post it to official accounting. Only approved entries
            affect records.
          </span>
        </p>

        <ol>
          {WORKFLOW_STEPS.map((step, index) => (
            <li key={step.step} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular',
                    STEP_STYLES[step.state],
                  )}
                >
                  {step.step}
                </span>

                {index < WORKFLOW_STEPS.length - 1 && (
                  <span className="my-1 w-px flex-1 bg-border" aria-hidden />
                )}
              </div>

              <div className="pb-5 pt-0.5">
                <p className="text-[13px] font-medium text-text-primary">
                  {step.label}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
}
