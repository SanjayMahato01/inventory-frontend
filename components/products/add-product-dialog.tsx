'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProductMutation } from '@/lib/features/api/productApi';

const CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'accessories', label: 'Accessories' },
] as const;

const EMPTY_FORM = {
  name: '',
  sku: '',
  category: '',
  price: '',
  quantity: '',
  minimum: '',
  remarks: '',
};

export function AddProductDialog({
  open,
  setOpen,
  onCreated,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  onCreated?: () => void;
}) {
  const [createProduct, { isLoading, error }] = useCreateProductMutation();
  const [form, setForm] = useState(EMPTY_FORM);

  const update = <K extends keyof typeof form>(key: K, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const reset = () => setForm(EMPTY_FORM);

  const onSubmit = async () => {
    try {
      await createProduct({
        name: form.name.trim(),
        sku: form.sku.trim(),
        category: form.category || undefined,
        price: Number(form.price) || 0,
        quantity: Number(form.quantity) || 0,
        minimum: Number(form.minimum) || 0,
        remarks: form.remarks.trim() || undefined,
      }).unwrap();
      reset();
      setOpen(false);
      onCreated?.();
    } catch {
      // error is surfaced via `error`
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (isLoading) return;
        if (!v) reset();
        setOpen(v);
      }}
    >
      <DialogContent
      >
        <DialogHeader>
          <DialogTitle>Add a new product</DialogTitle>
          <DialogDescription>
            Add the details you need to start tracking this item.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-3">
          <div className="grid gap-2">
            <Label htmlFor="product-name">Product name</Label>
            <Input
              id="product-name"
              placeholder="e.g. Wireless Mouse"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                placeholder="WM-001"
                value={form.sku}
                onChange={(e) => update('sku', e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) => update('category', value ?? '')}
                disabled={isLoading}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category">
                    {form.category
                      ? CATEGORIES.find((c) => c.value === form.category)?.label
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                value={form.quantity}
                onChange={(e) => update('quantity', e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="minimum">Min. stock</Label>
              <Input
                id="minimum"
                type="number"
                placeholder="10"
                value={form.minimum}
                onChange={(e) => update('minimum', e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="remarks">
              Remarks{' '}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="remarks"
              placeholder="Add a note about this product"
              value={form.remarks}
              onChange={(e) => update('remarks', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {'data' in error && typeof error.data === 'object' && error.data
                ? (error.data as { message?: string }).message ??
                'Failed to add product'
                : 'Network error'}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading || !form.name.trim() || !form.sku.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" />
                Adding…
              </>
            ) : (
              'Add product'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}