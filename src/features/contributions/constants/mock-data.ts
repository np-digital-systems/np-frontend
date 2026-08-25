import type { SanththaMember, SanththaPayment } from '../types';

export const SANTHTHA_MEMBERS: readonly SanththaMember[] = [
  { id: 1, memberNo: 'S-001', fullName: 'M. Ganesan & Family', nameTa: 'ம. கணேசன் மற்றும் குடும்பத்தினர்', phone: '077 111 2222', address: 'நல்லூர், யாழ்ப்பாணம்', subscriptionAmount: 1_500, frequency: 'monthly', joinedOn: '2018-04-01', status: 'active', notes: null },
  { id: 2, memberNo: 'S-002', fullName: 'Abirami Ramanathan', nameTa: 'செல்வி. அபிராமி இராமநாதன்', phone: '077 333 4444', address: 'வெள்ளவத்தை, கொழும்பு', subscriptionAmount: 18_000, frequency: 'annual', joinedOn: '2019-01-15', status: 'active', notes: 'Pays the full year each Thai month.' },
  { id: 3, memberNo: 'S-003', fullName: 'Jagadheswari Nadaraja', nameTa: 'திருமதி. ஜெகதீஸ்வரி நடராஜா', phone: '071 666 7777', address: 'மட்டக்களப்பு நகர்', subscriptionAmount: 1_000, frequency: 'monthly', joinedOn: '2020-06-01', status: 'active', notes: null },
  { id: 4, memberNo: 'S-004', fullName: 'Karthikeyan Trust', nameTa: 'கார்த்திகேயன் அறக்கட்டளை', phone: '021 222 9999', address: 'பருத்தித்துறை', subscriptionAmount: 60_000, frequency: 'annual', joinedOn: '2016-09-10', status: 'active', notes: 'Trust subscription, settled at the start of the year.' },
  { id: 5, memberNo: 'S-005', fullName: 'Sivashri Family', nameTa: 'சிவஸ்ரீ குடும்பம்', phone: '077 555 8888', address: 'திருநெல்வேலி, யாழ்ப்பாணம்', subscriptionAmount: 2_000, frequency: 'monthly', joinedOn: '2017-02-20', status: 'active', notes: null },
  { id: 6, memberNo: 'S-006', fullName: 'Sri Nandikeswarar Mandram', nameTa: 'ஸ்ரீ நந்திகேஸ்வரர் மன்றம்', phone: '072 444 5555', address: 'கொழும்பு 06', subscriptionAmount: 36_000, frequency: 'annual', joinedOn: '2015-05-05', status: 'active', notes: null },
  { id: 7, memberNo: 'S-007', fullName: 'T. Rajendran', nameTa: 'தி. ராஜேந்திரன்', phone: '077 909 1010', address: 'கோண்டாவில், யாழ்ப்பாணம்', subscriptionAmount: 750, frequency: 'monthly', joinedOn: '2021-11-01', status: 'active', notes: null },
  { id: 8, memberNo: 'S-008', fullName: 'Vasanthi Sivalingam', nameTa: 'வசந்தி சிவலிங்கம்', phone: '076 202 3030', address: 'சுன்னாகம்', subscriptionAmount: 1_200, frequency: 'monthly', joinedOn: '2022-03-15', status: 'active', notes: 'Away since June; family to settle on return.' },
  { id: 9, memberNo: 'S-009', fullName: 'K. Balasubramaniam', nameTa: 'க. பாலசுப்ரமணியம்', phone: '075 404 5050', address: 'சாவகச்சேரி', subscriptionAmount: 12_000, frequency: 'annual', joinedOn: '2019-08-22', status: 'active', notes: null },
  { id: 10, memberNo: 'S-010', fullName: 'Meena Kandasamy', nameTa: 'மீனா கந்தசாமி', phone: '077 606 7070', address: 'மானிப்பாய்', subscriptionAmount: 1_000, frequency: 'monthly', joinedOn: '2023-01-10', status: 'lapsed', notes: 'No payment since October 2025.' },
  { id: 11, memberNo: 'S-011', fullName: 'S. Thavarajah', nameTa: 'சி. தவராஜா', phone: '071 808 9090', address: 'உரும்பிராய்', subscriptionAmount: 24_000, frequency: 'annual', joinedOn: '2014-07-01', status: 'inactive', notes: 'Moved abroad in 2025; membership held open at the family’s request.' },
  { id: 12, memberNo: 'S-012', fullName: 'Nirmala Sundaram', nameTa: 'நிர்மலா சுந்தரம்', phone: '078 121 3141', address: 'கொக்குவில்', subscriptionAmount: 1_500, frequency: 'monthly', joinedOn: '2024-09-01', status: 'active', notes: null },
];

export const SANTHTHA_PAYMENTS: readonly SanththaPayment[] = [
  // S-001 — monthly ₹1,500, paid through August
  ...monthlyRun(1, 1_500, 1, 8, 'RV-2026-0101', 'R. Murugan'),

  // S-002 — annual ₹18,000, settled in January
  { id: 200, memberId: 2, period: '2026', amount: 18_000, paidOn: '2026-01-18', receiptRef: 'RV-2026-0103', mode: 'bank', collectedBy: 'S. Vijayan' },

  // S-003 — monthly ₹1,000, paid through June, two months behind
  ...monthlyRun(3, 1_000, 1, 6, null, 'R. Murugan'),

  // S-004 — trust, ₹60,000 settled in January
  { id: 210, memberId: 4, period: '2026', amount: 60_000, paidOn: '2026-01-06', receiptRef: 'RV-2026-0102', mode: 'bank', collectedBy: 'S. Vijayan' },

  // S-005 — monthly ₹2,000, fully paid through August
  ...monthlyRun(5, 2_000, 1, 8, null, 'R. Murugan'),

  // S-006 — annual ₹36,000, settled in February
  { id: 220, memberId: 6, period: '2026', amount: 36_000, paidOn: '2026-02-11', receiptRef: 'RV-2026-0109', mode: 'bank', collectedBy: 'S. Vijayan' },

  // S-007 — monthly ₹750, paid through August
  ...monthlyRun(7, 750, 1, 8, null, 'R. Murugan'),

  // S-008 — monthly ₹1,200, stopped after May
  ...monthlyRun(8, 1_200, 1, 5, null, 'R. Murugan'),

  // S-009 — annual ₹12,000, not yet paid this year

  // S-010 — lapsed, nothing this year

  // S-011 — inactive, nothing this year

  // S-012 — monthly ₹1,500, joined recently, paid through July
  ...monthlyRun(12, 1_500, 1, 7, null, 'R. Murugan'),
];

function monthlyRun(
  memberId: number,
  amount: number,
  fromMonth: number,
  toMonth: number,
  receiptRef: string | null,
  collectedBy: string,
): SanththaPayment[] {
  return Array.from({ length: toMonth - fromMonth + 1 }, (_, index) => {
    const month = String(fromMonth + index).padStart(2, '0');

    return {
      id: memberId * 100 + fromMonth + index,
      memberId,
      period: `2026-${month}`,
      amount,
      // Collected in the first week of the month it covers.
      paidOn: `2026-${month}-05`,
      receiptRef: index === 0 ? receiptRef : null,
      mode: 'cash' as const,
      collectedBy,
    };
  });
}
