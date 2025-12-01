
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange, DateRangePicker } from "@/components/ui/DateRange";
import ReportLayout from "./ReportLayout";
import { useReportMutations } from "@/hooks/useReportMutations";
import { useQuery } from "@tanstack/react-query";
import { getProductionRuns } from "@/services/productionRuns";

const ProductionReportsTab = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedProductionReport, setSelectedProductionReport] = useState("");
  const { handleExport, isExporting } = useReportMutations(dateRange);

  // Query for production runs data
  const productionRunsQuery = useQuery({
    queryKey: ["productionRuns", dateRange],
    queryFn: () => {
      const params: any = {};

      // Add date range if set
      if (dateRange?.from && dateRange?.to) {
        params.startDate = dateRange.from.toISOString().split('T')[0];
        params.endDate = dateRange.to.toISOString().split('T')[0];
      }

      return getProductionRuns(params);
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
  });

  const productionRuns = productionRunsQuery.data?.productionRuns || [];
  const total = productionRunsQuery.data?.total || 0;

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
              {/* <SelectItem value="finished-goods">Finished Goods Report</SelectItem> */}
              <SelectItem value="ingredient-usage">Ingredients Usage Report</SelectItem>
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

      {/* Display production runs data */}
      {/* {selectedProductionReport === "production" && productionRuns.length > 0 && (
        <div className="mt-6">
          <div className="text-sm text-muted-foreground mb-2">
            Found {total} production runs for the selected date range
          </div>
        </div>
      )} */}
    </ReportLayout>
  );
};

export default ProductionReportsTab;
