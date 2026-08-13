export interface NavItem {
  id: string;
  label: string;
  href: string;
  description?: string;
}

export const mainNavItems: NavItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "about", label: "About", href: "/about" },
  { id: "events", label: "Events", href: "/events" },
  { id: "gallery", label: "Gallery", href: "/gallery" },
  { id: "contact", label: "Contact", href: "/contact" },
];

export const footerNavItems = {
  quickLinks: [
    { id: "about", label: "About Temple", href: "/about" },
    { id: "events", label: "Upcoming Events", href: "/events" },
    { id: "gallery", label: "Photo Gallery", href: "/gallery" },
    { id: "contact", label: "Contact Us", href: "/contact" },
  ],
  services: [
    { id: "puja", label: "Puja Booking", href: "/bookings" },
    { id: "donations", label: "Donations", href: "/donations" },
    { id: "notices", label: "Notices", href: "/notices" },
    { id: "calendar", label: "Temple Calendar", href: "/events" },
  ],
} as const;


interface NavPortalItem {
  icon: LucideIcon
  label: string
  page: string
}

interface NavGroup {
  label: string
  items: NavPortalItem[]
}


const navGroups: NavGroup[] = [
  {
    label: 'Dashboard',
    items: [{ icon: LayoutDashboard, label: 'Dashboard', page: 'Dashboard' }],
  },
  {
    label: 'Event Management',
    items: [
      { icon: Calendar, label: 'Event Calendar', page: 'Event Calendar' },
      { icon: Tag, label: 'Event Types', page: 'Event Types' },
      { icon: CalendarDays, label: 'Yearly Schedule', page: 'Yearly Schedule' },
      { icon: Handshake, label: 'Sponsors', page: 'Sponsors' },
    ],
  },
  {
    label: 'Accounting',
    items: [
      { icon: BarChart3, label: 'Account Overview', page: 'Account Overview' },
      { icon: ListTree, label: 'Chart of Accounts', page: 'Chart of Accounts' },
      { icon: ArrowLeftRight, label: 'Transactions', page: 'Transactions' },
      { icon: BookOpen, label: 'Cash Book', page: 'Cash Book' },
      { icon: Building2, label: 'Bank Book', page: 'Bank Book' },
      { icon: Landmark, label: 'Bank Accounts', page: 'Bank Accounts' },
      { icon: Receipt, label: 'Receipt Vouchers', page: 'Receipt Vouchers' },
      { icon: CreditCard, label: 'Payment Vouchers', page: 'Payment Vouchers' },
      { icon: CheckSquare, label: 'Approval Center', page: 'Approval Center' },
      { icon: FileBarChart, label: 'Reports', page: 'Reports' },
    ],
  },
  {
    label: 'Financial Management',
    items: [
      { icon: Wallet, label: 'Funds', page: 'Funds' },
      { icon: FolderOpen, label: 'Projects', page: 'Projects' },
      { icon: PiggyBank, label: 'Fixed Deposits', page: 'Fixed Deposits' },
      { icon: Package, label: 'Assets', page: 'Assets' },
    ],
  },
  {
    label: 'Temple Contributions',
    items: [{ icon: Users, label: 'Sanththa', page: 'Sanththa' }],
  },
  {
    label: 'Administration',
    items: [
      { icon: UserCog, label: 'Users', page: 'Users' },
      { icon: Shield, label: 'Roles & Permissions', page: 'Roles & Permissions' },
      { icon: ClipboardList, label: 'Audit Log', page: 'Audit Log' },
      { icon: CalendarRange, label: 'Financial Years', page: 'Financial Years' },
      { icon: Settings, label: 'Settings', page: 'Settings' },
    ],
  },
]

