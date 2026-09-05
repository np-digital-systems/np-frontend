'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

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

/** One head on the voucher, as the form holds it while being filled in. */
export interface VoucherDraftLine {
  accountId: number;
  amount: number;
  fundId: number;
  projectId: number | null;
  activityId: number | null;
  /** The occurrence this head is for, where a pooja is named. */
  eventId: number | null;
}

export interface VoucherDraft {
  date: string;
  description: string;
  /** At least one. The total is their sum, never typed directly. */
  lines: VoucherDraftLine[];
  mode: PaymentMode;
  bankAccountId: number | null;
  chequeNo: string;
  /** Who it was with — one payer per document, however it splits. */
  partyId: number | null;
  party: string;
  manualVoucherNo: string;
  notes: string;
}

const NO_PROJECT = '__none__';
const NO_DIMENSION = '__none__';

/**
 * A quiet heading between groups of fields.
 *
 * The form is filled top to bottom in the order the entry is thought about:
 * what the money is for, which fund carries it, then how much moved and how.
 */
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
  onChange: (lines: VoucherDraftLine[]) => void;
  /** Told when a pooja is picked, so the document can name its sponsor. */
  onPoojaChosen: (pooja: PoojaRef, activityName: string) => void;
  /** The head's usual party, offered to the document when the first is chosen. */
  onSuggestParty: (partyId: number) => void;
}

/**
 * The heads a voucher is coded to.
 *
 * One head is the ordinary case and reads as an ordinary form. A second is one
 * click away, for the receipt where a devotee earmarks part of what they give —
 * one document, one reference, one piece of paper, as it was handed over.
 */
function LineEditor({
  lines,
  accounts,
  funds,
  projects,
  activities,
  poojas,
  onChange,
  onSuggestParty,
  onPoojaChosen,
}: LineEditorProps) {
  const accountsByType = useMemo(() => {
    const groups = new Map<string, AccountRef[]>();

    for (const account of accounts) {
      const bucket = groups.get(account.type);

      if (bucket) bucket.push(account);
      else groups.set(account.type, [account]);
    }

    return [...groups.entries()];
  }, [accounts]);

  function edit(index: number, patch: Partial<VoucherDraftLine>) {
    onChange(lines.map((line, at) => (at === index ? { ...line, ...patch } : line)));
  }

  function addLine() {
    const last = lines[lines.length - 1];

    onChange([
      ...lines,
      // The new head inherits where the last one was carried, since a split is
      // usually two purposes out of one fund rather than two unrelated entries.
      {
        accountId: last?.accountId ?? 0,
        amount: 0,
        fundId: last?.fundId ?? 0,
        projectId: null,
        activityId: null,
        eventId: null,
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
        const activityPoojas = poojas.filter(
          (pooja) => pooja.activityId === line.activityId,
        );

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
              hint={
                index === 0
                  ? 'The head this posts against in the chart of accounts.'
                  : undefined
              }
            >
              <Select
                value={String(line.accountId)}
                onValueChange={(value) =>
                  edit(index, { accountId: Number(value) })
                }
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

              <FormField id={`voucher-line-amount-${index}`} label="Amount" required>
                <Input
                  id={`voucher-line-amount-${index}`}
                  type="number"
                  min={0}
                  step={0.01}
                  value={line.amount || ''}
                  placeholder="0.00"
                  onChange={(changeEvent) =>
                    edit(index, { amount: Number(changeEvent.target.value) || 0 })
                  }
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField id={`voucher-activity-${index}`} label="Activity">
                    <Select
                      value={
                        line.activityId === null
                          ? NO_DIMENSION
                          : String(line.activityId)
                      }
                      onValueChange={(value) => {
                        const activityId =
                          value === NO_DIMENSION ? null : Number(value);
                        const activity = activities.find(
                          (entry) => entry.id === activityId,
                        );

                        /*
                         * The activity carries its whole coding — the fund it
                         * is held in, the project it belongs to, and who it is
                         * usually with — so this one choice settles all three.
                         * Every one of them stays editable: a default is what
                         * is usually true, never a rule.
                         */
                        edit(index, {
                          activityId,
                          fundId: activity?.defaultFundId ?? line.fundId,
                          projectId: activity
                            ? activity.defaultProjectId
                            : line.projectId,
                          // A different pooja is a different occurrence.
                          eventId: null,
                        });

                        if (activity?.defaultPartyId != null) {
                          onSuggestParty(activity.defaultPartyId);
                        }
                      }}
                    >
                      <SelectTrigger id={`voucher-activity-${index}`} className="w-full">
                        <SelectValue placeholder="Not tied to one" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value={NO_DIMENSION}>Not tied to one</SelectItem>

                        {activities.map((option) => (
                          <SelectItem key={option.id} value={String(option.id)}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                {/*
                  * Only where the activity is a pooja, and on the line that
                  * names it: a split receipt's second head is the earmarked
                  * remainder and is not for this occurrence at all. It appears
                  * on payments too — the melam for one Friday, not the month.
                  */}
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
                        const eventId =
                          value === NO_DIMENSION ? null : Number(value);

                        edit(index, { eventId });

                        const pooja = poojas.find((entry) => entry.id === eventId);

                        if (pooja && activity) onPoojaChosen(pooja, activity.name);
                      }}
                    >
                      <SelectTrigger id={`voucher-pooja-${index}`} className="w-full">
                        <SelectValue placeholder="Not a particular one" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value={NO_DIMENSION}>
                          Not a particular one
                        </SelectItem>

                        {activityPoojas.map((pooja) => (
                          <SelectItem key={pooja.id} value={String(pooja.id)}>
                            {pooja.label} · {formatLongDate(pooja.date)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                )}

                {/* Only where the fund actually runs projects. */}
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
          </div>
        );
      })}

      <Button type="button" variant="outline" size="sm" className="self-start" onClick={addLine}>
        <Plus />
        Add another head
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

  // A receipt posts to income, a payment to expenditure — defaulting to the
  // right side saves the most common mis-selection there is.
  const naturalSide = kind === 'receipt' ? 'income' : 'expense';

  return {
    date: today,
    description: '',
    // One line to start with: the ordinary voucher has exactly one head, and
    // the split is the exception a clerk reaches for.
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

  // Re-seed when opened for a different record. Adjusting state during
  // render rather than in an effect keeps it to a single pass.
  const seed = `${open}|${voucher?.id ?? 'new'}|${kind}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(voucher, kind, accounts, funds, today));
    setError(null);
  }


  // The document total: summed from the heads, never typed.
  const total = draft.lines.reduce((sum, line) => sum + line.amount, 0);

  const needsBank = isBankMode(draft.mode);

  // Pooja sponsorship is the one account whose entries have to name a pooja.


  /*
   * A pooja receipt takes its activity from the pooja type, so the picker is
   * hidden there — answering it twice could only produce a disagreement.
   * Everything else names its activity directly.
   */

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

          </div>

          <SectionLabel>What this is for</SectionLabel>

          <LineEditor
            lines={draft.lines}
            accounts={accounts}
            funds={funds}
            projects={projects}
            activities={activities}
            poojas={poojas}
            onChange={(next) => setDraft((current) => ({ ...current, lines: next }))}
            onPoojaChosen={(pooja, activityName) =>
              setDraft((current) => ({
                ...current,
                /*
                 * A receipt is collected from whoever sponsors the pooja, so
                 * choosing one names the payer. Not on a payment: there the
                 * money goes to the melam or the kurukkal, not the sponsor.
                 */
                party:
                  kind === 'receipt' && pooja.sponsorName
                    ? pooja.sponsorName
                    : current.party,
                partyId:
                  kind === 'receipt' && pooja.sponsorId
                    ? (parties.find((entry) => entry.userId === pooja.sponsorId)?.id ??
                      current.partyId)
                    : current.partyId,
                // The pooja is the description; anything typed is left alone.
                description: current.description.trim()
                  ? current.description
                  : `${activityName} — ${pooja.label}`,
              }))
            }
            onSuggestParty={(partyId) =>
              setDraft((current) =>
                current.partyId === null && !current.party.trim()
                  ? {
                      ...current,
                      partyId,
                      party: parties.find((entry) => entry.id === partyId)?.name ?? '',
                    }
                  : current,
              )
            }
          />



          {/*
            * Below the pooja picker, not above it: choosing a pooja fills this
            * in from the sponsor, and only where nothing has been typed. Asked
            * for first, it would be answered twice.
            *
            * One control, not two: a name and the record it belongs to are one
            * answer. Choosing someone links the entry so the books can group by
            * them; a name that matches nobody is kept as written, which is what
            * a walk-in hundial donor needs.
            */}
          <FormField
            id="voucher-party"
            label={partyLabel(kind)}
            required
            hint="Choose someone on record, or type a name for a one-off."
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
              placeholder="What this entry is for"
              onChange={(changeEvent) =>
                update('description', changeEvent.target.value)
              }
            />
          </FormField>

          <SectionLabel>How the money moved</SectionLabel>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/*
              * Read-only: the total is the sum of the heads above. A typed
              * total that disagreed with them would be a third opinion about
              * the same money.
              */}
            <FormField
              id="voucher-total"
              label="Total"
              hint={
                draft.lines.length > 1
                  ? `${draft.lines.length} heads`
                  : 'Summed from the head above.'
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

          {/*
            * The bank details sit on their own row rather than trailing the
            * pair above, so a cash entry ends at the mode and a cheque shows
            * the account and its number side by side.
            */}
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

          {total > 0 && (
            <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-text-secondary">
              {kind === 'receipt' ? 'Receipt of ' : 'Payment of '}
              <span className="font-semibold text-text-primary tabular">
                {formatCurrency(total)}
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
