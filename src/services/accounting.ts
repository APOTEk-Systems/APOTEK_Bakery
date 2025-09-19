import { api } from '../lib/api';

export interface MonthlySummary {
  monthlyRevenue: number;
  monthlyExpenses: number;
  netProfit: number;
  profitMargin: string;
  comparison: {
    lastMonthRevenue: number;
    lastMonthExpenses: number;
    lastMonthNetProfit: number;
    netProfitChange: string;
  };
}

export const accountingService = {
  getAccountingSummary: async (): Promise<MonthlySummary> => {
    const response = await api.get<MonthlySummary>('/accounting/summary');
    return response.data;
  },
};