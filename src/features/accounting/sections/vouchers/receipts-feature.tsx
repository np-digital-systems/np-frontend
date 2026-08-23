import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
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
  const user = await getCurrentUser();
  const access = getAccountingAccess(user.role);

  if (!access.canViewReceipts) {
    return (
      <PageShell>
        <AccessDenied description="Receipt vouchers are available to temple accounting staff. Contact an administrator if you need access." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <VoucherRegister
        kind="receipt"
        title="Receipt Vouchers"
        description="Every rupee received by the temple — hundial, sponsorships, donations and rent."
        initialVouchers={getVouchersOfKind('receipt')}
        accounts={getPostableAccounts()}
        funds={getFundOptions()}
        projects={getProjectOptions()}
        bankAccounts={getBankAccountOptions()}
        poojaTypes={getPoojaTypes()}
        poojas={getPoojas()}
        access={access}
        user={user}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
