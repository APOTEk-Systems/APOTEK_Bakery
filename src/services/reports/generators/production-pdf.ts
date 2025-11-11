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
    "Daily Production Batches Report",
    startDate,
    endDate,
    settings
  );

  // Production table with new column structure
  const tableData = data.data.production.map((prod, index) => [
    (index + 1).toString(), // S/N
    format(prod.date || prod.createdAt || new Date(), "dd-MM-yyyy"), // Date
    prod.product, // Item Name
    prod.quantityProduced?.toString(), // Quantity
    "Ingredients list", // Ingredients Used
    formatCurrencyPDF(prod.cost || 0), // Cost
    "System", // Produced By
  ]);

  autoTable(doc, {
    head: [["S/N", "Date", "Item Name", "Quantity", "Ingredients Used", "Cost", "Produced By"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
  });

  // Summary (after table) - positioned bottom right of table
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Position summary at bottom right of table area
  let summaryY = finalY + 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  // Right-align the summary values
  const totalProducedText = `Total Produced: ${data.data.totalProduced} units`;
  const totalCostText = `Total Cost: ${formatCurrencyPDF(data.data.totalCost)}`;

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
  });

  return doc.output("blob");
};