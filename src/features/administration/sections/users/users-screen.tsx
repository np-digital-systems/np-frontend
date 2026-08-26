'use client';

import { useServerAction } from '@/hooks/use-server-action';

import {
  changeUserRole,
  createUser,
  setUserActive,
  signOutUser,
  updateUser,
} from '../../lib/administration-actions';

import { useMemo, useState } from 'react';
import {
  KeyRound,
  LogOut,
  MoreHorizontal,
  Plus,
  Search,
  Users,
  X,
} from 'lucide-react';

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
import { USER_ROLES, type UserRole } from '@/features/auth/types/user-role';
import { cn } from '@/lib/utils';

import {
  UserFormDialog,
  type UserDraft,
} from '../../components/user-form-dialog';
import {
  ROLE_LABELS,
  formatStamp,
  timeAgo,
} from '../../lib/administration-data';
import type { UserRecord } from '../../types';

interface UsersScreenProps {
  initialUsers: readonly UserRecord[];
  currentUserId: string;
  today: string;
}

export function UsersScreen({
  initialUsers,
  currentUserId,
  today,
}: UsersScreenProps) {
  const users = initialUsers;
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<UserRole | 'all'>('all');
  const [showInactive, setShowInactive] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const [deactivating, setDeactivating] = useState<UserRecord | null>(null);
  const [signingOut, setSigningOut] = useState<UserRecord | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return users.filter((user) => {
      if (!showInactive && !user.isActive) return false;
      if (role !== 'all' && user.role !== role) return false;
      if (!needle) return true;

      return `${user.fullName} ${user.nameTa} ${user.email} ${user.phone}`
        .toLowerCase()
        .includes(needle);
    });
  }, [users, query, role, showInactive]);

  const totals = useMemo(() => {
    const active = users.filter((user) => user.isActive);

    return {
      active: active.length,
      inactive: users.length - active.length,
      admins: active.filter((user) => user.role === 'admin').length,
      sessions: active.reduce(
        (sum, user) => sum + user.activeSessions.length,
        0,
      ),
      neverSignedIn: active.filter((user) => user.hasNeverSignedIn).length,
    };
  }, [users]);

  const { run, error: actionError } = useServerAction();

  function handleSubmit(draft: UserDraft) {
    const target = editing;
    const profile = {
      nameTa: draft.nameTa || draft.fullName,
      fullName: draft.fullName,
      email: draft.email,
      phone: draft.phone,
      address: draft.address,
    };

    run(
      async () => {
        if (!target) return createUser({ ...profile, role: draft.role });

        const updated = await updateUser(target.id, profile);

        if (!updated.ok) return updated;

        // The role is its own call because changing it revokes the user's
        // sessions, which a profile edit has no business doing.
        if (draft.role !== target.role) {
          const moved = await changeUserRole(target.id, draft.role);

          if (!moved.ok) return moved;
        }

        if (draft.isActive !== target.isActive) {
          return setUserActive(target.id, draft.isActive);
        }

        return updated;
      },
      () => {
        setEditing(null);
        setFormOpen(false);
      },
    );
  }

  const columns: DataColumn[] = [
    { key: 'user', label: 'User' },
    { key: 'role', label: 'Role' },
    { key: 'contact', label: 'Contact' },
    { key: 'sessions', label: 'Sessions', align: 'right' },
    { key: 'lastSeen', label: 'Last Seen', align: 'right' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', align: 'right', srOnly: true },
  ];

  const isFiltered = query.trim() !== '' || role !== 'all' || showInactive;

  return (
    <>
      <PortalPageHeader
        title="Users"
        description="Portal accounts, the role each one holds and the devices they are signed in on."
        meta={[
          <span key="active" className="tabular">
            {totals.active} active accounts
          </span>,
          <span key="sessions" className="tabular">
            {totals.sessions} open sessions
          </span>,
          totals.neverSignedIn > 0 ? (
            <span key="never" className="text-warning tabular">
              {totals.neverSignedIn} never signed in
            </span>
          ) : null,
        ].filter(Boolean)}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus />

      <ActionError message={actionError} />
            New User
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Active Accounts"
          value={String(totals.active)}
          caption={`${totals.inactive} deactivated`}
        />
        <StatCard
          label="Administrators"
          value={String(totals.admins)}
          caption="Full portal control"
        />
        <StatCard
          label="Open Sessions"
          value={String(totals.sessions)}
          caption="Across all devices"
        />
        <StatCard
          label="Never Signed In"
          value={String(totals.neverSignedIn)}
          caption="Invitation not yet used"
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
            placeholder="Search name, email or phone…"
            aria-label="Search users"
            onChange={(changeEvent) => setQuery(changeEvent.target.value)}
          />
        </InputGroup>

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

        <Button
          variant={showInactive ? 'secondary' : 'outline'}
          size="sm"
          aria-pressed={showInactive}
          onClick={() => setShowInactive((current) => !current)}
        >
          Show deactivated
        </Button>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setRole('all');
              setShowInactive(false);
            }}
          >
            <X />
            Clear
          </Button>
        )}
      </div>

      <Card>
        <DataTable columns={columns} minWidth={1080}>
          {filtered.length === 0 ? (
            <DataTableEmpty colSpan={columns.length}>
              <EmptyState
                icon={Users}
                title="No users match these filters"
                description="Adjust the search or role filter above."
              />
            </DataTableEmpty>
          ) : (
            filtered.map((user) => (
              <DataRow
                key={user.id}
                className={cn(!user.isActive && 'opacity-60')}
              >
                <DataCell>
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-medium text-text-primary">
                      {user.fullName}
                    </p>
                    {user.id === currentUserId && (
                      <span className="shrink-0 rounded bg-primary-subtle px-1 py-0.5 text-[10px] font-medium text-primary">
                        You
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-text-muted">
                    {user.nameTa}
                  </p>
                </DataCell>

                <DataCell nowrap>
                  <RoleChip role={user.role} />
                </DataCell>

                <DataCell>
                  <p className="truncate text-xs text-text-secondary">
                    {user.email}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-text-muted tabular">
                    {user.phone || '—'}
                  </p>
                </DataCell>

                <DataCell align="right" nowrap>
                  {user.activeSessions.length > 0 ? (
                    <span className="text-[13px] text-text-primary tabular">
                      {user.activeSessions.length}
                    </span>
                  ) : (
                    <span className="text-text-disabled">—</span>
                  )}
                </DataCell>

                <DataCell align="right" nowrap>
                  {user.lastLoginAt ? (
                    <>
                      <span className="text-xs text-text-secondary tabular">
                        {timeAgo(user.lastLoginAt, today)}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-text-muted tabular">
                        {formatStamp(user.lastLoginAt)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-warning">Never</span>
                  )}
                </DataCell>

                <DataCell nowrap>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium',
                      user.isActive
                        ? 'bg-success-subtle text-success'
                        : 'bg-neutral-subtle text-text-muted',
                    )}
                  >
                    <span
                      className="size-1.5 rounded-full bg-current"
                      aria-hidden
                    />
                    {user.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </DataCell>

                <DataCell align="right" nowrap>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Actions for ${user.fullName}`}
                      >
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem
                        onSelect={() => {
                          setEditing(user);
                          setFormOpen(true);
                        }}
                      >
                        Edit account
                      </DropdownMenuItem>

                      <DropdownMenuItem disabled={!user.isActive}>
                        <KeyRound />
                        Send password reset
                      </DropdownMenuItem>

                      {user.activeSessions.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => setSigningOut(user)}
                          >
                            <LogOut />
                            Sign out all devices
                          </DropdownMenuItem>
                        </>
                      )}

                      {user.isActive && user.id !== currentUserId && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setDeactivating(user)}
                          >
                            Deactivate account
                          </DropdownMenuItem>
                        </>
                      )}

                      {!user.isActive && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => run(() => setUserActive(user.id, true))}
                          >
                            Reactivate account
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </DataCell>
              </DataRow>
            ))
          )}
        </DataTable>
      </Card>

      <SessionsPanel users={users} today={today} />

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editing}
        existing={users}
        currentUserId={currentUserId}
        adminCount={totals.admins}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deactivating !== null}
        onOpenChange={(open) => !open && setDeactivating(null)}
        title="Deactivate this account?"
        confirmLabel="Deactivate"
        description={
          deactivating
            ? `${deactivating.fullName} will be signed out of ${deactivating.activeSessions.length} device${deactivating.activeSessions.length === 1 ? '' : 's'} and will not be able to sign in. Their entries and audit history are kept.`
            : ''
        }
        onConfirm={() => {
          if (deactivating) run(() => setUserActive(deactivating.id, false));
          setDeactivating(null);
        }}
      />

      <ConfirmDialog
        open={signingOut !== null}
        onOpenChange={(open) => !open && setSigningOut(null)}
        title="Sign out all devices?"
        confirmLabel="Sign Out"
        description={
          signingOut
            ? `${signingOut.fullName} will be signed out of ${signingOut.activeSessions.length} device${signingOut.activeSessions.length === 1 ? '' : 's'} and will have to sign in again. The account stays active.`
            : ''
        }
        onConfirm={() => {
          if (signingOut) run(() => signOutUser(signingOut.id));
          setSigningOut(null);
        }}
      />
    </>
  );
}

const ROLE_TONE: Record<UserRole, string> = {
  admin: 'bg-primary-subtle text-primary',
  accountant: 'bg-info-subtle text-info',
  cashier: 'bg-warning-subtle text-warning',
  user: 'bg-neutral-subtle text-text-secondary',
};

function RoleChip({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap',
        ROLE_TONE[role],
      )}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}

function SessionsPanel({
  users,
  today,
}: {
  users: readonly UserRecord[];
  today: string;
}) {
  const sessions = users.flatMap((user) =>
    user.activeSessions.map((session) => ({ user, session })),
  );

  return (
    <Card>
      <div className="border-b border-border px-5 py-3.5">
        <h2 className="text-[13px] font-semibold text-text-primary">
          Active sessions
        </h2>
        <p className="mt-0.5 text-xs text-text-muted">
          Devices currently signed in across all accounts
        </p>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={LogOut}
          title="No open sessions"
          description="Nobody is signed in to the portal right now."
        />
      ) : (
        <ul className="divide-y divide-border">
          {sessions.map(({ user, session }) => (
            <li
              key={session.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] text-text-primary">
                  {session.deviceName}
                </p>
                <p className="mt-0.5 truncate text-xs text-text-muted">
                  {user.fullName} · {ROLE_LABELS[user.role]}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="ref text-[11px] text-text-secondary">
                  {session.ipAddress}
                </p>
                <p className="mt-0.5 text-[11px] text-text-muted tabular">
                  Since {timeAgo(session.createdAt, today)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
