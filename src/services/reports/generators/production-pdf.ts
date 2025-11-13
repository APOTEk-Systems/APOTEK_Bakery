import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { addCompanyHeader, getDefaultTableStyles, formatCurrencyPDF, addGeneratedDate } from "../pdf-utils";
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
  const tableData = data.map((prod, index) => [
    (index + 1).toString(), // #
    format(prod.date || prod.createdAt || new Date(), "dd-MM-yyyy"), // Date
    (prod as any).product?.name || prod.product || "Unknown Product", // Product Name
    prod.quantityProduced?.toLocaleString(), // Quantity
    formatCurrencyPDF(prod.cost || 0), // Cost
    (prod as any).producedBy?.name || (prod as any).producedBy || "Unknown", // Produced By
  ]);

  autoTable(doc, {
    head: [["#", "Date", "Product", "Quantity", "Cost", "Produced By"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
    columnStyles: {
      4: { halign: 'right' }, // Right-align Cost column
    },
    headStyles: {
      ...getDefaultTableStyles().headStyles,
      halign: 'left' // Keep other headers left-aligned
    },
    didParseCell: function(data: any) {
      // Right-align Cost header (column 4)
      if (data.section === 'head' && data.column.index === 4) {
        data.cell.styles.halign = 'right';
      }
    },
  });

  // Summary (after table) - positioned bottom right of table
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Position summary at bottom right of table area
  let summaryY = finalY + 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  const totalProduced = data.reduce((sum, prod) => sum + (prod.quantityProduced || 0), 0);
  const totalCost = data.reduce((sum, prod) => sum + (prod.cost || 0), 0);

  // Right-align the summary values
  const totalProducedText = `Total Produced: ${totalProduced.toLocaleString()} units`;
  const totalCostText = `Total Cost: ${formatCurrencyPDF(totalCost)}`;

  const totalProducedWidth = doc.getTextWidth(totalProducedText);
  const totalCostWidth = doc.getTextWidth(totalCostText);

  doc.text(totalProducedText, pageWidth - totalProducedWidth - 20, summaryY);
  summaryY += 8;
  doc.text(totalCostText, pageWidth - totalCostWidth - 20, summaryY);

  // Add generated date at bottom
  addGeneratedDate(doc, summaryY + 20);

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
    "Ingredient Usage Report",
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
    head: [["Item", "Amount", "Unit", "Date"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
    columnStyles: {
      3: { cellWidth: 20 }, // Reduce Date column width
    },
  });

  return doc.output("blob");
};