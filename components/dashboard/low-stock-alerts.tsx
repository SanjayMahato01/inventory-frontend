'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Package,
  PackageX,
  TrendingDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useListLowStockProductsQuery } from '@/lib/features/api/productApi';
import { cn } from '@/lib/utils';

type Severity = {
  label: string;
  icon: typeof AlertTriangle;
  rowClass: string;
  iconClass: string;
  barClass: string;
  textClass: string;
};

function getSeverity(quantity: number, minimum: number): Severity {
  const ratio = minimum > 0 ? quantity / minimum : 1;

  if (quantity <= 0) {
    return {
      label: 'Out of stock',
      icon: PackageX,
      rowClass: 'border-l-destructive',
      iconClass: 'bg-destructive/10 text-destructive',
      barClass: 'bg-destructive',
      textClass: 'text-destructive',
    };
  }
  if (ratio <= 0.5) {
    return {
      label: 'Critical',
      icon: AlertTriangle,
      rowClass: 'border-l-destructive',
      iconClass: 'bg-destructive/10 text-destructive',
      barClass: 'bg-destructive',
      textClass: 'text-destructive',
    };
  }
  return {
    label: 'Low',
    icon: TrendingDown,
    rowClass: 'border-l-amber-500',
    iconClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    barClass: 'bg-amber-500',
    textClass: 'text-amber-600 dark:text-amber-400',
  };
}

export function LowStockAlerts() {
  const { data, isLoading, isFetching } = useListLowStockProductsQuery(
    {
      page: 1,
      limit: 5,
      sort: 'quantity',
      order: 'asc',
    },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    },
  );

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <Card className="border-border/70 shadow-none">
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div className="min-w-0">
          <CardTitle className="text-base">Low stock alerts</CardTitle>
          <CardDescription>Items that need your attention</CardDescription>
        </div>
        {total > 0 && (
          <Badge
            variant="outline"
            className="shrink-0 border-destructive/20 bg-destructive/10 text-destructive"
          >
            {total}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <AlertsSkeleton rows={5} />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <ul
            className={cn(
              'space-y-2 transition-opacity',
              isFetching && 'opacity-60',
            )}
          >
            {items.map((product) => {
              const severity = getSeverity(product.quantity, product.minimum);
              const SeverityIcon = severity.icon;
              const deficit = Math.max(0, product.minimum - product.quantity);
              const pct =
                product.minimum > 0
                  ? Math.min(100, (product.quantity / product.minimum) * 100)
                  : 100;

              return (
                <li
                  key={product.id}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border border-border/60 border-l-[3px] bg-card p-2.5 pl-3 transition-colors hover:bg-muted/40',
                    severity.rowClass,
                  )}
                >
                  <div
                    className={cn(
                      'grid size-9 shrink-0 place-items-center rounded-lg',
                      severity.iconClass,
                    )}
                  >
                    <SeverityIcon className="size-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium leading-tight">
                        {product.name}
                      </p>
                      <span
                        className={cn(
                          'shrink-0 text-[10px] font-semibold uppercase tracking-wide',
                          severity.textClass,
                        )}
                      >
                        {severity.label}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="absolute inset-y-0 left-1/3 w-px bg-foreground/25" />
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            severity.barClass,
                          )}
                          style={{ width: `${Math.max(3, pct)}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                        <span
                          className={cn('font-semibold', severity.textClass)}
                        >
                          {product.quantity}
                        </span>
                        /{product.minimum}
                      </span>
                    </div>

                    {deficit > 0 && (
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {deficit} unit{deficit === 1 ? '' : 's'} below minimum
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      <div className="border-t border-border/60">
        <Link
          href="/low-stock"
          className="group flex items-center justify-between gap-2 px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          <span>View all alerts</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/20 py-8 text-center">
      <div className="grid size-11 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <Package className="size-5" />
      </div>
      <p className="text-sm font-medium">All stocked up</p>
      <p className="text-xs text-muted-foreground">
        No products below their minimum level.
      </p>
    </div>
  );
}

function AlertsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-lg border border-border/60 border-l-[3px] border-l-muted bg-card p-2.5 pl-3"
        >
          <Skeleton className="size-9 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-1.5 flex-1 rounded-full" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}