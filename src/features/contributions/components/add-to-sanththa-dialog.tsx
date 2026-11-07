'use client';

import { useState, useTransition } from 'react';

import { FormField } from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EntityCombobox } from '@/components/ui/entity-combobox';

import { addToSanththaList } from '../lib/contributions-actions';
import type { SponsorRecord } from '../types';

interface AddToSanththaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  /** Active members not yet on this year's list. */
  candidates: readonly SponsorRecord[];
  onAdded: () => void;
}

export function AddToSanththaDialog({
  open,
  onOpenChange,
  year,
  candidates,
  onAdded,
}: AddToSanththaDialogProps) {
  const [memberId, setMemberId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [lastOpen, setLastOpen] = useState(open);

  if (lastOpen !== open) {
    setLastOpen(open);
    setMemberId(null);
    setError(null);
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    if (memberId === null) {
      setError('Choose the member who will pay this year.');
      return;
    }

    const chosen = memberId;

    startTransition(async () => {
      const result = await addToSanththaList(chosen, year);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      onOpenChange(false);
      onAdded();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to {year} sanththa</DialogTitle>
          <DialogDescription>
            For a member who isn’t sponsoring a pooja but wants to pay this year.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField id="sanththa-member" label="Member" required>
            <EntityCombobox
              id="sanththa-member"
              value={memberId === null ? null : String(memberId)}
              options={candidates.map((member) => ({
                value: String(member.partyId),
                label: member.nameEn ? `${member.name} · ${member.nameEn}` : member.name,
                badge: member.sponsorNo,
                keywords: member.sponsorNo,
              }))}
              placeholder="Choose a member"
              searchPlaceholder="Search name or membership no…"
              emptyMessage="No member matches that search."
              onChange={(value) => setMemberId(value === null ? null : Number(value))}
            />
          </FormField>

          {error && (
            <p role="alert" className="rounded-lg bg-danger-subtle px-3 py-2 text-xs text-danger">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={pending}>
              {pending ? 'Adding…' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
