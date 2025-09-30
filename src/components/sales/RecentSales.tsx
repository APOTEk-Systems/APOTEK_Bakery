import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { customersService } from '@/services/customers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { salesService, Sale, SalesQueryParams } from '@/services/sales';
import SalesTable from './SalesTable';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DateRangePicker, DateRange } from '@/components/ui/DateRange';

const RecentSales: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const startDate = dateRange?.from ? dateRange.from.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const endDate = dateRange?.to ? dateRange.to.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

  const { data: sales = [], isPending: loading, error, refetch } = useQuery({
    queryKey: ['recentSales', startDate, endDate, selectedCustomerId],
    queryFn: () => salesService.getAllSales({ startDate, endDate }),
  });

  const customersQuery = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersService.getAll(),
  });

  const customersWithCash = [
    { id: 'cash', name: 'Cash' },
    ...(customersQuery.data || []),
  ];

  const filteredSales = selectedCustomerId
    ? selectedCustomerId === 'cash'
      ? sales.filter(sale => !sale.customer || !sale.customer.name)
      : sales.filter(sale => sale.customerId === parseInt(selectedCustomerId))
    : sales;

  return (
    <Card>
      <CardHeader className='py-4'>
        <CardTitle>Sales History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end items-center space-x-2 mb-2">
          <Select value={selectedCustomerId || ''} onValueChange={setSelectedCustomerId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by customer" />
            </SelectTrigger>
            <SelectContent>
              {customersWithCash.map(customer => (
                <SelectItem key={customer.id} value={customer.id.toString()}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          <Button onClick={() => refetch()}>Search</Button>
        </div>
        <SalesTable sales={filteredSales} loading={loading} error={error?.message || null} />
      </CardContent>
    </Card>
  );
};

export default RecentSales;