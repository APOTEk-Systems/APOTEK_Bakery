import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { addCompanyHeader, getDefaultTableStyles, formatCurrencyPDF, addPageNumbers } from "../pdf-utils";
import type { SalesSummaryReport } from "@/types/reports";

// Sales Summary Report PDF
export const generateSalesSummaryPDF = (
  data: SalesSummaryReport,
  startDate?: string,
  endDate?: string,
  settings?: unknown
): Blob => {
  const doc = new jsPDF();

  // Add company header
  const yPos = addCompanyHeader(
    doc,
    "Sales Summary Report",
    startDate,
    endDate,
    settings
  );

  // Build table rows from server-driven summary data
  const rows = (data.data || []).map((r, idx) => [
    (idx + 1).toString(),
    format(new Date(r.date), "dd-MM-yyyy"),
    formatCurrencyPDF(r.total),
  ]);

  const totalAll = (data.data || []).reduce((sum, r) => sum + (r.total || 0), 0);
  rows.push(["", "Total:", formatCurrencyPDF(totalAll)]);

  autoTable(doc, {
    head: [["#", "Date", "# Sales", "Total"]],
    body: rows,
    startY: yPos,
    margin: { left: 20, right: 20 },
    ...getDefaultTableStyles(),
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 50 },
      2: { halign: 'right', cellWidth: 30 },
      3: { halign: 'right', cellWidth: 35 },
    },
    headStyles: {
      ...getDefaultTableStyles().headStyles,
      halign: 'left'
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell: function(dataItem: any) {
      // Style summary row
      if (dataItem.section === 'body' && dataItem.row.index === rows.length - 1) {
        dataItem.cell.styles.fontStyle = 'bold';
      }
      // Right-align numeric columns
      if (dataItem.section === 'body' && dataItem.column.index === 2) {
        dataItem.cell.styles.halign = 'right';
      }
    },
  });

  addPageNumbers(doc);

  return doc.output("blob");
};
