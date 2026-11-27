'use client';

import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/portal/ui';
import { EntityCombobox } from '@/components/ui/entity-combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { partyRoleLabels } from '@/features/accounting/lib/accounting-data';
import type { PartyRef } from '@/features/accounting/types';

import type { SponsorRecord } from '../types';

export interface SponsorDraft {
  /** An existing party to enrol; null registers someone new. */
  partyId: number | null;
  nameTa: string;
  nameEn: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
  notes: string;
}

function draftFrom(sponsor: SponsorRecord | null): SponsorDraft {
  return {
    partyId: null,
    nameTa: sponsor?.name ?? '',
    nameEn: sponsor?.nameEn ?? '',
    phone: sponsor?.phone ?? '',
    email: sponsor?.email ?? '',
    address: sponsor?.address ?? '',
    isActive: sponsor?.isActive ?? true,
    notes: sponsor?.notes ?? '',
  };
}

interface SponsorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sponsor: SponsorRecord | null;
  people: readonly PartyRef[];
  pending: boolean;
  onSubmit: (draft: SponsorDraft) => void;
}

export function SponsorFormDialog({
  open,
  onOpenChange,
  sponsor,
  people,
  pending,
  onSubmit,
}: SponsorFormDialogProps) {
  const [draft, setDraft] = useState<SponsorDraft>(() => draftFrom(sponsor));
  const [error, setError] = useState<string | null>(null);

  const seed = `${open}|${sponsor?.partyId ?? 'new'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(sponsor));
    setError(null);
  }

  function update<K extends keyof SponsorDraft>(key: K, value: SponsorDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (draft.partyId === null && !draft.nameTa.trim()) {
      setError('A Tamil name is required.');
      return;
    }

    setError(null);
    onSubmit(draft);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {sponsor ? `Edit ${sponsor.sponsorNo}` : 'Enrol a member'}
          </DialogTitle>
          <DialogDescription>
            {sponsor
              ? 'Changes apply everywhere this person appears.'
              : 'Adds them to the register with a membership number.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!sponsor && (
            <FormField id="sponsor-person" label="Person">
              <EntityCombobox
                id="sponsor-person"
                value={draft.partyId === null ? null : String(draft.partyId)}
                options={people.map((person) => ({
                  value: String(person.id),
                  label: person.nameEn ? `${person.name} · ${person.nameEn}` : person.name,
                  description: partyRoleLabels(person).join(' · ') || undefined,
                }))}
                noneLabel="Someone new"
                searchPlaceholder="Search parties…"
                emptyMessage="Nobody in Parties matches that search."
                onChange={(value) => update('partyId', value === null ? null : Number(value))}
              />
            </FormField>
          )}

          {draft.partyId === null && (
          <>
          <FormField
            id="sponsor-name-ta"
            label="Name (Tamil)"
            required
          >
            <Input
              id="sponsor-name-ta"
              value={draft.nameTa}
              placeholder="திரு. க. சபேசன்"
              onChange={(event) => update('nameTa', event.target.value)}
            />
          </FormField>

          <FormField id="sponsor-name-en" label="Name (English)">
            <Input
              id="sponsor-name-en"
              value={draft.nameEn}
              placeholder="K. Sabesan"
              onChange={(event) => update('nameEn', event.target.value)}
            />
          </FormField>
          </>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="sponsor-phone" label="Phone">
              <Input
                id="sponsor-phone"
                value={draft.phone}
                inputMode="tel"
                placeholder="077 123 4567"
                onChange={(event) => update('phone', event.target.value)}
              />
            </FormField>

            <FormField id="sponsor-email" label="Email">
              <Input
                id="sponsor-email"
                type="email"
                value={draft.email}
                onChange={(event) => update('email', event.target.value)}
              />
            </FormField>
          </div>

          <FormField id="sponsor-address" label="Address">
            <Input
              id="sponsor-address"
              value={draft.address}
              onChange={(event) => update('address', event.target.value)}
            />
          </FormField>

          <FormField id="sponsor-notes" label="Notes">
            <Input
              id="sponsor-notes"
              value={draft.notes}
              onChange={(event) => update('notes', event.target.value)}
            />
          </FormField>

          {sponsor && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
              <div className="min-w-0 pr-4">
                <Label htmlFor="sponsor-active" className="text-xs font-medium text-text-secondary">
                  Active
                </Label>
                <p className="mt-0.5 text-[11px] text-text-tertiary">
                  Inactive members are hidden from pickers.
                </p>
              </div>
              <Checkbox
                id="sponsor-active"
                checked={draft.isActive}
                onCheckedChange={(checked) => update('isActive', checked === true)}
              />
            </div>
          )}

          {error && (
            <p role="alert" className="text-xs text-danger">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : sponsor ? 'Save changes' : 'Enrol member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
