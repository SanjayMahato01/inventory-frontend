'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ProductTable,
  type SortField,
  type SortOrder,
} from '@/components/products/product-table';
import { ProductSearch } from '@/components/products/product-search';
import { AddProductDialog } from '@/components/products/add-product-dialog';
import { EditProductDialog } from '@/components/products/edit-product-dialog';
import { DeleteProductDialog } from '@/components/products/delete-product-dialog';
import { StockDialog, type StockDirection } from '@/components/products/stock-dialog';
import {
  useListProductsQuery,
  type Product,
} from '@/lib/features/api/productApi';
import { ViewProductDialog } from '@/components/products/view-product-dialog';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [sort, setSort] = useState<SortField>('createdAt');
  const [order, setOrder] = useState<SortOrder>('desc');

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockDirection, setStockDirection] = useState<StockDirection>('in');
  
  const [viewing, setViewing] = useState<Product | null>(null); // 👈 new state

  const { data, isLoading, isFetching, refetch } = useListProductsQuery({
    search,
    page,
    limit: 10,
    sort,
    order,
  });

  const handleSortChange = (field: SortField) => {
    if (field === sort) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSort(field);
      setOrder('asc');
    }
    setPage(1);
  };

  const openStock = (product: Product, direction: StockDirection) => {
    setStockProduct(product);
    setStockDirection(direction);
  };

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Products
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage the products you keep on hand.
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setAddOpen(true)}>
          <Plus data-icon="inline-start" /> Add product
        </Button>
      </div>

      <Card className="border-border/70 shadow-none">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Product catalog</CardTitle>
            <CardDescription>
              {data ? `${data.total} products` : 'Loading…'}
              {isFetching && !isLoading && (
                <span className="ml-2 text-xs text-muted-foreground">Refreshing…</span>
              )}
            </CardDescription>
          </div>
          <ProductSearch
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />
        </CardHeader>
        <CardContent>
          <ProductTable
            products={data?.items ?? []}
            loading={isLoading || isFetching}
            sort={sort}
            order={order}
            onSortChange={handleSortChange}
            onEdit={(p) => setEditing(p)}
            onDelete={(p) => setDeleting(p)}
            onStockIn={(p) => openStock(p, 'in')}
            onStockOut={(p) => openStock(p, 'out')}
            onView={(p) => setViewing(p)}
          />

          {data && data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddProductDialog open={addOpen} setOpen={setAddOpen} onCreated={refetch} />

      <EditProductDialog
        product={editing}
        open={!!editing}
        setOpen={(v) => {
          if (!v) setEditing(null);
        }}
        onUpdated={refetch}
      />

      <DeleteProductDialog
        product={deleting}
        open={!!deleting}
        setOpen={(v) => {
          if (!v) setDeleting(null);
        }}
        onDeleted={refetch}
      />

      <StockDialog
        product={stockProduct}
        direction={stockDirection}
        open={!!stockProduct}
        setOpen={(v) => {
          if (!v) setStockProduct(null);
        }}
        onDone={refetch}
      />

       <ViewProductDialog
        product={viewing}
        open={!!viewing}
        setOpen={(v) => {
          if (!v) setViewing(null);
        }}
      />
    </>
  );
}