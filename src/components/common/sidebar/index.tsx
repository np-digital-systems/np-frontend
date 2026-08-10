import { useState } from 'react'
import {
  LayoutDashboard,
  Calendar,
  Tag,
  CalendarDays,
  Handshake,
  BarChart3,
  ArrowLeftRight,
  Receipt,
  CreditCard,
  BookOpen,
  Landmark,
  ListTree,
  Wallet,
  FolderOpen,
  Building2,
  PiggyBank,
  Package,
  Users,
  CheckSquare,
  FileBarChart,
  UserCog,
  Shield,
  CalendarRange,
  Settings,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  type LucideIcon,
} from 'lucide-react'

interface NavItem {
  icon: LucideIcon
  label: string
  page: string
}

interface NavGroup {
  label: string
  items: NavItem[]
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

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  activePage: string
  onNavigate: (page: string) => void
  mobileOpen: boolean
  onMobileClose: () => void
}

function TempleMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="7" fill="var(--accent)" />
      <rect x="6" y="7" width="16" height="2" rx="1" fill="white" />
      <rect x="10" y="10" width="8" height="1.5" rx="0.75" fill="white" opacity="0.7" />
      <rect x="13" y="12" width="2" height="10" rx="1" fill="white" />
      <rect x="7" y="20" width="14" height="2" rx="1" fill="white" />
    </svg>
  )
}

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tooltip">
      {children}
      <div
        className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 pointer-events-none
          px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap
          opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150"
        style={{
          backgroundColor: 'var(--surface-2)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        {label}
      </div>
    </div>
  )
}

function SidebarContent({
  collapsed,
  activePage,
  onNavigate,
  onToggle,
}: {
  collapsed: boolean
  activePage: string
  onNavigate: (page: string) => void
  onToggle: () => void
}) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  return (
    <div
      className="flex flex-col h-full select-none"
      style={{ transition: 'width 200ms ease' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 shrink-0"
        style={{
          height: 'var(--header-height)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="shrink-0">
          <TempleMark />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
              Temple Management
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Portal
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        {navGroups.map(group => {
          const isGroupCollapsed = collapsedGroups.has(group.label)
          const isDashboard = group.label === 'Dashboard'

          return (
            <div key={group.label} className="mb-0.5">
              {/* Group label (only in expanded mode, not Dashboard) */}
              {!collapsed && !isDashboard && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center justify-between w-full px-4 py-1.5 text-left"
                  style={{ cursor: 'pointer' }}
                >
                  <span
                    className="text-xs font-medium tracking-wide uppercase"
                    style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}
                  >
                    {group.label}
                  </span>
                  <ChevronDown
                    size={12}
                    style={{
                      color: 'var(--text-muted)',
                      transform: isGroupCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                      transition: 'transform 150ms ease',
                    }}
                  />
                </button>
              )}

              {/* Items */}
              {(!isGroupCollapsed || isDashboard || collapsed) && (
                <div>
                  {group.items.map(item => {
                    const isActive = activePage === item.page
                    const Icon = item.icon

                    const navItem = (
                      <button
                        key={item.page}
                        onClick={() => onNavigate(item.page)}
                        className="flex items-center w-full text-left group/item"
                        style={{
                          height: 36,
                          padding: collapsed ? '0 22px' : '0 12px',
                          gap: 10,
                          borderRadius: 8,
                          margin: '1px 8px',
                          width: 'calc(100% - 16px)',
                          backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
                          color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                          transition: 'background-color 120ms ease, color 120ms ease',
                          cursor: 'pointer',
                          border: 'none',
                        }}
                        onMouseEnter={e => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'var(--surface-2)'
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }
                        }}
                      >
                        <Icon
                          size={16}
                          style={{
                            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                            transition: 'color 120ms ease',
                          }}
                        />
                        {!collapsed && (
                          <span
                            className="text-sm truncate"
                            style={{
                              fontWeight: isActive ? 500 : 400,
                              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                            }}
                          >
                            {item.label}
                          </span>
                        )}
                      </button>
                    )

                    return collapsed ? (
                      <Tooltip key={item.page} label={item.label}>
                        {navItem}
                      </Tooltip>
                    ) : (
                      navItem
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Collapse toggle (desktop) */}
      <div
        className="shrink-0 p-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <button
          onClick={onToggle}
          className="flex items-center justify-center rounded-lg w-full"
          style={{
            height: 32,
            backgroundColor: 'transparent',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            transition: 'background-color 120ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-2)' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </div>
  )
}

export default function Sidebar({
  collapsed,
  onToggle,
  activePage,
  onNavigate,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const sidebarStyle: React.CSSProperties = {
    width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
    minWidth: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
    backgroundColor: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    transition: 'width 200ms ease, min-width 200ms ease',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 10,
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col h-full shrink-0"
        style={sidebarStyle}
      >
        <SidebarContent
          collapsed={collapsed}
          activePage={activePage}
          onNavigate={onNavigate}
          onToggle={onToggle}
        />
      </aside>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className="fixed inset-y-0 left-0 z-50 flex flex-col lg:hidden"
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 250ms ease',
        }}
      >
        <button
          onClick={onMobileClose}
          className="absolute top-4 right-4 flex items-center justify-center rounded-lg"
          style={{
            width: 28,
            height: 28,
            backgroundColor: 'var(--surface-2)',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
          }}
        >
          <X size={14} />
        </button>
        <SidebarContent
          collapsed={false}
          activePage={activePage}
          onNavigate={page => { onNavigate(page); onMobileClose() }}
          onToggle={onMobileClose}
        />
      </aside>
    </>
  )
}
