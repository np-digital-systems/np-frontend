import 'server-only';

import { api, getAll, type Page } from '@/lib/api';
import type { Permission } from '@/features/auth/types/permission';
import type { UserRole } from '@/features/auth/types/user-role';
import { formatLongDate, } from '@/lib/format';

import type {
  AuditDay,
  AuditEntry,
  FinancialYearRecord,
  PermissionGroup,
  PortalSettings,
  RoleRecord,
  UserRecord,
  UserSession,
} from '../types';

import { DEFAULT_SETTINGS } from './administration-data';

/* -------------------------------------------------------------------------
   Users
   ------------------------------------------------------------------------- */

interface ApiUser {
  readonly id: string;
  readonly nameTa: string;
  readonly fullName: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly address: string;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly memberNo: string | null;
  readonly joinedOn: string | null;
  readonly subscribes: boolean;
  readonly lastLoginAt: string | null;
  readonly createdAt: string;
}

function toUserRecord(user: ApiUser, sessions: readonly UserSession[]): UserRecord {
  return {
    id: user.id,
    fullName: user.fullName ?? user.nameTa,
    nameTa: user.nameTa,
    email: user.email ?? '',
    phone: user.phone ?? '',
    address: user.address,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    activeSessions: sessions.filter((session) => session.userId === user.id),
    hasNeverSignedIn: user.lastLoginAt === null,
  };
}

export async function getUserRecords(): Promise<readonly UserRecord[]> {
  const users = await getAll<ApiUser>('/users');

  /*
   * Sessions are the signed-in user's own; the API deliberately exposes no
   * route that lists everybody's, because a session list is a map of who is
   * at which counter right now.
   */
  const sessions = await api
    .get<readonly UserSession[]>('/auth/sessions')
    .catch(() => [] as readonly UserSession[]);

  return users.map((user) => toUserRecord(user, sessions));
}

/**
 * Your own record.
 *
 * Distinct from the register: reading `/users` needs `user:manage`, and a
 * devotee looking at their own profile holds nothing of the sort.
 */
export async function getMyProfile(): Promise<UserRecord> {
  const [me, sessions] = await Promise.all([
    api.get<ApiUser & { permissions?: readonly string[] }>('/auth/me'),
    api.get<readonly UserSession[]>('/auth/sessions').catch(() => [] as readonly UserSession[]),
  ]);

  return toUserRecord(
    {
      ...me,
      phone: me.phone ?? null,
      address: me.address ?? '',
      memberNo: me.memberNo ?? null,
      joinedOn: me.joinedOn ?? null,
      subscribes: me.subscribes ?? false,
      isActive: me.isActive ?? true,
      lastLoginAt: me.lastLoginAt ?? null,
      createdAt: me.createdAt ?? new Date().toISOString(),
    },
    sessions.map((session) => ({ ...session, userId: me.id })),
  );
}

export async function countUsersByRole(): Promise<Record<UserRole, number>> {
  const roles = await getRoleRecords();

  return roles.reduce(
    (counts, role) => ({ ...counts, [role.role]: role.userCount }),
    {} as Record<UserRole, number>,
  );
}

/* -------------------------------------------------------------------------
   Roles and the permission catalogue
   ------------------------------------------------------------------------- */

interface ApiRole {
  readonly code: UserRole;
  readonly label: string;
  readonly description: string;
  readonly isSystem: boolean;
  readonly permissions: readonly string[];
  readonly userCount: number;
}

interface ApiPermissionGroup {
  readonly code: string;
  readonly label: string;
  readonly description: string;
  readonly permissions: readonly { code: string; label: string; groupCode: string }[];
}

export async function getRoleRecords(): Promise<readonly RoleRecord[]> {
  const roles = await api.get<readonly ApiRole[]>('/roles');

  return roles.map((role) => ({
    role: role.code,
    label: role.label,
    description: role.description,
    permissions: role.permissions as readonly Permission[],
    userCount: role.userCount,
    isSystemRole: role.isSystem,
  }));
}

/** The catalogue the role editor offers, grouped as the API groups it. */
export async function getPermissionGroups(): Promise<readonly PermissionGroup[]> {
  const groups = await api.get<readonly ApiPermissionGroup[]>('/roles/permissions');

  return groups.map((group) => ({
    id: group.code,
    label: group.label,
    description: group.description,
    permissions: group.permissions.map((permission) => permission.code) as readonly Permission[],
  }));
}

/* -------------------------------------------------------------------------
   Audit trail
   ------------------------------------------------------------------------- */

interface ApiAuditEntry {
  readonly id: string;
  readonly at: string;
  readonly actorId: string | null;
  readonly actorName: string;
  readonly actorRole: UserRole;
  readonly action: AuditEntry['action'];
  readonly entity: string;
  readonly entityRef: string | null;
  readonly summary: string;
  readonly ipAddress: string;
}

export async function getAuditEntries(limit = 100): Promise<readonly AuditEntry[]> {
  const page = await api.get<Page<ApiAuditEntry>>('/audit', { query: { limit } });

  return page.data.map((entry) => ({
    id: Number(entry.id),
    at: entry.at,
    actorId: entry.actorId ?? '',
    actorName: entry.actorName,
    actorRole: entry.actorRole,
    action: entry.action,
    entity: entry.entity,
    entityRef: entry.entityRef,
    summary: entry.summary,
    ipAddress: entry.ipAddress,
  }));
}

export function groupAuditByDay(entries: readonly AuditEntry[]): readonly AuditDay[] {
  const days = new Map<string, AuditEntry[]>();

  for (const entry of entries) {
    const date = entry.at.slice(0, 10);
    const bucket = days.get(date);

    if (bucket) bucket.push(entry);
    else days.set(date, [entry]);
  }

  return [...days.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([date, dayEntries]) => ({
      date,
      label: formatLongDate(date),
      entries: dayEntries,
    }));
}

/* -------------------------------------------------------------------------
   Financial years
   ------------------------------------------------------------------------- */

interface ApiFinancialYear {
  readonly id: number;
  readonly label: string;
  readonly startsOn: string;
  readonly endsOn: string;
  readonly status: FinancialYearRecord['status'];
  readonly isCurrent: boolean;
  readonly openingBalance: number;
  readonly income: number | null;
  readonly expenses: number | null;
  readonly surplus: number | null;
  readonly voucherCount: number | null;
  readonly closedOn: string | null;
}

export async function getFinancialYearRecords(): Promise<readonly FinancialYearRecord[]> {
  const years = await api.get<readonly ApiFinancialYear[]>('/financial-years');

  return years.map((year) => {
    const income = year.income ?? 0;
    const expenses = year.expenses ?? 0;
    const surplus = year.surplus ?? income - expenses;

    return {
      id: year.id,
      label: year.label,
      startsOn: year.startsOn,
      endsOn: year.endsOn,
      status: year.status,
      isCurrent: year.isCurrent,
      closedOn: year.closedOn,
      closedBy: null,
      openingBalance: year.openingBalance,
      income,
      expenses,
      voucherCount: year.voucherCount ?? 0,
      surplus,
      closingBalance: year.openingBalance + surplus,
    };
  });
}

/* -------------------------------------------------------------------------
   Settings
   ------------------------------------------------------------------------- */

interface ApiSetting {
  readonly key: string;
  readonly value: Record<string, unknown>;
}

/**
 * Portal settings, merged over the shipped defaults.
 *
 * The API stores only what an administrator has actually changed, so a key
 * nobody has touched falls back rather than arriving empty.
 */
export async function getPortalSettings(): Promise<PortalSettings> {
  const rows = await api.get<readonly ApiSetting[]>('/settings').catch(() => []);
  const stored = new Map(rows.map((row) => [row.key, row.value]));

  const merge = <T extends object>(key: string, fallback: T): T => ({
    ...fallback,
    ...((stored.get(key) ?? {}) as Partial<T>),
  });

  return {
    temple: merge('temple', DEFAULT_SETTINGS.temple),
    locale: merge('locale', DEFAULT_SETTINGS.locale),
    accounting: merge('accounting', DEFAULT_SETTINGS.accounting),
    notifications: merge('notifications', DEFAULT_SETTINGS.notifications),
  };
}


