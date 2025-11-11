
import { useMutation } from "@tanstack/react-query";
import { reportsService } from "@/services/reports";
import { DateRange } from "@/components/ui/DateRange";
import { useToast } from "@/hooks/use-toast";

const generateFilename = (reportType: string, dateRange?: DateRange): string => {
  const startDateStr = dateRange?.from?.toISOString().split('T')[0];
  const endDateStr = dateRange?.to?.toISOString().split('T')[0];
  const baseName = `${reportType}-report`;

  if (startDateStr && endDateStr) {
    return `${baseName}-${startDateStr}-to-${endDateStr}.pdf`;
  } else if (startDateStr) {
    return `${baseName}-from-${startDateStr}.pdf`;
  } else if (endDateStr) {
    return `${baseName}-to-${endDateStr}.pdf`;
  } else {
    return `${baseName}.pdf`;
  }
};

const previewBlob = (blob: Blob, filename: string) => {
  try {
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (error) {
    console.error('Error in previewBlob:', error);
  }
};

export const useReportMutations = (dateRange?: DateRange, selectedSupplier?: string) => {
  const { toast } = useToast();

  const createReportMutation = (
    mutationFn: (
      startDate?: string,
      endDate?: string,
      supplierId?: number
    ) => Promise<Blob>,
    reportType: string,
    successMessage: string,
    errorMessage: string,
    infoMessage: string = "No data found"
  ) => {
    return useMutation({
      mutationFn: () => {
        const from = dateRange?.from?.toISOString().split('T')[0];
        const to = dateRange?.to?.toISOString().split('T')[0];
        const supplierId = selectedSupplier && selectedSupplier !== "all" ? parseInt(selectedSupplier) : undefined;
        return mutationFn(from, to, supplierId);
      },
      onSuccess: (blob) => {
        if (blob && blob.size > 0) {
          previewBlob(blob, generateFilename(reportType, dateRange));
          toast({ title: "Success", description: successMessage });
        } else {
          toast({ title: "Info", description: infoMessage, variant: "default" });
        }
      },
      onError: (error: any) => {
        const message = error.message || errorMessage;
        toast({
          title: "Error",
          description: message,
          variant: message.includes("No") ? "default" : "destructive",
        });
      },
    });
  };

  // Sales
  const exportSalesMutation = createReportMutation(
    (from, to) => reportsService.exportSalesReport(from, to),
    'sales',
    "Sales report generated successfully",
    "Failed to export sales report"
  );

  const exportCashSalesMutation = createReportMutation(
    (from, to) => reportsService.exportCashSalesReport(from, to),
    'cash-sales',
    "Cash sales report generated successfully",
    "Failed to generate cash sales report"
  );

  const exportCreditSalesMutation = createReportMutation(
    (from, to) => reportsService.exportCreditSalesReport(from, to),
    'credit-sales',
    "Credit sales report generated successfully",
    "Failed to generate credit sales report"
  );

  // Purchases
  const exportGoodsReceivedMutation = createReportMutation(
    (from, to, supplierId) => reportsService.exportGoodsReceivedReport(from, to, supplierId),
    'goods-received',
    "Goods received report generated successfully",
    "Failed to export goods received report"
  );

  // Inventory
  const exportMaterialsInventoryMutation = createReportMutation(
    () => reportsService.exportInventoryReport('raw_material'),
    'materials-current',
    "Materials current stock report generated successfully",
    "Failed to export materials current stock report"
  );

  const exportSuppliesInventoryMutation = createReportMutation(
    () => reportsService.exportInventoryReport('supplies'),
    'supplies-current',
    "Supplies current stock report generated successfully",
    "Failed to export supplies current stock report"
  );

  const exportMaterialsAdjustmentsMutation = createReportMutation(
    (from, to) => reportsService.exportInventoryAdjustmentsReport(from, to, 'raw_material'),
    'materials-adjustment',
    "Materials adjustments report generated successfully",
    "Failed to export materials adjustments report",
    "No adjustments found for materials"
  );

  const exportSuppliesAdjustmentsMutation = createReportMutation(
    (from, to) => reportsService.exportInventoryAdjustmentsReport(from, to, 'supplies'),
    'supplies-adjustment',
    "Supplies adjustments report generated successfully",
    "Failed to export supplies adjustments report",
    "No adjustments found for supplies"
  );

  const exportMaterialsLowStockMutation = createReportMutation(
    () => reportsService.exportLowStockReport('raw_material'),
    'materials-low-stock',
    "Materials low stock report generated successfully",
    "Failed to export materials low stock report",
    "No items found below minimum stock level for materials"
  );

  const exportSuppliesLowStockMutation = createReportMutation(
    () => reportsService.exportLowStockReport('supplies'),
    'supplies-low-stock',
    "Supplies low stock report generated successfully",
    "Failed to export supplies low stock report",
    "No items found below minimum stock level for supplies"
  );

  const exportMaterialsOutOfStockMutation = createReportMutation(
    () => reportsService.exportOutOfStockReport('raw_material'),
    'materials-out-of-stock',
    "Materials out of stock report generated successfully",
    "Failed to export materials out of stock report",
    "No out of stock items found for materials"
  );

  const exportSuppliesOutOfStockMutation = createReportMutation(
    () => reportsService.exportOutOfStockReport('supplies'),
    'supplies-out-of-stock',
    "Supplies out of stock report generated successfully",
    "Failed to export supplies out of stock report",
    "No out of stock items found for supplies"
  );

  const exportProductDetailsMutation = createReportMutation(
    () => reportsService.exportProductDetailsReport(),
    'product-details',
    "Product details report generated successfully",
    "Failed to export product details report"
  );

  // Production
  const exportProductionMutation = createReportMutation(
    (from, to) => reportsService.exportProductionReport(from, to),
    'production',
    "Production report generated successfully",
    "Failed to export production report"
  );

  const exportFinishedGoodsSummaryMutation = createReportMutation(
    (from, to) => reportsService.exportFinishedGoodsSummaryReport(from, to),
    'finished-goods',
    "Finished goods summary report generated successfully",
    "Failed to export products summary report"
  );

  const exportIngredientUsageMutation = createReportMutation(
    (from, to) => reportsService.exportIngredientUsageReport(from, to),
    'ingredient-usage',
    "Ingredient usage report generated successfully",
    "Failed to export ingredient usage report"
  );

  // Accounting
  const exportGrossProfitMutation = createReportMutation(
    (from, to) => reportsService.exportGrossProfitReport(from, to),
    'gross-profit',
    "Gross profit report generated successfully",
    "Failed to export gross profit report"
  );

  const exportNetProfitMutation = createReportMutation(
    (from, to) => reportsService.exportNetProfitReport(from, to),
    'net-profit',
    "Net profit report generated successfully",
    "Failed to export net profit report"
  );

  const exportExpensesMutation = createReportMutation(
    (from, to) => reportsService.exportExpensesReport(from, to),
    'expenses',
    "Expenses report generated successfully",
    "Failed to export expenses report"
  );

  const exportOutstandingPaymentsMutation = createReportMutation(
    (from, to) => reportsService.exportOutstandingPaymentsReport(from, to),
    'outstanding-payments',
    "Outstanding payments report generated successfully",
    "Failed to export outstanding payments report"
  );

  const exportPurchaseOrderDetailedMutation = createReportMutation(
    (from, to, supplierId) => reportsService.exportPurchaseOrderDetailedReport(from, to, supplierId),
    'purchase-orders-detailed',
    "Purchase order detailed report generated successfully",
    "Failed to export purchase order detailed report"
  );

  const exportProductsMutation = createReportMutation(
    () => reportsService.exportProductsReport(),
    'products',
    "Products report generated successfully",
    "Failed to export products report"
  );

  const mutations = {
    'sales': exportSalesMutation,
    'cash-sales': exportCashSalesMutation,
    'credit-sales': exportCreditSalesMutation,
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
    'production': exportProductionMutation,
    'finished-goods': exportFinishedGoodsSummaryMutation,
    'ingredient-usage': exportIngredientUsageMutation,
    'gross-profit': exportGrossProfitMutation,
    'net-profit': exportNetProfitMutation,
    'expenses': exportExpensesMutation,
    'outstanding-payments': exportOutstandingPaymentsMutation,
    'products': exportProductsMutation,
  };

  const handleExport = (reportType: string) => {
    if (reportType in mutations) {
      (mutations as any)[reportType].mutate();
    }
  };

  const isExporting = Object.values(mutations).some(mutation => mutation.isPending);

  return { handleExport, isExporting, mutations };
};
