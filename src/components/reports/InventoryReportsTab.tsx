import { useState } from 'react';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { DateRange, DateRangePicker } from '@/components/ui/DateRange';
import ReportLayout from './ReportLayout';
import { useReportMutations } from '@/hooks/useReportMutations';

const InventoryReportsTab = () => {
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
	const [selectedInventoryReport, setSelectedInventoryReport] = useState('');
	const { handleExport, isExporting } = useReportMutations(dateRange);

	const needsDateRange = [
		'materials-adjustment',
		'supplies-adjustment',
	].includes(selectedInventoryReport);

	return (
		<ReportLayout
			title='Inventory Reports'
			isExporting={isExporting}
			onExport={() => handleExport(selectedInventoryReport)}
			isExportDisabled={!selectedInventoryReport}>
			<div className='flex gap-4 mt-4'>
				<div className='flex-1'>
					<Label className='text-sm font-medium'>Report Type</Label>
					<Select
						value={selectedInventoryReport}
						onValueChange={setSelectedInventoryReport}>
						<SelectTrigger
							className={`my-1 ${needsDateRange ? '' : 'max-w-md'}`}>
							<SelectValue placeholder='Select inventory report type' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='materials-current'>
								Materials Current Stock
							</SelectItem>
							<SelectItem value='supplies-current'>
								Supplies Current Stock
							</SelectItem>
							<SelectItem value='product-current-stock'>
								Product Current Stock
							</SelectItem>
							<SelectItem value='materials-low-stock'>
								Materials Below Min Level
							</SelectItem>
							<SelectItem value='supplies-low-stock'>
								Supplies Below Min Level
							</SelectItem>
							<SelectItem value='materials-adjustment'>
								Materials Adjustments
							</SelectItem>
							<SelectItem value='supplies-adjustment'>
								Supplies Adjustments
							</SelectItem>
							<SelectItem value='materials-out-of-stock'>
								Materials Out of Stock
							</SelectItem>
							<SelectItem value='supplies-out-of-stock'>
								Supplies Out of Stock
							</SelectItem>
							<SelectItem value='product-details'>Product Details</SelectItem>
							
							<SelectItem value='suppliers-list'>Suppliers List</SelectItem>
						</SelectContent>
					</Select>
				</div>
				{needsDateRange && (
					<div className='flex-1'>
						<Label className='text-sm font-medium'>Date Range</Label>
						<DateRangePicker
							dateRange={dateRange}
							onDateRangeChange={setDateRange}
							className='mt-1'
						/>
					</div>
				)}
			</div>
		</ReportLayout>
	);
};

export default InventoryReportsTab;
