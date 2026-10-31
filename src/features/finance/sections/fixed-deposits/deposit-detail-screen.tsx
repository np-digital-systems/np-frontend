import { Receipt } from 'lucide-react';

import {
  Card,
  CardBody,
  CardHeader,
  DataCell,
  DataRow,
  DataTable,
  DataTableEmpty,
  EmptyState,
  LinkButton,
  PortalPageHeader,
  StatCard,
  StatusBadge,
  type DataColumn,
} from '@/components/portal/ui';
import { ACCOUNTING_ROUTES } from '@/features/accounting/lib/routes';
import { Link } from '@/i18n/routing';

import { DepositStatusBadge } from '../../components/finance-badges';
import {
  INTEREST_PAYOUT_LABELS,
  formatCurrency,
  formatLongDate,
  formatShortDate,
} from '../../lib/finance-data';
import { FINANCE_ROUTES } from '../../lib/routes';
import type {
  DepositInterest,
  DepositRecord,
  DepositSource,
  DepositVoucher,
  DepositVoucherRole,
} from '../../types';

const SOURCE_LABELS: Record<DepositSource, string> = {
  bank: 'Kovil money',
  endowment: 'Sponsor placed it',
  renewal: 'Renewal',
  opening: 'Held before go-live',
};

const ROLE_LABELS: Record<DepositVoucherRole, string> = {
  placement: 'Placement',
  interest: 'Interest',
  renewal: 'Renewal',
  closure: 'Closure',
  other: 'Other',
};

const VOUCHER_ROUTES: Record<DepositVoucher['kind'], string> = {
  receipt: ACCOUNTING_ROUTES.receipts,
  payment: ACCOUNTING_ROUTES.payments,
  contra: ACCOUNTING_ROUTES.contras,
  journal: ACCOUNTING_ROUTES.journals,
};

interface DepositDetailScreenProps {
  deposit: DepositRecord;
  vouchers: readonly DepositVoucher[];
  interest: DepositInterest;
}

export function DepositDetailScreen({ deposit, vouchers, interest }: DepositDetailScreenProps) {
  const isChain = interest.certificates.length > 1;

  const details = [
    { label: 'Bank', value: deposit.branch ? `${deposit.bankName} · ${deposit.branch}` : deposit.bankName },
    { label: 'Purpose', value: deposit.poojaName ?? 'General' },
    { label: 'Fund', value: deposit.fundName },
    { label: 'Money from', value: SOURCE_LABELS[deposit.source] },
    { label: 'Placed on', value: formatLongDate(deposit.placedOn) },
    { label: 'Matures on', value: formatLongDate(deposit.maturesOn) },
    { label: 'Tenure', value: `${deposit.tenureMonths} months` },
    { label: 'Interest payout', value: INTEREST_PAYOUT_LABELS[deposit.interestPayout] },
    { label: 'On the books', value: formatCurrency(deposit.bookBalance) },
    ...(deposit.notes ? [{ label: 'Notes', value: deposit.notes }] : []),
  ];

  const columns: DataColumn[] = [
    { key: 'date', label: 'Date' },
    { key: 'voucher', label: 'Voucher' },
    { key: 'type', label: 'Type' },
    ...(isChain ? [{ key: 'certificate', label: 'Certificate' }] : []),
    { key: 'description', label: 'Description' },
    { key: 'amount', label: 'Amount', align: 'right' } as const,
    { key: 'status', label: 'Status' },
  ];

  return (
    <>
      <PortalPageHeader
        title={deposit.name ?? deposit.certificateNo}
        description={`${deposit.certificateNo} · ${deposit.poojaName ?? 'General'}`}
        meta={[
          <DepositStatusBadge key="status" status={deposit.status} />,
          deposit.bookDifference !== 0 ? (
            <span key="books" className="text-warning tabular">
              Books differ by {formatCurrency(Math.abs(deposit.bookDifference))}
            </span>
          ) : null,
        ].filter(Boolean)}
        actions={<LinkButton href={FINANCE_ROUTES.fixedDeposits}>All deposits</LinkButton>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Principal" value={formatCurrency(deposit.principal)} />
        <StatCard label="Interest Rate" value={`${deposit.interestRate.toFixed(2)}%`} />
        <StatCard
          label="Interest Received"
          value={formatCurrency(interest.total)}
          caption={isChain ? 'Across renewals' : 'Posted'}
        />
        <StatCard
          label="Value at Maturity"
          value={formatCurrency(deposit.maturityValue)}
          caption={`+${formatCurrency(deposit.interestOnMaturity)} interest`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Details"
            description={isChain ? interest.certificates.join(' → ') : undefined}
          />

          <CardBody>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {details.map((detail) => (
                <div key={detail.label} className="min-w-0">
                  <dt className="text-[11px] text-text-muted">{detail.label}</dt>
                  <dd className="mt-0.5 truncate text-[13px] text-text-primary">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Interest by Year" />

          {interest.years.length === 0 ? (
            <CardBody>
              <p className="text-xs text-text-muted">No interest posted yet.</p>
            </CardBody>
          ) : (
            <table className="w-full text-[13px]">
              <tbody className="divide-y divide-border">
                {interest.years.map((year) => (
                  <tr key={year.financialYearId}>
                    <td className="px-5 py-2 text-text-primary">{year.label}</td>
                    <td className="px-5 py-2 text-right text-text-primary tabular">
                      {formatCurrency(year.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t border-border-strong bg-surface-2 font-semibold">
                  <td className="px-5 py-2.5 text-text-primary">Total</td>
                  <td className="px-5 py-2.5 text-right text-text-primary tabular">
                    {formatCurrency(interest.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Transactions" description="Every voucher raised for this deposit." />

        <DataTable columns={columns} minWidth={isChain ? 980 : 860}>
          {vouchers.length === 0 ? (
            <DataTableEmpty colSpan={columns.length}>
              <EmptyState icon={Receipt} title="No vouchers raised yet" />
            </DataTableEmpty>
          ) : (
            vouchers.map((voucher) => (
              <DataRow key={voucher.id}>
                <DataCell nowrap className="text-xs text-text-muted tabular">
                  {formatShortDate(voucher.date)}
                </DataCell>

                <DataCell nowrap>
                  <Link
                    href={`${VOUCHER_ROUTES[voucher.kind]}?ref=${encodeURIComponent(voucher.ref)}`}
                    className="ref text-xs font-medium text-primary transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {voucher.ref}
                  </Link>

                  {voucher.manualVoucherNo && (
                    <span className="mt-0.5 block text-[11px] text-text-muted ref">
                      Book #{voucher.manualVoucherNo}
                    </span>
                  )}
                </DataCell>

                <DataCell nowrap className="text-xs text-text-secondary">
                  {ROLE_LABELS[voucher.role]}
                </DataCell>

                {isChain && (
                  <DataCell nowrap className="ref text-xs text-text-secondary">
                    {voucher.certificateNo}
                  </DataCell>
                )}

                <DataCell>
                  <p className="truncate text-[13px] text-text-primary">{voucher.party}</p>
                  <p className="mt-0.5 truncate text-xs text-text-muted">{voucher.description}</p>
                </DataCell>

                <DataCell align="right" nowrap className="text-[13px] text-text-primary tabular">
                  {formatCurrency(voucher.amount)}
                </DataCell>

                <DataCell nowrap>
                  <StatusBadge status={voucher.status} />
                </DataCell>
              </DataRow>
            ))
          )}
        </DataTable>
      </Card>
    </>
  );
}
