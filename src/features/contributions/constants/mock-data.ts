import type { SanththaMember, SanththaPayment } from '../types';

export const SANTHTHA_MEMBERS: readonly SanththaMember[] = [
  { id: 1, memberNo: 'S-001', fullName: 'M. Ganesan & Family', nameTa: 'ம. கணேசன் மற்றும் குடும்பத்தினர்', phone: '077 111 2222', address: 'நல்லூர், யாழ்ப்பாணம்', joinedOn: '2018-04-01', isActive: true, notes: null },
  { id: 2, memberNo: 'S-002', fullName: 'Abirami Ramanathan', nameTa: 'செல்வி. அபிராமி இராமநாதன்', phone: '077 333 4444', address: 'வெள்ளவத்தை, கொழும்பு', joinedOn: '2019-01-15', isActive: true, notes: null },
  { id: 3, memberNo: 'S-003', fullName: 'Jagadheswari Nadaraja', nameTa: 'திருமதி. ஜெகதீஸ்வரி நடராஜா', phone: '071 666 7777', address: 'மட்டக்களப்பு நகர்', joinedOn: '2020-06-01', isActive: true, notes: null },
  { id: 4, memberNo: 'S-004', fullName: 'Karthikeyan Trust', nameTa: 'கார்த்திகேயன் அறக்கட்டளை', phone: '021 222 9999', address: 'பருத்தித்துறை', joinedOn: '2016-09-10', isActive: true, notes: null },
  { id: 5, memberNo: 'S-005', fullName: 'Sivashri Family', nameTa: 'சிவஸ்ரீ குடும்பம்', phone: '077 555 8888', address: 'திருநெல்வேலி, யாழ்ப்பாணம்', joinedOn: '2017-02-20', isActive: true, notes: null },
  { id: 6, memberNo: 'S-006', fullName: 'Sri Nandikeswarar Mandram', nameTa: 'ஸ்ரீ நந்திகேஸ்வரர் மன்றம்', phone: '072 444 5555', address: 'கொழும்பு 06', joinedOn: '2015-05-05', isActive: true, notes: null },
  { id: 7, memberNo: 'S-007', fullName: 'T. Rajendran', nameTa: 'தி. ராஜேந்திரன்', phone: '077 909 1010', address: 'கோண்டாவில், யாழ்ப்பாணம்', joinedOn: '2021-11-01', isActive: true, notes: null },
  { id: 8, memberNo: 'S-008', fullName: 'Vasanthi Sivalingam', nameTa: 'வசந்தி சிவலிங்கம்', phone: '076 202 3030', address: 'சுன்னாகம்', joinedOn: '2022-03-15', isActive: true, notes: 'Away since June; family to settle on return.' },
  { id: 9, memberNo: 'S-009', fullName: 'K. Balasubramaniam', nameTa: 'க. பாலசுப்ரமணியம்', phone: '075 404 5050', address: 'சாவகச்சேரி', joinedOn: '2019-08-22', isActive: true, notes: null },
  { id: 10, memberNo: 'S-010', fullName: 'Meena Kandasamy', nameTa: 'மீனா கந்தசாமி', phone: '077 606 7070', address: 'மானிப்பாய்', joinedOn: '2023-01-10', isActive: true, notes: null },
  { id: 11, memberNo: 'S-011', fullName: 'S. Thavarajah', nameTa: 'சி. தவராஜா', phone: '071 808 9090', address: 'உரும்பிராய்', joinedOn: '2014-07-01', isActive: false, notes: 'Moved abroad in 2025; membership held open at the family’s request.' },
  { id: 12, memberNo: 'S-012', fullName: 'Nirmala Sundaram', nameTa: 'நிர்மலா சுந்தரம்', phone: '078 121 3141', address: 'கொக்குவில்', joinedOn: '2024-09-01', isActive: true, notes: null },
];

/** At most one row per member per year — the subscription is paid once. */
export const SANTHTHA_PAYMENTS: readonly SanththaPayment[] = [
  { id: 1, memberId: 1, year: 2026, amount: 1_500, paidOn: '2026-01-12', receiptRef: 'RV-2026-0101', mode: 'cash', collectedBy: 'R. Murugan' },
  { id: 2, memberId: 2, year: 2026, amount: 1_500, paidOn: '2026-01-18', receiptRef: 'RV-2026-0103', mode: 'bank', collectedBy: 'S. Vijayan' },
  { id: 3, memberId: 4, year: 2026, amount: 1_500, paidOn: '2026-01-06', receiptRef: 'RV-2026-0102', mode: 'bank', collectedBy: 'S. Vijayan' },
  { id: 4, memberId: 5, year: 2026, amount: 1_500, paidOn: '2026-02-03', receiptRef: null, mode: 'cash', collectedBy: 'R. Murugan' },
  { id: 5, memberId: 6, year: 2026, amount: 1_500, paidOn: '2026-02-11', receiptRef: 'RV-2026-0109', mode: 'bank', collectedBy: 'S. Vijayan' },
  { id: 6, memberId: 7, year: 2026, amount: 1_500, paidOn: '2026-04-20', receiptRef: null, mode: 'cash', collectedBy: 'R. Murugan' },
  { id: 7, memberId: 9, year: 2026, amount: 1_500, paidOn: '2026-05-09', receiptRef: 'RV-2026-0119', mode: 'online', collectedBy: 'S. Vijayan' },
  { id: 8, memberId: 12, year: 2026, amount: 1_500, paidOn: '2026-07-02', receiptRef: null, mode: 'cash', collectedBy: 'R. Murugan' },

  // Previous year, so the year filter has something to switch to.
  { id: 9, memberId: 1, year: 2025, amount: 1_500, paidOn: '2025-02-14', receiptRef: null, mode: 'cash', collectedBy: 'R. Murugan' },
  { id: 10, memberId: 3, year: 2025, amount: 1_500, paidOn: '2025-03-01', receiptRef: null, mode: 'cash', collectedBy: 'R. Murugan' },
];
