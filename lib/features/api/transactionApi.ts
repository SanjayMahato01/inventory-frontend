import { api } from './apiSlice';

export type TransactionType = 'IN' | 'OUT';

export interface Transaction {
  id: string;
  type: TransactionType;
  quantity: number;
  note: string | null;
  createdAt: string;
  productId: string;
  userId: string;
  product?: { id: string; name: string; sku: string };
  user?: { id: string; name: string | null; email: string }; 
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListTransactionsArgs {
  productId?: string;
  type?: TransactionType;
  page?: number;
  limit?: number;
}

export interface CreateTransactionInput {
  productId: string;
  type: TransactionType;
  quantity: number;
  note?: string;
}

export const transactionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listTransactions: builder.query<Paginated<Transaction>, ListTransactionsArgs | void>({
      query: (args) => ({ url: '/transactions', params: args ?? {} }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Stock' as const, id })),
              { type: 'Stock' as const, id: 'LIST' },
            ]
          : [{ type: 'Stock' as const, id: 'LIST' }],
    }),

    createTransaction: builder.mutation<
      { transaction: Transaction; product: unknown },
      CreateTransactionInput
    >({
      query: (body) => ({ url: '/transactions', method: 'POST', body }),
      invalidatesTags: [
        { type: 'Stock', id: 'LIST' },
        { type: 'Product', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListTransactionsQuery,
  useCreateTransactionMutation,
} = transactionApi;