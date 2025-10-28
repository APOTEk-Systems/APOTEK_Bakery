import { inventoryService } from "../services/inventory";

// Types for report data
export interface SalesReport {
  data: {
    sales: Array<{
      id: number;
      customerId: number | null;
      soldById: number;
      isCredit: boolean;
      creditDueDate: string | null;
      total: number;
      status: string;
      createdAt: string;
      updatedAt: string;
      customer: any | null;
      soldBy: string;
    }>;
    totalSales: number;
    creditOutstanding: number;
  };
}

export interface PurchasesReport {
  data: {
    purchaseOrders: Array<{
      id: number;
      totalCost: number;
      status: string;
      notes: string | null;
      createdAt: string;
      updatedAt: string;
      createdById: number;
      approvedById: number | null;
      supplierId: number;
      supplier: {
        id: number;
        name: string;
        contactInfo: string;
        email: string | null;
        address: string | null;
        createdAt: string;
        updatedAt: string;
      };
    }>;
    totalPurchases: number;
  };
}

export interface ProductionReport {
  data: {
    totalProduced: number;
    production: Array<{
      id: number;
      productId: number;
      quantityProduced: number;
      date: string;
      producedById: number;
      cost: number;
      notes: string | null;
      createdAt: string;
      updatedAt: string;
      updatedById: number;
      finalizedAt: string | null;
      status: string;
      product: string;
    }>;
    totalCost: number;
  };
}

export interface InventoryReport {
  data: {
    inventoryItem: Array<{
      id: number;
      name: string;
      unit: string;
      currentQuantity: number;
      minLevel: number;
      cost: number;
      type: string;
      createdAt: string;
      updatedAt: string;
    }>;
    totalValue: number;
    lowStockItems: number;
  };
}

export interface InventoryAdjustmentsReport {
  data: {
    adjustments: Array<{
      id: number;
      inventoryItemId: number;
      amount: number;
      reason: string;
      createdAt: string;
      createdById: number;
      inventoryItem: {
        id: number;
        name: string;
        unit: string;
        type: string;
      };
      createdBy: {
        id: number;
        name: string;
        email: string;
      };
    }>;
    total: number;
  };
}

export interface LowStockReport {
  data: {
    inventoryItem: Array<{
      id: number;
      name: string;
      unit: string;
      currentQuantity: number;
      minLevel: number;
      type: string;
    }>;
  };
}

export interface OutOfStockReport {
  data: {
    inventoryItem: Array<{
      id: number;
      name: string;
      unit: string;
      currentQuantity: number;
      type: string;
    }>;
  };
}

export interface FinancialReport {
  data: {
    revenue: number;
    expenses: number;
    profit: number;
    outstandingCredits: number;
    inventoryValue: number;
    period: {
      startDate: string;
      endDate: string;
    };
  };
}

export interface CustomerSalesReport {
  data: Array<{
    id: number;
    name: string;
    email: string;
    totalSales: number;
    totalSpent: number;
    avgSpending: number;
  }>;
}

export interface SupplierWisePurchasesReport {
  data: {
    bySupplier: Record<
      string,
      {
        totalPurchases: number;
      }
    >;
  };
}

export interface IngredientPurchaseTrendReport {
  data: Array<{
    item: string;
    quantity: number;
    date: string;
  }>;
}

export interface FinishedGoodsSummaryReport {
  data: Array<{
    item: string;
    produced: number;
    sold: number;
    remaining: number;
    date: string;
  }>;
}

export interface IngredientUsageReport {
  data: Array<{
    item: string;
    amount: number;
    unit: string;
    date: string;
  }>;
}

export interface ProfitAndLossReport {
  data: {
    revenue: number;
    cogs: number;
    operatingExpenses: number;
    grossProfit: {
      parameters: {
        totalSales: number;
        costOfGoodsSold: number;
      };
      result: number;
    };
    netProfit: {
      parameters: {
        grossProfit: number;
        operatingExpenses: number;
      };
      result: number;
    };
  };
}

export interface ExpenseBreakdownReport {
  data: {
    breakdown: Record<string, number>;
    totalExpenses: number;
  };
}

export interface ProductsReport {
  data: Array<{
    id: number;
    name: string;
    price: number;
  }>;
}

export interface ProductDetailsReport {
  data: Array<{
    id: number;
    name: string;
    price: number;
    averageProductionCost: number;
    profit: number;
  }>;
}