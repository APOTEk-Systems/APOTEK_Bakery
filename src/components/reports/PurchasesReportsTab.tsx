
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange, DateRangePicker } from "@/components/ui/DateRange";
import ReportLayout from "./ReportLayout";
import { useReportMutations } from "@/hooks/useReportMutations";
import { suppliersService } from "@/services/suppliers";

const PurchasesReportsTab = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedPurchasesReport, setSelectedPurchasesReport] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: suppliersService.getAll,
  });

  const { handleExport, isExporting } = useReportMutations(dateRange, selectedSupplier);

  return (
    <ReportLayout
      title="Purchases Reports"
      isExporting={isExporting}
      onExport={() => handleExport(selectedPurchasesReport)}
      isExportDisabled={!selectedPurchasesReport}
    >
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
        <Label className="text-sm font-medium">Supplier Filter</Label>
        <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
          <SelectTrigger className="my-1 max-w-md">
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
    </ReportLayout>
  );
};

export default PurchasesReportsTab;
