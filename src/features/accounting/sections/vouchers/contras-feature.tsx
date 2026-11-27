import { AccessDenied, PageShell } from '@/components/portal/ui';
import { requireSession } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { VoucherRegister } from '../../components/voucher-register';
import { getAccountingAccess } from '../../lib/accounting-access';
import {
  getBankAccountRecords,
  getFundOptions,
  getPostableAccounts,
  getVouchersOfKind,
} from '../../lib/accounting-service';
import type { MoneyAccount } from '../../types';

export async function ContraVouchersFeature() {
  const { user, permissions } = await requireSession();
  const access = getAccountingAccess(permissions);

  if (!access.canViewContras) {
    return (
      <PageShell>
        <AccessDenied description="Ask an administrator for access." />
      </PageShell>
    );
  }

  const [initialVouchers, accounts, funds, banks] = await Promise.all([
    getVouchersOfKind('contra'),
    getPostableAccounts(),
    getFundOptions(),
    getBankAccountRecords(),
  ]);

  const cash = accounts.find((account) => account.moneyHead === 'cash');

  const moneyAccounts: MoneyAccount[] = [
    ...(cash
      ? [{ key: 'cash', label: cash.name, accountId: cash.id, bankAccountId: null }]
      : []),
    ...banks
      .filter((bank) => bank.isActive)
      .map((bank) => ({
        key: `bank:${bank.id}`,
        label: bank.label,
        accountId: bank.ledgerAccountId,
        bankAccountId: bank.id,
      })),
  ];

  return (
    <PageShell>
      <VoucherRegister
        kind="contra"
        title="Contra Vouchers"
        description="Money moved between cash and the bank."
        initialVouchers={initialVouchers}
        accounts={accounts}
        funds={funds}
        projects={[]}
        bankAccounts={[]}
        activities={[]}
        parties={[]}
        poojas={[]}
        moneyAccounts={moneyAccounts}
        access={access}
        user={user}
        year={getActiveYear(getToday())}
      />
    </PageShell>
  );
}
