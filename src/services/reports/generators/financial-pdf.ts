import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { addCompanyHeader, getDefaultTableStyles, formatCurrencyPDF, addGeneratedDate } from "../pdf-utils";
import type {
  FinancialReport,
  ProfitAndLossReport,
  ExpenseBreakdownReport,
  CustomerSalesReport,
  IngredientPurchaseTrendReport
} from "@/types/reports";

// Financial Report PDF
export const generateFinancialPDF = (
  data: FinancialReport,
  startDate?: string,
  endDate?: string,
  settings?: any
): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(
    doc,
    "Financial Report",
    startDate,
    endDate,
    settings
  );

  // Add some spacing before financial summary
  yPos += 10;

  // Financial summary - positioned bottom right
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  // Right-align the financial summary values
  const revenueText = `Revenue: ${formatCurrencyPDF(data.data.revenue)}`;
  const expensesText = `Expenses: ${formatCurrencyPDF(data.data.expenses)}`;
  const profitText = `Profit: ${formatCurrencyPDF(data.data.profit)}`;
  const outstandingCreditsText = `Outstanding Credits: ${formatCurrencyPDF(data.data.outstandingCredits)}`;
  const inventoryValueText = `Inventory Value: ${formatCurrencyPDF(data.data.inventoryValue)}`;

  const revenueWidth = doc.getTextWidth(revenueText);
  const expensesWidth = doc.getTextWidth(expensesText);
  const profitWidth = doc.getTextWidth(profitText);
  const outstandingCreditsWidth = doc.getTextWidth(outstandingCreditsText);
  const inventoryValueWidth = doc.getTextWidth(inventoryValueText);

  doc.text(revenueText, pageWidth - revenueWidth - 20, yPos);
  yPos += 10;
  doc.text(expensesText, pageWidth - expensesWidth - 20, yPos);
  yPos += 10;
  doc.text(profitText, pageWidth - profitWidth - 20, yPos);
  yPos += 10;
  doc.text(outstandingCreditsText, pageWidth - outstandingCreditsWidth - 20, yPos);
  yPos += 10;
  doc.text(inventoryValueText, pageWidth - inventoryValueWidth - 20, yPos);

  // Add generated date at bottom
  addGeneratedDate(doc, yPos + 20);

  return doc.output("blob");
};

// Profit and Loss Report PDF
export const generateProfitAndLossPDF = (
  data: ProfitAndLossReport,
  startDate?: string,
  endDate?: string,
  settings?: any
): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(
    doc,
    "Profit and Loss Statement",
    startDate,
    endDate,
    settings
  );

  // Add some spacing
  yPos += 10;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Profit and Loss Statement", 20, yPos);
  yPos += 15;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  // Revenue
  doc.text(`Revenue: ${formatCurrencyPDF(data.data.revenue)}`, 20, yPos);
  yPos += 10;

  // Cost of Goods Sold
  doc.text(`Cost of Goods Sold: ${formatCurrencyPDF(data.data.cogs)}`, 20, yPos);
  yPos += 10;

  // Gross Profit Section
  doc.setFont("helvetica", "bold");
  doc.text(`Gross Profit: ${formatCurrencyPDF(data.data.grossProfit.result)}`, 20, yPos);
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`(Revenue: ${formatCurrencyPDF(data.data.grossProfit.parameters.totalSales)} - COGS: ${formatCurrencyPDF(data.data.grossProfit.parameters.costOfGoodsSold)})`, 30, yPos);
  yPos += 15;

  // Operating Expenses
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Operating Expenses: ${formatCurrencyPDF(data.data.operatingExpenses)}`, 20, yPos);
  yPos += 15;

  // Net Profit Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`Net Profit: ${formatCurrencyPDF(data.data.netProfit.result)}`, 20, yPos);
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`(Gross Profit: ${formatCurrencyPDF(data.data.netProfit.parameters.grossProfit)} - Operating Expenses: ${formatCurrencyPDF(data.data.netProfit.parameters.operatingExpenses)})`, 30, yPos);

  return doc.output("blob");
};

// Gross Profit Report PDF
export const generateGrossProfitPDF = (
  data: ProfitAndLossReport,
  startDate?: string,
  endDate?: string,
  settings?: any
): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(
    doc,
    "Gross Profit Report",
    startDate,
    endDate,
    settings
  );

  // Add some spacing
  yPos += 10;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Gross Profit Analysis", 20, yPos);
  yPos += 20;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  // Revenue section
  doc.setFont("helvetica", "bold");
  doc.text("Revenue", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(`Value: ${formatCurrencyPDF(data.data.revenue)}`, 40, yPos);
  yPos += 12;

  // Separator line
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 180, yPos);
  yPos += 8;

  // Cost of Production section
  doc.setFont("helvetica", "bold");
  doc.text("Cost of Production", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(`Value: ${formatCurrencyPDF(data.data.cogs)}`, 40, yPos);
  yPos += 12;

  // Separator line
  doc.line(20, yPos, 180, yPos);
  yPos += 8;

  // Gross Profit (highlighted)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`Gross Profit: ${formatCurrencyPDF(data.data.grossProfit.result)}`, 20, yPos);
  yPos += 12;

  // Calculation details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Calculation: Revenue (${formatCurrencyPDF(data.data.grossProfit.parameters.totalSales)}) - Cost of Production (${formatCurrencyPDF(data.data.grossProfit.parameters.costOfGoodsSold)})`, 20, yPos);
  yPos += 15;

  // Gross Profit Margin
  const margin = data.data.revenue > 0 ? ((data.data.grossProfit.result / data.data.revenue) * 100) : 0;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Gross Profit Margin: ${margin.toFixed(2)}%`, 20, yPos);

  return doc.output("blob");
};

// Net Profit Report PDF
export const generateNetProfitPDF = (
  data: ProfitAndLossReport,
  startDate?: string,
  endDate?: string,
  settings?: any
): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(
    doc,
    "Net Profit Report",
    startDate,
    endDate,
    settings
  );

  // Add some spacing
  yPos += 10;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Net Profit Analysis", 20, yPos);
  yPos += 20;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  // Gross Profit section
  doc.setFont("helvetica", "bold");
  doc.text("Gross Profit", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(`Value: ${formatCurrencyPDF(data.data.grossProfit.result)}`, 40, yPos);
  yPos += 12;

  // Separator line
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 180, yPos);
  yPos += 8;

  // Operating Expenses section
  doc.setFont("helvetica", "bold");
  doc.text("Operating Expenses", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(`Value: ${formatCurrencyPDF(data.data.operatingExpenses)}`, 40, yPos);
  yPos += 12;

  // Separator line
  doc.line(20, yPos, 180, yPos);
  yPos += 8;

  // Net Profit (highlighted)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`Net Profit: ${formatCurrencyPDF(data.data.netProfit.result)}`, 20, yPos);
  yPos += 12;

  // Calculation details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Calculation: Gross Profit (${formatCurrencyPDF(data.data.netProfit.parameters.grossProfit)}) - Operating Expenses (${formatCurrencyPDF(data.data.netProfit.parameters.operatingExpenses)})`, 20, yPos);
  yPos += 15;

  // Net Profit Margin
  const margin = data.data.revenue > 0 ? ((data.data.netProfit.result / data.data.revenue) * 100) : 0;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Net Profit Margin: ${margin.toFixed(2)}%`, 20, yPos);

  return doc.output("blob");
};

// Expense Breakdown Report PDF
export const generateExpenseBreakdownPDF = (
  data: ExpenseBreakdownReport,
  startDate?: string,
  endDate?: string,
  settings?: any
): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(
    doc,
    "Expense Category Breakdown",
    startDate,
    endDate,
    settings
  );

  // Expense breakdown table
  const tableData = Object.entries(data.data.breakdown).map(([category, amount]) => [
    category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    formatCurrencyPDF(amount),
  ]);

  autoTable(doc, {
    head: [["Category", "Amount"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
  });

  // Add total - positioned bottom right of table
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Position total at bottom right of table area
  let totalY = finalY + 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  // Right-align the total
  const totalExpensesText = `Total Expenses: ${formatCurrencyPDF(data.data.totalExpenses)}`;
  const totalExpensesWidth = doc.getTextWidth(totalExpensesText);

  doc.text(totalExpensesText, pageWidth - totalExpensesWidth - 20, totalY);

  // Add generated date at bottom
  addGeneratedDate(doc, totalY + 20);

  return doc.output("blob");
};

// Customer Sales Report PDF
export const generateCustomerSalesPDF = (
  data: CustomerSalesReport,
  startDate?: string,
  endDate?: string,
  settings?: any
): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(
    doc,
    "Customer Sales Report",
    startDate,
    endDate,
    settings
  );

  // Customer sales table
  const tableData = data.data.map((customer) => [
    customer.id.toString(),
    customer.name,
    customer.email,
    customer.totalSales.toString(),
    formatCurrencyPDF(customer.totalSpent),
    formatCurrencyPDF(customer.avgSpending),
  ]);

  autoTable(doc, {
    head: [
      ["ID", "Name", "Email", "Total Sales", "Total Spent", "Avg Spending"],
    ],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
  });

  return doc.output("blob");
};

// Ingredient Purchase Trend Report PDF
export const generateIngredientPurchaseTrendPDF = (
  data: IngredientPurchaseTrendReport,
  startDate?: string,
  endDate?: string,
  settings?: any
): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(
    doc,
    "Ingredient Purchase Trend Report",
    startDate,
    endDate,
    settings
  );

  // Ingredient purchase trend table
  const tableData = data.data.map((item) => [
    item.item,
    item.quantity.toString(),
    format(item.date, "dd-MM-yyyy"),
  ]);

  autoTable(doc, {
    head: [["Item", "Quantity", "Date"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
  });

  return doc.output("blob");
};