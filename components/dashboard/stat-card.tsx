'use client';

import {
  AlertTriangle,
  ArrowUpFromLine,
  CircleDollarSign,
  Package,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetDashboardSummaryQuery } from '@/lib/features/api/dashboardApi';
import { cn } from '@/lib/utils';

type Tone = 'blue' | 'emerald' | 'amber' | 'violet';

const TONES: Record<
  Tone,
  { tile: string; icon: string; ring: string; glow: string; swatch: string }
> = {
  blue: {
    tile: 'bg-gradient-to-br from-blue-500/15 to-blue-500/5 dark:from-blue-500/25 dark:to-blue-500/10',
    icon: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-500/20',
    glow: 'group-hover:shadow-blue-500/10',
    swatch: 'bg-blue-500',
  },
  emerald: {
    tile: 'bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 dark:from-emerald-500/25 dark:to-emerald-500/10',
    icon: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/20',
    glow: 'group-hover:shadow-emerald-500/10',
    swatch: 'bg-emerald-500',
  },
  amber: {
    tile: 'bg-gradient-to-br from-amber-500/15 to-amber-500/5 dark:from-amber-500/25 dark:to-amber-500/10',
    icon: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/20',
    glow: 'group-hover:shadow-amber-500/10',
    swatch: 'bg-amber-500',
  },
  violet: {
    tile: 'bg-gradient-to-br from-violet-500/15 to-violet-500/5 dark:from-violet-500/25 dark:to-violet-500/10',
    icon: 'text-violet-600 dark:text-violet-400',
    ring: 'ring-violet-500/20',
    glow: 'group-hover:shadow-violet-500/10',
    swatch: 'bg-violet-500',
  },
};

type StatCardProps = {
  title: string;
  value: string;
  detail: string;
  icon: typeof Package;
  tone: Tone;
  loading?: boolean;
  trend?: number;
  /** hide the trend chip (for cards that don't have a comparison) */
  hideTrend?: boolean;
};

export function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  tone,
  loading,
  trend,
  hideTrend,
}: StatCardProps) {
  const isUp = (trend ?? 0) >= 0;
  const TrendIcon = isUp ? TrendingUp : TrendingDown;
  const t = TONES[tone];

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-border/70 shadow-none transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-border hover:shadow-lg',
        t.glow,
      )}
    >
      {/* Top gradient wash (only visible on hover) */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-24 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          tone === 'blue' && 'bg-gradient-to-b from-blue-500/[0.06] to-transparent',
          tone === 'emerald' && 'bg-gradient-to-b from-emerald-500/[0.06] to-transparent',
          tone === 'amber' && 'bg-gradient-to-b from-amber-500/[0.06] to-transparent',
          tone === 'violet' && 'bg-gradient-to-b from-violet-500/[0.06] to-transparent',
        )}
      />

      <CardContent className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* Label */}
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>

            {/* Value */}
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
              {loading ? <Skeleton className="h-7 w-28" /> : value}
            </p>

            {/* Detail / trend chip */}
            <div className="mt-2.5 min-h-[20px]">
              {loading ? (
                <Skeleton className="h-3.5 w-32" />
              ) : hideTrend ? (
                <p className="text-xs text-muted-foreground">{detail}</p>
              ) : (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset',
                    isUp
                      ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400'
                      : 'bg-destructive/10 text-destructive ring-destructive/20',
                  )}
                >
                  <TrendIcon className="h-3 w-3" strokeWidth={2.5} />
                  {detail}
                </span>
              )}
            </div>
          </div>

          {/* Icon tile */}
          <div
            className={cn(
              'relative grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ring-inset transition-transform duration-300 group-hover:scale-105',
              t.tile,
              t.ring,
            )}
          >
            <Icon className={cn('h-5 w-5', t.icon)} strokeWidth={2} />
          </div>
        </div>

        {/* Bottom accent line on hover */}
        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100',
            'bg-gradient-to-r from-transparent via-current to-transparent',
            t.icon,
          )}
        />
      </CardContent>
    </Card>
  );
}

function formatCurrency(n: number) {
  return n.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
}

export function StatGrid() {
  const { data, isLoading } = useGetDashboardSummaryQuery();

  const pctLabel = (p: number | undefined) =>
    p === undefined
      ? '—'
      : `${p >= 0 ? '+' : ''}${p.toFixed(1)}% vs last month`;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total products"
        value={String(data?.totalProducts ?? '—')}
        detail={pctLabel(data?.productsChangePct)}
        trend={data?.productsChangePct}
        icon={Package}
        tone="blue"
        loading={isLoading}
      />
      <StatCard
        title="Stock value"
        value={data ? formatCurrency(data.stockValue) : '—'}
        detail={pctLabel(data?.stockValueChangePct)}
        trend={data?.stockValueChangePct}
        icon={CircleDollarSign}
        tone="emerald"
        loading={isLoading}
      />
      <StatCard
        title="Low stock items"
        value={String(data?.lowStockItems ?? '—')}
        detail={
          data?.lowStockItems
            ? `${data.lowStockItems} need attention today`
            : 'All stocked up'
        }
        icon={AlertTriangle}
        tone="amber"
        loading={isLoading}
        hideTrend
      />
      <StatCard
        title="Stock movements"
        value={String(data?.movementsThisMonth ?? '—')}
        detail={pctLabel(data?.movementsChangePct)}
        trend={data?.movementsChangePct}
        icon={ArrowUpFromLine}
        tone="violet"
        loading={isLoading}
      />
    </div>
  );
}