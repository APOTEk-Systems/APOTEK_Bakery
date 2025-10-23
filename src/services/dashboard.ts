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
    }>;
  };
  dailyProduction: {
    count: number;
    items: Array<{
      productName: string;
      quantityProduced: number;
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
  };
  lastMonth: {
    revenue: number;
    cogs: number;
    operatingExpenses: number;
    grossProfit: number;
    netProfit: number;
  };
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
};