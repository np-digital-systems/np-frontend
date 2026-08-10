import React from 'react';
import { DashboardHeader } from './dashboard-header';
import { AdminQuickActions } from './admin-quick-actions';
import { AdminFinancialChart } from './admin-financial-chart';
import { AdminPendingApprovals } from './admin-pending-approvals';
import { FundOverview } from './fund-overview';
import { CashPosition } from './cash-position';
import { BankPosition } from './bank-position';
import { UpcomingEvents } from './upcoming-events';
import { RecentActivity } from './recent-activity';
import { KpiCard } from '../components';

export function AdminDashboard() {
  return (
    <div>
      <DashboardHeader name="K. Suresh" role="Admin" />
      <AdminQuickActions />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard label="Cash Balance" value="₹1,25,450" sub="As of today" trend="+₹5,450" positive />
        <KpiCard label="Bank Balance" value="₹5,70,000" sub="2 accounts" />
        <KpiCard label="Festival Fund" value="₹3,20,500" sub="FY 2026" trend="+12.4%" positive />
        <KpiCard label="Thiruppani Fund" value="₹1,85,200" sub="FY 2026" />
      </div>

      {/* Main row: chart + approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2">
          <AdminFinancialChart />
        </div>
        <AdminPendingApprovals />
      </div>

      {/* Second row: funds + cash + bank */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2">
          <FundOverview />
        </div>
        <div className="flex flex-col gap-5">
          <CashPosition />
          <BankPosition />
        </div>
      </div>

      {/* Third row: events + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <UpcomingEvents />
        <RecentActivity />
      </div>
    </div>
  );
}
