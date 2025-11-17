import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addCompanyHeader, getDefaultTableStyles, formatCurrencyPDF, addGeneratedDate } from "../pdf-utils";
import type { ProductsReport, ProductDetailsReport } from "@/types/reports";
import { format } from "date-fns";

// Products Report PDF
export const generateProductsPDF = (data: ProductsReport, settings?: any): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(doc, "Price List", undefined, undefined, settings, false);

  // Products table
  const tableData = data.data.map((product, index) => [
    (index + 1).toString(),
    product.name,
    formatCurrencyPDF(product.price),
  ]);

  autoTable(doc, {
    head: [["#", "Product Name", "Price"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
  });

  // Add generated date at bottom
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  addGeneratedDate(doc, finalY + 20);

  return doc.output("blob");
};

// Product Details Report PDF
export const generateProductDetailsPDF = (data: ProductDetailsReport, settings?: any): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(doc, "Product Details Report", undefined, undefined, settings, false);

  // Product details table
  const tableData = data.data.map((product, index) => [
    (index + 1).toString(),
    product.name,
    formatCurrencyPDF(product.price),
    formatCurrencyPDF(product.averageProductionCost),
    formatCurrencyPDF(product.profit),
  ]);

  autoTable(doc, {
    head: [["#", "Product Name", "Price", "Production Cost", "Profit"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
  });

  // Add generated date at bottom
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  addGeneratedDate(doc, finalY + 20);

  return doc.output("blob");
};

// Expenses Report PDF
export const generateExpensesPDF = (data: any, startDate?: string, endDate?: string, settings?: any): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(
    doc,
    "Expenses Report",
    startDate,
    endDate,
    settings
  );

  // Expenses table
  const expensesArray = Array.isArray(data) ? data : data.data || [];
  const tableData = expensesArray.map((expense: any, index: number) => [
    (index + 1).toString(),
    format(expense.date, "dd-MM-yyy"), // Format date
    expense.expenseCategory?.name || 'Unknown',
    formatCurrencyPDF(expense.amount),
    (expense.paymentMethod?.replace('_', ' ').toUpperCase() || 'CASH'),
   // expense.notes || '',
    //expense.createdBy?.name || 'Unknown',
    expense.updatedBy?.name || 'N/A',
  ]);

  // Calculate total
  const totalExpenses = expensesArray.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0;

  // Add summary row to table
  tableData.push([
    "",
    "",
    "",
    "",
    "Total Expenses:",
    formatCurrencyPDF(totalExpenses)
  ]);

  autoTable(doc, {
    head: [["#", "Date", "Category", "Amount", "Payment Method", "Updated By"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
    columnStyles: {
      2: { cellWidth: 25 }, // Reduce Category column width
      3: { halign: 'right' }, // Right-align Amount column
    },
    headStyles: {
      ...getDefaultTableStyles().headStyles,
      halign: 'left' // Keep other headers left-aligned
    },
    didParseCell: function(data: any) {
      // Right-align Amount header
      if (data.section === 'head' && data.column.index === 3) {
        data.cell.styles.halign = 'right';
      }
      // Style summary row
      if (data.section === 'body' && data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 240];
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


  return doc.output("blob");
};


