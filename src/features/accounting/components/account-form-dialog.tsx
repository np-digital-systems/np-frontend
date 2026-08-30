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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import {
  ACCOUNT_NATURAL_SIDE,
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_LABELS,
  opensAtZero,
} from '../lib/accounting-data';
import { ACCOUNT_CODE_PREFIX, accountSchema } from '../lib/accounting-schemas';
import type { Account, AccountRecord, AccountType } from '../types';

export interface AccountDraft {
  code: string;
  name: string;
  nameTa: string;
  type: AccountType;
  parentId: number | null;
  openingBalance: number;
  isActive: boolean;
}

const NO_PARENT = '__none__';

function draftFrom(account: AccountRecord | null): AccountDraft {
  if (account) {
    return {
      code: account.code,
      name: account.name,
      nameTa: account.nameTa,
      type: account.type,
      parentId: account.parentId,
      openingBalance: account.openingBalance,
      isActive: account.isActive,
    };
  }

  return {
    code: '',
    name: '',
    nameTa: '',
    type: 'expense',
    parentId: null,
    openingBalance: 0,
    isActive: true,
  };
}

interface AccountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: AccountRecord | null;
    parents: readonly Account[];
  existing: readonly Account[];
  onSubmit: (draft: AccountDraft) => void;
}

export function AccountFormDialog({
  open,
  onOpenChange,
  account,
  parents,
  existing,
  onSubmit,
}: AccountFormDialogProps) {
  const [draft, setDraft] = useState<AccountDraft>(() => draftFrom(account));
  const [error, setError] = useState<string | null>(null);

  const seed = `${open}|${account?.id ?? 'new'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(account));
    setError(null);
  }

  function update<K extends keyof AccountDraft>(key: K, value: AccountDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    const result = validate(accountSchema, draft);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    if (
      existing.some(
        (entry) => entry.code === result.data.code && entry.id !== account?.id,
      )
    ) {
      setError(`Account code ${result.data.code} is already in use.`);
      return;
    }

    setError(null);
    onSubmit(result.data);
    onOpenChange(false);
  }

  const eligibleParents = parents.filter(
    (parent) => parent.type === draft.type && parent.id !== account?.id,
  );

  /*
   * An opening balance is the position the books were handed over at, so the
   * API settles it the moment the first entry posts against the head. Showing
   * that here means the figure is greyed out rather than rejected on save.
   */
  const openingIsSettled = (account?.entryCount ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {account ? `Edit ${account.code}` : 'New Ledger Account'}
          </DialogTitle>
          <DialogDescription>
            Accounts are the heads every receipt and payment posts against.
            Changing one changes how every report groups its figures.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="account-type"
              label="Account Class"
              required
              hint={`Numbered in the ${ACCOUNT_CODE_PREFIX[draft.type]}000 range.`}
            >
              <Select
                value={draft.type}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    type: value as AccountType,
                    // A parent belongs to one class; keeping it across a
                    // class change would put the account under the wrong head.
                    parentId: null,
                    // Likewise a figure typed for a real class means nothing
                    // on a head that is required to open at nil.
                    openingBalance: opensAtZero(value as AccountType)
                      ? 0
                      : current.openingBalance,
                  }))
                }
              >
                <SelectTrigger id="account-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {ACCOUNT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {ACCOUNT_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="account-code" label="Code" required>
              <Input
                id="account-code"
                value={draft.code}
                inputMode="numeric"
                placeholder={`${ACCOUNT_CODE_PREFIX[draft.type]}012`}
                onChange={(changeEvent) =>
                  update('code', changeEvent.target.value)
                }
              />
            </FormField>
          </div>

          <FormField id="account-name" label="Name (English)">
            <Input
              id="account-name"
              value={draft.name}
              placeholder="Flowers & Pooja Materials"
              onChange={(changeEvent) =>
                update('name', changeEvent.target.value)
              }
            />
          </FormField>

          <FormField
            id="account-name-ta"
            label="Name (Tamil)"
            required
            hint="Shown on Tamil statements and the printed ledger."
          >
            <Input
              id="account-name-ta"
              value={draft.nameTa}
              placeholder="மலர் மற்றும் பூஜைப் பொருட்கள்"
              onChange={(changeEvent) =>
                update('nameTa', changeEvent.target.value)
              }
            />
          </FormField>

          <FormField
            id="account-parent"
            label="Group"
            hint={
              eligibleParents.length === 0
                ? 'No group heads exist for this class yet.'
                : 'The head this account is reported under.'
            }
          >
            <Select
              value={draft.parentId === null ? NO_PARENT : String(draft.parentId)}
              onValueChange={(value) =>
                update('parentId', value === NO_PARENT ? null : Number(value))
              }
            >
              <SelectTrigger id="account-parent" className="w-full">
                <SelectValue placeholder="Top level" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={NO_PARENT}>
                  Top level — a group head itself
                </SelectItem>

                {eligibleParents.map((parent) => (
                  <SelectItem key={parent.id} value={String(parent.id)}>
                    {parent.code} · {parent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {!opensAtZero(draft.type) && (
            <FormField
              id="account-opening"
              label="Opening Balance"
              hint={
                openingIsSettled
                  ? `Settled — ${account?.entryCount} entries are already posted against this head.`
                  : `What this head stood at when the books opened, as a ${ACCOUNT_NATURAL_SIDE[draft.type]} figure.`
              }
            >
              <Input
                id="account-opening"
                type="number"
                min={0}
                step={0.01}
                disabled={openingIsSettled}
                value={draft.openingBalance || ''}
                placeholder="0.00"
                onChange={(changeEvent) =>
                  update(
                    'openingBalance',
                    Number(changeEvent.target.value) || 0,
                  )
                }
              />
            </FormField>
          )}

          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
            <div className="min-w-0 pr-4">
              <Label
                htmlFor="account-active"
                className="text-xs font-medium text-text-secondary"
              >
                Active
              </Label>
              <p className="mt-0.5 text-[11px] text-text-muted">
                Inactive accounts keep their history but cannot be posted to.
              </p>
            </div>

            <Switch
              id="account-active"
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

            <Button type="submit">
              {account ? 'Save Changes' : 'Create Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
