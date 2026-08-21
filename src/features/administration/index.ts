/**
 * Administration feature — public surface.
 *
 * Accounts, the role matrix, the audit trail, the financial year and the
 * portal's own settings: the screens that decide how everything else in the
 * portal behaves.
 */
export {
  UsersFeature,
  RolesFeature,
  AuditLogFeature,
  FinancialYearsFeature,
  SettingsFeature,
} from './sections';

export {
  getAdministrationAccess,
  type AdministrationAccess,
} from './lib/administration-access';

export { ADMIN_ROUTES } from './lib/routes';

export {
  getAuditEntries,
  getFinancialYearRecords,
  getPortalSettings,
  getRoleRecords,
  getUserRecords,
} from './lib/administration-service';

export {
  PERMISSION_GROUPS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from './lib/administration-data';

export type {
  AdminUser,
  AuditAction,
  AuditEntry,
  FinancialYear,
  FinancialYearRecord,
  PortalSettings,
  RoleRecord,
  UserRecord,
  UserSession,
} from './types';
