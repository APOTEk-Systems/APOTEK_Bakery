import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReportLayout from "./ReportLayout";
import { DateRange, DateRangePicker } from "@/components/ui/DateRange";
import { useReportMutations } from "@/hooks/useReportMutations";

const SalesReportsTab = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedSalesReport, setSelectedSalesReport] = useState("");
  const { handleExport, isExporting } = useReportMutations(dateRange);

  return (
    <ReportLayout
      title="Sales Summary Reports"
      isExporting={isExporting}
      onExport={() => handleExport(selectedSalesReport)}
      isExportDisabled={!selectedSalesReport}
    >
      <div className="flex gap-4 mt-4">
        <div className="flex-1">
          <Label className="text-sm font-medium">Report Type</Label>
          <Select
            value={selectedSalesReport}
            onValueChange={setSelectedSalesReport}
          >
              <SelectTrigger className="my-1">
              <SelectValue placeholder="Select sales summary report" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales Report</SelectItem>
              <SelectItem value="cash-sales">Cash Sales Report</SelectItem>
              <SelectItem value="credit-sales">Credit Sales Report</SelectItem>
              <SelectItem value="sales-summary">Sales Summary Report</SelectItem>
              <SelectItem value="products">Price List Report</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          {selectedSalesReport !== "products" && (
            <>
              <Label className="text-sm font-medium">Date Range</Label>
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                className="mt-1"
              />
            </>
          )}
        </div>
      </div>
    </ReportLayout>
  );
};

export default SalesReportsTab;
