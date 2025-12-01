import React, { useState, useEffect } from 'react';
import { salesService, Payment } from '@/services/sales';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DateRangePicker, DateRange } from '@/components/ui/DateRange';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { format as formatDate } from 'date-fns';

// Helper function to check permissions
const hasPermission = (user: any, permission: string): boolean => {
  if (!user) return false;
  if (user.permissions?.includes("all")) return true;
  return user.permissions?.includes(permission) || false;
};

const PaymentHistoryTab: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const hasViewSales = hasPermission(user, "view:sales");

  // Fetch payment history using React Query
  const { data: paymentsData, isLoading: loading, error } = useQuery({
    queryKey: ['payment-history'],
    queryFn: () => salesService.getAllPayments(),
    enabled: hasViewSales,
  });

  const filteredPayments = (paymentsData || []).filter(payment => {
    // Date range filter (manual)
    if (dateRange?.from || dateRange?.to) {
      const paymentDate = new Date(payment.paymentDate);
      if (dateRange.from && paymentDate < dateRange.from) return false;
      if (dateRange.to && paymentDate > dateRange.to) return false;
    }

    // Search term filter
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchesSaleId = payment.saleId.toString().includes(term);
    const matchesCustomer = payment.customer?.name?.toLowerCase().includes(term) || false;
    return matchesSaleId || matchesCustomer;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, searchTerm]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-TZ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-TZ', {});
  };


  if (!hasViewSales) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h1 className="text-2xl font-bold text-muted-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to view payment history.</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className='py-4'>
        {/* <CardTitle>Payment History</CardTitle> */}
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-2">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by receipt # or customer"
            className="flex-1"
          />
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            Error loading payment history
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {(paymentsData || []).length === 0 ? 'No payment history found' : 'No payments match the current filters'}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  {/* <TableHead>Payment ID</TableHead> */}
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Received By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayments.map((payment, index) => (
                  <TableRow key={payment.id} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                    {/* <TableCell>{payment.id}</TableCell> */}
                    <TableCell>
                      {payment.saleId}
                    </TableCell>
                    <TableCell>{payment.customer?.name || 'Walk-in Customer'}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>{format(payment.paymentDate,"dd-MM-yyyy")}</TableCell>
                     <TableCell>{payment.receivedBy.name || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
        </CardContent>
    </Card>
  );
};

export default PaymentHistoryTab;