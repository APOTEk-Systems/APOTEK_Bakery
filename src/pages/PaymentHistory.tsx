import React, { useState } from 'react';
import Layout from "../components/Layout";
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

// Helper function to check permissions
const hasPermission = (user: any, permission: string): boolean => {
  if (!user) return false;
  if (user.permissions?.includes("all")) return true;
  return user.permissions?.includes(permission) || false;
};

const PaymentHistory: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filterSaleId, setFilterSaleId] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');

  const hasViewSales = hasPermission(user, "view:sales");

  // Fetch payment history using React Query
  const { data: paymentsData, isLoading: loading, error } = useQuery({
    queryKey: ['payment-history'],
    queryFn: () => salesService.getAllPayments(),
    enabled: hasViewSales,
  });

  const filteredPayments = (paymentsData || []).filter(payment => {
    const matchesSaleId = !filterSaleId || payment.saleId.toString().includes(filterSaleId);
    // Note: Customer filtering would require additional API call or data enrichment
    return matchesSaleId;
  });

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-TZ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-TZ', {});
  };

  const clearFilters = () => {
    setFilterSaleId('');
    setFilterCustomer('');
  };

  if (!hasViewSales) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <h1 className="text-2xl font-bold text-muted-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to view payment history.</p>
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
              <h1 className="text-3xl font-bold text-foreground">Payment History</h1>
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
                  disabled // Would need customer data enrichment
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

        {/* Payment History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Records</CardTitle>
          </CardHeader>
          <CardContent>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* <TableHead>Payment ID</TableHead> */}
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Date</TableHead>
                    {/* <TableHead>Notes</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      {/* <TableCell>{payment.id}</TableCell> */}
                      <TableCell>
                        {payment.saleId}
                      </TableCell>
                      <TableCell>{payment.customerId}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                      {/* <TableCell>{payment.notes || '-'}</TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {!loading && filteredPayments.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(filteredPayments.reduce((sum, payment) => sum + payment.amount, 0))}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Payments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredPayments.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Records</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {filteredPayments.length > 0 ?
                      formatCurrency(filteredPayments.reduce((sum, payment) => sum + payment.amount, 0) / filteredPayments.length) :
                      formatCurrency(0)
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Average Payment</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default PaymentHistory;