import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import {
	addCompanyHeader,
	getDefaultTableStyles,
	formatCurrencyPDF,
	addPageNumbers,
} from '../pdf-utils';

interface PurchaseOrder {
	id: number;
	createdAt: string;
	supplierId: number;
	supplierName?: string;
	items: any[];
	totalCost: number;
	status: string;
}

export const generatePurchaseSummaryPDF = (
	data: { purchaseOrders: PurchaseOrder[]; total: number },
	startDate?: string,
	endDate?: string,
	settings?: any,
	supplierName?: string
): Blob => {
	const doc = new jsPDF();

	const title = supplierName
		? `Purchase Orders Summary - ${supplierName}`
		: 'Purchase Orders Summary Report';

	const yPos = addCompanyHeader(
		doc,
		title,
		startDate,
		endDate,
		settings
	);

	console.log("Date Range:", startDate, "to", endDate);

	// Create table with purchase orders data - match sales report format
	const tableData = data.purchaseOrders.map((po, index) => [
		(index + 1).toString(),
		po.id.toString(),
		format(new Date(po.createdAt), 'dd-MM-yyyy'),
		po.supplierName || 'Unknown',
		po.status.charAt(0).toUpperCase() + po.status.slice(1),
		formatCurrencyPDF(po.totalCost),
		
	]);

	// Add summary row
	const totalAmount = data.purchaseOrders.reduce((sum, po) => sum + po.totalCost, 0);
	tableData.push(['', '', '', '', 'Total:', formatCurrencyPDF(totalAmount),]);

	autoTable(doc, {
		head: [['#', 'Order #', 'Date', 'Supplier', 'Status', 'Total',]],
		body: tableData,
		startY: yPos,
		margin: { left: 20, right: 20 },
		...getDefaultTableStyles(),
		columnStyles: {
			0: { cellWidth: 15 }, // #
			1: { cellWidth: 20 }, // Order #
			2: { cellWidth: 25 }, // Date
			3: { cellWidth: 50 }, // Supplier
			5: { cellWidth:25 }, // Status
			6: { halign: 'right', }, // Total (right-align)
		},
		headStyles: {
			...getDefaultTableStyles().headStyles,
			halign: 'left',
		},
		didParseCell: function (data: any) {
			// Right-align Total header (column 5)
			if (data.section === 'head' && data.column.index === 5) {
				data.cell.styles.halign = 'right';
			}
			// Style summary row
			if (
				data.section === 'body' &&
				data.row.index === tableData.length - 1
			) {
				data.cell.styles.fontStyle = 'bold';
			}
			// Right-align Total values in body rows
			if (
				data.section === 'body' &&
				data.column.index === 5
			) {
				data.cell.styles.halign = 'right';
			}
		},
	});

	// Add generated date at bottom
	const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
	addPageNumbers(doc);

	return doc.output('blob');
};
