import React from 'react';
import { Card, CardHeader } from '../components';
import { WORKFLOW_STEPS } from '../constants/mock-data';

export function CashierWorkflow() {
  return (
    <Card>
      <CardHeader title="My Entry Workflow" />
      <div className="p-5">
        <div
          className="rounded-xl px-4 py-3 mb-4 text-xs"
          style={{
            backgroundColor: 'var(--warning-subtle)',
            border: '1px solid var(--warning)',
            color: 'var(--warning)',
          }}
        >
          <strong>Note:</strong> Creating a voucher does not post it to official accounting. Only approved
          entries affect records.
        </div>
        <div className="space-y-0">
          {WORKFLOW_STEPS.map((step, i) => (
            <div key={step.n} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className="flex items-center justify-center rounded-full text-xs font-semibold shrink-0"
                  style={{
                    width: 28,
                    height: 28,
                    backgroundColor:
                      step.n <= 2
                        ? 'var(--accent)'
                        : step.n === 3
                        ? 'var(--warning-subtle)'
                        : 'var(--surface-2)',
                    color: step.n <= 2 ? '#fff' : step.n === 3 ? 'var(--warning)' : 'var(--text-muted)',
                    border:
                      step.n <= 2
                        ? 'none'
                        : `1px solid ${step.n === 3 ? 'var(--warning)' : 'var(--border)'}`,
                  }}
                >
                  {step.n}
                </div>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div
                    className="w-px flex-1 my-1"
                    style={{ backgroundColor: 'var(--border)', minHeight: 20 }}
                  />
                )}
              </div>
              <div className="pb-4 pt-1">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {step.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
