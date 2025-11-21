import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { addCompanyHeader, getDefaultTableStyles, formatCurrencyPDF, addPageNumbers } from "../pdf-utils";
import type { ProductionReport, FinishedGoodsSummaryReport, IngredientUsageReport } from "@/types/reports";

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
    "Daily Production Report",
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

  // Add summary rows similar to sales reports
  const totalProduced = data.data.production.reduce((sum, prod) => sum + (prod.quantityProduced || 0), 0);
  const totalCost = data.data.production.reduce((sum, prod) => sum + (prod.cost || 0), 0);

  tableData.push([
    "",
    "",
    "",
    "Total Produced:",
    `${totalProduced.toLocaleString()} units`,
    "",
  ]);
  tableData.push([
    "",
    "",
    "",
    "Total Cost:",
    formatCurrencyPDF(totalCost),
    "",
  ]);

  autoTable(doc, {
    head: [["#", "Date", "Product", "Quantity", "Cost", "Produced By"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
    columnStyles: {
      3: { halign: 'center' }, // Center Quantity column
      5: { halign: 'right' }, // Right-align Produced By column
    },
    headStyles: {
      ...getDefaultTableStyles().headStyles,
      halign: 'left' // Keep other headers left-aligned
    },
    didParseCell: function(data: any) {
      // Center Quantity header (column 3)
      if (data.section === 'head' && data.column.index === 3) {
        data.cell.styles.halign = 'center';
      }
      // Right-align Produced By header (column 5)
      if (data.section === 'head' && data.column.index === 5) {
        data.cell.styles.halign = 'right';
      }
      // Style summary rows (last two rows) - remove bg styles, keep white bg
      if (data.section === 'body' && (data.row.index === tableData.length - 2 || data.row.index === tableData.length - 1)) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [255, 255, 255]; // White background
      }
    },
  });

  // Add generated date at bottom
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
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
    "Ingredients Usage Report",
    startDate,
    endDate,
    settings
  );

  // Ingredient usage table
  const tableData = data.data.map((item) => {
    let displayAmount = item.amount;

    displayAmount = item.amount; // fromBaseUnits would be applied here if needed

    return [
      item.item,
      displayAmount,
      item.unit,
      format(new Date(item.date), "dd-MM-yyyy"),
    ];
  });

  autoTable(doc, {
    head: [["Item", "Quantity", "Unit", "Date"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
    columnStyles: {
      3: { cellWidth: 20 }, // Reduce Date column width
    },
  });

  // Add generated date at bottom
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  addPageNumbers(doc);

  return doc.output("blob");
};