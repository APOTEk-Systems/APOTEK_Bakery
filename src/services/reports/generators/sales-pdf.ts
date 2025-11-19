import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { addCompanyHeader, getDefaultTableStyles, formatCurrencyPDF, addPageNumbers } from "../pdf-utils";
import type { SalesReport } from "@/types/reports";

// Sales Report PDF
export const generateSalesPDF = (
  data: SalesReport,
  startDate?: string,
  endDate?: string,
  settings?: any
): Blob => {
  console.log("🎨 Generating sales PDF...", {
    salesCount: data.data.sales.length,
  });
  const doc = new jsPDF();

  try {
    // Add company header
    let yPos = addCompanyHeader(
      doc,
      "Sales Report",
      startDate,
      endDate,
      settings
    );

    // Sales table
    const tableData = data.data.sales.map((sale, index) => [
      (index + 1).toString(),
      sale.id.toString(),
      format(sale.createdAt, "dd-MM-yyyy"),
      sale.customer?.name || "Cash",
      sale.soldBy || "Unknown",
      formatCurrencyPDF(sale.total),
    ]);

    // Add summary row
    const totalSales = data.data.sales.reduce((sum, sale) => sum + sale.total, 0);
    tableData.push([
      "",
      "",
      "",
      "",
      "Total:",
      formatCurrencyPDF(totalSales)
    ]);

    console.log("Summary rows added:", tableData.slice(-2));

    console.log("📋 Sales table data prepared:", tableData.length, "rows");

    autoTable(doc, {
      head: [["#", "Receipt #", "Date", "Customer", "Sold By", "Total"]],
      body: tableData,
      startY: yPos,
      margin: { left: 20, right: 20 }, // Center the table horizontally
      ...getDefaultTableStyles(),
      columnStyles: {
        0: { cellWidth: 15 }, // #
        1: { cellWidth: 25 }, // Receipt #
        2: { cellWidth: 25 }, // Date
        3: { cellWidth: 45 }, // Customer
        4: { cellWidth: 35 }, // Sold By
        5: { halign: 'right', cellWidth: 25 }, // Right-align Total
      },
      headStyles: {
        ...getDefaultTableStyles().headStyles,
        halign: 'left' // Keep other headers left-aligned
      },
      didParseCell: function(data: any) {
        // Right-align Total header (column 5)
        if (data.section === 'head' && data.column.index === 5) {
          data.cell.styles.halign = 'right';
        }
        // Style summary row
        if (data.section === 'body' && data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    // Add generated date at bottom
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
    addPageNumbers(doc);

    const blob = doc.output("blob");
    console.log("✅ Sales PDF blob created, size:", blob.size, "bytes");
    return blob;
  } catch (error) {
    console.error("❌ Error generating sales PDF:", error);
    throw error;
  }
};

// Cash Sales Report PDF
export const generateCashSalesPDF = (
  data: SalesReport,
  startDate?: string,
  endDate?: string,
  settings?: any
): Blob => {
  console.log("🎨 Generating cash sales PDF...", {
    salesCount: data.data.sales.length,
  });
  const doc = new jsPDF();

  try {
    // Add company header
    let yPos = addCompanyHeader(
      doc,
      "Cash Sales Report",
      startDate,
      endDate,
      settings
    );

    // Cash sales table
    const tableData = data.data.sales.map((sale, index) => [
      (index + 1).toString(),
      sale.id.toString(),
      format(sale.createdAt, "dd-MM-yyyy"),
      sale.customer?.name || "Cash",
      sale.soldBy || "Unknown",
      formatCurrencyPDF(sale.total),
    ]);

    // Add summary row
    const totalSales = data.data.sales.reduce((sum, sale) => sum + sale.total, 0);
    tableData.push([
      "",
      "",
      "",
      "",
      "Total:",
      formatCurrencyPDF(totalSales)
    ]);

    console.log("Summary row added:", tableData.slice(-1));

    console.log("📋 Cash sales table data prepared:", tableData.length, "rows");

    autoTable(doc, {
      head: [["#", "Receipt #", "Date", "Customer", "Sold By", "Total"]],
      body: tableData,
      startY: yPos,
      margin: { left: 20, right: 20 }, // Center the table horizontally
      ...getDefaultTableStyles(),
      columnStyles: {
        0: { cellWidth: 15 }, // #
        1: { cellWidth: 25 }, // Receipt #
        2: { cellWidth: 25 }, // Date
        3: { cellWidth: 45 }, // Customer
        4: { cellWidth: 35 }, // Sold By
        5: { halign: 'right', cellWidth: 25 }, // Right-align Total
      },
      headStyles: {
        ...getDefaultTableStyles().headStyles,
        halign: 'left' // Keep other headers left-aligned
      },
      didParseCell: function(data: any) {
        // Right-align Total header (column 5)
        if (data.section === 'head' && data.column.index === 5) {
          data.cell.styles.halign = 'right';
        }
        // Style summary row
        if (data.section === 'body' && data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    // Add generated date at bottom
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
    addPageNumbers(doc);

    const blob = doc.output("blob");
    console.log("✅ Cash sales PDF blob created, size:", blob.size, "bytes");
    return blob;
  } catch (error) {
    console.error("❌ Error generating cash sales PDF:", error);
    throw error;
  }
};

// Credit Sales Report PDF
export const generateCreditSalesPDF = (
  data: SalesReport,
  startDate?: string,
  endDate?: string,
  settings?: any
): Blob => {
  console.log("🎨 Generating credit sales PDF...", {
    salesCount: data.data.sales.length,
  });
  const doc = new jsPDF();

  try {
    // Add company header
    let yPos = addCompanyHeader(
      doc,
      "Credit Sales Report",
      startDate,
      endDate,
      settings
    );

    // Credit sales table
    const tableData = data.data.sales.map((sale, index) => [
      (index + 1).toString(),
      sale.id.toString(),
      format(sale.createdAt, "dd-MM-yyyy"),
      sale.customer?.name || "Cash",
      sale.soldBy || "Unknown",
      formatCurrencyPDF(sale.total),
      formatCurrencyPDF((sale as any).paid || 0),
      formatCurrencyPDF((sale as any).outstandingBalance || 0),
    ]);

    // Add summary rows
    const totalSales = data.data.sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalPaid = data.data.sales.reduce((sum, sale) => sum + ((sale as any).paid || 0), 0);
    const totalBalance = data.data.sales.reduce((sum, sale) => sum + ((sale as any).outstandingBalance || 0), 0);

    tableData.push([
      "",
      "",
      "",
      "",
      "",
      "",
      "Total:",
      formatCurrencyPDF(totalSales)
    ]);
    tableData.push([
      "",
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
      "",
      "Balance:",
      formatCurrencyPDF(totalBalance)
    ]);

    autoTable(doc, {
      head: [["#", "Receipt #", "Date", "Customer", "Sold By", "Total", "Paid", "Balance"]],
      body: tableData,
      startY: yPos,
      margin: { left: 15, right: 15 }, // Center the table horizontally
      ...getDefaultTableStyles(),
      columnStyles: {
        0: { cellWidth: 12 }, // #
        1: { cellWidth: 22 }, // Receipt #
        2: { cellWidth: 22 }, // Date
        3: { cellWidth: 31 }, // Customer
        4: { cellWidth: 30 }, // Sold By
        5: { halign: 'right', cellWidth: 22 }, // Total
        6: { halign: 'right', cellWidth: 25 }, // Paid
        7: { halign: 'right', cellWidth: 22 }, // Balance
      },
      headStyles: {
        ...getDefaultTableStyles().headStyles,
        halign: 'left' // Keep other headers left-aligned
      },
      didParseCell: function(data: any) {
        // Right-align Total, Paid and Balance headers (columns 5, 6, 7)
        if (data.section === 'head' && (data.column.index === 5 || data.column.index === 6 || data.column.index === 7)) {
          data.cell.styles.halign = 'right';
        }
        // Style summary rows and right-align summary values
        if (data.section === 'body' && data.row.index >= tableData.length - 3) {
          data.cell.styles.fontStyle = 'bold';
          // Right-align the summary values (columns 5, 6, 7)
          if (data.column.index === 5 || data.column.index === 6 || data.column.index === 7) {
            data.cell.styles.halign = 'right';
          }
        }
        // Right-align Total, Paid, Balance columns in body rows
        if (data.section === 'body' && data.row.index < tableData.length - 3 && (data.column.index === 5 || data.column.index === 6 || data.column.index === 7)) {
          data.cell.styles.halign = 'right';
        }
      },
    });

    // Add generated date at bottom
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
    addPageNumbers(doc);

    const blob = doc.output("blob");
    console.log("✅ Credit sales PDF blob created, size:", blob.size, "bytes");
    return blob;
  } catch (error) {
    console.error("❌ Error generating credit sales PDF:", error);
    throw error;
  }
};