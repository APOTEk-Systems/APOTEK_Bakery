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

    console.log("📋 Sales table data prepared:", tableData.length, "rows");

    autoTable(doc, {
      head: [["S/N", "Receipt #", "Date", "Customer", "Sold By", "Total"]],
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
      },
    });

    // Summary (after table) - positioned bottom right of table
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Position summary at bottom right of table area
    let summaryY = finalY + 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    // Right-align the summary values
    const totalSalesText = `Total Sales: ${formatCurrencyPDF(data.data.totalSales)}`;
    const creditOutstandingText = `Credit Outstanding: ${formatCurrencyPDF(data.data.creditOutstanding)}`;

    const totalSalesWidth = doc.getTextWidth(totalSalesText);
    const creditOutstandingWidth = doc.getTextWidth(creditOutstandingText);

    doc.text(totalSalesText, pageWidth - totalSalesWidth - 20, summaryY);
    summaryY += 8;
    doc.text(creditOutstandingText, pageWidth - creditOutstandingWidth - 20, summaryY);

    // Add generated date at bottom
    addGeneratedDate(doc, summaryY + 20);

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

    console.log("📋 Cash sales table data prepared:", tableData.length, "rows");

    autoTable(doc, {
      head: [["S/N", "Receipt #", "Date", "Customer", "Sold By", "Total"]],
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
      },
    });

    // Summary (after table) - positioned bottom right of table
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Position summary at bottom right of table area
    let summaryY = finalY + 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    // Right-align the summary value
    const totalCashSalesText = `Total Cash Sales: ${formatCurrencyPDF(data.data.totalSales)}`;
    const totalCashSalesWidth = doc.getTextWidth(totalCashSalesText);

    doc.text(totalCashSalesText, pageWidth - totalCashSalesWidth - 20, summaryY);

    // Add generated date at bottom
    addGeneratedDate(doc, summaryY + 20);

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
      sale.status,
    ]);

    console.log("📋 Credit sales table data prepared:", tableData.length, "rows");

    autoTable(doc, {
      head: [["S/N", "Receipt #", "Date", "Customer", "Sold By", "Total", "Status"]],
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
      },
    });

    // Summary (after table) - positioned bottom right of table
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Position summary at bottom right of table area
    let summaryY = finalY + 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    // Right-align the summary values
    const totalCreditSalesText = `Total Credit Sales: ${formatCurrencyPDF(data.data.totalSales)}`;
    const creditOutstandingText = `Credit Outstanding: ${formatCurrencyPDF(data.data.creditOutstanding)}`;

    const totalCreditSalesWidth = doc.getTextWidth(totalCreditSalesText);
    const creditOutstandingWidth = doc.getTextWidth(creditOutstandingText);

    doc.text(totalCreditSalesText, pageWidth - totalCreditSalesWidth - 20, summaryY);
    summaryY += 8;
    doc.text(creditOutstandingText, pageWidth - creditOutstandingWidth - 20, summaryY);

    // Add generated date at bottom
    addGeneratedDate(doc, summaryY + 20);

    const blob = doc.output("blob");
    console.log("✅ Credit sales PDF blob created, size:", blob.size, "bytes");
    return blob;
  } catch (error) {
    console.error("❌ Error generating credit sales PDF:", error);
    throw error;
  }
};