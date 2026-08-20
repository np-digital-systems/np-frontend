/**
 * Dashboard component surface.
 *
 * The generic pieces — cards, badges, tables, empty states — now live in
 * `@/components/portal/ui` so every portal screen shares one visual
 * language. They are re-exported here so dashboard sections keep importing
 * from a single place.
 */
export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  StatCard,
  StatusBadge,
  LinkButton,
  DetailGrid,
  EmptyState,
  Skeleton,
  SegmentedControl,
} from '@/components/portal/ui';

export { ChartTooltip } from './chart-tooltip';
export { PageHeader } from './page-header';
export { DashboardShell } from './dashboard-shell';
export { QuickActions, type QuickAction } from './quick-actions';
