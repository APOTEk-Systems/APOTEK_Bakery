import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import {
	addCompanyHeader,
	getDefaultTableStyles,
	formatCurrencyPDF,
	addPageNumbers,
} from '../pdf-utils';
import type { ProductionSummaryReport } from '@/types/reports';

// Production (Finished Goods) Summary Report PDF
export const generateProductionSummaryPDF = (
	data: ProductionSummaryReport,
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

	// Map rows from server-driven summary: expected fields: date, product, quantity
	const rows = (data?.data || []).map((r: ProductionSummaryReport['data'][number], idx: number) => [
		(idx + 1).toString(),
		format(new Date(r.date || r.createdAt || Date.now()), 'dd-MM-yyyy'),
		r.product ?? r.item ?? 'Unknown',
		(r.quantity ?? r.produced ?? r.total ?? 0).toString(),
	]);

	const totalAll = (data?.data || []).reduce(
		(sum: number, r: ProductionSummaryReport['data'][number]) => sum + (r.quantity ?? r.produced ?? r.total ?? 0),
		0
	);

	// rows.push(['', '', 'Total:', totalAll.toString() + " units"]);

	autoTable(doc, {
		head: [['#', 'Date', 'Product', 'Quantity']],
		body: rows,
		startY: yPos,
		margin: { left: 20, right: 20 },
		...getDefaultTableStyles(),
		columnStyles: {
			0: { cellWidth: 15 },
			1: {cellWidth: 50 },
			2: {},
			3: { halign: 'right' },
		},
		didParseCell: function (dataItem: any) {
			if (
				dataItem.section === 'head' &&
				dataItem.column.index === 3){
				dataItem.cell.styles.halign = 'right';
				}

			if(dataItem.section === 'body' && dataItem.row.index === rows.length -1){
				dataItem.cell.styles.fontStyle = 'bold';
			}
    },
			
	});

	addPageNumbers(doc);
	return doc.output('blob');
};
