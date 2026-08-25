'use client';

import { Search, X } from 'lucide-react';

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

import {
  PAYMENT_MODES,
  PAYMENT_MODE_LABELS,
  VOUCHER_STATUSES,
} from '../lib/accounting-data';
import type { FundRef, PaymentMode, VoucherRecord, VoucherStatus } from '../types';

export interface VoucherFilterState {
  readonly query: string;
  readonly status: VoucherStatus | 'all' | 'open';
  readonly fundId: number | 'all';
  readonly mode: PaymentMode | 'all';
    readonly mineOnly: boolean;
}

export const EMPTY_VOUCHER_FILTERS: VoucherFilterState = {
  query: '',
  status: 'all',
  fundId: 'all',
  mode: 'all',
  mineOnly: false,
};

export function hasActiveVoucherFilters(
  filters: VoucherFilterState,
): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.status !== 'all' ||
    filters.fundId !== 'all' ||
    filters.mode !== 'all' ||
    filters.mineOnly
  );
}

export function applyVoucherFilters(
  vouchers: readonly VoucherRecord[],
  filters: VoucherFilterState,
  userId: string,
): readonly VoucherRecord[] {
  const needle = filters.query.trim().toLowerCase();

  return vouchers.filter((voucher) => {
    if (filters.status === 'open') {
      if (voucher.status !== 'Draft' && voucher.status !== 'Pending Approval') {
        return false;
      }
    } else if (filters.status !== 'all' && voucher.status !== filters.status) {
      return false;
    }

    if (filters.fundId !== 'all' && voucher.fundId !== filters.fundId) {
      return false;
    }

    if (filters.mode !== 'all' && voucher.mode !== filters.mode) return false;

    if (filters.mineOnly && voucher.createdBy.id !== userId) return false;

    if (!needle) return true;

    return [
      voucher.ref,
      voucher.party,
      voucher.description,
      voucher.account.name,
      voucher.fund.name,
      voucher.project?.name ?? '',
      voucher.eventRef ?? '',
    ]
      .join(' ')
      .toLowerCase()
      .includes(needle);
  });
}

interface VoucherFiltersProps {
  filters: VoucherFilterState;
  onChange: (filters: VoucherFilterState) => void;
  funds: readonly FundRef[];
    showMineToggle?: boolean;
  trailing?: React.ReactNode;
}

export function VoucherFilters({
  filters,
  onChange,
  funds,
  showMineToggle = true,
  trailing,
}: VoucherFiltersProps) {
  function set<K extends keyof VoucherFilterState>(
    key: K,
    value: VoucherFilterState[K],
  ) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full sm:w-64">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>

          <InputGroupInput
            type="search"
            value={filters.query}
            placeholder="Search reference, party, description…"
            aria-label="Search vouchers"
            onChange={(changeEvent) => set('query', changeEvent.target.value)}
          />
        </InputGroup>

        <Select
          value={filters.status}
          onValueChange={(value) =>
            set('status', value as VoucherFilterState['status'])
          }
        >
          <SelectTrigger aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open — draft or pending</SelectItem>

            {VOUCHER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.fundId === 'all' ? 'all' : String(filters.fundId)}
          onValueChange={(value) =>
            set('fundId', value === 'all' ? 'all' : Number(value))
          }
        >
          <SelectTrigger aria-label="Filter by fund">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All funds</SelectItem>

            {funds.map((fund) => (
              <SelectItem key={fund.id} value={String(fund.id)}>
                {fund.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.mode}
          onValueChange={(value) =>
            set('mode', value as PaymentMode | 'all')
          }
        >
          <SelectTrigger aria-label="Filter by payment mode">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All modes</SelectItem>

            {PAYMENT_MODES.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {PAYMENT_MODE_LABELS[mode]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showMineToggle && (
          <Button
            variant={filters.mineOnly ? 'secondary' : 'outline'}
            size="sm"
            aria-pressed={filters.mineOnly}
            onClick={() => set('mineOnly', !filters.mineOnly)}
          >
            My entries
          </Button>
        )}

        {hasActiveVoucherFilters(filters) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(EMPTY_VOUCHER_FILTERS)}
          >
            <X />
            Clear
          </Button>
        )}
      </div>

      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}
