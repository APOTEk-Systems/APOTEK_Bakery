import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import {
  addCompanyHeader,
  getDefaultTableStyles,
  formatCurrencyPDF,
  addPageNumbers,
} from "../pdf-utils";
import type { DailySalesReport } from "@/types/reports";

// Daily Sales Report PDF
export const generateDailySalesPDF = (
  data: DailySalesReport,
  startDate?: string,
  endDate?: string,
  settings?: unknown
): Blob => {
  const doc = new jsPDF();

  // Add company header
  const yPos = addCompanyHeader(
    doc,
    "Daily Sales Report",
    startDate,
    endDate,
    settings
  );

  // Build table rows from daily sales data (excluding totals)
  const dataRows = (data.data || []).map((item, idx) => [
    (idx + 1).toString(),
    format(new Date(item.date), "dd-MM-yyyy"),
    formatCurrencyPDF(item.totalSales ?? 0),
    formatCurrencyPDF(item.productionCost ?? 0),
    formatCurrencyPDF(item.profit ?? 0),
  ]);

  // Add the data table first
  autoTable(doc, {
    head: [["#", "Date", "Total Sales", "Production Cost", "Profit"]],
    body: dataRows,
    startY: yPos,
    margin: { left: 20, right: 20 },
    ...getDefaultTableStyles(),
    columnStyles: {
      0: { cellWidth: 15 },
      1: { halign: "center", cellWidth: "auto" },
      2: { halign: "right", cellWidth: 30 },
      3: { halign: "right", cellWidth: 30 },
      4: { halign: "right", cellWidth: 30 },
    },
    headStyles: {
      ...getDefaultTableStyles().headStyles,
      halign: "left",
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell: function (dataItem: any) {
      if (
        dataItem.section === "head" &&
        (dataItem.column.index === 2 ||
         dataItem.column.index === 3 ||
         dataItem.column.index === 4)
      ) {
        dataItem.cell.styles.halign = "right";
      }
      if (dataItem.section === "head" && dataItem.column.index === 1) {
        dataItem.cell.styles.halign = "center";
      }
    },
  });

  // Calculate totals after the table
  const totals = (data.data || []).reduce(
    (acc, item) => {
      acc.totalSales += item.totalSales ?? 0;
      acc.productionCost += item.productionCost ?? 0;
      acc.profit += item.profit ?? 0;
      return acc;
    },
    { totalSales: 0, productionCost: 0, profit: 0 }
  );

  // Add totals section outside the table (below the table)
  if (data.data && data.data.length > 0) {
    // Get the final Y position after the main table
    const finalY = (doc as any).lastAutoTable.finalY;

    // Add totals in a separate table to prevent page breaks within totals
    const totalsTableData = [
      ["", "", "Total Sales:", formatCurrencyPDF(totals.totalSales)],
      ["", "", "Production Cost:", formatCurrencyPDF(totals.productionCost)],
      ["", "", "Profit:", formatCurrencyPDF(totals.profit)]
    ];

    autoTable(doc, {
      head: [],
      body: totalsTableData,
      startY: finalY + 10, // Add some space after the main table
      ...getDefaultTableStyles(),
      columnStyles: {
        2: { halign: 'left', cellWidth: 30 }, // Left-align labels
        3: { halign: 'right', cellWidth: 30 }, // Right-align values
      },
      didParseCell: function(data: any) {
        // Style totals rows
        if (data.section === 'body') {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [255, 255, 255]; // White background
        }
      },
    });
  }

  addPageNumbers(doc);

  return doc.output("blob");
};