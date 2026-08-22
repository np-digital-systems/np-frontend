import { ROLE_PERMISSIONS } from '@/features/auth/lib/permissions';
import { USER_ROLES, type UserRole } from '@/features/auth/types/user-role';
import { formatLongDate, getToday } from '@/lib/format';

import {
  ADMIN_USERS,
  AUDIT_ENTRIES,
  FINANCIAL_YEARS,
  PORTAL_SETTINGS,
  USER_SESSIONS,
} from '../constants/mock-data';
import type {
  AuditDay,
  AuditEntry,
  FinancialYearRecord,
  PortalSettings,
  RoleRecord,
  UserRecord,
} from '../types';

import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  SYSTEM_ROLES,
} from './administration-data';

/** TODO: replace the remaining module-level constants with API calls. */

export function getUserRecords(
  today: string = getToday(),
): readonly UserRecord[] {
  const now = `${today}T23:59:59`;

  return ADMIN_USERS.map((user) => ({
    ...user,
    activeSessions: USER_SESSIONS.filter(
      (session) =>
        session.userId === user.id &&
        session.revokedAt === null &&
        session.expiresAt > now,
    ),
    hasNeverSignedIn: user.lastLoginAt === null,
  })).sort((a, b) => {
    // Inactive accounts sink; the rest read by role seniority then name.
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;

    const order = USER_ROLES.indexOf(a.role) - USER_ROLES.indexOf(b.role);
    return order !== 0 ? order : a.fullName.localeCompare(b.fullName);
  });
}

export function countUsersByRole(): Record<UserRole, number> {
  const counts = Object.fromEntries(
    USER_ROLES.map((role) => [role, 0]),
  ) as Record<UserRole, number>;

  for (const user of ADMIN_USERS) {
    if (user.isActive) counts[user.role] += 1;
  }

  return counts;
}

export function getRoleRecords(): readonly RoleRecord[] {
  const counts = countUsersByRole();

  return USER_ROLES.map((role) => ({
    role,
    label: ROLE_LABELS[role],
    description: ROLE_DESCRIPTIONS[role],
    permissions: [...ROLE_PERMISSIONS[role]],
    userCount: counts[role],
    isSystemRole: SYSTEM_ROLES.includes(role),
  }));
}

export function getAuditEntries(): readonly AuditEntry[] {
  return [...AUDIT_ENTRIES].sort((a, b) => (a.at < b.at ? 1 : -1));
}

export function groupAuditByDay(
  entries: readonly AuditEntry[],
): readonly AuditDay[] {
  const days = new Map<string, AuditEntry[]>();

  for (const entry of entries) {
    const date = entry.at.slice(0, 10);
    const bucket = days.get(date);

    if (bucket) {
      bucket.push(entry);
    } else {
      days.set(date, [entry]);
    }
  }

  return [...days.entries()].map(([date, dayEntries]) => ({
    date,
    label: formatLongDate(date),
    entries: dayEntries,
  }));
}

export function getFinancialYearRecords(): readonly FinancialYearRecord[] {
  return FINANCIAL_YEARS.map((year) => ({
    ...year,
    surplus: year.income - year.expenses,
    closingBalance: year.openingBalance + year.income - year.expenses,
  })).sort((a, b) => (a.label < b.label ? 1 : -1));
}

export function getPortalSettings(): PortalSettings {
  return PORTAL_SETTINGS;
}
