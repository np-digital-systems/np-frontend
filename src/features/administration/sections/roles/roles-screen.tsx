'use client';

import { useMemo, useState } from 'react';
import { Info, RotateCcw, Search, Shield, X } from 'lucide-react';

import {
  Card,
  CardBody,
  CardHeader,
  PortalPageHeader,
  StatCard,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Permission } from '@/features/auth/types/permission';
import type { UserRole } from '@/features/auth/types/user-role';
import { cn } from '@/lib/utils';

import { describePermission } from '../../lib/administration-data';
import type { PermissionGroup, RoleRecord } from '../../types';

interface RolesScreenProps {
  roles: readonly RoleRecord[];
  groups: readonly PermissionGroup[];
}

/**
 * The role matrix.
 *
 * What this grid shows is not a copy of the permission model — it is read
 * from `ROLE_PERMISSIONS`, the same constant every capability check in the
 * portal runs against. So a cell that is ticked here is a thing that role
 * can genuinely do right now, which is the only way this screen is worth
 * trusting.
 *
 * TODO: persisting a change needs the roles API. Until then edits are held
 * locally and the reset button puts the grid back to what the portal
 * enforces.
 */
export function RolesScreen({ roles, groups }: RolesScreenProps) {
  const baseline = useMemo(
    () =>
      new Map(
        roles.map((role) => [role.role, new Set<Permission>(role.permissions)]),
      ),
    [roles],
  );

  const [matrix, setMatrix] = useState<Map<UserRole, Set<Permission>>>(
    () => new Map(roles.map((role) => [role.role, new Set(role.permissions)])),
  );
  const [query, setQuery] = useState('');

  const dirtyCount = useMemo(() => {
    let count = 0;

    for (const role of roles) {
      const current = matrix.get(role.role) ?? new Set<Permission>();
      const original = baseline.get(role.role) ?? new Set<Permission>();

      for (const permission of new Set([...current, ...original])) {
        if (current.has(permission) !== original.has(permission)) count += 1;
      }
    }

    return count;
  }, [matrix, baseline, roles]);

  const visibleGroups = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) return groups;

    return groups
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter((permission) =>
          permission.toLowerCase().includes(needle),
        ),
      }))
      .filter(
        (group) =>
          group.permissions.length > 0 ||
          group.label.toLowerCase().includes(needle),
      );
  }, [groups, query]);

  const totalPermissions = groups.reduce(
    (sum, group) => sum + group.permissions.length,
    0,
  );

  function toggle(role: UserRole, permission: Permission) {
    setMatrix((current) => {
      const next = new Map(current);
      const held = new Set(next.get(role) ?? []);

      if (held.has(permission)) {
        held.delete(permission);
      } else {
        held.add(permission);
      }

      next.set(role, held);
      return next;
    });
  }

  function reset() {
    setMatrix(
      new Map(roles.map((role) => [role.role, new Set(role.permissions)])),
    );
  }

  return (
    <>
      <PortalPageHeader
        title="Roles & Permissions"
        description="What each role is allowed to do. Every check in the portal is answered from this matrix."
        meta={[
          <span key="roles" className="tabular">
            {roles.length} roles
          </span>,
          <span key="permissions" className="tabular">
            {totalPermissions} capabilities
          </span>,
          dirtyCount > 0 ? (
            <span key="dirty" className="text-warning tabular">
              {dirtyCount} unsaved{' '}
              {dirtyCount === 1 ? 'change' : 'changes'}
            </span>
          ) : null,
        ].filter(Boolean)}
        actions={
          <>
            {dirtyCount > 0 && (
              <Button variant="outline" onClick={reset}>
                <RotateCcw />
                Reset
              </Button>
            )}

            <Button disabled={dirtyCount === 0}>Save Changes</Button>
          </>
        }
      />

      <div className="flex items-start gap-2.5 rounded-lg border border-border bg-info-subtle px-3.5 py-2.5">
        <Info className="mt-px size-3.5 shrink-0 text-info" aria-hidden />
        <p className="text-xs leading-relaxed text-info">
          The portal never branches on a role name directly — it asks whether
          the signed-in user <em>can do a thing</em>. Re-mapping a capability
          here changes every screen and every server check at once.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {roles.map((role) => (
          <StatCard
            key={role.role}
            label={role.label}
            value={String(matrix.get(role.role)?.size ?? 0)}
            caption={`${role.userCount} ${role.userCount === 1 ? 'account' : 'accounts'} · of ${totalPermissions}`}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full sm:w-72">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>

          <InputGroupInput
            type="search"
            value={query}
            placeholder="Search capabilities, e.g. voucher or approve…"
            aria-label="Search permissions"
            onChange={(changeEvent) => setQuery(changeEvent.target.value)}
          />
        </InputGroup>

        {query && (
          <Button variant="ghost" size="sm" onClick={() => setQuery('')}>
            <X />
            Clear
          </Button>
        )}
      </div>

      {visibleGroups.length === 0 ? (
        <Card>
          <CardBody>
            <p className="py-6 text-center text-[13px] text-text-muted">
              No capabilities match “{query}”.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleGroups.map((group) => (
            <Card key={group.id}>
              <CardHeader title={group.label} description={group.description} />

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th
                        scope="col"
                        className="px-4 py-2.5 text-[11px] font-medium text-text-muted"
                      >
                        Capability
                      </th>

                      {roles.map((role) => (
                        <th
                          key={role.role}
                          scope="col"
                          className="px-4 py-2.5 text-center text-[11px] font-medium text-text-muted"
                        >
                          {role.label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {group.permissions.map((permission) => {
                      const { subject, action } = describePermission(permission);

                      return (
                        <tr
                          key={permission}
                          className="transition-colors hover:bg-interactive-hover"
                        >
                          <td className="px-4 py-2.5">
                            <p className="text-[13px] text-text-primary">
                              {subject} · {action}
                            </p>
                            <p className="ref mt-0.5 text-[11px] text-text-muted">
                              {permission}
                            </p>
                          </td>

                          {roles.map((role) => {
                            const held =
                              matrix.get(role.role)?.has(permission) ?? false;
                            const original =
                              baseline.get(role.role)?.has(permission) ?? false;

                            return (
                              <td
                                key={role.role}
                                className={cn(
                                  'px-4 py-2.5 text-center',
                                  held !== original && 'bg-warning-subtle',
                                )}
                              >
                                <Checkbox
                                  checked={held}
                                  aria-label={`${role.label}: ${permission}`}
                                  onCheckedChange={() =>
                                    toggle(role.role, permission)
                                  }
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}

      <RoleSummary roles={roles} />
    </>
  );
}

/**
 * What each role is for, in a sentence.
 *
 * The grid says what a role *can* do; this says what it is *meant* to do,
 * which is what somebody needs before deciding whether a tick belongs there.
 */
function RoleSummary({ roles }: { roles: readonly RoleRecord[] }) {
  return (
    <Card>
      <CardHeader
        title="What each role is for"
        description="The intent behind the matrix above"
      />

      <ul className="divide-y divide-border">
        {roles.map((role) => (
          <li key={role.role} className="flex gap-3.5 px-5 py-4">
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-subtle"
              aria-hidden
            >
              <Shield className="size-4 text-primary" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13px] font-medium text-text-primary">
                  {role.label}
                </p>

                {role.isSystemRole && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="rounded bg-neutral-subtle px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
                        System role
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      The portal must always have at least one active holder of
                      this role — it is the only role that can restore the
                      others.
                    </TooltipContent>
                  </Tooltip>
                )}

                <span className="text-[11px] text-text-muted tabular">
                  {role.userCount}{' '}
                  {role.userCount === 1 ? 'account' : 'accounts'}
                </span>
              </div>

              <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                {role.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
