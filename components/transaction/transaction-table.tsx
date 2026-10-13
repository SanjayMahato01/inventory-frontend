'use client';

import { useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  MoreHorizontal,
  Eye,
  Package,
  User,
  Clock,
  Hash,
  StickyNote,
  Boxes,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useListTransactionsQuery,
  type Transaction,
} from '@/lib/features/api/transactionApi';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TransactionTable({
  productId,
  type,
  limit = 10,
}: {
  productId?: string;
  type?: 'IN' | 'OUT';
  limit?: number;
}) {
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Transaction | null>(null);

  const { data, isLoading, isFetching, error } = useListTransactionsQuery(
    { productId, type, page, limit },
    { refetchOnMountOrArgChange: true },
  );

  if (error) {
    return (
      <p className="p-6 text-sm text-destructive">
        Failed to load transactions.
      </p>
    );
  }

  const items = data?.items ?? [];

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="h-11 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Product
                </TableHead>
                <TableHead className="h-11 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Type
                </TableHead>
                <TableHead className="h-11 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Qty
                </TableHead>
                <TableHead className="h-11 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Note
                </TableHead>
                <TableHead className="h-11 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Date
                </TableHead>
                <TableHead className="hidden h-11 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
                  Recorded by
                </TableHead>
                <TableHead className="h-11 w-[1%]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TransactionSkeleton rows={limit} />
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
                        <Boxes className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-foreground">
                        No transactions yet
                      </p>
                      <p className="text-xs">
                        Stock movements will appear here.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TransactionRow
                    key={item.id}
                    item={item}
                    loading={isFetching}
                    onView={() => setViewing(item)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Page <span className="font-medium text-foreground">{data.page}</span> of{' '}
              {data.totalPages} · {data.total} total
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.page >= data.totalPages || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── View dialog ─────────────────────────────────────── */}
      <Dialog
        open={!!viewing}
        onOpenChange={(v) => {
          if (!v) setViewing(null);
        }}
      >
        <DialogContent className="sm:max-w-md overflow-hidden p-0 gap-0">
          {viewing && <TransactionDetail item={viewing} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─────────────────────────── Row ─────────────────────────── */

function TransactionRow({
  item,
  loading,
  onView,
}: {
  item: Transaction;
  loading?: boolean;
  onView: () => void;
}) {
  const isIn = item.type === 'IN';

  const productLabel =
    item.product?.name?.trim() ||
    item.product?.sku?.trim() ||
    `#${item.productId.slice(0, 6)}`;

  const recordedBy =
    item.user?.name?.trim() ||
    item.user?.email?.trim() ||
    (item.userId.length > 8 ? `${item.userId.slice(0, 6)}…` : item.userId);

  return (
    <TableRow
      className={`group border-border/40 transition-colors hover:bg-muted/40 ${
        loading ? 'opacity-60' : ''
      }`}
    >
      {/* Product */}
      <TableCell className="py-3">
        <div className="flex items-center gap-3">
          <div
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ${
              isIn
                ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:text-rose-400'
            }`}
          >
            {isIn ? (
              <ArrowDownToLine className="h-4 w-4" />
            ) : (
              <ArrowUpFromLine className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate font-medium leading-tight">
              {productLabel}
            </div>
            <div className="truncate text-[11px] text-muted-foreground">
              {item.product?.sku ?? `#${item.productId.slice(0, 6)}`}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Type */}
      <TableCell className="py-3">
        <Badge
          variant="outline"
          className={`gap-1.5 border px-2.5 py-0.5 font-medium ${
            isIn
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isIn ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
          {isIn ? 'Stock in' : 'Stock out'}
        </Badge>
      </TableCell>

      {/* Qty */}
      <TableCell className="py-3 text-right">
        <span
          className={`font-medium tabular-nums ${
            isIn
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {isIn ? '+' : '−'}
          {item.quantity}
        </span>
      </TableCell>

      {/* Note */}
      <TableCell className="max-w-[18rem] py-3">
        {item.note ? (
          <span className="block truncate text-sm text-muted-foreground">
            {item.note}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground/60">—</span>
        )}
      </TableCell>

      {/* Date */}
      <TableCell className="py-3 text-sm text-muted-foreground">
        {formatDate(item.createdAt)}
      </TableCell>

      {/* Recorded by */}
      <TableCell className="hidden py-3 text-sm text-muted-foreground md:table-cell">
        {recordedBy}
      </TableCell>

      {/* Actions */}
      <TableCell className="py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-60 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onView}>
              <Eye className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

/* ─────────────────────────── Detail dialog body ─────────────────────────── */

function TransactionDetail({ item }: { item: Transaction }) {
  const isIn = item.type === 'IN';
  const productLabel =
    item.product?.name?.trim() ||
    item.product?.sku?.trim() ||
    `#${item.productId.slice(0, 6)}`;
  const recordedBy =
    item.user?.name?.trim() ||
    item.user?.email?.trim() ||
    (item.userId.length > 8 ? `${item.userId.slice(0, 6)}…` : item.userId);

  return (
    <>
      {/* Hero */}
      <div
        className={`relative overflow-hidden px-6 pt-6 pb-5 ${
          isIn
            ? 'bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent'
            : 'bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-transparent'
        }`}
      >
        <div
          className={`pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl animate-pulse ${
            isIn ? 'bg-emerald-500/20' : 'bg-rose-500/20'
          }`}
        />
        <DialogHeader className="relative">
          <div className="flex items-center gap-3">
            <div
              className={`grid h-11 w-11 place-items-center rounded-xl bg-background/80 shadow-sm ring-1 backdrop-blur ${
                isIn
                  ? 'text-emerald-600 ring-emerald-500/20 dark:text-emerald-400'
                  : 'text-rose-600 ring-rose-500/20 dark:text-rose-400'
              }`}
            >
              {isIn ? (
                <ArrowDownToLine className="h-5 w-5" />
              ) : (
                <ArrowUpFromLine className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold tracking-tight">
                {isIn ? 'Stock in' : 'Stock out'}
              </DialogTitle>
              <DialogDescription className="truncate text-xs">
                {productLabel}
              </DialogDescription>
            </div>
            <div className="ml-auto">
              <Badge
                variant="outline"
                className={`border font-medium ${
                  isIn
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                }`}
              >
                {isIn ? '+' : '−'}
                {item.quantity} units
              </Badge>
            </div>
          </div>
        </DialogHeader>
      </div>

      <Separator />

      {/* Body */}
      <div className="space-y-5 px-6 py-5">
        {/* Big quantity highlight */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className={`relative overflow-hidden rounded-xl border p-3 ${
              isIn
                ? 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5'
                : 'border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-rose-500/5'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Boxes className="h-3.5 w-3.5" />
              Quantity
            </div>
            <div
              className={`mt-1.5 text-2xl font-semibold tracking-tight tabular-nums ${
                isIn
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isIn ? '+' : '−'}
              {item.quantity}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">units</div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Recorded
            </div>
            <div className="mt-1.5 text-sm font-semibold leading-tight">
              {new Date(item.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
              })}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {new Date(item.createdAt).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <DetailRow
            icon={<Package className="h-3.5 w-3.5" />}
            label="Product"
            value={productLabel}
          />
          <DetailRow
            icon={<Hash className="h-3.5 w-3.5" />}
            label="SKU"
            value={item.product?.sku ?? `#${item.productId.slice(0, 6)}`}
          />
          <DetailRow
            icon={<User className="h-3.5 w-3.5" />}
            label="Recorded by"
            value={recordedBy}
          />
          <DetailRow
            icon={<Hash className="h-3.5 w-3.5" />}
            label="Transaction ID"
            value={`#${item.id.slice(0, 8)}`}
          />
        </div>

        {item.note && (
          <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <StickyNote className="h-3.5 w-3.5" />
              Note
            </div>
            <p className="text-sm leading-relaxed">{item.note}</p>
          </div>
        )}
      </div>
    </>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium">{value}</dd>
    </div>
  );
}

/* ─────────────────────────── Skeleton ─────────────────────────── */

function TransactionSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="border-border/40">
          <TableCell className="py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
          </TableCell>
          <TableCell className="py-3">
            <Skeleton className="h-6 w-24 rounded-full" />
          </TableCell>
          <TableCell className="py-3 text-right">
            <Skeleton className="ml-auto h-4 w-12" />
          </TableCell>
          <TableCell className="py-3">
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell className="py-3">
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell className="hidden py-3 md:table-cell">
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell className="py-3 text-right">
            <Skeleton className="ml-auto h-8 w-8 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}