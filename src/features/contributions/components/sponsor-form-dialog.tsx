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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { SponsorRecord } from '../types';

export interface SponsorDraft {
  nameTa: string;
  nameEn: string;
  phone: string;
  email: string;
  address: string;
  subscribes: boolean;
  isActive: boolean;
  notes: string;
}

function draftFrom(sponsor: SponsorRecord | null): SponsorDraft {
  return {
    nameTa: sponsor?.name ?? '',
    nameEn: sponsor?.nameEn ?? '',
    phone: sponsor?.phone ?? '',
    email: sponsor?.email ?? '',
    address: sponsor?.address ?? '',
    subscribes: sponsor?.subscribes ?? true,
    isActive: sponsor?.isActive ?? true,
    notes: sponsor?.notes ?? '',
  };
}

interface SponsorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sponsor: SponsorRecord | null;
  pending: boolean;
  onSubmit: (draft: SponsorDraft) => void;
}

export function SponsorFormDialog({
  open,
  onOpenChange,
  sponsor,
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

    if (!draft.nameTa.trim()) {
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
            {sponsor ? `Edit ${sponsor.sponsorNo}` : 'Enrol a sponsor'}
          </DialogTitle>
          <DialogDescription>
            {sponsor
              ? 'The name and contact details belong to this person’s directory entry, so a change here reaches every screen they appear on.'
              : 'Enrolling registers the person in the directory and allocates their sponsor number.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            id="sponsor-name-ta"
            label="Name (Tamil)"
            required
            hint="Shown on Tamil receipts and the calendar."
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

          {/*
            * Exemption, not deactivation. A sponsor who does not subscribe
            * still sponsors poojas; they simply owe no yearly sanththa, so the
            * register stops counting them as outstanding.
            */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
            <div className="min-w-0 pr-4">
              <Label htmlFor="sponsor-subscribes" className="text-xs font-medium text-text-secondary">
                Pays the annual sanththa
              </Label>
              <p className="mt-0.5 text-[11px] text-text-tertiary">
                Clear this for an exempt sponsor; they stay on the calendar either way.
              </p>
            </div>
            <Checkbox
              id="sponsor-subscribes"
              checked={draft.subscribes}
              onCheckedChange={(checked) => update('subscribes', checked === true)}
            />
          </div>

          {sponsor && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
              <div className="min-w-0 pr-4">
                <Label htmlFor="sponsor-active" className="text-xs font-medium text-text-secondary">
                  Active
                </Label>
                <p className="mt-0.5 text-[11px] text-text-tertiary">
                  Retiring hides them from the pickers; their history is kept.
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
              {pending ? 'Saving…' : sponsor ? 'Save changes' : 'Enrol sponsor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
