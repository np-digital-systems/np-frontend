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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { PARTY_KINDS, PARTY_KIND_LABELS } from '../lib/accounting-data';
import { partySchema } from '../lib/accounting-schemas';
import type { PartyKind, PartyRecord } from '../types';

export interface PartyDraft {
  nameTa: string;
  nameEn: string;
  kind: PartyKind;
  phone: string;
  isActive: boolean;
}

function draftFrom(party: PartyRecord | null): PartyDraft {
  if (party) {
    return {
      nameTa: party.name,
      nameEn: party.nameEn,
      kind: party.kind,
      phone: party.phone ?? '',
      isActive: party.isActive,
    };
  }

  return {
    nameTa: '',
    nameEn: '',
    kind: 'devotee',
    phone: '',
    isActive: true,
  };
}

interface PartyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  party: PartyRecord | null;
  onSubmit: (draft: PartyDraft) => void;
}

export function PartyFormDialog({
  open,
  onOpenChange,
  party,
  onSubmit,
}: PartyFormDialogProps) {
  const [draft, setDraft] = useState<PartyDraft>(() => draftFrom(party));
  const [error, setError] = useState<string | null>(null);

  const seed = `${open}|${party?.id ?? 'new'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(party));
    setError(null);
  }

  function update<K extends keyof PartyDraft>(key: K, value: PartyDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    const result = validate(partySchema, draft);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError(null);
    onSubmit(result.data);
    onOpenChange(false);
  }

  // A party carried over from a sponsor is the same person the calendar knows,
  // so their name belongs to the user record rather than to this form.
  const fromUser = party?.userId != null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{party ? `Edit ${party.name}` : 'New Party'}</DialogTitle>
          <DialogDescription>
            Who an entry is with. Parties sit beneath the chart of accounts
            rather than in it — one salaries head serves every kurukkal, and
            what each was paid is answered by naming them here.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            id="party-name-ta"
            label="Name (Tamil)"
            required
            hint={
              fromUser
                ? 'This party stands for someone who signs in; changing the name here does not rename their account.'
                : 'Shown on Tamil statements and in the voucher form.'
            }
          >
            <Input
              id="party-name-ta"
              value={draft.nameTa}
              placeholder="திரு. க. சபேசன்"
              onChange={(changeEvent) => update('nameTa', changeEvent.target.value)}
            />
          </FormField>

          <FormField id="party-name-en" label="Name (English)">
            <Input
              id="party-name-en"
              value={draft.nameEn}
              placeholder="K. Sabesan"
              onChange={(changeEvent) => update('nameEn', changeEvent.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="party-kind"
              label="Kind"
              required
              hint="For grouping the list; it does not limit what they can appear on."
            >
              <Select
                value={draft.kind}
                onValueChange={(value) => update('kind', value as PartyKind)}
              >
                <SelectTrigger id="party-kind" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {PARTY_KINDS.map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {PARTY_KIND_LABELS[kind]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="party-phone" label="Phone">
              <Input
                id="party-phone"
                value={draft.phone}
                inputMode="tel"
                placeholder="077 123 4567"
                onChange={(changeEvent) => update('phone', changeEvent.target.value)}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
            <div className="min-w-0 pr-4">
              <Label
                htmlFor="party-active"
                className="text-xs font-medium text-text-secondary"
              >
                Active
              </Label>
              <p className="mt-0.5 text-[11px] text-text-muted">
                A retired party leaves the pickers; every entry naming them
                keeps doing so.
              </p>
            </div>

            <Switch
              id="party-active"
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button type="submit">{party ? 'Save Changes' : 'Create Party'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
