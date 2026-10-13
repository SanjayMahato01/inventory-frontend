'use client';

import {
  AlertTriangle,
  ArrowRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  BellRing,
  PackagePlus,
  PackageX,
  TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/lib/features/api/productApi';

export type SortField = 'name' | 'sku' | 'quantity' | 'minimum' | 'deficit';
export type SortOrder = 'asc' | 'desc';

function getSeverity(p: Product) {
  const ratio = p.minimum > 0 ? p.quantity / p.minimum : 1;

  if (p.quantity <= 0) {
    return {
      level: 'critical' as const,
      label: 'Out of stock',
      icon: PackageX,
      accent: 'border-l-destructive',
      iconBg: 'bg-destructive/10 text-destructive',
      text: 'text-destructive',
      chipBg: 'bg-destructive/10',
      chipText: 'text-destructive',
      chipBorder: 'border-destructive/20',
      dot: 'bg-destructive',
      bar: 'bg-destructive',
      headline: 'is out of stock',
      hint: 'Restock now to keep fulfilling orders.',
    };
  }
  if (ratio <= 0.5) {
    return {
      level: 'high' as const,
      label: 'Critical',
      icon: AlertTriangle,
      accent: 'border-l-destructive',
      iconBg: 'bg-destructive/10 text-destructive',
      text: 'text-destructive',
      chipBg: 'bg-destructive/10',
      chipText: 'text-destructive',
      chipBorder: 'border-destructive/20',
      dot: 'bg-destructive',
      bar: 'bg-destructive',
      headline: 'is running critically low',
      hint: 'Only a little left — restock soon.',
    };
  }
  return {
    level: 'low' as const,
    label: 'Low',
    icon: TrendingDown,
    accent: 'border-l-amber-500',
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
    chipBg: 'bg-amber-500/10',
    chipText: 'text-amber-600 dark:text-amber-400',
    chipBorder: 'border-amber-500/20',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
    headline: 'is getting low',
    hint: 'Consider restocking before it runs out.',
  };
}

export function LowStockTable({
  products,
  loading,
  sort,
  order,
  onSortChange,
  onStockIn,
}: {
  products: Product[];
  loading?: boolean;
  sort: SortField;
  order: SortOrder;
  onSortChange: (field: SortField) => void;
  onStockIn: (product: Product) => void;
}) {
  const SortPill = ({
    field,
    label,
  }: {
    field: SortField;
    label: string;
  }) => {
    const active = sort === field;
    const Icon = !active ? ArrowUpDown : order === 'asc' ? ArrowUp : ArrowDown;
    return (
      <button
        type="button"
        onClick={() => onSortChange(field)}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
          active
            ? 'border-primary/30 bg-primary/10 text-primary'
            : 'border-border/60 bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
      >
        {label}
        <Icon className="h-3 w-3 opacity-70" />
      </button>
    );
  };

  return (
    <div className="space-y-3">
      {/* Sort pills — horizontally scrollable on mobile */}
      <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Sort by
        </span>
        <SortPill field="deficit" label="Urgency" />
        <SortPill field="quantity" label="On hand" />
        <SortPill field="minimum" label="Minimum" />
        <SortPill field="name" label="Name" />
      </div>

      {loading && products.length === 0 ? (
        <FeedSkeleton rows={6} />
      ) : products.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-2.5">
          {products.map((p) => {
            const severity = getSeverity(p);
            const SeverityIcon = severity.icon;
            const deficit = Math.max(0, p.minimum - p.quantity);
            const pct =
              p.minimum > 0
                ? Math.min(100, Math.round((p.quantity / p.minimum) * 100))
                : 100;

            return (
              <li
                key={p.id}
                className={`group relative overflow-hidden rounded-xl border border-border/60 border-l-4 bg-card p-3 pl-4 transition-all hover:border-border hover:shadow-sm sm:p-4 sm:pl-5 ${severity.accent}`}
              >
                <div className="flex items-start gap-3 sm:gap-3.5">
                  {/* Alert icon with pulse for urgent */}
                  <div
                    className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-full sm:h-10 sm:w-10 ${severity.iconBg}`}
                  >
                    <SeverityIcon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                    {severity.level !== 'low' && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                        <span
                          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${severity.dot}`}
                        />
                        <span
                          className={`relative inline-flex h-2.5 w-2.5 rounded-full ring-2 ring-background ${severity.dot}`}
                        />
                      </span>
                    )}
                  </div>

                  {/* Notification content */}
                  <div className="min-w-0 flex-1">
                    {/* Headline */}
                    <p className="text-sm leading-snug">
                      <span className="font-semibold">{p.name}</span>{' '}
                      <span className={severity.text}>{severity.headline}</span>
                    </p>

                    {/* Hint — hidden on very small screens to reduce clutter */}
                    <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">
                      {severity.hint}
                    </p>

                    {/* Facts row */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] sm:gap-x-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold uppercase tracking-wide ${severity.chipBg} ${severity.chipText} ${severity.chipBorder}`}
                      >
                        <span
                          className={`h-1 w-1 rounded-full ${severity.dot}`}
                        />
                        {severity.label}
                      </span>
                      <span className="text-muted-foreground">
                        <span className={`font-semibold ${severity.text}`}>
                          {p.quantity}
                        </span>{' '}
                        of {p.minimum} min
                      </span>
                      {deficit > 0 && (
                        <span className="font-medium text-destructive">
                          {deficit} short
                        </span>
                      )}
                      {/* SKU + category hidden on smallest screens, shown from sm */}
                      <span className="hidden rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
                        {p.sku}
                      </span>
                      {p.category && (
                        <span className="hidden capitalize text-muted-foreground sm:inline">
                          {p.category}
                        </span>
                      )}
                    </div>

                    {/* Progress bar — full width on mobile, capped on larger */}
                    <div className="relative mt-2.5 h-1 w-full overflow-hidden rounded-full bg-muted sm:max-w-xs">
                      <div className="absolute inset-y-0 left-[33%] w-px bg-foreground/25" />
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${severity.bar}`}
                        style={{ width: `${Math.max(3, pct)}%` }}
                      />
                    </div>

                    {/* Restock — stacked below content on mobile, right-aligned on sm+ */}
                    <div className="mt-3 flex items-center justify-end sm:hidden">
                      <Button
                        variant="default"
                        size="sm"
                        className="h-8 gap-1 px-3 text-xs"
                        onClick={() => onStockIn(p)}
                      >
                        <PackagePlus className="h-3.5 w-3.5" />
                        Restock
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Restock button — only on sm and up (side-by-side layout) */}
                  <div className="hidden shrink-0 items-start sm:flex">
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 gap-1 px-3 text-xs"
                      onClick={() => onStockIn(p)}
                    >
                      <PackagePlus className="h-3.5 w-3.5" />
                      Restock
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-10 text-center sm:py-12">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 sm:h-12 sm:w-12">
        <BellRing className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium sm:text-base">You’re all caught up</p>
      <p className="max-w-xs text-xs text-muted-foreground">
        No stock alerts right now. We’ll let you know the moment something runs
        low.
      </p>
    </div>
  );
}

function FeedSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <ul className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="flex items-start gap-3 rounded-xl border border-border/60 border-l-4 border-l-muted bg-card p-3 pl-4 sm:gap-3.5 sm:p-4 sm:pl-5"
        >
          <Skeleton className="h-9 w-9 shrink-0 rounded-full sm:h-10 sm:w-10" />
          <div className="min-w-0 flex-1 space-y-2.5">
            <Skeleton className="h-4 w-full max-w-[16rem]" />
            <Skeleton className="hidden h-3 w-48 sm:block" />
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="hidden h-3 w-16 sm:block" />
            </div>
            <Skeleton className="h-1 w-full rounded-full sm:w-40" />
          </div>
          <Skeleton className="hidden h-8 w-24 shrink-0 rounded-md sm:block" />
        </li>
      ))}
    </ul>
  );
}