import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { addCompanyHeader, getDefaultTableStyles, formatCurrencyPDF, addGeneratedDate } from "../pdf-utils";
import type { PurchasesReport, SupplierWisePurchasesReport } from "@/types/reports";

// Purchases Report PDF
export const generatePurchasesPDF = (
  data: PurchasesReport,
  startDate?: string,
  endDate?: string,
  settings?: any
): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(
    doc,
    "All Purchases Report",
    startDate,
    endDate,
    settings
  );

  // Purchases table - need to get goods receiving data for the detailed view
  // For now, using basic purchase order data
  const tableData = data.data.purchaseOrders.map((order) => [
    order.supplier.name,
    "1", // Placeholder for Qty - would need to get from goods receiving
    "0", // Placeholder for Price - would need to get from goods receiving
    formatCurrencyPDF(order.totalCost),
    format(order.createdAt, "dd-MM-yyyy"), // Received Date
    "System", // Received By - placeholder
  ]);

  // Add summary row
  const totalPurchases = data.data.totalPurchases;
  tableData.push(
    ["", "", "", "", "", "Total Purchases:", formatCurrencyPDF(totalPurchases)]
  );

  autoTable(doc, {
    head: [["Item Name", "Qty", "Price", "Total", "Received Date", "Received By"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
    didParseCell: function(data: any) {
      // Style summary row
      if (data.section === 'body' && data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 240];
      }
    },
  });

  // Add generated date at bottom
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  addGeneratedDate(doc, finalY + 20);

  return doc.output("blob");
};

// Supplier-wise Purchases Report PDF
export const generateSupplierWisePurchasesPDF = (
  data: SupplierWisePurchasesReport,
  startDate?: string,
  endDate?: string,
  settings?: any
): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(
    doc,
    "Supplier-wise Purchases Report",
    startDate,
    endDate,
    settings
  );

  // Supplier purchases table
  const tableData = Object.entries(data.data.bySupplier).map(
    ([supplier, info]) => [
      supplier,
      formatCurrencyPDF(info.totalPurchases),
    ]
  );

  // Add summary row
  const totalAllPurchases = Object.values(data.data.bySupplier).reduce(
    (sum: number, info: any) => sum + info.totalPurchases, 0
  );
  tableData.push(
    ["Total Purchases:", formatCurrencyPDF(totalAllPurchases)]
  );

  autoTable(doc, {
    head: [["Supplier", "Total Purchases"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
    didParseCell: function(data: any) {
      // Style summary row
      if (data.section === 'body' && data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 240];
      }
    },
  });

  // Add generated date at bottom
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  addGeneratedDate(doc, finalY + 20);

  return doc.output("blob");
};

// Goods Received Report PDF
export const generateGoodsReceivedPDF = (data: any, startDate?: string, endDate?: string, settings?: any): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(
    doc,
    "Material Received Report",
    startDate,
    endDate,
    settings
  );

  // Goods received table with detailed item information
  const tableData: any[] = [];

  if (data && Array.isArray(data)) {
    data.forEach((receipt: any, index: number) => {
      tableData.push([
        (index + 1).toString(),
        receipt.supplier || "Unknown Supplier",
        receipt.itemName || "Unknown Item",
        receipt.quantity?.toString() || "0",
        format(receipt.receivedDate, "dd-MM-yyyy"),
        receipt.receivedBy || "Unknown",
      ]);
    });
  }

  autoTable(doc, {
    head: [["#", "Supplier", "Item Name", "Qty", "Received Date", "Received By"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
  });

  // Add generated date at bottom
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  addGeneratedDate(doc, finalY + 20);

  return doc.output("blob");
};

// Purchase Order Detailed Report PDF
export const generatePurchaseOrderDetailedPDF = (data: any, startDate?: string, endDate?: string, settings?: any): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(
    doc,
    "Purchase Order Detailed Report",
    startDate,
    endDate,
    settings
  );

  // Purchase order detailed table
  const tableData: any[] = [];

  if (data && Array.isArray(data)) {
    data.forEach((order: any, index: number) => {
      tableData.push([
        (index + 1).toString(),
        order.purchaseOrderId?.toString() || "",
        format(order.purchaseOrderDate ? new Date(order.purchaseOrderDate) : new Date(), "dd-MM-yyyy"),
        order.status || "",
        order.supplierName || "",
        order.itemName || "",
        order.quantity?.toLocaleString() || "",
        formatCurrencyPDF(order.price || 0),
        formatCurrencyPDF(order.total || 0),
      ]);
    });
  }

  // Add summary row
  const totalAmount = data && Array.isArray(data)
    ? data.reduce((sum: number, order: any) => sum + (order.total || 0), 0)
    : 0;

  tableData.push([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "Total:",
    ` ${formatCurrencyPDF(totalAmount)}`
  ]);

  autoTable(doc, {
    head: [["#", "Order #", "Date", "Status", "Supplier", "Item", "Qty", "Price", "Total"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
    columnStyles: {
      4: { cellWidth: 30 }, // Increase width of Supplier column (index 4)
      7: { halign: 'right' }, // Right-align Price column (index 7)
      8: { halign: 'right' }, // Right-align Total column (index 8)
    },
    headStyles: {
      ...getDefaultTableStyles().headStyles,
      halign: 'left' // Keep other headers left-aligned
    },
    didParseCell: function(data: any) {
      // Right-align Total header (column index 8)
      if (data.section === 'head' && data.column.index === 8) {
        data.cell.styles.halign = 'right';
      }
      // Style summary row
      if (data.section === 'body' && data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 240];
      }
    },
  });

  // Add generated date at bottom
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  addGeneratedDate(doc, finalY + 20);

  return doc.output("blob");
};