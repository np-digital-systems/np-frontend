'use client';

import { useMemo, useState } from 'react';
import { MoreHorizontal, Package, Plus, Search, X } from 'lucide-react';

import {
  Card,
  CardBody,
  CardHeader,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  AssetCategoryBadge,
  AssetConditionBadge,
  AssetStatusBadge,
} from '../../components/finance-badges';
import {
  AssetFormDialog,
  type AssetDraft,
} from '../../components/asset-form-dialog';
import {
  DisposeAssetDialog,
  type DisposalDraft,
} from '../../components/dispose-asset-dialog';
import { UtilisationBar } from '../../components/utilisation-bar';
import {
  ASSET_DISPOSE_MESSAGE,
  type FinanceAccess,
} from '../../lib/finance-access';
import {
  ASSET_CATEGORIES,
  ASSET_CATEGORY_LABELS,
  ASSET_CONDITIONS,
  ASSET_CONDITION_LABELS,
  accumulatedDepreciation,
  formatCurrency,
  formatShortDate,
  share,
  yearsBetween,
} from '../../lib/finance-data';
import type {
  AssetCategory,
  AssetCategoryTotal,
  AssetCondition,
  AssetRecord,
  FundRecord,
} from '../../types';

interface AssetsScreenProps {
  initialAssets: readonly AssetRecord[];
  categoryTotals: readonly AssetCategoryTotal[];
  funds: readonly FundRecord[];
  access: FinanceAccess;
  today: string;
  year: number;
}

/**
 * The asset register.
 *
 * Two questions, kept separate: what the temple owns and what condition it is
 * in, which is the maintenance committee's concern, and what it is worth on
 * the books, which is the auditor's. The table answers both without mixing
 * them into one column.
 *
 * TODO: replace the local mutations with calls to the assets API.
 */
export function AssetsScreen({
  initialAssets,
  categoryTotals,
  funds,
  access,
  today,
  year,
}: AssetsScreenProps) {
  const [assets, setAssets] = useState<readonly AssetRecord[]>(initialAssets);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<AssetCategory | 'all'>('all');
  const [condition, setCondition] = useState<AssetCondition | 'all'>('all');
  const [includeDisposed, setIncludeDisposed] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AssetRecord | null>(null);
  const [disposing, setDisposing] = useState<AssetRecord | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return assets.filter((asset) => {
      if (!includeDisposed && asset.status === 'disposed') return false;
      if (category !== 'all' && asset.category !== category) return false;
      if (condition !== 'all' && asset.condition !== condition) return false;
      if (!needle) return true;

      return `${asset.tag} ${asset.name} ${asset.nameTa} ${asset.location} ${asset.fundName}`
        .toLowerCase()
        .includes(needle);
    });
  }, [assets, query, category, condition, includeDisposed]);

  const totals = useMemo(() => {
    const held = assets.filter((asset) => asset.status !== 'disposed');

    return {
      count: held.length,
      cost: held.reduce((sum, asset) => sum + asset.cost, 0),
      depreciation: held.reduce(
        (sum, asset) => sum + asset.accumulatedDepreciation,
        0,
      ),
      netBookValue: held.reduce((sum, asset) => sum + asset.netBookValue, 0),
      needingAttention: held.filter(
        (asset) =>
          asset.condition === 'needs-repair' || asset.condition === 'unusable',
      ).length,
      disposed: assets.length - held.length,
    };
  }, [assets]);

  /** Recomputes the derived figures for one asset after an edit. */
  function reshape(
    base: AssetRecord | null,
    draft: AssetDraft,
    fundName: string,
  ): AssetRecord {
    const ageYears = Math.max(yearsBetween(draft.acquiredOn, today), 0);
    const depreciation = accumulatedDepreciation(
      draft.cost,
      draft.depreciationRate,
      ageYears,
    );

    return {
      id: base?.id ?? Date.now(),
      tag: draft.tag,
      name: draft.name,
      nameTa: draft.nameTa,
      category: draft.category,
      acquiredOn: draft.acquiredOn,
      cost: draft.cost,
      depreciationRate: draft.depreciationRate,
      location: draft.location,
      condition: draft.condition,
      status: draft.status,
      fundId: draft.fundId,
      disposedOn: base?.disposedOn ?? null,
      disposalValue: base?.disposalValue ?? null,
      notes: draft.notes || null,
      fundName,
      ageYears,
      accumulatedDepreciation: depreciation,
      netBookValue: Math.max(draft.cost - depreciation, 0),
      annualDepreciation: draft.cost * (draft.depreciationRate / 100),
    };
  }

  function handleSubmit(draft: AssetDraft) {
    const fundName =
      funds.find((fund) => fund.id === draft.fundId)?.name ?? 'Unassigned';

    setAssets((current) =>
      editing
        ? current.map((asset) =>
            asset.id === editing.id
              ? reshape(asset, draft, fundName)
              : asset,
          )
        : [reshape(null, draft, fundName), ...current],
    );
  }

  function handleDispose(draft: DisposalDraft) {
    if (!disposing) return;

    setAssets((current) =>
      current.map((asset) => {
        if (asset.id !== disposing.id) return asset;

        // Depreciation stops on the disposal date, so the book value is
        // recomputed to that day rather than left at today's figure.
        const ageYears = Math.max(
          yearsBetween(asset.acquiredOn, draft.disposedOn),
          0,
        );
        const depreciation = accumulatedDepreciation(
          asset.cost,
          asset.depreciationRate,
          ageYears,
        );

        return {
          ...asset,
          status: 'disposed',
          disposedOn: draft.disposedOn,
          disposalValue: draft.disposalValue,
          notes: draft.notes,
          ageYears,
          accumulatedDepreciation: depreciation,
          netBookValue: Math.max(asset.cost - depreciation, 0),
        };
      }),
    );

    setDisposing(null);
  }

  const columns: DataColumn[] = [
    { key: 'tag', label: 'Tag' },
    { key: 'asset', label: 'Asset' },
    { key: 'category', label: 'Category' },
    { key: 'acquired', label: 'Acquired', align: 'right' },
    { key: 'cost', label: 'Cost', align: 'right' },
    { key: 'depreciation', label: 'Depreciation', align: 'right' },
    { key: 'nbv', label: 'Book Value', align: 'right' },
    { key: 'condition', label: 'Condition' },
    { key: 'status', label: 'Status' },
    ...(access.canManageAssets
      ? [{ key: 'actions', label: 'Actions', align: 'right', srOnly: true } as const]
      : []),
  ];

  const isFiltered =
    query.trim() !== '' ||
    category !== 'all' ||
    condition !== 'all' ||
    includeDisposed;

  return (
    <>
      <PortalPageHeader
        title="Assets"
        description="The register of what the temple owns — what it cost, what it is worth today and what condition it is in."
        meta={[
          <span key="year" className="tabular">
            Financial year {year}
          </span>,
          <span key="count" className="tabular">
            {totals.count} in the register
          </span>,
          totals.needingAttention > 0 ? (
            <span key="repair" className="text-warning tabular">
              {totals.needingAttention} needing repair
            </span>
          ) : null,
        ].filter(Boolean)}
        actions={
          access.canManageAssets && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus />
              Add Asset
            </Button>
          )
        }
      />

      {!access.canManageAssets ? (
        <ReadOnlyNotice message="You can see the temple’s asset register and its book values. Adding or amending an asset record is restricted to administrators and accountants." />
      ) : (
        !access.canDisposeAssets && (
          <ReadOnlyNotice message={ASSET_DISPOSE_MESSAGE} />
        )
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Assets Held"
          value={String(totals.count)}
          caption={`${totals.disposed} disposed`}
        />
        <StatCard
          label="Gross Cost"
          value={formatCurrency(totals.cost)}
          caption="What it all cost"
        />
        <StatCard
          label="Accumulated Depreciation"
          value={formatCurrency(totals.depreciation)}
          caption="Written down to date"
        />
        <StatCard
          label="Net Book Value"
          value={formatCurrency(totals.netBookValue)}
          caption="Carried on the accounts"
        />
      </div>

      {categoryTotals.length > 0 && (
        <Card>
          <CardHeader
            title="By category"
            description="Where the register's value sits"
          />

          <CardBody className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryTotals.map((entry) => (
              <div key={entry.category} className="min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-[13px] text-text-primary">
                    {ASSET_CATEGORY_LABELS[entry.category]}
                  </span>
                  <span className="shrink-0 text-[13px] font-medium text-text-primary tabular">
                    {formatCurrency(entry.netBookValue)}
                  </span>
                </div>

                <UtilisationBar
                  className="mt-2"
                  value={share(entry.netBookValue, totals.netBookValue)}
                  label={`${ASSET_CATEGORY_LABELS[entry.category]} share of book value`}
                  warnAt={2}
                />

                <p className="mt-1.5 text-[11px] text-text-muted tabular">
                  {entry.count} {entry.count === 1 ? 'item' : 'items'} ·{' '}
                  {formatCurrency(entry.cost)} at cost
                </p>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full sm:w-64">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>

          <InputGroupInput
            type="search"
            value={query}
            placeholder="Search tag, name or location…"
            aria-label="Search assets"
            onChange={(changeEvent) => setQuery(changeEvent.target.value)}
          />
        </InputGroup>

        <Select
          value={category}
          onValueChange={(value) =>
            setCategory(value as AssetCategory | 'all')
          }
        >
          <SelectTrigger aria-label="Filter by category">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>

            {ASSET_CATEGORIES.map((entry) => (
              <SelectItem key={entry} value={entry}>
                {ASSET_CATEGORY_LABELS[entry]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={condition}
          onValueChange={(value) =>
            setCondition(value as AssetCondition | 'all')
          }
        >
          <SelectTrigger aria-label="Filter by condition">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All conditions</SelectItem>

            {ASSET_CONDITIONS.map((entry) => (
              <SelectItem key={entry} value={entry}>
                {ASSET_CONDITION_LABELS[entry]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={includeDisposed ? 'secondary' : 'outline'}
          size="sm"
          aria-pressed={includeDisposed}
          onClick={() => setIncludeDisposed((current) => !current)}
        >
          Include disposed
        </Button>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setCategory('all');
              setCondition('all');
              setIncludeDisposed(false);
            }}
          >
            <X />
            Clear
          </Button>
        )}
      </div>

      <Card>
        <DataTable columns={columns} minWidth={1260}>
          {filtered.length === 0 ? (
            <DataTableEmpty colSpan={columns.length}>
              <EmptyState
                icon={Package}
                title={
                  assets.length === 0
                    ? 'No assets registered'
                    : 'No assets match these filters'
                }
                description={
                  assets.length === 0
                    ? 'Register what the temple owns so its value and condition are tracked.'
                    : 'Adjust the search or filters above.'
                }
              />
            </DataTableEmpty>
          ) : (
            <>
              {filtered.map((asset) => (
                <DataRow
                  key={asset.id}
                  className={cn(asset.status === 'disposed' && 'opacity-60')}
                >
                  <DataCell nowrap className="ref text-xs text-text-muted">
                    {asset.tag}
                  </DataCell>

                  <DataCell>
                    <p className="truncate text-[13px] font-medium text-text-primary">
                      {asset.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-text-muted">
                      {asset.nameTa}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-text-muted">
                      {asset.location || '—'} · {asset.fundName}
                    </p>
                  </DataCell>

                  <DataCell nowrap>
                    <AssetCategoryBadge category={asset.category} />
                  </DataCell>

                  <DataCell align="right" nowrap>
                    <span className="text-xs text-text-secondary tabular">
                      {formatShortDate(asset.acquiredOn)}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-text-muted tabular">
                      {asset.ageYears.toFixed(1)} yrs
                    </span>
                  </DataCell>

                  <DataCell
                    align="right"
                    nowrap
                    className="text-[13px] text-text-primary tabular"
                  >
                    {formatCurrency(asset.cost)}
                  </DataCell>

                  <DataCell align="right" nowrap>
                    {asset.depreciationRate === 0 ? (
                      <span className="text-[11px] text-text-disabled">
                        At cost
                      </span>
                    ) : (
                      <>
                        <span className="text-[13px] text-danger tabular">
                          {formatCurrency(asset.accumulatedDepreciation)}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-text-muted tabular">
                          {asset.depreciationRate}% p.a.
                        </span>
                      </>
                    )}
                  </DataCell>

                  <DataCell
                    align="right"
                    nowrap
                    className="text-[13px] font-medium text-text-primary tabular"
                  >
                    {formatCurrency(asset.netBookValue)}
                  </DataCell>

                  <DataCell nowrap>
                    <AssetConditionBadge condition={asset.condition} />
                  </DataCell>

                  <DataCell nowrap>
                    <AssetStatusBadge status={asset.status} />

                    {asset.disposedOn && (
                      <span className="mt-0.5 block text-[11px] text-text-muted tabular">
                        {formatShortDate(asset.disposedOn)}
                      </span>
                    )}
                  </DataCell>

                  {access.canManageAssets && (
                    <DataCell align="right" nowrap>
                      {asset.status === 'disposed' ? (
                        <span className="text-[11px] text-text-muted">
                          {asset.disposalValue !== null
                            ? formatCurrency(asset.disposalValue)
                            : '—'}
                        </span>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Actions for ${asset.tag}`}
                            >
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onSelect={() => {
                                setEditing(asset);
                                setFormOpen(true);
                              }}
                            >
                              Edit record
                            </DropdownMenuItem>

                            {access.canDisposeAssets && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onSelect={() => setDisposing(asset)}
                                >
                                  Record disposal
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </DataCell>
                  )}
                </DataRow>
              ))}

              <tr className="border-t border-border-strong bg-surface-2">
                <td
                  colSpan={4}
                  className="px-4 py-2.5 text-[11px] font-medium text-text-muted"
                >
                  {filtered.length} of {assets.length} assets shown
                </td>
                <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-text-primary tabular">
                  {formatCurrency(
                    filtered.reduce((sum, asset) => sum + asset.cost, 0),
                  )}
                </td>
                <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-danger tabular">
                  {formatCurrency(
                    filtered.reduce(
                      (sum, asset) => sum + asset.accumulatedDepreciation,
                      0,
                    ),
                  )}
                </td>
                <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-text-primary tabular">
                  {formatCurrency(
                    filtered.reduce((sum, asset) => sum + asset.netBookValue, 0),
                  )}
                </td>
                <td colSpan={access.canManageAssets ? 3 : 2} />
              </tr>
            </>
          )}
        </DataTable>
      </Card>

      {access.canManageAssets && (
        <AssetFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          asset={editing}
          funds={funds}
          existing={assets}
          today={today}
          onSubmit={handleSubmit}
        />
      )}

      {access.canDisposeAssets && (
        <DisposeAssetDialog
          open={disposing !== null}
          onOpenChange={(open) => !open && setDisposing(null)}
          asset={disposing}
          today={today}
          onConfirm={handleDispose}
        />
      )}
    </>
  );
}
