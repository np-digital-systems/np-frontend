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

import { ACTIVITY_KINDS, ACTIVITY_KIND_LABELS } from '../lib/accounting-data';
import { activitySchema } from '../lib/accounting-schemas';
import type { ActivityKind, ActivityRecord, FundRef } from '../types';

export interface ActivityDraft {
  nameTa: string;
  nameEn: string;
  kind: ActivityKind;
  defaultFundId: number | null;
  isActive: boolean;
}

const NO_FUND = '__none__';

function draftFrom(activity: ActivityRecord | null): ActivityDraft {
  if (activity) {
    return {
      nameTa: activity.name,
      nameEn: activity.nameEn,
      kind: activity.kind,
      defaultFundId: activity.defaultFundId,
      isActive: activity.isActive,
    };
  }

  return {
    nameTa: '',
    nameEn: '',
    kind: 'pooja',
    defaultFundId: null,
    isActive: true,
  };
}

interface ActivityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: ActivityRecord | null;
  funds: readonly FundRef[];
  onSubmit: (draft: ActivityDraft) => void;
}

export function ActivityFormDialog({
  open,
  onOpenChange,
  activity,
  funds,
  onSubmit,
}: ActivityFormDialogProps) {
  const [draft, setDraft] = useState<ActivityDraft>(() => draftFrom(activity));
  const [error, setError] = useState<string | null>(null);

  const seed = `${open}|${activity?.id ?? 'new'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(activity));
    setError(null);
  }

  function update<K extends keyof ActivityDraft>(key: K, value: ActivityDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    const result = validate(activitySchema, draft);

    if (!result.ok) {
      setError(result.message);
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
            {activity ? `Edit ${activity.name}` : 'New Activity'}
          </DialogTitle>
          <DialogDescription>
            What entries are reported under. Both income and expenditure carry
            one, which is what lets a pooja be read whole — what it brought in
            against what it cost to run.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            id="activity-name-ta"
            label="Name (Tamil)"
            required
            hint="Shown on Tamil statements and in the voucher form."
          >
            <Input
              id="activity-name-ta"
              value={draft.nameTa}
              placeholder="வெள்ளி அபிஷேகம்"
              onChange={(changeEvent) => update('nameTa', changeEvent.target.value)}
            />
          </FormField>

          <FormField id="activity-name-en" label="Name (English)">
            <Input
              id="activity-name-en"
              value={draft.nameEn}
              placeholder="Friday Abhishekam"
              onChange={(changeEvent) => update('nameEn', changeEvent.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="activity-kind" label="Kind" required>
              <Select
                value={draft.kind}
                onValueChange={(value) => update('kind', value as ActivityKind)}
              >
                <SelectTrigger id="activity-kind" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {ACTIVITY_KINDS.map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {ACTIVITY_KIND_LABELS[kind]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/*
              * Answered here so a clerk raising a receipt does not answer it
              * again on every entry. Still editable on the voucher itself.
              */}
            <FormField
              id="activity-fund"
              label="Fund"
              hint="Offered whenever this activity is chosen."
            >
              <Select
                value={
                  draft.defaultFundId === null
                    ? NO_FUND
                    : String(draft.defaultFundId)
                }
                onValueChange={(value) =>
                  update('defaultFundId', value === NO_FUND ? null : Number(value))
                }
              >
                <SelectTrigger id="activity-fund" className="w-full">
                  <SelectValue placeholder="Ask each time" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={NO_FUND}>Ask each time</SelectItem>

                  {funds.map((fund) => (
                    <SelectItem key={fund.id} value={String(fund.id)}>
                      {fund.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
            <div className="min-w-0 pr-4">
              <Label
                htmlFor="activity-active"
                className="text-xs font-medium text-text-secondary"
              >
                Active
              </Label>
              <p className="mt-0.5 text-[11px] text-text-muted">
                A retired activity leaves the pickers; every entry that names it
                keeps doing so.
              </p>
            </div>

            <Switch
              id="activity-active"
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

            <Button type="submit">
              {activity ? 'Save Changes' : 'Create Activity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
