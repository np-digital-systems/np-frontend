interface DetailGridProps {
  items: readonly { label: string; value: string }[];
}

export function DetailGrid({ items }: DetailGridProps) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
      {items.map(({ label, value }) => (
        <div key={label} className="flex items-baseline gap-1.5 min-w-0">
          <dt className="shrink-0 text-[11px] text-text-muted">{label}</dt>
          <dd className="truncate text-[11px] text-text-secondary">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
