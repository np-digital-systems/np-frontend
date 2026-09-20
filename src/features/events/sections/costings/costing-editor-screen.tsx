'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

import {
  ActionError,
  Card,
  CardBody,
  CardHeader,
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
import { Link } from '@/i18n/routing';
import { formatCurrency } from '@/lib/format';
import { validate } from '@/lib/validation';

import { updateCosting } from '../../lib/costing-actions';
import {
  costingBadge,
  describePeriod,
  describeScope,
  describeScopeReach,
  isReadOnly,
  revisionNotice,
} from '../../lib/costing-data';
import { costingLinesSchema } from '../../lib/costing-schemas';
import { costingRoute, EVENT_ROUTES } from '../../lib/routes';
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

/** An item's amount follows from its quantity; a heading with items is their sum. */
function lineTotal(line: CostingLineDraft): number {
  if (line.items.length === 0) return line.amount;

  return round2(
    line.items.reduce((total, item) => total + item.quantity * item.unitAmount, 0),
  );
}

function draftFrom(costing: CostingRecord): CostingLineDraft[] {
  return costing.lines.map((line) => ({
    accountId: line.accountId,
    partyId: line.partyId,
    label: line.label,
    amount: line.amount,
    chargedToSponsor: line.chargedToSponsor,
    items: line.items.map((item) => ({
      label: item.label,
      quantity: item.quantity,
      unitAmount: item.unitAmount,
    })),
  }));
}

interface CostingEditorScreenProps {
  costing: CostingRecord;
  expenseAccounts: readonly AccountOption[];
  parties: readonly NamedOption[];
  /** Every version this pooja and instance has had, newest first. */
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

  const readOnly = isReadOnly(costing);
  const editable = canManage && !readOnly;
  const notice = revisionNotice(costing, new Date().toISOString().slice(0, 10));

  /*
   * Everything below is added up here, live, from the same lines the server
   * will add up when it saves. Nothing about the money is typed twice.
   */
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

  function handleSave() {
    const result = validate(costingLinesSchema, lines);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError(null);
    run(() => updateCosting(costing.id, { lines: result.data as CostingLineDraft[] }));
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
              {describeScopeReach(costing)} · {describePeriod(costing)}
            </p>
          </div>

          {editable && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => addLine(setLines, expenseAccounts)}>
                <Plus />
                Add line
              </Button>

              <Button onClick={handleSave} disabled={pending}>
                Save
              </Button>
            </div>
          )}
        </div>
      </div>

      <ActionError message={actionError} />

      {readOnly && (
        <ReadOnlyNotice message="This version was replaced by a later one. It is kept as it stands, because it is the answer to what this pooja cost that year." />
      )}

      {/*
        * The coding is not asked for anywhere on this screen — it belongs to the
        * pooja type's activity. Where the temple has not set it yet, saying so
        * here is more use than letting the receipt fail later.
        */}
      {costing.codingProblem && <ReadOnlyNotice message={costing.codingProblem} />}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Sponsor is quoted"
          value={formatCurrency(quoted)}
          caption="The lines charged to them, added up"
        />

        <StatCard
          label="Expected cost"
          value={formatCurrency(expenseTotal)}
          caption={`${lines.length} head${lines.length === 1 ? '' : 's'}`}
        />

        <StatCard
          label="Temple bears"
          value={formatCurrency(templeShare)}
          caption="The lines not charged to the sponsor"
        />
      </div>

      <Card>
        <CardHeader
          title="Expense lines"
          description={
            costing.incomeAccountName
              ? `The sponsor’s receipt lands on ${costing.incomeAccountName}, from this pooja’s activity.`
              : 'A line with items under it is a heading: the items decide its figure.'
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
              No lines yet. Press <strong>Add line</strong> to write the first one.
            </p>
          )}
        </CardBody>
      </Card>

      {/*
        * What this pooja cost in earlier years.
        *
        * Only shown once there is a second version, because a costing written
        * this week has no history to read and an empty card saying so is noise.
        */}
      {history.length > 1 && (
        <Card>
          <CardHeader
            title="Earlier versions"
            description="Each revision is kept. The days quoted at an older rate still read it."
          />

          <CardBody className="flex flex-col gap-1.5">
            {history.map((version) => (
              <Link
                key={version.id}
                href={costingRoute(version.id)}
                className={`grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:border-input ${
                  version.id === costing.id
                    ? 'border-accent bg-surface-2'
                    : 'border-border bg-surface-2'
                }`}
              >
                <span className="text-xs tabular text-text-secondary">
                  {describePeriod(version)}
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
      // Nothing is pre-picked. The first head in the list is a grouping head
      // as often as not, and a default nobody chose is the one that gets saved.
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

/**
 * One line: a head, a figure, and who is usually paid.
 *
 * Three questions, not six. The fund and the activity used to sit here and were
 * the same answer on every line of every costing the temple will ever write —
 * they come from the pooja type now, and nobody is asked again.
 */
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

        {/*
          * Read-only once there are items, because then the items are the
          * figure. Two ways to set one number is how the two stop agreeing.
          */}
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
                items: [...line.items, { label: '', quantity: 1, unitAmount: 0 }],
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
              className="grid grid-cols-[minmax(0,1fr)_4.5rem_6rem_6rem_auto] items-center gap-2"
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
                step="0.001"
                aria-label="Quantity"
                placeholder="Qty"
                className="text-right"
                disabled={!editable}
                value={item.quantity || ''}
                onChange={(changeEvent) =>
                  patchItem(index, { quantity: Number(changeEvent.target.value) || 0 })
                }
              />

              <Input
                type="number"
                min={0}
                step="0.01"
                aria-label="Price each"
                placeholder="Each"
                className="text-right"
                disabled={!editable}
                value={item.unitAmount || ''}
                onChange={(changeEvent) =>
                  patchItem(index, { unitAmount: Number(changeEvent.target.value) || 0 })
                }
              />

              {/* Quantity times price. There is nothing here to type. */}
              <span className="text-right text-sm tabular text-text-secondary">
                {formatCurrency(round2(item.quantity * item.unitAmount))}
              </span>

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
