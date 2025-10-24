import { api } from '../lib/api';

export interface SalesDashboardData {
  totalDailySales: number;
  totalSalesThisMonth: number;
  averageDailySales: number;
  salesGrowth: {
    current: number;
    previous: number;
  };
  dailySalesList: Array<{
    date: string;
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
  weeklyIngredientUsage: {
    count: number;
    items: Array<{
      name: string;
      quantity: number;
      unit: string;
      available: number;
    }>;
  };
  weeklyProduction: {
    count: number;
    items: Array<{
      productName: string;
      quantityProduced: number;
      cost: number;
    }>;
  };
  productionVsSales: {
    count: number;
    items: Array<{
      productName: string;
      produced: number;
      sold: number;
      difference: number;
    }>;
  };
}

export interface AccountingDashboardData {
  currentMonth: {
    revenue: number;
    cogs: number;
    operatingExpenses: number;
    grossProfit: number;
    netProfit: number;
    outstandingPayments: number;
  };
  lastMonth: {
    revenue: number;
    cogs: number;
    operatingExpenses: number;
    grossProfit: number;
    netProfit: number;
    outstandingPayments: number;
  };
}

export interface CashFlowData {
  cashInflows: {
    fromSales: number;
    total: number;
  };
  cashOutflows: {
    forExpenses: number;
    forPurchases: number;
    total: number;
  };
  netCashFlow: number;
}

export interface ProfitLossData {
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
}

export interface InventoryDashboardData {
  lowStock: {
    count: number;
    items: Array<{
      id: number;
      name: string;
      currentQuantity: number;
      minLevel: number;
      type: string;
    }>;
  };
  outOfStock: {
    count: number;
    items: Array<{
      id: number;
      name: string;
      currentQuantity: number;
      minLevel: number;
      type: string;
    }>;
  };
  materialsUsed: {
    count: number;
    items: Array<{
      materialName: string;
      amountDeducted: number;
      unit: string;
      available: number;
      productName: string;
      quantityProduced: number;
    }>;
  };
  topSellingProducts: {
    count: number;
    items: Array<{
      productName: string;
      totalQuantitySold: number;
    }>;
  };
  weeklyAdjustments: {
    count: number;
    items: Array<any>; // Define proper type if needed
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

  // Inventory Dashboard
  getInventoryDashboard: async (): Promise<InventoryDashboardData> => {
    const response = await api.get('/dashboard/inventory');
    return response.data;
  },

  // Cash Flow Report
  getCashFlowReport: async (): Promise<CashFlowData> => {
    const response = await api.get('/accounting/reports/cash-flow');
    return response.data.data;
  },

  // Profit & Loss Report
  getProfitLossReport: async (): Promise<ProfitLossData> => {
    const response = await api.get('/accounting/reports/profit-loss');
    return response.data.data;
  },
};