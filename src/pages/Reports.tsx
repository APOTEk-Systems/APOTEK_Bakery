import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  FileText,
  Download,
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";
import { reportsService } from "../services/reports";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startDatePopoverOpen, setStartDatePopoverOpen] = useState(false);
  const [endDatePopoverOpen, setEndDatePopoverOpen] = useState(false);
  const { toast } = useToast();

  // Export mutations for each report type
  const exportSalesMutation = useMutation({
    mutationFn: () => reportsService.exportSalesReport(
      startDate?.toISOString().split('T')[0],
      endDate?.toISOString().split('T')[0]
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

  const exportPurchasesMutation = useMutation({
    mutationFn: () => reportsService.exportPurchasesReport(
      startDate?.toISOString().split('T')[0],
      endDate?.toISOString().split('T')[0]
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

  const exportProductionMutation = useMutation({
    mutationFn: () => reportsService.exportProductionReport(
      startDate?.toISOString().split('T')[0],
      endDate?.toISOString().split('T')[0]
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
      downloadBlob(blob, generateFilename('inventory'));
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
      startDate?.toISOString().split('T')[0],
      endDate?.toISOString().split('T')[0]
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
    const startDateStr = startDate?.toISOString().split('T')[0];
    const endDateStr = endDate?.toISOString().split('T')[0];

    console.log('🚀 Starting export for:', reportType, {
      startDate: startDateStr,
      endDate: endDateStr
    });

    switch (reportType) {
      case 'sales':
        exportSalesMutation.mutate();
        break;
      case 'purchases':
        exportPurchasesMutation.mutate();
        break;
      case 'production':
        exportProductionMutation.mutate();
        break;
      case 'inventory':
        exportInventoryMutation.mutate();
        break;
      case 'financial':
        exportFinancialMutation.mutate();
        break;
    }
  };

  const generateFilename = (reportType: string): string => {
    const startDateStr = startDate?.toISOString().split('T')[0];
    const endDateStr = endDate?.toISOString().split('T')[0];

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
                     exportPurchasesMutation.isPending ||
                     exportProductionMutation.isPending ||
                     exportInventoryMutation.isPending ||
                     exportFinancialMutation.isPending;

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reports</h1>
              <p className="text-muted-foreground">
                Generate and export detailed reports
              </p>
            </div>
            <Button
              onClick={handleTestPDF}
              variant="outline"
              className="shadow-warm"
            >
              Test PDF Generation
            </Button>
          </div>

          {/* Date Range Filters - Only show for date-filtered reports */}
          {activeTab !== 'inventory' && (
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
                <Popover open={startDatePopoverOpen} onOpenChange={setStartDatePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-1"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(selectedDate) => {
                        setStartDate(selectedDate);
                        setStartDatePopoverOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1">
                <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
                <Popover open={endDatePopoverOpen} onOpenChange={setEndDatePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-1"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(selectedDate) => {
                        setEndDate(selectedDate);
                        setEndDatePopoverOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="mt-6">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Sales Report
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Generate a comprehensive sales report with transaction details, totals, and credit information.
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleExport('sales')}
                    disabled={isExporting}
                    className="shadow-warm"
                  >
                    {exportSalesMutation.isPending ? (
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
                  Purchases Report
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Generate a detailed purchases report including supplier information and order totals.
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleExport('purchases')}
                    disabled={isExporting}
                    className="shadow-warm"
                  >
                    {exportPurchasesMutation.isPending ? (
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

          <TabsContent value="inventory" className="mt-6">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Inventory Report
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Generate a current inventory report with stock levels, values, and low stock alerts.
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleExport('inventory')}
                    disabled={isExporting}
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
                  Production Report
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Generate a production report with batch details, costs, and efficiency metrics.
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleExport('production')}
                    disabled={isExporting}
                    className="shadow-warm"
                  >
                    {exportProductionMutation.isPending ? (
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
                  Financial Report
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Generate a comprehensive financial report with revenue, expenses, profit, and outstanding credits.
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleExport('financial')}
                    disabled={isExporting}
                    className="shadow-warm"
                  >
                    {exportFinancialMutation.isPending ? (
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