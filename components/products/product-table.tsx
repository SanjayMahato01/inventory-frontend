'use client';

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
  PackagePlus,
  PackageMinus,
  Eye,
  Pencil,
  Trash2,
  Package,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Product } from '@/lib/features/api/productApi';

export type SortField =
  | 'name'
  | 'sku'
  | 'category'
  | 'price'
  | 'quantity'
  | 'createdAt';
export type SortOrder = 'asc' | 'desc';

function getStatus(p: Product) {
  if (p.quantity <= 0) {
    return {
      label: 'Out of stock',
      dot: 'bg-destructive',
      text: 'text-destructive',
      bg: 'bg-destructive/10',
      border: 'border-destructive/20',
    };
  }
  if (p.quantity <= p.minimum) {
    return {
      label: 'Low stock',
      dot: 'bg-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    };
  }
  return {
    label: 'In stock',
    dot: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  };
}

export function ProductTable({
  products,
  loading,
  sort,
  order,
  onSortChange,
  onEdit,
  onDelete,
  onStockIn,
  onStockOut,
  onView,
}: {
  products: Product[];
  loading?: boolean;
  sort: SortField;
  order: SortOrder;
  onSortChange: (field: SortField) => void;
  onEdit: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onStockIn: (product: Product) => void;
  onStockOut: (product: Product) => void;
  onView: (product: Product) => void;
}) {
  const SortButton = ({
    field,
    children,
    align = 'left',
  }: {
    field: SortField;
    children: React.ReactNode;
    align?: 'left' | 'right';
  }) => {
    const active = sort === field;
    const Icon = !active ? ArrowUpDown : order === 'asc' ? ArrowUp : ArrowDown;
    return (
      <Button
        variant="ghost"
        size="sm"
        className={`group -ml-3 h-8 gap-1.5 rounded-md px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[state=active]:text-foreground ${
          align === 'right' ? 'ml-auto' : ''
        }`}
        data-state={active ? 'active' : undefined}
        onClick={() => onSortChange(field)}
      >
        {children}
        <Icon
          className={`h-3.5 w-3.5 transition-opacity ${
            active ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'
          }`}
        />
      </Button>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            <TableHead className="h-11">
              <SortButton field="name">Name</SortButton>
            </TableHead>
            <TableHead className="h-11">
              <SortButton field="sku">SKU</SortButton>
            </TableHead>
            <TableHead className="h-11">
              <SortButton field="category">Category</SortButton>
            </TableHead>
            <TableHead className="h-11 text-right">
              <SortButton field="price" align="right">
                Unit price
              </SortButton>
            </TableHead>
            <TableHead className="h-11 text-right">
              <SortButton field="quantity" align="right">
                Qty
              </SortButton>
            </TableHead>
            <TableHead className="h-11">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </span>
            </TableHead>
            <TableHead className="h-11 w-[1%]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && products.length === 0 ? (
            <ProductSkeleton rows={10} />
          ) : products.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-32 text-center text-sm text-muted-foreground"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground">No products found</p>
                  <p className="text-xs">
                    Try adjusting your search or filters.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            products.map((p) => {
              const status = getStatus(p);
              const stockPct =
                p.minimum > 0
                  ? Math.min(
                      100,
                      Math.round((p.quantity / (p.minimum * 3)) * 100),
                    )
                  : 100;

              return (
                <TableRow
                  key={p.id}
                  className="group border-border/40 transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted"
                >
                  {/* Name */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 text-xs font-semibold uppercase text-primary ring-1 ring-primary/10">
                        {p.name.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium leading-tight">
                          {p.name}
                        </div>
                        <div className="truncate text-[11px] text-muted-foreground">
                          {p.category ?? 'Uncategorized'}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* SKU */}
                  <TableCell className="py-3">
                    <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                      {p.sku}
                    </span>
                  </TableCell>

                  {/* Category */}
                  <TableCell className="py-3">
                    <span className="inline-flex items-center gap-1.5 capitalize text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                      {p.category ?? '—'}
                    </span>
                  </TableCell>

                  {/* Unit Price — 👇 per unit, not the total */}
                  <TableCell className="py-3 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-medium tabular-nums">
                        {p.price.toLocaleString(undefined, {
                          style: 'currency',
                          currency: 'INR',
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        per unit
                      </span>
                    </div>
                  </TableCell>

                  {/* Qty with mini bar */}
                  <TableCell className="py-3 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-medium tabular-nums">
                        {p.quantity}
                      </span>
                      <div className="h-1 w-14 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${status.dot}`}
                          style={{ width: `${stockPct}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.text} ${status.border}`}
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span
                          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${status.dot}`}
                        />
                        <span
                          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${status.dot}`}
                        />
                      </span>
                      {status.label}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-60 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onView(p)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(p)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onStockIn(p)}>
                          <PackagePlus className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          Stock in
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onStockOut(p)}
                          disabled={p.quantity <= 0}
                        >
                          <PackageMinus className="mr-2 h-4 w-4 text-amber-600 dark:text-amber-400" />
                          Stock out
                        </DropdownMenuItem>
                        {onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(p)}
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function ProductSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="border-border/40">
          <TableCell className="py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
          </TableCell>
          <TableCell className="py-3">
            <Skeleton className="h-5 w-20 rounded-md" />
          </TableCell>
          <TableCell className="py-3">
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className="py-3 text-right">
            <div className="flex flex-col items-end gap-1.5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-2.5 w-12" />
            </div>
          </TableCell>
          <TableCell className="py-3 text-right">
            <Skeleton className="ml-auto h-4 w-10" />
          </TableCell>
          <TableCell className="py-3">
            <Skeleton className="h-6 w-24 rounded-full" />
          </TableCell>
          <TableCell className="py-3 text-right">
            <Skeleton className="ml-auto h-8 w-8 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}