import { api } from '@/lib/api';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export const reportsService = {
  // Test function to check if PDF generation works
  testPDFGeneration(): Blob {
    console.log('🧪 Testing basic PDF generation...');
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Test PDF Report', 20, 20);
      doc.setFontSize(12);
      doc.text('This is a test to verify PDF generation works.', 20, 40);
      doc.text(`Generated at: ${new Date().toLocaleString()}`, 20, 60);

      // Test table functionality
      autoTable(doc, {
        head: [['Column 1', 'Column 2', 'Column 3']],
        body: [
          ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
          ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3']
        ],
        startY: 80,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      const blob = doc.output('blob');
      console.log('✅ Test PDF generated successfully, size:', blob.size);
      return blob;
    } catch (error) {
      console.error('❌ Test PDF generation failed:', error);
      throw error;
    }
  },

  // Sales Report
  getSalesReport: async (startDate?: string, endDate?: string): Promise<SalesReport> => {
    console.log('🔍 Fetching sales report data...', { startDate, endDate });
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/reports/sales?${params.toString()}`);
    console.log('📥 Sales API response:', response);
    return response.data;
  },

  // Purchases Report
  getPurchasesReport: async (startDate?: string, endDate?: string): Promise<PurchasesReport> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/reports/purchases?${params.toString()}`);
    return response.data;
  },

  // Production Report
  getProductionReport: async (startDate?: string, endDate?: string): Promise<ProductionReport> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/reports/production?${params.toString()}`);
    return response.data;
  },

  // Inventory Report
  getInventoryReport: async (): Promise<InventoryReport> => {
    const response = await api.get('/reports/inventory');
    return response.data;
  },

  // Financial Report
  getFinancialReport: async (startDate?: string, endDate?: string): Promise<FinancialReport> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/reports/financial?${params.toString()}`);
    return response.data;
  },

  // Client-side PDF generation methods
  exportSalesReport: async (startDate?: string, endDate?: string): Promise<Blob> => {
    console.log('📊 Starting sales report export...', { startDate, endDate });
    try {
      const data = await reportsService.getSalesReport(startDate, endDate);
      console.log('✅ Sales data fetched successfully:', data);
      const pdfBlob = reportsService.generateSalesPDF(data, startDate, endDate);
      console.log('📄 Sales PDF generated successfully');
      return pdfBlob;
    } catch (error) {
      console.error('❌ Error exporting sales report:', error);
      throw error;
    }
  },

  exportPurchasesReport: async (startDate?: string, endDate?: string): Promise<Blob> => {
    console.log('📊 Starting purchases report export...', { startDate, endDate });
    try {
      const data = await reportsService.getPurchasesReport(startDate, endDate);
      console.log('✅ Purchases data fetched successfully:', data);
      const pdfBlob = reportsService.generatePurchasesPDF(data, startDate, endDate);
      console.log('📄 Purchases PDF generated successfully');
      return pdfBlob;
    } catch (error) {
      console.error('❌ Error exporting purchases report:', error);
      throw error;
    }
  },

  exportProductionReport: async (startDate?: string, endDate?: string): Promise<Blob> => {
    console.log('📊 Starting production report export...', { startDate, endDate });
    try {
      const data = await reportsService.getProductionReport(startDate, endDate);
      console.log('✅ Production data fetched successfully:', data);
      const pdfBlob = reportsService.generateProductionPDF(data, startDate, endDate);
      console.log('📄 Production PDF generated successfully');
      return pdfBlob;
    } catch (error) {
      console.error('❌ Error exporting production report:', error);
      throw error;
    }
  },

  exportInventoryReport: async (): Promise<Blob> => {
    console.log('📊 Starting inventory report export...');
    try {
      const data = await reportsService.getInventoryReport();
      console.log('✅ Inventory data fetched successfully:', data);
      const pdfBlob = reportsService.generateInventoryPDF(data);
      console.log('📄 Inventory PDF generated successfully');
      return pdfBlob;
    } catch (error) {
      console.error('❌ Error exporting inventory report:', error);
      throw error;
    }
  },

  exportFinancialReport: async (startDate?: string, endDate?: string): Promise<Blob> => {
    console.log('📊 Starting financial report export...', { startDate, endDate });
    try {
      const data = await reportsService.getFinancialReport(startDate, endDate);
      console.log('✅ Financial data fetched successfully:', data);
      const pdfBlob = reportsService.generateFinancialPDF(data, startDate, endDate);
      console.log('📄 Financial PDF generated successfully');
      return pdfBlob;
    } catch (error) {
      console.error('❌ Error exporting financial report:', error);
      throw error;
    }
  },

  // PDF generation functions
  generateSalesPDF: (data: SalesReport, startDate?: string, endDate?: string): Blob => {
    console.log('🎨 Generating sales PDF...', { salesCount: data.data.sales.length });
    console.log('📚 jsPDF version check:', jsPDF.version);
    const doc = new jsPDF();
    console.log('📄 jsPDF document created');

    try {
      // Header
      doc.setFontSize(20);
      doc.text('Sales Report', 20, 20);

      doc.setFontSize(12);
      const dateRange = startDate && endDate ? `From ${startDate} to ${endDate}` : 'All Time';
      doc.text(`Date Range: ${dateRange}`, 20, 35);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);

      // Summary
      doc.setFontSize(14);
      doc.text('Summary', 20, 65);
      doc.setFontSize(12);
      doc.text(`Total Sales: TZS ${data.data.totalSales.toLocaleString()}`, 20, 80);
      doc.text(`Credit Outstanding: TZS ${data.data.creditOutstanding.toLocaleString()}`, 20, 90);

      // Sales table
      const tableData = data.data.sales.map(sale => [
        sale.id.toString(),
        sale.customer?.name || 'Cash',
        format(sale.createdAt, "dd-MM-yyyy"),
        `TSH ${sale.total.toLocaleString()}`,
        sale.status,
        sale.isCredit ? 'Yes' : 'No'
      ]);

      console.log('📋 Sales table data prepared:', tableData.length, 'rows');

      autoTable(doc, {
        head: [['ID', 'Customer', 'Date', 'Total', 'Status', 'Credit']],
        body: tableData,
        startY: 105,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      const blob = doc.output('blob');
      console.log('✅ Sales PDF blob created, size:', blob.size, 'bytes');
      return blob;
    } catch (error) {
      console.error('❌ Error generating sales PDF:', error);
      throw error;
    }
  },

  generatePurchasesPDF: (data: PurchasesReport, startDate?: string, endDate?: string): Blob => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('Purchases Report', 20, 20);

    doc.setFontSize(12);
    const dateRange = startDate && endDate ? `From ${startDate} to ${endDate}` : 'All Time';
    doc.text(`Date Range: ${dateRange}`, 20, 35);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);

    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 20, 65);
    doc.setFontSize(12);
    doc.text(`Total Purchases: TZS ${data.data.totalPurchases.toLocaleString()}`, 20, 80);

    // Purchases table
    const tableData = data.data.purchaseOrders.map(order => [
      order.id.toString(),
      order.supplier.name,
      format(order.createdAt, "dd-MM-yyyy"),
      `TZS ${order.totalCost.toLocaleString()}`,
      order.status
    ]);

    autoTable(doc, {
      head: [['ID', 'Supplier', 'Date', 'Total Cost', 'Status']],
      body: tableData,
      startY: 95,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    return doc.output('blob');
  },

  generateProductionPDF: (data: ProductionReport, startDate?: string, endDate?: string): Blob => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('Production Report', 20, 20);

    doc.setFontSize(12);
    const dateRange = startDate && endDate ? `From ${startDate} to ${endDate}` : 'All Time';
    doc.text(`Date Range: ${dateRange}`, 20, 35);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);

    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 20, 65);
    doc.setFontSize(12);
    doc.text(`Total Produced: ${data.data.totalProduced} units`, 20, 80);
    doc.text(`Total Cost: TZS ${data.data.totalCost.toLocaleString()}`, 20, 90);

    // Production table
    const tableData = data.data.production.map(prod => [
      prod.id.toString(),
      prod.product,
      prod.quantityProduced.toString(),
      format(prod.createdAt, "dd-MM-yyyy"),
      `TSH ${prod.cost.toLocaleString()}`,
    ]);

    autoTable(doc, {
      head: [['ID', 'Product', 'Quantity', 'Date', 'Cost']],
      body: tableData,
      startY: 105,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    return doc.output('blob');
  },

  generateInventoryPDF: (data: InventoryReport): Blob => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('Inventory Report', 20, 20);

    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);

    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 20, 55);
    doc.setFontSize(12);
    doc.text(`Total Value: TZS ${data.data.totalValue.toLocaleString()}`, 20, 70);
    doc.text(`Low Stock Items: ${data.data.lowStockItems}`, 20, 80);

    // Inventory table
    const tableData = data.data.inventory.map(item => [
      item.name,
      item.unit,
      item.currentQuantity.toString(),
      item.minLevel.toString(),
      `TSH ${item.cost.toLocaleString()}`,
      item.type
    ]);

    autoTable(doc, {
      head: [['Name', 'Unit', 'Current Qty', 'Min Level', 'Cost', 'Type']],
      body: tableData,
      startY: 95,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    return doc.output('blob');
  },

  generateFinancialPDF: (data: FinancialReport, startDate?: string, endDate?: string): Blob => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('Financial Report', 20, 20);

    doc.setFontSize(12);
    const dateRange = startDate && endDate ? `From ${startDate} to ${endDate}` : 'All Time';
    doc.text(`Date Range: ${dateRange}`, 20, 35);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);

    // Financial summary
    doc.setFontSize(14);
    doc.text('Financial Summary', 20, 65);

    doc.setFontSize(12);
    let yPos = 80;
    doc.text(`Revenue: TZS ${data.data.revenue.toLocaleString()}`, 20, yPos);
    yPos += 10;
    doc.text(`Expenses: TZS ${data.data.expenses.toLocaleString()}`, 20, yPos);
    yPos += 10;
    doc.text(`Profit: TZS ${data.data.profit.toLocaleString()}`, 20, yPos);
    yPos += 10;
    doc.text(`Outstanding Credits: TZS ${data.data.outstandingCredits.toLocaleString()}`, 20, yPos);
    yPos += 10;
    doc.text(`Inventory Value: TZS ${data.data.inventoryValue.toLocaleString()}`, 20, yPos);

    return doc.output('blob');
  },
};