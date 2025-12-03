import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import {
  addCompanyHeader,
  getDefaultTableStyles,
  formatCurrencyPDF,
} from "../pdf-utils";

interface ReceiptData {
  sale: any;
  cart: any[];
  customer: any;
  customerName?: string;
  paymentMethod: string;
  creditDueDate: string;
  total: number;
  subtotal: string;
  tax: string;
  businessInfo?: {
    bakeryName: string;
    address: string;
    phone: string;
    email: string;
  };
  user?: any;
}

export const generateReceiptPDF = (
  data: ReceiptData,
  receiptFormat: "a4" | "a5" | "thermal"
): Blob => {
  const {
    sale,
    cart,
    customer,
    customerName,
    paymentMethod,
    creditDueDate,
    total,
    subtotal,
    tax,
    businessInfo,
    user,
  } = data;

  const doc = new jsPDF({
    orientation: receiptFormat === "a4" ? "portrait" : "portrait",
    unit: "mm",
    format:
      receiptFormat === "a4" ? "a4" : receiptFormat === "a5" ? "a5" : [80, 297], // Thermal: 80mm width, long height
  });

  console.log(receiptFormat, doc.internal.pageSize);
  try {
    if (receiptFormat === "thermal") {
      // Thermal receipt - using autotable for consistent formatting
      doc.setFont("courier", "normal"); // Monospace font
      let yPos = 5;
      const pageWidth = doc.internal.pageSize.width;

      // Center align function for thermal
      const centerText = (text: string, y: number) => {
        doc.text(text, pageWidth / 2, y, { align: "center" });
      };

      yPos += 4;

      // Business Header
      doc.setFontSize(10);
      doc.setFont("courier", "bold");
      centerText(businessInfo?.bakeryName || "Pastry Pros", yPos);
      yPos += 5;

      doc.setFontSize(8);
      doc.setFont("courier", "normal");
      if (businessInfo?.address) {
        centerText(businessInfo.address, yPos);
        yPos += 4;
      }
      if (businessInfo?.phone) {
        centerText(`Tel: ${businessInfo.phone}`, yPos);
        yPos += 4;
      }
      if (businessInfo?.email) {
        centerText(businessInfo.email, yPos);
        yPos += 4;
      }

      yPos += 4;

      // Receipt Info
      doc.text(`Receipt #: ${sale?.id}`, 2, yPos);
      yPos += 4;
      doc.text(
        `Customer: ${customer?.name || customerName || "Cash"}`,
        2,
        yPos
      );
      yPos += 4;
      doc.text(
        `Date: ${format(new Date(sale.createdAt), "dd-MM-yyyy HH:mm")}`,
        2,
        yPos
      );
      yPos += 6;

      // Items Table using autotable for consistent alignment
      const tableData = cart.map((item) => [
        item.name,
        item.quantity.toString(),
        formatCurrencyPDF(item.price), // Show unit price
      ]);

      // Add total row for each item
      const itemTotalData = cart.map((item) => [
        "",
        "",
        formatCurrencyPDF(item.price * item.quantity), // Show item total
      ]);

      autoTable(doc, {
        head: [["Item", "Qty", "Price"]],
        body: tableData,
        startY: yPos,
        styles: { font: "courier", fontSize: 8, cellPadding: 1 },
        margin: { left: 2, right: 2 },
        theme: "plain",
        columnStyles: {
          0: { cellWidth: 45 }, // Item name
          1: { cellWidth: 8, halign: "center" }, // Qty
          2: { cellWidth: 20, halign: "right" }, // Price (unit price)
        },
        didParseCell: function (dataItem: any) {
          if (dataItem.section === "head" && dataItem.column.index === 2) {
            dataItem.cell.styles.halign = "right";
          }
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 4;

      // Separator
      doc.text("--------------------------------------------", 2, yPos);
      yPos += 4;

      // Totals
      doc.text(
        `Subtotal: ${formatCurrencyPDF(parseInt(subtotal))}`,
        pageWidth - 2,
        yPos,
        { align: "right" }
      );
      yPos += 4;
      doc.text(
        `VAT: ${formatCurrencyPDF(parseInt(tax))}`,
        pageWidth - 2,
        yPos,
        { align: "right" }
      );
      yPos += 4;
      doc.setFont("courier", "bold");
      doc.text(`Total: ${formatCurrencyPDF(total)}`, pageWidth - 2, yPos, {
        align: "right",
      });
      yPos += 6;

      // Payment Info
      doc.setFont("courier", "normal");
      doc.text(
        `Payment: ${paymentMethod === "credit" ? "Credit" : "Cash"}`,
        2,
        yPos
      );
      yPos += 4;
      if (paymentMethod === "credit" && creditDueDate) {
        doc.text(
          `Due: ${format(new Date(creditDueDate), "dd-MM-yyyy")}`,
          2,
          yPos
        );
        yPos += 4;
      }

      yPos += 4;

      // Footer
      doc.setFontSize(7);
      centerText("Thank you for shopping with us!", yPos);
      yPos += 3;
      centerText("Enjoy!", yPos);
      yPos += 3;
      if (user?.name) {
        centerText(`Issued By: ${user.name}`, yPos);
      }
    } 
    else if (receiptFormat === "a4") {
      // A4 receipt - table-based layout
      // Add company header with logo and business info
      let yPos = addCompanyHeader(
        doc,
        "SALES RECEIPT",
        undefined,
        undefined,
        { information: businessInfo },
        false,
        false
      );

      // Receipt Info Table
      const receiptInfoData = [
        [
          "Customer",
          customer?.name || customerName || "Cash",

          "Receipt #",
          sale?.id || "N/A",
        ],
        [
          "Payment",
          paymentMethod === "credit" ? "Credit" : "Cash",
          "Date",
          format(new Date(sale.createdAt), "dd-MM-yyyy"),
        ],
      ];

      autoTable(doc, {
        body: receiptInfoData,
        startY: (yPos -= 4),
        styles: {
          fontSize: 8,
          cellPadding: 2,
          fillColor: [255, 255, 255],
        },
        theme: "grid",
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: "auto" },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 4;

      // Items Table
      const tableData = cart.map((item, index) => [
        (index + 1).toString(),
        item.name,
        item.quantity.toString(),
        formatCurrencyPDF(item.price),
        formatCurrencyPDF(item.price * item.quantity),
      ]);

      autoTable(doc, {
        head: [["#", "Item", "Qty", "Price", "Amount"]],
        body: tableData,
        startY: yPos,
        ...getDefaultTableStyles(),
        columnStyles: {
          0: { cellWidth: 10 }, // #
          1: { cellWidth: 60 }, // Item
          2: { cellWidth: 15 }, // Qty
          3: { halign: "right" }, // Amount
          4: { halign: "right" }, // Price
        },
        headStyles: {
          ...getDefaultTableStyles().headStyles,
          halign: "left", // Keep other headers left-aligned
        },
        didParseCell: function (dataItem: any) {
          if (
            (dataItem.section === "head" && dataItem.column.index === 3) ||
            dataItem.column.index === 4
          ) {
            dataItem.cell.styles.halign = "right";
          }
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 8;

      // Totals and footer info on same line
      doc.setFontSize(8);

      // Left side - Issued By and Printed On
      doc.setFont("helvetica", "bold");
      doc.text(`Issued By: ${user?.name || "Unknown"}`, 15, yPos);
      yPos += 4;
      doc.setFont("helvetica", "normal");
      doc.text(
        `Printed On: ${format(new Date(), "dd-MM-yyyy HH:mm")}`,
        15,
        yPos
      );
      yPos += 4;

      // Right side - Totals breakdown
      const rightX = doc.internal.pageSize.width - 15; // right column x
      const leftX = rightX - 40; // width of the label column (adjust as needed)

      // Subtotal
      doc.setFont("helvetica", "normal");
      doc.text("Subtotal:", leftX, yPos - 8);
      doc.text(formatCurrencyPDF(parseInt(subtotal)), rightX, yPos - 8, {
        align: "right",
      });

      // VAT
      doc.text("VAT:", leftX, yPos - 4);
      doc.text(formatCurrencyPDF(parseInt(tax)), rightX, yPos - 4, {
        align: "right",
      });

      // Total
      doc.setFont("helvetica", "bold");
      doc.text("Total:", leftX, yPos);
      doc.text(formatCurrencyPDF(total), rightX, yPos, { align: "right" });

      // Footer positioned near bottom of page
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(
        "Thank you for shopping with us!",
        doc.internal.pageSize.width / 2,
        pageHeight - 6,
        { align: "center" }
      );
      doc.text("Enjoy!", doc.internal.pageSize.width / 2, pageHeight - 2, {
        align: "center",
      });
    } else if (receiptFormat === "a5") {
      // A4 receipt - table-based layout
      // Add company header with logo and business info
      let yPos = addCompanyHeader(
        doc,
        "SALES RECEIPT",
        undefined,
        undefined,
        { information: businessInfo },
        false,
        false
      );

      // Receipt Info Table
      const receiptInfoData = [
        [
          "Customer",
          customer?.name || customerName || "Cash",

          "Receipt #",
          sale?.id || "N/A",
        ],
        [
          "Payment",
          paymentMethod === "credit" ? "Credit" : "Cash",
          "Date",
          format(new Date(sale.createdAt), "dd-MM-yyyy"),
        ],
      ];

      autoTable(doc, {
        body: receiptInfoData,
        startY: (yPos -= 4),
        styles: {
          fontSize: 8,
          cellPadding: 2,
          fillColor: [255, 255, 255],
        },
        theme: "grid",
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: "auto" },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 4;

      // Items Table
      const tableData = cart.map((item, index) => [
        (index + 1).toString(),
        item.name,
        item.quantity.toString(),
        formatCurrencyPDF(item.price),
        formatCurrencyPDF(item.price * item.quantity),
      ]);

      autoTable(doc, {
        head: [["#", "Item", "Qty", "Price", "Amount"]],
        body: tableData,
        startY: yPos,
        ...getDefaultTableStyles(),
        columnStyles: {
          0: { cellWidth: 10 }, // #
          1: { cellWidth: 60 }, // Item
          2: { cellWidth: 15 }, // Qty
          3: { halign: "right" }, // Amount
          4: { halign: "right" }, // Price
        },
        headStyles: {
          ...getDefaultTableStyles().headStyles,
          halign: "left", // Keep other headers left-aligned
        },
        didParseCell: function (dataItem: any) {
          if (
            (dataItem.section === "head" && dataItem.column.index === 3) ||
            dataItem.column.index === 4
          ) {
            dataItem.cell.styles.halign = "right";
          }
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 8;

      // Totals and footer info on same line
      doc.setFontSize(8);

      // Left side - Issued By and Printed On
      doc.setFont("helvetica", "bold");
      doc.text(`Issued By: ${user?.name || "Unknown"}`, 15, yPos);
      yPos += 4;
      doc.setFont("helvetica", "normal");
      doc.text(
        `Printed On: ${format(new Date(), "dd-MM-yyyy HH:mm")}`,
        15,
        yPos
      );
      yPos += 4;

       // Right side - Totals breakdown
      const rightX = doc.internal.pageSize.width - 15; // right column x
      const leftX = rightX - 35; // width of the label column (adjust as needed)

      // Subtotal
      doc.setFont("helvetica", "normal");
      doc.text("Subtotal:", leftX, yPos - 8);
      doc.text(formatCurrencyPDF(parseInt(subtotal)), rightX, yPos - 8, {
        align: "right",
      });

      // VAT
      doc.text("VAT:", leftX, yPos - 4);
      doc.text(formatCurrencyPDF(parseInt(tax)), rightX, yPos - 4, {
        align: "right",
      });

      // Total
      doc.setFont("helvetica", "bold");
      doc.text("Total:", leftX, yPos);
      doc.text(formatCurrencyPDF(total), rightX, yPos, { align: "right" });

      // Footer positioned near bottom of page
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(
        "Thank you for shopping with us!",
        doc.internal.pageSize.width / 2,
        pageHeight - 6,
        { align: "center" }
      );
      doc.text("Enjoy!", doc.internal.pageSize.width / 2, pageHeight - 2, {
        align: "center",
      });
    }
    //  else if (receiptFormat === "a5") {
    //   // A5 receipt - scaled down version of A4 with compact layout
    //   doc.setFont("helvetica", "normal");
    //   let yPos = 5;
    //   const pageWidth = doc.internal.pageSize.width;

    //   // Center align function for A5
    //   const centerText = (text: string, y: number) => {
    //     doc.text(text, pageWidth / 2, y, { align: "center" });
    //   };

    //   // Business Header (compact)
    //   doc.setFontSize(12);
    //   doc.setFont("helvetica", "bold");
    //   centerText(businessInfo?.bakeryName || "Pastry Pros", yPos);
    //   yPos += 6;

    //   doc.setFontSize(8);
    //   doc.setFont("helvetica", "normal");
    //   if (businessInfo?.address) {
    //     centerText(businessInfo.address, yPos);
    //     yPos += 4;
    //   }
    //   if (businessInfo?.phone) {
    //     centerText(`Tel: ${businessInfo.phone}`, yPos);
    //     yPos += 4;
    //   }
    //   if (businessInfo?.email) {
    //     centerText(businessInfo.email, yPos);
    //     yPos += 4;
    //   }

    //   yPos += 4;

    //   // Receipt Title
    //   doc.setFontSize(10);
    //   doc.setFont("helvetica", "bold");
    //   centerText("RECEIPT", yPos);
    //   yPos += 6;

    //   // Receipt Info (compact)
    //   doc.setFontSize(8);
    //   doc.setFont("helvetica", "normal");
    //   doc.text(`Receipt #: ${sale?.id || "N/A"}`, 2, yPos);
    //   yPos += 4;
    //   doc.text(`Customer: ${customer?.name || customerName || "Cash"}`, 2, yPos);
    //   yPos += 4;
    //   doc.text(`Date: ${format(new Date(sale.createdAt), "dd-MM-yyyy")}`, 2, yPos);
    //   yPos += 4;
    //   doc.text(`Payment: ${paymentMethod === "credit" ? "Credit" : "Cash"}`, 2, yPos);
    //   yPos += 6;

    //   // Items Table (compact)
    //   const tableData = cart.map((item, index) => [
    //     (index + 1).toString(),
    //     item.name,
    //     item.quantity.toString(),
    //     formatCurrencyPDF(item.price * item.quantity),
    //   ]);

    //   autoTable(doc, {
    //     head: [["#", "Item", "Qty", "Amount"]],
    //     body: tableData,
    //     startY: yPos,
    //     margin: { left: 5, right: 5 },
    //     styles: {
    //       fontSize: 7,
    //       cellPadding: 1,
    //     },
    //     headStyles: {
    //       fillColor: [31, 41, 55],
    //       textColor: [255, 255, 255],
    //       fontStyle: "bold",
    //     },
    //     columnStyles: {
    //       0: { cellWidth: 8 }, // #
    //       1: { cellWidth: 35 }, // Item
    //       2: { cellWidth: 10 }, // Qty
    //       3: { halign: "right" }, // Amount
    //     },
    //     didParseCell: function (dataItem: any) {
    //       if (dataItem.section === "head" && dataItem.column.index === 3) {
    //         dataItem.cell.styles.halign = "right";
    //       }
    //     },
    //   });

    //   yPos = (doc as any).lastAutoTable.finalY + 4;

    //   // Totals (right aligned)
    //   doc.setFontSize(8);
    //   doc.text(`Subtotal: ${formatCurrencyPDF(parseInt(subtotal))}`, pageWidth - 5, yPos, { align: "right" });
    //   yPos += 4;
    //   doc.text(`VAT: ${formatCurrencyPDF(parseInt(tax))}`, pageWidth - 5, yPos, { align: "right" });
    //   yPos += 4;
    //   doc.setFont("helvetica", "bold");
    //   doc.text(`Total: ${formatCurrencyPDF(total)}`, pageWidth - 5, yPos, { align: "right" });
    //   yPos += 6;

    //   // Footer (positioned near bottom)
    //   const pageHeight = doc.internal.pageSize.getHeight();
    //   doc.setFontSize(7);
    //   centerText("Thank you for shopping with us!", pageHeight - 8);
    //   centerText("Enjoy!", pageHeight - 4);
    //   if (user?.name) {
    //     centerText(`By: ${user.name}`, pageHeight - 1);
    //   }
    // }

    const blob = doc.output("blob");
    return blob;
  } catch (error) {
    console.error("Error generating receipt PDF:", error);
    throw error;
  }
};
