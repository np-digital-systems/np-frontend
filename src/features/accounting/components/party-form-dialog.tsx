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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { PARTY_KINDS, PARTY_KIND_LABELS } from '../lib/accounting-data';
import { partySchema } from '../lib/accounting-schemas';
import type { PartyKind, PartyRecord } from '../types';

export interface PartyDraft {
  nameTa: string;
  nameEn: string;
  roles: PartyKind[];
  phone: string;
  isActive: boolean;
}

function draftFrom(party: PartyRecord | null): PartyDraft {
  if (party) {
    return {
      nameTa: party.name,
      nameEn: party.nameEn,
      roles: [...party.roles],
      phone: party.phone ?? '',
      isActive: party.isActive,
    };
  }

  return {
    nameTa: '',
    nameEn: '',
    roles: ['devotee'],
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

  // Kept in the canonical order rather than the order they were ticked, so the
  // same set of roles reads the same way everywhere it is shown.
  function toggleRole(kind: PartyKind) {
    setDraft((current) => ({
      ...current,
      roles: current.roles.includes(kind)
        ? current.roles.filter((role) => role !== kind)
        : PARTY_KINDS.filter(
            (role) => role === kind || current.roles.includes(role),
          ),
    }));
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

          {/*
            * Several, not one. The temple's florist who also sponsors the
            * Friday abhishekam is one party holding both roles — registering
            * them twice would split their history down the middle and leave no
            * screen able to say what the dealings with them amount to.
            */}
          <FormField
            id="party-roles"
            label="Roles"
            required
            hint="For grouping the lists. A party may hold several, and holding one never limits what they can appear on."
          >
            <div
              id="party-roles"
              role="group"
              aria-label="Roles"
              className="grid grid-cols-2 gap-2"
            >
              {PARTY_KINDS.map((kind) => (
                <label
                  key={kind}
                  htmlFor={`party-role-${kind}`}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:border-input has-[:checked]:border-accent has-[:checked]:text-text-primary"
                >
                  <Checkbox
                    id={`party-role-${kind}`}
                    checked={draft.roles.includes(kind)}
                    onCheckedChange={() => toggleRole(kind)}
                  />
                  {PARTY_KIND_LABELS[kind]}
                </label>
              ))}
            </div>
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
