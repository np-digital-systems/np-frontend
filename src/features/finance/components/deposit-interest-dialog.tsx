'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { formatCurrency } from '../lib/finance-data';
import type { DepositInterest, DepositRecord } from '../types';

interface DepositInterestDialogProps {
  deposit: DepositRecord | null;
  /** Undefined while loading, null when it could not be loaded. */
  interest: DepositInterest | null | undefined;
  onOpenChange: (open: boolean) => void;
}

export function DepositInterestDialog({
  deposit,
  interest,
  onOpenChange,
}: DepositInterestDialogProps) {
  return (
    <Dialog open={deposit !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {deposit && (
          <>
            <DialogHeader>
              <DialogTitle>Interest by Year</DialogTitle>
              <DialogDescription>
                {interest && interest.certificates.length > 1
                  ? interest.certificates.join(' → ')
                  : deposit.certificateNo}{' '}
                · {deposit.poojaName ?? 'Kovil'}
              </DialogDescription>
            </DialogHeader>

            {interest === undefined ? (
              <p className="text-xs text-text-muted">Loading…</p>
            ) : interest === null ? (
              <p role="alert" className="text-xs text-danger">
                The interest could not be loaded.
              </p>
            ) : interest.years.length === 0 ? (
              <p className="text-xs text-text-muted">No interest posted yet.</p>
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border text-[11px] text-text-muted">
                    <th scope="col" className="py-2 text-left font-medium">
                      Financial year
                    </th>
                    <th scope="col" className="py-2 text-right font-medium">
                      Interest received
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {interest.years.map((year) => (
                    <tr key={year.financialYearId}>
                      <td className="py-2 text-text-primary">{year.label}</td>
                      <td className="py-2 text-right text-text-primary tabular">
                        {formatCurrency(year.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr className="border-t border-border font-semibold">
                    <td className="py-2 text-text-primary">Total</td>
                    <td className="py-2 text-right text-text-primary tabular">
                      {formatCurrency(interest.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
