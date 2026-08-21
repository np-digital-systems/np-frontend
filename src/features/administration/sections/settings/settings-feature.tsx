import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';

import { getAdministrationAccess } from '../../lib/administration-access';
import { getPortalSettings } from '../../lib/administration-service';

import { SettingsScreen } from './settings-screen';

/**
 * Settings boundary.
 *
 * These values change how every other screen behaves — voucher numbering,
 * the approval threshold, the currency every figure is rendered in — so
 * `settings:manage` is the admin's alone.
 */
export async function SettingsFeature() {
  const user = await getCurrentUser();
  const access = getAdministrationAccess(user.role);

  if (!access.canManageSettings) {
    return (
      <PageShell>
        <AccessDenied description="Portal settings are limited to administrators." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SettingsScreen initialSettings={getPortalSettings()} />
    </PageShell>
  );
}
