'use client';

import { useMemo, useState } from 'react';
import {
  Check,
  ClipboardList,
  Download,
  FilePlus2,
  LogIn,
  LogOut,
  Pencil,
  Search,
  Shield,
  Trash2,
  Upload,
  X,
  type LucideIcon,
} from 'lucide-react';

import {
  Card,
  EmptyState,
  PortalPageHeader,
  StatCard,
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
import { USER_ROLES, type UserRole } from '@/features/auth/types/user-role';
import { cn } from '@/lib/utils';

import {
  AUDIT_ACTIONS,
  AUDIT_ACTION_LABELS,
  ROLE_LABELS,
  formatLongDate,
} from '../../lib/administration-data';
import type { AuditAction, AuditEntry } from '../../types';

interface AuditLogScreenProps {
  entries: readonly AuditEntry[];
  today: string;
}

const ACTION_STYLE: Record<
  AuditAction,
  { icon: LucideIcon; tone: string }
> = {
  create: { icon: FilePlus2, tone: 'bg-info-subtle text-info' },
  update: { icon: Pencil, tone: 'bg-neutral-subtle text-text-secondary' },
  delete: { icon: Trash2, tone: 'bg-danger-subtle text-danger' },
  approve: { icon: Check, tone: 'bg-success-subtle text-success' },
  reject: { icon: X, tone: 'bg-danger-subtle text-danger' },
  post: { icon: Upload, tone: 'bg-primary-subtle text-primary' },
  login: { icon: LogIn, tone: 'bg-neutral-subtle text-text-muted' },
  logout: { icon: LogOut, tone: 'bg-neutral-subtle text-text-muted' },
  'permission-change': { icon: Shield, tone: 'bg-warning-subtle text-warning' },
};

export function AuditLogScreen({ entries, today }: AuditLogScreenProps) {
  const [query, setQuery] = useState('');
  const [action, setAction] = useState<AuditAction | 'all'>('all');
  const [actor, setActor] = useState<string | 'all'>('all');
  const [role, setRole] = useState<UserRole | 'all'>('all');

  const actors = useMemo(() => {
    const seen = new Map<string, string>();

    for (const entry of entries) {
      seen.set(entry.actorId, entry.actorName);
    }

    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [entries]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return entries.filter((entry) => {
      if (action !== 'all' && entry.action !== action) return false;
      if (actor !== 'all' && entry.actorId !== actor) return false;
      if (role !== 'all' && entry.actorRole !== role) return false;
      if (!needle) return true;

      return `${entry.summary} ${entry.entity} ${entry.entityRef ?? ''} ${entry.actorName}`
        .toLowerCase()
        .includes(needle);
    });
  }, [entries, query, action, actor, role]);

    const days = useMemo(() => {
    const buckets = new Map<string, AuditEntry[]>();

    for (const entry of filtered) {
      const date = entry.at.slice(0, 10);
      const existing = buckets.get(date);

      if (existing) {
        existing.push(entry);
      } else {
        buckets.set(date, [entry]);
      }
    }

    return [...buckets.entries()].map(([date, dayEntries]) => ({
      date,
      label: date === today ? 'Today' : formatLongDate(date),
      entries: dayEntries,
    }));
  }, [filtered, today]);

  const totals = useMemo(
    () => ({
      todayCount: entries.filter((entry) => entry.at.startsWith(today)).length,
      actors: actors.length,
      permissionChanges: entries.filter(
        (entry) => entry.action === 'permission-change',
      ).length,
      deletions: entries.filter((entry) => entry.action === 'delete').length,
    }),
    [entries, today, actors],
  );

  const isFiltered =
    query.trim() !== '' || action !== 'all' || actor !== 'all' || role !== 'all';

  return (
    <>
      <PortalPageHeader
        title="Audit Log"
        description="Who did what, and when. Append-only — entries are never edited or removed."
        meta={[
          <span key="total" className="tabular">
            {entries.length} entries
          </span>,
          <span key="today" className="tabular">
            {totals.todayCount} today
          </span>,
          isFiltered ? (
            <span key="filtered" className="tabular">
              {filtered.length} matching
            </span>
          ) : null,
        ].filter(Boolean)}
        actions={
          <Button variant="outline">
            <Download />
            Export
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Entries Today"
          value={String(totals.todayCount)}
          caption="Recorded since midnight"
        />
        <StatCard
          label="Active Actors"
          value={String(totals.actors)}
          caption="People in this trail"
        />
        <StatCard
          label="Permission Changes"
          value={String(totals.permissionChanges)}
          caption="Role grants and revocations"
        />
        <StatCard
          label="Deletions"
          value={String(totals.deletions)}
          caption="Records removed or cancelled"
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
            placeholder="Search reference, entity or summary…"
            aria-label="Search the audit log"
            onChange={(changeEvent) => setQuery(changeEvent.target.value)}
          />
        </InputGroup>

        <Select
          value={action}
          onValueChange={(value) => setAction(value as AuditAction | 'all')}
        >
          <SelectTrigger aria-label="Filter by action">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>

            {AUDIT_ACTIONS.map((entry) => (
              <SelectItem key={entry} value={entry}>
                {AUDIT_ACTION_LABELS[entry]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={actor} onValueChange={setActor}>
          <SelectTrigger aria-label="Filter by person">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Anyone</SelectItem>

            {actors.map(([id, name]) => (
              <SelectItem key={id} value={id}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={role}
          onValueChange={(value) => setRole(value as UserRole | 'all')}
        >
          <SelectTrigger aria-label="Filter by role">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>

            {USER_ROLES.map((entry) => (
              <SelectItem key={entry} value={entry}>
                {ROLE_LABELS[entry]}
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
              setAction('all');
              setActor('all');
              setRole('all');
            }}
          >
            <X />
            Clear
          </Button>
        )}
      </div>

      {days.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="No entries match these filters"
            description="Adjust the search or filters above to see more of the trail."
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {days.map((day) => (
            <Card key={day.date}>
              <div className="flex items-baseline justify-between gap-3 border-b border-border px-5 py-3">
                <h2 className="text-[13px] font-semibold text-text-primary">
                  {day.label}
                </h2>
                <span className="text-xs text-text-muted tabular">
                  {day.entries.length}{' '}
                  {day.entries.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>

              <ol className="divide-y divide-border">
                {day.entries.map((entry) => {
                  const style = ACTION_STYLE[entry.action];

                  return (
                    <li key={entry.id} className="flex gap-3.5 px-5 py-3.5">
                      <span
                        className={cn(
                          'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full',
                          style.tone,
                        )}
                        aria-hidden
                      >
                        <style.icon className="size-3.5" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="text-[13px] font-medium text-text-primary">
                            {entry.actorName}
                          </span>
                          <span className="text-[13px] text-text-secondary">
                            {AUDIT_ACTION_LABELS[entry.action].toLowerCase()}
                          </span>
                          <span className="text-[13px] text-text-secondary">
                            {entry.entity.toLowerCase()}
                          </span>

                          {entry.entityRef && (
                            <span className="ref text-xs font-medium text-primary">
                              {entry.entityRef}
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
                          {entry.summary}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-[11px] text-text-secondary tabular">
                          {entry.at.slice(11, 16)}
                        </p>
                        <p className="ref mt-0.5 text-[11px] text-text-muted">
                          {entry.ipAddress}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
