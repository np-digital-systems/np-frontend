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
import { EntityCombobox } from '@/components/ui/entity-combobox';
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

import {
  ACTIVITY_KINDS,
  ACTIVITY_KIND_LABELS,
  PARTY_KIND_LABELS,
} from '../lib/accounting-data';
import { activitySchema } from '../lib/accounting-schemas';
import type {
  AccountRef,
  ActivityKind,
  ActivityRecord,
  FundRef,
  PartyRef,
  ProjectRef,
} from '../types';

export interface ActivityDraft {
  nameTa: string;
  nameEn: string;
  kind: ActivityKind;
  defaultFundId: number | null;
  defaultProjectId: number | null;
  defaultPartyId: number | null;
  defaultAccountId: number | null;
  isActive: boolean;
}

function draftFrom(activity: ActivityRecord | null): ActivityDraft {
  if (activity) {
    return {
      nameTa: activity.name,
      nameEn: activity.nameEn,
      kind: activity.kind,
      defaultAccountId: activity.defaultAccountId,
      defaultFundId: activity.defaultFundId,
      defaultProjectId: activity.defaultProjectId,
      defaultPartyId: activity.defaultPartyId,
      isActive: activity.isActive,
    };
  }

  return {
    nameTa: '',
    nameEn: '',
    kind: 'pooja',
    defaultAccountId: null,
    defaultFundId: null,
    defaultProjectId: null,
    defaultPartyId: null,
    isActive: true,
  };
}

interface ActivityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: ActivityRecord | null;
  funds: readonly FundRef[];
  projects: readonly ProjectRef[];
  parties: readonly PartyRef[];
  /** Postable income and expense heads only. */
  accounts: readonly AccountRef[];
  /** Creates a party from the picker and returns its id. */
  onCreateParty?: (name: string) => Promise<number | null>;
  onSubmit: (draft: ActivityDraft) => void;
}

export function ActivityFormDialog({
  open,
  onOpenChange,
  activity,
  funds,
  projects,
  parties,
  accounts,
  onCreateParty,
  onSubmit,
}: ActivityFormDialogProps) {
  const [draft, setDraft] = useState<ActivityDraft>(() => draftFrom(activity));
  const [error, setError] = useState<string | null>(null);

  // Parties created here, shown until the server re-renders with them.
  const [added, setAdded] = useState<{ id: number; name: string }[]>([]);
  const [busy, setBusy] = useState(false);

  const fundProjects = projects.filter(
    (project) => project.fundId === draft.defaultFundId && project.isActive,
  );

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

  async function createAndSelectParty(name: string) {
    if (!onCreateParty) return;

    setBusy(true);
    const id = await onCreateParty(name);
    setBusy(false);

    if (id === null) {
      setError(`“${name}” could not be added.`);
      return;
    }

    setError(null);
    setAdded((current) => [...current, { id, name }]);
    update('defaultPartyId', id);
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
            Groups income and expenditure for reporting.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            id="activity-name-ta"
            label="Name (Tamil)"
            required
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

            <FormField
              id="activity-account"
              label="Ledger head"
            >
              <EntityCombobox
                id="activity-account"
                value={
                  draft.defaultAccountId === null
                    ? null
                    : String(draft.defaultAccountId)
                }
                options={accounts.map((account) => ({
                  value: String(account.id),
                  label: `${account.code} · ${account.name}`,
                }))}
                noneLabel="Ask each time"
                searchPlaceholder="Search heads…"
                emptyMessage="No head matches that search."
                onChange={(value) =>
                  update('defaultAccountId', value === null ? null : Number(value))
                }
              />
            </FormField>

            <FormField
              id="activity-fund"
              label="Fund"
            >
              <EntityCombobox
                id="activity-fund"
                value={
                  draft.defaultFundId === null
                    ? null
                    : String(draft.defaultFundId)
                }
                options={funds.map((fund) => ({
                  value: String(fund.id),
                  label: fund.name,
                }))}
                noneLabel="Ask each time"
                searchPlaceholder="Search funds…"
                emptyMessage="No fund matches that search."
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    defaultFundId: value === null ? null : Number(value),
                    // Projects belong to one fund, so reset on fund change.
                    defaultProjectId: null,
                  }))
                }
              />
            </FormField>
          </div>

          {fundProjects.length > 0 && (
            <FormField
              id="activity-project"
              label="Project"
            >
              <EntityCombobox
                id="activity-project"
                value={
                  draft.defaultProjectId === null
                    ? null
                    : String(draft.defaultProjectId)
                }
                options={fundProjects.map((project) => ({
                  value: String(project.id),
                  label: project.name,
                }))}
                noneLabel="Not part of a project"
                searchPlaceholder="Search projects…"
                emptyMessage="No project matches that search."
                onChange={(value) =>
                  update(
                    'defaultProjectId',
                    value === null ? null : Number(value),
                  )
                }
              />
            </FormField>
          )}

          <FormField
            id="activity-party"
            label="Usually with"
          >
            <EntityCombobox
              id="activity-party"
              value={
                draft.defaultPartyId === null
                  ? null
                  : String(draft.defaultPartyId)
              }
              options={[
                ...parties.map((party) => ({
                  value: String(party.id),
                  label: party.name,
                  description: party.nameEn || undefined,
                  badge: party.roles
                    .map((role) => PARTY_KIND_LABELS[role])
                    .join(' · '),
                })),
                ...added
                  .filter(
                    (entry) => !parties.some((party) => party.id === entry.id),
                  )
                  .map((entry) => ({
                    value: String(entry.id),
                    label: entry.name,
                  })),
              ]}
              noneLabel="Ask each time"
              disabled={busy}
              searchPlaceholder="Search or type a name…"
              emptyMessage="Nobody matches that search."
              createLabel={
                onCreateParty ? (typed) => `Add “${typed}” as a party` : undefined
              }
              onCreate={
                onCreateParty
                  ? (typed) => void createAndSelectParty(typed)
                  : undefined
              }
              onChange={(value) =>
                update('defaultPartyId', value === null ? null : Number(value))
              }
            />
          </FormField>

          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
            <div className="min-w-0 pr-4">
              <Label
                htmlFor="activity-active"
                className="text-xs font-medium text-text-secondary"
              >
                Active
              </Label>
              <p className="mt-0.5 text-[11px] text-text-muted">
                Inactive activities are hidden from pickers.
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
