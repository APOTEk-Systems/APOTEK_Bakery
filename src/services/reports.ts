import {api} from "@/lib/api";
import {fromBaseUnits} from "@/lib/funcs";
import {format} from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { inventoryService } from "./inventory";

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

export const reportsService = {
  // Helper function to add company header to PDFs
  addCompanyHeader: (
    doc: jsPDF,
    reportTitle: string,
    startDate?: string,
    endDate?: string,
    settings?: any
  ): number => {
    let yPos = 20;

    // Default company info (fallback)
    const defaultCompanyInfo = {
      bakeryName: "Golden Crust Bakery",
      address: "123 Baker Street, Pastry City, PC 12345",
      phone: "(555) 123-BAKE",
      email: "info@goldencrustbakery.com",
      website: "www.goldencrustbakery.com",
    };

    let companyInfo = defaultCompanyInfo;

    // Use settings if provided
    if (settings?.information) {
      companyInfo = {
        bakeryName: settings.information.bakeryName || defaultCompanyInfo.bakeryName,
        address: settings.information.address || defaultCompanyInfo.address,
        phone: settings.information.phone || defaultCompanyInfo.phone,
        email: settings.information.email || defaultCompanyInfo.email,
        website: settings.information.website || defaultCompanyInfo.website,
      };
    }

    // Company name (centered, bold, larger)
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const pageWidth = doc.internal.pageSize.getWidth();
    const companyNameWidth = doc.getTextWidth(companyInfo.bakeryName);
    doc.text(companyInfo.bakeryName, (pageWidth - companyNameWidth) / 2, yPos);
    yPos += 10;

    // Company details (centered, smaller)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    if (companyInfo.address) {
      const addressWidth = doc.getTextWidth(companyInfo.address);
      doc.text(companyInfo.address, (pageWidth - addressWidth) / 2, yPos);
      yPos += 6;
    }

    // Contact info on same line
    let contactInfo = "";
    if (companyInfo.phone) contactInfo += `Phone: ${companyInfo.phone}`;
    if (companyInfo.email) {
      if (contactInfo) contactInfo += " | ";
      contactInfo += `Email: ${companyInfo.email}`;
    }
    if (contactInfo) {
      const contactWidth = doc.getTextWidth(contactInfo);
      doc.text(contactInfo, (pageWidth - contactWidth) / 2, yPos);
      yPos += 6;
    }

    if (companyInfo.website) {
      const websiteWidth = doc.getTextWidth(companyInfo.website);
      doc.text(companyInfo.website, (pageWidth - websiteWidth) / 2, yPos);
      yPos += 10;
    }

    // Report title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const titleWidth = doc.getTextWidth(reportTitle);
    doc.text(reportTitle, (pageWidth - titleWidth) / 2, yPos);
    yPos += 10;

    // Date range
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const dateRange =
      startDate && endDate ? `From ${startDate} to ${endDate}` : "All Time";
    const dateRangeWidth = doc.getTextWidth(`Date Range: ${dateRange}`);
    doc.text(
      `Date Range: ${dateRange}`,
      (pageWidth - dateRangeWidth) / 2,
      yPos
    );
    yPos += 6;

    // Generated date
    const generatedText = `Generated: ${format(new Date(), "dd-MM-yyyy")}`;
    const generatedWidth = doc.getTextWidth(generatedText);
    doc.text(generatedText, (pageWidth - generatedWidth) / 2, yPos);
    yPos += 15;

    return yPos; // Return the Y position after the header
  },

  // Test function to check if PDF generation works
  testPDFGeneration(): Blob {
    console.log("🧪 Testing basic PDF generation...");
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Test PDF Report", 20, 20);
      doc.setFontSize(12);
      doc.text("This is a test to verify PDF generation works.", 20, 40);
      doc.text(`Generated at: ${new Date().toLocaleString()}`, 20, 60);

      // Test table functionality
      autoTable(doc, {
        head: [["Column 1", "Column 2", "Column 3"]],
        body: [
          ["Row 1 Col 1", "Row 1 Col 2", "Row 1 Col 3"],
          ["Row 2 Col 1", "Row 2 Col 2", "Row 2 Col 3"],
        ],
        startY: 80,
        theme: "grid",
        styles: {fontSize: 10},
        headStyles: {fillColor: [41, 128, 185]},
      });

      const blob = doc.output("blob");
      console.log("✅ Test PDF generated successfully, size:", blob.size);
      return blob;
    } catch (error) {
      console.error("❌ Test PDF generation failed:", error);
      throw error;
    }
  },

  // Sales Report
  getSalesReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<SalesReport> => {
    console.log("🔍 Fetching sales report data...", {startDate, endDate});
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/reports/sales?${params.toString()}`);
    console.log("📥 Sales API response:", response);
    return response.data;
  },

  // Purchases Report
  getPurchasesReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<PurchasesReport> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/reports/purchases?${params.toString()}`);
    return response.data;
  },

  // Production Report
  getProductionReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<ProductionReport> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/reports/production?${params.toString()}`);
    return response.data;
  },

  // Inventory Report
  getInventoryReport: async (): Promise<InventoryReport> => {
    const response = await api.get("/reports/inventory");
    return response.data;
  },

  // Inventory Adjustments Report
  getInventoryAdjustmentsReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<InventoryAdjustmentsReport> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/reports/inventory/adjustments?${params.toString()}`);
    return response.data;
  },

  // Low Stock Report
  getLowStockReport: async (type?: 'raw_material' | 'supplies'): Promise<LowStockReport> => {
    // Use inventory service to get low stock items
    const params = type ? { low: true, type } : { low: true };
    const lowStockItems = await inventoryService.getInventory(params);

    return {
      data: {
        inventoryItem: lowStockItems
      }
    };
  },

  // Out of Stock Report
  getOutOfStockReport: async (type?: 'raw_material' | 'supplies'): Promise<OutOfStockReport> => {
    // Get all inventory items and filter for out of stock
    const params = type ? { type } : {};
    const allItems = await inventoryService.getInventory(params);

    // Filter items where currentQuantity <= 0
    const outOfStockItems = allItems.filter((item: any) => item.currentQuantity <= 0);

    return {
      data: {
        inventoryItem: outOfStockItems
      }
    };
  },

  // Financial Report
  getFinancialReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<FinancialReport> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/reports/financial?${params.toString()}`);
    return response.data;
  },

  // Customer Sales Report
  getCustomerSalesReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<CustomerSalesReport> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/reports/customers?${params.toString()}`);
    return response.data;
  },

  // Supplier-wise Purchases Report
  getSupplierWisePurchasesReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<SupplierWisePurchasesReport> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(
      `/reports/purchases-by-supplier?${params.toString()}`
    );
    return response.data;
  },

  // Ingredient Purchase Trend Report
  getIngredientPurchaseTrendReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<IngredientPurchaseTrendReport> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(
      `/reports/ingredient-purchase-trend?${params.toString()}`
    );
    return response.data;
  },

  // Finished Goods Summary Report
  getFinishedGoodsSummaryReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<FinishedGoodsSummaryReport> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(
      `/reports/finished-goods-summary?${params.toString()}`
    );
    return response.data;
  },

  // Ingredient Usage Report
  getIngredientUsageReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<IngredientUsageReport> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(
      `/reports/ingredient-usage?${params.toString()}`
    );
    return response.data;
  },

  // Profit and Loss Report
  getProfitAndLossReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<ProfitAndLossReport> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/reports/financial?${params.toString()}`);
    return response.data;
  },

  // Expense Category Breakdown Report
  getExpenseBreakdownReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<ExpenseBreakdownReport> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/reports/expense-breakdown?${params.toString()}`);
    return response.data;
  },

  // Products Report
  getProductsReport: async (): Promise<ProductsReport> => {
    const response = await api.get('/products');
    return { data: response.data };
  },

  // Product Details Report
  getProductDetailsReport: async (): Promise<ProductDetailsReport> => {
    const response = await api.get('/products');
    // Transform the data to include averageProductionCost and profit
    const transformedData = response.data.map((product: any) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      averageProductionCost:product.averageProductionCost, // Assuming this field exists
      profit:product.profit // As specified in the task
    }));
    return { data: transformedData };
  },

  // Goods Received Report
  getGoodsReceivedReport: async (startDate?: string, endDate?: string, supplierId?: number): Promise<any> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (supplierId) params.append("supplierId", supplierId.toString());
    params.append("limit", "1000");
    const response = await api.get(`/purchases/receiving?${params.toString()}`);
    return response.data;
  },

  // Client-side PDF generation methods
  exportSalesReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<Blob> => {
    console.log("📊 Starting sales report export...", {startDate, endDate});
    try {
      const data = await reportsService.getSalesReport(startDate, endDate);
      console.log("✅ Sales data fetched successfully:", data);
      const pdfBlob = reportsService.generateSalesPDF(data, startDate, endDate);
      console.log("📄 Sales PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting sales report:", error);
      throw error;
    }
  },

  exportPurchasesReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<Blob> => {
    console.log("📊 Starting purchases report export...", {startDate, endDate});
    try {
      const data = await reportsService.getPurchasesReport(startDate, endDate);
      console.log("✅ Purchases data fetched successfully:", data);
      const pdfBlob = reportsService.generatePurchasesPDF(
        data,
        startDate,
        endDate
      );
      console.log("📄 Purchases PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting purchases report:", error);
      throw error;
    }
  },

  exportProductionReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<Blob> => {
    console.log("📊 Starting production report export...", {
      startDate,
      endDate,
    });
    try {
      const data = await reportsService.getProductionReport(startDate, endDate);
      console.log("✅ Production data fetched successfully:", data);
      const pdfBlob = reportsService.generateProductionPDF(
        data,
        startDate,
        endDate
      );
      console.log("📄 Production PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting production report:", error);
      throw error;
    }
  },

  exportInventoryReport: async (type?: 'raw_material' | 'supplies'): Promise<Blob> => {
    console.log("📊 Starting inventory report export...", { type });
    try {
      const params = type ? { type } : {};
      let inventoryItems = await inventoryService.getInventory(params);

      // Additional client-side filtering to ensure correct type
      if (type) {
        inventoryItems = inventoryItems.filter(item => item.type === type);
      }

      const totalValue = inventoryItems.reduce((sum, item) => sum + (item.currentQuantity * item.cost), 0);
      const lowStockItems = inventoryItems.filter(item => item.currentQuantity <= item.minLevel).length;

      const data = {
        data: {
          inventoryItem: inventoryItems,
          totalValue,
          lowStockItems
        }
      };
      console.log("✅ Inventory data fetched successfully:", data);
      const pdfBlob = reportsService.generateInventoryPDF(data, type);
      console.log("📄 Inventory PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting inventory report:", error);
      throw error;
    }
  },

  exportInventoryAdjustmentsReport: async (
    startDate?: string,
    endDate?: string,
    type?: 'raw_material' | 'supplies'
  ): Promise<Blob> => {
    console.log("📊 Starting inventory adjustments report export...", {startDate, endDate, type});
    try {
      const params = {
        startDate,
        endDate,
        ...(type && { type })
      };
      const adjustments = await inventoryService.getAdjustments(params);

      if (adjustments.adjustments.length === 0) {
        throw new Error(`No adjustments found${type ? ` for ${type === 'raw_material' ? 'materials' : 'supplies'}` : ''}${startDate && endDate ? ` in the selected date range` : ''}`);
      }

      const data = {
        data: {
          adjustments: adjustments.adjustments,
          total: adjustments.total
        }
      };
      console.log("✅ Inventory adjustments data fetched successfully:", data);
      const pdfBlob = reportsService.generateInventoryAdjustmentsPDF(data, startDate, endDate, type);
      console.log("📄 Inventory adjustments PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting inventory adjustments report:", error);
      if (error.message && error.message.includes("No adjustments found")) {
        // Return a resolved promise with null to indicate no PDF was generated
        return Promise.resolve(null as any);
      }
      throw error;
    }
  },

  exportLowStockReport: async (type?: 'raw_material' | 'supplies'): Promise<Blob> => {
    console.log("📊 Starting low stock report export...", { type });
    try {
      const params = type ? { type } : {};
      const allItems = await inventoryService.getInventory(params);
      const lowStockItems = allItems.filter((item: any) => item.currentQuantity <= item.minLevel);

      if (lowStockItems.length === 0) {
        throw new Error(`No items found below minimum stock level${type ? ` for ${type === 'raw_material' ? 'materials' : 'supplies'}` : ''}`);
      }

      const data = {
        data: {
          inventoryItem: lowStockItems
        }
      };
      console.log("✅ Low stock data fetched successfully:", data);
      const pdfBlob = reportsService.generateLowStockPDF(data, type);
      console.log("📄 Low stock PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting low stock report:", error);
      if (error.message && error.message.includes("No items found below minimum stock level")) {
        // Return a resolved promise with null to indicate no PDF was generated
        return Promise.resolve(null as any);
      }
      throw error;
    }
  },

  exportOutOfStockReport: async (type?: 'raw_material' | 'supplies'): Promise<Blob> => {
    console.log("📊 Starting out of stock report export...", { type });
    try {
      const params = type ? { type } : {};
      const allItems = await inventoryService.getInventory(params);
      const outOfStockItems = allItems.filter((item: any) => item.currentQuantity <= 0);

      if (outOfStockItems.length === 0) {
        throw new Error(`No out of stock items found${type ? ` for ${type === 'raw_material' ? 'materials' : 'supplies'}` : ''}`);
      }

      const data = {
        data: {
          inventoryItem: outOfStockItems
        }
      };
      console.log("✅ Out of stock data fetched successfully:", data);
      const pdfBlob = reportsService.generateOutOfStockPDF(data, type);
      console.log("📄 Out of stock PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting out of stock report:", error);
      if (error.message && error.message.includes("No out of stock items found")) {
        // Return a resolved promise with null to indicate no PDF was generated
        return Promise.resolve(null as any);
      }
      throw error;
    }
  },

  exportFinancialReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<Blob> => {
    console.log("📊 Starting financial report export...", {startDate, endDate});
    try {
      const data = await reportsService.getFinancialReport(startDate, endDate);
      console.log("✅ Financial data fetched successfully:", data);
      const pdfBlob = reportsService.generateFinancialPDF(
        data,
        startDate,
        endDate
      );
      console.log("📄 Financial PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting financial report:", error);
      throw error;
    }
  },

  exportProfitAndLossReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<Blob> => {
    console.log("📊 Starting profit and loss report export...", {startDate, endDate});
    try {
      const data = await reportsService.getProfitAndLossReport(startDate, endDate);
      console.log("✅ Profit and loss data fetched successfully:", data);
      const pdfBlob = reportsService.generateProfitAndLossPDF(
        data,
        startDate,
        endDate
      );
      console.log("📄 Profit and loss PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting profit and loss report:", error);
      throw error;
    }
  },

  exportExpenseBreakdownReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<Blob> => {
    console.log("📊 Starting expense breakdown report export...", {startDate, endDate});
    try {
      const data = await reportsService.getExpenseBreakdownReport(startDate, endDate);
      console.log("✅ Expense breakdown data fetched successfully:", data);
      const pdfBlob = reportsService.generateExpenseBreakdownPDF(
        data,
        startDate,
        endDate
      );
      console.log("📄 Expense breakdown PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting expense breakdown report:", error);
      throw error;
    }
  },

  exportProductsReport: async (): Promise<Blob> => {
    console.log("📊 Starting products report export...");
    try {
      const data = await reportsService.getProductsReport();
      console.log("✅ Products data fetched successfully:", data);
      const pdfBlob = reportsService.generateProductsPDF(data);
      console.log("📄 Products PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting products report:", error);
      throw error;
    }
  },

  exportProductDetailsReport: async (): Promise<Blob> => {
    console.log("📊 Starting product details report export...");
    try {
      const data = await reportsService.getProductDetailsReport();
      console.log("✅ Product details data fetched successfully:", data);

      // Fetch settings for company header
      let settings;
      try {
        const settingsService = (await import("@/services/settings")).settingsService;
        settings = await settingsService.getAll();
      } catch (error) {
        console.warn("Could not fetch settings for PDF header:", error);
      }

      const pdfBlob = reportsService.generateProductDetailsPDF(data, settings);
      console.log("📄 Product details PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting product details report:", error);
      throw error;
    }
  },

  exportGoodsReceivedReport: async (startDate?: string, endDate?: string, supplierId?: number): Promise<Blob> => {
    console.log("📊 Starting goods received report export...", {startDate, endDate, supplierId});
    try {
      const data = await reportsService.getGoodsReceivedReport(startDate, endDate, supplierId);
      console.log("✅ Goods received data fetched successfully:", data);
      const pdfBlob = reportsService.generateGoodsReceivedPDF(data, startDate, endDate);
      console.log("📄 Goods received PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting goods received report:", error);
      throw error;
    }
  },

  exportCashSalesReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<Blob> => {
    console.log("📊 Starting cash sales report export...", {
      startDate,
      endDate,
    });
    try {
      const data = await reportsService.getSalesReport(startDate, endDate);
      // Filter for cash sales only
      const cashSalesData = {
        ...data,
        data: {
          ...data.data,
          sales: data.data.sales.filter(sale => !sale.isCredit)
        }
      };
      console.log("✅ Cash sales data filtered successfully:", cashSalesData);
      const pdfBlob = reportsService.generateCashSalesPDF(
        cashSalesData,
        startDate,
        endDate
      );
      console.log("📄 Cash sales PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting cash sales report:", error);
      throw error;
    }
  },

  exportCreditSalesReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<Blob> => {
    console.log("📊 Starting credit sales report export...", {
      startDate,
      endDate,
    });
    try {
      const data = await reportsService.getSalesReport(startDate, endDate);
      // Filter for credit sales only
      const creditSalesData = {
        ...data,
        data: {
          ...data.data,
          sales: data.data.sales.filter(sale => sale.isCredit)
        }
      };
      console.log("✅ Credit sales data filtered successfully:", creditSalesData);
      const pdfBlob = reportsService.generateCreditSalesPDF(
        creditSalesData,
        startDate,
        endDate
      );
      console.log("📄 Credit sales PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting credit sales report:", error);
      throw error;
    }
  },

  exportSupplierWisePurchasesReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<Blob> => {
    console.log("📊 Starting supplier-wise purchases report export...", {
      startDate,
      endDate,
    });
    try {
      const data = await reportsService.getSupplierWisePurchasesReport(
        startDate,
        endDate
      );
      console.log(
        "✅ Supplier-wise purchases data fetched successfully:",
        data
      );
      const pdfBlob = reportsService.generateSupplierWisePurchasesPDF(
        data,
        startDate,
        endDate
      );
      console.log("📄 Supplier-wise purchases PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error(
        "❌ Error exporting supplier-wise purchases report:",
        error
      );
      throw error;
    }
  },

  exportIngredientPurchaseTrendReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<Blob> => {
    console.log("📊 Starting ingredient purchase trend report export...", {
      startDate,
      endDate,
    });
    try {
      const data = await reportsService.getIngredientPurchaseTrendReport(
        startDate,
        endDate
      );
      console.log(
        "✅ Ingredient purchase trend data fetched successfully:",
        data
      );
      const pdfBlob = reportsService.generateIngredientPurchaseTrendPDF(
        data,
        startDate,
        endDate
      );
      console.log("📄 Ingredient purchase trend PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error(
        "❌ Error exporting ingredient purchase trend report:",
        error
      );
      throw error;
    }
  },

  exportFinishedGoodsSummaryReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<Blob> => {
    console.log("📊 Starting products summary report export...", {
      startDate,
      endDate,
    });
    try {
      const data = await reportsService.getFinishedGoodsSummaryReport(
        startDate,
        endDate
      );
      console.log("✅ Finished goods summary data fetched successfully:", data);
      const pdfBlob = reportsService.generateFinishedGoodsSummaryPDF(
        data,
        startDate,
        endDate
      );
      console.log("📄 Finished goods summary PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting products summary report:", error);
      throw error;
    }
  },

  exportIngredientUsageReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<Blob> => {
    console.log("📊 Starting ingredient usage report export...", {
      startDate,
      endDate,
    });
    try {
      const data = await reportsService.getIngredientUsageReport(
        startDate,
        endDate
      );
      console.log("✅ Ingredient usage data fetched successfully:", data);
      const pdfBlob = reportsService.generateIngredientUsagePDF(
        data,
        startDate,
        endDate
      );
      console.log("📄 Ingredient usage PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting ingredient usage report:", error);
      throw error;
    }
  },

  exportGrossProfitReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<Blob> => {
    console.log("📊 Starting gross profit report export...", {startDate, endDate});
    try {
      const data = await reportsService.getProfitAndLossReport(startDate, endDate);
      console.log("✅ Gross profit data fetched successfully:", data);
      const pdfBlob = reportsService.generateGrossProfitPDF(
        data,
        startDate,
        endDate
      );
      console.log("📄 Gross profit PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting gross profit report:", error);
      throw error;
    }
  },

  exportNetProfitReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<Blob> => {
    console.log("📊 Starting net profit report export...", {startDate, endDate});
    try {
      const data = await reportsService.getProfitAndLossReport(startDate, endDate);
      console.log("✅ Net profit data fetched successfully:", data);
      const pdfBlob = reportsService.generateNetProfitPDF(
        data,
        startDate,
        endDate
      );
      console.log("📄 Net profit PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting net profit report:", error);
      throw error;
    }
  },

  // PDF generation functions
  generateSalesPDF: (
    data: SalesReport,
    startDate?: string,
    endDate?: string
  ): Blob => {
    console.log("🎨 Generating sales PDF...", {
      salesCount: data.data.sales.length,
    });
    const doc = new jsPDF();

    try {
      // Add company header
      let yPos = reportsService.addCompanyHeader(
        doc,
        "Sales Report",
        startDate,
        endDate
      );

      // Sales table
      const tableData = data.data.sales.map((sale, index) => [
        (index + 1).toString(),
        sale.id.toString(),
        format(sale.createdAt, "dd-MM-yyyy"),
        sale.customer?.name || "Cash",
        "System", // Sold By placeholder
        sale.total.toLocaleString(),
      ]);

      console.log("📋 Sales table data prepared:", tableData.length, "rows");

      autoTable(doc, {
        head: [["S/N", "Receipt #", "Date", "Customer", "Sold By", "Total"]],
        body: tableData,
        startY: yPos,
        theme: "grid",
        styles: {fontSize: 8},
        headStyles: {fillColor: [41, 128, 185]},
      });

      // Summary (after table)
      const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
      yPos = finalY + 15;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Summary", 20, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Total Sales: ${data.data.totalSales.toLocaleString()}`,
        20,
        yPos
      );
      yPos += 8;
      doc.text(
        `Credit Outstanding: ${data.data.creditOutstanding.toLocaleString()}`,
        20,
        yPos
      );

      const blob = doc.output("blob");
      console.log("✅ Sales PDF blob created, size:", blob.size, "bytes");
      return blob;
    } catch (error) {
      console.error("❌ Error generating sales PDF:", error);
      throw error;
    }
  },

  generatePurchasesPDF: (
    data: PurchasesReport,
    startDate?: string,
    endDate?: string
  ): Blob => {
    const doc = new jsPDF();

    // Add company header
    let yPos = reportsService.addCompanyHeader(
      doc,
      "All Purchases Report",
      startDate,
      endDate
    );

    // Purchases table - need to get goods receiving data for the detailed view
    // For now, using basic purchase order data
    const tableData = data.data.purchaseOrders.map((order) => [
      order.supplier.name,
      "1", // Placeholder for Qty - would need to get from goods receiving
      "0", // Placeholder for Price - would need to get from goods receiving
      `TZS ${order.totalCost.toLocaleString()}`,
      format(order.createdAt, "dd-MM-yyyy"), // Received Date
      "System", // Received By - placeholder
    ]);

    autoTable(doc, {
      head: [["Item Name", "Qty", "Price", "Total", "Received Date", "Received By"]],
      body: tableData,
      startY: yPos,
      theme: "grid",
      styles: {fontSize: 8},
      headStyles: {fillColor: [41, 128, 185]},
    });

    // Summary (after table)
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
    yPos = finalY + 15;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Total Purchases: TZS ${data.data.totalPurchases.toLocaleString()}`,
      20,
      yPos
    );

    return doc.output("blob");
  },

  generateProductionPDF: (
    data: ProductionReport,
    startDate?: string,
    endDate?: string
  ): Blob => {
    const doc = new jsPDF();

    // Add company header
    let yPos = reportsService.addCompanyHeader(
      doc,
      "Daily Production Batches Report",
      startDate,
      endDate
    );

    // Production table with new column structure
    const tableData = data.data.production.map((prod, index) => [
      (index + 1).toString(), // S/N
      format(prod.date || prod.createdAt || new Date(), "dd-MM-yyyy"), // Date
      prod.product, // Item Name
      prod.quantityProduced?.toString(), // Quantity
      "Ingredients list", // Ingredients Used
      `TSH ${prod.cost?.toLocaleString()}`, // Cost
      "System", // Produced By
    ]);

    autoTable(doc, {
      head: [["S/N", "Date", "Item Name", "Quantity", "Ingredients Used", "Cost", "Produced By"]],
      body: tableData,
      startY: yPos,
      theme: "grid",
      styles: {fontSize: 8},
      headStyles: {fillColor: [41, 128, 185]},
    });

    // Summary (after table)
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
    yPos = finalY + 15;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Produced: ${data.data.totalProduced} units`, 20, yPos);
    yPos += 8;
    doc.text(
      `Total Cost: TZS ${data.data.totalCost.toLocaleString()}`,
      20,
      yPos
    );

    return doc.output("blob");
  },

  generateInventoryPDF: (data: InventoryReport, type?: 'raw_material' | 'supplies'): Blob => {
    const doc = new jsPDF();

    // Add company header
    const reportTitle = type === 'raw_material' ? "Materials Current Stock Report" :
                       type === 'supplies' ? "Supplies Current Stock Report" :
                       "Inventory Report";
    let yPos = reportsService.addCompanyHeader(doc, reportTitle);

    //console.log("Inventory Data " , data.data.inventoryItems)
    // Inventory table

    const tableData = data.data.inventoryItem.map((item) => {
      // Convert current quantity to displayed unit
      const displayQuantity =
        item.type === "raw_material"
          ? fromBaseUnits(item.currentQuantity, item.unit)
          : item.currentQuantity;

      // Convert cost per unit based on unit
      let displayCost = item.cost;
      if (item.unit === "kg") {
        displayCost *= 1000; // cost per kg
      } else if (item.unit === "l") {
        displayCost *= 1000; // cost per liter
      }

      // Determine stock status
      let status = "Good Stock";
      if (displayQuantity <= 0) {
        status = "Out of Stock";
      } else if (displayQuantity <= item.minLevel) {
        status = "Low Stock";
      }

      return [
        item.name,
        item.unit,
        displayQuantity.toFixed(2),
        item.minLevel.toString(),
        displayCost.toLocaleString(),
        item.type,
        status, // stock status
      ];
    });

    autoTable(doc, {
      head: [
        ["Name", "Unit", "Current Qty", "Min Level", "Cost", "Type", "Status"],
      ],
      body: tableData,
      startY: yPos,
      theme: "grid",
      styles: {fontSize: 8},
      headStyles: {fillColor: [41, 128, 185]},
    });

    return doc.output("blob");
  },

  generateFinancialPDF: (
    data: FinancialReport,
    startDate?: string,
    endDate?: string
  ): Blob => {
    const doc = new jsPDF();

    // Add company header
    let yPos = reportsService.addCompanyHeader(
      doc,
      "Financial Report",
      startDate,
      endDate
    );

    // Add some spacing before financial summary
    yPos += 10;

    // Financial summary
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Financial Summary", 20, yPos);
    yPos += 15;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Revenue: TZS ${data.data.revenue.toLocaleString()}`, 20, yPos);
    yPos += 10;
    doc.text(`Expenses: TZS ${data.data.expenses.toLocaleString()}`, 20, yPos);
    yPos += 10;
    doc.text(`Profit: TZS ${data.data.profit.toLocaleString()}`, 20, yPos);
    yPos += 10;
    doc.text(
      `Outstanding Credits: TZS ${data.data.outstandingCredits.toLocaleString()}`,
      20,
      yPos
    );
    yPos += 10;
    doc.text(
      `Inventory Value: TZS ${data.data.inventoryValue.toLocaleString()}`,
      20,
      yPos
    );

    return doc.output("blob");
  },

  generateCustomerSalesPDF: (
    data: CustomerSalesReport,
    startDate?: string,
    endDate?: string
  ): Blob => {
    const doc = new jsPDF();

    // Add company header
    let yPos = reportsService.addCompanyHeader(
      doc,
      "Customer Sales Report",
      startDate,
      endDate
    );

    // Customer sales table
    const tableData = data.data.map((customer) => [
      customer.id.toString(),
      customer.name,
      customer.email,
      customer.totalSales.toString(),
      `TZS ${customer.totalSpent.toLocaleString()}`,
      `TZS ${customer.avgSpending.toLocaleString()}`,
    ]);

    autoTable(doc, {
      head: [
        ["ID", "Name", "Email", "Total Sales", "Total Spent", "Avg Spending"],
      ],
      body: tableData,
      startY: yPos,
      theme: "grid",
      styles: {fontSize: 8},
      headStyles: {fillColor: [41, 128, 185]},
    });

    return doc.output("blob");
  },

  generateSupplierWisePurchasesPDF: (
    data: SupplierWisePurchasesReport,
    startDate?: string,
    endDate?: string
  ): Blob => {
    const doc = new jsPDF();

    // Add company header
    let yPos = reportsService.addCompanyHeader(
      doc,
      "Supplier-wise Purchases Report",
      startDate,
      endDate
    );

    // Supplier purchases table
    const tableData = Object.entries(data.data.bySupplier).map(
      ([supplier, info]) => [
        supplier,
        `TZS ${info.totalPurchases.toLocaleString()}`,
      ]
    );

    autoTable(doc, {
      head: [["Supplier", "Total Purchases"]],
      body: tableData,
      startY: yPos,
      theme: "grid",
      styles: {fontSize: 8},
      headStyles: {fillColor: [41, 128, 185]},
    });

    return doc.output("blob");
  },

  generateIngredientPurchaseTrendPDF: (
    data: IngredientPurchaseTrendReport,
    startDate?: string,
    endDate?: string
  ): Blob => {
    const doc = new jsPDF();

    // Add company header
    let yPos = reportsService.addCompanyHeader(
      doc,
      "Ingredient Purchase Trend Report",
      startDate,
      endDate
    );

    // Ingredient purchase trend table
    const tableData = data.data.map((item) => [
      item.item,
      item.quantity.toString(),
      format(item.date, "dd-MM-yyyy"),
    ]);

    autoTable(doc, {
      head: [["Item", "Quantity", "Date"]],
      body: tableData,
      startY: yPos,
      theme: "grid",
      styles: {fontSize: 8},
      headStyles: {fillColor: [41, 128, 185]},
    });

    return doc.output("blob");
  },

  generateFinishedGoodsSummaryPDF: (
    data: FinishedGoodsSummaryReport,
    startDate?: string,
    endDate?: string
  ): Blob => {
    const doc = new jsPDF();

    // Add company header
    let yPos = reportsService.addCompanyHeader(
      doc,
      "Finished Goods Summary Report",
      startDate,
      endDate
    );

    // Finished goods summary table
    const tableData = data.data.map((item) => [
      item.item,
      item.produced.toString(),
      item.sold.toString(),
      item.remaining.toString(),
      format(item.date, "dd-MM-yyyy"),
    ]);

    autoTable(doc, {
      head: [["Item", "Produced", "Sold", "Remaining", "Date"]],
      body: tableData,
      startY: yPos,
      theme: "grid",
      styles: {fontSize: 8},
      headStyles: {fillColor: [41, 128, 185]},
    });

    return doc.output("blob");
  },

  generateIngredientUsagePDF: (
    data: IngredientUsageReport,
    startDate?: string,
    endDate?: string
  ): Blob => {
    const doc = new jsPDF();

    // Add company header
    let yPos = reportsService.addCompanyHeader(
      doc,
      "Ingredient Usage Report",
      startDate,
      endDate
    );

    // Ingredient usage table
    const tableData = data.data.map((item) => {
      let displayAmount = item.amount;

      displayAmount = fromBaseUnits(item.amount, item.unit);

      return [
        item.item,
        displayAmount,
        item.unit,
        format(new Date(item.date), "dd-MM-yyyy"),
      ];
    });

    autoTable(doc, {
      head: [["Item", "Amount", "Unit", "Date"]],
      body: tableData,
      startY: yPos,
      theme: "grid",
      styles: {fontSize: 8},
      headStyles: {fillColor: [41, 128, 185]},
    });

    return doc.output("blob");
  },

  generateProfitAndLossPDF: (
    data: ProfitAndLossReport,
    startDate?: string,
    endDate?: string
  ): Blob => {
    const doc = new jsPDF();

    // Add company header
    let yPos = reportsService.addCompanyHeader(
      doc,
      "Profit and Loss Statement",
      startDate,
      endDate
    );

    // Add some spacing
    yPos += 10;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Profit and Loss Statement", 20, yPos);
    yPos += 15;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    // Revenue
    doc.text(`Revenue: TZS ${data.data.revenue.toLocaleString()}`, 20, yPos);
    yPos += 10;

    // Cost of Goods Sold
    doc.text(`Cost of Goods Sold: TZS ${data.data.cogs.toLocaleString()}`, 20, yPos);
    yPos += 10;

    // Gross Profit Section
    doc.setFont("helvetica", "bold");
    doc.text(`Gross Profit: TZS ${data.data.grossProfit.result.toLocaleString()}`, 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`(Revenue: TZS ${data.data.grossProfit.parameters.totalSales.toLocaleString()} - COGS: TZS ${data.data.grossProfit.parameters.costOfGoodsSold.toLocaleString()})`, 30, yPos);
    yPos += 15;

    // Operating Expenses
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Operating Expenses: TZS ${data.data.operatingExpenses.toLocaleString()}`, 20, yPos);
    yPos += 15;

    // Net Profit Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`Net Profit: TZS ${data.data.netProfit.result.toLocaleString()}`, 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`(Gross Profit: TZS ${data.data.netProfit.parameters.grossProfit.toLocaleString()} - Operating Expenses: TZS ${data.data.netProfit.parameters.operatingExpenses.toLocaleString()})`, 30, yPos);

    return doc.output("blob");
  },

  generateExpenseBreakdownPDF: (
    data: ExpenseBreakdownReport,
    startDate?: string,
    endDate?: string
  ): Blob => {
    const doc = new jsPDF();

    // Add company header
    let yPos = reportsService.addCompanyHeader(
      doc,
      "Expense Category Breakdown",
      startDate,
      endDate
    );

    // Expense breakdown table
    const tableData = Object.entries(data.data.breakdown).map(([category, amount]) => [
      category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      `TZS ${amount.toLocaleString()}`,
    ]);

    autoTable(doc, {
      head: [["Category", "Amount"]],
      body: tableData,
      startY: yPos,
      theme: "grid",
      styles: {fontSize: 10},
      headStyles: {fillColor: [41, 128, 185]},
    });

    // Add total
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
    let totalY = finalY + 15;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Expenses: TZS ${data.data.totalExpenses.toLocaleString()}`, 20, totalY);

    return doc.output("blob");
  },

  generateProductsPDF: (data: ProductsReport): Blob => {
    const doc = new jsPDF();

    // Add company header
    let yPos = reportsService.addCompanyHeader(doc, "Price List");

    // Products table
    const tableData = data.data.map((product, index) => [
      (index + 1).toString(),
      product.name,
      product.price.toLocaleString(),
    ]);

    autoTable(doc, {
      head: [["S/N", "Product Name", "Price"]],
      body: tableData,
      startY: yPos,
      theme: "grid",
      styles: {fontSize: 8},
      headStyles: {fillColor: [41, 128, 185]},
    });

    return doc.output("blob");
  },

  generateProductDetailsPDF: (data: ProductDetailsReport, settings?: any): Blob => {
    const doc = new jsPDF();

    // Add company header
    let yPos = reportsService.addCompanyHeader(doc, "Product Details Report", undefined, undefined, settings);

    // Product details table
    const tableData = data.data.map((product, index) => [
      (index + 1).toString(),
      product.name,
      product.price.toLocaleString(),
      product.averageProductionCost.toLocaleString(),
      product.profit.toLocaleString(),
    ]);

    autoTable(doc, {
      head: [["S/N", "Product Name", "Price", "Average Production Cost", "Profit"]],
      body: tableData,
      startY: yPos,
      theme: "grid",
      styles: {fontSize: 8},
      headStyles: {fillColor: [41, 128, 185]},
    });

    return doc.output("blob");
  },

  generateCashSalesPDF: (
    data: SalesReport,
    startDate?: string,
    endDate?: string
  ): Blob => {
    console.log("🎨 Generating cash sales PDF...", {
      salesCount: data.data.sales.length,
    });
    const doc = new jsPDF();

    try {
      // Add company header
      let yPos = reportsService.addCompanyHeader(
        doc,
        "Cash Sales Report",
        startDate,
        endDate
      );

      // Cash sales table
      const tableData = data.data.sales.map((sale, index) => [
        (index + 1).toString(),
        sale.id.toString(),
        format(sale.createdAt, "dd-MM-yyyy"),
        sale.customer?.name || "Cash",
        "System", // Sold By placeholder
        sale.total.toLocaleString(),
      ]);

      console.log("📋 Cash sales table data prepared:", tableData.length, "rows");

      autoTable(doc, {
        head: [["S/N", "Receipt #", "Date", "Customer", "Sold By", "Total"]],
        body: tableData,
        startY: yPos,
        theme: "grid",
        styles: {fontSize: 8},
        headStyles: {fillColor: [41, 128, 185]},
      });

      // Summary (after table)
      const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
      yPos = finalY + 15;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Summary", 20, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Total Cash Sales: ${data.data.totalSales.toLocaleString()}`,
        20,
        yPos
      );

      const blob = doc.output("blob");
      console.log("✅ Cash sales PDF blob created, size:", blob.size, "bytes");
      return blob;
    } catch (error) {
      console.error("❌ Error generating cash sales PDF:", error);
      throw error;
    }
  },

  generateCreditSalesPDF: (
    data: SalesReport,
    startDate?: string,
    endDate?: string
  ): Blob => {
    console.log("🎨 Generating credit sales PDF...", {
      salesCount: data.data.sales.length,
    });
    const doc = new jsPDF();

    try {
      // Add company header
      let yPos = reportsService.addCompanyHeader(
        doc,
        "Credit Sales Report",
        startDate,
        endDate
      );

      // Credit sales table
      const tableData = data.data.sales.map((sale, index) => [
        (index + 1).toString(),
        sale.id.toString(),
        format(sale.createdAt, "dd-MM-yyyy"),
        sale.customer?.name || "Cash",
        "System", // Sold By placeholder
        sale.total.toLocaleString(),
        sale.status,
      ]);

      console.log("📋 Credit sales table data prepared:", tableData.length, "rows");

      autoTable(doc, {
        head: [["S/N", "Receipt #", "Date", "Customer", "Sold By", "Total", "Status"]],
        body: tableData,
        startY: yPos,
        theme: "grid",
        styles: {fontSize: 8},
        headStyles: {fillColor: [41, 128, 185]},
      });

      // Summary (after table)
      const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
      yPos = finalY + 15;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Summary", 20, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Total Credit Sales: ${data.data.totalSales.toLocaleString()}`,
        20,
        yPos
      );
      yPos += 8;
      doc.text(
        `Credit Outstanding: ${data.data.creditOutstanding.toLocaleString()}`,
        20,
        yPos
      );

      const blob = doc.output("blob");
      console.log("✅ Credit sales PDF blob created, size:", blob.size, "bytes");
      return blob;
    } catch (error) {
      console.error("❌ Error generating credit sales PDF:", error);
      throw error;
    }
  },

  generateGoodsReceivedPDF: (data: any, startDate?: string, endDate?: string): Blob => {
    const doc = new jsPDF();

    // Add company header
    let yPos = reportsService.addCompanyHeader(
      doc,
      "Material Receiving Report",
      startDate,
      endDate
    );

    // Goods received table with detailed item information
    const tableData: any[] = [];

    data.goodsReceipts.forEach((receipt: any, index: number) => {
      // For each goods receipt, we need to get the detailed items
      // Since the API returns summary data, we'll use what's available
      tableData.push([
        (index + 1).toString(),
        receipt.supplierName || "Unknown Supplier",
        "Material", // Item Name placeholder - would need detailed API
        "1", // Placeholder for quantity - would need detailed API
        receipt.total.toLocaleString(),
        format(receipt.receivedDate || receipt.createdAt, "dd-MM-yyyy"),
        "System", // Received By placeholder
      ]);
    });

    autoTable(doc, {
      head: [["S/N", "Supplier", "Item Name", "Qty", "Price", "Received Date", "Received By"]],
      body: tableData,
      startY: yPos,
      theme: "grid",
      styles: {fontSize: 8},
      headStyles: {fillColor: [41, 128, 185]},
    });

    return doc.output("blob");
  },

  generateInventoryAdjustmentsPDF: (
    data: InventoryAdjustmentsReport,
    startDate?: string,
    endDate?: string,
    type?: 'raw_material' | 'supplies'
  ): Blob => {
    const doc = new jsPDF();

    // Add company header
    const reportTitle = type === 'raw_material' ? "Materials Adjustments Report" :
                       type === 'supplies' ? "Supplies Adjustments Report" :
                       "Inventory Adjustments Report";
    let yPos = reportsService.addCompanyHeader(
      doc,
      reportTitle,
      startDate,
      endDate
    );

    // Inventory adjustments table
    const tableData = data.data.adjustments.map((adjustment, index) => {
      // Convert quantity to display units
      let displayQuantity = adjustment.amount;
      let displayUnit = adjustment.inventoryItem.unit;

      if ((adjustment.inventoryItem.unit === "kg" || adjustment.inventoryItem.unit === "l") && Math.abs(displayQuantity) < 1000) {
        displayQuantity = displayQuantity / 1000;
        displayUnit = adjustment.inventoryItem.unit === "kg" ? "g" : "ml";
      }

      const adjustmentType = adjustment.amount > 0 ? "Increased" : "Deducted";

      return [
        (index + 1).toString(),
        adjustment.inventoryItem.name,
        format(adjustment.createdAt, "dd-MM-yyyy"),
        adjustmentType,
        `${displayQuantity.toFixed(2)} ${displayUnit}`,
        adjustment.reason || "No reason provided",
        adjustment.createdBy.name,
      ];
    });

    autoTable(doc, {
      head: [["S/N", "Item Name", "Date", "Type", "Quantity", "Reason", "Adj By"]],
      body: tableData,
      startY: yPos,
      theme: "grid",
      styles: {fontSize: 8},
      headStyles: {fillColor: [41, 128, 185]},
    });

    return doc.output("blob");
  },

  generateLowStockPDF: (data: LowStockReport, type?: 'raw_material' | 'supplies'): Blob => {
    const doc = new jsPDF();

    // Add company header
    const reportTitle = type === 'raw_material' ? "Materials Below Min Level Report" :
                       type === 'supplies' ? "Supplies Below Min Level Report" :
                       "Stock Below Min Level Report";
    let yPos = reportsService.addCompanyHeader(doc, reportTitle);

    // Low stock table
    const tableData = data.data.inventoryItem.map((item, index) => {
      // Convert quantities from base units to natural units
      let displayCurrentQty = fromBaseUnits(item.currentQuantity, item.unit);
      let displayMinQty = item.minLevel; // minLevel is already in natural units

      return [
        (index + 1).toString(),
        item.name,
        item.type === "raw_material" ? "Material" : "Supplies",
        `${displayMinQty.toFixed(2)} ${item.unit}`,
        `${displayCurrentQty.toFixed(2)} ${item.unit}`,
      ];
    });

    autoTable(doc, {
      head: [["S/N", "Item Name", "Category", "Min Qty", "Available Qty"]],
      body: tableData,
      startY: yPos,
      theme: "grid",
      styles: {fontSize: 8},
      headStyles: {fillColor: [41, 128, 185]},
    });

    return doc.output("blob");
  },

  generateOutOfStockPDF: (data: OutOfStockReport, type?: 'raw_material' | 'supplies'): Blob => {
    const doc = new jsPDF();

    // Add company header
    const reportTitle = type === 'raw_material' ? "Materials Out of Stock Report" :
                        type === 'supplies' ? "Supplies Out of Stock Report" :
                        "Out of Stock Report";
    let yPos = reportsService.addCompanyHeader(doc, reportTitle);

    // Out of stock table
    const tableData = data.data.inventoryItem.map((item, index) => [
      (index + 1).toString(),
      item.name,
      item.type === "raw_material" ? "Material" : "Supplies",
      item.unit,
    ]);

    autoTable(doc, {
      head: [["S/N", "Item Name", "Category", "Unit"]],
      body: tableData,
      startY: yPos,
      theme: "grid",
      styles: {fontSize: 8},
      headStyles: {fillColor: [41, 128, 185]},
    });

    return doc.output("blob");
  },

  generateGrossProfitPDF: (
    data: ProfitAndLossReport,
    startDate?: string,
    endDate?: string
  ): Blob => {
    const doc = new jsPDF();

    // Add company header
    let yPos = reportsService.addCompanyHeader(
      doc,
      "Gross Profit Report",
      startDate,
      endDate
    );

    // Add some spacing
    yPos += 10;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Gross Profit Analysis", 20, yPos);
    yPos += 20;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    // Revenue section
    doc.setFont("helvetica", "bold");
    doc.text("Revenue", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(`Value: TZS ${data.data.revenue.toLocaleString()}`, 40, yPos);
    yPos += 12;

    // Separator line
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 180, yPos);
    yPos += 8;

    // Cost of Production section
    doc.setFont("helvetica", "bold");
    doc.text("Cost of Production", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(`Value: TZS ${data.data.cogs.toLocaleString()}`, 40, yPos);
    yPos += 12;

    // Separator line
    doc.line(20, yPos, 180, yPos);
    yPos += 8;

    // Gross Profit (highlighted)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`Gross Profit: TZS ${data.data.grossProfit.result.toLocaleString()}`, 20, yPos);
    yPos += 12;

    // Calculation details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Calculation: Revenue (TZS ${data.data.grossProfit.parameters.totalSales.toLocaleString()}) - Cost of Production (TZS ${data.data.grossProfit.parameters.costOfGoodsSold.toLocaleString()})`, 20, yPos);
    yPos += 15;

    // Gross Profit Margin
    const margin = data.data.revenue > 0 ? ((data.data.grossProfit.result / data.data.revenue) * 100) : 0;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Gross Profit Margin: ${margin.toFixed(2)}%`, 20, yPos);

    return doc.output("blob");
  },

  generateNetProfitPDF: (
    data: ProfitAndLossReport,
    startDate?: string,
    endDate?: string
  ): Blob => {
    const doc = new jsPDF();

    // Add company header
    let yPos = reportsService.addCompanyHeader(
      doc,
      "Net Profit Report",
      startDate,
      endDate
    );

    // Add some spacing
    yPos += 10;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Net Profit Analysis", 20, yPos);
    yPos += 20;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    // Gross Profit section
    doc.setFont("helvetica", "bold");
    doc.text("Gross Profit", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(`Value: TZS ${data.data.grossProfit.result.toLocaleString()}`, 40, yPos);
    yPos += 12;

    // Separator line
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 180, yPos);
    yPos += 8;

    // Operating Expenses section
    doc.setFont("helvetica", "bold");
    doc.text("Operating Expenses", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(`Value: TZS ${data.data.operatingExpenses.toLocaleString()}`, 40, yPos);
    yPos += 12;

    // Separator line
    doc.line(20, yPos, 180, yPos);
    yPos += 8;

    // Net Profit (highlighted)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`Net Profit: TZS ${data.data.netProfit.result.toLocaleString()}`, 20, yPos);
    yPos += 12;

    // Calculation details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Calculation: Gross Profit (TZS ${data.data.netProfit.parameters.grossProfit.toLocaleString()}) - Operating Expenses (TZS ${data.data.netProfit.parameters.operatingExpenses.toLocaleString()})`, 20, yPos);
    yPos += 15;

    // Net Profit Margin
    const margin = data.data.revenue > 0 ? ((data.data.netProfit.result / data.data.revenue) * 100) : 0;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Net Profit Margin: ${margin.toFixed(2)}%`, 20, yPos);

    return doc.output("blob");
  },

  generateExpensesPDF: (data: any, startDate?: string, endDate?: string): Blob => {
    const doc = new jsPDF();

    // Add company header
    let yPos = reportsService.addCompanyHeader(
      doc,
      "Expenses Report",
      startDate,
      endDate
    );

    // Expenses table
    const tableData = data.data?.expenses?.map((expense: any, index: number) => [
      (index + 1).toString(),
      format(expense.date, "dd-MM-yyyy"),
      expense.expenseCategory?.name || 'Unknown',
      expense.amount.toLocaleString(),
      expense.paymentMethod?.replace('_', ' ').toUpperCase() || 'CASH',
      expense.notes || '',
    ]) || [];

    autoTable(doc, {
      head: [["S/N", "Date", "Category", "Amount", "Payment Method", "Notes"]],
      body: tableData,
      startY: yPos,
      theme: "grid",
      styles: {fontSize: 8},
      headStyles: {fillColor: [41, 128, 185]},
    });

    // Summary (after table)
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
    yPos = finalY + 15;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const totalExpenses = data.data?.expenses?.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0;
    doc.text(`Total Expenses: TZS ${totalExpenses.toLocaleString()}`, 20, yPos);

    return doc.output("blob");
  },

  generateOutstandingPaymentsPDF: (data: any, startDate?: string, endDate?: string): Blob => {
    const doc = new jsPDF();

    // Add company header
    let yPos = reportsService.addCompanyHeader(
      doc,
      "Outstanding Payments Report",
      startDate,
      endDate
    );

    // Outstanding payments table
    const tableData = data.data?.sales?.map((sale: any, index: number) => [
      (index + 1).toString(),
      sale.id.toString(),
      sale.customer?.name || 'Walk-in Customer',
      sale.total.toLocaleString(),
      (sale.paid || 0).toLocaleString(),
      (sale.outstandingBalance || 0).toLocaleString(),
      sale.creditDueDate ? format(sale.creditDueDate, "dd-MM-yyyy") : 'N/A',
    ]) || [];

    autoTable(doc, {
      head: [["S/N", "Receipt #", "Customer", "Total Amount", "Paid", "Balance", "Due Date"]],
      body: tableData,
      startY: yPos,
      theme: "grid",
      styles: {fontSize: 8},
      headStyles: {fillColor: [41, 128, 185]},
    });

    // Summary (after table)
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
    yPos = finalY + 15;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const totalOutstanding = data.data?.sales?.reduce((sum: number, sale: any) => sum + (sale.outstandingBalance || 0), 0) || 0;
    doc.text(`Total Outstanding: TZS ${totalOutstanding.toLocaleString()}`, 20, yPos);

    return doc.output("blob");
  },
  // Production Summary for Dashboard
  getProductionSummary: async (): Promise<{dailyProduction: number, weeklyProduction: number, weeklyProductionCost: number}> => {
    const response = await api.get('/dashboard/production');
    return response.data;
  },

  // Expenses Report
  getExpensesReport: async (startDate?: string, endDate?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/reports/expenses?${params.toString()}`);
    return response.data;
  },

  // Outstanding Payments Report
  getOutstandingPaymentsReport: async (startDate?: string, endDate?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/reports/outstanding-payments?${params.toString()}`);
    return response.data;
  },

  // Export Expenses Report
  exportExpensesReport: async (startDate?: string, endDate?: string): Promise<Blob> => {
    console.log("📊 Starting expenses report export...", {startDate, endDate});
    try {
      const data = await reportsService.getExpensesReport(startDate, endDate);
      console.log("✅ Expenses data fetched successfully:", data);
      const pdfBlob = reportsService.generateExpensesPDF(data, startDate, endDate);
      console.log("📄 Expenses PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting expenses report:", error);
      throw error;
    }
  },

  // Export Outstanding Payments Report
  exportOutstandingPaymentsReport: async (startDate?: string, endDate?: string): Promise<Blob> => {
    console.log("📊 Starting outstanding payments report export...", {startDate, endDate});
    try {
      const data = await reportsService.getOutstandingPaymentsReport(startDate, endDate);
      console.log("✅ Outstanding payments data fetched successfully:", data);
      const pdfBlob = reportsService.generateOutstandingPaymentsPDF(data, startDate, endDate);
      console.log("📄 Outstanding payments PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting outstanding payments report:", error);
      throw error;
    }
  },
};

