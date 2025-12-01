import { useState } from 'react';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import ReportLayout from './ReportLayout';
import { DateRange, DateRangePicker } from '@/components/ui/DateRange';
import { useReportMutations } from '@/hooks/useReportMutations';
import { customersService, type Customer } from '@/services/customers';
import { useQuery } from '@tanstack/react-query';

const SalesReportsTab = () => {
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
	const [selectedSalesReport, setSelectedSalesReport] = useState('');
	const [selectedCustomer, setSelectedCustomer] = useState<string | undefined>(
		'all'
	);
	const { handleExport, isExporting } = useReportMutations(
		dateRange,
		undefined,
		selectedCustomer
	);

	// Load customers for the filter
	const customersQuery = useQuery({
		queryKey: ['customers'],
		queryFn: () => customersService.getAll(),
	});
	const customers = customersQuery.data || [];

	return (
		<ReportLayout
			title='Sales Summary Reports'
			isExporting={isExporting}
			onExport={() => handleExport(selectedSalesReport)}
			isExportDisabled={!selectedSalesReport}>
			<div className='flex gap-4 mt-4'>
				<div className='flex-1'>
					<Label className='text-sm font-medium'>Report Type</Label>
					<Select
						value={selectedSalesReport}
						onValueChange={setSelectedSalesReport}>
						<SelectTrigger className='my-1'>
							<SelectValue placeholder='Select sales report type' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='sales'>Sales Report</SelectItem>
							<SelectItem value='cash-sales'>Cash Sales Report</SelectItem>
							<SelectItem value='credit-sales'>Credit Sales Report</SelectItem>
							<SelectItem value='sales-summary'>
								Sales Summary Report
							</SelectItem>
							<SelectItem value='cash-sales-summary'>
								Cash Sales Summary Report
							</SelectItem>
							<SelectItem value='credit-sales-summary'>
								Credit Sales Summary Report
							</SelectItem>
							<SelectItem value='products'>Price List Report</SelectItem>
							<SelectItem value='credit-payments'>
								Credit Payments Report
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className='flex-1'>
					{selectedSalesReport !== 'products' && (
						<>
							{selectedSalesReport === 'credit-payments' && (
								<>
									<Label className='text-sm font-medium mt-4'>Customer</Label>
									<Select
										value={selectedCustomer}
										onValueChange={(v: string) => setSelectedCustomer(v)}
										className='mt-1'>
										<SelectTrigger className='my-1'>
											<SelectValue placeholder='Select customer or all' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value={'all'}>All Customers</SelectItem>
											{customers.map((c: Customer) => (
												<SelectItem
													key={c.id}
													value={c.id.toString()}>
													{c.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</>
							)}
							<>
								<Label className='text-sm font-medium'>Date Range</Label>
								<DateRangePicker
									dateRange={dateRange}
									onDateRangeChange={setDateRange}
									className='mt-1'
								/>
							</>
						</>
					)}
				</div>
			</div>
		</ReportLayout>
	);
};

export default SalesReportsTab;
