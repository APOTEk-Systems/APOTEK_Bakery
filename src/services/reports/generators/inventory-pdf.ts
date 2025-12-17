import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { addCompanyHeader, getDefaultTableStyles, formatCurrencyPDF, addPageNumbers } from "../pdf-utils";
import type { InventoryReport, InventoryAdjustmentsReport, LowStockReport, OutOfStockReport, ProductAdjustmentsReport } from "@/types/reports";

// Inventory Report PDF
export const generateInventoryPDF = (data: InventoryReport, type?: 'raw_material' | 'supplies', settings?: any): Blob => {
  const doc = new jsPDF();

  // Add company header
  const reportTitle = type === 'raw_material' ? "Materials Current Stock Report" :
                     type === 'supplies' ? "Supplies Current Stock Report" :
                     "Inventory Report";
  let yPos = addCompanyHeader(doc, reportTitle, undefined, undefined, settings, false);

  // Inventory table
  const tableData = data.data.inventoryItem.map((item, index) => {
    return [
      (index + 1).toString(),
      item.name,
      item.unit,
      item.currentQuantity.toLocaleString(),
      item.minLevel.toLocaleString(),
      formatCurrencyPDF(item.cost),
    ];
  });

  autoTable(doc, {
    head: [
      ["#", "Name", "Unit", "Qty", "Min Level", "Cost"],
    ],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
    columnStyles: {
      3: { halign: 'center' }, // Center Qty column
      4: { halign: 'center' }, // Center Min Level column
      5: { halign: 'right' }, // Right-align Cost column
    },
    headStyles: {
      ...getDefaultTableStyles().headStyles,
      halign: 'left' // Keep other headers left-aligned
    },
    didParseCell: function(data: any) {
      // Center Qty header (column 3)
      if (data.section === 'head' && data.column.index === 3) {
        data.cell.styles.halign = 'center';
      }
      // Center Min Level header (column 4)
      if (data.section === 'head' && data.column.index === 4) {
        data.cell.styles.halign = 'center';
      }
      // Right-align Cost header (column 5)
      if (data.section === 'head' && data.column.index === 5) {
        data.cell.styles.halign = 'right';
      }
    },
  });

  // Add generated date at bottom
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  addPageNumbers(doc);

  return doc.output("blob");
};

// Inventory Adjustments Report PDF
export const generateInventoryAdjustmentsPDF = (
  data: InventoryAdjustmentsReport,
  startDate?: string,
  endDate?: string,
  type?: 'raw_material' | 'supplies',
  settings?: any
): Blob => {
  const doc = new jsPDF();

  // Add company header
  const reportTitle = type === 'raw_material' ? "Materials Adjustments Report" :
                     type === 'supplies' ? "Supplies Adjustments Report" :
                     "Inventory Adjustments Report";
  let yPos = addCompanyHeader(
    doc,
    reportTitle,
    startDate,
    endDate,
    settings
  );

  // Inventory adjustments table
  const tableData = data.data.adjustments.map((adjustment, index) => {
    const adjustmentType = adjustment.amount > 0 ? "Increased" : "Deducted";

    return [
      (index + 1).toString(),
      adjustment.inventoryItem.name,
      format(new Date(adjustment.createdAt), "dd-MM-yyyy"), // Format date
      adjustmentType,
      `${adjustment.amount > 0 ? "+" : "-"}${Math.abs(adjustment.amount).toLocaleString()} ${adjustment.inventoryItem.unit}`,
      adjustment.reason || "No reason provided",
      adjustment.createdBy.name,
    ];
  });

  autoTable(doc, {
    head: [["#", "Item Name", "Date", "Type", "Quantity", "Reason", "Adjusted By"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
  });

  // Add generated date at bottom
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  addPageNumbers(doc);

  return doc.output("blob");
};

// Low Stock Report PDF
export const generateLowStockPDF = (data: LowStockReport, type?: 'raw_material' | 'supplies', settings?: any): Blob => {
  const doc = new jsPDF();

  // Add company header
  const reportTitle = type === 'raw_material' ? "Materials Below Min Level Report" :
                      type === 'supplies' ? "Supplies Below Min Level Report" :
                      "Stock Below Min Level Report";
  let yPos = addCompanyHeader(doc, reportTitle, undefined, undefined, settings, false);

  // Filter items using backend-converted quantities
  const lowStockItems = data.data.inventoryItem.filter((item) => {
    return item.currentQuantity <= item.minLevel;
  });

  // Low stock table
  const tableData = lowStockItems.map((item, index) => {
    return [
      (index + 1).toString(),
      item.name,
      `${item.currentQuantity.toLocaleString()} ${item.unit}`,
      `${item.minLevel.toLocaleString()} ${item.unit}`,
    ];
  });

  autoTable(doc, {
    head: [["#", "Item Name", "Available Qty", "Min Qty"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
  });

  // Add generated date at bottom
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  addPageNumbers(doc);

  return doc.output("blob");
};

// Out of Stock Report PDF
export const generateOutOfStockPDF = (data: OutOfStockReport, type?: 'raw_material' | 'supplies', settings?: any): Blob => {
  const doc = new jsPDF();

  // Add company header
  const reportTitle = type === 'raw_material' ? "Materials Out of Stock Report" :
                      type === 'supplies' ? "Supplies Out of Stock Report" :
                      "Out of Stock Report";
  let yPos = addCompanyHeader(doc, reportTitle, undefined, undefined, settings, false);

  // Filter items using backend-converted quantities
  const outOfStockItems = data.data.inventoryItem.filter((item) => {
    return item.currentQuantity <= 0;
  });

  // Out of stock table
  const tableData = outOfStockItems.map((item, index) => {
    return [
      (index + 1).toString(),
      item.name,
      item.unit,
    ];
  });

  autoTable(doc, {
    head: [["#", "Item Name", "Unit"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
  });

  // Add generated date at bottom
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  addPageNumbers(doc);

  return doc.output("blob");
};

// Product Adjustments Report PDF
export const generateProductAdjustmentsPDF = (
  data: ProductAdjustmentsReport,
  startDate?: string,
  endDate?: string,
  settings?: any
): Blob => {
  const doc = new jsPDF();

  // Add company header
  const reportTitle = "Product Adjustments Report";
  let yPos = addCompanyHeader(
    doc,
    reportTitle,
    startDate,
    endDate,
    settings
  );

  // Product adjustments table (similar to inventory adjustments but without type column)
  const tableData = data.adjustments.map((adjustment, index) => {
    const adjustmentType = adjustment.amount > 0 ? "Increased" : "Deducted";
    const displayAmount = Math.abs(adjustment.amount);

    return [
      (index + 1).toString(),
      adjustment.product?.name || "Unknown Product",
      format(new Date(adjustment.createdAt), "dd-MM-yyyy"),
      `${displayAmount.toLocaleString()}`,
      adjustment.reason || "No reason provided",
      adjustment.createdBy?.name || "Unknown",
    ];
  });

  autoTable(doc, {
    head: [["#", "Product Name", "Date", "Quantity", "Reason", "Adjusted By"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
  });

  // Add generated date at bottom
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  addPageNumbers(doc);

  return doc.output("blob");
};