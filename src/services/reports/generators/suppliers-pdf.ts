import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
	addCompanyHeader,
	getDefaultTableStyles,
	addPageNumbers,
} from '../pdf-utils';
import type { Supplier } from '@/services/suppliers';

export const generateSuppliersPDF = (
	suppliers: Supplier[],
	settings?: any
): Blob => {
	const doc = new jsPDF();

	// Add company header. No dates here (explicit requirement)
	let yPos = addCompanyHeader(
		doc,
		'List of Suppliers',
		undefined,
		undefined,
		settings,
		false
	);

	// Build table body — include a constructed API endpoint value as requested
	const tableData = suppliers.map((s, idx) => [
		(idx + 1).toString(),
		s.name || '',
		s.contactInfo || '',
		// s.email || '',
		s.address || '',
		s.status || '',
		// s.createdAt ? new Date(s.createdAt).toLocaleString() : '',
		// s.updatedAt ? new Date(s.updatedAt).toLocaleString() : '',
		// `/api/suppliers/${s.id}`,
		// JSON.stringify(s),
	]);

	autoTable(doc, {
		head: [
			[
				'#',
				'Name',
				'Contact',
				//'Email',
				'Address',
				'Status',
				// 'Created At',
				// 'Updated At',
				// 'API Endpoint',
				// 'Details (JSON)',
			],
		],
		body: tableData,
		startY: yPos,
		...getDefaultTableStyles(),
		columnStyles: {
			
			// Keep API endpoint column flexible
		},
	});

	addPageNumbers(doc);
	return doc.output('blob');
};
