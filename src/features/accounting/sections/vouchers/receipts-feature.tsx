import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { VoucherRegister } from '../../components/voucher-register';
import { getAccountingAccess } from '../../lib/accounting-access';
import {
  getActivityOptions,
  getBankAccountOptions,
  getFundOptions,
  getPostableAccounts,
  getPartyOptions,
  getPoojaTypes,
  getPoojas,
  getProjectOptions,
  getVouchersOfKind,
} from '../../lib/accounting-service';

export async function ReceiptVouchersFeature() {
  const { user, permissions } = await requireSession();
  const access = getAccountingAccess(permissions);

  if (!access.canViewReceipts) {
    return (
      <PageShell>
        <AccessDenied description="Receipt vouchers are available to temple accounting staff. Contact an administrator if you need access." />
      </PageShell>
    );
  }

  const [
    initialVouchers,
    accounts,
    funds,
    projects,
    bankAccounts,
    activities,
    parties,
    poojaTypes,
    poojas,
  ] = await Promise.all([
    getVouchersOfKind('receipt'),
    getPostableAccounts(),
    getFundOptions(),
    getProjectOptions(),
    getBankAccountOptions(),
    getActivityOptions(),
    getPartyOptions(),
    getPoojaTypes(),
    getPoojas(),
  ]);

  return (
    <PageShell>
      <VoucherRegister
        kind="receipt"
        title="Receipt Vouchers"
        description="Every rupee received by the temple — hundial, sponsorships, donations and rent."
        initialVouchers={initialVouchers}
        accounts={accounts}
        funds={funds}
        projects={projects}
        bankAccounts={bankAccounts}
        activities={activities}
        parties={parties}
        poojaTypes={poojaTypes}
        poojas={poojas}
        access={access}
        user={user}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
