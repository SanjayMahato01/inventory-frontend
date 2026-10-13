import { api } from './apiSlice';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  price: number;
  quantity: number;
  minimum: number;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListProductsArgs {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CreateProductInput {
  name: string;
  sku: string;
  category?: string;
  price?: number;
  quantity?: number;
  minimum?: number;
  remarks?: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

export const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listProducts: builder.query<Paginated<Product>, ListProductsArgs | void>({
      query: (args) => ({
        url: '/products',
        params: args ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product' as const, id: 'LIST' },
            ]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),

  
    listLowStockProducts: builder.query<
      Paginated<Product>,
      ListProductsArgs | void
    >({
      query: (args) => ({
        url: 'products/low-stock',
        params: args ?? {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product' as const, id: 'LOW_STOCK' },
            ]
          : [{ type: 'Product' as const, id: 'LOW_STOCK' }],
    }),

    
    countLowStockProducts: builder.query<{ count: number }, void>({
      query: () => '/products/low-stock/count',
      providesTags: [{ type: 'Product', id: 'LOW_STOCK_COUNT' }],
    }),

    getProduct: builder.query<{ product: Product }, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Product', id }],
    }),

    createProduct: builder.mutation<{ product: Product }, CreateProductInput>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: [
        { type: 'Product', id: 'LIST' },
        { type: 'Product', id: 'LOW_STOCK' },
        { type: 'Product', id: 'LOW_STOCK_COUNT' },
      ],
    }),

    updateProduct: builder.mutation<{ product: Product }, UpdateProductInput>({
      query: ({ id, ...patch }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
        { type: 'Product', id: 'LOW_STOCK' },
        { type: 'Product', id: 'LOW_STOCK_COUNT' },
      ],
    }),

    deleteProduct: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Product', id: 'LIST' },
        { type: 'Product', id: 'LOW_STOCK' },
        { type: 'Product', id: 'LOW_STOCK_COUNT' },
      ],
    }),
  }),
});

export const {
  useListProductsQuery,
  useListLowStockProductsQuery, 
  useCountLowStockProductsQuery, 
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;