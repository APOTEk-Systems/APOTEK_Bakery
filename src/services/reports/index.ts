import { api } from '@/lib/api';

// Main reports service - re-exports from sub-modules for backward compatibility

// Import types
export type {
	SalesReport,
	SalesReturnsReport,
	SalesSummaryReport,
	PurchasesReport,
	ProductionReport,
	InventoryReport,
	InventoryAdjustmentsReport,
	ProductAdjustmentsReport,
	LowStockReport,
	OutOfStockReport,
	FinancialReport,
	CustomerSalesReport,
	SupplierWisePurchasesReport,
	IngredientPurchaseTrendReport,
	FinishedGoodsSummaryReport,
	IngredientUsageReport,
	ProfitAndLossReport,
	ExpenseBreakdownReport,
	ProductsReport,
	ProductDetailsReport,
} from '@/types/reports';

// Import data fetching functions
import {
	getSalesReport,
	getSalesReturnsReport,
	getPurchasesReport,
	getProductionReport,
	getInventoryReport,
	getInventoryAdjustmentsReport,
	getProductAdjustmentsReport,
	getLowStockReport,
	getOutOfStockReport,
	getFinancialReport,
	getCustomerSalesReport,
	getSupplierWisePurchasesReport,
	getIngredientPurchaseTrendReport,
	getFinishedGoodsSummaryReport,
	getProductionSummaryReport,
	getIngredientSummaryReport,
	getIngredientUsageReport,
	getProfitAndLossReport,
	getExpenseBreakdownReport,
	getProductsReport,
	getProductDetailsReport,
	getPurchaseOrderSummaryReport,
	getPurchaseOrderDetailedForSummary,
	getSuppliersReport,
	getGoodsReceivedReport,
	getProductionSummary,
	getExpensesReport,
	getOutstandingPaymentsReport,
	getPurchaseOrderDetailedReport,
	getSalesSummaryReport,
	getCashSalesSummaryReport,
	getCreditSummaryReport,
	getCreditPaymentReport,
	getNetProfitReport,
} from './data';

// Import PDF utilities
import {
	addCompanyHeader,
	testPDFGeneration,
	getDefaultTableStyles,
	formatCurrencyPDF,
	formatDatePDF,
} from './pdf-utils';

// Re-export for external use
import {
	generateProductsPDF,
	generateProductDetailsPDF,
	generateProductCurrentStockPDF,
} from './generators/products-pdf';
import { generatePurchaseSummaryPDF } from './generators/purchase-summary-pdf';

// Re-export PDF generators (grouped) consolidated later in the file

// (Exports consolidated later in the file)

// Import PDF generators
import {
	generateSalesPDF,
	generateCashSalesPDF,
	generateCreditSalesPDF,
} from './generators/sales-pdf';

import { generateSalesSummaryPDF } from './generators/sales-summary-pdf';
import { generateCreditSalesSummaryPDF } from './generators/credit-sales-summary-pdf';
import { generateCashSalesSummaryPDF } from './generators/cash-sales-summary-pdf';
import { generateProductionSummaryPDF } from './generators/production-summary-pdf';
import { generateIngredientSummaryPDF } from './generators/ingredient-summary-pdf';

import {
	generatePurchasesPDF,
	generateSupplierWisePurchasesPDF,
	generateGoodsReceivedPDF,
	generatePurchaseOrderDetailedPDF,
} from './generators/purchases-pdf';

import {
	generateProductionPDF,
	generateFinishedGoodsSummaryPDF,
	generateIngredientUsagePDF,
} from './generators/production-pdf';

import {
	generateInventoryPDF,
	generateInventoryAdjustmentsPDF,
	generateProductAdjustmentsPDF,
	generateLowStockPDF,
	generateOutOfStockPDF,
} from './generators/inventory-pdf';

import {
	generateFinancialPDF,
	generateProfitAndLossPDF,
	generateGrossProfitPDF,
	generateNetProfitPDF,
	generateExpenseBreakdownPDF,
	generateExpensesPDF,
	generateOutstandingPaymentsPDF,
} from './generators/financial-pdf';

import { generateCreditPaymentPDF } from './generators/credit-payment-pdf';
import { generateReceiptPDF } from './generators/receipt-pdf';
import { generateSalesReturnsPDF } from './generators/sales-returns-pdf';

// NOTE: generators already imported above
import { generateSuppliersPDF } from './generators/suppliers-pdf';

// Re-export data fetchers, utilities, and PDF generators (single list)
export {
	// data fetchers
	getSalesReport,
	getSalesReturnsReport,
	getPurchasesReport,
	getPurchaseOrderSummaryReport,
	getProductionReport,
	getInventoryReport,
	getInventoryAdjustmentsReport,
	getProductAdjustmentsReport,
	getLowStockReport,
	getOutOfStockReport,
	getFinancialReport,
	getCustomerSalesReport,
	getSupplierWisePurchasesReport,
	getIngredientPurchaseTrendReport,
	getFinishedGoodsSummaryReport,
	getSuppliersReport,
	getIngredientUsageReport,
	getProfitAndLossReport,
	getExpenseBreakdownReport,
	getProductsReport,
	getProductDetailsReport,
	getGoodsReceivedReport,
	getProductionSummary,
	getProductionSummaryReport,
	getIngredientSummaryReport,
	getExpensesReport,
	getOutstandingPaymentsReport,
	getPurchaseOrderDetailedReport,

	// utilities
	addCompanyHeader,
	testPDFGeneration,
	getDefaultTableStyles,
	formatCurrencyPDF,
	formatDatePDF,

	// PDF generators
	generateSalesPDF,
	generateSalesSummaryPDF,
	generateCashSalesSummaryPDF,
	generateCreditSalesSummaryPDF,
	generateCashSalesPDF,
	generateCreditSalesPDF,
	generatePurchasesPDF,
	generateSupplierWisePurchasesPDF,
	generateGoodsReceivedPDF,
	generatePurchaseOrderDetailedPDF,
	generateProductionPDF,
	generateFinishedGoodsSummaryPDF,
	generateIngredientUsagePDF,
	generateInventoryPDF,
	generateInventoryAdjustmentsPDF,
	generateProductAdjustmentsPDF,
	generateLowStockPDF,
	generateOutOfStockPDF,
	generateFinancialPDF,
	generateProfitAndLossPDF,
	generateGrossProfitPDF,
	generateNetProfitPDF,
	generateExpenseBreakdownPDF,
	generateProductsPDF,
	generateProductDetailsPDF,
	generateProductCurrentStockPDF,
	generateSuppliersPDF,
	generatePurchaseSummaryPDF,
	generateExpensesPDF,
	generateCreditPaymentPDF,
	generateSalesReturnsPDF,
};

// Type for the reports service
export type ReportsServiceType = typeof reportsService;

// Legacy service object for backward compatibility
export const reportsService = {
	// Helper functions
	addCompanyHeader: addCompanyHeader,
	testPDFGeneration: testPDFGeneration,

	// Data fetching functions
	getSalesReport: getSalesReport,
	getSalesReturnsReport: getSalesReturnsReport,
	getPurchasesReport: getPurchasesReport,
	getProductionReport: getProductionReport,
	getInventoryReport: getInventoryReport,
	getInventoryAdjustmentsReport: getInventoryAdjustmentsReport,
	getProductAdjustmentsReport: getProductAdjustmentsReport,
	getLowStockReport: getLowStockReport,
	getOutOfStockReport: getOutOfStockReport,
	getFinancialReport: getFinancialReport,
	getCustomerSalesReport: getCustomerSalesReport,
	getSupplierWisePurchasesReport: getSupplierWisePurchasesReport,
	getIngredientPurchaseTrendReport: getIngredientPurchaseTrendReport,
	getFinishedGoodsSummaryReport: getFinishedGoodsSummaryReport,
	getIngredientUsageReport: getIngredientUsageReport,
	getProfitAndLossReport: getProfitAndLossReport,
	getExpenseBreakdownReport: getExpenseBreakdownReport,
	getProductsReport: getProductsReport,
	getProductDetailsReport: getProductDetailsReport,
	getGoodsReceivedReport: getGoodsReceivedReport,
	getProductionSummary: getProductionSummary,
	getExpensesReport: getExpensesReport,
	getOutstandingPaymentsReport: getOutstandingPaymentsReport,
	getCreditPaymentReport: getCreditPaymentReport,

	// PDF export functions
	exportSalesReport: async (
		startDate?: string,
		endDate?: string,
		type?: 'all' | 'cash' | 'credit'
	): Promise<Blob> => {
		console.log('📊 Starting sales report export...', {
			startDate,
			endDate,
			type,
		});
		try {
			const data = await getSalesReport(startDate, endDate, type);
			console.log('✅ Sales data fetched successfully:', data);

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateSalesPDF(data, startDate, endDate, settings);
			console.log('📄 Sales PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting sales report:', error);
			throw error;
		}
	},

	exportSalesSummaryReport: async (
		startDate?: string,
		endDate?: string
	): Promise<Blob> => {
		console.log('📊 Starting sales summary report export...', {
			startDate,
			endDate,
		});
		try {
			const data = await getSalesSummaryReport(startDate, endDate);
			console.log('✅ Sales data fetched successfully for summary:', data);

			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateSalesSummaryPDF(
				data,
				startDate,
				endDate,
				settings
			);
			console.log('📄 Sales summary PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting sales summary report:', error);
			throw error;
		}
	},

	exportCashSalesSummaryReport: async (
		startDate?: string,
		endDate?: string
	): Promise<Blob> => {
		console.log('📊 Starting cash sales summary report export...', {
			startDate,
			endDate,
		});
		try {
			const data = await getCashSalesSummaryReport(startDate, endDate);
			console.log('✅ Cash sales summary data fetched successfully:', data);

			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateCashSalesSummaryPDF(
				data,
				startDate,
				endDate,
				settings
			);
			console.log('📄 Cash sales summary PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting cash sales summary report:', error);
			throw error;
		}
	},

	exportCreditPaymentReport: async (
		startDate?: string,
		endDate?: string,
		customerId?: number
	): Promise<Blob> => {
		console.log('📊 Starting credit payment report export...', {
			startDate,
			endDate,
			customerId,
		});
		try {
			const data = await getCreditPaymentReport(startDate, endDate, customerId);
			console.log('✅ Credit payment data fetched successfully:', data);

			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateCreditPaymentPDF(
				data,
				startDate,
				endDate,
				settings
			);
			console.log('📄 Credit payment PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting credit payment report:', error);
			throw error;
		}
	},

	exportCreditSalesSummaryReport: async (
		startDate?: string,
		endDate?: string
	): Promise<Blob> => {
		console.log('📊 Starting credit sales summary report export...', {
			startDate,
			endDate,
		});
		try {
			const data = await getCreditSummaryReport(startDate, endDate);
			console.log('✅ Credit sales summary data fetched successfully:', data);

			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateCreditSalesSummaryPDF(
				data,
				startDate,
				endDate,
				settings
			);
			console.log('📄 Credit sales summary PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting credit sales summary report:', error);
			throw error;
		}
	},

	exportPurchasesReport: async (
		startDate?: string,
		endDate?: string
	): Promise<Blob> => {
		console.log('📊 Starting purchases report export...', {
			startDate,
			endDate,
		});
		try {
			const data = await getPurchasesReport(startDate, endDate);
			console.log('✅ Purchases data fetched successfully:', data);

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generatePurchasesPDF(data, startDate, endDate, settings);
			console.log('📄 Purchases PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting purchases report:', error);
			throw error;
		}
	},

	exportPurchaseOrderSummaryReport: async (
		startDate?: string,
		endDate?: string,
		supplier?: string
	): Promise<Blob> => {
		console.log('📊 Starting purchase order summary report export...', {
			startDate,
			endDate,
			supplier,
		});
		try {
			const data = await getPurchaseOrderDetailedForSummary(startDate, endDate, supplier);
			console.log('✅ Purchase summary fetched successfully:', data);

			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generatePurchaseSummaryPDF(data, startDate, endDate, settings, supplier);
			console.log('📄 Purchase order summary PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting purchase order summary report:', error);
			throw error;
		}
	},

	exportProductionReport: async (
		startDate?: string,
		endDate?: string
	): Promise<Blob> => {
		console.log('📊 Starting production report export...', {
			startDate,
			endDate,
		});
		try {
			const data = await getProductionReport(startDate, endDate);
			console.log('✅ Production data fetched successfully:', data);

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateProductionPDF(data, startDate, endDate, settings);
			console.log('📄 Production PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting production report:', error);
			throw error;
		}
	},

	exportInventoryReport: async (
		type?: 'raw_material' | 'supplies'
	): Promise<Blob> => {
		console.log('📊 Starting inventory report export...', { type });
		try {
			const params = type ? { type } : {};
			const inventoryItems = await import('@/services/inventory').then((m) =>
				m.inventoryService.getInventory(params)
			);

			// Additional client-side filtering to ensure correct type
			let filteredItems = inventoryItems;
			if (type) {
				filteredItems = inventoryItems.filter((item) => item.type === type);
			}

			const totalValue = filteredItems.reduce(
				(sum, item) => sum + item.currentQuantity * item.cost,
				0
			);
			const lowStockItems = filteredItems.filter(
				(item) => item.currentQuantity <= item.minLevel
			).length;

			const data = {
				data: {
					inventoryItem: filteredItems,
					totalValue,
					lowStockItems,
				},
			};
			console.log('✅ Inventory data fetched successfully:', data);

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateInventoryPDF(data, type, settings);
			console.log('📄 Inventory PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting inventory report:', error);
			throw error;
		}
	},

	exportInventoryAdjustmentsReport: async (
		startDate?: string,
		endDate?: string,
		type?: 'raw_material' | 'supplies'
	): Promise<Blob> => {
		console.log('📊 Starting inventory adjustments report export...', {
			startDate,
			endDate,
			type,
		});
		try {
			const params = {
				startDate,
				endDate,
				...(type && { type }),
			};
			const adjustments = await import('@/services/inventory').then((m) =>
				m.inventoryService.getAdjustments(params)
			);

			if (adjustments.adjustments.length === 0) {
				throw new Error(
					`No adjustments found${
						type
							? ` for ${type === 'raw_material' ? 'materials' : 'supplies'}`
							: ''
					}${startDate && endDate ? ` in the selected date range` : ''}`
				);
			}

			const data = {
				data: {
					adjustments: adjustments.adjustments,
					total: adjustments.total,
				},
			};
			console.log('✅ Inventory adjustments data fetched successfully:', data);

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateInventoryAdjustmentsPDF(
				data,
				startDate,
				endDate,
				type,
				settings
			);
			console.log('📄 Inventory adjustments PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting inventory adjustments report:', error);
			if (error.message && error.message.includes('No adjustments found')) {
				// Return a resolved promise with null to indicate no PDF was generated
				return Promise.resolve(null as any);
			}
			throw error;
		}
	},

	exportProductAdjustmentsReport: async (
		startDate?: string,
		endDate?: string
	): Promise<Blob> => {
		console.log('📊 Starting product adjustments report export...', {
			startDate,
			endDate,
		});
		try {
			const data = await getProductAdjustmentsReport(startDate, endDate);
			console.log('✅ Product adjustments data fetched successfully:', data);

			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateProductAdjustmentsPDF(
				data,
				startDate,
				endDate,
				settings
			);
			console.log('📄 Product adjustments PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting product adjustments report:', error);
			throw error;
		}
	},

	exportLowStockReport: async (
		type?: 'raw_material' | 'supplies'
	): Promise<Blob> => {
		console.log('📊 Starting low stock report export...', { type });
		try {
			const params = type ? { type } : {};
			const allItems = await import('@/services/inventory').then((m) =>
				m.inventoryService.getInventory(params)
			);
			const lowStockItems = allItems.filter((item: any) => {
				return item.currentQuantity <= item.minLevel;
			});

			if (lowStockItems.length === 0) {
				throw new Error(
					`No items found below minimum stock level${
						type
							? ` for ${type === 'raw_material' ? 'materials' : 'supplies'}`
							: ''
					}`
				);
			}

			const data = {
				data: {
					inventoryItem: lowStockItems,
				},
			};
			console.log('✅ Low stock data fetched successfully:', data);

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateLowStockPDF(data, type, settings);
			console.log('📄 Low stock PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting low stock report:', error);
			if (
				error.message &&
				error.message.includes('No items found below minimum stock level')
			) {
				// Return a resolved promise with null to indicate no PDF was generated
				return Promise.resolve(null as any);
			}
			throw error;
		}
	},

	exportOutOfStockReport: async (
		type?: 'raw_material' | 'supplies'
	): Promise<Blob> => {
		console.log('📊 Starting out of stock report export...', { type });
		try {
			const params = type ? { type } : {};
			const allItems = await import('@/services/inventory').then((m) =>
				m.inventoryService.getInventory(params)
			);
			const outOfStockItems = allItems.filter((item: any) => {
				return item.currentQuantity <= 0;
			});

			if (outOfStockItems.length === 0) {
				throw new Error(
					`No out of stock items found${
						type
							? ` for ${type === 'raw_material' ? 'materials' : 'supplies'}`
							: ''
					}`
				);
			}

			const data = {
				data: {
					inventoryItem: outOfStockItems,
				},
			};
			console.log('✅ Out of stock data fetched successfully:', data);

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateOutOfStockPDF(data, type, settings);
			console.log('📄 Out of stock PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting out of stock report:', error);
			if (
				error.message &&
				error.message.includes('No out of stock items found')
			) {
				// Return a resolved promise with null to indicate no PDF was generated
				return Promise.resolve(null as any);
			}
			throw error;
		}
	},

	exportFinancialReport: async (
		startDate?: string,
		endDate?: string
	): Promise<Blob> => {
		console.log('📊 Starting financial report export...', {
			startDate,
			endDate,
		});
		try {
			const data = await getFinancialReport(startDate, endDate);
			console.log('✅ Financial data fetched successfully:', data);

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateFinancialPDF(data, startDate, endDate, settings);
			console.log('📄 Financial PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting financial report:', error);
			throw error;
		}
	},

	exportProfitAndLossReport: async (
		startDate?: string,
		endDate?: string
	): Promise<Blob> => {
		console.log('📊 Starting profit and loss report export...', {
			startDate,
			endDate,
		});
		try {
			const data = await getProfitAndLossReport(startDate, endDate);
			console.log('✅ Profit and loss data fetched successfully:', data);

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateProfitAndLossPDF(
				data,
				startDate,
				endDate,
				settings
			);
			console.log('📄 Profit and loss PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting profit and loss report:', error);
			throw error;
		}
	},

	exportExpenseBreakdownReport: async (
		startDate?: string,
		endDate?: string
	): Promise<Blob> => {
		console.log('📊 Starting expense breakdown report export...', {
			startDate,
			endDate,
		});
		try {
			const data = await getExpenseBreakdownReport(startDate, endDate);
			console.log('✅ Expense breakdown data fetched successfully:', data);

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateExpenseBreakdownPDF(
				data,
				startDate,
				endDate,
				settings
			);
			console.log('📄 Expense breakdown PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting expense breakdown report:', error);
			throw error;
		}
	},

	exportProductsReport: async (): Promise<Blob> => {
		console.log('📊 Starting products report export...');
		try {
			const data = await getProductsReport();
			console.log('✅ Products data fetched successfully:', data);

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateProductsPDF(data, settings);
			console.log('📄 Products PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting products report:', error);
			throw error;
		}
	},

	exportProductsCurrentStockReport: async (): Promise<Blob> => {
		console.log('📊 Starting products current stock report export...');
		try {
			const data = await getProductsReport();
			console.log('✅ Products data fetched successfully (current stock):', data);

			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateProductCurrentStockPDF(data, settings);
			console.log('📄 Products current stock PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting products current stock report:', error);
			throw error;
		}
	},

	exportProductDetailsReport: async (): Promise<Blob> => {
		console.log('📊 Starting product details report export...');
		try {
			const data = await getProductDetailsReport();
			console.log('✅ Product details data fetched successfully:', data);

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateProductDetailsPDF(data, settings);
			console.log('📄 Product details PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting product details report:', error);
			throw error;
		}
	},

	exportSuppliersReport: async (): Promise<Blob> => {
		console.log('📊 Starting suppliers list export...');
		try {
			const data = await getSuppliersReport();
			console.log('✅ Suppliers data fetched successfully:', data);

			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateSuppliersPDF(data.data, settings);
			console.log('📄 Suppliers PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting suppliers report:', error);
			throw error;
		}
	},

	exportGoodsReceivedReport: async (
		startDate?: string,
		endDate?: string,
		supplier?: string
	): Promise<Blob> => {
		console.log('📊 Starting goods received report export...', {
			startDate,
			endDate,
			supplier,
		});
		try {
			const data = await getGoodsReceivedReport(startDate, endDate, supplier);
			console.log('✅ Goods received data fetched successfully:', data);

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateGoodsReceivedPDF(
				data,
				startDate,
				endDate,
				settings
			);
			console.log('📄 Goods received PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting goods received report:', error);
			throw error;
		}
	},

	exportCashSalesReport: async (
		startDate?: string,
		endDate?: string
	): Promise<Blob> => {
		console.log('📊 Starting cash sales report export...', {
			startDate,
			endDate,
		});
		try {
			const data = await getSalesReport(startDate, endDate, 'cash');
			console.log('✅ Cash sales data fetched successfully:', data);

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateCashSalesPDF(data, startDate, endDate, settings);
			console.log('📄 Cash sales PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting cash sales report:', error);
			throw error;
		}
	},

	exportCreditSalesReport: async (
		startDate?: string,
		endDate?: string
	): Promise<Blob> => {
		console.log('📊 Starting credit sales report export...', {
			startDate,
			endDate,
		});
		try {
			const data = await getSalesReport(startDate, endDate, 'credit');
			console.log('✅ Credit sales data fetched successfully:', data);

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateCreditSalesPDF(
				data,
				startDate,
				endDate,
				settings
			);
			console.log('📄 Credit sales PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting credit sales report:', error);
			throw error;
		}
	},

	// Removed cash/credit sales summary; prefer using server-side summary endpoint and single generator

	exportSupplierWisePurchasesReport: async (
		startDate?: string,
		endDate?: string
	): Promise<Blob> => {
		console.log('📊 Starting supplier-wise purchases report export...', {
			startDate,
			endDate,
		});
		try {
			const data = await getSupplierWisePurchasesReport(startDate, endDate);
			console.log(
				'✅ Supplier-wise purchases data fetched successfully:',
				data
			);

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateSupplierWisePurchasesPDF(
				data,
				startDate,
				endDate,
				settings
			);
			console.log('📄 Supplier-wise purchases PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error(
				'❌ Error exporting supplier-wise purchases report:',
				error
			);
			throw error;
		}
	},

	exportFinishedGoodsSummaryReport: async (
		startDate?: string,
		endDate?: string
	): Promise<Blob> => {
		console.log('📊 Starting products summary report export...', {
			startDate,
			endDate,
		});
		try {
			const data = await getFinishedGoodsSummaryReport(startDate, endDate);
			console.log('✅ Finished goods summary data fetched successfully:', data);

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateFinishedGoodsSummaryPDF(
				data,
				startDate,
				endDate,
				settings
			);
			console.log('📄 Finished goods summary PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting products summary report:', error);
			throw error;
		}
	},

	exportProductionSummaryReport: async (
		startDate?: string,
		endDate?: string
	): Promise<Blob> => {
		console.log('📊 Starting production summary report export...', {
			startDate,
			endDate,
		});
		try {
			const data = await getProductionSummaryReport(startDate, endDate);
			console.log('✅ Production summary data fetched successfully:', data);

			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateProductionSummaryPDF(
				data,
				startDate,
				endDate,
				settings
			);
			console.log('📄 Production summary PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting production summary report:', error);
			throw error;
		}
	},

	exportIngredientSummaryReport: async (
		startDate?: string,
		endDate?: string
	): Promise<Blob> => {
		console.log('📊 Starting ingredient summary report export...', {
			startDate,
			endDate,
		});
		try {
			const data = await getIngredientSummaryReport(startDate, endDate);
			console.log('✅ Ingredient summary data fetched successfully:', data);

			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateIngredientSummaryPDF(
				data,
				startDate,
				endDate,
				settings
			);
			console.log('📄 Ingredient summary PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting ingredient summary report:', error);
			throw error;
		}
	},

	exportIngredientUsageReport: async (
		startDate?: string,
		endDate?: string
	): Promise<Blob> => {
		console.log('📊 Starting ingredient usage report export...', {
			startDate,
			endDate,
		});
		try {
			const data = await getIngredientUsageReport(startDate, endDate);
			console.log('✅ Ingredient usage data fetched successfully:', data);

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateIngredientUsagePDF(
				data,
				startDate,
				endDate,
				settings
			);
			console.log('📄 Ingredient usage PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting ingredient usage report:', error);
			throw error;
		}
	},

	exportGrossProfitReport: async (
		startDate?: string,
		endDate?: string
	): Promise<Blob> => {
		console.log('📊 Starting gross profit report export...', {
			startDate,
			endDate,
		});
		try {
			console.log('🔍 Making API call to /reports/gross-profit...');
			const response = await api.get(`/reports/gross-profit?startDate=${startDate || ''}&endDate=${endDate || ''}`);
			console.log('✅ API response received:', response.data);
			
			const reportData = response.data;
			console.log('📊 Report data prepared:', reportData);
			
			// Pass the report data directly - it contains dailyData which the PDF generator expects
			// Backend returns: { data: { dailyData: [...], summary: {...} } }
			
			// Fetch settings for company header
			let settings;
			try {
				console.log('🏢 Fetching company settings...');
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
				console.log('✅ Settings fetched successfully');
			} catch (error) {
				console.warn('⚠️ Could not fetch settings for PDF header:', error);
			}

			console.log('📄 Calling generateGrossProfitPDF...');
			const pdfBlob = generateGrossProfitPDF(
				reportData, // Pass the report data directly
				startDate,
				endDate,
				settings
			);
			console.log('✅ Gross profit PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting gross profit report:', error);
			throw error;
		}
	},

	exportNetProfitReport: async (
		startDate?: string,
		endDate?: string
	): Promise<Blob> => {
		console.log('📊 Starting net profit report export...', {
			startDate,
			endDate,
		});
		try {
			const response = await api.get(`/reports/net-profit?startDate=${startDate || ''}&endDate=${endDate || ''}`);
			const backendData = response.data;
			console.log('✅ Net profit data fetched successfully:', backendData);

			// Pass the backend data directly - the PDF generator now handles the new structure
			const data = backendData;

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateNetProfitPDF(data, startDate, endDate, settings);
			console.log('📄 Net profit PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting net profit report:', error);
			throw error;
		}
	},

	exportExpensesReport: async (
		startDate?: string,
		endDate?: string
	): Promise<Blob> => {
		console.log('📊 Starting expenses report export...', {
			startDate,
			endDate,
		});
		try {
			const data = await getExpensesReport(startDate, endDate);
			console.log('✅ Expenses data fetched successfully:', data);

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateExpensesPDF(data, startDate, endDate, settings);
			console.log('📄 Expenses PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting expenses report:', error);
			throw error;
		}
	},

	exportOutstandingPaymentsReport: async (
		startDate?: string,
		endDate?: string
	): Promise<Blob> => {
		console.log('📊 Starting outstanding payments report export...', {
			startDate,
			endDate,
		});
		try {
			const data = await getOutstandingPaymentsReport(startDate, endDate);
			console.log('✅ Outstanding payments data fetched successfully:', data);

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateOutstandingPaymentsPDF(
				data,
				startDate,
				endDate,
				settings
			);
			console.log('📄 Outstanding payments PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting outstanding payments report:', error);
			throw error;
		}
	},

	exportReceipt: async (
		receiptData: any,
		receiptFormat: 'a4' | 'a5' | 'thermal'
	): Promise<Blob> => {
		console.log('🧾 Starting receipt PDF generation...', { receiptFormat });
		try {
			const pdfBlob = generateReceiptPDF(receiptData, receiptFormat);
			console.log('📄 Receipt PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error generating receipt PDF:', error);
			throw error;
		}
	},

	exportPurchaseOrderDetailedReport: async (
		startDate?: string,
		endDate?: string,
		supplier?: string
	): Promise<Blob> => {
		console.log('📊 Starting purchase order detailed report export...', {
			startDate,
			endDate,
			supplier,
		});
		try {
			const data = await getPurchaseOrderDetailedReport(
				startDate,
				endDate,
				supplier
			);
			console.log(
				'✅ Purchase order detailed data fetched successfully:',
				data
			);

			// Fetch settings for company header
			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generatePurchaseOrderDetailedPDF(
				data,
				startDate,
				endDate,
				settings
			);
			console.log('📄 Purchase order detailed PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error(
				'❌ Error exporting purchase order detailed report:',
				error
			);
			throw error;
		}
	},

	exportSalesReturnsReport: async (
		startDate?: string,
		endDate?: string
	): Promise<Blob> => {
		console.log('📊 Starting sales returns report export...', {
			startDate,
			endDate,
		});
		try {
			const data = await getSalesReturnsReport(startDate, endDate);
			console.log('✅ Sales returns data fetched successfully:', data);

			let settings;
			try {
				const settingsService = (await import('@/services/settings'))
					.settingsService;
				settings = await settingsService.getAll();
			} catch (error) {
				console.warn('Could not fetch settings for PDF header:', error);
			}

			const pdfBlob = generateSalesReturnsPDF(
				data,
				startDate,
				endDate,
				settings
			);
			console.log('📄 Sales returns PDF generated successfully');
			return pdfBlob;
		} catch (error) {
			console.error('❌ Error exporting sales returns report:', error);
			throw error;
		}
	},
};

