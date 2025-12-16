import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import {
	addCompanyHeader,
	getDefaultTableStyles,
	formatCurrencyPDF,
	formatDatePDF,
	addPageNumbers,
} from '../pdf-utils';
import type { SalesReturnsReport } from '@/types/reports';

// Sales Returns Report PDF
export const generateSalesReturnsPDF = (
	data: SalesReturnsReport,
	startDate?: string,
	endDate?: string,
	settings?: unknown
): Blob => {
	const doc = new jsPDF({
        orientation:"landscape"
    });

	// Add company header
	const yPos = addCompanyHeader(
		doc,
		'Sales Returns Report',
		startDate,
		endDate,
		settings
	);

	// Build table rows from server data
	const rows = (data.data || []).map((r, idx) => [
		(idx + 1).toString(),
		r.productName,
		formatDatePDF(r.saleDate),
		formatDatePDF(r.returnedDate),
		r.soldQty.toString(),
		r.returnedQty.toString(),
		formatCurrencyPDF(r.returnedAmount),
		r.saleId.toString(),
		r.reason,
		r.approvedBy,
		r.requestedBy,
	]);

	// Calculate total returned amount
	const totalReturned = (data.data || []).reduce(
		(sum, r) => sum + r.returnedAmount,
		0
	);
	rows.push([
		'',
		'',
		'',
		'',
		'',
		'Total:',
		formatCurrencyPDF(totalReturned),
		'',
		'',
		'',
		'',
		'',
	]);

	autoTable(doc, {
		head: [
			[
				'#',
				'Product',
				'Sale Date',
				'Return Date',
				'Sold Qty',
				'Return Qty',
				'Return Amount',
				'Receipt #',
				'Reason',
				'Approved By',
				'Requested By',
			],
		],
		body: rows,
		startY: yPos,
		margin: { left: 15, right: 15 },
		...getDefaultTableStyles(),
		columnStyles: {
			// 0: { cellWidth: 12 },
			// 1: { cellWidth: 30 },
			// 2: { cellWidth: 20 },
			// 3: { cellWidth: 20 },
			// 4: { cellWidth: 15 },
			// 5: { cellWidth: 15 },
			// 6: { cellWidth: 25 },
			// 7: { cellWidth: 15 },
			// 8: { cellWidth: 20 },
			// 9: { cellWidth: 25 },
			// 10: { cellWidth: 25 },
			
		},
		headStyles: {
			...getDefaultTableStyles().headStyles,
			halign: 'left',
			fontSize: 8,
		},
		bodyStyles: {
			fontSize: 8,
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		didParseCell: function (dataItem: any) {
			// Style summary row
			if (
				dataItem.section === 'body' &&
				dataItem.row.index === rows.length - 1
			) {
				dataItem.cell.styles.fontStyle = 'bold';
				dataItem.cell.styles.fillColor = [240, 240, 240];
			}
			// Right align numeric columns
			if (
				dataItem.section === 'head' &&
				[4, 5, 6].includes(dataItem.column.index)
			) {
				dataItem.cell.styles.halign = 'right';
			}
			if (
				dataItem.section === 'body' &&
				[4, 5, 6].includes(dataItem.column.index)
			) {
				dataItem.cell.styles.halign = 'right';
			}
		},
	});

	addPageNumbers(doc);

	return doc.output('blob');
};