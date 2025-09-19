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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { customersService } from '@/services/customers';

const UnpaidSales: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const dateKey = date ? format(date, 'yyyy-MM-dd') : null;

  const { data: sales = [], isPending: loading, error, refetch } = useQuery({
    queryKey: ['unpaidSales', dateKey, selectedCustomerId],
    queryFn: () => {
      const params: SalesQueryParams = {
        status: 'unpaid',
        ...(date && { startDate: dateKey, endDate: dateKey }),
      };
      return salesService.getAllSales(params);
    },
    enabled: !!dateKey || true, // Always enabled, but key changes with date
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={() => refetch()}>Search</Button>
        </div>
        <SalesTable sales={filteredSales} loading={loading} error={error?.message || null} isUnpaid={true} />
      </CardContent>
    </Card>
  );
};

export default UnpaidSales;
