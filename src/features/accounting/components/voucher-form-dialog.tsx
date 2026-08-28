'use client';

import { useMemo, useState } from 'react';

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
  SelectLabel,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { voucherSchema } from '../lib/accounting-schemas';
import {
  ACCOUNT_TYPE_LABELS,
  PAYMENT_MODES,
  PAYMENT_MODE_LABELS,
  formatCurrency,
  isBankMode,
  partyLabel,
} from '../lib/accounting-data';
import { POOJA_SPONSORSHIP_CODE, formatLongDate } from '../lib/accounting-data';
import type {
  AccountRef,
  AccountType,
  BankAccountRef,
  FundRef,
  PaymentMode,
  PoojaRef,
  PoojaTypeRef,
  ProjectRef,
  VoucherKind,
  VoucherRecord,
} from '../types';

export interface VoucherDraft {
  date: string;
  description: string;
  amount: number;
  accountId: number;
  fundId: number;
  projectId: number | null;
  mode: PaymentMode;
  bankAccountId: number | null;
  chequeNo: string;
  party: string;
  manualVoucherNo: string;
  eventTypeId: number | null;
  eventId: number | null;
  eventRef: string | null;
  notes: string;
}

const NO_PROJECT = '__none__';

function draftFrom(
  voucher: VoucherRecord | null,
  kind: VoucherKind,
  accounts: readonly AccountRef[],
  funds: readonly FundRef[],
  today: string,
): VoucherDraft {
  if (voucher) {
    return {
      date: voucher.date,
      description: voucher.description,
      amount: voucher.amount,
      accountId: voucher.accountId,
      fundId: voucher.fundId,
      projectId: voucher.projectId,
      mode: voucher.mode,
      bankAccountId: voucher.bankAccountId,
      chequeNo: voucher.chequeNo ?? '',
      party: voucher.party,
      manualVoucherNo: voucher.manualVoucherNo ?? '',
      eventTypeId: voucher.eventTypeId,
      eventId: voucher.eventId,
      eventRef: voucher.eventRef,
      notes: voucher.notes ?? '',
    };
  }

  // A receipt posts to income, a payment to expenditure — defaulting to the
  // right side saves the most common mis-selection there is.
  const naturalSide = kind === 'receipt' ? 'income' : 'expense';

  return {
    date: today,
    description: '',
    amount: 0,
    accountId:
      accounts.find((account) => account.type === naturalSide)?.id ??
      accounts[0]?.id ??
      0,
    fundId: funds[0]?.id ?? 0,
    projectId: null,
    mode: 'cash',
    bankAccountId: null,
    chequeNo: '',
    party: '',
    manualVoucherNo: '',
    eventTypeId: null,
    eventId: null,
    eventRef: null,
    notes: '',
  };
}

interface VoucherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: VoucherKind;
  voucher: VoucherRecord | null;
  accounts: readonly AccountRef[];
  funds: readonly FundRef[];
  projects: readonly ProjectRef[];
  bankAccounts: readonly BankAccountRef[];
  poojaTypes: readonly PoojaTypeRef[];
  poojas: readonly PoojaRef[];
  onSubmit: (draft: VoucherDraft) => void;
    onSubmitForApproval?: (draft: VoucherDraft) => void;
}

export function VoucherFormDialog({
  open,
  onOpenChange,
  kind,
  voucher,
  accounts,
  funds,
  projects,
  bankAccounts,
  poojaTypes,
  poojas,
  onSubmit,
  onSubmitForApproval,
}: VoucherFormDialogProps) {
  const today = new Date().toISOString().slice(0, 10);

  const [draft, setDraft] = useState<VoucherDraft>(() =>
    draftFrom(voucher, kind, accounts, funds, today),
  );
  const [error, setError] = useState<string | null>(null);

  // Re-seed when opened for a different record. Adjusting state during
  // render rather than in an effect keeps it to a single pass.
  const seed = `${open}|${voucher?.id ?? 'new'}|${kind}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(voucher, kind, accounts, funds, today));
    setError(null);
  }

  const accountsByType = useMemo(() => {
    const groups = new Map<string, AccountRef[]>();

    for (const account of accounts) {
      const bucket = groups.get(account.type);

      if (bucket) {
        bucket.push(account);
      } else {
        groups.set(account.type, [account]);
      }
    }

    return [...groups.entries()];
  }, [accounts]);

  const fundProjects = projects.filter(
    (project) => project.fundId === draft.fundId && project.isActive,
  );

  const needsBank = isBankMode(draft.mode);

  // Pooja sponsorship is the one account whose entries have to name a pooja.
  const selectedAccount = accounts.find(
    (account) => account.id === draft.accountId,
  );
  const isPoojaSponsorship = selectedAccount?.code === POOJA_SPONSORSHIP_CODE;

  const typePoojas = poojas.filter(
    (pooja) => pooja.eventTypeId === draft.eventTypeId,
  );
  const selectedPooja = poojas.find((pooja) => pooja.id === draft.eventId);
  const selectedPoojaType = poojaTypes.find(
    (type) => type.id === draft.eventTypeId,
  );

  function update<K extends keyof VoucherDraft>(key: K, value: VoucherDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

    function changeFund(fundId: number) {
    setDraft((current) => ({ ...current, fundId, projectId: null }));
  }

  function changeMode(mode: PaymentMode) {
    setDraft((current) => ({
      ...current,
      mode,
      bankAccountId: isBankMode(mode)
        ? current.bankAccountId ?? bankAccounts[0]?.id ?? null
        : null,
      chequeNo: mode === 'cheque' ? current.chequeNo : '',
    }));
  }

  function check(): boolean {
    const pooja = poojaError();

    if (pooja) {
      setError(pooja);
      return false;
    }

    const result = validate(voucherSchema, draft);

    setError(result.ok ? null : result.message);
    return result.ok;
  }

  function poojaError(): string | null {
    if (!isPoojaSponsorship) return null;
    if (draft.eventTypeId === null) return 'Choose the pooja type this entry is for.';
    if (draft.eventId === null) return 'Choose which pooja this entry is for.';
    return null;
  }

  function handleSave(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    if (!check()) return;

    onSubmit(cleaned(draft));
    onOpenChange(false);
  }

  function handleSubmitForApproval() {
    if (!check() || !onSubmitForApproval) return;

    onSubmitForApproval(cleaned(draft));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {voucher ? `Edit ${voucher.ref}` : `New ${kind === 'receipt' ? 'Receipt' : 'Payment'} Voucher`}
          </DialogTitle>
          <DialogDescription>
            {kind === 'receipt'
              ? 'Record money received by the temple. Nothing reaches the ledger until it is approved and posted.'
              : 'Record money paid out by the temple. Nothing reaches the ledger until it is approved and posted.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="voucher-date" label="Date" required>
              <Input
                id="voucher-date"
                type="date"
                value={draft.date}
                onChange={(changeEvent) =>
                  update('date', changeEvent.target.value)
                }
              />
            </FormField>

            <FormField
              id="voucher-manual-no"
              label="Manual Voucher No"
              hint="The number on the temple's physical voucher book."
            >
              <Input
                id="voucher-manual-no"
                value={draft.manualVoucherNo}
                placeholder="e.g. 1247"
                onChange={(changeEvent) =>
                  update('manualVoucherNo', changeEvent.target.value)
                }
              />
            </FormField>

            <FormField id="voucher-amount" label="Amount" required>
              <Input
                id="voucher-amount"
                type="number"
                min={0}
                step={0.01}
                value={draft.amount || ''}
                onChange={(changeEvent) =>
                  update('amount', Number(changeEvent.target.value) || 0)
                }
              />
            </FormField>
          </div>

          <FormField id="voucher-party" label={partyLabel(kind)} required>
            <Input
              id="voucher-party"
              value={draft.party}
              placeholder={
                kind === 'receipt'
                  ? 'Devotee, trust or collection point'
                  : 'Vendor, contractor or payee'
              }
              onChange={(changeEvent) =>
                update('party', changeEvent.target.value)
              }
            />
          </FormField>

          <FormField id="voucher-description" label="Description" required>
            <Input
              id="voucher-description"
              value={draft.description}
              placeholder="What this entry is for"
              onChange={(changeEvent) =>
                update('description', changeEvent.target.value)
              }
            />
          </FormField>

          <FormField
            id="voucher-account"
            label="Ledger Account"
            required
            hint="The head this entry posts against in the chart of accounts."
          >
            <Select
              value={String(draft.accountId)}
              onValueChange={(value) => update('accountId', Number(value))}
            >
              <SelectTrigger id="voucher-account" className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {accountsByType.map(([type, group]) => (
                  <SelectGroup key={type}>
                    <SelectLabel>
                      {ACCOUNT_TYPE_LABELS[type as AccountType]}
                    </SelectLabel>

                    {group.map((account) => (
                      <SelectItem key={account.id} value={String(account.id)}>
                        {account.code} · {account.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {isPoojaSponsorship && (
            <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-2 p-3.5">
              <p className="text-[11px] font-semibold tracking-[0.04em] text-text-muted uppercase">
                Which pooja
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField id="voucher-pooja-type" label="Pooja Type" required>
                  <Select
                    value={
                      draft.eventTypeId === null ? '' : String(draft.eventTypeId)
                    }
                    onValueChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        eventTypeId: Number(value),
                        // The pooja belongs to a type, so changing the type
                        // invalidates whatever pooja was chosen under the old one.
                        eventId: null,
                        eventRef: null,
                      }))
                    }
                  >
                    <SelectTrigger id="voucher-pooja-type" className="w-full">
                      <SelectValue placeholder="Select a pooja type" />
                    </SelectTrigger>

                    <SelectContent>
                      {poojaTypes.map((type) => (
                        <SelectItem key={type.id} value={String(type.id)}>
                          {type.name} · {type.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  id="voucher-pooja"
                  label="Pooja"
                  required
                  hint={
                    draft.eventTypeId === null
                      ? 'Choose a pooja type first.'
                      : typePoojas.length === 0
                        ? 'No poojas scheduled under this type yet.'
                        : undefined
                  }
                >
                  <Select
                    value={draft.eventId === null ? '' : String(draft.eventId)}
                    disabled={draft.eventTypeId === null}
                    onValueChange={(value) => {
                      const pooja = poojas.find(
                        (entry) => entry.id === Number(value),
                      );

                      setDraft((current) => ({
                        ...current,
                        eventId: Number(value),
                        eventRef: pooja
                          ? `${selectedPoojaType?.name ?? ''} — ${pooja.label}`
                          : null,
                        // A receipt is collected from whoever sponsors the
                        // pooja, so selecting one fills the payer in.
                        party:
                          kind === 'receipt' && pooja?.sponsorName
                            ? pooja.sponsorName
                            : current.party,
                        // The pooja is the description for these entries;
                        // anything the user already typed is left alone.
                        description:
                          pooja && !current.description.trim()
                            ? `${selectedPoojaType?.name ?? ''} — ${pooja.label}`
                            : current.description,
                      }));
                    }}
                  >
                    <SelectTrigger id="voucher-pooja" className="w-full">
                      <SelectValue placeholder="Select a pooja" />
                    </SelectTrigger>

                    <SelectContent>
                      {typePoojas.map((pooja) => (
                        <SelectItem key={pooja.id} value={String(pooja.id)}>
                          {pooja.label} · {formatLongDate(pooja.date)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              {selectedPooja && (
                <p className="text-xs text-text-secondary">
                  {selectedPoojaType?.name} — {selectedPooja.label}
                  {selectedPooja.sponsorName
                    ? ` · sponsored by ${selectedPooja.sponsorName}`
                    : ' · no sponsor assigned yet'}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="voucher-fund" label="Fund" required>
              <Select
                value={String(draft.fundId)}
                onValueChange={(value) => changeFund(Number(value))}
              >
                <SelectTrigger id="voucher-fund" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {funds.map((fund) => (
                    <SelectItem key={fund.id} value={String(fund.id)}>
                      {fund.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              id="voucher-project"
              label="Project"
              hint={
                fundProjects.length === 0
                  ? 'This fund has no active projects.'
                  : undefined
              }
            >
              <Select
                value={
                  draft.projectId === null ? NO_PROJECT : String(draft.projectId)
                }
                onValueChange={(value) =>
                  update('projectId', value === NO_PROJECT ? null : Number(value))
                }
              >
                <SelectTrigger id="voucher-project" className="w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={NO_PROJECT}>None</SelectItem>

                  {fundProjects.map((project) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="voucher-mode" label="Mode" required>
              <Select
                value={draft.mode}
                onValueChange={(value) => changeMode(value as PaymentMode)}
              >
                <SelectTrigger id="voucher-mode" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {PAYMENT_MODES.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {PAYMENT_MODE_LABELS[mode]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {needsBank && (
              <FormField id="voucher-bank" label="Bank Account" required>
                <Select
                  value={
                    draft.bankAccountId === null
                      ? ''
                      : String(draft.bankAccountId)
                  }
                  onValueChange={(value) =>
                    update('bankAccountId', Number(value))
                  }
                >
                  <SelectTrigger id="voucher-bank" className="w-full">
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>

                  <SelectContent>
                    {bankAccounts
                      .filter((bank) => bank.isActive)
                      .map((bank) => (
                        <SelectItem key={bank.id} value={String(bank.id)}>
                          {bank.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormField>
            )}
          </div>

          {draft.mode === 'cheque' && (
            <FormField id="voucher-cheque" label="Cheque Number" required>
              <Input
                id="voucher-cheque"
                value={draft.chequeNo}
                placeholder="004601"
                onChange={(changeEvent) =>
                  update('chequeNo', changeEvent.target.value)
                }
              />
            </FormField>
          )}

          <FormField id="voucher-notes" label="Notes">
            <Textarea
              id="voucher-notes"
              rows={2}
              value={draft.notes}
              placeholder="Anything an approver should know"
              onChange={(changeEvent) =>
                update('notes', changeEvent.target.value)
              }
            />
          </FormField>

          {draft.amount > 0 && (
            <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-text-secondary">
              {kind === 'receipt' ? 'Receipt of ' : 'Payment of '}
              <span className="font-semibold text-text-primary tabular">
                {formatCurrency(draft.amount)}
              </span>{' '}
              — this does not affect the ledger until it is approved and posted.
            </p>
          )}

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

            <Button type="submit" variant="secondary">
              Save as Draft
            </Button>

            {onSubmitForApproval && (
              <Button type="button" onClick={handleSubmitForApproval}>
                Save &amp; Submit
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function cleaned(draft: VoucherDraft): VoucherDraft {
  return {
    ...draft,
    party: draft.party.trim(),
    description: draft.description.trim(),
    chequeNo: draft.chequeNo.trim(),
    notes: draft.notes.trim(),
  };
}
