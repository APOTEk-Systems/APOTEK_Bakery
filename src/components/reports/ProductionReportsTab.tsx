
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange, DateRangePicker } from "@/components/ui/DateRange";
import ReportLayout from "./ReportLayout";
import { useReportMutations } from "@/hooks/useReportMutations";

const ProductionReportsTab = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedProductionReport, setSelectedProductionReport] = useState("");
  const { handleExport, isExporting } = useReportMutations(dateRange);

  return (
    <ReportLayout
      title="Production Reports"
      isExporting={isExporting}
      onExport={() => handleExport(selectedProductionReport)}
      isExportDisabled={!selectedProductionReport}
    >
      <div className="flex gap-4 mt-4">
        <div className="flex-1">
          <Label className="text-sm font-medium">Report Type</Label>
          <Select value={selectedProductionReport} onValueChange={setSelectedProductionReport} >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select production report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="production">Daily Production Report</SelectItem>
              <SelectItem value="production-summary">Production Summary Report</SelectItem>
              {/* <SelectItem value="finished-goods">Finished Goods Report</SelectItem> */}
              <SelectItem value="ingredient-usage">Ingredients Usage Report</SelectItem>
              <SelectItem value="ingredient-summary">Ingredients Summary Report</SelectItem>
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
    </ReportLayout>
  );
};

export default ProductionReportsTab;
