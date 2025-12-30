
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange, DateRangePicker } from "@/components/ui/DateRange";
import ReportLayout from "./ReportLayout";
import { useReportMutations } from "@/hooks/useReportMutations";

const AccountingReportsTab = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedAccountingReport, setSelectedAccountingReport] = useState("");
  const { handleExport, isExporting } = useReportMutations(dateRange);

  return (
    <ReportLayout
      title="Accounting Reports"
      isExporting={isExporting}
      onExport={() => handleExport(selectedAccountingReport)}
      isExportDisabled={!selectedAccountingReport}
    >
      <div className="flex gap-4 mt-4">
        <div className="flex-1">
          <Label className="text-sm font-medium">Report Type</Label>
          <Select value={selectedAccountingReport} onValueChange={setSelectedAccountingReport}>
            <SelectTrigger className="my-1">
              <SelectValue placeholder="Select accounting report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily-sales">Daily Sales Report</SelectItem>
              <SelectItem value="gross-profit">Gross Profit Report</SelectItem>
              <SelectItem value="net-profit">Net Profit Report</SelectItem>
              <SelectItem value="expenses">Expenses Report</SelectItem>
              <SelectItem value="outstanding-payments">Outstanding Payments Report</SelectItem>
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

export default AccountingReportsTab;
