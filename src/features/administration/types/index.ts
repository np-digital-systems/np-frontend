import type { Permission } from '@/features/auth/types/permission';
import type { UserRole } from '@/features/auth/types/user-role';

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

export interface UserSession {
  readonly id: string;
  readonly userId: string;
  readonly deviceName: string;
  readonly ipAddress: string;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly revokedAt: string | null;
}

export interface UserRecord extends AdminUser {
  readonly activeSessions: readonly UserSession[];
    readonly hasNeverSignedIn: boolean;
}

export interface PermissionGroup {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly permissions: readonly Permission[];
}

export interface RoleRecord {
  readonly role: UserRole;
  readonly label: string;
  readonly description: string;
  readonly permissions: readonly Permission[];
  readonly userCount: number;
    readonly isSystemRole: boolean;
}

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

export interface AuditEntry {
  readonly id: number;
  readonly at: string;
  readonly actorId: string;
  readonly actorName: string;
  readonly actorRole: UserRole;
  readonly action: AuditAction;
    readonly entity: string;
    readonly entityRef: string | null;
  readonly summary: string;
  readonly ipAddress: string;
}

export interface AuditDay {
  readonly date: string;
  readonly label: string;
  readonly entries: readonly AuditEntry[];
}

export type FinancialYearStatus = 'open' | 'closed' | 'upcoming';

export interface FinancialYear {
  readonly id: number;
  readonly label: string;
  readonly startsOn: string;
  readonly endsOn: string;
  readonly status: FinancialYearStatus;
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
    readonly yearStartMonth: number;
    readonly approvalThreshold: number;
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
