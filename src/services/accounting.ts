import { api } from '../lib/api';

export interface MonthlyData {
  revenue: number;
  cogs: number;
  operatingExpenses: number;
  grossProfit: number;
  netProfit: number;
}

export interface MonthlySummary {
  currentMonth: MonthlyData;
  lastMonth: MonthlyData;
}

export const accountingService = {
  getAccountingSummary: async (): Promise<MonthlySummary> => {
    const response = await api.get<MonthlySummary>('/accounting/summary');
    return response.data;
  },
};