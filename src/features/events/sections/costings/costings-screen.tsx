'use client';

import { useMemo, useState } from 'react';
import { ChevronRight, Coins, MoreHorizontal, Plus } from 'lucide-react';

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useServerAction } from '@/hooks/use-server-action';
import { Link } from '@/i18n/routing';
import { formatCurrency } from '@/lib/format';

import {
  CostingFormDialog,
  type CostingHeaderDraft,
} from '../../components/costing-form-dialog';
import { CopyCostingDialog } from '../../components/copy-costing-dialog';
import {
  applyCosting,
  copyCosting,
  createCosting,
  deleteCosting,
} from '../../lib/costing-actions';
import {
  appliedVersions,
  canDelete,
  costingBadge,
  describePeriod,
  versionLabel,
  describeScope,
  draftOf,
  groupCostings,
  lineTitle,
  type CostingPlan,
} from '../../lib/costing-data';
import { costingHistoryRoute, costingRoute } from '../../lib/routes';
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
  const [open, setOpen] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [copying, setCopying] = useState<CostingRecord | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CostingRecord | null>(null);
  const [pendingApply, setPendingApply] = useState<CostingRecord | null>(null);

  const { run, error: actionError, pending } = useServerAction();

  const groups = useMemo(() => groupCostings(costings), [costings]);

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

      {groups.length === 0 ? (
        <Card>
          <EmptyState
            icon={Coins}
            title="No costings yet"
            description="A pooja-wide costing covers every instance."
          />
        </Card>
      ) : (
        groups.map((group) => (
          <Card key={group.eventTypeId}>
            <CardHeader title={group.eventTypeName} />

            <CardBody className="flex flex-col gap-1.5">
              {group.plans.map((plan) => (
                <PlanRow
                  key={plan.key}
                  plan={plan}
                  isOpen={open === plan.key}
                  canManage={canManage}
                  pending={pending}
                  onToggle={() => setOpen(open === plan.key ? null : plan.key)}
                  onCopy={setCopying}
                  onDelete={setPendingDelete}
                  onApply={setPendingApply}
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
        title={pendingDelete?.isDraft ? 'Discard this draft?' : 'Delete this costing?'}
        confirmLabel={pendingDelete?.isDraft ? 'Discard draft' : 'Delete'}
        description={
          pendingDelete
            ? pendingDelete.isDraft
              ? `The draft for ${describeScope(pendingDelete)} will be discarded. The version in force is not affected.`
              : `The empty costing for ${describeScope(pendingDelete)} will be deleted.`
            : ''
        }
        onConfirm={() => {
          const target = pendingDelete;

          if (!target) return;

          run(() => deleteCosting(target.id), () => setPendingDelete(null));
        }}
      />

      <ConfirmDialog
        open={pendingApply !== null}
        onOpenChange={(next) => !next && setPendingApply(null)}
        title="Apply this costing?"
        confirmLabel="Apply costing"
        tone="default"
        description={
          pendingApply
            ? `${describeScope(pendingApply)} will be quoted at ${formatCurrency(pendingApply.sponsorAmount)} from today. ` +
              'The current version will be superseded.'
            : ''
        }
        onConfirm={() => {
          const target = pendingApply;

          if (!target) return;

          run(() => applyCosting(target.id), () => setPendingApply(null));
        }}
      />
    </>
  );
}

interface PlanRowProps {
  plan: CostingPlan;
  isOpen: boolean;
  canManage: boolean;
  pending: boolean;
  onToggle: () => void;
  onCopy: (costing: CostingRecord) => void;
  onDelete: (costing: CostingRecord) => void;
  onApply: (costing: CostingRecord) => void;
}

function PlanRow({
  plan,
  isOpen,
  canManage,
  pending,
  onToggle,
  onCopy,
  onDelete,
  onApply,
}: PlanRowProps) {
  const draft = draftOf(plan);
  const applied = appliedVersions(plan);
  // By status, not open end date: drafts have an open end date too.
  const current = applied.find((version) => version.isInForce) ?? null;
  const removable = draft ?? (current && canDelete(current) ? current : null);

  const shown = current ?? draft ?? plan.versions[0];

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
            {applied.length === 0
              ? 'Not applied yet'
              : `${applied.length} version${applied.length === 1 ? '' : 's'}`}
            {draft && applied.length > 0 && ' · draft waiting'}
          </p>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium tabular text-text-primary">
            {current ? formatCurrency(current.sponsorAmount) : '—'}
          </span>

          {canManage && (draft || current) && (
            <div className="flex items-center gap-1.5">
              {draft && (
                <Button
                  size="sm"
                  disabled={pending || draft.lines.length === 0}
                  title={
                    draft.lines.length === 0
                      ? 'This draft has no expense lines yet'
                      : undefined
                  }
                  onClick={() => onApply(draft)}
                >
                  Apply
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`More actions for ${plan.scopeLabel}`}
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52">
                  {/* Edit opens the draft when there is one, since saves land there anyway. */}
                  <DropdownMenuItem asChild>
                    <Link href={costingRoute((draft ?? current)!.id)}>
                      {draft ? 'Edit draft' : 'Edit costing'}
                    </Link>
                  </DropdownMenuItem>

                  {applied.length > 0 && (
                    <DropdownMenuItem asChild>
                      <Link href={costingHistoryRoute((current ?? applied[0]).id)}>
                        Version history
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {current && (
                    <DropdownMenuItem onSelect={() => onCopy(current)}>
                      Copy to another instance
                    </DropdownMenuItem>
                  )}

                  {removable && (
                    <>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => onDelete(removable)}
                      >
                        {removable.isDraft ? 'Discard draft' : 'Delete costing'}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-2.5 border-t border-border px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-text-secondary">
              <span className="font-medium text-text-primary">{versionLabel(shown)}</span>
              <span className="tabular text-text-muted"> · {describePeriod(shown)}</span>
            </span>

            <StatusBadge status={costingBadge(shown)} />
          </div>

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
