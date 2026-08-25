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
 * Payment vouchers boundary.
 *
 * Money going out commits the temple to a payee, so while a cashier may
 * draft one, only an approver can move it forward — a distinction the
 * register enforces per row rather than by hiding the screen.
 */
export async function PaymentVouchersFeature() {
  const user = await getCurrentUser();
  const access = getAccountingAccess(user.role);

  if (!access.canViewPayments) {
    return (
      <PageShell>
        <AccessDenied description="Payment vouchers are available to temple accounting staff. Contact an administrator if you need access." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <VoucherRegister
        kind="payment"
        title="Payment Vouchers"
        description="Every rupee paid out — honorarium, materials, utilities, contractors and festival costs."
        initialVouchers={getVouchersOfKind('payment')}
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
