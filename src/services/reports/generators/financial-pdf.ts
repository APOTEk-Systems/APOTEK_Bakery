import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { addCompanyHeader, getDefaultTableStyles, formatCurrencyPDF, addPageNumbers } from "../pdf-utils";
import type {
  FinancialReport,
  ProfitAndLossReport,
  ExpenseBreakdownReport,
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

  // Financial summary table
  const tableData = [
    ["Revenue:", formatCurrencyPDF(data.data.revenue)],
    ["Expenses:", formatCurrencyPDF(data.data.expenses)],
    ["Profit:", formatCurrencyPDF(data.data.profit)],
    ["Outstanding Credits:", formatCurrencyPDF(data.data.outstandingCredits)],
    ["Inventory Value:", formatCurrencyPDF(data.data.inventoryValue)],
  ];

  autoTable(doc, {
    head: [["Financial Summary", "Amount"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
    columnStyles: {
      1: { halign: 'right' }, // Right-align Amount column
    },
    headStyles: {
      ...getDefaultTableStyles().headStyles,
      halign: 'left' // Keep headers left-aligned
    },
    didParseCell: function(data: any) {
      // Style summary rows
      if (data.section === 'body') {
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // Add page numbers at bottom
  addPageNumbers(doc);

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

  // Profit and Loss table
  const tableData = [
    ["Revenue:", formatCurrencyPDF(data.data.revenue)],
    ["Cost of Goods Sold:", formatCurrencyPDF(data.data.cogs)],
    ["Gross Profit:", formatCurrencyPDF(data.data.grossProfit.result)],
    ["Operating Expenses:", formatCurrencyPDF(data.data.operatingExpenses)],
    ["Net Profit:", formatCurrencyPDF(data.data.netProfit.result)],
  ];

  autoTable(doc, {
    head: [["Profit and Loss Statement", "Amount"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
    columnStyles: {
      1: { halign: 'right' }, // Right-align Amount column
    },
    headStyles: {
      ...getDefaultTableStyles().headStyles,
      halign: 'left' // Keep headers left-aligned
    },
    didParseCell: function(data: any) {
      // Style key profit figures
      if (data.section === 'body' && (data.row.index === 2 || data.row.index === 4)) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // Add page numbers at bottom
  addPageNumbers(doc);

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

  // Gross Profit Analysis table
  const tableData = [
    ["Revenue:", formatCurrencyPDF(data.data.revenue)],
    ["Cost of Production:", formatCurrencyPDF(data.data.cogs)],
    ["Gross Profit:", formatCurrencyPDF(data.data.grossProfit.result)],
  ];

  // Calculate margin
  const margin = data.data.revenue > 0 ? ((data.data.grossProfit.result / data.data.revenue) * 100) : 0;
  tableData.push(["Gross Profit Margin:", `${margin.toFixed(2)}%`]);

  autoTable(doc, {
    head: [["Gross Profit Analysis", "Amount"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
    columnStyles: {
      1: { halign: 'right' }, // Right-align Amount column
    },
    headStyles: {
      ...getDefaultTableStyles().headStyles,
      halign: 'left' // Keep headers left-aligned
    },
    didParseCell: function(data: any) {
      // Style key figures
      if (data.section === 'body' && data.row.index === 2) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // Add page numbers at bottom
  addPageNumbers(doc);

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

  // Net Profit Analysis table
  const tableData = [
    ["Gross Profit:", formatCurrencyPDF(data.data.grossProfit.result)],
    ["Operating Expenses:", formatCurrencyPDF(data.data.operatingExpenses)],
    ["Net Profit:", formatCurrencyPDF(data.data.netProfit.result)],
  ];

  // Calculate margin
  const margin = data.data.revenue > 0 ? ((data.data.netProfit.result / data.data.revenue) * 100) : 0;
  tableData.push(["Net Profit Margin:", `${margin.toFixed(2)}%`]);

  autoTable(doc, {
    head: [["Net Profit Analysis", "Amount"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
    columnStyles: {
      1: { halign: 'right' }, // Right-align Amount column
    },
    headStyles: {
      ...getDefaultTableStyles().headStyles,
      halign: 'left' // Keep other headers left-aligned
    },
    didParseCell: function(data: any) {
      // Right-align Amount header (column index 1)
      if (data.section === 'head' && data.column.index === 1) {
        data.cell.styles.halign = 'right';
      }
      // Style key figures
      if (data.section === 'body' && data.row.index === 2) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // Add page numbers at bottom
  addPageNumbers(doc);

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

  // Add total as table row
  tableData.push([
    "Total Expenses:",
    formatCurrencyPDF(data.data.totalExpenses)
  ]);

  autoTable(doc, {
    head: [["Category", "Amount"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
    columnStyles: {
      1: { halign: 'right' }, // Right-align Amount column
    },
    headStyles: {
      ...getDefaultTableStyles().headStyles,
      halign: 'left' // Keep other headers left-aligned
    },
    didParseCell: function(data: any) {
      // Right-align Amount header
      if (data.section === 'head' && data.column.index === 1) {
        data.cell.styles.halign = 'right';
      }
      // Style total row
      if (data.section === 'body' && data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // Add page numbers at bottom
  addPageNumbers(doc);

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
    format(expense.date, "dd-MM-yyyy"), // Format date
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
      1: { cellWidth: 20 }, // Reduce Date column width
      2: { cellWidth: 25 }, // Reduce Category column width
      3: { halign: 'right', cellWidth:40 }, // Right-align Amount column
      4: { cellWidth: 35 }, // Reduce Payment Method column width
      5: { cellWidth: 35 }, // Increase Updated By column width
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
      if (data.section === 'body' && data.cell.raw && typeof data.cell.raw === 'string' && data.cell.raw.includes('Total Paid:')) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // Add page numbers at bottom
  addPageNumbers(doc);

  return doc.output("blob");
};

// Outstanding Payments Report PDF
export const generateOutstandingPaymentsPDF = (
  data: any,
  startDate?: string,
  endDate?: string,
  settings?: any
): Blob => {
  const doc = new jsPDF();

  // Add company header
  let yPos = addCompanyHeader(
    doc,
    "Outstanding Payments Report",
    startDate,
    endDate,
    settings
  );


  if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
    console.log("No data to display");
    // Add empty state message
    autoTable(doc, {
      head: [["#", "Receipt #", "Date", "Customer", "Total", "Paid", "Balance"]],
      body: [["No outstanding payments found", "", "", "", "", "", ""]],
      startY: yPos,
      ...getDefaultTableStyles(),
    });

    addPageNumbers(doc);
    return doc.output("blob");
  }

  const tableData = data.data.map((sale: any, index: number) => [
    (index + 1).toString(),
    sale.id.toString(),
    format(sale.createdAt, "dd-MM-yyyy"),
    sale.customer?.name || "Walk-in Customer",
    formatCurrencyPDF(sale.total),
    formatCurrencyPDF((sale as any).paid || 0),
    formatCurrencyPDF(sale.outstandingBalance || 0),
  ]);
  console.log("Table data prepared:", tableData);

  // Calculate totals
  const totalOutstanding = data.totalOutstanding || data.data.reduce((sum: number, sale: any) => sum + (sale.outstandingBalance || 0), 0);
  const totalPaid = data.data.reduce((sum: number, sale: any) => sum + ((sale as any).paid || 0), 0);
  const totalTotal = data.data.reduce((sum: number, sale: any) => sum + sale.total, 0);

  // Add summary rows
  tableData.push([
    "",
    "",
    "",
    "",
    "",
    "Total:",
    formatCurrencyPDF(totalTotal),
  ]);
  tableData.push([
    "",
    "",
    "",
    "",
    "",
    "Paid:",
    formatCurrencyPDF(totalPaid),
  ]);
  tableData.push([
    "",
    "",
    "",
    "",
    "",
    "Balance:",
    formatCurrencyPDF(totalOutstanding)
  ]);

  autoTable(doc, {
    head: [["#", "Receipt #", "Date", "Customer", "Total", "Paid", "Balance"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
    columnStyles: {
      4: { halign: 'right' }, // Right-align Paid column for values
      5: { halign: 'right' }, // Right-align Outstanding column for values
      6: { halign: 'right' }, // Right-align Balance column for values
    },
    headStyles: {
      ...getDefaultTableStyles().headStyles,
      halign: 'left' // Keep other headers left-aligned
    },
    didParseCell: function(data: any) {
      // Right-align Total, Paid and Outstanding headers
      if (data.section === 'head' && (data.column.index === 4 || data.column.index === 5 || data.column.index === 6)) {
        data.cell.styles.halign = 'right';
      }
      // Style summary rows
      if (data.section === 'body' && data.row.index >= tableData.length -3) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [255, 255, 255]; // White background
      }
    },
  });

  // Add page numbers at bottom
  addPageNumbers(doc);

  return doc.output("blob");
};

