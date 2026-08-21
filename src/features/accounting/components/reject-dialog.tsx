'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/portal/ui';

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The voucher being sent back, for the confirmation copy. */
  reference: string | null;
  onConfirm: (reason: string) => void;
}

/**
 * Rejecting requires a reason.
 *
 * A voucher comes back to whoever drafted it; "Rejected" with no cause is
 * an instruction to guess, so the reason is mandatory rather than optional.
 */
export function RejectDialog({
  open,
  onOpenChange,
  reference,
  onConfirm,
}: RejectDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const seed = `${open}|${reference ?? ''}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setReason('');
    setError(null);
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    if (!reason.trim()) {
      setError('Say why this entry is being sent back.');
      return;
    }

    onConfirm(reason.trim());
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject {reference}</DialogTitle>
          <DialogDescription>
            The entry goes back to whoever drafted it, with your reason
            attached. They can correct it and resubmit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField id="reject-reason" label="Reason" required>
            <Textarea
              id="reject-reason"
              rows={3}
              value={reason}
              placeholder="What has to change before this can be approved"
              onChange={(changeEvent) => setReason(changeEvent.target.value)}
            />
          </FormField>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-danger-subtle px-3 py-2 text-xs text-danger"
            >
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" variant="destructive">
              Reject Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
