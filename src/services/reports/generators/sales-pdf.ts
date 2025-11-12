import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { addCompanyHeader, getDefaultTableStyles, formatCurrencyPDF, addGeneratedDate } from "../pdf-utils";
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

    // Add summary rows
    const totalSales = data.data.totalSales;
    const creditOutstanding = data.data.creditOutstanding;
    tableData.push(
      ["", "", "", "", "Total Sales:", formatCurrencyPDF(totalSales), ""],
      ["", "", "", "", "Credit Outstanding:", formatCurrencyPDF(creditOutstanding), ""]
    );

    console.log("Summary rows added:", tableData.slice(-2));

    console.log("📋 Sales table data prepared:", tableData.length, "rows");

    autoTable(doc, {
      head: [["#", "Receipt #", "Date", "Customer", "Sold By", "Total"]],
      body: tableData,
      startY: yPos,
      ...getDefaultTableStyles(),
      columnStyles: {
        5: { halign: 'right' } // Right-align the Total column (index 5)
      },
      headStyles: {
        ...getDefaultTableStyles().headStyles,
        halign: 'left' // Keep other headers left-aligned
      },
      didParseCell: function(data: any) {
        // Right-align only the "Total" header (column index 5)
        if (data.section === 'head' && data.column.index === 5) {
          data.cell.styles.halign = 'right';
        }
        // Style summary rows
        if (data.section === 'body' && (data.row.index >= tableData.length - 2)) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 240, 240];
        }
      },
    });

    // Add generated date at bottom
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
    addGeneratedDate(doc, finalY + 20);

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
    const totalCashSales = data.data.totalSales;
    tableData.push(
      ["", "", "", "", "Total Cash Sales:", formatCurrencyPDF(totalCashSales), ""]
    );

    console.log("Summary row added:", tableData.slice(-1));

    console.log("📋 Cash sales table data prepared:", tableData.length, "rows");

    autoTable(doc, {
      head: [["#", "Receipt #", "Date", "Customer", "Sold By", "Total"]],
      body: tableData,
      startY: yPos,
      ...getDefaultTableStyles(),
      columnStyles: {
        5: { halign: 'right' } // Right-align the Total column (index 5)
      },
      headStyles: {
        ...getDefaultTableStyles().headStyles,
        halign: 'left' // Keep other headers left-aligned
      },
      didParseCell: function(data: any) {
        // Right-align only the "Total" header (column index 5)
        if (data.section === 'head' && data.column.index === 5) {
          data.cell.styles.halign = 'right';
        }
        // Style summary row
        if (data.section === 'body' && data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 240, 240];
        }
      },
    });

    // Add generated date at bottom
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
    addGeneratedDate(doc, finalY + 20);

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
    const totalCreditSales = data.data.totalSales;
    const totalPaid = data.data.sales.reduce((sum, sale) => sum + ((sale as any).paid || 0), 0);
    const totalBalance = data.data.sales.reduce((sum, sale) => sum + ((sale as any).outstandingBalance || 0), 0);

    tableData.push(
      ["", "", "", "", "","" ,"Total:", formatCurrencyPDF(totalCreditSales), ""],
      ["", "", "", "", "", "","Paid:", formatCurrencyPDF(totalPaid), ""],
      ["", "", "", "", "","" ,"Balance:", formatCurrencyPDF(totalBalance), ""]
    );

    console.log("📋 Credit sales table data prepared:", tableData.length, "rows");

    autoTable(doc, {
      head: [["#", "Receipt #", "Date", "Customer", "Sold By", "Total", "Paid", "Balance"]],
      body: tableData,
      startY: yPos,
      ...getDefaultTableStyles(),
      columnStyles: {
        5: { halign: 'right' }, // Right-align Total (index 5)
        6: { halign: 'right' }, // Right-align Paid (index 6)
        7: { halign: 'right' }, // Right-align Balance (index 7)
      },
      headStyles: {
        ...getDefaultTableStyles().headStyles,
        halign: 'left' // Keep other headers left-aligned
      },
      didParseCell: function(data: any) {
        // Right-align Total, Paid, and Balance headers (columns 5, 6, 7)
        if (data.section === 'head' && (data.column.index === 5 || data.column.index === 6 || data.column.index === 7)) {
          data.cell.styles.halign = 'right';
        }
        // Style summary rows
        if (data.section === 'body' && data.row.index >= tableData.length - 3) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 240, 240];
        }
      },
    });

    // Add generated date at bottom
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
    addGeneratedDate(doc, finalY + 20);

    const blob = doc.output("blob");
    console.log("✅ Credit sales PDF blob created, size:", blob.size, "bytes");
    return blob;
  } catch (error) {
    console.error("❌ Error generating credit sales PDF:", error);
    throw error;
  }
};