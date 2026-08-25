'use client';

import { useState } from 'react';

import { FormField } from '@/components/portal/ui';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  formatCurrency,
} from '../lib/finance-data';
import type { FundRecord, ProjectRecord, ProjectStatus } from '../types';

export interface ProjectDraft {
  name: string;
  nameTa: string;
  fundId: number;
  budget: number | null;
  startDate: string;
  targetDate: string;
  status: ProjectStatus;
  description: string;
  isActive: boolean;
}

function draftFrom(
  project: ProjectRecord | null,
  funds: readonly FundRecord[],
  today: string,
): ProjectDraft {
  if (project) {
    return {
      name: project.name,
      nameTa: project.nameTa,
      fundId: project.fundId,
      budget: project.budget,
      startDate: project.startDate,
      targetDate: project.targetDate ?? '',
      status: project.status,
      description: project.description,
      isActive: project.isActive,
    };
  }

  return {
    name: '',
    nameTa: '',
    fundId: funds[0]?.id ?? 0,
    budget: null,
    startDate: today,
    targetDate: '',
    status: 'planning',
    description: '',
    isActive: true,
  };
}

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectRecord | null;
  funds: readonly FundRecord[];
  onSubmit: (draft: ProjectDraft) => void;
}

/**
 * Create or amend a project.
 *
 * A project belongs to exactly one fund, which is what makes budget-against-
 * actual meaningful — so changing the fund of a project that already has
 * spend against it says so rather than quietly reassigning history.
 */
export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  funds,
  onSubmit,
}: ProjectFormDialogProps) {
  const today = new Date().toISOString().slice(0, 10);

  const [draft, setDraft] = useState<ProjectDraft>(() =>
    draftFrom(project, funds, today),
  );
  const [error, setError] = useState<string | null>(null);

  const seed = `${open}|${project?.id ?? 'new'}`;
  const [lastSeed, setLastSeed] = useState(seed);

  if (lastSeed !== seed) {
    setLastSeed(seed);
    setDraft(draftFrom(project, funds, today));
    setError(null);
  }

  const fundChanged = project !== null && draft.fundId !== project.fundId;
  const hasSpend = (project?.spent ?? 0) > 0;

  const budgetBelowSpend =
    project !== null &&
    draft.budget !== null &&
    draft.budget < project.spent;

  function update<K extends keyof ProjectDraft>(
    key: K,
    value: ProjectDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    if (!draft.name.trim()) {
      setError('A project name is required.');
      return;
    }

    if (draft.budget !== null && draft.budget < 0) {
      setError('A budget cannot be negative.');
      return;
    }

    if (draft.targetDate && draft.targetDate < draft.startDate) {
      setError('The target date cannot fall before the start date.');
      return;
    }

    setError(null);

    onSubmit({
      ...draft,
      name: draft.name.trim(),
      nameTa: draft.nameTa.trim(),
      description: draft.description.trim(),
    });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {project ? `Edit ${project.name}` : 'New Project'}
          </DialogTitle>
          <DialogDescription>
            A project tracks a piece of work — a thiruppani or a festival —
            against a budget, so spend can be read back against what was
            agreed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField id="project-name" label="Name (English)" required>
            <Input
              id="project-name"
              value={draft.name}
              placeholder="Gopuram Thiruppani"
              onChange={(changeEvent) =>
                update('name', changeEvent.target.value)
              }
            />
          </FormField>

          <FormField id="project-name-ta" label="Name (Tamil)">
            <Input
              id="project-name-ta"
              value={draft.nameTa}
              placeholder="கோபுரத் திருப்பணி"
              onChange={(changeEvent) =>
                update('nameTa', changeEvent.target.value)
              }
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="project-fund" label="Fund" required>
              <Select
                value={String(draft.fundId)}
                onValueChange={(value) => update('fundId', Number(value))}
              >
                <SelectTrigger id="project-fund" className="w-full">
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

            <FormField
              id="project-budget"
              label="Budget"
              hint="Leave empty for open-ended work with no agreed ceiling."
            >
              <Input
                id="project-budget"
                type="number"
                min={0}
                step={10000}
                value={draft.budget ?? ''}
                placeholder="No ceiling"
                onChange={(changeEvent) =>
                  update(
                    'budget',
                    changeEvent.target.value === ''
                      ? null
                      : Number(changeEvent.target.value) || 0,
                  )
                }
              />
            </FormField>
          </div>

          {fundChanged && hasSpend && (
            <p className="rounded-lg bg-warning-subtle px-3 py-2 text-xs leading-relaxed text-warning">
              {formatCurrency(project?.spent ?? 0)} has already been charged to
              this project under {project?.fundName}. Moving it to another fund
              does not move that spend with it.
            </p>
          )}

          {budgetBelowSpend && (
            <p className="rounded-lg bg-warning-subtle px-3 py-2 text-xs leading-relaxed text-warning">
              {formatCurrency(project?.spent ?? 0)} has already been spent. A
              budget of {formatCurrency(draft.budget ?? 0)} puts this project
              over its ceiling the moment it is saved.
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="project-start" label="Start Date" required>
              <Input
                id="project-start"
                type="date"
                value={draft.startDate}
                onChange={(changeEvent) =>
                  update('startDate', changeEvent.target.value)
                }
              />
            </FormField>

            <FormField id="project-target" label="Target Date">
              <Input
                id="project-target"
                type="date"
                value={draft.targetDate}
                onChange={(changeEvent) =>
                  update('targetDate', changeEvent.target.value)
                }
              />
            </FormField>
          </div>

          <FormField id="project-status" label="Status" required>
            <Select
              value={draft.status}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  status: value as ProjectStatus,
                  // Only active work takes new entries; anything else stops
                  // accepting them without losing what it already has.
                  isActive: value === 'active',
                }))
              }
            >
              <SelectTrigger id="project-status" className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {PROJECT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {PROJECT_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="project-description" label="Description">
            <Textarea
              id="project-description"
              rows={2}
              value={draft.description}
              placeholder="What the work covers"
              onChange={(changeEvent) =>
                update('description', changeEvent.target.value)
              }
            />
          </FormField>

          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
            <div className="min-w-0 pr-4">
              <Label
                htmlFor="project-postable"
                className="text-xs font-medium text-text-secondary"
              >
                Accepts new entries
              </Label>
              <p className="mt-0.5 text-[11px] text-text-muted">
                Whether vouchers can still be charged to this project.
              </p>
            </div>

            <Switch
              id="project-postable"
              checked={draft.isActive}
              onCheckedChange={(checked) => update('isActive', checked)}
            />
          </div>

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
              {project ? 'Save Changes' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
