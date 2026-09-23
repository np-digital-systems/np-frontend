'use client';

import { useState } from 'react';
import { ArrowLeft, Pencil } from 'lucide-react';

import {
  Card,
  CardBody,
  CardHeader,
  PortalPageHeader,
  StatusBadge,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { formatCurrency } from '@/lib/format';

import {
  costingBadge,
  describePeriod,
  describeScope,
  describeScopeReach,
  lineTitle,
  versionLabel,
} from '../../lib/costing-data';
import { costingRoute } from '../../lib/routes';
import type { CostingRecord } from '../../types/costing';

interface VersionHistoryScreenProps {
  costing: CostingRecord;
  versions: readonly CostingRecord[];
  canManage: boolean;
}


/**
 * Every version this plan has had, read one at a time and in full.
 *
 * A page rather than a dialog, because a festival costing runs to dozens of
 * itemised lines and a panel that scrolls to show one of them is no use for
 * answering the question people actually bring here — what did this cost
 * before, and what changed. The version being read is chosen on the left and
 * shown whole on the right; nothing here can be edited, which is what lets the
 * lines be laid out for reading rather than for typing into.
 */
export function VersionHistoryScreen({
  costing,
  versions,
  canManage,
}: VersionHistoryScreenProps) {
  const [showingId, setShowingId] = useState(() => versions[0]?.id ?? costing.id);

  const shown = versions.find((version) => version.id === showingId) ?? versions[0] ?? costing;

  const borne = shown.lines
    .filter((line) => !line.chargedToSponsor)
    .reduce((total, line) => total + line.amount, 0);

  return (
    <>
      <Button variant="ghost" size="sm" className="self-start" asChild>
        <Link href={costingRoute(costing.id)}>
          <ArrowLeft />
          Back to the costing
        </Link>
      </Button>

      <PortalPageHeader
        title={describeScope(costing)}
        description="Every version this plan has had. The days quoted at an older rate still read it."
        meta={[describeScopeReach(costing), `${versions.length} version${versions.length === 1 ? '' : 's'}`]}
        actions={
          canManage ? (
            <Button variant="outline" asChild>
              <Link href={costingRoute(costing.id)}>
                <Pencil />
                Edit the current one
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:items-start">
        {/*
          * The versions themselves, newest first. Kept as a column rather than
          * a row of chips so a plan revised a dozen times over ten years still
          * reads as a list somebody can run an eye down.
          */}
        <Card>
          <CardHeader title="Versions" />

          <CardBody className="flex flex-col gap-1.5">
            {versions.map((version) => (
              <button
                key={version.id}
                type="button"
                aria-current={version.id === shown.id}
                onClick={() => setShowingId(version.id)}
                className={`flex flex-col gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  version.id === shown.id
                    ? 'border-accent bg-surface-2'
                    : 'border-border bg-surface-2 hover:border-input'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-text-primary">
                    {versionLabel(version)}
                  </span>

                  <StatusBadge status={costingBadge(version)} />
                </span>

                <span className="text-xs tabular text-text-muted">
                  {describePeriod(version)}
                </span>

                <span className="text-sm font-medium tabular text-text-primary">
                  {formatCurrency(version.sponsorAmount)}
                </span>
              </button>
            ))}
          </CardBody>
        </Card>

        <div className="flex flex-col gap-4">
          {/*
            * A statement, not a grid.
            *
            * The reader's question is what this cost and what made it up, which
            * is the shape a balance sheet already has: heads down the left,
            * money down the right, the detail indented beneath the line it
            * belongs to. A column saying who bore each line spent a quarter of
            * the width repeating "Sponsor" — the temple bearing one is the
            * exception, so only the exception is marked.
            */}
          <Card>
            <CardHeader
              title={versionLabel(shown)}
              description={
                shown.usedByEvents > 0
                  ? `${shown.usedByEvents} day${shown.usedByEvents === 1 ? '' : 's'} were quoted at this version · ${describePeriod(shown)}`
                  : `No day was quoted at this version · ${describePeriod(shown)}`
              }
            />

            <CardBody className="flex flex-col">
              {shown.lines.length === 0 ? (
                <p className="py-6 text-center text-sm text-text-muted">
                  This version has no expense lines.
                </p>
              ) : (
                shown.lines.map((line) => (
                  <div key={line.id} className="border-b border-border py-2.5 first:pt-0">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-sm text-text-primary">
                        {lineTitle(line)}

                        {/* Only the exception is worth saying out loud. */}
                        {!line.chargedToSponsor && (
                          <span className="ml-2 text-xs text-text-muted">
                            the temple bore this
                          </span>
                        )}

                        {/*
                          * The code and its romanisation, for the books. Left
                          * off where the head carries a label of its own, since
                          * then the name above is not the account's name.
                          */}
                        <span className="block text-xs text-text-muted">
                          {line.account.code} · {line.account.name}
                        </span>
                      </span>

                      <span className="shrink-0 text-sm font-medium tabular text-text-primary">
                        {formatCurrency(line.amount)}
                      </span>
                    </div>

                    {/* Ten coconuts at 120: indented under the head it makes up. */}
                    {line.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-baseline justify-between gap-4 pl-5 pt-1"
                      >
                        <span className="text-xs text-text-secondary">{item.label}</span>

                        <span className="shrink-0 text-xs tabular text-text-secondary">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ))
              )}

              {/*
                * Shown only where the temple bears something, which is what
                * makes the two figures differ and the line worth reading.
                */}
              {borne > 0 && (
                <div className="flex items-baseline justify-between gap-4 pt-3">
                  <span className="text-sm text-text-secondary">
                    கோவில் ஏற்றது
                    <span className="ml-2 text-xs text-text-muted">the temple bore</span>
                  </span>

                  <span className="text-sm tabular text-text-secondary">
                    {formatCurrency(borne)}
                  </span>
                </div>
              )}

              <div className="mt-2.5 flex items-baseline justify-between gap-4 border-t border-border pt-2.5">
                <span className="text-sm font-semibold text-text-primary">
                  உபயகாரர் தொகை
                  <span className="ml-2 text-xs font-normal text-text-muted">
                    sponsor was quoted
                  </span>
                </span>

                <span className="text-base font-semibold tabular text-text-primary">
                  {formatCurrency(shown.sponsorAmount)}
                </span>
              </div>

            </CardBody>
          </Card>

          {shown.notes && (
            <Card>
              <CardHeader title="Notes" />

              <CardBody>
                <p className="text-sm text-text-secondary">{shown.notes}</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
