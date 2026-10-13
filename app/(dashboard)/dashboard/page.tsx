'use client';

import { useSelector } from 'react-redux';
import { StatGrid } from '@/components/dashboard/stat-card';
import { InventoryChart } from '@/components/dashboard/inventory-chart';
import { LowStockAlerts } from '@/components/dashboard/low-stock-alerts';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import type { RootState } from '@/lib/store';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getFirstName(name: string | null | undefined, email: string) {
  if (name && name.trim()) {
    return name.trim().split(/\s+/)[0];
  }
  return email.split('@')[0];
}

export default function DashboardPage() {
  const user = useSelector((s: RootState) => s.auth.user);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const greeting = getGreeting();
  const firstName = user ? getFirstName(user.name, user.email) : 'there';

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-muted-foreground">{today}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {greeting}, <span className="capitalize">{firstName}</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your inventory today.
          </p>
        </div>
      </div>

      <StatGrid />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <InventoryChart />
        <LowStockAlerts />
      </div>

      <RecentTransactions />
    </>
  );
}