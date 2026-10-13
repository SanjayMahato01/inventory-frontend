'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LowStockTable,
  type SortField,
  type SortOrder,
} from './low-stock-table';
import { ProductSearch } from '@/components/products/product-search';
import { StockDialog, type StockDirection } from '@/components/products/stock-dialog';
import {
  useListLowStockProductsQuery,
  useCountLowStockProductsQuery,
  type Product,
} from '@/lib/features/api/productApi';

export default function LowStockPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortField>('deficit');
  const [order, setOrder] = useState<SortOrder>('desc');

  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockDirection, setStockDirection] = useState<StockDirection>('in');

  const { data, isLoading, isFetching, refetch } = useListLowStockProductsQuery({
    search,
    page,
    limit: 10,
    sort,
    order,
  });

  const { data: countData } = useCountLowStockProductsQuery();

  const handleSortChange = (field: SortField) => {
    if (field === sort) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSort(field);
      setOrder(field === 'deficit' ? 'desc' : 'asc');
    }
    setPage(1);
  };

  const openStock = (product: Product) => {
    setStockProduct(product);
    setStockDirection('in');
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Low stock alerts
            </h1>
            {!!countData?.count && (
              <span className="inline-flex h-6 items-center justify-center rounded-full bg-destructive/10 px-2 text-xs font-semibold text-destructive">
                {countData.count}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Products at or below their minimum stock level.
          </p>
        </div>
      </div>

      <Card className="border-border/70 shadow-none">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-medium">Attention required</p>
            <p className="text-xs text-muted-foreground">
              Restock these items to keep inventory healthy.
            </p>
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
          <LowStockTable
            products={data?.items ?? []}
            loading={isLoading || isFetching}
            sort={sort}
            order={order}
            onSortChange={handleSortChange}
            onStockIn={openStock}
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

      <StockDialog
        product={stockProduct}
        direction={stockDirection}
        open={!!stockProduct}
        setOpen={(v) => {
          if (!v) setStockProduct(null);
        }}
        onDone={refetch}
      />
    </>
  );
}