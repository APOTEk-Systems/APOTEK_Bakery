import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { addCompanyHeader, getDefaultTableStyles, formatCurrencyPDF } from "../pdf-utils";
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

  // Summary (after table)
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  yPos = finalY + 15;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 20, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Produced: ${data.data.totalProduced} units`, 20, yPos);
  yPos += 8;
  doc.text(
    `Total Cost: ${formatCurrencyPDF(data.data.totalCost)}`,
    20,
    yPos
  );

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