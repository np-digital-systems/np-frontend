import type { Metadata } from 'next';

import { ContraVouchersFeature } from '@/features/accounting';

export const metadata: Metadata = {
  title: 'Contra Vouchers',
};

export default function ContraVouchersPage() {
  return <ContraVouchersFeature />;
}
