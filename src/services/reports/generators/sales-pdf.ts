import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { addCompanyHeader, getDefaultTableStyles, formatCurrencyPDF } from "../pdf-utils";
import type { SalesReport } from "@/types/reports";

// Sales Report PDF
export const generateSalesPDF = (
  data: SalesReport,
  startDate?: string,
  endDate?: string
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
      endDate
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
    doc.text(
      `Total Sales: ${formatCurrencyPDF(data.data.totalSales)}`,
      20,
      yPos
    );
    yPos += 8;
    doc.text(
      `Credit Outstanding: ${formatCurrencyPDF(data.data.creditOutstanding)}`,
      20,
      yPos
    );

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
  endDate?: string
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
      endDate
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
    doc.text(
      `Total Cash Sales: ${formatCurrencyPDF(data.data.totalSales)}`,
      20,
      yPos
    );

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
  endDate?: string
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
      endDate
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
    doc.text(
      `Total Credit Sales: ${formatCurrencyPDF(data.data.totalSales)}`,
      20,
      yPos
    );
    yPos += 8;
    doc.text(
      `Credit Outstanding: ${formatCurrencyPDF(data.data.creditOutstanding)}`,
      20,
      yPos
    );

    const blob = doc.output("blob");
    console.log("✅ Credit sales PDF blob created, size:", blob.size, "bytes");
    return blob;
  } catch (error) {
    console.error("❌ Error generating credit sales PDF:", error);
    throw error;
  }
};