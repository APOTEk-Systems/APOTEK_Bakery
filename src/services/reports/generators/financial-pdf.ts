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
  data: any,
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

  console.log("Generating Gross Profit PDF with data:", data);
  // Check if we have daily data - handle both data.dailyData and data.data.dailyData
  const dailyData = data?.data?.dailyData || data?.dailyData;
  if (dailyData && Array.isArray(dailyData)) {
    // Daily Gross Profit table
    console.log("Generating Gross Profit PDF with daily data:", dailyData);
    const tableData = dailyData.map((day: any, index: number) => [
      (index + 1).toString(), // S/N
      format(new Date(day.date), "dd-MM-yyyy"), // Date
      formatCurrencyPDF(Number(day.totalSales) || 0), // Total Sales with null check
      formatCurrencyPDF(Number(day.totalPurchases) || 0), // Total Purchases with null check
      formatCurrencyPDF(Number(day.grossProfit) || 0), // Gross Profit with null check
    ]);

    // Calculate totals with null checks
    const totalSales = dailyData.reduce((sum: number, day: any) => sum + (Number(day.totalSales) || 0), 0);
    const totalPurchases = dailyData.reduce((sum: number, day: any) => sum + (Number(day.totalPurchases) || 0), 0);
    const totalGrossProfit = dailyData.reduce((sum: number, day: any) => sum + (Number(day.grossProfit) || 0), 0);

    // Generate main table without totals
    autoTable(doc, {
      head: [["#", "Date", "Total Sales", "Total Purchases", "Gross Profit"]],
      body: tableData,
      startY: yPos,
      ...getDefaultTableStyles(),
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 }, // S/N column
        1: { halign: 'left', cellWidth: 30 },   // Date column
        2: { halign: 'right' },   // Total Sales column
        3: { halign: 'right' },   // Total Purchases column
        4: { halign: 'right' },  // Gross Profit column
      },
      headStyles: {
        ...getDefaultTableStyles().headStyles,
        halign: 'center' // Center align headers
      },
      didParseCell: function(data: any) {
        // Right-align Amount headers
        if (data.section === 'head' && (data.column.index === 2 || data.column.index === 3 || data.column.index === 4)) {
          data.cell.styles.halign = 'right';
        }
      },
    });

    // Get the final Y position after the main table
    const finalY = (doc as any).lastAutoTable.finalY;

    // Add totals in a separate table to prevent page breaks within totals
    const totalsTableData = [
      ['', '', 'Total Sales:', formatCurrencyPDF(totalSales)],
      ['', '', 'Total Purchases:', formatCurrencyPDF(totalPurchases)],
      ['', '', 'Gross Profit:', formatCurrencyPDF(totalGrossProfit)]
    ];

    autoTable(doc, {
      head: [],
      body: totalsTableData,
      startY: finalY + 10, // Add some space after the main table
      ...getDefaultTableStyles(),
      columnStyles: {
        2: { halign: 'left' }, // Left-align labels
        3: { halign: 'right' }, // Right-align values
      },
      didParseCell: function(data: any) {
        // Style totals rows
        if (data.section === 'body') {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [255, 255, 255]; // White background
        }
      },
    });
  } else {
    // Fallback to summary format if daily data is not available
    const tableData = [
      ["Revenue:", formatCurrencyPDF(data.data?.revenue || 0)],
      ["Cost of Production:", formatCurrencyPDF(data.data?.cogs || 0)],
      ["Gross Profit:", formatCurrencyPDF(data.data?.grossProfit?.result || 0)],
    ];

    // Calculate margin
    const revenue = data.data?.revenue || 0;
    const grossProfit = data.data?.grossProfit?.result || 0;
    const margin = revenue > 0 ? ((grossProfit / revenue) * 100) : 0;
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
  }

  // Add page numbers at bottom
  addPageNumbers(doc);

  return doc.output("blob");
};

// Net Profit Report PDF
export const generateNetProfitPDF = (
  data: any,
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

  console.log("Generating Net Profit PDF with data:", data);
  
  // Handle both new net-profit endpoint format and legacy format
  const netProfitData = data?.data || data;
  
  // Net Profit Analysis table using new endpoint structure
  const tableData = [
    ["Total Sales:", formatCurrencyPDF(Number(netProfitData.totalSales) || 0)],
    ["Total Purchases:", formatCurrencyPDF(Number(netProfitData.totalPurchases) || 0)],
    ["Total Expenses:", formatCurrencyPDF(Number(netProfitData.totalExpenses) || 0)],
    ["Net Profit:", formatCurrencyPDF(Number(netProfitData.netProfit) || 0)],
  ];

  // Calculate net profit margin
  const totalSales = Number(netProfitData.totalSales) || 0;
  const netProfit = Number(netProfitData.netProfit) || 0;
  const margin = totalSales > 0 ? ((netProfit / totalSales) * 100) : 0;
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
      if (data.section === 'body' && data.row.index === 3) {
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

  // Generate main table without totals
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
    },
  });

  // Get the final Y position after the main table
  const finalY = (doc as any).lastAutoTable.finalY;

  // Add totals in a separate table to prevent page breaks within totals
  const totalsTableData = [
    ["Total Expenses:", formatCurrencyPDF(data.data.totalExpenses)]
  ];

  autoTable(doc, {
    head: [],
    body: totalsTableData,
    startY: finalY + 10, // Add some space after the main table
    ...getDefaultTableStyles(),
    columnStyles: {
      0: { halign: 'left' }, // Left-align label
      1: { halign: 'right' }, // Right-align value
    },
    didParseCell: function(data: any) {
      // Style totals row
      if (data.section === 'body') {
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
    (index + 1).toString(), // S/N
    format(expense.date, "dd-MM-yyyy"), // Date
    (expense.paymentMethod?.replace('_', ' ').toUpperCase() || 'CASH'), // Payment Method
    expense.expenseCategory?.name || 'Unknown', // Category
    expense.notes || '', // Description
    expense.updatedBy?.name || 'N/A', // Updated By
    formatCurrencyPDF(expense.amount), // Amount
  ]);

  // Calculate total
  const totalExpenses = expensesArray.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0;

  // Add summary row to table
  tableData.push([
    "",
    "",
    "",
    "",
    "",
    "Total:",
    formatCurrencyPDF(totalExpenses)
  ]);

  autoTable(doc, {
    head: [["#", "Date", "Payment Method", "Category", "Notes", "Updated By", "Amount"]],
    body: tableData,
    startY: yPos,
    ...getDefaultTableStyles(),
    columnStyles: {
      0: { cellWidth: 10 }, // S/N column width
      6: { halign: 'right' }, // Right-align Amount column
    },
    headStyles: {
      ...getDefaultTableStyles().headStyles,
      halign: 'left' // Keep other headers left-aligned
    },
    didParseCell: function(data: any) {
      // Right-align Amount header
      if (data.section === 'head' && data.column.index === 6) {
        data.cell.styles.halign = 'right';
      }
      // Style summary row
      if (data.section === 'body' && data.row.index === tableData.length - 1) {
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

  // Generate main table without totals
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
    },
  });

  // Get the final Y position after the main table
  const finalY = (doc as any).lastAutoTable.finalY;

  // Add totals in a separate table to prevent page breaks within totals
  const totalsTableData = [
    ["", "", "", "", "", "Total:", formatCurrencyPDF(totalTotal)],
    ["", "", "", "", "", "Paid:", formatCurrencyPDF(totalPaid)],
    ["", "", "", "", "", "Balance:", formatCurrencyPDF(totalOutstanding)]
  ];

  autoTable(doc, {
    head: [],
    body: totalsTableData,
    startY: finalY + 10, // Add some space after the main table
    ...getDefaultTableStyles(),
    columnStyles: {
      5: { halign: 'left', cellWidth:20 }, // Left-align labels
      6: { halign: 'right', cellWidth:20 }, // Right-align values
    },
    didParseCell: function(data: any) {
      // Style totals rows
      if (data.section === 'body') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [255, 255, 255]; // White background
      }
    },
  });

  // Add page numbers at bottom
  addPageNumbers(doc);

  return doc.output("blob");
};

