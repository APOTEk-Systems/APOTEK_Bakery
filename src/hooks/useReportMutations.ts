
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { reportsService } from "@/services/reports";
import { DateRange } from "@/components/ui/DateRange";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const generateFilename = (reportType: string, dateRange?: DateRange): string => {
  const startDateStr = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
  const endDateStr = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;

	// Map report types to readable names
	const reportNames: Record<string, string> = {
		sales: 'Sales Report',
		'cash-sales': 'Cash Sales Report',
		'credit-sales': 'Credit Sales Report',
		products: 'Price List Report',
		'product-details': 'Product Details Report',
		'product-current-stock': 'Product Current Stock Report',
		'goods-received': 'Materials Received Report',
		'purchase-orders-detailed': 'Purchase Orders Detailed Report',
		'materials-current': 'Materials Current Stock Report',
		'sales-summary': 'Sales Summary Report',
		'supplies-current': 'Supplies Current Stock Report',
		'materials-adjustment': 'Materials Adjustments Report',
		'supplies-adjustment': 'Supplies Adjustments Report',
		'materials-low-stock': 'Materials Low Stock Report',
		'supplies-low-stock': 'Supplies Low Stock Report',
		'materials-out-of-stock': 'Materials Out of Stock Report',
		'supplies-out-of-stock': 'Supplies Out of Stock Report',
		production: 'Production Report',
		'finished-goods': 'Finished Goods Summary Report',
		'ingredient-usage': 'Ingredient Usage Report',
		'production-summary': 'Production Summary Report',
		'ingredient-summary': 'Ingredients Summary Report',
		'cash-sales-summary': 'Cash Sales Summary Report',
		'credit-sales-summary': 'Credit Sales Summary Report',
		'credit-payments': 'Credit Payments Report',
		'gross-profit': 'Gross Profit Report',
		'net-profit': 'Net Profit Report',
		expenses: 'Expenses Report',
		'outstanding-payments': 'Outstanding Payments Report',
		'suppliers-list': 'Suppliers List Report',
		'purchase-summary': 'Purchase Orders Summary Report',
	};

	const baseName =
		reportNames[reportType] ||
		`${reportType
			.replace('-', ' ')
			.replace(/\b\w/g, (l) => l.toUpperCase())} Report`;

	if (startDateStr && endDateStr) {
		return `${baseName} (${startDateStr} to ${endDateStr}).pdf`;
	} else if (startDateStr) {
		return `${baseName} (from ${startDateStr}).pdf`;
	} else if (endDateStr) {
		return `${baseName} (to ${endDateStr}).pdf`;
	} else {
		return `${baseName}.pdf`;
	}
};

export const previewBlob = (blob: Blob, filename: string) => {
	try {
		// Convert blob to data URL with proper MIME type
		const reader = new FileReader();
		reader.onload = () => {
			const dataUrl = reader.result as string;
			// Replace the generic data URL with proper application/pdf MIME type
			const pdfDataUrl = dataUrl.replace(
				'data:application/octet-stream',
				'data:application/pdf'
			);

			const newWindow = window.open('', '_blank');
			if (newWindow) {
				newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${filename.replace('.pdf', '')}</title>
              <style>
                html, body {
                  margin: 0;
                  padding: 0;
                  height: 100%;
                  overflow: hidden;
                }
                iframe {
                  width: 100%;
                  height: 100%;
                  border: none;
                  display: block;
                }
              </style>
            </head>
            <body>
              <iframe src="${pdfDataUrl}"></iframe>
            </body>
          </html>
        `);
				newWindow.document.close();
			}
		};
		reader.readAsDataURL(blob);
	} catch (error) {
		console.error('Error in previewBlob:', error);
	}
};

export const useReportMutations = (
	dateRange?: DateRange,
	selectedSupplier?: string,
	selectedCustomer?: string
) => {
	const { toast } = useToast();

	const useCreateReportMutation = (
		mutationFn: (
			startDate?: string,
			endDate?: string,
			customerId?: number,
			supplierId?: number
		) => Promise<Blob>,
		reportType: string,
		successMessage: string,
		errorMessage: string,
		infoMessage: string = 'No data found'
	) => {
		return useMutation({
			mutationFn: () => {
				const from = dateRange?.from?.toISOString().split('T')[0];
				const to = dateRange?.to?.toISOString().split('T')[0];
				const supplierId =
					selectedSupplier && selectedSupplier !== 'all'
						? parseInt(selectedSupplier)
						: undefined;
				const customerId =
					selectedCustomer && selectedCustomer !== 'all'
						? parseInt(selectedCustomer)
						: undefined;
				return mutationFn(from, to, customerId, supplierId);
			},
			onSuccess: (blob) => {
				if (blob && blob.size > 0) {
					previewBlob(blob, generateFilename(reportType, dateRange));
					toast({ title: 'Success', description: successMessage });
				} else {
					toast({
						title: 'Info',
						description: infoMessage,
						variant: 'default',
					});
				}
			},
			onError: (error: unknown) => {
				let message = errorMessage;
				if (typeof error === 'string') {
					message = error;
				} else if (
					error &&
					typeof error === 'object' &&
					'message' in (error as { message?: string })
				) {
					message = (error as { message?: string }).message || message;
				}
				toast({
					title: 'Error',
					description: message,
					variant: message.includes('No') ? 'default' : 'destructive',
				});
			},
		});
	};
	const createReportMutation = (
		mutationFn: (
			startDate?: string,
			endDate?: string,
			supplierId?: number
		) => Promise<Blob>,
		reportType: string,
		successMessage: string,
		errorMessage: string,
		infoMessage: string = 'No data found'
	) => {
		return useMutation({
			mutationFn: () => {
				const from = dateRange?.from
					? format(dateRange.from, 'yyyy-MM-dd')
					: undefined;
				const to = dateRange?.to
					? format(dateRange.to, 'yyyy-MM-dd')
					: undefined;
				const supplierId =
					selectedSupplier && selectedSupplier !== 'all'
						? parseInt(selectedSupplier)
						: undefined;
				return mutationFn(from, to, supplierId);
			},
			onSuccess: (blob) => {
				if (blob && blob.size > 0) {
					previewBlob(blob, generateFilename(reportType, dateRange));
					toast({ title: 'Success', description: successMessage });
				} else {
					toast({
						title: 'Info',
						description: infoMessage,
						variant: 'default',
					});
				}
			},
			onError: (error: any) => {
				const message = error.message || errorMessage;
				toast({
					title: 'Error',
					description: message,
					variant: message.includes('No') ? 'default' : 'destructive',
				});
			},
		});
	};

	// Sales
	const exportSalesMutation = createReportMutation(
		(from, to) => reportsService.exportSalesReport(from, to),
		'sales',
		'Sales report generated successfully',
		'Failed to export sales report'
	);

	const exportCashSalesMutation = createReportMutation(
		(from, to) => reportsService.exportCashSalesReport(from, to),
		'cash-sales',
		'Cash sales report generated successfully',
		'Failed to generate cash sales report'
	);

	const exportCreditSalesMutation = createReportMutation(
		(from, to) => reportsService.exportCreditSalesReport(from, to),
		'credit-sales',
		'Credit sales report generated successfully',
		'Failed to generate credit sales report'
	);

	// Summary reports
	const exportSalesSummaryMutation = createReportMutation(
		(from, to) => reportsService.exportSalesSummaryReport(from, to),
		'sales-summary',
		'Sales summary report generated successfully',
		'Failed to export sales summary report'
	);

	const exportCreditPaymentsMutation = useCreateReportMutation(
		(from, to, customerId) =>
			(reportsService as ReportsServiceType).exportCreditPaymentReport(
				from,
				to,
				customerId
			),
		'credit-payments',
		'Credit payments report generated successfully',
		'Failed to export credit payments report'
	);

	const exportCashSalesSummaryMutation = createReportMutation(
		(from, to) => reportsService.exportCashSalesSummaryReport(from, to),
		'cash-sales-summary',
		'Cash sales summary report generated successfully',
		'Failed to export cash sales summary report'
	);

	const exportCreditSalesSummaryMutation = createReportMutation(
		(from, to) => reportsService.exportCreditSalesSummaryReport(from, to),
		'credit-sales-summary',
		'Credit sales summary report generated successfully',
		'Failed to export credit sales summary report'
	);

	// Purchases
	const exportGoodsReceivedMutation = createReportMutation(
		(from, to, supplierId) =>
			reportsService.exportGoodsReceivedReport(from, to, supplierId),
		'goods-received',
		'Materials received report generated successfully',
		'Failed to export materials received report'
	);

	// Inventory
	const exportMaterialsInventoryMutation = createReportMutation(
		() => reportsService.exportInventoryReport('raw_material'),
		'materials-current',
		'Materials current stock report generated successfully',
		'Failed to export materials current stock report'
	);

	const exportSuppliesInventoryMutation = createReportMutation(
		() => reportsService.exportInventoryReport('supplies'),
		'supplies-current',
		'Supplies current stock report generated successfully',
		'Failed to export supplies current stock report'
	);

	const exportMaterialsAdjustmentsMutation = createReportMutation(
		(from, to) =>
			reportsService.exportInventoryAdjustmentsReport(from, to, 'raw_material'),
		'materials-adjustment',
		'Materials adjustments report generated successfully',
		'Failed to export materials adjustments report',
		'No adjustments found for materials'
	);

	const exportSuppliesAdjustmentsMutation = createReportMutation(
		(from, to) =>
			reportsService.exportInventoryAdjustmentsReport(from, to, 'supplies'),
		'supplies-adjustment',
		'Supplies adjustments report generated successfully',
		'Failed to export supplies adjustments report',
		'No adjustments found for supplies'
	);

	const exportMaterialsLowStockMutation = createReportMutation(
		() => reportsService.exportLowStockReport('raw_material'),
		'materials-low-stock',
		'Materials low stock report generated successfully',
		'Failed to export materials low stock report',
		'No items found below minimum stock level for materials'
	);

	const exportSuppliesLowStockMutation = createReportMutation(
		() => reportsService.exportLowStockReport('supplies'),
		'supplies-low-stock',
		'Supplies low stock report generated successfully',
		'Failed to export supplies low stock report',
		'No items found below minimum stock level for supplies'
	);

	const exportMaterialsOutOfStockMutation = createReportMutation(
		() => reportsService.exportOutOfStockReport('raw_material'),
		'materials-out-of-stock',
		'Materials out of stock report generated successfully',
		'Failed to export materials out of stock report',
		'No out of stock items found for materials'
	);

	const exportSuppliesOutOfStockMutation = createReportMutation(
		() => reportsService.exportOutOfStockReport('supplies'),
		'supplies-out-of-stock',
		'Supplies out of stock report generated successfully',
		'Failed to export supplies out of stock report',
		'No out of stock items found for supplies'
	);

	const exportProductDetailsMutation = createReportMutation(
		() => reportsService.exportProductDetailsReport(),
		'product-details',
		'Product details report generated successfully',
		'Failed to export product details report'
	);

	// Production
	const exportProductionMutation = createReportMutation(
		(from, to) => reportsService.exportProductionReport(from, to),
		'production',
		'Production report generated successfully',
		'Failed to export production report'
	);

	const exportFinishedGoodsSummaryMutation = createReportMutation(
		(from, to) => reportsService.exportFinishedGoodsSummaryReport(from, to),
		'finished-goods',
		'Finished goods summary report generated successfully',
		'Failed to export products summary report'
	);

	const exportIngredientUsageMutation = createReportMutation(
		(from, to) => reportsService.exportIngredientUsageReport(from, to),
		'ingredient-usage',
		'Ingredient usage report generated successfully',
		'Failed to export ingredient usage report'
	);

	const exportProductionSummaryMutation = createReportMutation(
		(from, to) => reportsService.exportProductionSummaryReport(from, to),
		'production-summary',
		'Production summary report generated successfully',
		'Failed to export production summary report'
	);

	const exportIngredientSummaryMutation = createReportMutation(
		(from, to) => reportsService.exportIngredientSummaryReport(from, to),
		'ingredient-summary',
		'Ingredients summary report generated successfully',
		'Failed to export ingredients summary report'
	);

	// Accounting
	const exportGrossProfitMutation = createReportMutation(
		(from, to) => reportsService.exportGrossProfitReport(from, to),
		'gross-profit',
		'Gross profit report generated successfully',
		'Failed to export gross profit report'
	);

	const exportNetProfitMutation = createReportMutation(
		(from, to) => reportsService.exportNetProfitReport(from, to),
		'net-profit',
		'Net profit report generated successfully',
		'Failed to export net profit report'
	);

	const exportExpensesMutation = createReportMutation(
		(from, to) => reportsService.exportExpensesReport(from, to),
		'expenses',
		'Expenses report generated successfully',
		'Failed to export expenses report'
	);

	const exportOutstandingPaymentsMutation = createReportMutation(
		(from, to) => reportsService.exportOutstandingPaymentsReport(from, to),
		'outstanding-payments',
		'Outstanding payments report generated successfully',
		'Failed to export outstanding payments report'
	);

	const exportPurchaseOrderDetailedMutation = createReportMutation(
		(from, to, supplierId) =>
			reportsService.exportPurchaseOrderDetailedReport(from, to, supplierId),
		'purchase-orders-detailed',
		'Purchase order detailed report generated successfully',
		'Failed to export purchase order detailed report'
	);

	const exportPurchaseSummaryMutation = useCreateReportMutation(
		() =>
			(reportsService as ReportsServiceType).exportPurchaseOrderSummaryReport(),
		'purchase-summary',
		'Purchase order summary report generated successfully',
		'Failed to export purchase order summary report'
	);

	const exportProductsMutation = createReportMutation(
		() => reportsService.exportProductsReport(),
		'products',
		'Products report generated successfully',
		'Failed to export products report'
	);

	const exportProductsCurrentStockMutation = createReportMutation(
		() =>
			(reportsService as ReportsServiceType).exportProductsCurrentStockReport(),
		'product-current-stock',
		'Products current stock report generated successfully',
		'Failed to export products current stock report'
	);

	// Suppliers list (no args)
	const exportSuppliersListMutation = useCreateReportMutation(
		() => (reportsService as ReportsServiceType).exportSuppliersReport(),
		'suppliers-list',
		'Suppliers list generated successfully',
		'Failed to export suppliers list'
	);

	type ReportMutation = UseMutationResult<Blob, unknown, void, unknown>;

	const mutations: Record<string, ReportMutation> = {
		sales: exportSalesMutation,
		'cash-sales': exportCashSalesMutation,
		'credit-sales': exportCreditSalesMutation,
		'sales-summary': exportSalesSummaryMutation,
		'cash-sales-summary': exportCashSalesSummaryMutation,
		'credit-sales-summary': exportCreditSalesSummaryMutation,
		'credit-payments': exportCreditPaymentsMutation,
		'goods-received': exportGoodsReceivedMutation,
		'purchase-orders-detailed': exportPurchaseOrderDetailedMutation,
		'purchase-summary': exportPurchaseSummaryMutation,
		'materials-current': exportMaterialsInventoryMutation,
		'supplies-current': exportSuppliesInventoryMutation,
		'materials-adjustment': exportMaterialsAdjustmentsMutation,
		'supplies-adjustment': exportSuppliesAdjustmentsMutation,
		'materials-low-stock': exportMaterialsLowStockMutation,
		'supplies-low-stock': exportSuppliesLowStockMutation,
		'materials-out-of-stock': exportMaterialsOutOfStockMutation,
		'supplies-out-of-stock': exportSuppliesOutOfStockMutation,
		'product-details': exportProductDetailsMutation,
		production: exportProductionMutation,
		'finished-goods': exportFinishedGoodsSummaryMutation,
		'ingredient-usage': exportIngredientUsageMutation,
		'production-summary': exportProductionSummaryMutation,
		'ingredient-summary': exportIngredientSummaryMutation,
		'gross-profit': exportGrossProfitMutation,
		'net-profit': exportNetProfitMutation,
		expenses: exportExpensesMutation,
		'outstanding-payments': exportOutstandingPaymentsMutation,
		products: exportProductsMutation,
		'product-current-stock': exportProductsCurrentStockMutation,
		'suppliers-list': exportSuppliersListMutation,
	};

	const handleExport = (reportType: string) => {
		const m = mutations[reportType];
		if (m && typeof m.mutate === 'function') {
			m.mutate();
		}
	};

	const isExporting = Object.values(mutations).some(
		(mutation) => mutation.isPending
	);

	return { handleExport, isExporting, mutations };
};
