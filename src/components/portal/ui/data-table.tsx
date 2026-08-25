import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface DataColumn {
  readonly key: string;
  readonly label: string;
  /** Figures and dates read better right-aligned against a decimal column. */
  readonly align?: 'left' | 'right' | 'center';
  readonly className?: string;
  /** Column exists for its controls, so the heading is for screen readers. */
  readonly srOnly?: boolean;
}

const ALIGN = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
} as const;

interface DataTableProps {
  columns: readonly DataColumn[];
  children: ReactNode;
  /** Below this the table scrolls inside its own box, never widening the page. */
  minWidth?: number;
  className?: string;
}

/**
 * The portal's one table shell.
 *
 * Every record list in the portal was re-deriving the same header row, the
 * same hairline dividers and the same overflow container. Centralising it
 * means a density change lands everywhere at once instead of drifting.
 */
export function DataTable({
  columns,
  children,
  minWidth = 900,
  className,
}: DataTableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table
        className="w-full border-collapse text-left"
        style={{ minWidth: `${minWidth}px` }}
      >
        <thead>
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-4 py-2.5 text-[11px] font-medium text-text-muted',
                  ALIGN[column.align ?? 'left'],
                  column.className,
                )}
              >
                <span className={column.srOnly ? 'sr-only' : undefined}>
                  {column.label}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

interface DataRowProps {
  children: ReactNode;
  className?: string;
}

export function DataRow({ children, className }: DataRowProps) {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-interactive-hover',
        className,
      )}
    >
      {children}
    </tr>
  );
}

interface DataCellProps {
  children: ReactNode;
  align?: 'left' | 'right' | 'center';
  /** Keeps dates, times and references on one line. */
  nowrap?: boolean;
  className?: string;
}

export function DataCell({
  children,
  align = 'left',
  nowrap,
  className,
}: DataCellProps) {
  return (
    <td
      className={cn(
        'px-4 py-3 text-[13px] text-text-secondary',
        ALIGN[align],
        nowrap && 'whitespace-nowrap',
        className,
      )}
    >
      {children}
    </td>
  );
}

interface DataTableEmptyProps {
  colSpan: number;
  children: ReactNode;
}

/** Empty state that keeps the table's own frame instead of replacing it. */
export function DataTableEmpty({ colSpan, children }: DataTableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        {children}
      </td>
    </tr>
  );
}
