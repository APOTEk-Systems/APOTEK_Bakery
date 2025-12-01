import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import {
	addCompanyHeader,
	getDefaultTableStyles,
	formatCurrencyPDF,
	addPageNumbers,
} from '../pdf-utils';
import type { IngredientSummaryReport } from '@/types/reports';

// Ingredient Usage Summary Report PDF
export const generateIngredientSummaryPDF = (
	data: IngredientSummaryReport | any,
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

	// Map rows from server-driven summary: expected fields: date, ingredient, quantity
	const rows = (data?.data || []).map((r: any, idx: number) => [
		(idx + 1).toString(),
		format(new Date(r.date || r.createdAt || Date.now()), 'dd-MM-yyyy'),
		r.ingredient ?? r.item ?? 'Unknown',
		(r.quantity ?? r.amount ?? r.total ?? 0).toFixed(2) + ' ' + (r.unit || ''),
	]);

	
	autoTable(doc, {
		head: [['#', 'Date', 'Ingredient', 'Quantity']],
		body: rows,
		startY: yPos,
		margin: { left: 20, right: 20 },
		...getDefaultTableStyles(),
		columnStyles: { 0: { cellWidth: 12 }, 1: {}, 2: {}, 3: { halign: 'right' } },
		didParseCell: function (dataItem: any) {
			if (
				dataItem.section === 'head' &&
				dataItem.column.index === 3){
				dataItem.cell.styles.halign = 'right';
				}
			}
	});

	addPageNumbers(doc);
	return doc.output('blob');
};
