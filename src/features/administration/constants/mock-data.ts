import type {
  AdminUser,
  AuditEntry,
  FinancialYear,
  PortalSettings,
  UserSession,
} from '../types';

/**
 * Placeholder data for the administration module.
 *
 * Shaped like the `users`, `user_sessions`, `audit_log`, `financial_years`
 * and settings tables. Password hashes and refresh-token hashes are
 * deliberately absent: they have no business leaving the server, so there is
 * nowhere in this module for them to leak from.
 */

/* -------------------------------------------------------------------------
   users
   ------------------------------------------------------------------------- */

export const ADMIN_USERS: readonly AdminUser[] = [
  {
    id: 'usr_001',
    fullName: 'K. Suresh',
    nameTa: 'கு. சுரேஷ்',
    email: 'suresh@neeliyampathipillaiyarkovil.com',
    phone: '077 234 5678',
    address: 'நல்லூர், யாழ்ப்பாணம்',
    role: 'admin',
    isActive: true,
    lastLoginAt: '2026-08-21T08:15:00',
    createdAt: '2024-01-10T09:00:00',
  },
  {
    id: 'usr_002',
    fullName: 'E. Senthilkumar',
    nameTa: 'எ. செந்தில்குமார்',
    email: 'senthil@neeliyampathipillaiyarkovil.com',
    phone: '077 123 4567',
    address: 'திருநெல்வேலி, யாழ்ப்பாணம்',
    role: 'admin',
    isActive: true,
    lastLoginAt: '2026-08-20T17:40:00',
    createdAt: '2024-01-10T09:05:00',
  },
  {
    id: 'usr_009',
    fullName: 'S. Vijayan',
    nameTa: 'சி. விஜயன்',
    email: 'vijayan@neeliyampathipillaiyarkovil.com',
    phone: '077 987 6543',
    address: 'கோண்டாவில், யாழ்ப்பாணம்',
    role: 'accountant',
    isActive: true,
    lastLoginAt: '2026-08-21T07:50:00',
    createdAt: '2024-02-02T10:30:00',
  },
  {
    id: 'usr_012',
    fullName: 'P. Kamaladevi',
    nameTa: 'ப. கமலாதேவி',
    email: 'kamala@neeliyampathipillaiyarkovil.com',
    phone: '071 555 2020',
    address: 'சுன்னாகம்',
    role: 'accountant',
    isActive: true,
    lastLoginAt: '2026-08-19T14:05:00',
    createdAt: '2025-03-18T11:00:00',
  },
  {
    id: 'usr_014',
    fullName: 'R. Murugan',
    nameTa: 'ரா. முருகன்',
    email: 'murugan@neeliyampathipillaiyarkovil.com',
    phone: '077 456 7891',
    address: 'மானிப்பாய்',
    role: 'cashier',
    isActive: true,
    lastLoginAt: '2026-08-21T06:30:00',
    createdAt: '2024-04-05T08:00:00',
  },
  {
    id: 'usr_017',
    fullName: 'T. Sasikala',
    nameTa: 'தி. சசிகலா',
    email: 'sasikala@neeliyampathipillaiyarkovil.com',
    phone: '076 303 4040',
    address: 'கொக்குவில்',
    role: 'cashier',
    isActive: true,
    lastLoginAt: '2026-08-18T18:20:00',
    createdAt: '2025-06-11T09:15:00',
  },
  {
    id: 'usr_021',
    fullName: 'A. Shanmugam',
    nameTa: 'அ. சண்முகம்',
    email: 'shanmugam@example.com',
    phone: '077 808 1212',
    address: 'உரும்பிராய்',
    role: 'user',
    isActive: true,
    lastLoginAt: '2026-08-15T20:10:00',
    createdAt: '2025-09-01T12:00:00',
  },
  {
    id: 'usr_022',
    fullName: 'M. Thevarajah',
    nameTa: 'மு. தேவராஜா',
    email: 'thevarajah@example.com',
    phone: '075 616 7171',
    address: 'சாவகச்சேரி',
    role: 'user',
    isActive: true,
    lastLoginAt: null,
    createdAt: '2026-08-14T10:45:00',
  },
  {
    id: 'usr_007',
    fullName: 'N. Ravindran',
    nameTa: 'ந. ரவீந்திரன்',
    email: 'ravindran@neeliyampathipillaiyarkovil.com',
    phone: '077 191 8181',
    address: 'பருத்தித்துறை',
    role: 'cashier',
    isActive: false,
    lastLoginAt: '2025-12-20T16:00:00',
    createdAt: '2024-03-01T09:00:00',
  },
];

/* -------------------------------------------------------------------------
   user_sessions

   Only the metadata a person needs to recognise and revoke a session. The
   refresh-token hash stays in the database.
   ------------------------------------------------------------------------- */

export const USER_SESSIONS: readonly UserSession[] = [
  { id: 'ses_01', userId: 'usr_001', deviceName: 'Chrome on macOS', ipAddress: '192.168.1.100', createdAt: '2026-08-21T08:15:00', expiresAt: '2026-09-20T08:15:00', revokedAt: null },
  { id: 'ses_02', userId: 'usr_001', deviceName: 'Safari on iPhone', ipAddress: '203.115.24.88', createdAt: '2026-08-19T19:02:00', expiresAt: '2026-09-18T19:02:00', revokedAt: null },
  { id: 'ses_03', userId: 'usr_009', deviceName: 'Chrome on Windows', ipAddress: '192.168.1.104', createdAt: '2026-08-21T07:50:00', expiresAt: '2026-09-20T07:50:00', revokedAt: null },
  { id: 'ses_04', userId: 'usr_014', deviceName: 'Temple counter PC', ipAddress: '192.168.1.112', createdAt: '2026-08-21T06:30:00', expiresAt: '2026-09-20T06:30:00', revokedAt: null },
  { id: 'ses_05', userId: 'usr_014', deviceName: 'Chrome on Android', ipAddress: '203.115.24.91', createdAt: '2026-08-17T12:40:00', expiresAt: '2026-09-16T12:40:00', revokedAt: null },
  { id: 'ses_06', userId: 'usr_012', deviceName: 'Firefox on Windows', ipAddress: '192.168.1.118', createdAt: '2026-08-19T14:05:00', expiresAt: '2026-09-18T14:05:00', revokedAt: null },
  { id: 'ses_07', userId: 'usr_002', deviceName: 'Chrome on Windows', ipAddress: '192.168.1.101', createdAt: '2026-08-20T17:40:00', expiresAt: '2026-09-19T17:40:00', revokedAt: null },
  { id: 'ses_08', userId: 'usr_017', deviceName: 'Temple counter PC', ipAddress: '192.168.1.112', createdAt: '2026-08-18T18:20:00', expiresAt: '2026-09-17T18:20:00', revokedAt: null },
  { id: 'ses_09', userId: 'usr_007', deviceName: 'Chrome on Windows', ipAddress: '192.168.1.109', createdAt: '2025-12-20T16:00:00', expiresAt: '2026-01-19T16:00:00', revokedAt: '2026-01-02T09:00:00' },
];

/* -------------------------------------------------------------------------
   audit_log
   ------------------------------------------------------------------------- */

export const AUDIT_ENTRIES: readonly AuditEntry[] = [
  { id: 1, at: '2026-08-21T10:45:00', actorId: 'usr_014', actorName: 'R. Murugan', actorRole: 'cashier', action: 'create', entity: 'Payment Voucher', entityRef: 'PV-2026-0092', summary: 'Drafted annadhanam provisions for Aadi Velli, ₹22,800', ipAddress: '192.168.1.112' },
  { id: 2, at: '2026-08-21T09:30:00', actorId: 'usr_001', actorName: 'K. Suresh', actorRole: 'admin', action: 'create', entity: 'Payment Voucher', entityRef: 'PV-2026-0091', summary: 'Drafted printing for Navarathiri notices, ₹9,600', ipAddress: '192.168.1.100' },
  { id: 3, at: '2026-08-21T08:15:00', actorId: 'usr_001', actorName: 'K. Suresh', actorRole: 'admin', action: 'login', entity: 'Session', entityRef: null, summary: 'Signed in from Chrome on macOS', ipAddress: '192.168.1.100' },
  { id: 4, at: '2026-08-21T08:10:00', actorId: 'usr_001', actorName: 'K. Suresh', actorRole: 'admin', action: 'create', entity: 'Receipt Voucher', entityRef: 'RV-2026-0150', summary: 'Drafted hundial collection for August week 3, ₹31,200', ipAddress: '192.168.1.100' },
  { id: 5, at: '2026-08-21T07:50:00', actorId: 'usr_009', actorName: 'S. Vijayan', actorRole: 'accountant', action: 'login', entity: 'Session', entityRef: null, summary: 'Signed in from Chrome on Windows', ipAddress: '192.168.1.104' },
  { id: 6, at: '2026-08-20T18:05:00', actorId: 'usr_009', actorName: 'S. Vijayan', actorRole: 'accountant', action: 'approve', entity: 'Receipt Voucher', entityRef: 'RV-2026-0149', summary: 'Approved archanai ticket collection, ₹18,900', ipAddress: '192.168.1.104' },
  { id: 7, at: '2026-08-20T15:30:00', actorId: 'usr_009', actorName: 'S. Vijayan', actorRole: 'accountant', action: 'reject', entity: 'Payment Voucher', entityRef: 'PV-2026-0090', summary: 'Rejected generator repair — quotation not attached', ipAddress: '192.168.1.104' },
  { id: 8, at: '2026-08-20T11:20:00', actorId: 'usr_001', actorName: 'K. Suresh', actorRole: 'admin', action: 'update', entity: 'Event', entityRef: 'நவராத்திரி விழா — Day 9', summary: 'Changed Vijayadasami start time to 5:00 PM', ipAddress: '192.168.1.100' },
  { id: 9, at: '2026-08-20T09:05:00', actorId: 'usr_009', actorName: 'S. Vijayan', actorRole: 'accountant', action: 'create', entity: 'Payment Voucher', entityRef: 'PV-2026-0089', summary: 'Drafted staff salaries for August, ₹28,000', ipAddress: '192.168.1.104' },
  { id: 10, at: '2026-08-19T16:45:00', actorId: 'usr_001', actorName: 'K. Suresh', actorRole: 'admin', action: 'permission-change', entity: 'Role', entityRef: 'cashier', summary: 'Granted payment-voucher:create to the cashier role', ipAddress: '192.168.1.100' },
  { id: 11, at: '2026-08-19T14:10:00', actorId: 'usr_001', actorName: 'K. Suresh', actorRole: 'admin', action: 'create', entity: 'Receipt Voucher', entityRef: 'RV-2026-0147', summary: 'Drafted gopuram thiruppani donation, ₹95,000', ipAddress: '192.168.1.100' },
  { id: 12, at: '2026-08-19T14:05:00', actorId: 'usr_012', actorName: 'P. Kamaladevi', actorRole: 'accountant', action: 'login', entity: 'Session', entityRef: null, summary: 'Signed in from Firefox on Windows', ipAddress: '192.168.1.118' },
  { id: 13, at: '2026-08-19T09:40:00', actorId: 'usr_009', actorName: 'S. Vijayan', actorRole: 'accountant', action: 'create', entity: 'Payment Voucher', entityRef: 'PV-2026-0088', summary: 'Drafted dining hall flooring materials, ₹82,000', ipAddress: '192.168.1.104' },
  { id: 14, at: '2026-08-18T17:30:00', actorId: 'usr_001', actorName: 'K. Suresh', actorRole: 'admin', action: 'create', entity: 'User', entityRef: 'usr_022', summary: 'Created devotee account for M. Thevarajah', ipAddress: '192.168.1.100' },
  { id: 15, at: '2026-08-18T11:05:00', actorId: 'usr_014', actorName: 'R. Murugan', actorRole: 'cashier', action: 'create', entity: 'Payment Voucher', entityRef: 'PV-2026-0087', summary: 'Drafted melam advance for Navarathiri, ₹15,000', ipAddress: '192.168.1.112' },
  { id: 16, at: '2026-08-18T10:20:00', actorId: 'usr_014', actorName: 'R. Murugan', actorRole: 'cashier', action: 'create', entity: 'Receipt Voucher', entityRef: 'RV-2026-0145', summary: 'Drafted Navarathiri day 3 sponsorship, ₹25,000', ipAddress: '192.168.1.112' },
  { id: 17, at: '2026-08-17T15:00:00', actorId: 'usr_001', actorName: 'K. Suresh', actorRole: 'admin', action: 'update', entity: 'Asset', entityRef: 'EQ-001', summary: 'Marked diesel generator as under repair', ipAddress: '192.168.1.100' },
  { id: 18, at: '2026-08-14T12:30:00', actorId: 'usr_001', actorName: 'K. Suresh', actorRole: 'admin', action: 'post', entity: 'Receipt Voucher', entityRef: 'RV-2026-0143', summary: 'Posted Aadi annadhanam donation to the ledger, ₹35,000', ipAddress: '192.168.1.100' },
  { id: 19, at: '2026-08-12T16:00:00', actorId: 'usr_002', actorName: 'E. Senthilkumar', actorRole: 'admin', action: 'delete', entity: 'Receipt Voucher', entityRef: 'RV-2026-0151', summary: 'Cancelled festival pledge — donor withdrew', ipAddress: '192.168.1.101' },
  { id: 20, at: '2026-08-10T07:15:00', actorId: 'usr_014', actorName: 'R. Murugan', actorRole: 'cashier', action: 'create', entity: 'Payment Voucher', entityRef: 'PV-2026-0084', summary: 'Drafted flowers and pooja materials for August, ₹18,400', ipAddress: '192.168.1.112' },
];

/* -------------------------------------------------------------------------
   financial_years
   ------------------------------------------------------------------------- */

export const FINANCIAL_YEARS: readonly FinancialYear[] = [
  {
    id: 3,
    label: '2027',
    startsOn: '2027-01-01',
    endsOn: '2027-12-31',
    status: 'upcoming',
    isCurrent: false,
    closedOn: null,
    closedBy: null,
    openingBalance: 0,
    income: 0,
    expenses: 0,
    voucherCount: 0,
  },
  {
    id: 2,
    label: '2026',
    startsOn: '2026-01-01',
    endsOn: '2026-12-31',
    status: 'open',
    isCurrent: true,
    closedOn: null,
    closedBy: null,
    openingBalance: 575_000,
    income: 659_050,
    expenses: 489_300,
    voucherCount: 21,
  },
  {
    id: 1,
    label: '2025',
    startsOn: '2025-01-01',
    endsOn: '2025-12-31',
    status: 'closed',
    isCurrent: false,
    closedOn: '2026-01-31',
    closedBy: 'K. Suresh',
    openingBalance: 412_000,
    income: 3_100_000,
    expenses: 1_980_000,
    voucherCount: 186,
  },
];

/* -------------------------------------------------------------------------
   settings
   ------------------------------------------------------------------------- */

export const PORTAL_SETTINGS: PortalSettings = {
  temple: {
    name: 'Neeliyampathi Pillaiyar Kovil',
    nameTa: 'நீலியம்பதி பிள்ளையார் கோவில்',
    registrationNo: 'JF/RT/2004/118',
    address: 'நல்லூர் வீதி, யாழ்ப்பாணம், இலங்கை',
    phone: '021 222 3344',
    email: 'info@neeliyampathipillaiyarkovil.com',
    website: 'www.neeliyampathipillaiyarkovil.com',
  },
  locale: {
    defaultLanguage: 'ta',
    timeZone: 'Asia/Colombo',
    currency: 'INR',
    dateFormat: 'dd-mon-yyyy',
  },
  accounting: {
    receiptPrefix: 'RV',
    paymentPrefix: 'PV',
    yearStartMonth: 1,
    approvalThreshold: 50_000,
    requireSeparatePoster: true,
  },
  notifications: {
    voucherSubmitted: true,
    voucherApproved: true,
    voucherRejected: true,
    depositMaturing: true,
    sanththaArrears: true,
    eventReminders: false,
  },
};
