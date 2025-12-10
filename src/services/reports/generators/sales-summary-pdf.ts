import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import {
  addCompanyHeader,
  getDefaultTableStyles,
  formatCurrencyPDF,
  addPageNumbers,
} from "../pdf-utils";
import type { SalesSummaryReport } from "@/types/reports";

// Sales Summary Report PDF
export const generateSalesSummaryPDF = (
  data: SalesSummaryReport, //
  startDate?: string,
  endDate?: string,
  settings?: unknown
): Blob => {
  const doc = new jsPDF();

  // Add company header
  const yPos = addCompanyHeader(
    doc,
    "Sales Summary Report", // Updated Title
    startDate,
    endDate,
    settings
  );

  // Build table rows from server-driven summary data
  const rows = (data.data || []).map((r, idx) => [
    (idx + 1).toString(),
    format(new Date(r.date), "dd-MM-yyyy"),
    // FIX: Use nullish coalescing (??) to default r.total to 0 if it is null or undefined.
    formatCurrencyPDF(r.total ?? 0),
  ]);

  // FIX: Use nullish coalescing (??) to safely sum the totals, ensuring 0 is used for missing values.
  const totalAll = (data.data || []).reduce(
    (sum, r) => sum + (r.total ?? 0),
    0
  );
  rows.push(["", "Total:", formatCurrencyPDF(totalAll)]);

  autoTable(doc, {
    head: [["#", "Date", "Total"]],
    body: rows,
    startY: yPos,
    margin: { left: 20, right: 20 },
    ...getDefaultTableStyles(),
    columnStyles: {
      0: { cellWidth: 12 },
      1: { halign: "center", cellWidth:"auto" },
      2: { halign: "right", cellWidth:30 },
    },
    headStyles: {
      ...getDefaultTableStyles().headStyles,
      halign: "left",
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell: function (dataItem: any) {
      // Style summary row
      if (
        dataItem.section === "body" &&
        dataItem.row.index === rows.length - 1
      ) {
        dataItem.cell.styles.fontStyle = "bold";
      }
      if (
        dataItem.section === "head" && // Check if it's a header cell
        dataItem.column.index === 2 // Check if it's the 3rd column (index 2)
      ) {
        dataItem.cell.styles.halign = "right";
      }
      if (dataItem.section === "head" && dataItem.column.index === 1) {
        dataItem.cell.styles.halign = "center";
      }
    },
  });

  addPageNumbers(doc);

  return doc.output("blob");
};
