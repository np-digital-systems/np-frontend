import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { VoucherRegister } from '../../components/voucher-register';
import { getAccountingAccess } from '../../lib/accounting-access';
import {
  getFundOptions,
  getPartyOptions,
  getPostableAccounts,
  getVouchersOfKind,
} from '../../lib/accounting-service';

export async function JournalVouchersFeature() {
  const { user, permissions } = await requireSession();
  const access = getAccountingAccess(permissions);

  if (!access.canViewJournals) {
    return (
      <PageShell>
        <AccessDenied description="Ask an administrator for access." />
      </PageShell>
    );
  }

  const [initialVouchers, accounts, funds, parties] = await Promise.all([
    getVouchersOfKind('journal'),
    getPostableAccounts(),
    getFundOptions(),
    getPartyOptions(),
  ]);

  return (
    <PageShell>
      <VoucherRegister
        kind="journal"
        title="Journal Vouchers"
        description="Entries where no money moves."
        initialVouchers={initialVouchers}
        accounts={accounts}
        funds={funds}
        projects={[]}
        bankAccounts={[]}
        activities={[]}
        parties={parties}
        poojas={[]}
        access={access}
        user={user}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
