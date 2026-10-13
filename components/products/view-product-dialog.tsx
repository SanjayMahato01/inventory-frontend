'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  Calculator,
  CalendarClock,
  CalendarPlus,
  Hash,
  IndianRupee,
  Layers,
  Package,
  PackageX,
  StickyNote,
  Tag,
  TrendingDown,
} from 'lucide-react';
import { useGetProductQuery, type Product } from '@/lib/features/api/productApi';

export function ViewProductDialog({
  product,
  open,
  setOpen,
}: {
  product: Product | null;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { data, isLoading, isError, isFetching } = useGetProductQuery(
    product?.id ?? '',
    {
      skip: !product?.id,
      refetchOnMountOrArgChange: true, // always fetch fresh on open
    },
  );

  // Drop stale cache whose id no longer matches the selected product.
  const freshData =
    data?.product && data.product.id === product?.id ? data.product : undefined;
  const detail = freshData ?? product;
  const loading = isLoading || isFetching;

  const totalPrice = detail ? detail.price * detail.quantity : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl overflow-hidden p-0 gap-0">
        {/* ── Hero header ─────────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-6 pt-6 pb-5">
          {/* animated blobs */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl animate-pulse [animation-delay:1s]" />

          <DialogHeader className="relative space-y-2">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-background/80 shadow-sm ring-1 ring-border/50 backdrop-blur">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="truncate text-lg font-semibold tracking-tight">
                  {loading && !detail?.name ? (
                    <Skeleton className="h-6 w-40" />
                  ) : (
                    detail?.name ?? 'Product'
                  )}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-1.5 text-xs">
                  <Hash className="h-3 w-3" />
                  {loading && !detail?.sku ? (
                    <Skeleton className="h-3 w-24" />
                  ) : (
                    <span className="font-mono">{detail?.sku ?? '—'}</span>
                  )}
                </DialogDescription>
              </div>
              <div className="ml-auto">
                {detail && (
                  <StatusBadge
                    quantity={detail.quantity}
                    minimum={detail.minimum}
                  />
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        <Separator />

        {/* ── Body ────────────────────────────────────────────────── */}
        <div className="relative px-6 py-5">
          {/* subtle refreshing indicator */}
          {isFetching && !isLoading && (
            <div className="absolute right-6 top-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Refreshing…
            </div>
          )}

          {loading && !detail ? (
            <LoadingSkeleton />
          ) : isError ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <p className="text-sm font-medium">Couldn’t load product</p>
              <p className="text-xs text-muted-foreground">
                Something went wrong while fetching details.
              </p>
            </div>
          ) : detail ? (
            <div key={detail.id} className="space-y-5">
              {/* ── Price breakdown ─────────────────────────────── */}
              <div className="grid grid-cols-3 gap-3">
                <HighlightCard
                  icon={<IndianRupee className="h-4 w-4" />}
                  label="Unit price"
                  value={detail.price.toLocaleString(undefined, {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 2,
                  })}
                  sub="per unit"
                  delay={0}
                />
                <HighlightCard
                  icon={<Layers className="h-4 w-4" />}
                  label="In stock"
                  value={String(detail.quantity)}
                  sub={`min ${detail.minimum}`}
                  delay={60}
                />
                <HighlightCard
                  icon={<Calculator className="h-4 w-4" />}
                  label="Total value"
                  value={totalPrice.toLocaleString(undefined, {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 2,
                  })}
                  sub={`${detail.quantity} × unit`}
                  delay={120}
                  accent
                />
              </div>

              {/* ── Price breakdown strip ──────────────────────── */}
              <div
                className="animate-in fade-in slide-in-from-bottom-2 flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs duration-500 fill-mode-both"
                style={{ animationDelay: '160ms' }}
              >
                <span className="text-muted-foreground">Price × Quantity</span>
                <span className="font-mono tabular-nums text-muted-foreground">
                  {detail.price.toLocaleString(undefined, {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 2,
                  })}{' '}
                  × {detail.quantity} =
                </span>
                <span className="font-semibold tabular-nums text-foreground">
                  {totalPrice.toLocaleString(undefined, {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              {/* ── Details grid ───────────────────────────────── */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <DetailRow
                  icon={<Tag className="h-3.5 w-3.5" />}
                  label="Category"
                  value={detail.category ?? '—'}
                  delay={200}
                />
                <DetailRow
                  icon={<TrendingDown className="h-3.5 w-3.5" />}
                  label="Minimum"
                  value={String(detail.minimum)}
                  delay={240}
                />
                <DetailRow
                  icon={<CalendarPlus className="h-3.5 w-3.5" />}
                  label="Created"
                  value={new Date(detail.createdAt).toLocaleString()}
                  delay={280}
                />
                <DetailRow
                  icon={<CalendarClock className="h-3.5 w-3.5" />}
                  label="Updated"
                  value={new Date(detail.updatedAt).toLocaleString()}
                  delay={320}
                />
              </div>

              {detail.remarks && (
                <div
                  className="animate-in fade-in slide-in-from-bottom-2 rounded-lg border border-border/60 bg-muted/40 p-3 duration-500 fill-mode-both"
                  style={{ animationDelay: '360ms' }}
                >
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <StickyNote className="h-3.5 w-3.5" />
                    Remarks
                  </div>
                  <p className="text-sm leading-relaxed">{detail.remarks}</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

function HighlightCard({
  icon,
  label,
  value,
  sub,
  delay = 0,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  delay?: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`animate-in fade-in slide-in-from-bottom-2 group relative overflow-hidden rounded-xl border p-3 transition-all duration-300 hover:shadow-sm fill-mode-both ${
        accent
          ? 'border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 hover:border-primary/50'
          : 'border-border/60 bg-card hover:border-primary/40'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`flex items-center gap-1.5 text-xs font-medium ${
          accent ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        <span className={accent ? 'text-primary' : 'text-primary'}>{icon}</span>
        {label}
      </div>
      <div className="mt-1.5 text-lg font-semibold tracking-tight">
        {value}
      </div>
      {sub && (
        <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-primary/60 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay?: number;
}) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
      style={{ animationDelay: `${delay}ms` }}
    >
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium">{value}</dd>
    </div>
  );
}

function StatusBadge({
  quantity,
  minimum,
}: {
  quantity: number;
  minimum: number;
}) {
  const config =
    quantity <= 0
      ? {
          label: 'Out of stock',
          icon: <PackageX className="h-3 w-3" />,
          cls: 'border-destructive/30 bg-destructive/10 text-destructive',
          dot: 'bg-destructive',
        }
      : quantity <= minimum
        ? {
            label: 'Low stock',
            icon: <TrendingDown className="h-3 w-3" />,
            cls: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
            dot: 'bg-amber-500',
          }
        : {
            label: 'In stock',
            icon: <Package className="h-3 w-3" />,
            cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            dot: 'bg-emerald-500',
          };

  return (
    <Badge
      variant="outline"
      className={`animate-in zoom-in-95 fade-in gap-1.5 border px-2.5 py-1 font-medium duration-300 ${config.cls}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${config.dot}`}
        />
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${config.dot}`}
        />
      </span>
      {config.label}
    </Badge>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-[78px] rounded-xl" />
        <Skeleton className="h-[78px] rounded-xl" />
        <Skeleton className="h-[78px] rounded-xl" />
      </div>
      <Skeleton className="h-8 w-full rounded-lg" />
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  );
}