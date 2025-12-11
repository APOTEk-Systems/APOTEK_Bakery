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

// Cash Sales Summary Report PDF
export const generateCashSalesSummaryPDF = (
  data: SalesSummaryReport,
  startDate?: string,
  endDate?: string,
  settings?: unknown
): Blob => {
  const doc = new jsPDF();

  const yPos = addCompanyHeader(
    doc,
    "Cash Sales Summary Report",
    startDate,
    endDate,
    settings
  );

  // Build rows from server-driven summary data: expect { date, total }
  const rows = (data?.data || []).map(
    (r: SalesSummaryReport["data"][number], idx: number) => [
      (idx + 1).toString(),
      format(new Date(r.date || r.createdAt || Date.now()), "dd-MM-yyyy"),
      formatCurrencyPDF(r.total ?? r.amount ?? 0),
    ]
  );

  const totalAll = (data?.data || []).reduce(
    (sum: number, r: SalesSummaryReport["data"][number]) =>
      sum + (r.total ?? r.amount ?? 0),
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
      2: { halign: "right", cellWidth:30 }
    },
    headStyles: {
      ...getDefaultTableStyles().headStyles,
      halign: "left",
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell: function (dataItem: any) {
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
