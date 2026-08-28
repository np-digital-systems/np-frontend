'use client';

import { useServerAction } from '@/hooks/use-server-action';

import {
  createBankAccount,
  updateBankAccount,
} from '../../lib/accounting-actions';

import { useMemo, useState } from 'react';
import { Landmark, Plus } from 'lucide-react';

import {
  ActionError,
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
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import {
  BankAccountFormDialog,
  type BankAccountDraft,
} from '../../components/bank-account-form-dialog';
import { ACCOUNTING_ROUTES } from '../../lib/routes';
import type { AccountingAccess } from '../../lib/accounting-access';
import {
  BANK_ACCOUNT_TYPE_LABELS,
  formatCurrency,
  formatLongDate,
} from '../../lib/accounting-data';
import type { BankAccountRecord } from '../../types';

interface BankAccountsScreenProps {
  initialBanks: readonly BankAccountRecord[];
  access: AccountingAccess;
  /** Postable asset heads a new account can post through. */
  ledgerAccounts: readonly { id: number; code: string; name: string }[];
  year: number;
}

export function BankAccountsScreen({
  initialBanks,
  access,
  ledgerAccounts,
  year,
}: BankAccountsScreenProps) {
  const banks = initialBanks;
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BankAccountRecord | null>(null);

  const totals = useMemo(() => {
    const active = banks.filter((bank) => bank.isActive);

    return {
      active: active.length,
      closed: banks.length - active.length,
      balance: active.reduce((sum, bank) => sum + bank.balance, 0),
      deposits: active
        .filter((bank) => bank.type === 'fixed-deposit')
        .reduce((sum, bank) => sum + bank.balance, 0),
    };
  }, [banks]);

  const { run, error: actionError } = useServerAction();

  function handleSubmit(draft: BankAccountDraft) {
    const target = editing;

    if (!target && draft.ledgerAccountId === null) return;

    run(
      () =>
        target
          ? updateBankAccount(target.id, {
              label: draft.label,
              bankName: draft.bankName,
              branch: draft.branch,
              type: draft.type,
              openedOn: draft.openedOn,
              isActive: draft.isActive,
            })
          : createBankAccount({
              label: draft.label,
              bankName: draft.bankName,
              branch: draft.branch,
              accountNumber: draft.accountNumber,
              type: draft.type,
              openingBalance: draft.openingBalance,
              openedOn: draft.openedOn,
              ledgerAccountId: draft.ledgerAccountId!,
            }),
      () => {
        setEditing(null);
        setFormOpen(false);
      },
    );
  }

  return (
    <>
      <PortalPageHeader
        title="Bank Accounts"
        description="Where the temple’s money sits — current, savings and fixed deposit accounts."
        meta={[
          <span key="year" className="tabular">
            Financial year {year}
          </span>,
          <span key="count" className="tabular">
            {totals.active} active
          </span>,
          totals.closed > 0 ? (
            <span key="closed" className="tabular">
              {totals.closed} closed
            </span>
          ) : null,
        ].filter(Boolean)}
        actions={
          access.canManageBankAccounts && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus />
              Add Account
            </Button>
          )
        }
      />

      <ActionError message={actionError} />

      {!access.canManageBankAccounts && (
        <ReadOnlyNotice message="You can see the temple’s bank accounts and their balances. Opening, amending or closing an account is restricted to administrators." />
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Bank Balance"
          value={formatCurrency(totals.balance)}
          caption={`${totals.active} active accounts`}
        />
        <StatCard
          label="Fixed Deposits"
          value={formatCurrency(totals.deposits)}
          caption="Not available for daily use"
        />
        <StatCard
          label="Operating Balance"
          value={formatCurrency(totals.balance - totals.deposits)}
          caption="Current and savings"
        />
        <StatCard
          label="Accounts"
          value={String(banks.length)}
          caption={`${totals.closed} closed`}
        />
      </div>

      {banks.length === 0 ? (
        <Card>
          <EmptyState
            icon={Landmark}
            title="No bank accounts yet"
            description="Add the temple’s accounts so receipts and payments can be routed through them."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {banks.map((bank) => (
            <Card
              key={bank.id}
              className={cn('flex flex-col', !bank.isActive && 'opacity-70')}
            >
              <CardHeader
                title={bank.label}
                description={`${bank.bankName}${bank.branch ? `, ${bank.branch}` : ''}`}
                action={
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[11px] font-medium',
                      bank.isActive
                        ? 'bg-success-subtle text-success'
                        : 'bg-neutral-subtle text-text-muted',
                    )}
                  >
                    {bank.isActive ? 'Active' : 'Closed'}
                  </span>
                }
              />

              <CardBody className="flex flex-1 flex-col gap-4">
                <div>
                  <p className="text-[11px] text-text-muted">Balance</p>
                  <p className="mt-0.5 text-xl font-semibold leading-none tracking-[-0.02em] text-text-primary tabular">
                    {formatCurrency(bank.balance)}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <Field label="Account Number" value={bank.accountNumber} mono />
                  <Field
                    label="Type"
                    value={BANK_ACCOUNT_TYPE_LABELS[bank.type]}
                  />
                  <Field
                    label="Opening Balance"
                    value={formatCurrency(bank.openingBalance)}
                  />
                  <Field label="Opened" value={formatLongDate(bank.openedOn)} />
                </dl>
              </CardBody>

              <CardFooter>
                {access.canViewBankBook && bank.isActive ? (
                  <LinkButton href={ACCOUNTING_ROUTES.bankBook}>
                    View bank book
                  </LinkButton>
                ) : (
                  <span className="text-xs text-text-muted">
                    {bank.isActive ? 'Active account' : 'Closed account'}
                  </span>
                )}

                {access.canManageBankAccounts && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(bank);
                      setFormOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {access.canManageBankAccounts && (
        <BankAccountFormDialog
          ledgerAccounts={ledgerAccounts}
          submitError={actionError}
          open={formOpen}
          onOpenChange={setFormOpen}
          bank={editing}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-text-muted">{label}</dt>
      <dd
        className={cn(
          'mt-0.5 truncate text-xs text-text-secondary',
          mono && 'ref',
        )}
      >
        {value}
      </dd>
    </div>
  );
}
