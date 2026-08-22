'use client';

import { useState } from 'react';

import { FormField } from '@/components/portal/ui';
import { validate } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import {
  ASSET_CATEGORIES,
  ASSET_CATEGORY_LABELS,
  ASSET_CONDITIONS,
  ASSET_CONDITION_LABELS,
  ASSET_STATUS_LABELS,
  accumulatedDepreciation,
  formatCurrency,
  yearsBetween,
} from '../lib/finance-data';
import { assetSchema } from '../lib/finance-schemas';
import type {
  AssetCategory,
  AssetCondition,
  AssetRecord,
  AssetStatus,
  FundRecord,
} from '../types';

export interface AssetDraft {
  tag: string;
  name: string;
  nameTa: string;
  category: AssetCategory;
  acquiredOn: string;
  cost: number;
  depreciationRate: number;
  location: string;
  condition: AssetCondition;
  status: AssetStatus;
  fundId: number;
  notes: string;
}

const NON_DEPRECIATING: readonly AssetCategory[] = [
  'land-building',
  'jewellery',
];

const DEFAULT_RATE: Record<AssetCategory, number> = {
  'land-building': 0,
  jewellery: 0,
  vahanam: 5,
  vessels: 10,
  furniture: 12.5,
  equipment: 15,
  vehicle: 15,
};

const LIVE_STATUSES: readonly AssetStatus[] = [
  'in-use',
  'in-storage',
  'under-repair',
];

function draftFrom(
  asset: AssetRecord | null,
  funds: readonly FundRecord[],
  today: string,
): AssetDraft {
  if (asset) {
    return {
      tag: asset.tag,
      name: asset.name,
      nameTa: asset.nameTa,
      category: asset.category,
      acquiredOn: asset.acquiredOn,
      cost: asset.cost,
      depreciationRate: asset.depreciationRate,
      location: asset.location,
      condition: asset.condition,
      status: asset.status,
      fundId: asset.fundId,
      notes: asset.notes ?? '',
    };
  }

  return {
    tag: '',
    name: '',
    nameTa: '',
    category: 'equipment',
    acquiredOn: today,
    cost: 0,
    depreciationRate: DEFAULT_RATE.equipment,
    location: '',
    condition: 'good',
    status: 'in-use',
    fundId: funds[0]?.id ?? 0,
    notes: '',
  };
}

interface AssetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: AssetRecord | null;
  funds: readonly FundRecord[];
  existing: readonly AssetRecord[];
  today: string;
  onSubmit: (draft: AssetDraft) => void;
}

export function AssetFormDialog({
  open,
  onOpenChange,
  asset,
  funds,
  existing,
  today,
  onSubmit,
}: AssetFormDialogProps) {
  const [draft, setDraft] = useState<AssetDraft>(() =>
    draftFrom(asset, funds, today),
  );
  const [error, setError] = useState<string | null>(null);

  const seed = `${open}|${asset?.id ?? 'new'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(asset, funds, today));
    setError(null);
  }

  const carriedAtCost = draft.depreciationRate === 0;

  const projectedAge = draft.acquiredOn
    ? Math.max(yearsBetween(draft.acquiredOn, today), 0)
    : 0;

  const projectedDepreciation = accumulatedDepreciation(
    draft.cost,
    draft.depreciationRate,
    projectedAge,
  );

  function update<K extends keyof AssetDraft>(key: K, value: AssetDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function changeCategory(category: AssetCategory) {
    setDraft((current) => ({
      ...current,
      category,
      depreciationRate: DEFAULT_RATE[category],
    }));
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    const result = validate(assetSchema, draft);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    if (result.data.acquiredOn > today) {
      setError('An asset cannot be acquired in the future.');
      return;
    }

    const clash = existing.some(
      (entry) =>
        entry.tag.toUpperCase() === result.data.tag && entry.id !== asset?.id,
    );

    if (clash) {
      setError(`Tag ${result.data.tag} is already in use.`);
      return;
    }

    setError(null);
    onSubmit(result.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {asset ? `Edit ${asset.tag}` : 'Add Asset'}
          </DialogTitle>
          <DialogDescription>
            The asset register records what the temple owns, what it cost and
            what it is worth on the books today.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              id="asset-tag"
              label="Tag"
              required
              hint="Written on the item."
            >
              <Input
                id="asset-tag"
                value={draft.tag}
                placeholder="EQ-005"
                onChange={(changeEvent) =>
                  update('tag', changeEvent.target.value)
                }
              />
            </FormField>

            <FormField
              id="asset-name"
              label="Name (English)"
              required
              className="sm:col-span-2"
            >
              <Input
                id="asset-name"
                value={draft.name}
                placeholder="Diesel Generator 15 kVA"
                onChange={(changeEvent) =>
                  update('name', changeEvent.target.value)
                }
              />
            </FormField>
          </div>

          <FormField id="asset-name-ta" label="Name (Tamil)">
            <Input
              id="asset-name-ta"
              value={draft.nameTa}
              placeholder="டீசல் மின்னாக்கி"
              onChange={(changeEvent) =>
                update('nameTa', changeEvent.target.value)
              }
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="asset-category" label="Category" required>
              <Select
                value={draft.category}
                onValueChange={(value) =>
                  changeCategory(value as AssetCategory)
                }
              >
                <SelectTrigger id="asset-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {ASSET_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {ASSET_CATEGORY_LABELS[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="asset-fund" label="Funded By" required>
              <Select
                value={String(draft.fundId)}
                onValueChange={(value) => update('fundId', Number(value))}
              >
                <SelectTrigger id="asset-fund" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {funds.map((fund) => (
                    <SelectItem key={fund.id} value={String(fund.id)}>
                      {fund.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField id="asset-acquired" label="Acquired On" required>
              <Input
                id="asset-acquired"
                type="date"
                max={today}
                value={draft.acquiredOn}
                onChange={(changeEvent) =>
                  update('acquiredOn', changeEvent.target.value)
                }
              />
            </FormField>

            <FormField id="asset-cost" label="Cost" required>
              <Input
                id="asset-cost"
                type="number"
                min={0}
                step={1000}
                value={draft.cost || ''}
                onChange={(changeEvent) =>
                  update('cost', Number(changeEvent.target.value) || 0)
                }
              />
            </FormField>

            <FormField
              id="asset-rate"
              label="Depreciation %"
              hint={
                NON_DEPRECIATING.includes(draft.category)
                  ? 'Carried at cost by default.'
                  : 'Straight line, per year.'
              }
            >
              <Input
                id="asset-rate"
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={draft.depreciationRate}
                onChange={(changeEvent) =>
                  update(
                    'depreciationRate',
                    Number(changeEvent.target.value) || 0,
                  )
                }
              />
            </FormField>
          </div>

          {draft.cost > 0 && (
            <dl className="grid grid-cols-3 gap-x-4 rounded-lg bg-surface-2 px-3.5 py-3">
              <Projection
                label="Age"
                value={`${projectedAge.toFixed(1)} years`}
              />
              <Projection
                label="Depreciation to date"
                value={
                  carriedAtCost ? '—' : formatCurrency(projectedDepreciation)
                }
                tone={carriedAtCost ? 'muted' : 'danger'}
              />
              <Projection
                label="Book value"
                value={formatCurrency(draft.cost - projectedDepreciation)}
                tone="primary"
              />
            </dl>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField id="asset-location" label="Location">
              <Input
                id="asset-location"
                value={draft.location}
                placeholder="Generator room"
                onChange={(changeEvent) =>
                  update('location', changeEvent.target.value)
                }
              />
            </FormField>

            <FormField id="asset-condition" label="Condition" required>
              <Select
                value={draft.condition}
                onValueChange={(value) =>
                  update('condition', value as AssetCondition)
                }
              >
                <SelectTrigger id="asset-condition" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {ASSET_CONDITIONS.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {ASSET_CONDITION_LABELS[condition]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="asset-status" label="Status" required>
              <Select
                value={
                  draft.status === 'disposed' ? 'in-storage' : draft.status
                }
                onValueChange={(value) => update('status', value as AssetStatus)}
              >
                <SelectTrigger id="asset-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {LIVE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {ASSET_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField id="asset-notes" label="Notes">
            <Textarea
              id="asset-notes"
              rows={2}
              value={draft.notes}
              placeholder="Servicing history, restrictions on use…"
              onChange={(changeEvent) =>
                update('notes', changeEvent.target.value)
              }
            />
          </FormField>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-danger-subtle px-3 py-2 text-xs text-danger"
            >
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit">
              {asset ? 'Save Changes' : 'Add Asset'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Projection({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'danger' | 'primary' | 'muted';
}) {
  const TONES = {
    default: 'text-text-primary',
    danger: 'text-danger',
    primary: 'text-primary',
    muted: 'text-text-disabled',
  } as const;

  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-text-muted">{label}</dt>
      <dd
        className={`mt-0.5 truncate text-[13px] font-semibold tabular ${TONES[tone]}`}
      >
        {value}
      </dd>
    </div>
  );
}
