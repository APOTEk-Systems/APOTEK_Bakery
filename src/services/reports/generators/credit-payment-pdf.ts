import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import {
	addCompanyHeader,
	getDefaultTableStyles,
	formatCurrencyPDF,
	addPageNumbers,
} from '../pdf-utils';
import type { CreditPaymentReport } from '@/types/reports';

// Credit Payment Report PDF generator
export const generateCreditPaymentPDF = (
	data: CreditPaymentReport,
	startDate?: string,
	endDate?: string,
	settings?: unknown
): Blob => {
	const doc = new jsPDF();

	const yPos = addCompanyHeader(
		doc,
		'Credit Payment Report',
		startDate,
		endDate,
		settings
	);

	// Build rows from data
	const rows = (data?.data || []).map((item, idx: number) => [
		(idx + 1).toString(),
		item.customerName,
		formatCurrencyPDF(item.total ?? 0),
		formatCurrencyPDF(item.paid ?? 0),
		formatCurrencyPDF(item.balance ?? 0),
	]);

	const totals = (data?.data || []).reduce(
		(acc: { total: number; paid: number; balance: number }, r: any) => {
			acc.total += r.total || 0;
			acc.paid += r.paid || 0;
			acc.balance += r.balance || 0;
			return acc;
		},
		{ total: 0, paid: 0, balance: 0 }
	);

	// Add totals rows - each total in its own row with label and value in the Balance column
	rows.push(['', '', '', 'Total:', formatCurrencyPDF(totals.total)]);
	rows.push(['', '', '', 'Paid:', formatCurrencyPDF(totals.paid)]);
	rows.push(['', '', '', 'Balance:', formatCurrencyPDF(totals.balance)]);

	autoTable(doc, {
		head: [['#', 'Customer', 'Total', 'Paid', 'Balance']],
		body: rows,
		startY: yPos,
		margin: { left: 20, right: 20 },
		...getDefaultTableStyles(),
		columnStyles: {
			0: { cellWidth: 12 },
			1: {},
			2: { halign: 'right' },
			3: { halign: 'right' },
			4: { halign: 'right' },
		},
		headStyles: {
			...getDefaultTableStyles().headStyles,
			halign: 'left',
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		didParseCell: function (dataItem: any) {
			// Style totals section (last 3 rows)
			if (dataItem.section === 'body' && dataItem.row.index >= rows.length - 3) {
				// Bold all totals rows
				dataItem.cell.styles.fontStyle = 'bold';
			
				// Right-align currency values in the Balance column (index 4)
				if (dataItem.column.index === 4) {
					dataItem.cell.styles.halign = 'right';
				}
			}
			
			// Right-align header columns for Total, Paid, Balance
			if (
				dataItem.section === 'head' &&
				(dataItem.column.index === 2 ||
					dataItem.column.index === 3 ||
					dataItem.column.index === 4)
			) {
				dataItem.cell.styles.halign = 'right';
			}
		},
	});

	addPageNumbers(doc);
	return doc.output('blob');
};
