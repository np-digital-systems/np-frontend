'use client';

import { useServerAction } from '@/hooks/use-server-action';

import {
  createAccount,
  deactivateAccount,
  updateAccount,
} from '../../lib/accounting-actions';

import { useMemo, useState } from 'react';
import { ListTree, Plus, Search, X } from 'lucide-react';

import {
  ActionError,
  Card,
  ConfirmDialog,
  DataCell,
  DataRow,
  DataTable,
  DataTableEmpty,
  EmptyState,
  PortalPageHeader,
  ReadOnlyNotice,
  StatCard,
  type DataColumn,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import {
  AccountFormDialog,
  type AccountDraft,
} from '../../components/account-form-dialog';
import { AccountTypeBadge } from '../../components/account-type-badge';
import { Amount } from '../../components/amount';
import type { AccountingAccess } from '../../lib/accounting-access';
import { ACCOUNT_TYPES, ACCOUNT_TYPE_LABELS } from '../../lib/accounting-data';
import type { AccountRecord, AccountType } from '../../types';

interface ChartOfAccountsScreenProps {
  initialAccounts: readonly AccountRecord[];
  access: AccountingAccess;
  year: number;
}

export function ChartOfAccountsScreen({
  initialAccounts,
  access,
  year,
}: ChartOfAccountsScreenProps) {
  const accounts = initialAccounts;
  const [query, setQuery] = useState('');
  const [type, setType] = useState<AccountType | 'all'>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AccountRecord | null>(null);
  const [deleting, setDeleting] = useState<AccountRecord | null>(null);

  const groups = useMemo(() => accounts.filter((a) => a.parentId === null), [accounts]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return accounts.filter((account) => {
      if (type !== 'all' && account.type !== type) return false;
      if (!needle) return true;

      return `${account.code} ${account.name} ${account.nameTa}`
        .toLowerCase()
        .includes(needle);
    });
  }, [accounts, query, type]);

    const tree = useMemo(() => {
    const matched = new Set(filtered.map((account) => account.id));

    return groups
      .map((group) => ({
        group,
        children: accounts.filter(
          (account) =>
            account.parentId === group.id && matched.has(account.id),
        ),
      }))
      .filter(
        (entry) => entry.children.length > 0 || matched.has(entry.group.id),
      );
  }, [groups, accounts, filtered]);

  const counts = useMemo(
    () => ({
      total: accounts.filter((account) => account.parentId !== null).length,
      income: accounts.filter(
        (account) => account.type === 'income' && account.parentId !== null,
      ).length,
      expense: accounts.filter(
        (account) => account.type === 'expense' && account.parentId !== null,
      ).length,
      inactive: accounts.filter((account) => !account.isActive).length,
    }),
    [accounts],
  );

  const { run, error: actionError } = useServerAction();

  function handleSubmit(draft: AccountDraft) {
    const target = editing;

    run(
      () =>
        target
          ? updateAccount(target.id, {
              nameTa: draft.nameTa,
              nameEn: draft.name,
              parentId: draft.parentId,
              isActive: draft.isActive,
              // The API settles an opening balance once entries post against
              // the head, so an unchanged figure is left out of the request
              // rather than resent and refused.
              openingBalance:
                draft.openingBalance === target.openingBalance
                  ? undefined
                  : draft.openingBalance,
            })
          : createAccount({
              code: draft.code,
              nameTa: draft.nameTa,
              nameEn: draft.name,
              type: draft.type,
              parentId: draft.parentId,
              openingBalance: draft.openingBalance,
            }),
      () => {
        setEditing(null);
        setFormOpen(false);
      },
    );
  }

  const columns: DataColumn[] = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Account' },
    { key: 'type', label: 'Class' },
    { key: 'entries', label: 'Entries', align: 'right' },
    { key: 'balance', label: 'Balance', align: 'right' },
    { key: 'status', label: 'Status' },
    ...(access.canManageAccounts
      ? [{ key: 'actions', label: 'Actions', align: 'right', srOnly: true } as const]
      : []),
  ];

  const isFiltered = query.trim() !== '' || type !== 'all';

  return (
    <>
      <PortalPageHeader
        title="Chart of Accounts"
        description="The ledger heads every receipt and payment posts against, grouped as they are reported."
        meta={[
          <span key="year" className="tabular">
            Financial year {year}
          </span>,
          <span key="count" className="tabular">
            {counts.total} posting accounts
          </span>,
          counts.inactive > 0 ? (
            <span key="inactive" className="tabular">
              {counts.inactive} inactive
            </span>
          ) : null,
        ].filter(Boolean)}
        actions={
          access.canManageAccounts && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus />
              New Account
            </Button>
          )
        }
      />

      <ActionError message={actionError} />

      {!access.canManageAccounts && (
        <ReadOnlyNotice message="You can see the chart of accounts. Adding or changing a ledger head is restricted to administrators and accountants." />
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Posting Accounts"
          value={String(counts.total)}
          caption={`In ${groups.length} groups`}
        />
        <StatCard
          label="Income Heads"
          value={String(counts.income)}
          caption="Money can be received into"
        />
        <StatCard
          label="Expenditure Heads"
          value={String(counts.expense)}
          caption="Money can be paid from"
        />
        <StatCard
          label="Inactive"
          value={String(counts.inactive)}
          caption="Kept for history only"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full sm:w-64">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>

          <InputGroupInput
            type="search"
            value={query}
            placeholder="Search code or account name…"
            aria-label="Search accounts"
            onChange={(changeEvent) => setQuery(changeEvent.target.value)}
          />
        </InputGroup>

        <Select
          value={type}
          onValueChange={(value) => setType(value as AccountType | 'all')}
        >
          <SelectTrigger aria-label="Filter by account class">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All classes</SelectItem>

            {ACCOUNT_TYPES.map((entry) => (
              <SelectItem key={entry} value={entry}>
                {ACCOUNT_TYPE_LABELS[entry]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setType('all');
            }}
          >
            <X />
            Clear
          </Button>
        )}
      </div>

      <Card>
        <DataTable columns={columns} minWidth={880}>
          {tree.length === 0 ? (
            <DataTableEmpty colSpan={columns.length}>
              <EmptyState
                icon={ListTree}
                title="No accounts match these filters"
                description="Adjust the search or class filter above."
              />
            </DataTableEmpty>
          ) : (
            tree.map(({ group, children }) => (
              <GroupBlock
                key={group.id}
                group={group}
                accounts={children}
                colSpan={columns.length}
                access={access}
                onEdit={(account) => {
                  setEditing(account);
                  setFormOpen(true);
                }}
                onDelete={setDeleting}
              />
            ))
          )}
        </DataTable>
      </Card>

      {access.canManageAccounts && (
        <AccountFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          account={editing}
          parents={groups}
          existing={accounts}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this account?"
        description={
          deleting
            ? deleting.entryCount > 0
              ? `${deleting.code} · ${deleting.name} has ${deleting.entryCount} posted entries against it. Accounts with history cannot be deleted — mark it inactive instead.`
              : `${deleting.code} · ${deleting.name} will be removed from the chart of accounts. This cannot be undone.`
            : ''
        }
        confirmLabel={
          deleting && deleting.entryCount > 0 ? 'Mark Inactive' : 'Delete'
        }
        onConfirm={() => {
          if (!deleting) return;

          // History is never destroyed: the API deactivates a head rather than
          // removing it, which is what the confirmation above told the user.
          run(() => deactivateAccount(deleting.id));

          setDeleting(null);
        }}
      />
    </>
  );
}

interface GroupBlockProps {
  group: AccountRecord;
  accounts: readonly AccountRecord[];
  colSpan: number;
  access: AccountingAccess;
  onEdit: (account: AccountRecord) => void;
  onDelete: (account: AccountRecord) => void;
}

function GroupBlock({
  group,
  accounts,
  colSpan,
  access,
  onEdit,
  onDelete,
}: GroupBlockProps) {
  return (
    <>
      <tr className="bg-surface-2">
        <th
          scope="colgroup"
          colSpan={colSpan}
          className="px-4 py-1.5 text-left"
        >
          <span className="ref text-[11px] font-semibold text-text-muted">
            {group.code}
          </span>
          <span className="ml-2 text-[11px] font-semibold tracking-[0.04em] text-text-muted uppercase">
            {group.name}
          </span>
          <span className="ml-2 text-[11px] font-normal text-text-muted tabular">
            {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
          </span>
        </th>
      </tr>

      {accounts.map((account) => (
        <DataRow key={account.id}>
          <DataCell nowrap className="ref text-xs text-text-muted">
            {account.code}
          </DataCell>

          <DataCell>
            <p
              className={cn(
                'truncate text-[13px]',
                account.isActive
                  ? 'text-text-primary'
                  : 'text-text-disabled line-through',
              )}
            >
              {account.name}
            </p>
            {account.nameTa && (
              <p className="mt-0.5 truncate text-xs text-text-muted">
                {account.nameTa}
              </p>
            )}
          </DataCell>

          <DataCell nowrap>
            <AccountTypeBadge type={account.type} />
          </DataCell>

          <DataCell align="right" nowrap className="text-xs tabular">
            {account.entryCount > 0 ? (
              account.entryCount
            ) : (
              <span className="text-text-disabled">—</span>
            )}
          </DataCell>

          <DataCell align="right" nowrap>
            <Amount
              value={account.balance}
              tone={
                account.type === 'income'
                  ? 'in'
                  : account.type === 'expense'
                    ? 'out'
                    : 'neutral'
              }
            />
          </DataCell>

          <DataCell nowrap>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-xs',
                account.isActive ? 'text-success' : 'text-text-muted',
              )}
            >
              <span
                className="size-1.5 rounded-full bg-current"
                aria-hidden
              />
              {account.isActive ? 'Active' : 'Inactive'}
            </span>
          </DataCell>

          {access.canManageAccounts && (
            <DataCell align="right" nowrap>
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(account)}
                >
                  Edit
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger hover:bg-danger-subtle hover:text-danger"
                  onClick={() => onDelete(account)}
                >
                  Delete
                </Button>
              </div>
            </DataCell>
          )}
        </DataRow>
      ))}
    </>
  );
}
