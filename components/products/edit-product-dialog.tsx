'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateProductMutation, type Product } from '@/lib/features/api/productApi';

const CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'accessories', label: 'Accessories' },
] as const;

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label]),
);

export function EditProductDialog({
  product,
  open,
  setOpen,
  onUpdated,
}: {
  product: Product | null;
  open: boolean;
  setOpen: (value: boolean) => void;
  onUpdated?: () => void;
}) {
  const [updateProduct, { isLoading, error }] = useUpdateProductMutation();
  const [form, setForm] = useState({
    name: '', sku: '', category: '', price: '', quantity: '', minimum: '', remarks: '',
  });

  useEffect(() => {
    if (!product) return;
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category ?? '',
      price: String(product.price),
      quantity: String(product.quantity),
      minimum: String(product.minimum),
      remarks: product.remarks ?? '',
    });
  }, [product]);

  const update = <K extends keyof typeof form>(key: K, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async () => {
    if (!product) return;
    try {
      await updateProduct({
        id: product.id,
        name: form.name.trim(),
        sku: form.sku.trim(),
        category: form.category || undefined,
        price: Number(form.price) || 0,
        quantity: Number(form.quantity) || 0,
        minimum: Number(form.minimum) || 0,
        remarks: form.remarks.trim() || undefined,
      }).unwrap();
      setOpen(false);
      onUpdated?.();
    } catch {
      // error surfaced via `error`
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => { if (isLoading) return; setOpen(v); }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit product</DialogTitle>
          <DialogDescription>Update the details of this item.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-3">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Product name</Label>
            <Input id="edit-name" value={form.name}
              onChange={(e) => update('name', e.target.value)} disabled={isLoading} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-sku">SKU</Label>
              <Input id="edit-sku" value={form.sku}
                onChange={(e) => update('sku', e.target.value)} disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => update('category', v ?? '')}
                disabled={isLoading}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select category">
                    {form.category ? CATEGORY_LABELS[form.category] : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="edit-price">Price</Label>
              <Input id="edit-price" type="number" value={form.price}
                onChange={(e) => update('price', e.target.value)} disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input id="edit-quantity" type="number" value={form.quantity}
                onChange={(e) => update('quantity', e.target.value)} disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-minimum">Min. stock</Label>
              <Input id="edit-minimum" type="number" value={form.minimum}
                onChange={(e) => update('minimum', e.target.value)} disabled={isLoading} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-remarks">
              Remarks <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea id="edit-remarks" value={form.remarks}
              onChange={(e) => update('remarks', e.target.value)} disabled={isLoading} />
          </div>

          {error && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {'data' in error && typeof error.data === 'object' && error.data
                ? (error.data as { message?: string }).message ?? 'Failed to update product'
                : 'Network error'}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isLoading || !form.name.trim() || !form.sku.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" />
                Saving…
              </>
            ) : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}