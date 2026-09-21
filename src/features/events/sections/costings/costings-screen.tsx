'use client';

import { useMemo, useState } from 'react';
import { ChevronRight, Coins, Plus } from 'lucide-react';

import {
  ActionError,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  PortalPageHeader,
  StatusBadge,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useServerAction } from '@/hooks/use-server-action';
import { Link } from '@/i18n/routing';
import { formatCurrency } from '@/lib/format';

import {
  CostingFormDialog,
  type CostingHeaderDraft,
} from '../../components/costing-form-dialog';
import { CopyCostingDialog } from '../../components/copy-costing-dialog';
import { copyCosting, createCosting, deleteCosting } from '../../lib/costing-actions';
import {
  costingBadge,
  describePeriod,
  groupCostings,
  lineTitle,
  todayISO,
  versionOn,
  type CostingPlan,
} from '../../lib/costing-data';
import { costingRoute } from '../../lib/routes';
import type { CostingRecord } from '../../types/costing';
import type { EventTypeRecord } from '../../types';

interface CostingsScreenProps {
  costings: readonly CostingRecord[];
  eventTypes: readonly EventTypeRecord[];
  canManage: boolean;
}

export function CostingsScreen({
  costings,
  eventTypes,
  canManage,
}: CostingsScreenProps) {
  const [asAt, setAsAt] = useState(todayISO);
  const [open, setOpen] = useState<string | null>(null);
  const [showing, setShowing] = useState<Record<string, number>>({});
  const [formOpen, setFormOpen] = useState(false);
  const [copying, setCopying] = useState<CostingRecord | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CostingRecord | null>(null);

  const { run, error: actionError, pending } = useServerAction();

  const groups = useMemo(() => groupCostings(costings), [costings]);

  const planCount = groups.reduce((total, group) => total + group.plans.length, 0);
  const revisions = costings.length - planCount;

  function handleCreate(draft: CostingHeaderDraft) {
    run(
      () => createCosting({ eventTypeId: draft.eventTypeId, slotId: draft.slotId }),
      () => setFormOpen(false),
    );
  }

  return (
    <>
      <PortalPageHeader
        title="Pooja Costings"
        description="What each pooja is expected to cost, and what its sponsor is asked for. A saved costing applies until you change it; changing one keeps the old figures as an earlier version."
        meta={[
          <span key="plans" className="tabular">
            {planCount} plan{planCount === 1 ? '' : 's'}
          </span>,
          <span key="revisions" className="tabular">
            {revisions} earlier version{revisions === 1 ? '' : 's'}
          </span>,
        ]}
        actions={
          canManage ? (
            <Button onClick={() => setFormOpen(true)}>
              <Plus />
              New Costing
            </Button>
          ) : undefined
        }
      />

      <ActionError message={actionError} />

      {/*
        * The whole screen reads as of one date.
        *
        * "What were we paying in 2024" is the question the versions exist to
        * answer, and answering it by expanding six plans and comparing their
        * periods is work the reader should not be doing. Set the date and every
        * plan below shows the version that was in force then.
        */}
      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.04em] text-text-muted uppercase">
              Showing the rates in force on
            </p>

            <p className="text-xs text-text-secondary">
              {asAt === todayISO()
                ? 'Today. Change the date to read an earlier year.'
                : 'An earlier date. Every plan below shows what it was then.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              aria-label="Show the rates in force on"
              className="w-44"
              value={asAt}
              onChange={(changeEvent) => setAsAt(changeEvent.target.value)}
            />

            {asAt !== todayISO() && (
              <Button variant="ghost" size="sm" onClick={() => setAsAt(todayISO())}>
                Today
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {groups.length === 0 ? (
        <Card>
          <EmptyState
            icon={Coins}
            title="No costings yet"
            description="Write one costing for a pooja type and every instance of it is covered. Add a costing for a single instance only where the money is actually different."
          />
        </Card>
      ) : (
        groups.map((group) => (
          <Card key={group.eventTypeId}>
            <CardHeader
              title={group.eventTypeName}
              description={`${group.plans.length} plan${group.plans.length === 1 ? '' : 's'} — the one written for an instance beats the one written for the whole pooja`}
            />

            <CardBody className="flex flex-col gap-1.5">
              {group.plans.map((plan) => (
                <PlanRow
                  key={plan.key}
                  plan={plan}
                  asAt={asAt}
                  isOpen={open === plan.key}
                  showingId={showing[plan.key]}
                  canManage={canManage}
                  pending={pending}
                  onToggle={() => setOpen(open === plan.key ? null : plan.key)}
                  onShow={(costingId) =>
                    setShowing((current) => ({ ...current, [plan.key]: costingId }))
                  }
                  onCopy={setCopying}
                  onDelete={setPendingDelete}
                />
              ))}
            </CardBody>
          </Card>
        ))
      )}

      <CostingFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        eventTypes={eventTypes}
        onSubmit={handleCreate}
      />

      <CopyCostingDialog
        open={copying !== null}
        onOpenChange={(next) => !next && setCopying(null)}
        costing={copying}
        onSubmit={(input) => {
          const source = copying;

          if (!source) return;

          run(() => copyCosting(source.id, input), () => setCopying(null));
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(next) => !next && setPendingDelete(null)}
        title="Delete this costing?"
        description={
          pendingDelete
            ? `The costing for ${pendingDelete.eventTypeName}${pendingDelete.slotLabel ? ` — ${pendingDelete.slotLabel}` : ''} will be removed. Only a version nothing was quoted from can be deleted.`
            : ''
        }
        onConfirm={() => {
          const target = pendingDelete;

          if (!target) return;

          run(() => deleteCosting(target.id), () => setPendingDelete(null));
        }}
      />
    </>
  );
}

interface PlanRowProps {
  plan: CostingPlan;
  asAt: string;
  isOpen: boolean;
  /** Which version the reader clicked, if any. */
  showingId: number | undefined;
  canManage: boolean;
  pending: boolean;
  onToggle: () => void;
  onShow: (costingId: number) => void;
  onCopy: (costing: CostingRecord) => void;
  onDelete: (costing: CostingRecord) => void;
}

/**
 * One plan, with its versions and their lines folded underneath.
 *
 * Opening it is reading, never editing. Finding what the kurukkal was paid in
 * 2026 should not feel like the same gesture as changing it, so the figures
 * open in place and Edit stays a page of its own.
 */
function PlanRow({
  plan,
  asAt,
  isOpen,
  showingId,
  canManage,
  pending,
  onToggle,
  onShow,
  onCopy,
  onDelete,
}: PlanRowProps) {
  const atDate = versionOn(plan, asAt);
  const current = plan.versions.find((version) => version.effectiveTo === null) ?? null;

  // What the reader asked to see, else what applied on the chosen date, else
  // the newest thing there is — a plan written after that date still has to
  // show something rather than an empty row.
  const shown =
    plan.versions.find((version) => version.id === showingId) ??
    atDate ??
    plan.versions[0];

  return (
    <div className="rounded-lg border border-border bg-surface-2">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2.5">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={`${isOpen ? 'Hide' : 'Show'} versions of ${plan.scopeLabel}`}
          className="flex items-center gap-2 text-left"
          onClick={onToggle}
        >
          <ChevronRight
            className={`size-4 shrink-0 text-text-muted transition-transform ${isOpen ? 'rotate-90' : ''}`}
            aria-hidden
          />
        </button>

        <button type="button" className="min-w-0 text-left" onClick={onToggle}>
          <p className="truncate text-sm font-medium text-text-primary">
            {plan.scopeLabel}
          </p>

          <p className="text-xs text-text-muted">
            {plan.versions.length} version{plan.versions.length === 1 ? '' : 's'}
            {atDate === null && ' · none in force on that date'}
          </p>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium tabular text-text-primary">
            {atDate ? formatCurrency(atDate.sponsorAmount) : '—'}
          </span>

          {canManage && current && (
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" asChild>
                <Link href={costingRoute(current.id)}>Edit</Link>
              </Button>

              <Button variant="outline" size="sm" onClick={() => onCopy(current)}>
                Copy
              </Button>

              {current.usedByEvents === 0 && plan.versions.length === 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  className="text-danger hover:bg-danger-subtle hover:text-danger"
                  onClick={() => onDelete(current)}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-2.5 border-t border-border px-3 py-3">
          {plan.versions.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {plan.versions.map((version) => (
                <button
                  key={version.id}
                  type="button"
                  className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                    version.id === shown.id
                      ? 'border-accent text-text-primary'
                      : 'border-border text-text-secondary hover:border-input'
                  }`}
                  onClick={() => onShow(version.id)}
                >
                  <span className="tabular">{describePeriod(version)}</span>
                  <span className="tabular font-medium">
                    {formatCurrency(version.sponsorAmount)}
                  </span>
                  <StatusBadge status={costingBadge(version)} />
                </button>
              ))}
            </div>
          )}

          {shown.lines.length === 0 ? (
            <p className="py-3 text-center text-xs text-text-muted">
              This version has no lines yet.
            </p>
          ) : (
            <div className="flex flex-col">
              {shown.lines.map((line) => (
                <div
                  key={line.id}
                  className="grid grid-cols-[1fr_auto] items-baseline gap-3 border-b border-border py-1.5 last:border-b-0"
                >
                  <span className="min-w-0 truncate text-xs text-text-secondary">
                    <span className="tabular">{line.account.code}</span> ·{' '}
                    {lineTitle(line)}
                    {line.partyName && (
                      <span className="text-text-muted"> · {line.partyName}</span>
                    )}
                    {!line.chargedToSponsor && (
                      <span className="text-text-muted"> · temple bears</span>
                    )}
                  </span>

                  <span className="text-xs tabular text-text-primary">
                    {formatCurrency(line.amount)}
                  </span>
                </div>
              ))}

              <div className="mt-1.5 grid grid-cols-[1fr_auto] items-baseline gap-3 border-t border-border pt-2">
                <span className="text-xs font-semibold text-text-secondary">
                  Sponsor is quoted
                </span>

                <span className="text-sm font-semibold tabular text-text-primary">
                  {formatCurrency(shown.sponsorAmount)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
