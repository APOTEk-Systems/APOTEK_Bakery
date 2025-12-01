import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
	addCompanyHeader,
	getDefaultTableStyles,
	formatCurrencyPDF,
	addPageNumbers,
} from '../pdf-utils';
import type { PurchaseOrderSummaryReport } from '@/types/reports';

export const generatePurchaseSummaryPDF = (
	data: PurchaseOrderSummaryReport,
	settings?: any
): Blob => {
	const doc = new jsPDF();

	const yPos = addCompanyHeader(
		doc,
		'Purchase Orders Summary Report',
		undefined,
		undefined,
		settings
	);

	const rows = [] as any[];

	rows.push([
		'Total Purchases This Month',
		formatCurrencyPDF(data.totalPurchasesThisMonth),
	]);
	rows.push(['Pending Purchase Orders', data.pendingPurchaseOrders.toString()]);
	rows.push([
		'Purchase Growth',
		typeof data.purchaseGrowth === 'string'
			? data.purchaseGrowth
			: `${data.purchaseGrowth}`,
	]);

	// Blank row
	rows.push(['', '']);

	// Weekly header
	rows.push(['Week Start', 'Total']);

	(data.weeklyPurchasesList || []).forEach((w) => {
		rows.push([w.weekStart, formatCurrencyPDF(w.total)]);
	});

	// Convert rows into table format for jspdf-autotable
	const body = rows.map((r) => [r[0], r[1]]);

	autoTable(doc, {
		head: [['Metric', 'Value']],
		body,
		startY: yPos,
		...getDefaultTableStyles(),
		columnStyles: {
			1: { halign: 'right' },
		},
	});

	addPageNumbers(doc);
	return doc.output('blob');
};
