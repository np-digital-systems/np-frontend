'use client';

import { useState } from 'react';

import { FormField } from '@/components/portal/ui';
import { validate } from '@/lib/validation';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import {
  FREQUENCIES,
  FREQUENCY_LABELS,
  MEMBER_STATUSES,
  MEMBER_STATUS_LABELS,
  formatCurrency,
} from '../lib/contributions-data';
import { memberSchema } from '../lib/contributions-schemas';
import type {
  MemberRecord,
  MemberStatus,
  SubscriptionFrequency,
} from '../types';

export interface MemberDraft {
  memberNo: string;
  fullName: string;
  nameTa: string;
  phone: string;
  address: string;
  subscriptionAmount: number;
  frequency: SubscriptionFrequency;
  joinedOn: string;
  status: MemberStatus;
  notes: string;
}

function draftFrom(
  member: MemberRecord | null,
  nextMemberNo: string,
  today: string,
): MemberDraft {
  if (member) {
    return {
      memberNo: member.memberNo,
      fullName: member.fullName,
      nameTa: member.nameTa,
      phone: member.phone,
      address: member.address,
      subscriptionAmount: member.subscriptionAmount,
      frequency: member.frequency,
      joinedOn: member.joinedOn,
      status: member.status,
      notes: member.notes ?? '',
    };
  }

  return {
    memberNo: nextMemberNo,
    fullName: '',
    nameTa: '',
    phone: '',
    address: '',
    subscriptionAmount: 1_000,
    frequency: 'monthly',
    joinedOn: today,
    status: 'active',
    notes: '',
  };
}

interface MemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberRecord | null;
  existing: readonly MemberRecord[];
  nextMemberNo: string;
  today: string;
  onSubmit: (draft: MemberDraft) => void;
}

export function MemberFormDialog({
  open,
  onOpenChange,
  member,
  existing,
  nextMemberNo,
  today,
  onSubmit,
}: MemberFormDialogProps) {
  const [draft, setDraft] = useState<MemberDraft>(() =>
    draftFrom(member, nextMemberNo, today),
  );
  const [error, setError] = useState<string | null>(null);

  const seed = `${open}|${member?.id ?? 'new'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(member, nextMemberNo, today));
    setError(null);
  }

  const yearlyTotal =
    draft.subscriptionAmount * (draft.frequency === 'monthly' ? 12 : 1);

  const pledgeChanged =
    member !== null &&
    (draft.subscriptionAmount !== member.subscriptionAmount ||
      draft.frequency !== member.frequency);

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

    if (result.data.joinedOn > today) {
      setError('A member cannot join in the future.');
      return;
    }

    const clash = existing.some(
      (entry) =>
        entry.memberNo.toUpperCase() === result.data.memberNo &&
        entry.id !== member?.id,
    );

    if (clash) {
      setError(`Membership number ${result.data.memberNo} is already in use.`);
      return;
    }

    setError(null);
    onSubmit(result.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {member ? `Edit ${member.memberNo}` : 'New Sanththa Member'}
          </DialogTitle>
          <DialogDescription>
            A member pledges a subscription each month or each year. The
            register tracks what has been paid against that pledge.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              id="member-no"
              label="Member No"
              required
              hint="On the receipt book."
            >
              <Input
                id="member-no"
                value={draft.memberNo}
                placeholder="S-013"
                onChange={(changeEvent) =>
                  update('memberNo', changeEvent.target.value)
                }
              />
            </FormField>

            <FormField
              id="member-name"
              label="Name (English)"
              required
              className="sm:col-span-2"
            >
              <Input
                id="member-name"
                value={draft.fullName}
                placeholder="M. Ganesan & Family"
                onChange={(changeEvent) =>
                  update('fullName', changeEvent.target.value)
                }
              />
            </FormField>
          </div>

          <FormField id="member-name-ta" label="Name (Tamil)">
            <Input
              id="member-name-ta"
              value={draft.nameTa}
              placeholder="ம. கணேசன் மற்றும் குடும்பத்தினர்"
              onChange={(changeEvent) =>
                update('nameTa', changeEvent.target.value)
              }
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="member-phone" label="Phone">
              <Input
                id="member-phone"
                value={draft.phone}
                placeholder="077 111 2222"
                onChange={(changeEvent) =>
                  update('phone', changeEvent.target.value)
                }
              />
            </FormField>

            <FormField id="member-joined" label="Member Since" required>
              <Input
                id="member-joined"
                type="date"
                max={today}
                value={draft.joinedOn}
                onChange={(changeEvent) =>
                  update('joinedOn', changeEvent.target.value)
                }
              />
            </FormField>
          </div>

          <FormField id="member-address" label="Address">
            <Input
              id="member-address"
              value={draft.address}
              placeholder="நல்லூர், யாழ்ப்பாணம்"
              onChange={(changeEvent) =>
                update('address', changeEvent.target.value)
              }
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField id="member-amount" label="Subscription" required>
              <Input
                id="member-amount"
                type="number"
                min={0}
                step={100}
                value={draft.subscriptionAmount || ''}
                onChange={(changeEvent) =>
                  update(
                    'subscriptionAmount',
                    Number(changeEvent.target.value) || 0,
                  )
                }
              />
            </FormField>

            <FormField id="member-frequency" label="Frequency" required>
              <Select
                value={draft.frequency}
                onValueChange={(value) =>
                  update('frequency', value as SubscriptionFrequency)
                }
              >
                <SelectTrigger id="member-frequency" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {FREQUENCIES.map((frequency) => (
                    <SelectItem key={frequency} value={frequency}>
                      {FREQUENCY_LABELS[frequency]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="member-status" label="Status" required>
              <Select
                value={draft.status}
                onValueChange={(value) =>
                  update('status', value as MemberStatus)
                }
              >
                <SelectTrigger id="member-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {MEMBER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {MEMBER_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {draft.subscriptionAmount > 0 && (
            <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-text-secondary">
              Pledged{' '}
              <span className="font-semibold text-text-primary tabular">
                {formatCurrency(draft.subscriptionAmount)}
              </span>{' '}
              {draft.frequency === 'monthly' ? 'a month' : 'a year'} —{' '}
              <span className="font-semibold text-text-primary tabular">
                {formatCurrency(yearlyTotal)}
              </span>{' '}
              over a full year.
              {draft.status === 'inactive' &&
                ' An inactive member accrues no dues while their place is held.'}
            </p>
          )}

          {pledgeChanged && (
            <p className="rounded-lg bg-warning-subtle px-3 py-2 text-xs leading-relaxed text-warning">
              Changing the pledge re-bases this year’s dues. {member?.memberNo}{' '}
              has already paid {formatCurrency(member?.paidForYear ?? 0)}{' '}
              against the old figure.
            </p>
          )}

          <FormField id="member-notes" label="Notes">
            <Textarea
              id="member-notes"
              rows={2}
              value={draft.notes}
              placeholder="Anything the collector should know"
              onChange={(changeEvent) =>
                update('notes', changeEvent.target.value)
              }
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

            <Button type="submit">
              {member ? 'Save Changes' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
