import type {
  Account,
  BankAccount,
  Fund,
  Project,
  Voucher,
  VoucherActor,
} from '../types';

const YEAR_START = '2026-01-01T00:00:00';

export const ACCOUNTS: readonly Account[] = [
  // Groups
  { id: 100, code: '1000', name: 'Current Assets', nameTa: 'நடப்பு சொத்துக்கள்', type: 'asset', parentId: null, isActive: true, openingBalance: 0, createdAt: YEAR_START },
  { id: 120, code: '1200', name: 'Fixed Assets', nameTa: 'நிலையான சொத்துக்கள்', type: 'asset', parentId: null, isActive: true, openingBalance: 0, createdAt: YEAR_START },
  { id: 200, code: '2000', name: 'Current Liabilities', nameTa: 'நடப்பு பொறுப்புகள்', type: 'liability', parentId: null, isActive: true, openingBalance: 0, createdAt: YEAR_START },
  { id: 300, code: '3000', name: 'Funds & Reserves', nameTa: 'நிதிகள் மற்றும் இருப்புக்கள்', type: 'equity', parentId: null, isActive: true, openingBalance: 0, createdAt: YEAR_START },
  { id: 400, code: '4000', name: 'Income', nameTa: 'வருமானம்', type: 'income', parentId: null, isActive: true, openingBalance: 0, createdAt: YEAR_START },
  { id: 500, code: '5000', name: 'Expenditure', nameTa: 'செலவினம்', type: 'expense', parentId: null, isActive: true, openingBalance: 0, createdAt: YEAR_START },

  // Assets
  { id: 101, code: '1001', name: 'Cash in Hand', nameTa: 'கையிருப்பு பணம்', type: 'asset', parentId: 100, isActive: true, openingBalance: 96_000, createdAt: YEAR_START },
  { id: 102, code: '1002', name: 'Petty Cash', nameTa: 'சில்லறை பணம்', type: 'asset', parentId: 100, isActive: true, openingBalance: 13_000, createdAt: YEAR_START },
  { id: 103, code: '1101', name: "Bank — People's Bank Current", nameTa: 'மக்கள் வங்கி நடப்புக் கணக்கு', type: 'asset', parentId: 100, isActive: true, openingBalance: 385_000, createdAt: YEAR_START },
  { id: 104, code: '1102', name: 'Bank — Bank of Ceylon Savings', nameTa: 'இலங்கை வங்கி சேமிப்புக் கணக்கு', type: 'asset', parentId: 100, isActive: true, openingBalance: 96_000, createdAt: YEAR_START },
  { id: 105, code: '1103', name: 'Fixed Deposit — HNB', nameTa: 'நிலையான வைப்பு', type: 'asset', parentId: 100, isActive: true, openingBalance: 500_000, createdAt: YEAR_START },
  { id: 121, code: '1201', name: 'Temple Land & Buildings', nameTa: 'ஆலய நிலம் மற்றும் கட்டிடங்கள்', type: 'asset', parentId: 120, isActive: true, openingBalance: 7_800_000, createdAt: YEAR_START },
  { id: 122, code: '1202', name: 'Furniture & Fittings', nameTa: 'மரச்சாமான்கள்', type: 'asset', parentId: 120, isActive: true, openingBalance: 310_000, createdAt: YEAR_START },
  { id: 123, code: '1203', name: 'Vahanam & Temple Vessels', nameTa: 'வாகனங்கள் மற்றும் ஆலயப் பாத்திரங்கள்', type: 'asset', parentId: 120, isActive: true, openingBalance: 340_000, createdAt: YEAR_START },

  // Liabilities
  { id: 201, code: '2001', name: 'Sundry Payables', nameTa: 'பல்வேறு செலுத்தவேண்டியவை', type: 'liability', parentId: 200, isActive: true, openingBalance: 74_500, createdAt: YEAR_START },
  { id: 202, code: '2002', name: 'Advance Received', nameTa: 'முன்பணம் பெறப்பட்டது', type: 'liability', parentId: 200, isActive: true, openingBalance: 22_000, createdAt: YEAR_START },

  // Equity
  { id: 301, code: '3001', name: 'Temple Corpus Fund', nameTa: 'ஆலய மூலநிதி', type: 'equity', parentId: 300, isActive: true, openingBalance: 8_600_000, createdAt: YEAR_START },
  { id: 302, code: '3002', name: 'Accumulated Surplus', nameTa: 'திரட்டப்பட்ட மிகுதி', type: 'equity', parentId: 300, isActive: true, openingBalance: 1_021_950, createdAt: YEAR_START },

  // Income
  { id: 401, code: '4001', name: 'Hundial Collections', nameTa: 'உண்டியல் வருமானம்', type: 'income', parentId: 400, isActive: true, openingBalance: 0, createdAt: YEAR_START },
  { id: 402, code: '4002', name: 'Pooja Sponsorship', nameTa: 'பூஜை அனுசரணை', type: 'income', parentId: 400, isActive: true, openingBalance: 0, createdAt: YEAR_START },
  { id: 403, code: '4003', name: 'Annadhanam Donations', nameTa: 'அன்னதான நன்கொடை', type: 'income', parentId: 400, isActive: true, openingBalance: 0, createdAt: YEAR_START },
  { id: 404, code: '4004', name: 'Thiruppani Donations', nameTa: 'திருப்பணி நன்கொடை', type: 'income', parentId: 400, isActive: true, openingBalance: 0, createdAt: YEAR_START },
  { id: 405, code: '4005', name: 'Festival Donations', nameTa: 'திருவிழா நன்கொடை', type: 'income', parentId: 400, isActive: true, openingBalance: 0, createdAt: YEAR_START },
  { id: 406, code: '4006', name: 'Rent Income', nameTa: 'வாடகை வருமானம்', type: 'income', parentId: 400, isActive: true, openingBalance: 0, createdAt: YEAR_START },
  { id: 407, code: '4007', name: 'Fixed Deposit Interest', nameTa: 'வைப்பு வட்டி', type: 'income', parentId: 400, isActive: true, openingBalance: 0, createdAt: YEAR_START },

  // Expenditure
  { id: 501, code: '5001', name: 'Priest Honorarium', nameTa: 'குருக்கள் சம்பளம்', type: 'expense', parentId: 500, isActive: true, openingBalance: 0, createdAt: YEAR_START },
  { id: 502, code: '5002', name: 'Flowers & Pooja Materials', nameTa: 'மலர் மற்றும் பூஜைப் பொருட்கள்', type: 'expense', parentId: 500, isActive: true, openingBalance: 0, createdAt: YEAR_START },
  { id: 503, code: '5003', name: 'Melam & Nadaswaram', nameTa: 'மேளம் மற்றும் நாதஸ்வரம்', type: 'expense', parentId: 500, isActive: true, openingBalance: 0, createdAt: YEAR_START },
  { id: 504, code: '5004', name: 'Annadhanam Expenses', nameTa: 'அன்னதானச் செலவு', type: 'expense', parentId: 500, isActive: true, openingBalance: 0, createdAt: YEAR_START },
  { id: 505, code: '5005', name: 'Electricity', nameTa: 'மின் கட்டணம்', type: 'expense', parentId: 500, isActive: true, openingBalance: 0, createdAt: YEAR_START },
  { id: 506, code: '5006', name: 'Water', nameTa: 'நீர் கட்டணம்', type: 'expense', parentId: 500, isActive: true, openingBalance: 0, createdAt: YEAR_START },
  { id: 507, code: '5007', name: 'Maintenance & Repairs', nameTa: 'பராமரிப்பு மற்றும் திருத்தம்', type: 'expense', parentId: 500, isActive: true, openingBalance: 0, createdAt: YEAR_START },
  { id: 508, code: '5008', name: 'Festival Expenses', nameTa: 'திருவிழாச் செலவு', type: 'expense', parentId: 500, isActive: true, openingBalance: 0, createdAt: YEAR_START },
  { id: 509, code: '5009', name: 'Staff Salaries', nameTa: 'ஊழியர் சம்பளம்', type: 'expense', parentId: 500, isActive: true, openingBalance: 0, createdAt: YEAR_START },
  { id: 510, code: '5010', name: 'Printing & Stationery', nameTa: 'அச்சிடல் மற்றும் எழுதுபொருள்', type: 'expense', parentId: 500, isActive: false, openingBalance: 0, createdAt: YEAR_START },
];

export const FUNDS: readonly Fund[] = [
  { id: 1, name: 'General Temple Fund', nameTa: 'பொது ஆலய நிதி', opening: 180_000, income: 820_000, expenses: 465_000, isActive: true },
  { id: 2, name: 'Festival Fund', nameTa: 'திருவிழா நிதி', opening: 95_000, income: 1_075_000, expenses: 666_000, isActive: true },
  { id: 3, name: 'Thiruppani Fund', nameTa: 'திருப்பணி நிதி', opening: 240_000, income: 452_000, expenses: 268_000, isActive: true },
  { id: 4, name: 'Annadhanam Fund', nameTa: 'அன்னதான நிதி', opening: 60_000, income: 318_000, expenses: 265_000, isActive: true },
];

export const PROJECTS: readonly Project[] = [
  {
    id: 1,
    name: 'Annual Festival 2026',
    nameTa: 'ஆண்டு மகா திருவிழா 2026',
    fundId: 2,
    budget: 850_000,
    startDate: '2026-05-01',
    targetDate: '2026-07-15',
    status: 'active',
    description:
      'Twelve-day grand festival — melam, decorations, ther and annadhanam.',
    isActive: true,
  },
  {
    id: 2,
    name: 'Navarathiri 2026',
    nameTa: 'நவராத்திரி விழா 2026',
    fundId: 2,
    budget: 320_000,
    startDate: '2026-09-01',
    targetDate: '2026-10-20',
    status: 'active',
    description: 'Nine-day Navarathiri observance and Vijayadasami.',
    isActive: true,
  },
  {
    id: 3,
    name: 'Gopuram Thiruppani',
    nameTa: 'கோபுரத் திருப்பணி',
    fundId: 3,
    budget: 2_400_000,
    startDate: '2026-02-01',
    targetDate: '2027-06-30',
    status: 'active',
    description:
      'Rebuilding and repainting the main gopuram, in three contracted stages.',
    isActive: true,
  },
  {
    id: 4,
    name: 'Dining Hall Renovation',
    nameTa: 'உணவு மண்டப புனரமைப்பு',
    fundId: 3,
    budget: 680_000,
    startDate: '2026-07-01',
    targetDate: '2026-12-31',
    status: 'active',
    description: 'Flooring, wiring and seating for the annadhanam hall.',
    isActive: true,
  },
  {
    id: 5,
    name: 'Temple Well Restoration',
    nameTa: 'ஆலயக் கிணறு புனரமைப்பு',
    fundId: 3,
    budget: 240_000,
    startDate: '2025-11-01',
    targetDate: '2026-03-31',
    status: 'completed',
    description: 'Desilting and re-lining the temple well. Completed March 2026.',
    isActive: false,
  },
  {
    id: 6,
    name: 'Vahanam Restoration',
    nameTa: 'வாகனப் புனரமைப்பு',
    fundId: 3,
    budget: null,
    startDate: '2026-08-01',
    targetDate: null,
    status: 'on-hold',
    description:
      'Silver work on the temple vahanams. Held pending a craftsman’s quotation.',
    isActive: false,
  },
];

export const BANK_ACCOUNTS: readonly BankAccount[] = [
  {
    id: 1,
    label: "People's Bank — Current",
    bankName: "People's Bank",
    branch: 'Nallur',
    accountNumber: '•••• •••• 4521',
    type: 'current',
    openingBalance: 385_000,
    isActive: true,
    openedOn: '2019-04-12',
    ledgerAccountId: 103,
  },
  {
    id: 2,
    label: 'Bank of Ceylon — Savings',
    bankName: 'Bank of Ceylon',
    branch: 'Jaffna Main',
    accountNumber: '•••• •••• 7788',
    type: 'savings',
    openingBalance: 96_000,
    isActive: true,
    openedOn: '2021-08-03',
    ledgerAccountId: 104,
  },
  {
    id: 3,
    label: 'HNB — Fixed Deposit',
    bankName: 'Hatton National Bank',
    branch: 'Colombo 06',
    accountNumber: '•••• •••• 9012',
    type: 'fixed-deposit',
    openingBalance: 500_000,
    isActive: true,
    openedOn: '2024-01-15',
    ledgerAccountId: 105,
  },
  {
    id: 4,
    label: 'Sampath Bank — Old Current',
    bankName: 'Sampath Bank',
    branch: 'Chunnakam',
    accountNumber: '•••• •••• 3140',
    type: 'current',
    openingBalance: 0,
    isActive: false,
    openedOn: '2016-06-20',
    ledgerAccountId: 103,
  },
];

const CASHIER: VoucherActor = { id: 'usr_014', name: 'R. Murugan' };
const ACCOUNTANT: VoucherActor = { id: 'usr_009', name: 'S. Vijayan' };
const ADMIN: VoucherActor = { id: 'usr_002', name: 'K. Suresh' };
const ME: VoucherActor = { id: 'usr_001', name: 'You' };

type VoucherSeed = Omit<
  Voucher,
  | 'notes'
  | 'eventRef'
  | 'projectId'
  | 'bankAccountId'
  | 'chequeNo'
  | 'submittedAt'
  | 'decidedBy'
  | 'decidedAt'
  | 'rejectionReason'
  | 'postedAt'
> &
  Partial<Voucher>;

function voucher(seed: VoucherSeed): Voucher {
  const settled = seed.status === 'Approved' || seed.status === 'Posted';

  return {
    projectId: null,
    bankAccountId: null,
    chequeNo: null,
    eventRef: null,
    notes: null,
    submittedAt: seed.status === 'Draft' ? null : `${seed.date}T10:00:00`,
    decidedBy: settled || seed.status === 'Rejected' ? ACCOUNTANT : null,
    decidedAt:
      settled || seed.status === 'Rejected' ? `${seed.date}T15:30:00` : null,
    rejectionReason: null,
    postedAt: seed.status === 'Posted' ? `${seed.date}T16:00:00` : null,
    ...seed,
  };
}

export const VOUCHERS: readonly Voucher[] = [
  voucher({ id: 1, ref: 'RV-2026-0101', kind: 'receipt', date: '2026-01-09', description: 'Hundial collection — January week 1', amount: 42_500, accountId: 401, fundId: 1, mode: 'cash', party: 'Hundial', status: 'Posted', createdBy: CASHIER, createdAt: '2026-01-09T08:00:00' }),
  voucher({ id: 2, ref: 'RV-2026-0102', kind: 'receipt', date: '2026-01-16', description: 'Friday pooja sponsorship', amount: 15_000, accountId: 402, fundId: 1, mode: 'cash', party: 'ஸ்ரீ நந்திகேஸ்வரர் மன்றம்', eventRef: 'வெள்ளிக்கிழமை பூஜை — Week 2', status: 'Posted', createdBy: CASHIER, createdAt: '2026-01-16T09:15:00' }),
  voucher({ id: 3, ref: 'PV-2026-0051', kind: 'payment', date: '2026-01-20', description: 'Priest honorarium — January', amount: 24_000, accountId: 501, fundId: 1, mode: 'bank', bankAccountId: 1, chequeNo: '004512', party: 'சிவஸ்ரீ க. சர்மா', status: 'Posted', createdBy: ACCOUNTANT, createdAt: '2026-01-20T11:00:00' }),
  voucher({ id: 4, ref: 'PV-2026-0052', kind: 'payment', date: '2026-01-27', description: 'Electricity bill — December', amount: 12_400, accountId: 505, fundId: 1, mode: 'bank', bankAccountId: 1, chequeNo: '004513', party: 'Ceylon Electricity Board', status: 'Posted', createdBy: CASHIER, createdAt: '2026-01-27T14:20:00' }),
  voucher({ id: 5, ref: 'RV-2026-0108', kind: 'receipt', date: '2026-02-14', description: 'Pradosham pooja sponsorship', amount: 8_500, accountId: 402, fundId: 1, mode: 'cash', party: 'ஸ்ரீ நந்திகேஸ்வரர் மன்றம்', eventRef: 'பிரதோஷ பூஜை — Valarpirai', status: 'Posted', createdBy: CASHIER, createdAt: '2026-02-14T17:00:00' }),
  voucher({ id: 6, ref: 'RV-2026-0112', kind: 'receipt', date: '2026-03-02', description: 'Thiruppani donation — Gopuram', amount: 150_000, accountId: 404, fundId: 3, projectId: 3, mode: 'bank', bankAccountId: 1, party: 'கார்த்திகேயன் அறக்கட்டளை', status: 'Posted', createdBy: ACCOUNTANT, createdAt: '2026-03-02T10:30:00' }),
  voucher({ id: 7, ref: 'PV-2026-0058', kind: 'payment', date: '2026-03-11', description: 'Gopuram masonry — first instalment', amount: 185_000, accountId: 507, fundId: 3, projectId: 3, mode: 'cheque', bankAccountId: 1, chequeNo: '004531', party: 'Sivam Constructions', status: 'Posted', createdBy: ACCOUNTANT, createdAt: '2026-03-11T09:00:00' }),
  voucher({ id: 8, ref: 'RV-2026-0118', kind: 'receipt', date: '2026-04-06', description: 'Annadhanam donation — Chithirai', amount: 65_000, accountId: 403, fundId: 4, mode: 'cash', party: 'திருமதி. ஜெகதீஸ்வரி நடராஜா', status: 'Posted', createdBy: CASHIER, createdAt: '2026-04-06T12:00:00' }),
  voucher({ id: 9, ref: 'PV-2026-0063', kind: 'payment', date: '2026-04-14', description: 'Annadhanam provisions — Chithirai', amount: 48_200, accountId: 504, fundId: 4, mode: 'cash', party: 'Jaffna Wholesale Stores', status: 'Posted', createdBy: CASHIER, createdAt: '2026-04-14T08:45:00' }),
  voucher({ id: 10, ref: 'RV-2026-0121', kind: 'receipt', date: '2026-05-31', description: 'Vaikasi Visakam special pooja sponsorship', amount: 45_000, accountId: 402, fundId: 2, projectId: 1, mode: 'bank', bankAccountId: 1, party: 'செல்வி. அபிராமி இராமநாதன்', eventRef: 'வைகாசி விசாக சிறப்பு பூஜை', status: 'Posted', createdBy: CASHIER, createdAt: '2026-05-31T07:30:00' }),
  voucher({ id: 11, ref: 'RV-2026-0126', kind: 'receipt', date: '2026-06-15', description: 'Festival donation — Kodiyetram day', amount: 120_000, accountId: 405, fundId: 2, projectId: 1, mode: 'cash', party: 'Devotees — festival collection', eventRef: 'ஆண்டு மகா திருவிழா — கொடியேற்றம்', status: 'Posted', createdBy: CASHIER, createdAt: '2026-06-15T13:00:00' }),
  voucher({ id: 12, ref: 'PV-2026-0071', kind: 'payment', date: '2026-06-18', description: 'Melam & Nadaswaram — festival week', amount: 96_000, accountId: 503, fundId: 2, projectId: 1, mode: 'cash', party: 'Nallur Melam Group', eventRef: 'ஆண்டு மகா திருவிழா', status: 'Posted', createdBy: ACCOUNTANT, createdAt: '2026-06-18T10:00:00' }),
  voucher({ id: 13, ref: 'RV-2026-0129', kind: 'receipt', date: '2026-06-25', description: 'Ther thiruvizha sponsorship', amount: 85_000, accountId: 402, fundId: 2, projectId: 1, mode: 'bank', bankAccountId: 1, party: 'செல்வி. அபிராமி இராமநாதன்', eventRef: 'ஆண்டு மகா திருவிழா — தேர்த் திருவிழா', status: 'Posted', createdBy: CASHIER, createdAt: '2026-06-25T06:30:00' }),
  voucher({ id: 14, ref: 'PV-2026-0074', kind: 'payment', date: '2026-06-26', description: 'Festival decorations and lighting', amount: 74_500, accountId: 508, fundId: 2, projectId: 1, mode: 'cheque', bankAccountId: 1, chequeNo: '004566', party: 'Sri Lakshmi Decorators', status: 'Posted', createdBy: CASHIER, createdAt: '2026-06-26T09:00:00' }),
  voucher({ id: 15, ref: 'RV-2026-0134', kind: 'receipt', date: '2026-07-04', description: 'Rent — temple shop units, Q2', amount: 42_000, accountId: 406, fundId: 1, mode: 'bank', bankAccountId: 2, party: 'Nallur Traders', status: 'Posted', createdBy: ACCOUNTANT, createdAt: '2026-07-04T11:15:00' }),
  voucher({ id: 16, ref: 'RV-2026-0136', kind: 'receipt', date: '2026-07-15', description: 'Fixed deposit interest — Q2', amount: 12_450, accountId: 407, fundId: 1, mode: 'bank', bankAccountId: 3, party: 'Hatton National Bank', status: 'Posted', createdBy: ACCOUNTANT, createdAt: '2026-07-15T10:00:00' }),
  voucher({ id: 17, ref: 'PV-2026-0079', kind: 'payment', date: '2026-07-20', description: 'Priest honorarium — July', amount: 24_000, accountId: 501, fundId: 1, mode: 'bank', bankAccountId: 1, chequeNo: '004588', party: 'சிவஸ்ரீ க. சர்மா', status: 'Posted', createdBy: ACCOUNTANT, createdAt: '2026-07-20T11:00:00' }),
  voucher({ id: 18, ref: 'PV-2026-0081', kind: 'payment', date: '2026-07-28', description: 'Water bill — June & July', amount: 6_800, accountId: 506, fundId: 1, mode: 'cash', party: 'National Water Supply Board', status: 'Posted', createdBy: CASHIER, createdAt: '2026-07-28T15:00:00' }),
  voucher({ id: 19, ref: 'RV-2026-0141', kind: 'receipt', date: '2026-08-07', description: 'Hundial collection — August week 1', amount: 38_600, accountId: 401, fundId: 1, mode: 'cash', party: 'Hundial', status: 'Posted', createdBy: CASHIER, createdAt: '2026-08-07T08:00:00' }),
  voucher({ id: 20, ref: 'PV-2026-0084', kind: 'payment', date: '2026-08-10', description: 'Flowers and pooja materials — August', amount: 18_400, accountId: 502, fundId: 1, mode: 'cash', party: 'Flower Mart, Nallur', status: 'Posted', createdBy: CASHIER, createdAt: '2026-08-10T07:00:00' }),
  voucher({ id: 21, ref: 'RV-2026-0143', kind: 'receipt', date: '2026-08-14', description: 'Annadhanam donation — Aadi', amount: 35_000, accountId: 403, fundId: 4, mode: 'cash', party: 'ம. கணேசன் மற்றும் குடும்பத்தினர்', status: 'Posted', createdBy: ME, createdAt: '2026-08-14T12:30:00' }),

  // Live queue — everything below is still moving through the chain.
  voucher({ id: 22, ref: 'RV-2026-0145', kind: 'receipt', date: '2026-08-18', description: 'Navarathiri sponsorship — day 3', amount: 25_000, accountId: 402, fundId: 2, projectId: 2, mode: 'bank', bankAccountId: 1, party: 'சிவஸ்ரீ குடும்பம்', eventRef: 'நவராத்திரி விழா — மூன்றாம் நாள் பூஜை', status: 'Pending Approval', createdBy: CASHIER, createdAt: '2026-08-18T10:20:00' }),
  voucher({ id: 23, ref: 'PV-2026-0087', kind: 'payment', date: '2026-08-18', description: 'Melam advance — Navarathiri', amount: 15_000, accountId: 503, fundId: 2, projectId: 2, mode: 'cash', party: 'Nallur Melam Group', status: 'Pending Approval', createdBy: CASHIER, createdAt: '2026-08-18T11:05:00' }),
  voucher({ id: 24, ref: 'PV-2026-0088', kind: 'payment', date: '2026-08-19', description: 'Dining hall — flooring materials', amount: 82_000, accountId: 507, fundId: 3, projectId: 4, mode: 'cheque', bankAccountId: 1, chequeNo: '004601', party: 'Jaffna Hardware', status: 'Pending Approval', createdBy: ACCOUNTANT, createdAt: '2026-08-19T09:40:00' }),
  voucher({ id: 25, ref: 'RV-2026-0147', kind: 'receipt', date: '2026-08-19', description: 'Thiruppani donation — Gopuram, second tranche', amount: 95_000, accountId: 404, fundId: 3, projectId: 3, mode: 'bank', bankAccountId: 1, party: 'கார்த்திகேயன் அறக்கட்டளை', status: 'Pending Approval', createdBy: ME, createdAt: '2026-08-19T14:10:00' }),
  voucher({ id: 26, ref: 'PV-2026-0089', kind: 'payment', date: '2026-08-20', description: 'Staff salaries — August', amount: 28_000, accountId: 509, fundId: 1, mode: 'bank', bankAccountId: 1, chequeNo: '004602', party: 'Temple staff', status: 'Approved', createdBy: ACCOUNTANT, createdAt: '2026-08-20T09:00:00' }),
  voucher({ id: 27, ref: 'RV-2026-0149', kind: 'receipt', date: '2026-08-20', description: 'Archanai ticket collection — week', amount: 18_900, accountId: 401, fundId: 1, mode: 'cash', party: 'Archanai counter', status: 'Approved', createdBy: CASHIER, createdAt: '2026-08-20T18:00:00' }),
  voucher({ id: 28, ref: 'PV-2026-0090', kind: 'payment', date: '2026-08-20', description: 'Generator repair — sanctum', amount: 34_500, accountId: 507, fundId: 1, mode: 'cash', party: 'Ravi Electricals', status: 'Rejected', createdBy: CASHIER, createdAt: '2026-08-20T10:15:00', rejectionReason: 'Quotation not attached. Please attach the vendor quotation and resubmit.' }),
  voucher({ id: 29, ref: 'RV-2026-0150', kind: 'receipt', date: '2026-08-21', description: 'Hundial collection — August week 3', amount: 31_200, accountId: 401, fundId: 1, mode: 'cash', party: 'Hundial', status: 'Draft', createdBy: ME, createdAt: '2026-08-21T08:10:00' }),
  voucher({ id: 30, ref: 'PV-2026-0091', kind: 'payment', date: '2026-08-21', description: 'Printing — Navarathiri notices', amount: 9_600, accountId: 510, fundId: 2, projectId: 2, mode: 'cash', party: 'Sakthi Printers', status: 'Draft', createdBy: ME, createdAt: '2026-08-21T09:30:00' }),
  voucher({ id: 31, ref: 'PV-2026-0092', kind: 'payment', date: '2026-08-21', description: 'Annadhanam provisions — Aadi Velli', amount: 22_800, accountId: 504, fundId: 4, mode: 'cash', party: 'Jaffna Wholesale Stores', status: 'Draft', createdBy: CASHIER, createdAt: '2026-08-21T10:45:00' }),
  voucher({ id: 32, ref: 'RV-2026-0151', kind: 'receipt', date: '2026-08-12', description: 'Festival donation — advance pledge', amount: 55_000, accountId: 405, fundId: 2, projectId: 1, mode: 'online', party: 'ஸ்ரீ நந்திகேஸ்வரர் மன்றம்', status: 'Cancelled', createdBy: ADMIN, createdAt: '2026-08-12T16:00:00', notes: 'Pledge withdrawn by the donor; a fresh receipt will be raised in September.' }),
];

export const CASH_ACCOUNT_ID = 101;
