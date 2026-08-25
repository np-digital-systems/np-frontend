export {
  UsersFeature,
  RolesFeature,
  AuditLogFeature,
  FinancialYearsFeature,
  SettingsFeature,
  ProfileFeature,
  SessionsFeature,
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
