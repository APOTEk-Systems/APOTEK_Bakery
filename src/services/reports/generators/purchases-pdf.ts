import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { addCompanyHeader, getDefaultTableStyles, formatCurrencyPDF } from "../pdf-utils";
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

  autoTable(doc, {
    head: [["Item Name", "Qty", "Price", "Total", "Received Date", "Received By"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
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
    `Total Purchases: ${formatCurrencyPDF(data.data.totalPurchases)}`,
    20,
    yPos
  );

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

  autoTable(doc, {
    head: [["Supplier", "Total Purchases"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
  });

  return doc.output("blob");
};

// Goods Received Report PDF
export const generateGoodsReceivedPDF = (data: any, startDate?: string, endDate?: string, settings?: any): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(
    doc,
    "Material Receiving Report",
    startDate,
    endDate,
    settings
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
      formatCurrencyPDF(receipt.total),
      format(receipt.receivedDate || receipt.createdAt, "dd-MM-yyyy"),
      receipt.createdByName || "System", // Received By
   //   receipt.updatedBy?.name || "N/A", // Updated By
    ]);
  });

  autoTable(doc, {
    head: [["S/N", "Supplier", "Item Name", "Qty", "Price", "Received Date", "Received By"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
  });

  return doc.output("blob");
};