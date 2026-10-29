'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import { FormField } from '@/components/portal/ui';
import { useFormDraft } from '@/hooks/use-form-draft';
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
// Not from the events barrel: it pulls server-only code into this client bundle.
import { loadExpectedAmounts } from '@/features/events/lib/costing-actions';
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
import { PartyPicker } from './party-picker';
import {
  ACCOUNT_TYPE_LABELS,
  PAYMENT_MODES,
  PAYMENT_MODE_LABELS,
  formatCurrency,
  isBankMode,
  partyLabel,
} from '../lib/accounting-data';
import { formatLongDate } from '../lib/accounting-data';
import type {
  AccountRef,
  AccountType,
  BankAccountRef,
  FundRef,
  PaymentMode,
  ActivityRef,
  PartyRef,
  PoojaRef,
  ProjectRef,
  VoucherKind,
  VoucherRecord,
} from '../types';

export interface VoucherDraftLine {
  accountId: number;
  amount: number;
  fundId: number;
  projectId: number | null;
  activityId: number | null;
  /** Set when a pooja occurrence is chosen. */
  eventId: number | null;
  fixedDepositId: number | null;
}

export interface VoucherDraft {
  date: string;
  description: string;
  /** At least one; the total is their sum. */
  lines: VoucherDraftLine[];
  mode: PaymentMode;
  bankAccountId: number | null;
  chequeNo: string;
  partyId: number | null;
  party: string;
  manualVoucherNo: string;
  notes: string;
}

const NO_PROJECT = '__none__';
const NO_DIMENSION = '__none__';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1 text-[11px] font-semibold tracking-[0.04em] text-text-muted uppercase">
      {children}
    </p>
  );
}

interface LineEditorProps {
  lines: readonly VoucherDraftLine[];
  accounts: readonly AccountRef[];
  funds: readonly FundRef[];
  projects: readonly ProjectRef[];
  activities: readonly ActivityRef[];
  poojas: readonly PoojaRef[];
  kind: VoucherKind;
  onChange: (lines: VoucherDraftLine[]) => void;
  onPoojaChosen: (pooja: PoojaRef, activityName: string, lineIndex: number) => void;
  onSuggestParty: (partyId: number) => void;
}

function LineEditor({
  lines,
  accounts,
  funds,
  projects,
  activities,
  poojas,
  kind,
  onChange,
  onSuggestParty,
  onPoojaChosen,
}: LineEditorProps) {
  // Receipts credit income and payments debit expenditure, so a default head must be on this side.
  const codingSide = kind === 'receipt' ? 'income' : 'expense';

  const accountById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts],
  );

  function linkedTo(accountId: number): readonly ActivityRef[] {
    return activities.filter((entry) => entry.defaultAccountId === accountId);
  }

  // Falls back to every activity when none is linked to the head, so the dropdown is never empty.
  function activitiesFor(accountId: number): readonly ActivityRef[] {
    if (!accountId) return activities;

    const linked = linkedTo(accountId);

    return linked.length > 0 ? linked : activities;
  }

  function codingFor(
    activity: ActivityRef | undefined,
    line: VoucherDraftLine,
  ): Partial<VoucherDraftLine> {
    return {
      activityId: activity?.id ?? null,
      fundId: activity?.defaultFundId ?? line.fundId,
      projectId: activity ? activity.defaultProjectId : line.projectId,
      eventId: null,
    };
  }
  const accountsByType = useMemo(() => {
    const groups = new Map<string, AccountRef[]>();

    for (const account of accounts) {
      const bucket = groups.get(account.type);

      if (bucket) bucket.push(account);
      else groups.set(account.type, [account]);
    }

    return [...groups.entries()];
  }, [accounts]);

  const [coding, setCoding] = useState<ReadonlySet<number>>(new Set());

  function edit(index: number, patch: Partial<VoucherDraftLine>) {
    onChange(lines.map((line, at) => (at === index ? { ...line, ...patch } : line)));
  }

  function addLine() {
    const last = lines[lines.length - 1];

    onChange([
      ...lines,
      // Inherit the previous head's account and fund; splits usually share a fund.
      {
        accountId: last?.accountId ?? 0,
        amount: 0,
        fundId: last?.fundId ?? 0,
        projectId: null,
        activityId: null,
        eventId: null,
        fixedDepositId: null,
      },
    ]);
  }

  return (
    <div className="flex flex-col gap-3">
      {lines.map((line, index) => {
        const fundProjects = projects.filter(
          (project) => project.fundId === line.fundId && project.isActive,
        );
        const activity = activities.find((entry) => entry.id === line.activityId);
        const lineActivities = activitiesFor(line.accountId);
        const activityPoojas = poojas.filter(
          (pooja) => pooja.activityId === line.activityId,
        );
        const fundName =
          funds.find((fund) => fund.id === line.fundId)?.name ?? 'no fund';
        const projectName = projects.find(
          (project) => project.id === line.projectId,
        )?.name;

        return (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-lg border border-border bg-surface-2 p-3.5"
          >
            {lines.length > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-[0.04em] text-text-muted uppercase">
                  Head {index + 1}
                </span>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-danger hover:bg-danger-subtle hover:text-danger"
                  onClick={() => onChange(lines.filter((_, at) => at !== index))}
                >
                  Remove
                </Button>
              </div>
            )}

            <FormField
              id={`voucher-account-${index}`}
              label="Ledger Account"
              required
            >
              <Select
                value={String(line.accountId)}
                onValueChange={(value) => {
                  const accountId = Number(value);
                  const chosen = accountById.get(accountId);
                  const offered = activitiesFor(accountId);
                  const linked = linkedTo(accountId);

                  // Auto-select only when exactly one activity is linked (not from the fallback list).
                  const only = linked.length === 1 ? linked[0] : undefined;
                  const stillOffered = offered.some(
                    (entry) => entry.id === line.activityId,
                  );

                  edit(index, {
                    accountId,
                    ...(only
                      ? codingFor(only, line)
                      : stillOffered
                        ? {}
                        : { activityId: null, eventId: null }),
                  });

                  // The activity's party takes precedence over the head's default party.
                  const partyId = only?.defaultPartyId ?? chosen?.defaultPartyId;

                  if (partyId != null) onSuggestParty(partyId);
                }}
              >
                <SelectTrigger id={`voucher-account-${index}`} className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {accountsByType.map(([type, group]) => (
                    <SelectGroup key={type}>
                      <SelectLabel>{ACCOUNT_TYPE_LABELS[type as AccountType]}</SelectLabel>

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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                id={`voucher-activity-${index}`}
                label="Activity"
              >
                <Select
                  value={
                    line.activityId === null ? NO_DIMENSION : String(line.activityId)
                  }
                  onValueChange={(value) => {
                    const activityId = value === NO_DIMENSION ? null : Number(value);
                    const chosen = activities.find((entry) => entry.id === activityId);

                    // Only apply the activity's default head if it's on this voucher's side.
                    const defaultAccount =
                      chosen?.defaultAccountId != null
                        ? accountById.get(chosen.defaultAccountId)
                        : undefined;

                    edit(index, {
                      ...codingFor(chosen, line),
                      accountId:
                        defaultAccount?.type === codingSide
                          ? defaultAccount.id
                          : line.accountId,
                    });

                    if (chosen?.defaultPartyId != null) {
                      onSuggestParty(chosen.defaultPartyId);
                    }
                  }}
                >
                  <SelectTrigger id={`voucher-activity-${index}`} className="w-full">
                    <SelectValue placeholder="Not tied to one" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={NO_DIMENSION}>Not tied to one</SelectItem>

                    {lineActivities.map((option) => (
                      <SelectItem key={option.id} value={String(option.id)}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              {activity?.kind === 'pooja' && (
                <FormField
                  id={`voucher-pooja-${index}`}
                  label="Which one"
                  hint={
                    activityPoojas.length === 0
                      ? 'None scheduled for this pooja yet.'
                      : undefined
                  }
                >
                  <Select
                    value={line.eventId === null ? NO_DIMENSION : String(line.eventId)}
                    onValueChange={(value) => {
                      const eventId = value === NO_DIMENSION ? null : Number(value);

                      edit(index, { eventId });

                      const pooja = poojas.find((entry) => entry.id === eventId);

                      if (pooja && activity) onPoojaChosen(pooja, activity.name, index);
                    }}
                  >
                    <SelectTrigger id={`voucher-pooja-${index}`} className="w-full">
                      <SelectValue placeholder="Not a particular one" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value={NO_DIMENSION}>Not a particular one</SelectItem>

                      {activityPoojas.map((pooja) => (
                        <SelectItem key={pooja.id} value={String(pooja.id)}>
                          {pooja.label} · {formatLongDate(pooja.date)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            </div>

            <FormField id={`voucher-line-amount-${index}`} label="Amount" required>
              <Input
                id={`voucher-line-amount-${index}`}
                type="number"
                min={0}
                step={0.01}
                value={line.amount || ''}
                placeholder="0.00"
                className="sm:max-w-48"
                onChange={(changeEvent) =>
                  edit(index, { amount: Number(changeEvent.target.value) || 0 })
                }
              />
            </FormField>

            {!coding.has(index) ? (
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="truncate">
                  Posting to <span className="text-text-secondary">{fundName}</span>
                  {projectName && (
                    <>
                      {' · '}
                      <span className="text-text-secondary">{projectName}</span>
                    </>
                  )}
                </span>

                <button
                  type="button"
                  className="shrink-0 font-medium text-accent underline-offset-2 hover:underline"
                  onClick={() =>
                    setCoding((unfolded) => new Set(unfolded).add(index))
                  }
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField id={`voucher-fund-${index}`} label="Fund" required>
                  <Select
                    value={String(line.fundId)}
                    onValueChange={(value) =>
                      edit(index, { fundId: Number(value), projectId: null })
                    }
                  >
                    <SelectTrigger id={`voucher-fund-${index}`} className="w-full">
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

                {fundProjects.length > 0 && (
                  <FormField id={`voucher-project-${index}`} label="Project">
                    <Select
                      value={
                        line.projectId === null ? NO_PROJECT : String(line.projectId)
                      }
                      onValueChange={(value) =>
                        edit(index, {
                          projectId: value === NO_PROJECT ? null : Number(value),
                        })
                      }
                    >
                      <SelectTrigger id={`voucher-project-${index}`} className="w-full">
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
                )}
              </div>
            )}
          </div>
        );
      })}

      <Button type="button" variant="outline" size="sm" className="self-start" onClick={addLine}>
        <Plus />
        Add head
      </Button>
    </div>
  );
}

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
      lines: voucher.lines.map((line) => ({
        accountId: line.accountId,
        amount: line.amount,
        fundId: line.fundId,
        projectId: line.projectId,
        activityId: line.activityId,
        eventId: line.eventId,
        fixedDepositId: line.fixedDepositId,
      })),
      mode: voucher.mode,
      bankAccountId: voucher.bankAccountId,
      chequeNo: voucher.chequeNo ?? '',
      partyId: voucher.partyId,
      party: voucher.party,
      manualVoucherNo: voucher.manualVoucherNo ?? '',
      notes: voucher.notes ?? '',
    };
  }

  const naturalSide = kind === 'receipt' ? 'income' : 'expense';

  return {
    date: today,
    description: '',
    lines: [
      {
        accountId:
          accounts.find((account) => account.type === naturalSide)?.id ??
          accounts[0]?.id ??
          0,
        amount: 0,
        fundId: funds[0]?.id ?? 0,
        projectId: null,
        activityId: null,
        eventId: null,
        fixedDepositId: null,
      },
    ],
    mode: 'cash',
    bankAccountId: null,
    chequeNo: '',
    partyId: null,
    party: '',
    manualVoucherNo: '',
    notes: '',
  };
}

// Drafts are saved on every keystroke, so ignore one that matches the untouched form.
function isBlank(
  draft: VoucherDraft,
  kind: VoucherKind,
  voucher: VoucherRecord | null,
  accounts: readonly AccountRef[],
  funds: readonly FundRef[],
  today: string,
): boolean {
  return (
    JSON.stringify(draft) ===
    JSON.stringify(draftFrom(voucher, kind, accounts, funds, today))
  );
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
  activities: readonly ActivityRef[];
  parties: readonly PartyRef[];
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
  activities,
  parties,
  poojas,
  onSubmit,
  onSubmitForApproval,
}: VoucherFormDialogProps) {
  const today = new Date().toISOString().slice(0, 10);

  const [draft, setDraft] = useState<VoucherDraft>(() =>
    draftFrom(voucher, kind, accounts, funds, today),
  );
  const [error, setError] = useState<string | null>(null);

  // Reset the draft when opened for a different record.
  const seed = `${open}|${voucher?.id ?? 'new'}|${kind}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(voucher, kind, accounts, funds, today));
    setError(null);
  }

  // Fills an empty amount only: receipts use the sponsor quote, payments the costing line with the same head.
  async function fillFromCosting(eventId: number, lineIndex: number) {
    const expected = await loadExpectedAmounts(eventId).catch(() => null);

    if (!expected) return;

    setDraft((current) => {
      const line = current.lines[lineIndex];

      if (!line || line.amount > 0) return current;

      const amount =
        kind === 'receipt'
          ? (expected.sponsorAmount ?? 0)
          : (expected.lines.find((entry) => entry.accountId === line.accountId)?.amount ?? 0);

      if (amount <= 0) return current;

      return {
        ...current,
        lines: current.lines.map((entry, at) =>
          at === lineIndex ? { ...entry, amount } : entry,
        ),
      };
    });
  }

  const { restored, discard } = useFormDraft(
    `voucher:${voucher?.id ?? 'new'}:${kind}`,
    draft,
    { enabled: open },
  );

  const hasRestorableDraft =
    restored !== null && !isBlank(restored, kind, voucher, accounts, funds, today);

  const total = draft.lines.reduce((sum, line) => sum + line.amount, 0);

  const needsBank = isBankMode(draft.mode);

  function update<K extends keyof VoucherDraft>(key: K, value: VoucherDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
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
    const result = validate(voucherSchema, draft);

    setError(result.ok ? null : result.message);
    return result.ok;
  }

  function handleSave(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    if (!check()) return;

    onSubmit(cleaned(draft));
    discard();
    onOpenChange(false);
  }

  function handleSubmitForApproval() {
    if (!check() || !onSubmitForApproval) return;

    onSubmitForApproval(cleaned(draft));
    discard();
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
            Not posted to the ledger until approved.
          </DialogDescription>
        </DialogHeader>

        {hasRestorableDraft && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning-subtle px-3.5 py-2.5">
            <p className="text-xs text-text-secondary">
              An unsaved {kind} from earlier is still here.
            </p>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={discard}
              >
                Discard
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setDraft(restored);
                  discard();
                }}
              >
                Restore it
              </Button>
            </div>
          </div>
        )}

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
              required
              hint="From the physical voucher book."
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

          </div>

          <SectionLabel>What this is for</SectionLabel>

          <LineEditor
            lines={draft.lines}
            accounts={accounts}
            funds={funds}
            projects={projects}
            activities={activities}
            poojas={poojas}
            kind={kind}
            onChange={(next) => setDraft((current) => ({ ...current, lines: next }))}
            onPoojaChosen={(pooja, activityName, lineIndex) => {
              setDraft((current) => ({
                ...current,
                // Receipts are paid by the pooja's sponsor; payments go to someone else.
                party:
                  kind === 'receipt' && pooja.sponsorName
                    ? pooja.sponsorName
                    : current.party,
                partyId:
                  kind === 'receipt' && pooja.sponsorPartyId
                    ? pooja.sponsorPartyId
                    : current.partyId,
                description: current.description.trim()
                  ? current.description
                  : `${activityName} — ${pooja.label}`,
              }));

              void fillFromCosting(pooja.id, lineIndex);
            }}
            // Overwrites the current party: the user chose this head or activity deliberately.
            onSuggestParty={(partyId) =>
              setDraft((current) => {
                const party = parties.find((entry) => entry.id === partyId);

                if (!party) return current;

                return { ...current, partyId, party: party.name };
              })
            }
          />

          <FormField
            id="voucher-party"
            label={partyLabel(kind)}
            required
          >
            <PartyPicker
              id="voucher-party"
              name={draft.party}
              partyId={draft.partyId}
              parties={parties}
              placeholder={
                kind === 'receipt'
                  ? 'Devotee, trust or collection point'
                  : 'Vendor, contractor or payee'
              }
              onChange={({ name, partyId }) =>
                setDraft((current) => ({ ...current, party: name, partyId }))
              }
            />
          </FormField>

          <FormField id="voucher-description" label="Description" required>
            <Input
              id="voucher-description"
              value={draft.description}
              onChange={(changeEvent) =>
                update('description', changeEvent.target.value)
              }
            />
          </FormField>

          <SectionLabel>How the money moved</SectionLabel>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="voucher-total"
              label="Total"
              hint={
                draft.lines.length > 1
                  ? `${draft.lines.length} heads`
                  : undefined
              }
            >
              <output
                id="voucher-total"
                className="flex h-9 items-center rounded-md border border-border bg-surface-2 px-3 text-[13px] font-semibold text-text-primary tabular"
              >
                {formatCurrency(total)}
              </output>
            </FormField>

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

          </div>

          {needsBank && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>
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
