import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, ArrowRight, Clock, Hash, ChevronRight } from 'lucide-react'
import {
  searchIndex, groupResults, QUICK_ACTIONS, RECENT_SEARCHES, RECENTLY_VIEWED,
  TYPE_FILTERS, TYPE_ICON, BADGE_COLORS,
  type SearchResult, type SearchType,
} from './constants/mock-data'

// ── Badge ──────────────────────────────────────────────────────────────────────

function Badge({ label }: { label: string }) {
  const c = BADGE_COLORS[label] ?? BADGE_COLORS.Inactive
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: c.bg, color: c.text }}>
      {label}
    </span>
  )
}

// ── Result Row ─────────────────────────────────────────────────────────────────

function ResultRow({
  result, active, onSelect,
}: {
  result: SearchResult
  active: boolean
  onSelect: (r: SearchResult) => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: 'nearest' })
  }, [active])

  return (
    <button ref={ref}
      onClick={() => onSelect(result)}
      className="flex items-center gap-3 w-full px-4 py-2.5 text-left"
      style={{
        backgroundColor: active ? 'var(--surface-2)' : 'transparent',
        border: 'none', cursor: 'pointer',
        borderRadius: 8,
        transition: 'background-color 80ms ease',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = active ? 'var(--surface-2)' : 'transparent' }}>

      {/* Type icon */}
      <span className="text-base shrink-0" style={{ width: 20, textAlign: 'center' }} aria-hidden>
        {TYPE_ICON[result.type]}
      </span>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {result.title}
          </span>
          {result.ref && (
            <span className="text-xs font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>
              {result.ref}
            </span>
          )}
          {result.badge && <Badge label={result.badge} />}
        </div>
        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {result.subtitle}
          {result.meta ? ` · ${result.meta}` : ''}
        </p>
      </div>

      {/* Arrow hint */}
      {active && (
        <ChevronRight size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      )}
    </button>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="px-4 py-3 flex flex-col gap-3">
      {['Users', 'Events', 'Receipts'].map(g => (
        <div key={g}>
          <div className="h-3 w-16 rounded mb-2" style={{ backgroundColor: 'var(--surface-2)' }} />
          {[1, 2].map(i => (
            <div key={i} className="flex gap-3 py-2">
              <div className="h-5 w-5 rounded" style={{ backgroundColor: 'var(--surface-2)' }} />
              <div className="flex-1">
                <div className="h-3.5 w-40 rounded mb-1.5" style={{ backgroundColor: 'var(--surface-2)' }} />
                <div className="h-3 w-28 rounded" style={{ backgroundColor: 'var(--surface-2)', opacity: 0.6 }} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────

interface GlobalSearchProps {
  open: boolean
  onClose: () => void
  onNavigate?: (page: string) => void
}

export default function GlobalSearch({ open, onClose, onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<SearchType | 'All'>('All')
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  // Simulate brief load on first keystroke
  const [prevQuery, setPrevQuery] = useState('')
  useEffect(() => {
    if (query && !prevQuery) {
      setLoading(true)
      const t = setTimeout(() => setLoading(false), 260)
      return () => clearTimeout(t)
    }
    setPrevQuery(query)
    setActiveIdx(-1)
  }, [query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setTypeFilter('All')
      setActiveIdx(-1)
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 40)
    }
  }, [open])

  const results = loading ? [] : searchIndex(query, typeFilter)
  const groups = groupResults(results)

  // Flat list for keyboard nav
  const flat: SearchResult[] = groups.flatMap(g => g.items)

  const handleSelect = useCallback((r: SearchResult) => {
    onNavigate?.(r.page)
    onClose()
  }, [onNavigate, onClose])

  const handleQuickAction = (page: string) => {
    onNavigate?.(page)
    onClose()
  }

  const handleRecentSelect = (label: string) => {
    setQuery(label)
    inputRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (flat.length === 0) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx(i => Math.min(i + 1, flat.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx(i => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && activeIdx >= 0) {
        e.preventDefault()
        handleSelect(flat[activeIdx])
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, flat, activeIdx, handleSelect, onClose])

  if (!open) return null

  const showEmpty = query.length > 1 && !loading && results.length === 0
  const showResults = !loading && results.length > 0
  const showDefault = !query

  // running flat index
  let flatIdx = 0

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}>
      <div
        className="w-full rounded-2xl overflow-hidden flex flex-col"
        style={{
          maxWidth: 580,
          maxHeight: 'min(600px, 80vh)',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
        }}
        onClick={e => e.stopPropagation()}>

        {/* Search input */}
        <div className="flex items-center gap-3 px-4"
          style={{ borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search users, events, receipts, payments, transactions..."
            className="flex-1 bg-transparent py-4 text-sm outline-none"
            style={{ color: 'var(--text-primary)', caretColor: 'var(--accent)' }}
          />
          <div className="flex items-center gap-2 shrink-0">
            {query && (
              <button onClick={() => setQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                <X size={14} />
              </button>
            )}
            <kbd className="rounded-md px-1.5 text-xs font-medium hidden sm:block"
              style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)', lineHeight: '20px' }}>
              Esc
            </kbd>
          </div>
        </div>

        {/* Type filter pills — only when query exists */}
        {query && !showEmpty && (
          <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto"
            style={{ borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            {TYPE_FILTERS.slice(0, 9).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                style={{
                  backgroundColor: typeFilter === t ? 'var(--accent)' : 'var(--surface-2)',
                  color: typeFilter === t ? '#fff' : 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer', flexShrink: 0,
                }}>
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1" style={{ overscrollBehavior: 'contain' }}>

          {/* Loading skeleton */}
          {loading && <Skeleton />}

          {/* No results */}
          {showEmpty && (
            <div className="flex flex-col items-center justify-center py-14">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No records found</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                No results for &ldquo;{query}&rdquo;. Try another search.
              </p>
            </div>
          )}

          {/* Grouped results */}
          {showResults && (
            <div className="px-2 py-2">
              {groups.map(group => (
                <div key={group.type} className="mb-1">
                  <div className="flex items-center gap-2 px-3 py-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                      {group.type}s
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {group.items.length}
                    </span>
                  </div>
                  {group.items.map(item => {
                    const isActive = flatIdx === activeIdx
                    flatIdx++
                    return (
                      <ResultRow key={item.id} result={item} active={isActive} onSelect={handleSelect} />
                    )
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Default state: recent + quick actions */}
          {showDefault && (
            <div className="px-4 py-3 flex flex-col gap-4">

              {/* Recent searches */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                  Recent
                </p>
                <div className="flex flex-col gap-0.5">
                  {RECENT_SEARCHES.map(s => (
                    <button key={s} onClick={() => handleRecentSelect(s)}
                      className="flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm text-left"
                      style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}>
                      <Clock size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recently viewed */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                  Recently Viewed
                </p>
                <div className="flex flex-col gap-0.5">
                  {RECENTLY_VIEWED.map(item => (
                    <button key={item.label} onClick={() => handleQuickAction(item.page)}
                      className="flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm text-left"
                      style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}>
                      <span style={{ width: 16, textAlign: 'center', fontSize: 13, flexShrink: 0 }} aria-hidden>
                        {TYPE_ICON[item.type]}
                      </span>
                      <span className="flex-1 min-w-0 truncate">{item.label}</span>
                      <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{item.type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                  Quick Actions
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {QUICK_ACTIONS.map(action => (
                    <button key={action.label} onClick={() => handleQuickAction(action.page)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left"
                      style={{
                        backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', cursor: 'pointer',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
                      <ArrowRight size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      <span className="truncate">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center gap-4 px-4 py-2.5 shrink-0"
          style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1 text-xs">
            <kbd className="rounded px-1 py-0.5" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: 10 }}>↑</kbd>
            <kbd className="rounded px-1 py-0.5" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: 10 }}>↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1 text-xs">
            <kbd className="rounded px-1 py-0.5" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: 10 }}>↵</kbd>
            Open
          </span>
          <span className="flex items-center gap-1 text-xs">
            <kbd className="rounded px-1 py-0.5" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: 10 }}>Esc</kbd>
            Close
          </span>
          <span className="flex-1" />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {results.length > 0 ? `${results.length} result${results.length !== 1 ? 's' : ''}` : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
