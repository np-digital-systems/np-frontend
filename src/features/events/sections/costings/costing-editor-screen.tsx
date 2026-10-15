'use client';

import { useState } from 'react';
import { ArrowLeft, History, Plus, Trash2 } from 'lucide-react';

import {
  ActionError,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  ConfirmDialog,
  ReadOnlyNotice,
  StatCard,
  StatusBadge,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useServerAction } from '@/hooks/use-server-action';
import { Link, useRouter } from '@/i18n/routing';
import { formatCurrency } from '@/lib/format';
import { validate } from '@/lib/validation';

import { applyCosting, updateCosting } from '../../lib/costing-actions';
import {
  costingBadge,
  describePeriod,
  versionLabel,
  describeScope,
  describeScopeReach,
  isReadOnly,
  revisionNotice,
} from '../../lib/costing-data';
import { costingLinesSchema } from '../../lib/costing-schemas';
import { costingHistoryRoute, costingRoute, EVENT_ROUTES } from '../../lib/routes';
import type { CostingLineDraft, CostingRecord } from '../../types/costing';

interface AccountOption {
  readonly id: number;
  readonly code: string;
  readonly name: string;
}

interface NamedOption {
  readonly id: number;
  readonly name: string;
}

const NONE = '__none__';

const round2 = (value: number) => Math.round(value * 100) / 100;

function lineTotal(line: CostingLineDraft): number {
  if (line.items.length === 0) return line.amount;

  return round2(line.items.reduce((total, item) => total + item.amount, 0));
}

function draftFrom(costing: CostingRecord): CostingLineDraft[] {
  return costing.lines.map((line) => ({
    accountId: line.accountId,
    partyId: line.partyId,
    label: line.label,
    amount: line.amount,
    chargedToSponsor: line.chargedToSponsor,
    items: line.items.map((item) => ({ label: item.label, amount: item.amount })),
  }));
}

interface CostingEditorScreenProps {
  costing: CostingRecord;
  expenseAccounts: readonly AccountOption[];
  parties: readonly NamedOption[];
  /** Newest first. */
  history: readonly CostingRecord[];
  canManage: boolean;
}

export function CostingEditorScreen({
  costing,
  expenseAccounts,
  parties,
  history,
  canManage,
}: CostingEditorScreenProps) {
  const [lines, setLines] = useState<CostingLineDraft[]>(() => draftFrom(costing));
  const [error, setError] = useState<string | null>(null);

  const { run, error: actionError, pending } = useServerAction();
  const router = useRouter();
  const [applying, setApplying] = useState(false);

  const earlier = history.filter((version) => version.id !== costing.id);

  const readOnly = isReadOnly(costing);
  const editable = canManage && !readOnly;
  const notice = revisionNotice(costing);

  // Save stays disabled until something changes, so an unchanged draft is never written.
  const [saved, setSaved] = useState(() => JSON.stringify(draftFrom(costing)));
  const dirty = JSON.stringify(lines) !== saved;

  // The API refuses to apply an empty costing.
  const applicable = costing.isDraft && lines.length > 0 && !dirty;

  const expenseTotal = round2(lines.reduce((total, line) => total + lineTotal(line), 0));
  const quoted = round2(
    lines
      .filter((line) => line.chargedToSponsor)
      .reduce((total, line) => total + lineTotal(line), 0),
  );
  const templeShare = round2(expenseTotal - quoted);

  function patchLine(index: number, patch: Partial<CostingLineDraft>) {
    setLines((current) =>
      current.map((line, at) => (at === index ? { ...line, ...patch } : line)),
    );
  }

  // Saving the in-force version writes to a separate draft, so navigate to it.
  function handleSave() {
    const result = validate(costingLinesSchema, lines);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError(null);

    run(async () => {
      const written = await updateCosting(costing.id, {
        lines: result.data as CostingLineDraft[],
      });

      if (written.ok) {
        if (written.costingId !== undefined && written.costingId !== costing.id) {
          router.replace(costingRoute(written.costingId));
        } else {
          setSaved(JSON.stringify(lines));
        }
      }

      return written;
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="self-start" asChild>
          <Link href={EVENT_ROUTES.costings}>
            <ArrowLeft />
            All costings
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-[-0.01em] text-text-primary">
                {describeScope(costing)}
              </h1>

              <StatusBadge status={costingBadge(costing)} />
            </div>

            <p className="text-sm text-text-secondary">
              {versionLabel(costing)} · {describeScopeReach(costing)} · {describePeriod(costing)}
            </p>
          </div>

          {editable && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => addLine(setLines, expenseAccounts)}>
                <Plus />
                Add line
              </Button>

              <Button
                variant="outline"
                onClick={handleSave}
                disabled={pending || !dirty}
                title={dirty ? undefined : 'Nothing has changed yet'}
              >
                Save
              </Button>

              {costing.isDraft && (
                <Button
                  onClick={() => setApplying(true)}
                  disabled={pending || !applicable}
                  title={
                    lines.length === 0
                      ? 'Add an expense line first'
                      : dirty
                        ? 'Save your changes first'
                        : undefined
                  }
                >
                  Apply costing
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <ActionError message={actionError} />

      <ConfirmDialog
        open={applying}
        onOpenChange={setApplying}
        title="Apply this costing?"
        confirmLabel="Apply costing"
        tone="default"
        description={`${describeScope(costing)} will be quoted at ${formatCurrency(costing.sponsorAmount)} from today. The current version will be superseded.`}
        onConfirm={() => {
          run(() => applyCosting(costing.id), () => {
            setApplying(false);
            router.replace(EVENT_ROUTES.costings);
          });
        }}
      />

      {readOnly && (
        <ReadOnlyNotice message="This version has been superseded and can't be edited." />
      )}

      {costing.codingProblem && <ReadOnlyNotice message={costing.codingProblem} />}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Sponsor is quoted"
          value={formatCurrency(quoted)}
        />

        <StatCard
          label="Expected cost"
          value={formatCurrency(expenseTotal)}
          caption={`${lines.length} head${lines.length === 1 ? '' : 's'}`}
        />

        <StatCard
          label="Temple bears"
          value={formatCurrency(templeShare)}
        />
      </div>

      <Card>
        <CardHeader
          title="Expense lines"
          description={
            costing.incomeAccountName
              ? `Sponsor receipts post to ${costing.incomeAccountName}.`
              : undefined
          }
        />

        <CardBody className="flex flex-col gap-2.5">
          {lines.map((line, index) => (
            <LineEditor
              key={index}
              line={line}
              editable={editable}
              expenseAccounts={expenseAccounts}
              parties={parties}
              onChange={(patch) => patchLine(index, patch)}
              onRemove={() =>
                setLines((current) => current.filter((_, at) => at !== index))
              }
            />
          ))}

          {lines.length === 0 && (
            <p className="py-6 text-center text-sm text-text-muted">
              No lines yet.
            </p>
          )}
        </CardBody>
      </Card>

      {earlier.length > 0 && (
        <Card>
          <CardHeader title="Earlier versions" />

          <CardBody className="flex flex-col gap-1.5">
            {earlier.map((version) => (
              <Link
                key={version.id}
                href={costingHistoryRoute(costing.id)}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-left transition-colors hover:border-input"
              >
                <span className="text-xs text-text-secondary">
                  <span className="font-medium text-text-primary">{versionLabel(version)}</span>
                  <span className="tabular text-text-muted"> · {describePeriod(version)}</span>
                  {version.usedByEvents > 0 && (
                    <span className="text-text-muted">
                      {' '}
                      · {version.usedByEvents} day
                      {version.usedByEvents === 1 ? '' : 's'} quoted
                    </span>
                  )}
                </span>

                <span className="text-sm font-medium tabular text-text-primary">
                  {formatCurrency(version.sponsorAmount)}
                </span>

                <StatusBadge status={costingBadge(version)} />
              </Link>
            ))}
          </CardBody>

          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link href={costingHistoryRoute(costing.id)}>
                <History />
                Version history
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      {notice && editable && (
        <p className="rounded-lg bg-surface-2 px-3.5 py-2.5 text-xs text-text-secondary">
          {notice}
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
    </>
  );
}

function addLine(
  setLines: React.Dispatch<React.SetStateAction<CostingLineDraft[]>>,
  expenseAccounts: readonly AccountOption[],
) {
  setLines((current) => [
    ...current,
    {
      // No default head unless there's only one, so an unchosen default never gets saved.
      accountId: expenseAccounts.length === 1 ? expenseAccounts[0].id : 0,
      partyId: null,
      label: null,
      amount: 0,
      chargedToSponsor: true,
      items: [],
    },
  ]);
}

interface LineEditorProps {
  line: CostingLineDraft;
  editable: boolean;
  expenseAccounts: readonly AccountOption[];
  parties: readonly NamedOption[];
  onChange: (patch: Partial<CostingLineDraft>) => void;
  onRemove: () => void;
}

function LineEditor({
  line,
  editable,
  expenseAccounts,
  parties,
  onChange,
  onRemove,
}: LineEditorProps) {
  const itemised = line.items.length > 0;
  const total = lineTotal(line);

  function patchItem(index: number, patch: Partial<CostingLineDraft['items'][number]>) {
    onChange({
      items: line.items.map((item, at) => (at === index ? { ...item, ...patch } : item)),
    });
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-surface-2 p-3">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[minmax(0,1fr)_11rem_9rem_auto] sm:items-center">
        <Select
          value={line.accountId ? String(line.accountId) : undefined}
          disabled={!editable}
          onValueChange={(value) => onChange({ accountId: Number(value) })}
        >
          <SelectTrigger className="w-full" aria-label="Expense head">
            <SelectValue placeholder="Choose an expense head" />
          </SelectTrigger>

          <SelectContent>
            {expenseAccounts.map((account) => (
              <SelectItem key={account.id} value={String(account.id)}>
                {account.code} · {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={line.partyId === null ? NONE : String(line.partyId)}
          disabled={!editable}
          onValueChange={(value) =>
            onChange({ partyId: value === NONE ? null : Number(value) })
          }
        >
          <SelectTrigger className="w-full" aria-label="Usually paid to">
            <SelectValue placeholder="Ask each time" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value={NONE}>Ask each time</SelectItem>

            {parties.map((party) => (
              <SelectItem key={party.id} value={String(party.id)}>
                {party.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {itemised ? (
          <p
            className="text-right text-sm font-medium tabular text-text-primary"
            aria-label="Line amount, from the items"
          >
            {formatCurrency(total)}
          </p>
        ) : (
          <Input
            type="number"
            min={0}
            step="0.01"
            aria-label="Amount"
            placeholder="Amount"
            className="text-right"
            disabled={!editable}
            value={line.amount || ''}
            onChange={(changeEvent) =>
              onChange({ amount: Number(changeEvent.target.value) || 0 })
            }
          />
        )}

        {editable && (
          <Button
            variant="ghost"
            size="sm"
            aria-label="Remove this line"
            className="text-danger hover:bg-danger-subtle hover:text-danger"
            onClick={onRemove}
          >
            <Trash2 />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-text-secondary">
          <input
            type="checkbox"
            className="size-3.5 accent-[var(--accent)]"
            disabled={!editable}
            checked={line.chargedToSponsor}
            onChange={(changeEvent) =>
              onChange({ chargedToSponsor: changeEvent.target.checked })
            }
          />
          Charged to the sponsor
        </label>

        {editable && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() =>
              onChange({
                items: [...line.items, { label: '', amount: 0 }],
              })
            }
          >
            <Plus />
            Add item
          </Button>
        )}
      </div>

      {itemised && (
        <div className="flex flex-col gap-1.5 border-t border-border pt-2.5">
          {line.items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-[minmax(0,1fr)_8rem_auto] items-center gap-2"
            >
              <Input
                aria-label="Item"
                placeholder="தேங்காய்"
                disabled={!editable}
                value={item.label}
                onChange={(changeEvent) =>
                  patchItem(index, { label: changeEvent.target.value })
                }
              />

              <Input
                type="number"
                min={0}
                step="0.01"
                aria-label="Item amount"
                placeholder="Amount"
                className="text-right"
                disabled={!editable}
                value={item.amount || ''}
                onChange={(changeEvent) =>
                  patchItem(index, { amount: Number(changeEvent.target.value) || 0 })
                }
              />

              {editable && (
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Remove this item"
                  className="text-danger hover:bg-danger-subtle hover:text-danger"
                  onClick={() =>
                    onChange({ items: line.items.filter((_, at) => at !== index) })
                  }
                >
                  <Trash2 />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
