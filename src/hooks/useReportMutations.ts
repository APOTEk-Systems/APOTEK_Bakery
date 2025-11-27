import { useMutation } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { reportsService } from '@/services/reports';
type ReportsServiceType = typeof reportsService;
import { DateRange } from '@/components/ui/DateRange';
import { useToast } from '@/hooks/use-toast';

const generateFilename = (
	reportType: string,
	dateRange?: DateRange
): string => {
	const startDateStr = dateRange?.from?.toISOString().split('T')[0];
	const endDateStr = dateRange?.to?.toISOString().split('T')[0];

	// Map report types to readable names
	const reportNames: Record<string, string> = {
		sales: 'Sales Report',
		'cash-sales': 'Cash Sales Report',
		'credit-sales': 'Credit Sales Report',
		products: 'Price List Report',
		'product-details': 'Product Details Report',
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
		'cash-sales-summary': 'Cash Sales Summary Report',
		'credit-sales-summary': 'Credit Sales Summary Report',
		'gross-profit': 'Gross Profit Report',
		'net-profit': 'Net Profit Report',
		expenses: 'Expenses Report',
		'outstanding-payments': 'Outstanding Payments Report',
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

const previewBlob = (blob: Blob, filename: string) => {
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
	selectedSupplier?: string
) => {
	const { toast } = useToast();

	const useCreateReportMutation = (
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
				const from = dateRange?.from?.toISOString().split('T')[0];
				const to = dateRange?.to?.toISOString().split('T')[0];
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

	// Sales
	const exportSalesMutation = useCreateReportMutation(
		(from, to) => reportsService.exportSalesReport(from, to),
		'sales',
		'Sales report generated successfully',
		'Failed to export sales report'
	);

	const exportCashSalesMutation = useCreateReportMutation(
		(from, to) => reportsService.exportCashSalesReport(from, to),
		'cash-sales',
		'Cash sales report generated successfully',
		'Failed to generate cash sales report'
	);

	const exportCreditSalesMutation = useCreateReportMutation(
		(from, to) => reportsService.exportCreditSalesReport(from, to),
		'credit-sales',
		'Credit sales report generated successfully',
		'Failed to generate credit sales report'
	);

	// Summary reports
	const exportSalesSummaryMutation = useCreateReportMutation(
		(from, to) =>
			(reportsService as ReportsServiceType).exportSalesSummaryReport(from, to),
		'sales-summary',
		'Sales summary report generated successfully',
		'Failed to export sales summary report'
	);

	const exportCashSalesSummaryMutation = useCreateReportMutation(
		(from, to) =>
			(reportsService as ReportsServiceType).exportCashSalesSummaryReport(
				from,
				to
			),
		'cash-sales-summary',
		'Cash sales summary report generated successfully',
		'Failed to export cash sales summary report'
	);

	const exportCreditSalesSummaryMutation = useCreateReportMutation(
		(from, to) =>
			(reportsService as ReportsServiceType).exportCreditSalesSummaryReport(
				from,
				to
			),
		'credit-sales-summary',
		'Credit sales summary report generated successfully',
		'Failed to export credit sales summary report'
	);

	// Purchases
	const exportGoodsReceivedMutation = useCreateReportMutation(
		(from, to, supplierId) =>
			reportsService.exportGoodsReceivedReport(from, to, supplierId),
		'goods-received',
		'Materials received report generated successfully',
		'Failed to export materials received report'
	);

	// Inventory
	const exportMaterialsInventoryMutation = useCreateReportMutation(
		() => reportsService.exportInventoryReport('raw_material'),
		'materials-current',
		'Materials current stock report generated successfully',
		'Failed to export materials current stock report'
	);

	const exportSuppliesInventoryMutation = useCreateReportMutation(
		() => reportsService.exportInventoryReport('supplies'),
		'supplies-current',
		'Supplies current stock report generated successfully',
		'Failed to export supplies current stock report'
	);

	const exportMaterialsAdjustmentsMutation = useCreateReportMutation(
		(from, to) =>
			reportsService.exportInventoryAdjustmentsReport(from, to, 'raw_material'),
		'materials-adjustment',
		'Materials adjustments report generated successfully',
		'Failed to export materials adjustments report',
		'No adjustments found for materials'
	);

	const exportSuppliesAdjustmentsMutation = useCreateReportMutation(
		(from, to) =>
			reportsService.exportInventoryAdjustmentsReport(from, to, 'supplies'),
		'supplies-adjustment',
		'Supplies adjustments report generated successfully',
		'Failed to export supplies adjustments report',
		'No adjustments found for supplies'
	);

	const exportMaterialsLowStockMutation = useCreateReportMutation(
		() => reportsService.exportLowStockReport('raw_material'),
		'materials-low-stock',
		'Materials low stock report generated successfully',
		'Failed to export materials low stock report',
		'No items found below minimum stock level for materials'
	);

	const exportSuppliesLowStockMutation = useCreateReportMutation(
		() => reportsService.exportLowStockReport('supplies'),
		'supplies-low-stock',
		'Supplies low stock report generated successfully',
		'Failed to export supplies low stock report',
		'No items found below minimum stock level for supplies'
	);

	const exportMaterialsOutOfStockMutation = useCreateReportMutation(
		() => reportsService.exportOutOfStockReport('raw_material'),
		'materials-out-of-stock',
		'Materials out of stock report generated successfully',
		'Failed to export materials out of stock report',
		'No out of stock items found for materials'
	);

	const exportSuppliesOutOfStockMutation = useCreateReportMutation(
		() => reportsService.exportOutOfStockReport('supplies'),
		'supplies-out-of-stock',
		'Supplies out of stock report generated successfully',
		'Failed to export supplies out of stock report',
		'No out of stock items found for supplies'
	);

	const exportProductDetailsMutation = useCreateReportMutation(
		() => reportsService.exportProductDetailsReport(),
		'product-details',
		'Product details report generated successfully',
		'Failed to export product details report'
	);

	// Production
	const exportProductionMutation = useCreateReportMutation(
		(from, to) => reportsService.exportProductionReport(from, to),
		'production',
		'Production report generated successfully',
		'Failed to export production report'
	);

	const exportFinishedGoodsSummaryMutation = useCreateReportMutation(
		(from, to) => reportsService.exportFinishedGoodsSummaryReport(from, to),
		'finished-goods',
		'Finished goods summary report generated successfully',
		'Failed to export products summary report'
	);

	const exportIngredientUsageMutation = useCreateReportMutation(
		(from, to) => reportsService.exportIngredientUsageReport(from, to),
		'ingredient-usage',
		'Ingredient usage report generated successfully',
		'Failed to export ingredient usage report'
	);

	// Accounting
	const exportGrossProfitMutation = useCreateReportMutation(
		(from, to) => reportsService.exportGrossProfitReport(from, to),
		'gross-profit',
		'Gross profit report generated successfully',
		'Failed to export gross profit report'
	);

	const exportNetProfitMutation = useCreateReportMutation(
		(from, to) => reportsService.exportNetProfitReport(from, to),
		'net-profit',
		'Net profit report generated successfully',
		'Failed to export net profit report'
	);

	const exportExpensesMutation = useCreateReportMutation(
		(from, to) => reportsService.exportExpensesReport(from, to),
		'expenses',
		'Expenses report generated successfully',
		'Failed to export expenses report'
	);

	const exportOutstandingPaymentsMutation = useCreateReportMutation(
		(from, to) => reportsService.exportOutstandingPaymentsReport(from, to),
		'outstanding-payments',
		'Outstanding payments report generated successfully',
		'Failed to export outstanding payments report'
	);

	const exportPurchaseOrderDetailedMutation = useCreateReportMutation(
		(from, to, supplierId) =>
			reportsService.exportPurchaseOrderDetailedReport(from, to, supplierId),
		'purchase-orders-detailed',
		'Purchase order detailed report generated successfully',
		'Failed to export purchase order detailed report'
	);

	const exportProductsMutation = useCreateReportMutation(
		() => reportsService.exportProductsReport(),
		'products',
		'Products report generated successfully',
		'Failed to export products report'
	);

	type ReportMutation = UseMutationResult<Blob, unknown, void, unknown>;

	const mutations: Record<string, ReportMutation> = {
		sales: exportSalesMutation,
		'cash-sales': exportCashSalesMutation,
		'credit-sales': exportCreditSalesMutation,
		'sales-summary': exportSalesSummaryMutation,
		'cash-sales-summary': exportCashSalesSummaryMutation,
		'credit-sales-summary': exportCreditSalesSummaryMutation,
		'goods-received': exportGoodsReceivedMutation,
		'purchase-orders-detailed': exportPurchaseOrderDetailedMutation,
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
		'gross-profit': exportGrossProfitMutation,
		'net-profit': exportNetProfitMutation,
		expenses: exportExpensesMutation,
		'outstanding-payments': exportOutstandingPaymentsMutation,
		products: exportProductsMutation,
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
