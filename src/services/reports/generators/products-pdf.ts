import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addCompanyHeader, getDefaultTableStyles, formatCurrencyPDF } from "../pdf-utils";
import type { ProductsReport, ProductDetailsReport } from "@/types/reports";

// Products Report PDF
export const generateProductsPDF = (data: ProductsReport): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(doc, "Price List");

  // Products table
  const tableData = data.data.map((product, index) => [
    (index + 1).toString(),
    product.name,
    formatCurrencyPDF(product.price),
  ]);

  autoTable(doc, {
    head: [["S/N", "Product Name", "Price"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
  });

  return doc.output("blob");
};

// Product Details Report PDF
export const generateProductDetailsPDF = (data: ProductDetailsReport, settings?: any): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(doc, "Product Details Report", undefined, undefined, settings);

  // Product details table
  const tableData = data.data.map((product, index) => [
    (index + 1).toString(),
    product.name,
    formatCurrencyPDF(product.price),
    formatCurrencyPDF(product.averageProductionCost),
    formatCurrencyPDF(product.profit),
  ]);

  autoTable(doc, {
    head: [["S/N", "Product Name", "Price", "Average Production Cost", "Profit"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
  });

  return doc.output("blob");
};

// Expenses Report PDF
export const generateExpensesPDF = (data: any, startDate?: string, endDate?: string): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(
    doc,
    "Expenses Report",
    startDate,
    endDate
  );

  // Expenses table
  const tableData = data.data?.expenses?.map((expense: any, index: number) => [
    (index + 1).toString(),
    expense.date.split('T')[0], // Format date
    expense.expenseCategory?.name || 'Unknown',
    formatCurrencyPDF(expense.amount),
    (expense.paymentMethod?.replace('_', ' ').toUpperCase() || 'CASH'),
    expense.notes || '',
  ]) || [];

  autoTable(doc, {
    head: [["S/N", "Date", "Category", "Amount", "Payment Method", "Notes"]],
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
  const totalExpenses = data.data?.expenses?.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0;
  doc.text(`Total Expenses: ${formatCurrencyPDF(totalExpenses)}`, 20, yPos);

  return doc.output("blob");
};

// Outstanding Payments Report PDF
export const generateOutstandingPaymentsPDF = (data: any, startDate?: string, endDate?: string): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(
    doc,
    "Outstanding Payments Report",
    startDate,
    endDate
  );

  // Outstanding payments table
  const tableData = data.data?.sales?.map((sale: any, index: number) => [
    (index + 1).toString(),
    sale.id.toString(),
    sale.customer?.name || 'Walk-in Customer',
    formatCurrencyPDF(sale.total),
    formatCurrencyPDF(sale.paid || 0),
    formatCurrencyPDF(sale.outstandingBalance || 0),
    sale.creditDueDate ? sale.creditDueDate.split('T')[0] : 'N/A',
  ]) || [];

  autoTable(doc, {
    head: [["S/N", "Receipt #", "Customer", "Total Amount", "Paid", "Balance", "Due Date"]],
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
  const totalOutstanding = data.data?.sales?.reduce((sum: number, sale: any) => sum + (sale.outstandingBalance || 0), 0) || 0;
  doc.text(`Total Outstanding: ${formatCurrencyPDF(totalOutstanding)}`, 20, yPos);

  return doc.output("blob");
};