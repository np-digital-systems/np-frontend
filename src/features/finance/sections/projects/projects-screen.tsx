'use client';

import { useServerAction } from '@/hooks/use-server-action';

import { createProject, updateProject } from '../../lib/finance-actions';

import { useMemo, useState } from 'react';
import { AlertTriangle, FolderOpen, Plus, Search, X } from 'lucide-react';

import {
  ActionError,
  Card,
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

import { ProjectStatusBadge } from '../../components/finance-badges';
import {
  ProjectFormDialog,
  type ProjectDraft,
} from '../../components/project-form-dialog';
import { UtilisationBar } from '../../components/utilisation-bar';
import type { FinanceAccess } from '../../lib/finance-access';
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  formatCurrency,
  formatShortDate,
} from '../../lib/finance-data';
import type { FundRecord, ProjectRecord, ProjectStatus } from '../../types';

interface ProjectsScreenProps {
  initialProjects: readonly ProjectRecord[];
  funds: readonly FundRecord[];
  access: FinanceAccess;
  year: number;
}

export function ProjectsScreen({
  initialProjects,
  funds,
  access,
  year,
}: ProjectsScreenProps) {
  const projects = initialProjects;
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all');
  const [fundId, setFundId] = useState<number | 'all'>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectRecord | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return projects.filter((project) => {
      if (status !== 'all' && project.status !== status) return false;
      if (fundId !== 'all' && project.fundId !== fundId) return false;
      if (!needle) return true;

      return `${project.name} ${project.nameTa} ${project.fundName} ${project.description}`
        .toLowerCase()
        .includes(needle);
    });
  }, [projects, query, status, fundId]);

  const totals = useMemo(() => {
    const live = projects.filter(
      (project) => project.status === 'active' || project.status === 'planning',
    );

    return {
      budget: projects.reduce(
        (sum, project) => sum + (project.budget ?? 0),
        0,
      ),
      spent: projects.reduce((sum, project) => sum + project.spent, 0),
      live: live.length,
      overBudget: projects.filter((project) => project.isOverBudget).length,
    };
  }, [projects]);

  const { run, error: actionError } = useServerAction();

  function handleSubmit(draft: ProjectDraft) {
    const target = editing;
    const input = {
      nameTa: draft.nameTa,
      nameEn: draft.name,
      fundId: draft.fundId,
      budget: draft.budget,
      startDate: draft.startDate,
      targetDate: draft.targetDate || null,
      status: draft.status,
      description: draft.description,
    };

    run(
      () => (target ? updateProject(target.id, { ...input, isActive: draft.isActive }) : createProject(input)),
      () => {
        setEditing(null);
        setFormOpen(false);
      },
    );
  }

  const columns: DataColumn[] = [
    { key: 'project', label: 'Project' },
    { key: 'fund', label: 'Fund' },
    { key: 'status', label: 'Status' },
    { key: 'budget', label: 'Budget', align: 'right' },
    { key: 'spent', label: 'Spent', align: 'right' },
    { key: 'remaining', label: 'Remaining', align: 'right' },
    { key: 'progress', label: 'Utilisation' },
    ...(access.canManageProjects
      ? [{ key: 'actions', label: 'Actions', align: 'right', srOnly: true } as const]
      : []),
  ];

  const isFiltered =
    query.trim() !== '' || status !== 'all' || fundId !== 'all';

  return (
    <>
      <PortalPageHeader
        title="Projects"
        description="Thiruppani and festival work tracked against the budget agreed for it."
        meta={[
          <span key="year" className="tabular">
            Financial year {year}
          </span>,
          <span key="live" className="tabular">
            {totals.live} live
          </span>,
          totals.overBudget > 0 ? (
            <span key="over" className="text-danger tabular">
              {totals.overBudget} over budget
            </span>
          ) : null,
        ].filter(Boolean)}
        actions={
          access.canManageProjects && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus />
              New Project
            </Button>
          )
        }
      />

      <ActionError message={actionError} />

      {!access.canManageProjects && (
        <ReadOnlyNotice message="You can see every project and how its spend stands against its budget. Creating or amending a project is restricted to administrators and accountants." />
      )}

      {totals.overBudget > 0 && (
        <div className="flex items-start gap-2.5 rounded-lg border border-border bg-danger-subtle px-3.5 py-2.5">
          <AlertTriangle
            className="mt-px size-3.5 shrink-0 text-danger"
            aria-hidden
          />
          <p className="text-xs leading-relaxed text-danger">
            {totals.overBudget}{' '}
            {totals.overBudget === 1 ? 'project has' : 'projects have'} spent
            past the budget agreed for{' '}
            {totals.overBudget === 1 ? 'it' : 'them'}. Either the budget needs
            revising or the spend needs explaining to the committee.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Budget"
          value={formatCurrency(totals.budget)}
          caption={`${projects.length} projects`}
        />
        <StatCard
          label="Spent to Date"
          value={formatCurrency(totals.spent)}
          caption={`FY ${year}`}
        />
        <StatCard
          label="Remaining"
          value={formatCurrency(totals.budget - totals.spent)}
          caption="Against agreed budgets"
        />
        <StatCard
          label="Over Budget"
          value={String(totals.overBudget)}
          caption="Need a decision"
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
            placeholder="Search projects…"
            aria-label="Search projects"
            onChange={(changeEvent) => setQuery(changeEvent.target.value)}
          />
        </InputGroup>

        <Select
          value={status}
          onValueChange={(value) => setStatus(value as ProjectStatus | 'all')}
        >
          <SelectTrigger aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>

            {PROJECT_STATUSES.map((entry) => (
              <SelectItem key={entry} value={entry}>
                {PROJECT_STATUS_LABELS[entry]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={fundId === 'all' ? 'all' : String(fundId)}
          onValueChange={(value) =>
            setFundId(value === 'all' ? 'all' : Number(value))
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

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setStatus('all');
              setFundId('all');
            }}
          >
            <X />
            Clear
          </Button>
        )}
      </div>

      <Card>
        <DataTable columns={columns} minWidth={1060}>
          {filtered.length === 0 ? (
            <DataTableEmpty colSpan={columns.length}>
              <EmptyState
                icon={FolderOpen}
                title={
                  projects.length === 0
                    ? 'No projects yet'
                    : 'No projects match these filters'
                }
                description={
                  projects.length === 0
                    ? 'Create a project so thiruppani and festival spend can be tracked against a budget.'
                    : 'Adjust the search or filters above.'
                }
              />
            </DataTableEmpty>
          ) : (
            filtered.map((project) => (
              <DataRow key={project.id}>
                <DataCell>
                  <p className="truncate text-[13px] font-medium text-text-primary">
                    {project.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-text-muted">
                    {project.nameTa || project.description}
                  </p>
                  <p className="mt-0.5 text-[11px] text-text-muted tabular">
                    {formatShortDate(project.startDate)}
                    {project.targetDate
                      ? ` → ${formatShortDate(project.targetDate)}`
                      : ' → open-ended'}
                  </p>
                </DataCell>

                <DataCell nowrap className="text-xs text-text-secondary">
                  {project.fundName}
                </DataCell>

                <DataCell nowrap>
                  <ProjectStatusBadge status={project.status} />
                </DataCell>

                <DataCell align="right" nowrap className="text-[13px] tabular">
                  {project.budget === null ? (
                    <span className="text-text-disabled">No ceiling</span>
                  ) : (
                    formatCurrency(project.budget)
                  )}
                </DataCell>

                <DataCell
                  align="right"
                  nowrap
                  className="text-[13px] text-danger tabular"
                >
                  {formatCurrency(project.spent)}
                </DataCell>

                <DataCell align="right" nowrap>
                  {project.remaining === null ? (
                    <span className="text-text-disabled">—</span>
                  ) : (
                    <span
                      className={cn(
                        'text-[13px] font-medium tabular',
                        project.isOverBudget
                          ? 'text-danger'
                          : 'text-text-primary',
                      )}
                    >
                      {project.isOverBudget
                        ? `−${formatCurrency(Math.abs(project.remaining))}`
                        : formatCurrency(project.remaining)}
                    </span>
                  )}
                </DataCell>

                <DataCell className="w-40">
                  {project.utilisation === null ? (
                    <span className="text-[11px] text-text-disabled">
                      Not measured
                    </span>
                  ) : (
                    <>
                      <UtilisationBar
                        value={project.utilisation}
                        label={`${project.name} budget utilisation`}
                      />
                      <p
                        className={cn(
                          'mt-1.5 text-[11px] tabular',
                          project.isOverBudget
                            ? 'text-danger'
                            : 'text-text-muted',
                        )}
                      >
                        {Math.round(project.utilisation * 100)}% used
                      </p>
                    </>
                  )}
                </DataCell>

                {access.canManageProjects && (
                  <DataCell align="right" nowrap>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(project);
                        setFormOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </DataCell>
                )}
              </DataRow>
            ))
          )}
        </DataTable>
      </Card>

      {access.canManageProjects && (
        <ProjectFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          project={editing}
          funds={funds}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
