import React, { useState } from 'react';
import { salesService, Sale } from '@/services/sales';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateRangePicker, DateRange } from '@/components/ui/DateRange';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Label } from '../ui/label';

// Helper function to check permissions
const hasPermission = (user: any, permission: string): boolean => {
  if (!user) return false;
  if (user.permissions?.includes("all")) return true;
  return user.permissions?.includes(permission) || false;
};

const OutstandingPaymentsTab: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const hasViewSales = hasPermission(user, "view:sales");
  const hasManagePayments = hasPermission(user, "manage:payments");

  // Fetch outstanding payments using React Query
  const { data: salesData, isLoading: loading, error } = useQuery({
    queryKey: ['outstanding-payments'],
    queryFn: async () => {
      const allSales = await salesService.getPaginatedSales({
        status: 'unpaid',
        isCredit: true
      });

      // Filter sales with outstanding balances
      return allSales.sales.filter(sale =>
        sale.outstandingBalance && sale.outstandingBalance > 0
      );
    },
    enabled: hasViewSales,
  });

  const filteredSales = (salesData || []).filter(sale => {
    // Date range filter (manual)
    if (dateRange?.from || dateRange?.to) {
      const saleDate = new Date(sale.createdAt);
      if (dateRange.from && saleDate < dateRange.from) return false;
      if (dateRange.to && saleDate > dateRange.to) return false;
    }

    // Search term filter
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchesSaleId = sale.id.toString().includes(term);
    const matchesCustomer = (sale.customer?.name || 'Walk-in Customer').toLowerCase().includes(term);
    return matchesSaleId || matchesCustomer;
  });


  // Mutation for creating payments
  const createPaymentMutation = useMutation({
    mutationFn: ({ saleId, amount }: { saleId: number; amount: number }) =>
      salesService.createPayment(saleId, amount),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
      setIsPaymentDialogOpen(false);
      setPaymentAmount('');
      setSelectedSale(null);
      // Invalidate and refetch outstanding payments
      queryClient.invalidateQueries({ queryKey: ['outstanding-payments'] });
    },
    onError: (error) => {
      console.error('Error making payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    },
  });

  const handleMakePayment = () => {
    if (!selectedSale || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Payment amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (amount > (selectedSale.outstandingBalance || 0)) {
      toast({
        title: "Invalid Amount",
        description: "Payment amount cannot exceed outstanding balance",
        variant: "destructive",
      });
      return;
    }

    createPaymentMutation.mutate({ saleId: selectedSale.id, amount });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-TZ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-TZ');
  };

  if (!hasViewSales) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h1 className="text-2xl font-bold text-muted-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to view outstanding payments.</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className='py-4'>
        {/* <CardTitle>Outstanding Payments</CardTitle> */}
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
              Error loading outstanding payments
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {(salesData || []).length === 0 ? 'No outstanding payments found' : 'No payments match the current filters'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale, index) => (
                  <TableRow key={sale.id} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                    <TableCell>{sale.id}</TableCell>
                    <TableCell>
                      {sale.customer?.name || 'Walk-in Customer'}
                    </TableCell>
                    <TableCell>{formatCurrency(sale.total)}</TableCell>
                    <TableCell>{formatCurrency(sale.paid || 0)}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {formatCurrency(sale.outstandingBalance || 0)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sale.creditDueDate ? formatDate(sale.creditDueDate) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {hasManagePayments && (
                        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setSelectedSale(sale)}
                              className='m-0'
                            >
                              Record Payment
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Record Payment</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 gap-4">
                                <div className="flex justify-between items-center py-2 border-b">
                                  <Label className="text-sm font-medium">Receipt #</Label>
                                  <p className="text-lg font-semibold">{selectedSale?.id}</p>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                  <Label className="text-sm font-medium">Outstanding Balance</Label>
                                  <p className="text-lg font-semibold text-destructive">
                                    {selectedSale ? formatCurrency(selectedSale.outstandingBalance || 0) : '0'}
                                  </p>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                  <Label htmlFor="amount" className="text-sm font-medium">Amount</Label>
                                  <Input
                                    id="amount"
                                    type="text"
                                    inputMode="numeric"
                                    value={paymentAmount ? Number(paymentAmount).toLocaleString('en-TZ') : ''}
                                    onChange={(e) => {
                                      const raw = e.target.value.replace(/,/g, '');
                                      setPaymentAmount(raw === '' ? '' : raw);
                                    }}
                                    placeholder="Enter amount"
                                    className="w-40 text-right"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setIsPaymentDialogOpen(false);
                                    setPaymentAmount('');
                                    setSelectedSale(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button onClick={handleMakePayment}>
                                  Record Payment
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
    </Card>
  );
};

export default OutstandingPaymentsTab;