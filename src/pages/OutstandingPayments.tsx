import React, { useState } from 'react';
import { useEffect } from 'react';
import Layout from "../components/Layout";
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
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Helper function to check permissions
const hasPermission = (user: any, permission: string): boolean => {
  if (!user) return false;
  if (user.permissions?.includes("all")) return true;
  return user.permissions?.includes(permission) || false;
};

const OutstandingPayments: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [filterSaleId, setFilterSaleId] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');

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
    const matchesSaleId = !filterSaleId || sale.id.toString().includes(filterSaleId);
    const matchesCustomer = !filterCustomer || (sale.customer?.name || 'Walk-in Customer').toLowerCase().includes(filterCustomer.toLowerCase());
    return matchesSaleId && matchesCustomer;
  });

  const clearFilters = () => {
    setFilterSaleId('');
    setFilterCustomer('');
  };

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
      <Layout>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <h1 className="text-2xl font-bold text-muted-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to view outstanding payments.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Outstanding Payments</h1>
              {/* <p className="text-muted-foreground">Manage payments for credit sales</p> */}
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="saleId">Sale ID</Label>
                <Input
                  id="saleId"
                  value={filterSaleId}
                  onChange={(e) => setFilterSaleId(e.target.value)}
                  placeholder="Filter by sale ID"
                />
              </div>
              <div>
                <Label htmlFor="customer">Customer</Label>
                <Input
                  id="customer"
                  value={filterCustomer}
                  onChange={(e) => setFilterCustomer(e.target.value)}
                  placeholder="Filter by customer"
                />
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outstanding Balances</CardTitle>
          </CardHeader>
          <CardContent>
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
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
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
                              >
                                Record Payment
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Record Payment for Sale #{selectedSale?.id}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="amount">Payment Amount</Label>
                                  <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="Enter payment amount"
                                  />
                                  {selectedSale && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Outstanding balance: {formatCurrency(selectedSale.outstandingBalance || 0)}
                                    </p>
                                  )}
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
      </div>
    </Layout>
  );
};

export default OutstandingPayments;