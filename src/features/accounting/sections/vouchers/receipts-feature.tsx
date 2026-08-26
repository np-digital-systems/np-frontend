import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { VoucherRegister } from '../../components/voucher-register';
import { getAccountingAccess } from '../../lib/accounting-access';
import {
  getBankAccountOptions,
  getFundOptions,
  getPostableAccounts,
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
    poojaTypes,
    poojas,
  ] = await Promise.all([
    getVouchersOfKind('receipt'),
    getPostableAccounts(),
    getFundOptions(),
    getProjectOptions(),
    getBankAccountOptions(),
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
        poojaTypes={poojaTypes}
        poojas={poojas}
        access={access}
        user={user}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
