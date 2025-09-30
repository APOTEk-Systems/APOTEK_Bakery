import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { customersService } from '@/services/customers';
import { DateRangePicker, DateRange } from '@/components/ui/DateRange';

const UnpaidSales: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const { data: sales = [], isPending: loading, error, refetch } = useQuery({
    queryKey: ['unpaidSales', dateRange, selectedCustomerId],
    queryFn: () => {
      const params: SalesQueryParams = {
        status: 'unpaid',
        ...(dateRange?.from && { startDate: dateRange.from.toISOString().split('T')[0] }),
        ...(dateRange?.to && { endDate: dateRange.to.toISOString().split('T')[0] }),
      };
      return salesService.getAllSales(params);
    },
    refetchOnMount: false,
  });

  const customersQuery = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersService.getAll(),
  });

  const filteredSales = selectedCustomerId
    ? sales.filter(sale => sale.customerId === parseInt(selectedCustomerId))
    : sales;

  return (
    <Card>
      <CardHeader className='py-4'>
        <CardTitle>Unpaid Sales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end items-center space-x-2 mb-2">
          <Select value={selectedCustomerId || ''} onValueChange={setSelectedCustomerId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by customer" />
            </SelectTrigger>
            <SelectContent>
              {customersQuery.data?.map(customer => (
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
        <SalesTable sales={filteredSales} loading={loading} error={error?.message || null} isUnpaid={true} />
      </CardContent>
    </Card>
  );
};

export default UnpaidSales;
