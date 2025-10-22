import { api } from '../lib/api';

export interface SalesDashboardData {
  totalSalesThisMonth: number;
  averageDailySales: number;
  salesGrowth: {
    current: number;
    previous: number;
  };
  weeklySalesList: Array<{
    weekStart: string;
    total: number;
  }>;
}

export interface PurchasesDashboardData {
  totalPurchasesThisMonth: number;
  purchaseGrowth: number;
  pendingPurchaseOrders: number;
  weeklyPurchasesList: Array<{
    weekStart: string;
    total: number;
  }>;
}

export interface ProductionDashboardData {
  dailyProduction: number;
  weeklyProduction: number;
  weeklyProductionCost: number;
}

export interface AccountingDashboardData {
  currentMonth: {
    revenue: number;
    cogs: number;
    operatingExpenses: number;
    grossProfit: number;
    netProfit: number;
  };
  lastMonth: {
    revenue: number;
    cogs: number;
    operatingExpenses: number;
    grossProfit: number;
    netProfit: number;
  };
}

export const dashboardService = {
  // Sales Dashboard
  getSalesDashboard: async (): Promise<SalesDashboardData> => {
    const response = await api.get('/dashboard/sales');
    return response.data;
  },

  // Purchases Dashboard
  getPurchasesDashboard: async (): Promise<PurchasesDashboardData> => {
    const response = await api.get('/dashboard/purchases');
    return response.data;
  },

  // Production Dashboard
  getProductionDashboard: async (): Promise<ProductionDashboardData> => {
    const response = await api.get('/dashboard/production');
    return response.data;
  },

  // Accounting Dashboard
  getAccountingDashboard: async (): Promise<AccountingDashboardData> => {
    const response = await api.get('/dashboard/accounting');
    return response.data;
  },
};