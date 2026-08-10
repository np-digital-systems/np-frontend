import React from 'react';
import { DashboardHeader } from './dashboard-header';
import { AccountantIncomeChart } from './accountant-income-chart';
import { AccountantCashBook } from './accountant-cash-book';
import { AccountantApprovals } from './accountant-approvals';
import { AccountantBankAccounts } from './accountant-bank-accounts';
import { AccountantTransactions } from './accountant-transactions';
import { AccountantFundSummary } from './accountant-fund-summary';
import { KpiCard } from '../components';

export function AccountantDashboard() {
  return (
    <div>
      <DashboardHeader name="K. Keeththigan" role="Accountant" />

      {/* 6 KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <KpiCard label="Cash Balance" value="₹1,25,450" sub="As of today" />
        <KpiCard label="Bank Balance" value="₹5,70,000" sub="2 accounts" />
        <KpiCard label="Today's Income" value="₹35,000" trend="+18.2%" positive />
        <KpiCard label="Today's Expenses" value="₹18,500" trend="+4.1%" positive={false} />
        <KpiCard label="Pending Approvals" value="8" sub="5 receipts · 3 payments" emphasis />
        <KpiCard label="Monthly Net" value="₹1,25,200" trend="+12.4%" positive />
      </div>

      {/* Chart + Cash Book */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
        <div className="lg:col-span-3">
          <AccountantIncomeChart />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-5">
          <AccountantCashBook />
        </div>
      </div>

      {/* Approvals + Bank */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <AccountantApprovals />
        <AccountantBankAccounts />
      </div>

      {/* Transactions table */}
      <div className="mb-5">
        <AccountantTransactions />
      </div>

      {/* Fund summary */}
      <AccountantFundSummary />
    </div>
  );
}
