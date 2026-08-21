import type { Permission } from '@/features/auth/types/permission';
import type { UserRole } from '@/features/auth/types/user-role';

/**
 * The administration domain.
 *
 * Accounts, the role matrix, the audit trail, the financial year and the
 * portal's own settings — the things that decide how everything else in the
 * portal behaves.
 */

/* -------------------------------------------------------------------------
   Users and sessions
   ------------------------------------------------------------------------- */

/** `users` — a portal account. */
export interface AdminUser {
  readonly id: string;
  readonly fullName: string;
  readonly nameTa: string;
  readonly email: string;
  readonly phone: string;
  readonly address: string;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly lastLoginAt: string | null;
  readonly createdAt: string;
}

/** `user_sessions` — one signed-in device. */
export interface UserSession {
  readonly id: string;
  readonly userId: string;
  readonly deviceName: string;
  readonly ipAddress: string;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly revokedAt: string | null;
}

/** A user with their sessions and activity resolved. */
export interface UserRecord extends AdminUser {
  readonly activeSessions: readonly UserSession[];
  /** True when the account has never been signed into. */
  readonly hasNeverSignedIn: boolean;
}

/* -------------------------------------------------------------------------
   Roles
   ------------------------------------------------------------------------- */

/**
 * A permission grouped for display.
 *
 * The grid would be unreadable as one flat list of sixty capabilities, so
 * they are bucketed by the module they govern — which is also how somebody
 * reasons about them: "what can an accountant do in accounting".
 */
export interface PermissionGroup {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly permissions: readonly Permission[];
}

/** One role in the matrix, with what it holds and who has it. */
export interface RoleRecord {
  readonly role: UserRole;
  readonly label: string;
  readonly description: string;
  readonly permissions: readonly Permission[];
  readonly userCount: number;
  /** A role the portal cannot function without — never left with no holder. */
  readonly isSystemRole: boolean;
}

/* -------------------------------------------------------------------------
   Audit log
   ------------------------------------------------------------------------- */

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'post'
  | 'login'
  | 'logout'
  | 'permission-change';

/** `audit_log` — an append-only record of what was done. */
export interface AuditEntry {
  readonly id: number;
  readonly at: string;
  readonly actorId: string;
  readonly actorName: string;
  readonly actorRole: UserRole;
  readonly action: AuditAction;
  /** What kind of thing was acted on: "Voucher", "User", "Event". */
  readonly entity: string;
  /** Its human reference, when it has one. */
  readonly entityRef: string | null;
  readonly summary: string;
  readonly ipAddress: string;
}

export interface AuditDay {
  readonly date: string;
  readonly label: string;
  readonly entries: readonly AuditEntry[];
}

/* -------------------------------------------------------------------------
   Financial years
   ------------------------------------------------------------------------- */

export type FinancialYearStatus = 'open' | 'closed' | 'upcoming';

/** `financial_years` — the period the books are kept in. */
export interface FinancialYear {
  readonly id: number;
  readonly label: string;
  readonly startsOn: string;
  readonly endsOn: string;
  readonly status: FinancialYearStatus;
  /** Only one year is the one new entries post into. */
  readonly isCurrent: boolean;
  readonly closedOn: string | null;
  readonly closedBy: string | null;
  readonly openingBalance: number;
  readonly income: number;
  readonly expenses: number;
  readonly voucherCount: number;
}

export interface FinancialYearRecord extends FinancialYear {
  readonly surplus: number;
  readonly closingBalance: number;
}

/* -------------------------------------------------------------------------
   Settings
   ------------------------------------------------------------------------- */

export interface TempleProfile {
  readonly name: string;
  readonly nameTa: string;
  readonly registrationNo: string;
  readonly address: string;
  readonly phone: string;
  readonly email: string;
  readonly website: string;
}

export interface LocaleSettings {
  readonly defaultLanguage: 'en' | 'ta';
  readonly timeZone: string;
  readonly currency: string;
  readonly dateFormat: 'dd-mm-yyyy' | 'yyyy-mm-dd' | 'dd-mon-yyyy';
}

export interface AccountingSettings {
  readonly receiptPrefix: string;
  readonly paymentPrefix: string;
  /** Month the financial year starts in, 1–12. */
  readonly yearStartMonth: number;
  /** Payments above this need a second approver. */
  readonly approvalThreshold: number;
  /** Whether an approver may post their own approval straight to the ledger. */
  readonly requireSeparatePoster: boolean;
}

export interface NotificationSettings {
  readonly voucherSubmitted: boolean;
  readonly voucherApproved: boolean;
  readonly voucherRejected: boolean;
  readonly depositMaturing: boolean;
  readonly sanththaArrears: boolean;
  readonly eventReminders: boolean;
}

export interface PortalSettings {
  readonly temple: TempleProfile;
  readonly locale: LocaleSettings;
  readonly accounting: AccountingSettings;
  readonly notifications: NotificationSettings;
}
