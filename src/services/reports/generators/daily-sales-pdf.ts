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
    "Daily Profit Report",
    startDate,
    endDate,
    settings
  );

  // Build table rows from daily sales data (product-level format with expenses)
  const dataRows = (data.productData || []).map((item, idx) => [
    (idx + 1).toString(),
    format(new Date(item.Date), "dd-MM-yyyy"),
    item.Product,
    item['Qty Sold'].toString(),
    formatCurrencyPDF(item.Sales ?? 0),
    formatCurrencyPDF(item.Cost ?? 0),
    formatCurrencyPDF(item.Expense ?? 0),
    formatCurrencyPDF(item.Profit ?? 0),
  ]);

  // Add the data table first
  autoTable(doc, {
    head: [["#", "Date", "Product", "Qty Sold", "Sales", "Cost", "Expense", "Profit"]],
    body: dataRows,
    startY: yPos,
    margin: { left: 20, right: 20 },
    ...getDefaultTableStyles(),
    columnStyles: {
      0: { cellWidth: 15 },
      1: { halign: "center", cellWidth: 22 },
      2: { halign: "left", cellWidth: 35 },
      3: { halign: "center", cellWidth: 18 },
      4: { halign: "right", cellWidth: 22 },
      5: { halign: "right", cellWidth: 22 },
      6: { halign: "right", cellWidth: 22 },
      7: { halign: "right", cellWidth: 22 },
    },
    headStyles: {
      ...getDefaultTableStyles().headStyles,
      halign: "left",
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell: function (dataItem: any) {
      if (
        dataItem.section === "head" &&
        (dataItem.column.index === 4 ||
         dataItem.column.index === 5 ||
         dataItem.column.index === 6 ||
         dataItem.column.index === 7)
      ) {
        dataItem.cell.styles.halign = "right";
      }
      if (dataItem.section === "head" && dataItem.column.index === 1) {
        dataItem.cell.styles.halign = "center";
      }
      if (dataItem.section === "head" && dataItem.column.index === 3) {
        dataItem.cell.styles.halign = "center";
      }
    },
  });

  // Calculate totals after the table
  const totals = (data.productData || []).reduce(
    (acc, item) => {
      acc.totalSales += item.Sales ?? 0;
      acc.totalCost += item.Cost ?? 0;
      acc.totalExpense += item.Expense ?? 0;
      acc.profit += item.Profit ?? 0;
      return acc;
    },
    { totalSales: 0, totalCost: 0, totalExpense: 0, profit: 0 }
  );

  // Add totals section outside the table (below the table)
  if (data.productData && data.productData.length > 0) {
    // Get the final Y position after the main table
    const finalY = (doc as any).lastAutoTable.finalY;

    // Add totals in a separate table to prevent page breaks within totals
    const totalsTableData = [
      ["", "", "", "", "", "", "Total Sales:", formatCurrencyPDF(totals.totalSales)],
      ["", "", "", "", "", "", "Total Cost:", formatCurrencyPDF(totals.totalCost)],
      ["", "", "", "", "", "", "Total Expense:", formatCurrencyPDF(totals.totalExpense)],
      ["", "", "", "", "", "", "Profit:", formatCurrencyPDF(totals.profit)]
    ];

    autoTable(doc, {
      head: [],
      body: totalsTableData,
      startY: finalY + 10, // Add some space after the main table
      ...getDefaultTableStyles(),
      columnStyles: {
        6: { halign: 'left', cellWidth: 30 }, // Left-align labels
        7: { halign: 'right', cellWidth: 50 }, // Right-align values
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