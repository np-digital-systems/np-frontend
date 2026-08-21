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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import { ACCOUNT_TYPES, ACCOUNT_TYPE_LABELS } from '../lib/accounting-data';
import type { Account, AccountType } from '../types';

export interface AccountDraft {
  code: string;
  name: string;
  nameTa: string;
  type: AccountType;
  parentId: number | null;
  isActive: boolean;
}

const NO_PARENT = '__none__';

/** The class each code range belongs to, as the temple's chart is numbered. */
const CODE_PREFIX: Record<AccountType, string> = {
  asset: '1',
  liability: '2',
  equity: '3',
  income: '4',
  expense: '5',
};

function draftFrom(account: Account | null): AccountDraft {
  if (account) {
    return {
      code: account.code,
      name: account.name,
      nameTa: account.nameTa,
      type: account.type,
      parentId: account.parentId,
      isActive: account.isActive,
    };
  }

  return {
    code: '',
    name: '',
    nameTa: '',
    type: 'expense',
    parentId: null,
    isActive: true,
  };
}

interface AccountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
  /** Group heads only — an entry never posts to something with children. */
  parents: readonly Account[];
  existing: readonly Account[];
  onSubmit: (draft: AccountDraft) => void;
}

/**
 * Create or edit a ledger account.
 *
 * The code carries meaning — its first digit is the account class — so the
 * form checks that the code and the chosen type agree rather than letting an
 * income account be filed at 5001 where every report would misplace it.
 */
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

    const code = draft.code.trim();

    if (!code) {
      setError('An account code is required.');
      return;
    }

    if (!/^\d{4}$/.test(code)) {
      setError('The account code must be four digits, e.g. 5012.');
      return;
    }

    if (!code.startsWith(CODE_PREFIX[draft.type])) {
      setError(
        `${ACCOUNT_TYPE_LABELS[draft.type]} accounts are numbered in the ${CODE_PREFIX[draft.type]}000 range.`,
      );
      return;
    }

    if (
      existing.some(
        (entry) => entry.code === code && entry.id !== account?.id,
      )
    ) {
      setError(`Account code ${code} is already in use.`);
      return;
    }

    if (!draft.name.trim()) {
      setError('An account name is required.');
      return;
    }

    setError(null);
    onSubmit({
      ...draft,
      code,
      name: draft.name.trim(),
      nameTa: draft.nameTa.trim(),
    });
    onOpenChange(false);
  }

  const eligibleParents = parents.filter(
    (parent) => parent.type === draft.type && parent.id !== account?.id,
  );

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
              hint={`Numbered in the ${CODE_PREFIX[draft.type]}000 range.`}
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
                placeholder={`${CODE_PREFIX[draft.type]}012`}
                onChange={(changeEvent) =>
                  update('code', changeEvent.target.value)
                }
              />
            </FormField>
          </div>

          <FormField id="account-name" label="Name (English)" required>
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
