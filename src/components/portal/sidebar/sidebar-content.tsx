import type { PortalNavGroup } from '@/config/navigation';

import { SidebarGroup } from './sidebar-group';

interface SidebarContentProps {
  navigation: readonly PortalNavGroup[];
  collapsed: boolean;
}

export function SidebarContent({
  navigation,
  collapsed,
}: SidebarContentProps) {
  return (
    <nav
      aria-label="Portal navigation"
      className="
        flex-1 overflow-y-auto
        px-2 py-3
        scrollbar-hide
      "
    >
      <div className="space-y-4">
        {navigation.map((group) => (
          <SidebarGroup
            key={group.id}
            group={group}
            collapsed={collapsed}
          />
        ))}
      </div>
    </nav>
  );
}