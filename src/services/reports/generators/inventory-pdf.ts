import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fromBaseUnits } from "@/lib/funcs";
import { addCompanyHeader, getDefaultTableStyles, formatCurrencyPDF } from "../pdf-utils";
import type { InventoryReport, InventoryAdjustmentsReport, LowStockReport, OutOfStockReport } from "@/types/reports";

// Inventory Report PDF
export const generateInventoryPDF = (data: InventoryReport, type?: 'raw_material' | 'supplies', settings?: any): Blob => {
  const doc = new jsPDF();

  // Add company header
  const reportTitle = type === 'raw_material' ? "Materials Current Stock Report" :
                     type === 'supplies' ? "Supplies Current Stock Report" :
                     "Inventory Report";
  let yPos = addCompanyHeader(doc, reportTitle, undefined, undefined, settings);

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
      formatCurrencyPDF(displayCost),
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
    ...getDefaultTableStyles(),
  });

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
    // Convert quantity to display units
    let displayQuantity = adjustment.amount;
    let displayUnit = adjustment.inventoryItem.unit;

    if (adjustment.inventoryItem.unit === "kg" || adjustment.inventoryItem.unit === "l") {
      if (Math.abs(displayQuantity) < 1000) {
        displayQuantity = displayQuantity / 1000;
        displayUnit = adjustment.inventoryItem.unit === "kg" ? "g" : "ml";
      }
    }

    const adjustmentType = adjustment.amount > 0 ? "Increased" : "Deducted";

    return [
      (index + 1).toString(),
      adjustment.inventoryItem.name,
      adjustment.createdAt.split('T')[0], // Format date
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
    ...getDefaultTableStyles(),
  });

  return doc.output("blob");
};

// Low Stock Report PDF
export const generateLowStockPDF = (data: LowStockReport, type?: 'raw_material' | 'supplies', settings?: any): Blob => {
  const doc = new jsPDF();

  // Add company header
  const reportTitle = type === 'raw_material' ? "Materials Below Min Level Report" :
                     type === 'supplies' ? "Supplies Below Min Level Report" :
                     "Stock Below Min Level Report";
  let yPos = addCompanyHeader(doc, reportTitle, undefined, undefined, settings);

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
    ...getDefaultTableStyles(),
  });

  return doc.output("blob");
};

// Out of Stock Report PDF
export const generateOutOfStockPDF = (data: OutOfStockReport, type?: 'raw_material' | 'supplies', settings?: any): Blob => {
  const doc = new jsPDF();

  // Add company header
  const reportTitle = type === 'raw_material' ? "Materials Out of Stock Report" :
                     type === 'supplies' ? "Supplies Out of Stock Report" :
                     "Out of Stock Report";
  let yPos = addCompanyHeader(doc, reportTitle, undefined, undefined, settings);

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
    ...getDefaultTableStyles(),
  });

  return doc.output("blob");
};