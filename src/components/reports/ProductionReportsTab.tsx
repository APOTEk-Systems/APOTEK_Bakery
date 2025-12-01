
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange, DateRangePicker } from "@/components/ui/DateRange";
import ReportLayout from "./ReportLayout";
import { useReportMutations } from "@/hooks/useReportMutations";
import { useQuery } from "@tanstack/react-query";
import { getProductionRuns } from "@/services/productionRuns";
import { getProductionSummaryReport, getIngredientSummaryReport } from '@/services/reports';

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

  const productionSummaryQuery = useQuery({
    queryKey: ["productionSummary", dateRange],
    queryFn: () => {
      const params: any = {};
      if (dateRange?.from && dateRange?.to) {
        params.startDate = dateRange.from.toISOString().split('T')[0];
        params.endDate = dateRange.to.toISOString().split('T')[0];
      }
      return getProductionSummaryReport(params.startDate, params.endDate);
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
  });

  const ingredientSummaryQuery = useQuery({
    queryKey: ["ingredientSummary", dateRange],
    queryFn: () => {
      const params: any = {};
      if (dateRange?.from && dateRange?.to) {
        params.startDate = dateRange.from.toISOString().split('T')[0];
        params.endDate = dateRange.to.toISOString().split('T')[0];
      }
      return getIngredientSummaryReport(params.startDate, params.endDate);
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
  });

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
{/* 
     
      {selectedProductionReport === 'production-summary' && productionSummaryQuery.data?.data?.length > 0 && (
        <div className="mt-6">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">#</th>
                <th className="p-2">Date</th>
                <th className="p-2">Product</th>
                <th className="p-2">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {productionSummaryQuery.data.data.map((row: any, idx: number) => (
                <tr key={`${row.date}-${row.product}-${idx}`} className="border-t">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">{row.date}</td>
                  <td className="p-2">{row.product}</td>
                  <td className="p-2">{row.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedProductionReport === 'ingredient-summary' && ingredientSummaryQuery.data?.data?.length > 0 && (
        <div className="mt-6">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">#</th>
                <th className="p-2">Date</th>
                <th className="p-2">Ingredient</th>
                <th className="p-2">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {ingredientSummaryQuery.data.data.map((row: any, idx: number) => (
                <tr key={`${row.date}-${row.ingredient}-${idx}`} className="border-t">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">{row.date}</td>
                  <td className="p-2">{row.ingredient}</td>
                  <td className="p-2">{row.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )} */}
    </ReportLayout>
  );
};

export default ProductionReportsTab;
