import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { salesService, Sale, SalesQueryParams, PaginatedSalesResponse } from '@/services/sales';
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const UnpaidSales: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(5);

  const getVisiblePages = (current: number, total: number): (number | string)[] => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < total - 1) {
      rangeWithDots.push('...', total);
    } else if (total > 1) {
      rangeWithDots.push(total);
    }

    return rangeWithDots;
  };

  const { data: paginatedData, isPending: loading, error, refetch } = useQuery<PaginatedSalesResponse>({
    queryKey: ['unpaidSales', selectedCustomer || dateRange, page, limit],
    queryFn: () => {
      if (selectedCustomer) {
        const params: SalesQueryParams = {
          status: 'unpaid',
          customerName: selectedCustomer,
          page,
          limit,
        };
        return salesService.getPaginatedSales(params);
      } else {
        const params: SalesQueryParams = {
          status: 'unpaid',
          page,
          limit,
          ...(dateRange?.from && { startDate: dateRange.from.toISOString().split('T')[0] }),
          ...(dateRange?.to && { endDate: dateRange.to.toISOString().split('T')[0] }),
        };
        return salesService.getPaginatedSales(params);
      }
    },
    refetchOnMount: false,
  });

  const allSales = paginatedData?.sales || [];
  const totalPages = paginatedData?.totalPages || 1;
  const currentPage = paginatedData?.currentPage || 1;

  const customersQuery = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersService.getAll(),
  });

  const filteredSales = allSales;

  return (
    <Card>
      <CardHeader className='py-4'>
        <CardTitle>Unpaid Sales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end items-center space-x-2 mb-2">
          <Select value={selectedCustomer || ''} onValueChange={(value) => {
            setSelectedCustomer(value);
            setPage(1);
          }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              {customersQuery.data?.map(customer => (
                <SelectItem key={customer.id} value={customer.name}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={(newRange) => {
              setDateRange(newRange);
              setPage(1);
            }}
          />
        </div>
        <SalesTable sales={filteredSales} loading={loading} error={error?.message || null} isUnpaid={true} />
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {getVisiblePages(currentPage, totalPages).map((pageNum, index) => (
                  <PaginationItem key={index}>
                    {pageNum === '...' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => setPage(pageNum as number)}
                        isActive={pageNum === currentPage}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnpaidSales;
