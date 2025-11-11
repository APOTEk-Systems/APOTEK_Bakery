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
  let yPos = 10;

  // Default company info (fallback)
  const defaultCompanyInfo = {
    bakeryName: "Golden Crust Bakery",
    address: "123 Baker Street, Pastry City, PC 12345",
    phone: "(555) 123-BAKE",
    email: "info@goldencrustbakery.com",
    website: "",
    logo: "",
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
      logo: settings.information.logo || defaultCompanyInfo.logo,
    };
  }

  // Add registration details if available (only TIN and VRN)
  let registrationInfo = "";
  if (settings?.information?.tin) {
    registrationInfo += `TIN: ${settings.information.tin}`;
  }
  if (settings?.information?.vrnNumber) {
    if (registrationInfo) registrationInfo += " | ";
    registrationInfo += `VRN: ${settings.information.vrnNumber}`;
  }

  const pageWidth = doc.internal.pageSize.getWidth();

  // Add logo if available (centered at top)
  if (companyInfo.logo) {
    try {
      // Add logo image to PDF - assuming logo is a base64 data URL
      if (companyInfo.logo.startsWith('data:image')) {
        // For jsPDF, we need to handle image dimensions differently
        // We'll use a fixed width and calculate height based on aspect ratio
        // Since we can't load the image synchronously, we'll assume a reasonable aspect ratio
        // or use a callback-based approach, but for simplicity, let's use a standard approach
        const logoWidth = 60;
        const logoHeight = 25; // Default height, will be adjusted if possible
        doc.addImage(companyInfo.logo, 'JPEG', (pageWidth - logoWidth) / 2, yPos, logoWidth, logoHeight);
        yPos += logoHeight + 5;
      }
    } catch (error) {
      console.warn("Could not load logo for PDF:", error);
    }
  }

  // Company name (centered, bold, larger)
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const companyNameWidth = doc.getTextWidth(companyInfo.bakeryName);
  doc.text(companyInfo.bakeryName, (pageWidth - companyNameWidth) / 2, yPos);
  yPos += 6;

  // Company details (centered, smaller)
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  if (companyInfo.address) {
    const addressWidth = doc.getTextWidth(companyInfo.address);
    doc.text(companyInfo.address, (pageWidth - addressWidth) / 2, yPos);
    yPos += 6;
  }

  // Phone on its own line
  if (companyInfo.phone) {
    const phoneText = `Phone: ${companyInfo.phone}`;
    const phoneWidth = doc.getTextWidth(phoneText);
    doc.text(phoneText, (pageWidth - phoneWidth) / 2, yPos);
    yPos += 6;
  }

  // Email and website on same line
  let contactInfo = "";
  if (companyInfo.email) contactInfo += `Email: ${companyInfo.email}`;
  if (companyInfo.website) {
    if (contactInfo) contactInfo += " | ";
    contactInfo += `Website: ${companyInfo.website}`;
  }
  if (contactInfo) {
    const contactWidth = doc.getTextWidth(contactInfo);
    doc.text(contactInfo, (pageWidth - contactWidth) / 2, yPos);
    yPos += 6;
  }

  // Add registration information if available
  if (registrationInfo) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const regWidth = doc.getTextWidth(registrationInfo);
    doc.text(registrationInfo, (pageWidth - regWidth) / 2, yPos);
    yPos += 10;
  }

  // Report title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  const titleWidth = doc.getTextWidth(reportTitle);
  doc.text(reportTitle, (pageWidth - titleWidth) / 2, yPos);
  yPos += 6;

  // Date range
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const dateRange =
    startDate && endDate ? `Date Range: From ${startDate} to ${endDate}` : "Date Range: All Time";
  const dateRangeWidth = doc.getTextWidth(dateRange);
  doc.text(dateRange, (pageWidth - dateRangeWidth) / 2, yPos);
  yPos += 4;

  // Generated date - moved to bottom of function, will be handled by caller

  return yPos; // Return the Y position after the header with further reduced spacing to table
};

// Helper function to add generated date at bottom of report
export const addGeneratedDate = (doc: jsPDF, yPos: number): void => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const generatedText = `Generated: ${format(new Date(), "dd-MM-yyyy")}`;
  const generatedWidth = doc.getTextWidth(generatedText);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(generatedText, (pageWidth - generatedWidth) / 2, yPos);
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
  theme: "plain" as const,
  styles: {
    fontSize: 8,
    cellPadding: 3,
  },
  headStyles: {
    fillColor: [31, 41, 55] as [number, number, number], // Dark gray/navy blue
    textColor: [255, 255, 255] as [number, number, number],
    fontStyle: 'bold' as const,
  },
  alternateRowStyles: {
    fillColor: [249, 250, 251] as [number, number, number], // Light gray for odd rows
  },
  rowStyles: {
    fillColor: [255, 255, 255] as [number, number, number], // White for even rows
  },
});

// Format currency for PDF
export const formatCurrencyPDF = (amount: number): string => {
  return `${amount.toLocaleString()}`;
};

// Format date for PDF
export const formatDatePDF = (dateString: string): string => {
  return format(new Date(dateString), "dd-MM-yyyy");
};