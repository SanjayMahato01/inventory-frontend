import { api } from './apiSlice';

export interface DashboardSummary {
  totalProducts: number;
  productsChangePct: number;
  lowStockItems: number;
  stockValue: number;
  stockValueChangePct: number;
  movementsThisMonth: number;
  movementsChangePct: number;
}

export interface InventoryTrendPoint {
  date: string;
  value: number;
}

export interface InventoryTrendResponse {
  days: number;
  points: InventoryTrendPoint[];
}

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummary, void>({
      query: () => '/dashboard/summary',
      providesTags: [
        { type: 'Product', id: 'SUMMARY' },
        { type: 'Transaction', id: 'SUMMARY' },
      ],
    }),

    getInventoryTrend: builder.query<InventoryTrendResponse, { days: number }>({
      query: ({ days }) => ({
        url: '/dashboard/inventory-trend',
        params: { days },
      }),
      providesTags: (_res, _err, { days }) => [
        { type: 'Product', id: `TREND_${days}` },
      ],
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetInventoryTrendQuery,
} = dashboardApi;