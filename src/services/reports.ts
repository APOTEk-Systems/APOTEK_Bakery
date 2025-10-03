import {api} from "@/lib/api";
import {fromBaseUnits} from "@/lib/funcs";
import {format} from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
    inventory: Array<{
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
    grossProfit: number;
    netProfit: number;
  };
}

export interface ExpenseBreakdownReport {
  data: {
    breakdown: Record<string, number>;
    totalExpenses: number;
  };
}

export const reportsService = {
  // Helper function to add company header to PDFs
  addCompanyHeader: (
    doc: jsPDF,
    reportTitle: string,
    startDate?: string,
    endDate?: string
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

    // Try to get company settings synchronously (this might not work in all environments)
    try {
      // For now, use default info since settings API is async
      // In a real implementation, you might want to cache settings or make PDF generation async
      console.log("Using default company info for PDF header");
    } catch (error) {
      console.warn("Using default company info for PDF header");
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

  exportInventoryReport: async (): Promise<Blob> => {
    console.log("📊 Starting inventory report export...");
    try {
      const data = await reportsService.getInventoryReport();
      console.log("✅ Inventory data fetched successfully:", data);
      const pdfBlob = reportsService.generateInventoryPDF(data);
      console.log("📄 Inventory PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting inventory report:", error);
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

  exportCustomerSalesReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<Blob> => {
    console.log("📊 Starting customer sales report export...", {
      startDate,
      endDate,
    });
    try {
      const data = await reportsService.getCustomerSalesReport(
        startDate,
        endDate
      );
      console.log("✅ Customer sales data fetched successfully:", data);
      const pdfBlob = reportsService.generateCustomerSalesPDF(
        data,
        startDate,
        endDate
      );
      console.log("📄 Customer sales PDF generated successfully");
      return pdfBlob;
    } catch (error) {
      console.error("❌ Error exporting customer sales report:", error);
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
      const tableData = data.data.sales.map((sale) => [
        sale.id.toString(),
        sale.customer?.name || "Cash",
        format(sale.createdAt, "dd-MM-yyyy"),
        `TSH ${sale.total.toLocaleString()}`,
        sale.status,
        sale.isCredit ? "Yes" : "No",
      ]);

      console.log("📋 Sales table data prepared:", tableData.length, "rows");

      autoTable(doc, {
        head: [["ID", "Customer", "Date", "Total", "Status", "Credit"]],
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
        `Total Sales: TZS ${data.data.totalSales.toLocaleString()}`,
        20,
        yPos
      );
      yPos += 8;
      doc.text(
        `Credit Outstanding: TZS ${data.data.creditOutstanding.toLocaleString()}`,
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
      "Purchases Report",
      startDate,
      endDate
    );

    // Purchases table
    const tableData = data.data.purchaseOrders.map((order) => [
      order.id.toString(),
      order.supplier.name,
      format(order.createdAt, "dd-MM-yyyy"),
      `TZS ${order.totalCost.toLocaleString()}`,
      order.status,
    ]);

    autoTable(doc, {
      head: [["ID", "Supplier", "Date", "Total Cost", "Status"]],
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
      "Production Report",
      startDate,
      endDate
    );

    // Production table
    const tableData = data.data.production.map((prod) => [
      prod.id.toString(),
      prod.product,
      prod.quantityProduced.toString(),
      format(prod.createdAt, "dd-MM-yyyy"),
      `TSH ${prod.cost.toLocaleString()}`,
    ]);

    autoTable(doc, {
      head: [["ID", "Product", "Quantity", "Date", "Cost"]],
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

  generateInventoryPDF: (data: InventoryReport): Blob => {
    const doc = new jsPDF();

    // Add company header
    let yPos = reportsService.addCompanyHeader(doc, "Inventory Report");

    //console.log("Inventory Data " , data.data.inventoryItems)
    // Inventory table

    const tableData = data.data.inventory.map((item) => {
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

    // Gross Profit
    doc.setFont("helvetica", "bold");
    doc.text(`Gross Profit: TZS ${data.data.grossProfit.toLocaleString()}`, 20, yPos);
    yPos += 15;

    // Operating Expenses
    doc.setFont("helvetica", "normal");
    doc.text(`Operating Expenses: TZS ${data.data.operatingExpenses.toLocaleString()}`, 20, yPos);
    yPos += 15;

    // Net Profit
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`Net Profit: TZS ${data.data.netProfit.toLocaleString()}`, 20, yPos);

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
};
