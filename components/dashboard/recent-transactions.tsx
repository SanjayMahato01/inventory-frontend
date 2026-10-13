'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TransactionTable } from '@/components/transaction/transaction-table';

export function RecentTransactions() {
  return (
    <Card className="mt-6 border-border/70 shadow-none">
      <CardHeader className="flex-col items-start gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <CardTitle className="text-base">Recent transactions</CardTitle>
          <CardDescription>Your latest stock movements</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <TransactionTable limit={5} />
      </CardContent>

      {/* Footer — full-width link, matches the low-stock card */}
      <div className="border-t border-border/60">
        <Link
          href="/transactions"
          className="group flex items-center justify-between gap-2 px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          <span>View all transactions</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </Card>
  );
}