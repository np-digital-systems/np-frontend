'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',

  events: 'Events',
  types: 'Event Types',
  schedule: 'Yearly Schedule',
  sponsors: 'Sponsors',

  accounting: 'Accounting',
  'chart-of-accounts': 'Chart of Accounts',
  transactions: 'Transactions',
  'cash-book': 'Cash Book',
  'bank-book': 'Bank Book',
  'bank-accounts': 'Bank Accounts',
  receipts: 'Receipt Vouchers',
  payments: 'Payment Vouchers',
  approvals: 'Approval Center',
  reports: 'Reports',

  finance: 'Financial Management',
  funds: 'Funds',
  projects: 'Projects',
  'fixed-deposits': 'Fixed Deposits',
  assets: 'Assets',

  contributions: 'Contributions',
  sanththa: 'Sanththa',

  administration: 'Administration',
  users: 'Users',
  roles: 'Roles & Permissions',
  'audit-log': 'Audit Log',
  'financial-years': 'Financial Years',
  settings: 'Settings',
}

function formatSegment(segment: string) {
  return (
    routeLabels[segment] ??
    segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
  )
}

export function PortalBreadcrumbs() {
  const pathname = usePathname()

  const segments = pathname
    .split('/')
    .filter(Boolean)

  // Remove locale.
  // Example:
  // /en/dashboard
  //       ↓
  // dashboard
  const routeSegments = segments.slice(1)

  const breadcrumbs = routeSegments.map((segment, index) => ({
    label: formatSegment(segment),
    href:
      '/' +
      segments
        .slice(0, index + 2)
        .join('/'),
  }))

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 items-center"
    >
      <Link
        href={`/${segments[0] ?? 'en'}/dashboard`}
        className={cn(
          'flex shrink-0 items-center',
          'text-muted-foreground',
          'transition-colors',
          'hover:text-foreground',
        )}
      >
        <Home className="size-4" />
        <span className="sr-only">Dashboard</span>
      </Link>

      {breadcrumbs.length > 0 && (
        <>
          {breadcrumbs.map((item, index) => {
            const isLast =
              index === breadcrumbs.length - 1

            return (
              <div
                key={item.href}
                className="flex min-w-0 items-center"
              >
                <ChevronRight
                  className={cn(
                    'mx-2 size-3.5',
                    'shrink-0',
                    'text-muted-foreground/50',
                  )}
                />

                {isLast ? (
                  <span
                    className={cn(
                      'truncate',
                      'text-sm font-medium',
                      'text-foreground',
                    )}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      'hidden',
                      'text-sm',
                      'text-muted-foreground',
                      'transition-colors',
                      'hover:text-foreground',
                      'sm:block',
                    )}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            )
          })}
        </>
      )}
    </nav>
  )
}