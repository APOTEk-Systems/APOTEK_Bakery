import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import {
	addCompanyHeader,
	getDefaultTableStyles,
	formatCurrencyPDF,
	addPageNumbers,
} from '../pdf-utils';
import type { FinishedGoodsSummaryReport } from '@/types/reports';

// Production (Finished Goods) Summary Report PDF
export const generateProductionSummaryPDF = (
	data: FinishedGoodsSummaryReport | any,
	startDate?: string,
	endDate?: string,
	settings?: unknown
): Blob => {
	const doc = new jsPDF();

	const yPos = addCompanyHeader(
		doc,
		'Production Summary Report',
		startDate,
		endDate,
		settings
	);

	// Map rows from server-driven summary: expected fields: item, produced, date
	const rows = (data?.data || []).map((r: any, idx: number) => [
		(idx + 1).toString(),
		format(new Date(r.date || r.createdAt || Date.now()), 'dd-MM-yyyy'),
		// Prefer numeric produced, else fallback to sold or remaining or 0
		formatCurrencyPDF(r.produced ?? r.total ?? r.sold ?? 0),
	]);

	const totalAll = (data?.data || []).reduce(
		(sum: number, r: any) => sum + (r.produced ?? r.total ?? r.sold ?? 0),
		0
	);

	rows.push(['', 'Total:', formatCurrencyPDF(totalAll)]);

	autoTable(doc, {
		head: [['#', 'Date', 'Total']],
		body: rows,
		startY: yPos,
		margin: { left: 20, right: 20 },
		...getDefaultTableStyles(),
		columnStyles: { 0: { cellWidth: 12 }, 1: {}, 2: { halign: 'right' } },
	});

	addPageNumbers(doc);
	return doc.output('blob');
};
