'use client';

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
import { useDeleteProductMutation, type Product } from '@/lib/features/api/productApi';

export function DeleteProductDialog({
  product,
  open,
  setOpen,
  onDeleted,
}: {
  product: Product | null;
  open: boolean;
  setOpen: (value: boolean) => void;
  onDeleted?: () => void;
}) {
  const [deleteProduct, { isLoading, error }] = useDeleteProductMutation();

  const onConfirm = async () => {
    if (!product) return;
    try {
      await deleteProduct(product.id).unwrap();
      setOpen(false);
      onDeleted?.();
    } catch {
      // error is surfaced via `error`
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
          <DialogTitle>Delete product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-medium text-foreground">{product?.name}</span>? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {'data' in error && typeof error.data === 'object' && error.data
              ? (error.data as { message?: string }).message ?? 'Failed to delete product'
              : 'Network error'}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" />
                Deleting…
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}