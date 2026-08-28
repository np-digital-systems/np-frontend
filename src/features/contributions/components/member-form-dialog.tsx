'use client';

import { useState } from 'react';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { validate } from '@/lib/validation';

import { memberSchema } from '../lib/contributions-schemas';
import type { MemberRecord } from '../types';

export interface MemberDraft {
  memberNo: string;
  fullName: string;
  nameTa: string;
  phone: string;
  address: string;
  notes: string;
  isActive: boolean;
}

function draftFrom(member: MemberRecord | null, nextNo: string): MemberDraft {
  if (member) {
    return {
      memberNo: member.memberNo,
      fullName: member.fullName,
      nameTa: member.nameTa,
      phone: member.phone,
      address: member.address,
      notes: member.notes ?? '',
      isActive: member.isActive,
    };
  }

  return {
    memberNo: nextNo,
    fullName: '',
    nameTa: '',
    phone: '',
    address: '',
    notes: '',
    isActive: true,
  };
}

interface MemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberRecord | null;
  nextMemberNo: string;
  onSubmit: (draft: MemberDraft) => void;
  /** A message from the server when the write was refused. */
  submitError?: string | null;
}

export function MemberFormDialog({
  open,
  onOpenChange,
  member,
  nextMemberNo,
  onSubmit,
}: MemberFormDialogProps) {
  const [draft, setDraft] = useState<MemberDraft>(() =>
    draftFrom(member, nextMemberNo),
  );
  const [error, setError] = useState<string | null>(null);

  const seed = `${open}|${member?.id ?? 'new'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(member, nextMemberNo));
    setError(null);
  }

  function update<K extends keyof MemberDraft>(key: K, value: MemberDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    const result = validate(memberSchema, draft);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError(null);
    onSubmit(draft);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {member ? `Edit ${member.memberNo}` : 'New Member'}
          </DialogTitle>
          <DialogDescription>
            A sanththa member pays one subscription a year.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/*
              * The number is allocated by the database when the joining date is
              * set, and is permanent once issued because it is printed on
              * receipts — so it is shown, never typed.
              */}
            <FormField id="member-no" label="Member No">
              <Input
                id="member-no"
                value={member ? draft.memberNo : 'Assigned on save'}
                readOnly
                disabled
              />
            </FormField>

            <FormField id="member-phone" label="Phone">
              <Input
                id="member-phone"
                value={draft.phone}
                placeholder="077 111 2222"
                onChange={(event) => update('phone', event.target.value)}
              />
            </FormField>
          </div>

          <FormField id="member-name" label="Name (English)">
            <Input
              id="member-name"
              value={draft.fullName}
              placeholder="M. Ganesan & Family"
              onChange={(event) => update('fullName', event.target.value)}
            />
          </FormField>

          <FormField id="member-name-ta" label="Name (Tamil)" required>
            <Input
              id="member-name-ta"
              value={draft.nameTa}
              placeholder="ம. கணேசன் மற்றும் குடும்பத்தினர்"
              onChange={(event) => update('nameTa', event.target.value)}
            />
          </FormField>

          <FormField id="member-address" label="Address">
            <Input
              id="member-address"
              value={draft.address}
              placeholder="நல்லூர், யாழ்ப்பாணம்"
              onChange={(event) => update('address', event.target.value)}
            />
          </FormField>

          <FormField id="member-notes" label="Notes">
            <Textarea
              id="member-notes"
              rows={2}
              value={draft.notes}
              onChange={(event) => update('notes', event.target.value)}
            />
          </FormField>

          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
            <div className="min-w-0 pr-4">
              <Label
                htmlFor="member-active"
                className="text-xs font-medium text-text-secondary"
              >
                Active member
              </Label>
              <p className="mt-0.5 text-[11px] text-text-muted">
                Inactive members keep their history but are not counted as due.
              </p>
            </div>

            <Switch
              id="member-active"
              checked={draft.isActive}
              onCheckedChange={(checked) => update('isActive', checked)}
            />
          </div>

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
            <Button type="submit">{member ? 'Save Changes' : 'Add Member'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
