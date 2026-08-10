import { useState, useRef, useEffect } from 'react'
import {
  Search,
  Bell,
  ChevronDown,
  Sun,
  Moon,
  Menu,
  User,
  MonitorSmartphone,
  LogOut,
  Settings,
  ChevronRight,
} from 'lucide-react'
import GlobalSearch from '@/features/search'
import { NOTIFICATIONS, PRIORITY_CFG, relativeTime }    from '@/features/notification/constants/mock-data'

/* ── Breadcrumb ── */
function Breadcrumb({ page }: { page: string }) {
  const parts = ['Temple Management', page !== 'Dashboard' ? page : null].filter(Boolean) as string[]
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1.5">
      {parts.map((part, i) => (
        <span key={part} className="flex items-center gap-1.5">
          {i > 0 && (
            <ChevronRight
              size={12}
              style={{ color: 'var(--text-muted)' }}
              strokeWidth={2}
            />
          )}
          <span
            className="text-sm"
            style={{
              color: i === parts.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: i === parts.length - 1 ? 500 : 400,
            }}
          >
            {part}
          </span>
        </span>
      ))}
    </nav>
  )
}

/* ── Financial Year Selector ── */
const fyOptions = [
  { year: '2026', status: 'Open' },
  { year: '2025', status: 'Closed' },
  { year: '2024', status: 'Closed' },
]

function FinancialYearSelector() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(fyOptions[0])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-3"
        style={{
          height: 34,
          backgroundColor: 'var(--surface-2)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500,
          transition: 'background-color 120ms ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--border)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)' }}
      >
        <span className="tabular">{selected.year}</span>
        <span
          className="rounded-full px-1.5 text-xs font-medium"
          style={{
            backgroundColor: selected.status === 'Open' ? 'var(--success-subtle)' : 'var(--surface)',
            color: selected.status === 'Open' ? 'var(--success)' : 'var(--text-muted)',
            border: '1px solid transparent',
          }}
        >
          {selected.status}
        </span>
        <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 rounded-xl py-1 z-50 min-w-[160px]"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}
        >
          {fyOptions.map(fy => (
            <button
              key={fy.year}
              onClick={() => { setSelected(fy); setOpen(false) }}
              className="flex items-center justify-between w-full px-3 py-2 text-left"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontSize: 13,
                transition: 'background-color 100ms ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
            >
              <span className="flex items-center gap-2 tabular font-medium">{fy.year}</span>
              <span
                className="rounded-full px-2 py-0.5 text-xs"
                style={{
                  backgroundColor: fy.status === 'Open' ? 'var(--success-subtle)' : 'var(--surface-2)',
                  color: fy.status === 'Open' ? 'var(--success)' : 'var(--text-muted)',
                }}
              >
                {fy.status}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Notifications ── */
function NotificationsPanel({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState(NOTIFICATIONS)
  const ref = useRef<HTMLDivElement>(null)
  const unreadCount = notifs.filter(n => !n.read).length
  const preview = notifs.slice(0, 5)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = () => setNotifs(ns => ns.map(n => ({ ...n, read: true })))

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center rounded-lg"
        style={{
          width: 34,
          height: 34,
          backgroundColor: open ? 'var(--surface-2)' : 'transparent',
          border: '1px solid transparent',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          transition: 'background-color 120ms ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)' }}
        onMouseLeave={e => {
          if (!open) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
        }}
        aria-label="Notifications"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 flex items-center justify-center text-white font-semibold"
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: 'var(--danger)',
              fontSize: 8,
              lineHeight: 1,
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 rounded-xl z-50"
          style={{
            width: 360,
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.14)',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={markAllRead}
              className="text-xs"
              style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Mark all read
            </button>
          </div>

          <div>
            {preview.length === 0 ? (
              <div className="flex flex-col items-center py-8">
                <Bell size={20} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: 8 }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>You&apos;re all caught up.</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>No new notifications.</p>
              </div>
            ) : preview.map((n, i) => {
              const cfg = PRIORITY_CFG[n.priority]
              return (
                <div
                  key={n.id}
                  className="flex gap-3 px-4 py-3 cursor-pointer"
                  style={{
                    borderBottom: i < preview.length - 1 ? '1px solid var(--border)' : 'none',
                    backgroundColor: !n.read ? 'rgba(0,113,227,0.025)' : 'transparent',
                    transition: 'background-color 100ms ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = !n.read ? 'rgba(0,113,227,0.025)' : 'transparent' }}
                >
                  {/* Priority dot */}
                  <div className="flex items-center justify-center shrink-0 mt-1">
                    {n.priority !== 'Information'
                      ? <span className="rounded-full" style={{ width: 8, height: 8, backgroundColor: cfg.dot, display: 'block' }} />
                      : <span style={{ width: 8, height: 8, display: 'block' }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className="text-sm leading-snug"
                        style={{
                          color: 'var(--text-primary)',
                          fontWeight: !n.read ? 500 : 400,
                        }}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <span
                          className="shrink-0 rounded-full mt-1"
                          style={{ width: 6, height: 6, backgroundColor: 'var(--accent)', flexShrink: 0 }}
                        />
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {n.entityRef ? `${n.entityRef} — ` : ''}{n.category}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {relativeTime(n.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="px-4 py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => { setOpen(false); onNavigate?.('Notifications') }}
              className="text-xs w-full text-center"
              style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── User Menu ── */
const roleColors: Record<string, { bg: string; text: string }> = {
  SUPER_ADMIN: { bg: 'rgba(255,59,48,0.1)', text: 'var(--danger)' },
  ADMIN: { bg: 'rgba(255,159,10,0.1)', text: 'var(--warning)' },
  ACCOUNTANT: { bg: 'rgba(0,113,227,0.1)', text: 'var(--accent)' },
  CASHIER: { bg: 'rgba(52,199,89,0.1)', text: 'var(--success)' },
  DEVOTEE: { bg: 'var(--surface-2)', text: 'var(--text-secondary)' },
}

function UserMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const role = 'ACCOUNTANT'
  const roleStyle = roleColors[role]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-2"
        style={{
          height: 34,
          backgroundColor: open ? 'var(--surface-2)' : 'transparent',
          border: '1px solid transparent',
          cursor: 'pointer',
          transition: 'background-color 120ms ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)' }}
        onMouseLeave={e => {
          if (!open) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
        }}
      >
        <div
          className="flex items-center justify-center rounded-full text-white font-semibold text-xs shrink-0"
          style={{ width: 26, height: 26, backgroundColor: 'var(--accent)' }}
        >
          KK
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-medium leading-none" style={{ color: 'var(--text-primary)' }}>
            K. Keeththigan
          </p>
        </div>
        <ChevronDown size={12} style={{ color: 'var(--text-muted)', marginLeft: 2 }} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 rounded-xl py-1 z-50"
          style={{
            width: 224,
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.14)',
          }}
        >
          {/* Profile header */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-full text-white font-semibold"
                style={{ width: 36, height: 36, backgroundColor: 'var(--accent)', fontSize: 13 }}
              >
                KK
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  K. Keeththigan
                </p>
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-xs font-medium mt-0.5"
                  style={{ backgroundColor: roleStyle.bg, color: roleStyle.text }}
                >
                  {role.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Menu items */}
          {[
            { icon: User, label: 'Profile' },
            { icon: MonitorSmartphone, label: 'My Sessions' },
            { icon: Settings, label: 'Settings' },
          ].map(item => (
            <button
              key={item.label}
              className="flex items-center gap-2.5 w-full px-4 py-2 text-left"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                fontSize: 13,
                transition: 'background-color 100ms ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
            >
              <item.icon size={14} style={{ color: 'var(--text-muted)' }} />
              {item.label}
            </button>
          ))}

          <div style={{ borderTop: '1px solid var(--border)', marginTop: 4 }}>
            <button
              className="flex items-center gap-2.5 w-full px-4 py-2 text-left mt-1"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--danger)',
                fontSize: 13,
                transition: 'background-color 100ms ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--danger-subtle)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Command Search Modal ── */
/* CommandSearch replaced by GlobalSearch component */

/* ── Header ── */
interface HeaderProps {
  darkMode: boolean
  onDarkModeToggle: () => void
  onMobileMenuToggle: () => void
  activePage: string
  onNavigate?: (page: string) => void
}

export default function Header({ darkMode, onDarkModeToggle, onMobileMenuToggle, activePage, onNavigate }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <header
        className="flex items-center justify-between px-4 lg:px-6 shrink-0"
        style={{
          height: 'var(--header-height)',
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 9,
        }}
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="flex items-center justify-center rounded-lg lg:hidden"
            style={{
              width: 34,
              height: 34,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <Menu size={18} />
          </button>
          <Breadcrumb page={activePage} />
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 rounded-lg px-3"
            style={{
              height: 34,
              backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: 13,
              transition: 'background-color 120ms ease',
              minWidth: 180,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--border)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)' }}
          >
            <Search size={14} />
            <span className="flex-1 text-left">Search anything...</span>
            <kbd
              className="flex items-center gap-0.5 rounded px-1 text-xs"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                lineHeight: '18px',
              }}
            >
              ⌘K
            </kbd>
          </button>

          {/* Mobile search icon */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex sm:hidden items-center justify-center rounded-lg"
            style={{
              width: 34,
              height: 34,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <Search size={17} />
          </button>

          <div style={{ width: 1, height: 20, backgroundColor: 'var(--border)', margin: '0 4px' }} />

          <FinancialYearSelector />

          <NotificationsPanel onNavigate={onNavigate} />

          {/* Dark mode toggle */}
          <button
            onClick={onDarkModeToggle}
            className="flex items-center justify-center rounded-lg"
            style={{
              width: 34,
              height: 34,
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'background-color 120ms ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <div style={{ width: 1, height: 20, backgroundColor: 'var(--border)', margin: '0 4px' }} />

          <UserMenu />
        </div>
      </header>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={onNavigate} />
    </>
  )
}
