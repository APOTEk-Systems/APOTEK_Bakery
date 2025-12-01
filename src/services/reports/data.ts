import { api } from '@/lib/api';
import axios from 'axios';
import { inventoryService } from '../inventory';
import { salesService, type SalesQueryParams } from '../sales';
import { suppliersService } from '../suppliers';
import { purchasesService } from '../purchases';
import { getPurchaseSummary } from '../purchases'; // Importing getPurchaseSummary for export
import type {
	SalesReport,
	PurchasesReport,
	ProductionReport,
	InventoryReport,
	InventoryAdjustmentsReport,
	LowStockReport,
	OutOfStockReport,
	FinancialReport,
	CustomerSalesReport,
	SupplierWisePurchasesReport,
	IngredientPurchaseTrendReport,
	FinishedGoodsSummaryReport,
	IngredientUsageReport,
	SalesSummaryReport,
	ProfitAndLossReport,
	ExpenseBreakdownReport,
	ProductsReport,
	ProductDetailsReport,
	ProductionSummaryReport,
	IngredientSummaryReport,
	CreditPaymentReport,
} from '@/types/reports';

// Sales Report - now pulls from sales service with proper filtering
export const getSalesReport = async (
	startDate?: string,
	endDate?: string,
	type?: 'all' | 'cash' | 'credit'
): Promise<SalesReport> => {
	console.log('🔍 Fetching sales report data...', { startDate, endDate, type });

	// Build query parameters based on type
	const params: SalesQueryParams = {
		limit: 10000, // Get all records for reports
	};

	if (startDate) params.startDate = startDate;
	if (endDate) params.endDate = endDate;

	// Apply filters based on type
	if (type === 'cash') {
		params.isCredit = false;
	} else if (type === 'credit') {
		params.isCredit = true;
	}
	// For 'all', don't set isCredit filter

	const response = await salesService.getPaginatedSales(params);
	console.log('📥 Sales API response:', response);

	// Transform the data to match the expected SalesReport format
	const transformedData = {
		data: {
			sales: response.sales.map((sale) => ({
				id: sale.id,
				customerId: sale.customerId,
				soldById: sale.soldById || 0,
				isCredit: sale.isCredit || false,
				creditDueDate: sale.creditDueDate,
				total: sale.total,
				paid: sale.paid,
				outstandingBalance: sale.outstandingBalance,
				status: sale.status,
				createdAt: sale.createdAt,
				updatedAt: sale.updatedAt,
				customer: sale.customer
					? {
							id: sale.customer.id,
							name: sale.customer.name,
							email: sale.customer.email,
					  }
					: null,
				soldBy: sale.soldBy,
			})),
			totalSales: response.sales.reduce((sum, sale) => sum + sale.total, 0),
			creditOutstanding: response.sales
				.filter(
					(sale) =>
						sale.isCredit &&
						sale.outstandingBalance &&
						sale.outstandingBalance > 0
				)
				.reduce((sum, sale) => sum + (sale.outstandingBalance || 0), 0),
		},
	};

	return transformedData;
};

// Sales Summary Report (server-side endpoint)
export const getSalesSummaryReport = async (
	startDate?: string,
	endDate?: string
): Promise<SalesSummaryReport> => {
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);
	const response = await api.get(`/reports/sales-summary?${params.toString()}`);
	// Backend returns { data: report } so response.data already matches our SalesSummaryReport
	return response.data as SalesSummaryReport;
};

// Cash Sales Summary Report (server-side endpoint)
export const getCashSalesSummaryReport = async (
	startDate?: string,
	endDate?: string
): Promise<SalesSummaryReport> => {
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);
	try {
		const response = await api.get(
			`/reports/cash-sales-summary?${params.toString()}`
		);
		return response.data as SalesSummaryReport;
	} catch (err: unknown) {
		// Fallback to computing server-side sales summary for cash sales if endpoint missing
		if (axios.isAxiosError(err) && err.response?.status === 404) {
			const resp = await salesService.getPaginatedSales({
				limit: 10000,
				startDate,
				endDate,
				isCredit: false,
			});
			const rows = (resp.sales || []).reduce(
				(acc: Record<string, number>, sale) => {
					const date = sale.createdAt.split('T')[0];
					acc[date] = (acc[date] || 0) + (sale.total || 0);
					return acc;
				},
				{} as Record<string, number>
			);
			return {
				data: Object.entries(rows).map(([date, total]) => ({ date, total })),
			} as SalesSummaryReport;
		}
		throw err;
	}
};

// Credit Summary Report (alternate endpoint)
export const getCreditSummaryReport = async (
	startDate?: string,
	endDate?: string
): Promise<SalesSummaryReport> => {
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);
	try {
		const response = await api.get(
			`/reports/credit-summary?${params.toString()}`
		);
		return response.data as SalesSummaryReport;
	} catch (err: unknown) {
		// Fallback: compute credit sales summary by aggregating credit sales
		if (axios.isAxiosError(err) && err.response?.status === 404) {
			const resp = await salesService.getPaginatedSales({
				limit: 10000,
				startDate,
				endDate,
				isCredit: true,
			});
			const rows = (resp.sales || []).reduce(
				(acc: Record<string, number>, sale) => {
					const date = sale.createdAt.split('T')[0];
					acc[date] = (acc[date] || 0) + (sale.total || 0);
					return acc;
				},
				{} as Record<string, number>
			);
			return {
				data: Object.entries(rows).map(([date, total]) => ({ date, total })),
			} as SalesSummaryReport;
		}
		throw err;
	}
};

// Purchases Report
export const getPurchasesReport = async (
	startDate?: string,
	endDate?: string
): Promise<PurchasesReport> => {
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);

	const response = await api.get(`/reports/purchases?${params.toString()}`);
	return response.data;
};

// Production Report
export const getProductionReport = async (
	startDate?: string,
	endDate?: string
): Promise<ProductionReport> => {
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);
	params.append('limit', '1000');

	const response = await api.get(`/production?${params.toString()}`);
	const productionRuns = response.data.productionRuns || [];

	return {
		data: {
			totalProduced: productionRuns.reduce(
				(sum, prod) => sum + (prod.quantityProduced || 0),
				0
			),
			production: productionRuns,
			totalCost: productionRuns.reduce(
				(sum, prod) => sum + (prod.cost || 0),
				0
			),
		},
	};
};

// Production Summary Report (server-side endpoint)
export const getProductionSummaryReport = async (
	startDate?: string,
	endDate?: string
): Promise<ProductionSummaryReport> => {
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);
	const response = await api.get(
		`/reports/production-summary?${params.toString()}`
	);
	return response.data as ProductionSummaryReport;
};

// Ingredient Summary Report (server-side endpoint)
export const getIngredientSummaryReport = async (
	startDate?: string,
	endDate?: string
): Promise<IngredientSummaryReport> => {
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);
	const response = await api.get(
		`/reports/ingredient-summary?${params.toString()}`
	);
	return response.data as IngredientSummaryReport;
};

// Inventory Report
export const getInventoryReport = async (): Promise<InventoryReport> => {
	const response = await api.get('/reports/inventory');
	return response.data;
};

// Inventory Adjustments Report
export const getInventoryAdjustmentsReport = async (
	startDate?: string,
	endDate?: string
): Promise<InventoryAdjustmentsReport> => {
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);

	const response = await api.get(
		`/reports/inventory/adjustments?${params.toString()}`
	);
	return response.data;
};

// Low Stock Report
export const getLowStockReport = async (
	type?: 'raw_material' | 'supplies'
): Promise<LowStockReport> => {
	// Use inventory service to get low stock items
	const params = type ? { low: true, type } : { low: true };
	const lowStockItems = await inventoryService.getInventory(params);

	return {
		data: {
			inventoryItem: lowStockItems,
		},
	};
};

// Out of Stock Report
export const getOutOfStockReport = async (
	type?: 'raw_material' | 'supplies'
): Promise<OutOfStockReport> => {
	// Get all inventory items and filter for out of stock
	const params = type ? { type } : {};
	const allItems = await inventoryService.getInventory(params);

	// Filter items where currentQuantity <= 0
	const outOfStockItems = allItems.filter(
		(item: any) => item.currentQuantity <= 0
	);

	return {
		data: {
			inventoryItem: outOfStockItems,
		},
	};
};

// Financial Report
export const getFinancialReport = async (
	startDate?: string,
	endDate?: string
): Promise<FinancialReport> => {
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);

	const response = await api.get(`/reports/financial?${params.toString()}`);
	return response.data;
};

// Customer Sales Report
export const getCustomerSalesReport = async (
	startDate?: string,
	endDate?: string
): Promise<CustomerSalesReport> => {
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);

	const response = await api.get(`/reports/customers?${params.toString()}`);
	return response.data;
};

// Supplier-wise Purchases Report
export const getSupplierWisePurchasesReport = async (
	startDate?: string,
	endDate?: string
): Promise<SupplierWisePurchasesReport> => {
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);

	const response = await api.get(
		`/reports/purchases-by-supplier?${params.toString()}`
	);
	return response.data;
};

// Ingredient Purchase Trend Report
export const getIngredientPurchaseTrendReport = async (
	startDate?: string,
	endDate?: string
): Promise<IngredientPurchaseTrendReport> => {
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);

	const response = await api.get(
		`/reports/ingredient-purchase-trend?${params.toString()}`
	);
	return response.data;
};

// Finished Goods Summary Report
export const getFinishedGoodsSummaryReport = async (
	startDate?: string,
	endDate?: string
): Promise<FinishedGoodsSummaryReport> => {
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);

	const response = await api.get(
		`/reports/finished-goods-summary?${params.toString()}`
	);
	return response.data;
};

// Ingredient Usage Report
export const getIngredientUsageReport = async (
	startDate?: string,
	endDate?: string
): Promise<IngredientUsageReport> => {
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);

	const response = await api.get(
		`/reports/ingredient-usage?${params.toString()}`
	);
	return response.data;
};

// Profit and Loss Report
export const getProfitAndLossReport = async (
	startDate?: string,
	endDate?: string
): Promise<ProfitAndLossReport> => {
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);

	const response = await api.get(`/reports/financial?${params.toString()}`);
	return response.data;
};

// Expense Category Breakdown Report
export const getExpenseBreakdownReport = async (
	startDate?: string,
	endDate?: string
): Promise<ExpenseBreakdownReport> => {
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);

	const response = await api.get(
		`/reports/expense-breakdown?${params.toString()}`
	);
	return response.data;
};

// Products Report
export const getProductsReport = async (): Promise<ProductsReport> => {
	const response = await api.get('/products');
	return { data: response.data };
};

// Product Details Report
export const getProductDetailsReport =
	async (): Promise<ProductDetailsReport> => {
		const response = await api.get('/production/detailed');
		// Transform the data to match the expected format
		const transformedData = response.data.map((product: any) => ({
			id: product.id || 0, // Add id if not present
			name: product.name,
			price: product.price,
			averageProductionCost: product.productionCost,
			profit: product.profit,
		}));
		return { data: transformedData };
	};

// Goods Received Report
export const getGoodsReceivedReport = async (
	startDate?: string,
	endDate?: string,
	supplierId?: number
): Promise<any> => {
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);
	if (supplierId) params.append('supplierId', supplierId.toString());
	params.append('limit', '1000');
	const response = await api.get(
		`/purchases/detailed-receipts?${params.toString()}`
	);
	return response.data;
};

// Production Summary for Dashboard
export const getProductionSummary = async (): Promise<{
	dailyProduction: number;
	weeklyProduction: number;
	weeklyProductionCost: number;
}> => {
	const response = await api.get('/dashboard/production');
	return response.data;
};

// Expenses Report
export const getExpensesReport = async (
	startDate?: string,
	endDate?: string
): Promise<any> => {
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);

	// Use the same endpoint as ExpensesTab for consistency
	const response = await api.get(`/accounting/expenses?${params.toString()}`);
	return response.data;
};

// Outstanding Payments Report
export const getOutstandingPaymentsReport = async (
	startDate?: string,
	endDate?: string
): Promise<any> => {
	// Use the same approach as OutstandingPaymentsTab component
	const allSales = await salesService.getPaginatedSales({
		status: 'unpaid',
		isCredit: true,
		startDate,
		endDate,
		limit: 10000, // Get all records for reports
	});

	//console.log("All Sales for Outstanding Payments Report", allSales);
	// Filter sales with outstanding balances
	const outstandingSales = allSales.sales.filter(
		(sale) => sale.outstandingBalance && sale.outstandingBalance > 0
	);

	//console.log("Outstanding Sales", outstandingSales)

	return {
		data: outstandingSales,
		totalOutstanding: outstandingSales.reduce(
			(sum, sale) => sum + (sale.outstandingBalance || 0),
			0
		),
		totalCount: outstandingSales.length,
	};
};

// Credit Payment Report
export const getCreditPaymentReport = async (
	startDate?: string,
	endDate?: string,
	customerId?: number
): Promise<CreditPaymentReport> => {
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);
	if (customerId) params.append('customerId', customerId.toString());

	try {
		const response = await api.get(
			`/reports/credit-payments?${params.toString()}`
		);
		return response.data;
	} catch (err: unknown) {
		// Fallback: compute the credit payment report using sales API if the endpoint is not provided by backend
		if (axios.isAxiosError(err) && err.response?.status === 404) {
			const resp = await salesService.getPaginatedSales({
				limit: 10000,
				startDate,
				endDate,
				isCredit: true,
				...(customerId ? { customerId } : {}),
			});

			// Aggregate per customer
			const byCustomer: Record<
				number,
				{
					customerId: number;
					customerName: string;
					total: number;
					paid: number;
				}
			> = {};
			for (const sale of resp.sales || []) {
				const custId = sale.customer?.id || sale.customerId || 0;
				const custName = sale.customer?.name || sale.customerName || 'Unknown';
				const total = sale.total || 0;
				const paid =
					sale.paid ??
					(typeof sale.outstandingBalance === 'number'
						? total - sale.outstandingBalance
						: 0);

				if (!byCustomer[custId]) {
					byCustomer[custId] = {
						customerId: custId,
						customerName: custName,
						total: 0,
						paid: 0,
					};
				}
				byCustomer[custId].total += total;
				byCustomer[custId].paid += paid;
			}

			const data = Object.values(byCustomer).map((c) => ({
				customerId: c.customerId,
				customerName: c.customerName,
				total: c.total,
				paid: c.paid,
				balance: c.total - c.paid,
			}));

			return { data } as CreditPaymentReport;
		}
		throw err;
	}
};

// Purchase Order Detailed Report
export const getPurchaseOrderDetailedReport = async (
	startDate?: string,
	endDate?: string,
	supplierId?: number
): Promise<any> => {
	const params = new URLSearchParams();
	if (startDate) params.append('startDate', startDate);
	if (endDate) params.append('endDate', endDate);
	if (supplierId) params.append('supplierId', supplierId.toString());

	const response = await api.get(`/purchases/detailed?${params.toString()}`);
	return response.data;
};

// Purchase Order Summary Report - wraps purchasesService.getPurchaseSummary
export const getPurchaseOrderSummaryReport = async (): Promise<
	import('@/types/reports').PurchaseOrderSummaryReport
> => {
	const response = await purchasesService.getPurchaseSummary();
	// purchasesService returns the object matching the shape from backend
	return response;
};

// Suppliers List Report (no filters, returns full supplier object array)
export const getSuppliersReport = async (): Promise<{
	data: import('@/services/suppliers').Supplier[];
}> => {
	const response = await suppliersService.getAll();
	return { data: response };
};
