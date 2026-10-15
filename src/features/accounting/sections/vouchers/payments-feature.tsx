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
  getPoojas,
  getProjectOptions,
  getVouchersOfKind,
} from '../../lib/accounting-service';

export async function PaymentVouchersFeature() {
  const { user, permissions } = await requireSession();
  const access = getAccountingAccess(permissions);

  if (!access.canViewPayments) {
    return (
      <PageShell>
        <AccessDenied description="Ask an administrator for access." />
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
      poojas,
  ] = await Promise.all([
    getVouchersOfKind('payment'),
    getPostableAccounts(),
    getFundOptions(),
    getProjectOptions(),
    getBankAccountOptions(),
    getActivityOptions(),
    getPartyOptions(),
    getPoojas(),
  ]);

  return (
    <PageShell>
      <VoucherRegister
        kind="payment"
        title="Payment Vouchers"
        description="Money paid out by the temple."
        initialVouchers={initialVouchers}
        accounts={accounts}
        funds={funds}
        projects={projects}
        bankAccounts={bankAccounts}
        activities={activities}
        parties={parties}
        poojas={poojas}
        access={access}
        user={user}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
