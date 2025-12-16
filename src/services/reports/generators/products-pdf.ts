import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
	addCompanyHeader,
	getDefaultTableStyles,
	formatCurrencyPDF,
	addPageNumbers,
} from '../pdf-utils';
import type { ProductsReport, ProductDetailsReport } from '@/types/reports';
import { format } from 'date-fns';

// Products Report PDF
export const generateProductsPDF = (
	data: ProductsReport,
	settings?: any
): Blob => {
	const doc = new jsPDF();

	// Add company header
	let yPos = addCompanyHeader(
		doc,
		'Price List',
		undefined,
		undefined,
		settings,
		false
	);

	// Products table
	const tableData = data.data.map((product, index) => [
		(index + 1).toString(),
		product.name,
		formatCurrencyPDF(product.price),
	]);

	autoTable(doc, {
		head: [['#', 'Product Name', 'Sell Price']],
		body: tableData,
		startY: yPos,
		...getDefaultTableStyles(),
		columnStyles: {
			0: { cellWidth: 60 }, // Narrow # column
			//1: { cellWidth: "auto", halign:"center" }, // Wider Product Name column
			2: { halign: 'right' }, // Right-align Sell Price column
		},
		didParseCell: function (data: any) {
			// Right-align Sell Price header (column 2)
			if (data.section === 'head' && data.column.index === 2 ) {
				data.cell.styles.halign = 'right';
			}
		},
	});

	// Add generated date at bottom
	const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
	addPageNumbers(doc);

	return doc.output('blob');
};

// Product Details Report PDF
export const generateProductDetailsPDF = (
	data: ProductDetailsReport,
	settings?: any
): Blob => {
	const doc = new jsPDF();

	// Add company header
	let yPos = addCompanyHeader(
		doc,
		'Product Details Report',
		undefined,
		undefined,
		settings,
		false
	);

	// Product details table
	const tableData = data.data.map((product, index) => [
		(index + 1).toString(),
		product.name,
		formatCurrencyPDF(product.price),
		formatCurrencyPDF(product.averageProductionCost),
		formatCurrencyPDF(product.profit),
	]);

	autoTable(doc, {
		head: [['#', 'Product Name', 'Price', 'Cost', 'Profit']],
		body: tableData,
		startY: yPos,
		...getDefaultTableStyles(),
		columnStyles: {
			2: { halign: 'right' }, // Right-align Price column
			3: { halign: 'right' }, // Right-align Cost column
			4: { halign: 'right' }, // Right-align Profit column
		},

		didParseCell: function (data: any) {
			// Right-align Price header (column 2)
			if (
				(data.section === 'head' && data.column.index === 2) ||
				data.column.index === 3 ||
				data.column.index === 4
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

// Product Current Stock Report PDF - simplified columns
export const generateProductCurrentStockPDF = (
	data: ProductsReport,
	settings?: any
): Blob => {
	const doc = new jsPDF();

	// Add company header
	const yPos = addCompanyHeader(
		doc,
		'Products Current Stock Report',
		undefined,
		undefined,
		settings,
		false
	);

	// Build table rows with simplified columns: #, name, qty, price
	const tableData = data.data.map((product, index) => [
		(index + 1).toString(),
		product.name || '',
		product.quantity?.toString() || '0',
		formatCurrencyPDF(product.price),
	]);

	autoTable(doc, {
		head: [['#', 'Product Name', 'Quantity', 'Price']],
		body: tableData,
		startY: yPos,
		...getDefaultTableStyles(),
		columnStyles: {
			0: { cellWidth: 45 }, // Narrow # column
			2: { halign: 'right' }, // Right-align Quantity column
			3: { cellWidth:40 , halign: 'right' }, // Right-align Price column
		},
		didParseCell: function (data: any) {
			// Right-align Quantity and Price headers
			if (
				data.section === 'head' &&
				(data.column.index === 2 || data.column.index === 3)
			) {
				data.cell.styles.halign = 'right';
			}
		},
	});

	addPageNumbers(doc);
	return doc.output('blob');
};

// Expenses Report PDF
export const generateExpensesPDF = (
	data: any,
	startDate?: string,
	endDate?: string,
	settings?: any
): Blob => {
	const doc = new jsPDF();

	// Add company header
	let yPos = addCompanyHeader(
		doc,
		'Expenses Report',
		startDate,
		endDate,
		settings
	);

	// Expenses table
	const expensesArray = Array.isArray(data) ? data : data.data || [];
	const tableData = expensesArray.map((expense: any, index: number) => [
		(index + 1).toString(),
		format(expense.date, 'dd-MM-yyy'), // Format date
		expense.expenseCategory?.name || 'Unknown',
		formatCurrencyPDF(expense.amount),
		expense.paymentMethod?.replace('_', ' ').toUpperCase() || 'CASH',
		// expense.notes || '',
		//expense.createdBy?.name || 'Unknown',
		expense.updatedBy?.name || 'N/A',
	]);

	// Calculate total
	const totalExpenses =
		expensesArray.reduce(
			(sum: number, expense: any) => sum + expense.amount,
			0
		) || 0;

	// Add summary row to table
	tableData.push([
		'',
		'',
		'',
		'',
		'Total Expenses:',
		formatCurrencyPDF(totalExpenses),
	]);

	autoTable(doc, {
		head: [['#', 'Date', 'Category', 'Amount', 'Payment Method', 'Updated By']],
		body: tableData,
		startY: yPos,
		...getDefaultTableStyles(),
		columnStyles: {
			2: { cellWidth: 25 }, // Reduce Category column width
			3: { halign: 'right' }, // Right-align Amount column
		},
		headStyles: {
			...getDefaultTableStyles().headStyles,
			halign: 'left', // Keep other headers left-aligned
		},
		didParseCell: function (data: any) {
			// Right-align Amount header
			if (data.section === 'head' && data.column.index === 3) {
				data.cell.styles.halign = 'right';
			}
			// Style summary row
			if (data.section === 'body' && data.row.index === tableData.length - 1) {
				data.cell.styles.fontStyle = 'bold';
			}
		},
	});

	// Summary (after table) - positioned bottom right of table
	const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
	const pageWidth = doc.internal.pageSize.getWidth();

	// Position summary at bottom right of table area
	let summaryY = finalY + 10;

	doc.setFontSize(12);
	doc.setFont('helvetica', 'normal');

	return doc.output('blob');
};
