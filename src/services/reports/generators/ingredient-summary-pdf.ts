import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import {
	addCompanyHeader,
	getDefaultTableStyles,
	formatCurrencyPDF,
	addPageNumbers,
} from '../pdf-utils';
import type { IngredientUsageReport } from '@/types/reports';

// Ingredient Usage Summary Report PDF
export const generateIngredientSummaryPDF = (
	data: IngredientUsageReport | any,
	startDate?: string,
	endDate?: string,
	settings?: unknown
): Blob => {
	const doc = new jsPDF();

	const yPos = addCompanyHeader(
		doc,
		'Ingredients Summary Report',
		startDate,
		endDate,
		settings
	);

	// Map rows from server-driven summary: expected fields: item, amount, date
	const rows = (data?.data || []).map((r: any, idx: number) => [
		(idx + 1).toString(),
		format(new Date(r.date || r.createdAt || Date.now()), 'dd-MM-yyyy'),
		formatCurrencyPDF(r.amount ?? r.total ?? 0),
	]);

	const totalAll = (data?.data || []).reduce(
		(sum: number, r: any) => sum + (r.amount ?? r.total ?? 0),
		0
	);

	rows.push(['', 'Total:', formatCurrencyPDF(totalAll)]);

	autoTable(doc, {
		head: [['#', 'Date', 'Total']],
		body: rows,
		startY: yPos,
		margin: { left: 20, right: 20 },
		...getDefaultTableStyles(),
		columnStyles: {
			0: { cellWidth: 12 },
			1: {},
			2: { halign: 'right' },
		},
	});

	addPageNumbers(doc);
	return doc.output('blob');
};
