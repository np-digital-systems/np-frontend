'use client';

import { useMemo, useState } from 'react';
import { Plus, Wallet } from 'lucide-react';

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  EmptyState,
  LinkButton,
  PortalPageHeader,
  ReadOnlyNotice,
  StatCard,
} from '@/components/portal/ui';
import { ACCOUNTING_ROUTES } from '@/features/accounting/lib/routes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import {
  FundFormDialog,
  type FundDraft,
} from '../../components/fund-form-dialog';
import { UtilisationBar } from '../../components/utilisation-bar';
import type { FinanceAccess } from '../../lib/finance-access';
import { formatCurrency } from '../../lib/finance-data';
import { FINANCE_ROUTES } from '../../lib/routes';
import type { FundDetail, FundRecord } from '../../types';

interface FundsScreenProps {
  initialDetails: readonly FundDetail[];
  access: FinanceAccess;
  year: number;
}

/** TODO: replace the local mutations with calls to the funds API. */
export function FundsScreen({
  initialDetails,
  access,
  year,
}: FundsScreenProps) {
  const [details, setDetails] =
    useState<readonly FundDetail[]>(initialDetails);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FundRecord | null>(null);

  const funds = useMemo(
    () => details.map((detail) => detail.fund),
    [details],
  );

  const totals = useMemo(
    () => ({
      balance: funds.reduce((sum, fund) => sum + fund.balance, 0),
      income: funds.reduce((sum, fund) => sum + fund.income, 0),
      expenses: funds.reduce((sum, fund) => sum + fund.expenses, 0),
      committed: funds.reduce((sum, fund) => sum + fund.committed, 0),
      stretched: funds.filter((fund) => fund.utilisation >= 0.85).length,
    }),
    [funds],
  );

  function handleSubmit(draft: FundDraft) {
    setDetails((current) => {
      if (editing) {
        return current.map((detail) =>
          detail.fund.id === editing.id
            ? {
                ...detail,
                fund: {
                  ...detail.fund,
                  ...draft,
                  // The balance and utilisation follow from the opening
                  // figure, so they are recomputed rather than carried over.
                  balance: draft.opening + detail.fund.income - detail.fund.expenses,
                  utilisation:
                    draft.opening + detail.fund.income === 0
                      ? 0
                      : detail.fund.expenses /
                        (draft.opening + detail.fund.income),
                },
              }
            : detail,
        );
      }

      const nextId =
        current.reduce(
          (highest, detail) => Math.max(highest, detail.fund.id),
          0,
        ) + 1;

      return [
        ...current,
        {
          fund: {
            id: nextId,
            ...draft,
            income: 0,
            expenses: 0,
            balance: draft.opening,
            utilisation: 0,
            projectCount: 0,
            committed: 0,
            entryCount: 0,
          },
          income: [],
          expenses: [],
          recent: [],
        },
      ];
    });
  }

  return (
    <>
      <PortalPageHeader
        title="Funds"
        description="The temple’s earmarked pools of money — what each took in, what it paid out and what remains."
        meta={[
          <span key="year" className="tabular">
            Financial year {year}
          </span>,
          <span key="count" className="tabular">
            {funds.length} funds
          </span>,
          totals.stretched > 0 ? (
            <span key="stretched" className="text-warning tabular">
              {totals.stretched} above 85% utilised
            </span>
          ) : null,
        ].filter(Boolean)}
        actions={
          access.canManageFunds && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus />
              New Fund
            </Button>
          )
        }
      />

      {!access.canManageFunds && (
        <ReadOnlyNotice message="You can see every fund’s position and what has been charged to it. Creating or amending a fund is restricted to administrators and accountants." />
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Fund Balance"
          value={formatCurrency(totals.balance)}
          caption={`Across ${funds.length} funds`}
        />
        <StatCard
          label="Received"
          value={formatCurrency(totals.income)}
          caption={`FY ${year}`}
        />
        <StatCard
          label="Spent"
          value={formatCurrency(totals.expenses)}
          caption={`FY ${year}`}
        />
        <StatCard
          label="Committed to Projects"
          value={formatCurrency(totals.committed)}
          caption="Budgeted, spent or not"
        />
      </div>

      {details.length === 0 ? (
        <Card>
          <EmptyState
            icon={Wallet}
            title="No funds yet"
            description="Create the temple’s funds so receipts and payments can be charged to them."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {details.map((detail) => (
            <FundCard
              key={detail.fund.id}
              detail={detail}
              access={access}
              onEdit={() => {
                setEditing(detail.fund);
                setFormOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {access.canManageFunds && (
        <FundFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          fund={editing}
          existing={funds}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}

interface FundCardProps {
  detail: FundDetail;
  access: FinanceAccess;
  onEdit: () => void;
}

function FundCard({ detail, access, onEdit }: FundCardProps) {
  const { fund } = detail;
  const available = fund.opening + fund.income;

  return (
    <Card className={cn('flex flex-col', !fund.isActive && 'opacity-70')}>
      <CardHeader
        title={fund.name}
        description={fund.nameTa}
        action={
          access.canManageFunds && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )
        }
      />

      <CardBody className="flex flex-1 flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] text-text-muted">Balance</p>
            <p className="mt-1 text-2xl font-semibold leading-none tracking-[-0.02em] text-text-primary tabular">
              {formatCurrency(fund.balance)}
            </p>
          </div>

          {!fund.isActive && (
            <span className="rounded-full bg-neutral-subtle px-2 py-0.5 text-[11px] font-medium text-text-muted">
              Inactive
            </span>
          )}
        </div>

        <dl className="grid grid-cols-3 gap-x-4">
          <Figure label="Opening" value={fund.opening} tone="muted" />
          <Figure label="Received" value={fund.income} tone="in" />
          <Figure label="Spent" value={fund.expenses} tone="out" />
        </dl>

        <div>
          <UtilisationBar
            value={fund.utilisation}
            label={`${fund.name} utilisation`}
          />
          <p className="mt-1.5 text-[11px] text-text-muted tabular">
            {Math.round(fund.utilisation * 100)}% of{' '}
            {formatCurrency(available)} available has been spent
          </p>
        </div>

        {(detail.income.length > 0 || detail.expenses.length > 0) && (
          <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <Breakdown
              title="Received from"
              lines={detail.income}
              tone="in"
            />
            <Breakdown title="Spent on" lines={detail.expenses} tone="out" />
          </div>
        )}
      </CardBody>

      <CardFooter>
        <span className="text-xs text-text-muted tabular">
          {fund.entryCount} {fund.entryCount === 1 ? 'voucher' : 'vouchers'} ·{' '}
          {fund.projectCount}{' '}
          {fund.projectCount === 1 ? 'project' : 'projects'}
        </span>

        {access.canViewLedger ? (
          <LinkButton href={ACCOUNTING_ROUTES.transactions}>
            View ledger
          </LinkButton>
        ) : (
          <LinkButton href={FINANCE_ROUTES.projects}>View projects</LinkButton>
        )}
      </CardFooter>
    </Card>
  );
}

function Figure({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'in' | 'out' | 'muted';
}) {
  const TONES = {
    in: 'text-success',
    out: 'text-danger',
    muted: 'text-text-secondary',
  } as const;

  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-text-muted">{label}</dt>
      <dd
        className={cn(
          'mt-0.5 truncate text-[13px] font-semibold tabular',
          TONES[tone],
        )}
      >
        {formatCurrency(value)}
      </dd>
    </div>
  );
}

function Breakdown({
  title,
  lines,
  tone,
}: {
  title: string;
  lines: FundDetail['income'];
  tone: 'in' | 'out';
}) {
  if (lines.length === 0) {
    return (
      <div>
        <p className="text-[11px] font-semibold tracking-[0.04em] text-text-muted uppercase">
          {title}
        </p>
        <p className="mt-2 text-xs text-text-disabled">Nothing yet</p>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold tracking-[0.04em] text-text-muted uppercase">
        {title}
      </p>

      <ul className="mt-2 space-y-1.5">
        {lines.slice(0, 4).map((line) => (
          <li key={line.accountId}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 truncate text-xs text-text-secondary">
                {line.accountName}
              </span>
              <span
                className={cn(
                  'shrink-0 text-xs font-medium tabular',
                  tone === 'in' ? 'text-success' : 'text-danger',
                )}
              >
                {formatCurrency(line.amount)}
              </span>
            </div>
          </li>
        ))}

        {lines.length > 4 && (
          <li className="text-[11px] text-text-muted tabular">
            +{lines.length - 4} more
          </li>
        )}
      </ul>
    </div>
  );
}
