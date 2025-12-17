import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import {
  addCompanyHeader,
  getDefaultTableStyles,
  formatCurrencyPDF,
  addPageNumbers,
} from "../pdf-utils";
import type {
  ProductionReport,
  FinishedGoodsSummaryReport,
  IngredientUsageReport,
} from "@/types/reports";

// Production Report PDF
export const generateProductionPDF = (
  data: ProductionReport,
  startDate?: string,
  endDate?: string,
  settings?: any
): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(
    doc,
    "Production Detailed Report",
    startDate,
    endDate,
    settings
  );

  // Production table with new column structure
  const tableData = data.data.production.map((prod, index) => [
    (index + 1).toString(), // #
    format(prod.date || prod.createdAt || new Date(), "dd-MM-yyyy"), // Date
    (prod as any).product?.name || prod.product || "Unknown Product", // Product Name
    prod.quantityProduced?.toLocaleString(), // Quantity
    formatCurrencyPDF(prod.cost || 0), // Cost
    (prod as any).producedBy?.name || (prod as any).producedBy || "Unknown", // Produced By
  ]);

  // Calculate totals
  const totalProduced = data.data.production.reduce(
    (sum, prod) => sum + (prod.quantityProduced || 0),
    0
  );
  const totalCost = data.data.production.reduce(
    (sum, prod) => sum + (prod.cost || 0),
    0
  );

  // Generate main table without totals
  autoTable(doc, {
    head: [["#", "Date", "Product", "Quantity", "Cost", "Produced By"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
    columnStyles: {
      3: { halign: "center" }, // Center Quantity column
      5: { halign: "right" }, // Right-align Produced By column
    },
    headStyles: {
      ...getDefaultTableStyles().headStyles,
      halign: "left", // Keep other headers left-aligned
    },
    didParseCell: function (data: any) {
      // Center Quantity header (column 3)
      if (data.section === "head" && data.column.index === 3) {
        data.cell.styles.halign = "center";
      }
      // Right-align Produced By header (column 5)
      if (data.section === "head" && data.column.index === 5) {
        data.cell.styles.halign = "right";
      }
    },
  });

  // Get the final Y position after the main table
  const finalY = (doc as any).lastAutoTable.finalY;

  // Add totals in a separate table to prevent page breaks within totals
  const totalsTableData = [
    ["", "", "", "", "Total Produced:", `${totalProduced.toLocaleString()} units`],
    ["", "", "", "", "Total Cost:", formatCurrencyPDF(totalCost)]
  ];

  autoTable(doc, {
    head: [],
    body: totalsTableData,
    startY: finalY + 10, // Add some space after the main table
    ...getDefaultTableStyles(),
    columnStyles: {
      4: { halign: 'left', cellWidth:30  }, // Right-align values
      5: { halign: 'right', cellWidth:30 }, // Right-align values
    },
    didParseCell: function(data: any) {
      // Style totals rows
      if (data.section === 'body') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [255, 255, 255]; // White background
      }
    },
  });

  // Add generated date at bottom
  const finalYAfterTotals = (doc as any).lastAutoTable.finalY || yPos + 50;
  addPageNumbers(doc);

  return doc.output("blob");
};

// Finished Goods Summary Report PDF
export const generateFinishedGoodsSummaryPDF = (
  data: FinishedGoodsSummaryReport,
  startDate?: string,
  endDate?: string,
  settings?: any
): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(
    doc,
    "Finished Goods Summary Report",
    startDate,
    endDate,
    settings
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
    ...getDefaultTableStyles(),
  });

  // Add generated date at bottom
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  addPageNumbers(doc);

  return doc.output("blob");
};

// Ingredient Usage Report PDF
export const generateIngredientUsagePDF = (
  data: IngredientUsageReport,
  startDate?: string,
  endDate?: string,
  settings?: any
): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(
    doc,
    "Ingredients Usage Detailed Report",
    startDate,
    endDate,
    settings
  );

  // Ingredient usage table
  const tableData = data.data.map((item, index) => {
    let displayAmount = item.amount;

    displayAmount = item.amount; // fromBaseUnits would be applied here if needed

    return [
      (index + 1).toString(),
      item.item,
      displayAmount,
      item.unit,
      format(new Date(item.date), "dd-MM-yyyy"),
    ];
  });

  autoTable(doc, {
    head: [["#", "Item", "Quantity", "Unit", "Date"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
    columnStyles: {
      0: { cellWidth: 15 }, // S/N column
      1: { cellWidth: 60 }, // Right-align Item column
      2: { cellWidth: 50 }, // Right-align Quantity column
      3: { cellWidth: 40 }, // Right-align Quantity column
      4: { cellWidth: 20 }, // Right-align Date column
    },
  });

  // Add generated date at bottom
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  addPageNumbers(doc);

  return doc.output("blob");
};
