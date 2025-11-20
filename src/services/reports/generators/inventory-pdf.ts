import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { fromBaseUnits } from "@/lib/funcs";
import { addCompanyHeader, getDefaultTableStyles, formatCurrencyPDF, addPageNumbers } from "../pdf-utils";
import type { InventoryReport, InventoryAdjustmentsReport, LowStockReport, OutOfStockReport } from "@/types/reports";

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
    // Convert current quantity to displayed unit
    const displayQuantity =
      item.type === "raw_material"
        ? fromBaseUnits(item.currentQuantity, item.unit)
        : item.currentQuantity;

    // Convert cost per unit based on unit
    let displayCost = item.cost;
    if (item.unit === "kg" && item.type === "raw_material") {
      displayCost *= 1000; // cost per kg
    } else if (item.unit === "l" && item.type === "raw_material") {
      displayCost *= 1000; // cost per liter
    }

    return [
      (index + 1).toString(),
      item.name,
      item.unit,
      displayQuantity.toLocaleString(),
      item.minLevel.toLocaleString(),
      formatCurrencyPDF(displayCost),
    ];
  });

  autoTable(doc, {
    head: [
      ["#", "Name", "Unit", "Qty", "Min Level", "Cost"],
    ],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
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
    // Convert quantity to display units only for raw_material type
    const unit = adjustment.inventoryItem.unit || "g";
    const displayAmount = adjustment.inventoryItem.type === 'raw_material'
      ? fromBaseUnits(Math.abs(adjustment.amount), unit)
      : Math.abs(adjustment.amount);

    const adjustmentType = adjustment.amount > 0 ? "Increased" : "Deducted";

    return [
      (index + 1).toString(),
      adjustment.inventoryItem.name,
      format(new Date(adjustment.createdAt), "dd-MM-yyyy"), // Format date
      adjustmentType,
      `${adjustment.amount > 0 ? "+" : "-"}${displayAmount.toLocaleString()} ${unit}`,
      adjustment.reason || "No reason provided",
      adjustment.createdBy.name,
    ];
  });

  autoTable(doc, {
    head: [["#", "Item Name", "Date", "Type", "Quantity", "Reason", "Adj By"]],
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

  // Filter and convert items using same logic as InventoryListTab (conversions only for raw_material)
  const lowStockItems = data.data.inventoryItem.filter((item) => {
    let displayQuantity = item.currentQuantity;
    if (item.type === 'raw_material' && (item.unit.toLowerCase() === 'kg' || item.unit.toLowerCase() === 'l')) {
      displayQuantity = item.currentQuantity / 1000;
    }
    return displayQuantity <= item.minLevel;
  });

  // Low stock table
  const tableData = lowStockItems.map((item, index) => {
    // Apply same conversions as InventoryListTab (only for raw_material)
    let displayUnit = item.unit || 'N/A';
    let displayCurrentQty = item.currentQuantity;
    let displayMinQty = item.minLevel;

    if (item.type === 'raw_material') {
      if (item.unit.toLowerCase() === 'kg') {
        displayUnit = 'kg';
        displayCurrentQty = item.currentQuantity / 1000;
      } else if (item.unit.toLowerCase() === 'l') {
        displayUnit = 'l';
        displayCurrentQty = item.currentQuantity / 1000;
      }
    }

    return [
      (index + 1).toString(),
      item.name,
      `${displayCurrentQty.toLocaleString()} ${displayUnit}`,
      `${displayMinQty.toLocaleString()} ${displayUnit}`,
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

  // Filter and convert items using same logic as InventoryListTab (conversions only for raw_material)
  const outOfStockItems = data.data.inventoryItem.filter((item) => {
    let displayQuantity = item.currentQuantity;
    if (item.type === 'raw_material' && (item.unit.toLowerCase() === 'kg' || item.unit.toLowerCase() === 'l')) {
      displayQuantity = item.currentQuantity / 1000;
    }
    return displayQuantity <= 0;
  });

  // Out of stock table
  const tableData = outOfStockItems.map((item, index) => {
    // Apply same unit conversions as InventoryListTab (only for raw_material)
    let displayUnit = item.unit || 'N/A';
    if (item.type === 'raw_material') {
      if (item.unit.toLowerCase() === 'kg') {
        displayUnit = 'kg';
      } else if (item.unit.toLowerCase() === 'l') {
        displayUnit = 'l';
      }
    }

    return [
      (index + 1).toString(),
      item.name,
      displayUnit,
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