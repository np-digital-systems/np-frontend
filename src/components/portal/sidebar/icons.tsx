import {
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  Calendar,
  CalendarDays,
  CalendarRange,
  CheckSquare,
  ClipboardList,
  CreditCard,
  FolderOpen,
  Handshake,
  Landmark,
  LayoutDashboard,
  ListTree,
  Package,
  PiggyBank,
  Receipt,
  Settings,
  Shield,
  Tag,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import type { PortalIcon } from '@/config/navigation';

const iconMap: Record<PortalIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  calendar: Calendar,
  tag: Tag,
  'calendar-days': CalendarDays,
  handshake: Handshake,
  chart: BarChart3,
  transfer: ArrowLeftRight,
  receipt: Receipt,
  'credit-card': CreditCard,
  book: BookOpen,
  landmark: Landmark,
  list: ListTree,
  wallet: Wallet,
  folder: FolderOpen,
  'piggy-bank': PiggyBank,
  package: Package,
  users: Users,
  check: CheckSquare,
  report: BarChart3,
  user: UserCog,
  shield: Shield,
  'calendar-range': CalendarRange,
  settings: Settings,
  clipboard: ClipboardList,
};

export function getPortalIcon(
  icon: PortalIcon,
): LucideIcon {
  return iconMap[icon];
}