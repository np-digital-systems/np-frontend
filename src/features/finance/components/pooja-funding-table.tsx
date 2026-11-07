import {
  Card,
  CardHeader,
  DataCell,
  DataRow,
  DataTable,
  type DataColumn,
} from '@/components/portal/ui';
import { cn } from '@/lib/utils';

import { formatCurrency } from '../lib/finance-data';
import type { PoojaFunding } from '../types';

const COLUMNS: DataColumn[] = [
  { key: 'pooja', label: 'Purpose' },
  { key: 'deposits', label: 'Deposits', align: 'right' },
  { key: 'interest', label: 'Interest Received', align: 'right' },
  { key: 'topups', label: 'Sponsor Top-ups', align: 'right' },
  { key: 'spent', label: 'Spent', align: 'right' },
  { key: 'balance', label: 'Balance', align: 'right' },
];

export function PoojaFundingTable({ funding }: { funding: PoojaFunding }) {
  return (
    <Card>
      <CardHeader
        title="Pooja Funding"
        description={`Financial year ${funding.financialYearLabel}`}
      />

      <DataTable columns={COLUMNS} minWidth={900}>
        {funding.rows.map((row) => (
          <DataRow key={row.slotId ?? 'general'}>
            <DataCell>
              <p className="truncate text-[13px] text-text-primary">
                {row.poojaName ?? 'General'}
              </p>
              {row.sponsorName && (
                <p className="mt-0.5 truncate text-[11px] text-text-muted">{row.sponsorName}</p>
              )}
            </DataCell>

            <DataCell align="right" nowrap className="text-xs tabular">
              {row.deposits}
              <span className="block text-[11px] text-text-muted">
                {formatCurrency(row.principal)}
              </span>
            </DataCell>

            <DataCell align="right" nowrap className="text-[13px] tabular">
              {formatCurrency(row.interestReceived)}
            </DataCell>

            <DataCell align="right" nowrap className="text-[13px] tabular">
              {formatCurrency(row.sponsorTopUps)}
            </DataCell>

            <DataCell align="right" nowrap className="text-[13px] tabular">
              {formatCurrency(row.spent)}
            </DataCell>

            <DataCell align="right" nowrap>
              <span
                className={cn(
                  'text-[13px] font-medium tabular',
                  row.balance < 0 ? 'text-danger' : 'text-text-primary',
                )}
              >
                {formatCurrency(Math.abs(row.balance))}
              </span>
              <span className="mt-0.5 block text-[11px] text-text-muted">
                {row.balance < 0 ? 'Shortfall' : 'Surplus'}
              </span>
            </DataCell>
          </DataRow>
        ))}
      </DataTable>
    </Card>
  );
}
