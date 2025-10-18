import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange, DateRangePicker } from "@/components/ui/DateRange";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Download,
  Loader2,
} from "lucide-react";
import { reportsService } from "../services/reports";
import { suppliersService, Supplier } from "../services/suppliers";


const Reports = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedSalesReport, setSelectedSalesReport] = useState("");
  const [selectedPurchasesReport, setSelectedPurchasesReport] = useState("");
  const [selectedInventoryReport, setSelectedInventoryReport] = useState("");
  const [selectedProductionReport, setSelectedProductionReport] = useState("");
  const [selectedAccountingReport, setSelectedAccountingReport] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const { toast } = useToast();

  // Fetch suppliers for filtering
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: suppliersService.getAll,
  });

  // Export mutations for each report type
  const exportSalesMutation = useMutation({
    mutationFn: () => reportsService.exportSalesReport(
      dateRange?.from?.toISOString().split('T')[0],
      dateRange?.to?.toISOString().split('T')[0]
    ),
    onSuccess: (blob) => {
      previewBlob(blob, generateFilename('sales'));
      toast({
        title: "Success",
        description: "Sales report generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to export sales report",
        variant: "destructive",
      });
    },
  });

  const exportCashSalesMutation = useMutation({
    mutationFn: () => reportsService.exportCashSalesReport(
      dateRange?.from?.toISOString().split('T')[0],
      dateRange?.to?.toISOString().split('T')[0]
    ),
    onSuccess: (blob) => {
      previewBlob(blob, generateFilename('cash-sales'));
      toast({
        title: "Success",
        description: "Cash sales report generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate cash sales report",
        variant: "destructive",
      });
    },
  });

  const exportCreditSalesMutation = useMutation({
    mutationFn: () => reportsService.exportCreditSalesReport(
      dateRange?.from?.toISOString().split('T')[0],
      dateRange?.to?.toISOString().split('T')[0]
    ),
    onSuccess: (blob) => {
      previewBlob(blob, generateFilename('credit-sales'));
      toast({
        title: "Success",
        description: "Credit sales report generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate credit sales report",
        variant: "destructive",
      });
    },
  });

  const exportPurchasesMutation = useMutation({
    mutationFn: () => reportsService.exportPurchasesReport(
      dateRange?.from?.toISOString().split('T')[0],
      dateRange?.to?.toISOString().split('T')[0]
    ),
    onSuccess: (blob) => {
      previewBlob(blob, generateFilename('purchases'));
      toast({
        title: "Success",
        description: "Purchases report generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to export purchases report",
        variant: "destructive",
      });
    },
  });

  const exportSupplierWisePurchasesMutation = useMutation({
    mutationFn: () => reportsService.exportSupplierWisePurchasesReport(
      dateRange?.from?.toISOString().split('T')[0],
      dateRange?.to?.toISOString().split('T')[0]
    ),
    onSuccess: (blob) => {
      previewBlob(blob, generateFilename('supplier-purchases'));
      toast({
        title: "Success",
        description: "Supplier-wise purchases report generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to export supplier-wise purchases report",
        variant: "destructive",
      });
    },
  });

  const exportIngredientPurchaseTrendMutation = useMutation({
    mutationFn: () => reportsService.exportIngredientPurchaseTrendReport(
      dateRange?.from?.toISOString().split('T')[0],
      dateRange?.to?.toISOString().split('T')[0]
    ),
    onSuccess: (blob) => {
      previewBlob(blob, generateFilename('ingredient-trend'));
      toast({
        title: "Success",
        description: "Ingredient purchase trend report generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to export ingredient purchase trend report",
        variant: "destructive",
      });
    },
  });

  const exportFinishedGoodsSummaryMutation = useMutation({
    mutationFn: () => reportsService.exportFinishedGoodsSummaryReport(
      dateRange?.from?.toISOString().split('T')[0],
      dateRange?.to?.toISOString().split('T')[0]
    ),
    onSuccess: (blob) => {
      previewBlob(blob, generateFilename('finished-goods'));
      toast({
        title: "Success",
        description: "Finished goods summary report generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to export products summary report",
        variant: "destructive",
      });
    },
  });

  const exportIngredientUsageMutation = useMutation({
    mutationFn: () => reportsService.exportIngredientUsageReport(
      dateRange?.from?.toISOString().split('T')[0],
      dateRange?.to?.toISOString().split('T')[0]
    ),
    onSuccess: (blob) => {
      previewBlob(blob, generateFilename('ingredient-usage'));
      toast({
        title: "Success",
        description: "Ingredient usage report generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to export ingredient usage report",
        variant: "destructive",
      });
    },
  });

  const exportProductionMutation = useMutation({
    mutationFn: () => reportsService.exportProductionReport(
      dateRange?.from?.toISOString().split('T')[0],
      dateRange?.to?.toISOString().split('T')[0]
    ),
    onSuccess: (blob) => {
      previewBlob(blob, generateFilename('production'));
      toast({
        title: "Success",
        description: "Production report generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to export production report",
        variant: "destructive",
      });
    },
  });

  const exportInventoryMutation = useMutation({
    mutationFn: () => reportsService.exportInventoryReport(),
    onSuccess: (blob) => {
      previewBlob(blob, generateFilename('material'));
      toast({
        title: "Success",
        description: "Inventory report generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to export inventory report",
        variant: "destructive",
      });
    },
  });

  const exportFinancialMutation = useMutation({
    mutationFn: () => reportsService.exportFinancialReport(
      dateRange?.from?.toISOString().split('T')[0],
      dateRange?.to?.toISOString().split('T')[0]
    ),
    onSuccess: (blob) => {
      previewBlob(blob, generateFilename('financial'));
      toast({
        title: "Success",
        description: "Financial report generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to export financial report",
        variant: "destructive",
      });
    },
  });

  const exportProfitAndLossMutation = useMutation({
    mutationFn: () => reportsService.exportProfitAndLossReport(
      dateRange?.from?.toISOString().split('T')[0],
      dateRange?.to?.toISOString().split('T')[0]
    ),
    onSuccess: (blob) => {
      previewBlob(blob, generateFilename('profit-loss'));
      toast({
        title: "Success",
        description: "Profit and Loss report generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to export profit and loss report",
        variant: "destructive",
      });
    },
  });

  const exportExpenseBreakdownMutation = useMutation({
    mutationFn: () => reportsService.exportExpenseBreakdownReport(
      dateRange?.from?.toISOString().split('T')[0],
      dateRange?.to?.toISOString().split('T')[0]
    ),
    onSuccess: (blob) => {
      previewBlob(blob, generateFilename('expense-breakdown'));
      toast({
        title: "Success",
        description: "Expense breakdown report generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to export expense breakdown report",
        variant: "destructive",
      });
    },
  });

  const exportProductsMutation = useMutation({
    mutationFn: () => reportsService.exportProductsReport(),
    onSuccess: (blob) => {
      previewBlob(blob, generateFilename('products'));
      toast({
        title: "Success",
        description: "Products report generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to export products report",
        variant: "destructive",
      });
    },
  });

  const exportGoodsReceivedMutation = useMutation({
    mutationFn: () => reportsService.exportGoodsReceivedReport(
      dateRange?.from?.toISOString().split('T')[0],
      dateRange?.to?.toISOString().split('T')[0],
      selectedSupplier && selectedSupplier !== "all" ? parseInt(selectedSupplier) : undefined
    ),
    onSuccess: (blob) => {
      previewBlob(blob, generateFilename('goods-received'));
      toast({
        title: "Success",
        description: "Goods received report generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to export goods received report",
        variant: "destructive",
      });
    },
  });


  const previewBlob = (blob: Blob, filename: string) => {
    console.log('💾 Creating preview for blob:', { size: blob.size, type: blob.type, filename });
    try {
      const url = window.URL.createObjectURL(blob);
      console.log('🔗 Blob URL created:', url);
      window.open(url, '_blank');
      console.log('✅ Preview opened in new tab');
    } catch (error) {
      console.error('❌ Error in previewBlob:', error);
    }
  };

  const handleTestPDF = () => {
    console.log('🧪 Testing PDF generation...');
    try {
      const blob = reportsService.testPDFGeneration();
      previewBlob(blob, 'test-report.pdf');
      console.log('✅ Test PDF preview initiated');
    } catch (error) {
      console.error('❌ Test PDF failed:', error);
    }
  };

  const handleExport = (reportType: string) => {
    console.log('🚀 Starting export for:', reportType, {
      dateRange
    });

    switch (reportType) {
      case 'sales':
        exportSalesMutation.mutate();
        break;
      case 'cash-sales':
        exportCashSalesMutation.mutate();
        break;
      case 'credit-sales':
        exportCreditSalesMutation.mutate();
        break;
      case 'products':
        exportProductsMutation.mutate();
        break;
      case 'production':
        exportProductionMutation.mutate();
        break;
      case 'finished-goods':
        exportFinishedGoodsSummaryMutation.mutate();
        break;
      case 'ingredient-usage':
        exportIngredientUsageMutation.mutate();
        break;
      case 'material':
        exportInventoryMutation.mutate();
        break;
      case 'low-stock':
        // Placeholder - not implemented yet
        toast({
          title: "Not Implemented",
          description: "Low stock alert report is not yet implemented",
          variant: "destructive",
        });
        break;
      case 'stock-adjustment':
        // Placeholder - not implemented yet
        toast({
          title: "Not Implemented",
          description: "Stock adjustment report is not yet implemented",
          variant: "destructive",
        });
        break;
      case 'financial':
        exportFinancialMutation.mutate();
        break;
      case 'profit-loss':
        exportProfitAndLossMutation.mutate();
        break;
      case 'expense-breakdown':
        exportExpenseBreakdownMutation.mutate();
        break;
      case 'products':
        exportProductsMutation.mutate();
        break;
      case 'goods-received':
        exportGoodsReceivedMutation.mutate();
        break;
    }
  };

  const generateFilename = (reportType: string): string => {
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

  const isExporting = exportSalesMutation.isPending ||
                      exportCashSalesMutation.isPending ||
                      exportCreditSalesMutation.isPending ||
                      exportProductionMutation.isPending ||
                      exportFinishedGoodsSummaryMutation.isPending ||
                      exportIngredientUsageMutation.isPending ||
                      exportInventoryMutation.isPending ||
                      exportFinancialMutation.isPending ||
                      exportProfitAndLossMutation.isPending ||
                      exportExpenseBreakdownMutation.isPending ||
                      exportProductsMutation.isPending ||
                      exportGoodsReceivedMutation.isPending;

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            </div>
          </div>

        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="material">Inventory</TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
            <TabsTrigger value="financial">Accounting</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="mt-6">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Sales Reports
                </CardTitle>
                <div className="flex gap-4 mt-4">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Report Type</Label>
                    <Select value={selectedSalesReport} onValueChange={setSelectedSalesReport}>
                      <SelectTrigger className="my-1">
                        <SelectValue placeholder="Select sales report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales Report</SelectItem>
                        <SelectItem value="cash-sales">Cash Report</SelectItem>
                        <SelectItem value="credit-sales">Credit Report</SelectItem>
                        <SelectItem value="products">Price List</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Date Range</Label>
                    <DateRangePicker
                      dateRange={dateRange}
                      onDateRangeChange={setDateRange}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
          
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleExport(selectedSalesReport)}
                    disabled={isExporting || !selectedSalesReport}
                    className="shadow-warm"
                  >
                    {(exportSalesMutation.isPending || exportCashSalesMutation.isPending || exportCreditSalesMutation.isPending || exportProductsMutation.isPending) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Generate PDF
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases" className="mt-6">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Purchases Reports
                </CardTitle>
                <div className="flex gap-4 mt-4">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Report Type</Label>
                    <Select value={selectedPurchasesReport} onValueChange={setSelectedPurchasesReport}>
                      <SelectTrigger className="my-1">
                        <SelectValue placeholder="Select purchases report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="goods-received">Material Receiving Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Date Range</Label>
                    <DateRangePicker
                      dateRange={dateRange}
                      onDateRangeChange={setDateRange}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label className="text-sm font-medium">Supplier Filter (Optional)</Label>
                  <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                    <SelectTrigger className="my-1">
                      <SelectValue placeholder="All Suppliers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Suppliers</SelectItem>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleExport(selectedPurchasesReport)}
                    disabled={isExporting || !selectedPurchasesReport}
                    className="shadow-warm"
                  >
                    {exportGoodsReceivedMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Generate PDF
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="material" className="mt-6">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Inventory Reports
                </CardTitle>
                <div className="flex gap-4 mt-4">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Report Type</Label>
                    <Select value={selectedInventoryReport} onValueChange={setSelectedInventoryReport} >
                      <SelectTrigger className="my-1 w-1/2">
                        <SelectValue placeholder="Select inventory report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="material">Current Material Levels</SelectItem>
                        <SelectItem value="low-stock">Low Stock Alert Report</SelectItem>
                        <SelectItem value="stock-adjustment">Stock Adjustment Report</SelectItem>
                        <SelectItem value="products">Price List</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(selectedInventoryReport === 'low-stock' || selectedInventoryReport === 'stock-adjustment') && (
                    <div className="flex-1">
                      <Label className="text-sm font-medium">Date Range</Label>
                      <DateRangePicker
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleExport(selectedInventoryReport)}
                    disabled={isExporting || !selectedInventoryReport || selectedInventoryReport === 'low-stock' || selectedInventoryReport === 'stock-adjustment'}
                    className="shadow-warm"
                  >
                    {exportInventoryMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Generate PDF
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="production" className="mt-6">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Production Reports
                </CardTitle>
                <div className="flex gap-4 mt-4">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Report Type</Label>
                    <Select value={selectedProductionReport} onValueChange={setSelectedProductionReport} >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select production report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">Daily Production Batches Report</SelectItem>
                        <SelectItem value="finished-goods">Finished Goods Summary</SelectItem>
                        <SelectItem value="ingredient-usage">Ingredient Usage Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Date Range</Label>
                    <DateRangePicker
                      dateRange={dateRange}
                      onDateRangeChange={setDateRange}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
           
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleExport(selectedProductionReport)}
                    disabled={isExporting || !selectedProductionReport}
                    className="shadow-warm"
                  >
                    {(exportProductionMutation.isPending || exportFinishedGoodsSummaryMutation.isPending || exportIngredientUsageMutation.isPending) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="mt-6">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Accounting Reports
                </CardTitle>
                <div className="flex gap-4 mt-4">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Report Type</Label>
                    <Select value={selectedAccountingReport} onValueChange={setSelectedAccountingReport}>
                      <SelectTrigger className="my-1">
                        <SelectValue placeholder="Select accounting report type" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* <SelectItem value="financial">Financial Summary</SelectItem> */}
                        <SelectItem value="profit-loss">Profit and Loss</SelectItem>
                        <SelectItem value="expense-breakdown">Expense Category Breakdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Date Range</Label>
                    <DateRangePicker
                      dateRange={dateRange}
                      onDateRangeChange={setDateRange}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
               
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleExport(selectedAccountingReport)}
                    disabled={isExporting || !selectedAccountingReport}
                    className="shadow-warm"
                  >
                    {(exportFinancialMutation.isPending || exportProfitAndLossMutation.isPending || exportExpenseBreakdownMutation.isPending) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;