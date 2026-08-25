import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface DataColumn {
  readonly key: string;
  readonly label: string;
    readonly align?: 'left' | 'right' | 'center';
  readonly className?: string;
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
    minWidth?: number;
  className?: string;
}

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

export function DataTableEmpty({ colSpan, children }: DataTableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        {children}
      </td>
    </tr>
  );
}
