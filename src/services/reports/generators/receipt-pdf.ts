import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import {
	addCompanyHeader,
	getDefaultTableStyles,
	formatCurrencyPDF,
} from '../pdf-utils';

interface ReceiptData {
	sale: any;
	cart: any[];
	customer: any;
	customerName?: string;
	paymentMethod: string;
	creditDueDate: string;
	total: number;
	subtotal: number;
	tax: number;
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
	receiptFormat: 'a5' | 'thermal'
): Blob => {
	const { sale, cart, customer, customerName, paymentMethod, creditDueDate, total, subtotal, tax, businessInfo, user } = data;

	const doc = new jsPDF({
		orientation: receiptFormat === 'a5' ? 'portrait' : 'portrait',
		unit: 'mm',
		format: receiptFormat === 'a5' ? 'a5' : [80, 297], // Thermal: 80mm width, long height
	});

	try {
		if (receiptFormat === 'thermal') {
			// Thermal receipt - using autotable for consistent formatting
			doc.setFont('courier', 'normal'); // Monospace font
			let yPos = 5;
			const pageWidth = doc.internal.pageSize.width;

			// Center align function for thermal
			const centerText = (text: string, y: number) => {
				doc.text(text, pageWidth / 2, y, { align: 'center' });
			};

			yPos += 4;

			// Business Header
			doc.setFontSize(10);
			doc.setFont('courier', 'bold');
			centerText(businessInfo?.bakeryName || 'Pastry Pros', yPos);
			yPos += 5;

			doc.setFontSize(8);
			doc.setFont('courier', 'normal');
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
			doc.text(`Customer: ${customer?.name || customerName || 'Cash'}`, 2, yPos);
			yPos += 4;
			doc.text(`Date: ${format(new Date(sale.createdAt), "dd-MM-yyyy HH:mm")}`, 2, yPos);
			yPos += 6;

			// Items Table using autotable for consistent alignment
			const tableData = cart.map((item) => [
				item.name,
				item.quantity.toString(),
				formatCurrencyPDF(item.price), // Show unit price
			]);

			// Add total row for each item
			const itemTotalData = cart.map((item) => [
				'',
				'',
				formatCurrencyPDF(item.price * item.quantity), // Show item total
			]);

			autoTable(doc, {
				head: [['Item', 'Qty', 'Price']],
				body: tableData,
				startY: yPos,
				styles:{font:"courier", fontSize: 8, cellPadding: 1},
				margin: { left: 2, right: 2 },
				theme: 'plain',
				columnStyles: {
					0: { cellWidth: 45 }, // Item name
					1: { cellWidth: 8, halign: 'center' }, // Qty
					2: { cellWidth: 20, halign: 'right' }, // Price (unit price)
				},
				didParseCell: function (dataItem: any) {
					if(dataItem.section === "head" && dataItem.column.index === 2){
						dataItem.cell.styles.halign = 'right';
					}
				}
			});


			yPos = (doc as any).lastAutoTable.finalY + 4;

			// Separator
			doc.text('--------------------------------------------', 2, yPos);
			yPos += 4;

			// Totals
			doc.text(`Subtotal: ${formatCurrencyPDF(subtotal)}`, pageWidth - 2, yPos, { align: 'right' });
			yPos += 4;
			doc.text(`VAT: ${formatCurrencyPDF(tax)}`, pageWidth - 2, yPos, { align: 'right' });
			yPos += 4;
			doc.setFont('courier', 'bold');
			doc.text(`Total: ${formatCurrencyPDF(total)}`, pageWidth - 2, yPos, { align: 'right' });
			yPos += 6;

			// Payment Info
			doc.setFont('courier', 'normal');
			doc.text(`Payment: ${paymentMethod === 'credit' ? 'Credit' : 'Cash'}`, 2, yPos);
			yPos += 4;
			if (paymentMethod === 'credit' && creditDueDate) {
				doc.text(`Due: ${format(new Date(creditDueDate), 'dd-MM-yyyy')}`, 2, yPos);
				yPos += 4;
			}

			yPos += 4;

			// Footer
			doc.setFontSize(7);
			centerText('Thank you for shopping with us!', yPos);
			yPos += 3;
			centerText('Enjoy!', yPos);
			yPos += 3;
			if (user?.name) {
				centerText(`Issued By: ${user.name}`, yPos);
			}

		} else {
			// A5 receipt - table-based layout
			let yPos = 10;

			// Business Header
			doc.setFontSize(12);
			doc.setFont('helvetica', 'bold');
			const bakeryName = businessInfo?.bakeryName || 'Pastry Pros';
			doc.text(bakeryName, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
			yPos += 6;

			doc.setFontSize(8);
			doc.setFont('helvetica', 'normal');
			if (businessInfo?.address) {
				doc.text(businessInfo.address, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
				yPos += 4;
			}
			if (businessInfo?.phone) {
				doc.text(`Tel: ${businessInfo.phone}`, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
				yPos += 4;
			}
			if (businessInfo?.email) {
				doc.text(businessInfo.email, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
				yPos += 4;
			}

			yPos += 6;

			// Receipt Info
			doc.setFontSize(8);
			doc.text(`Receipt #: ${sale?.id}`, 10, yPos);
			yPos += 4;
			doc.text(`Customer: ${customer?.name || customerName || 'Cash'}`, 10, yPos);
			yPos += 4;
			doc.text(`Date: ${format(new Date(sale.createdAt), "dd-MM-yyyy HH:mm")}`, 10, yPos);
			yPos += 6;

			// Items Table
			const tableData = cart.map((item, index) => [
				(index + 1).toString(),
				item.name,
				item.quantity.toString(),
				formatCurrencyPDF(item.price * item.quantity),
			]);

			autoTable(doc, {
				head: [['#', 'Item', 'Qty', 'Amount']],
				body: tableData,
				startY: yPos,
				margin: { left: 10, right: 10 },
				styles: {
					fontSize: 8,
					cellPadding: 2,
				},
				headStyles: {
					fillColor: [240, 240, 240],
					textColor: [0, 0, 0],
					fontStyle: 'bold',
				},
				columnStyles: {
					0: { cellWidth: 10 }, // #
					1: { cellWidth: 60 }, // Item
					2: { cellWidth: 15, halign: 'center' }, // Qty
					3: { cellWidth: 20, halign: 'right' }, // Amount
				},
			});

			yPos = (doc as any).lastAutoTable.finalY + 6;

			// Totals
			doc.setFontSize(8);
			doc.text(`Subtotal: ${formatCurrencyPDF(subtotal)}`, doc.internal.pageSize.width - 10, yPos, { align: 'right' });
			yPos += 4;
			doc.text(`VAT: ${formatCurrencyPDF(tax)}`, doc.internal.pageSize.width - 10, yPos, { align: 'right' });
			yPos += 4;
			doc.setFont('helvetica', 'bold');
			doc.text(`Total: ${formatCurrencyPDF(total)}`, doc.internal.pageSize.width - 10, yPos, { align: 'right' });
			yPos += 6;

			// Payment Info
			doc.setFont('helvetica', 'normal');
			doc.text(`Payment: ${paymentMethod === 'credit' ? 'Credit' : 'Cash'}`, 10, yPos);
			yPos += 4;
			if (paymentMethod === 'credit' && creditDueDate) {
				doc.text(`Due: ${format(new Date(creditDueDate), 'dd-MM-yyyy')}`, 10, yPos);
				yPos += 4;
			}

			yPos += 6;

			// Footer
			doc.setFontSize(7);
			doc.text('Thank you for shopping with us!', doc.internal.pageSize.width / 2, yPos, { align: 'center' });
			yPos += 4;
			doc.text('Enjoy!', doc.internal.pageSize.width / 2, yPos, { align: 'center' });
			yPos += 4;
			if (user?.name) {
				doc.text(`Issued By: ${user.name}`, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
			}
		}

		const blob = doc.output('blob');
		return blob;
	} catch (error) {
		console.error('Error generating receipt PDF:', error);
		throw error;
	}
};