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

const Reports = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedSalesReport, setSelectedSalesReport] = useState("");
  const [selectedPurchasesReport, setSelectedPurchasesReport] = useState("");
  const [selectedInventoryReport, setSelectedInventoryReport] = useState("");
  const [selectedProductionReport, setSelectedProductionReport] = useState("");
  const [selectedAccountingReport, setSelectedAccountingReport] = useState("");
  const { toast } = useToast();

  // Export mutations for each report type
  const exportSalesMutation = useMutation({
    mutationFn: () => reportsService.exportSalesReport(
      dateRange?.from?.toISOString().split('T')[0],
      dateRange?.to?.toISOString().split('T')[0]
    ),
    onSuccess: (blob) => {
      downloadBlob(blob, generateFilename('sales'));
      toast({
        title: "Success",
        description: "Sales report exported successfully",
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

  const exportCustomerSalesMutation = useMutation({
    mutationFn: () => reportsService.exportCustomerSalesReport(
      dateRange?.from?.toISOString().split('T')[0],
      dateRange?.to?.toISOString().split('T')[0]
    ),
    onSuccess: (blob) => {
      downloadBlob(blob, generateFilename('customer-sales'));
      toast({
        title: "Success",
        description: "Customer sales report exported successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to export customer sales report",
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
      downloadBlob(blob, generateFilename('purchases'));
      toast({
        title: "Success",
        description: "Purchases report exported successfully",
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
      downloadBlob(blob, generateFilename('supplier-purchases'));
      toast({
        title: "Success",
        description: "Supplier-wise purchases report exported successfully",
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
      downloadBlob(blob, generateFilename('ingredient-trend'));
      toast({
        title: "Success",
        description: "Ingredient purchase trend report exported successfully",
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
      downloadBlob(blob, generateFilename('finished-goods'));
      toast({
        title: "Success",
        description: "Finished goods summary report exported successfully",
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
      downloadBlob(blob, generateFilename('ingredient-usage'));
      toast({
        title: "Success",
        description: "Ingredient usage report exported successfully",
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
      downloadBlob(blob, generateFilename('production'));
      toast({
        title: "Success",
        description: "Production report exported successfully",
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
      downloadBlob(blob, generateFilename('material'));
      toast({
        title: "Success",
        description: "Inventory report exported successfully",
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
      downloadBlob(blob, generateFilename('financial'));
      toast({
        title: "Success",
        description: "Financial report exported successfully",
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
      downloadBlob(blob, generateFilename('profit-loss'));
      toast({
        title: "Success",
        description: "Profit and Loss report exported successfully",
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
      downloadBlob(blob, generateFilename('expense-breakdown'));
      toast({
        title: "Success",
        description: "Expense breakdown report exported successfully",
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


  const downloadBlob = (blob: Blob, filename: string) => {
    console.log('💾 Creating download for blob:', { size: blob.size, type: blob.type, filename });
    try {
      const url = window.URL.createObjectURL(blob);
      console.log('🔗 Blob URL created:', url);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      console.log('📎 Triggering download...');
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('✅ Download completed');
    } catch (error) {
      console.error('❌ Error in downloadBlob:', error);
    }
  };

  const handleTestPDF = () => {
    console.log('🧪 Testing PDF generation...');
    try {
      const blob = reportsService.testPDFGeneration();
      downloadBlob(blob, 'test-report.pdf');
      console.log('✅ Test PDF download initiated');
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
      case 'customer-sales':
        exportCustomerSalesMutation.mutate();
        break;
      case 'purchases':
        exportPurchasesMutation.mutate();
        break;
      case 'supplier-purchases':
        exportSupplierWisePurchasesMutation.mutate();
        break;
      case 'ingredient-trend':
        exportIngredientPurchaseTrendMutation.mutate();
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
                      exportCustomerSalesMutation.isPending ||
                      exportPurchasesMutation.isPending ||
                      exportSupplierWisePurchasesMutation.isPending ||
                      exportIngredientPurchaseTrendMutation.isPending ||
                      exportProductionMutation.isPending ||
                      exportFinishedGoodsSummaryMutation.isPending ||
                      exportIngredientUsageMutation.isPending ||
                      exportInventoryMutation.isPending ||
                      exportFinancialMutation.isPending ||
                      exportProfitAndLossMutation.isPending ||
                      exportExpenseBreakdownMutation.isPending;

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
            <TabsTrigger value="material">Materials</TabsTrigger>
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
                        <SelectItem value="customer-sales">Customer Sales Report</SelectItem>
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
                    {(exportSalesMutation.isPending || exportCustomerSalesMutation.isPending) ? (
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
                        <SelectItem value="purchases">Purchases Report</SelectItem>
                        <SelectItem value="supplier-purchases">Supplier-wise Purchases</SelectItem>
                        <SelectItem value="ingredient-trend">Ingredient Purchase Trend</SelectItem>
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
                    onClick={() => handleExport(selectedPurchasesReport)}
                    disabled={isExporting || !selectedPurchasesReport}
                    className="shadow-warm"
                  >
                    {(exportPurchasesMutation.isPending || exportSupplierWisePurchasesMutation.isPending || exportIngredientPurchaseTrendMutation.isPending) ? (
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
                        Export PDF
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