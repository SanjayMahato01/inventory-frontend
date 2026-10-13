'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useUpdateProductMutation,
  type Product,
} from '@/lib/features/api/productApi';

export type StockDirection = 'in' | 'out';

export function StockDialog({
  product,
  direction,
  open,
  setOpen,
  onDone,
}: {
  product: Product | null;
  direction: StockDirection;
  open: boolean;
  setOpen: (value: boolean) => void;
  onDone?: () => void;
}) {
  const [updateProduct, { isLoading, error }] = useUpdateProductMutation();
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) {
      setQty('');
      setNote('');
    }
  }, [open]);

  const isIn = direction === 'in';
  const title = isIn ? 'Stock in' : 'Stock out';
  const description = isIn
    ? 'Add quantity to this product.'
    : 'Remove quantity from this product.';

  const parsedQty = Number(qty);
  const valid =
    product !== null &&
    qty !== '' &&
    Number.isFinite(parsedQty) &&
    parsedQty > 0 &&
    (!isIn ? parsedQty <= product.quantity : true); // can't remove more than you have

  const projected = product
    ? isIn
      ? product.quantity + (Number.isFinite(parsedQty) ? parsedQty : 0)
      : product.quantity - (Number.isFinite(parsedQty) ? parsedQty : 0)
    : 0;

  const onSubmit = async () => {
    if (!product || !valid) return;
    const nextQuantity = isIn
      ? product.quantity + parsedQty
      : product.quantity - parsedQty;

    try {
      await updateProduct({
        id: product.id,
        quantity: nextQuantity,
        // If your backend accepts a `note`, pass it through:
        // note: note.trim() || undefined,
      }).unwrap();
      setOpen(false);
      onDone?.();
    } catch {
      // surfaced via `error`
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (isLoading) return;
        setOpen(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}{' '}
            <span className="font-medium text-foreground">{product?.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-3">
          <div className="grid gap-2">
            <Label htmlFor="stock-qty">Quantity</Label>
            <Input
              id="stock-qty"
              type="number"
              min={1}
              placeholder="e.g. 10"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
            {product && (
              <p className="text-xs text-muted-foreground">
                Current: <span className="font-medium">{product.quantity}</span>
                {qty !== '' && Number.isFinite(parsedQty) && parsedQty > 0 && (
                  <>
                    {' '}→ New:{' '}
                    <span className="font-medium">{projected}</span>
                  </>
                )}
              </p>
            )}
            {!isIn && product && parsedQty > product.quantity && (
              <p className="text-xs text-destructive">
                Cannot remove more than the current stock ({product.quantity}).
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stock-note">
              Note <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="stock-note"
              placeholder={isIn ? 'e.g. Restock from supplier' : 'e.g. Damaged goods'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {'data' in error && typeof error.data === 'object' && error.data
                ? (error.data as { message?: string }).message ?? 'Failed to update stock'
                : 'Network error'}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isLoading || !valid}>
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" />
                Saving…
              </>
            ) : (
              title
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}