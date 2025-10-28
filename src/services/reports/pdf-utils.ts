import {api} from "@/lib/api";
import {format} from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Helper function to add company header to PDFs
export const addCompanyHeader = (
  doc: jsPDF,
  reportTitle: string,
  startDate?: string,
  endDate?: string,
  settings?: any
): number => {
  let yPos = 20;

  // Default company info (fallback)
  const defaultCompanyInfo = {
    bakeryName: "Golden Crust Bakery",
    address: "123 Baker Street, Pastry City, PC 12345",
    phone: "(555) 123-BAKE",
    email: "info@goldencrustbakery.com",
    website: "www.goldencrustbakery.com",
  };

  let companyInfo = defaultCompanyInfo;

  // Use settings if provided
  if (settings?.information) {
    companyInfo = {
      bakeryName: settings.information.bakeryName || defaultCompanyInfo.bakeryName,
      address: settings.information.address || defaultCompanyInfo.address,
      phone: settings.information.phone || defaultCompanyInfo.phone,
      email: settings.information.email || defaultCompanyInfo.email,
      website: settings.information.website || defaultCompanyInfo.website,
    };
  }

  // Company name (centered, bold, larger)
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const pageWidth = doc.internal.pageSize.getWidth();
  const companyNameWidth = doc.getTextWidth(companyInfo.bakeryName);
  doc.text(companyInfo.bakeryName, (pageWidth - companyNameWidth) / 2, yPos);
  yPos += 10;

  // Company details (centered, smaller)
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  if (companyInfo.address) {
    const addressWidth = doc.getTextWidth(companyInfo.address);
    doc.text(companyInfo.address, (pageWidth - addressWidth) / 2, yPos);
    yPos += 6;
  }

  // Contact info on same line
  let contactInfo = "";
  if (companyInfo.phone) contactInfo += `Phone: ${companyInfo.phone}`;
  if (companyInfo.email) {
    if (contactInfo) contactInfo += " | ";
    contactInfo += `Email: ${companyInfo.email}`;
  }
  if (contactInfo) {
    const contactWidth = doc.getTextWidth(contactInfo);
    doc.text(contactInfo, (pageWidth - contactWidth) / 2, yPos);
    yPos += 6;
  }

  if (companyInfo.website) {
    const websiteWidth = doc.getTextWidth(companyInfo.website);
    doc.text(companyInfo.website, (pageWidth - websiteWidth) / 2, yPos);
    yPos += 10;
  }

  // Report title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  const titleWidth = doc.getTextWidth(reportTitle);
  doc.text(reportTitle, (pageWidth - titleWidth) / 2, yPos);
  yPos += 10;

  // Date range
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const dateRange =
    startDate && endDate ? `From ${startDate} to ${endDate}` : "All Time";
  const dateRangeWidth = doc.getTextWidth(`Date Range: ${dateRange}`);
  doc.text(
    `Date Range: ${dateRange}`,
    (pageWidth - dateRangeWidth) / 2,
    yPos
  );
  yPos += 6;

  // Generated date
  const generatedText = `Generated: ${format(new Date(), "dd-MM-yyyy")}`;
  const generatedWidth = doc.getTextWidth(generatedText);
  doc.text(generatedText, (pageWidth - generatedWidth) / 2, yPos);
  yPos += 15;

  return yPos; // Return the Y position after the header
};

// Test function to check if PDF generation works
export const testPDFGeneration = (): Blob => {
  console.log("🧪 Testing basic PDF generation...");
  try {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Test PDF Report", 20, 20);
    doc.setFontSize(12);
    doc.text("This is a test to verify PDF generation works.", 20, 40);
    doc.text(`Generated at: ${new Date().toLocaleString()}`, 20, 60);

    // Test table functionality
    autoTable(doc, {
      head: [["Column 1", "Column 2", "Column 3"]],
      body: [
        ["Row 1 Col 1", "Row 1 Col 2", "Row 1 Col 3"],
        ["Row 2 Col 1", "Row 2 Col 2", "Row 2 Col 3"],
      ],
      startY: 80,
      theme: "grid",
      styles: {fontSize: 10},
      headStyles: {fillColor: [41, 128, 185]},
    });

    const blob = doc.output("blob");
    console.log("✅ Test PDF generated successfully, size:", blob.size);
    return blob;
  } catch (error) {
    console.error("❌ Test PDF generation failed:", error);
    throw error;
  }
};

// Common table styling configuration
export const getDefaultTableStyles = () => ({
  theme: "grid" as const,
  styles: {fontSize: 8},
  headStyles: {fillColor: [41, 128, 185] as [number, number, number]},
});

// Format currency for PDF
export const formatCurrencyPDF = (amount: number): string => {
  return `TZS ${amount.toLocaleString()}`;
};

// Format date for PDF
export const formatDatePDF = (dateString: string): string => {
  return format(new Date(dateString), "dd-MM-yyyy");
};