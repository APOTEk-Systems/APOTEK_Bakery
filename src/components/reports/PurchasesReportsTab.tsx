import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange, DateRangePicker } from '@/components/ui/DateRange';
import ReportLayout from './ReportLayout';
import { useReportMutations } from '@/hooks/useReportMutations';
import { suppliersService } from '@/services/suppliers';

const PurchasesReportsTab = () => {
  // State initialization
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedPurchasesReport, setSelectedPurchasesReport] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('all'); // Initialize to 'all' for better UX

  // Fetching supplier data
  const { data: suppliers = [] } = useQuery({ 
    queryKey: ['suppliers'], 
    queryFn: suppliersService.getAll 
  });

  // Custom hook for report logic (assuming correct implementation)
  const { handleExport, isExporting } = useReportMutations(dateRange, selectedSupplier);

  // Logic to determine if Date Range is needed
  const needsDateRange = [
    'goods-received',
    'purchase-orders-detailed',
  ].includes(selectedPurchasesReport);

  return (
    <ReportLayout
      title="Purchases Reports"
      isExporting={isExporting}
      onExport={() => handleExport(selectedPurchasesReport)}
      isExportDisabled={!selectedPurchasesReport}
    >
      <div className="flex gap-4 mt-4">
        {/* Report Type Select */}
        <div className="flex-1">
          <Label className="text-sm font-medium">Report Type</Label>
          <Select value={selectedPurchasesReport} onValueChange={setSelectedPurchasesReport}>
            <SelectTrigger className={`my-1 ${needsDateRange ? '' : 'max-w-md'}`}>
              <SelectValue placeholder="Select purchases report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="purchase-orders-detailed">Purchase Orders Detailed Report</SelectItem>
              <SelectItem value="purchase-summary">Purchase Orders Summary Report</SelectItem>
              <SelectItem value="goods-received">Material Received Report</SelectItem>
              <SelectItem value="suppliers-list">List of Supplier</SelectItem>
             
            </SelectContent>
          </Select>
        </div>

        {/* Supplier Select */}
        <div className="flex-1">
          <Label className="text-sm font-medium">Supplier</Label>
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

        {/* Date Range Picker (Conditionally Rendered) */}
        {needsDateRange && (
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
    </ReportLayout>
  );
};

export default PurchasesReportsTab;