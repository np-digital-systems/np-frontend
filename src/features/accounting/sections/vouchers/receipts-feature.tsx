import { AccessDenied, PageShell } from '@/components/portal/ui';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { VoucherRegister } from '../../components/voucher-register';
import { getAccountingAccess } from '../../lib/accounting-access';
import {
  getBankAccountOptions,
  getFundOptions,
  getPostableAccounts,
  getProjectOptions,
  getVouchersOfKind,
} from '../../lib/accounting-service';

/**
 * Receipt vouchers boundary.
 *
 * Gated on `receipt-voucher:view`, which admin, accountant and cashier all
 * hold — counting money in is the cashier's daily work. Whether the New
 * Receipt button appears is a separate capability, resolved below and passed
 * down as a boolean.
 */
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
        access={access}
        user={user}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
