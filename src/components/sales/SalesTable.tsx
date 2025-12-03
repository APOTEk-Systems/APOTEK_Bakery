import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sale } from '@/services/sales';
import { salesService } from '@/services/sales';
import { getProducts } from '@/services/products';
import { settingsService } from '@/services/settings';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Loader2, Receipt, ReceiptText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, toSentenceCase } from '@/lib/funcs';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface SalesTableProps {
  sales: Sale[];
  loading: boolean;
  error: string | null;
  isUnpaid?: boolean;
  onPaymentRecorded?: () => void;
}

const SalesTable: React.FC<SalesTableProps> = ({ sales, loading, error, isUnpaid = false, onPaymentRecorded }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const productsQuery = useQuery({ queryKey: ['products'], queryFn: getProducts });
  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: () => settingsService.getAll() });

  const payMutation = useMutation({
    mutationFn: (saleId: number) => salesService.paySale(saleId),
    onMutate: async (saleId) => {
      await queryClient.cancelQueries({ queryKey: ['recentSales'] });
      await queryClient.cancelQueries({ queryKey: ['unpaidSales'] });

      const previousRecentSales = queryClient.getQueryData<Sale[]>(['recentSales']);
      const previousUnpaidSales = queryClient.getQueryData<Sale[]>(['unpaidSales']);

      queryClient.setQueryData(['recentSales'], (old: Sale[] | undefined) =>
        old?.map(s => s.id === saleId ? { ...s, status: 'completed' as const } : s)
      );

      queryClient.setQueryData(['unpaidSales'], (old: Sale[] | undefined) =>
        old?.filter(s => s.id !== saleId) || []
      );

      return { previousRecentSales, previousUnpaidSales };
    },
    onError: (err, saleId, context) => {
      if (context) {
        queryClient.setQueryData(['recentSales'], context.previousRecentSales);
        queryClient.setQueryData(['unpaidSales'], context.previousUnpaidSales);
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: (err as Error).message || 'Failed to complete sale.',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentSales'] });
      queryClient.invalidateQueries({ queryKey: ['unpaidSales'] });
      toast({
        title: 'Success',
        description: 'Sale marked as complete.',
      });
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ['unpaidSales'] });
      queryClient.invalidateQueries({ queryKey: ['outstanding-payments'] });
      onPaymentRecorded?.();
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

  const handleCompleteSale = (sale: Sale) => {
    if (!sale.id) return;
    payMutation.mutate(sale.id);
    setOpen(false);
    setSelectedSale(null);
  };

  const handleMakePayment = () => {
    if (!selectedSale) return;

    const amount = selectedSale.outstandingBalance || 0;
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "No outstanding balance to pay",
        variant: "destructive",
      });
      return;
    }

    createPaymentMutation.mutate({ saleId: selectedSale.id, amount });
  };

  const handlePrintReceipt = async (sale: Sale) => {
    try {
      const products = productsQuery.data || [];
      const subtotal = sale.subtotal || sale.items.reduce((s, it) => s + it.price * it.quantity, 0);
      const tax = sale.vat || 0;
      const total = sale.total || subtotal + tax;

      // Get receipt format from settings
      const receiptSize = settingsQuery.data?.configuration?.receiptSize || 'a5';
      let receiptFormat: 'a4' | 'a5' | 'thermal' = 'a5';

      if (receiptSize === 'a4') {
        receiptFormat = 'a4';
      } else if (receiptSize === 'a5') {
        receiptFormat = 'a5';
      } else if (receiptSize.includes('thermal')) {
        receiptFormat = 'thermal';
      }

      const receiptData = {
        sale: sale,
        cart: sale.items.map(item => {
          const product = products.find(p => p.id === item.productId);
          return { id: item.productId, name: product?.name || 'Unknown', price: item.price, quantity: item.quantity };
        }),
        customer: sale.customer,
        customerName: sale.customer ? undefined : 'Cash',
        paymentMethod: sale.isCredit ? 'credit' : 'cash',
        creditDueDate: sale.creditDueDate || '',
        total: total,
        subtotal: subtotal,
        tax: tax,
        businessInfo: settingsQuery.data?.information,
        user: user,
      };

      const { reportsService } = await import('@/services/reports');
      const pdfBlob = await reportsService.exportReceipt(receiptData, receiptFormat);

      // Open PDF in new tab instead of downloading
      const { previewBlob } = await import('@/hooks/useReportMutations');
      previewBlob(pdfBlob, `Receipt-${sale.id}.pdf`);

      toast({
        title: "Success",
        description: "Receipt downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast({
        title: "Error",
        description: "Failed to generate receipt",
        variant: "destructive",
      });
    }
  };

  const salesToRender = sales;
 if(loading){
    return(
      <div className="flex flex-col w-full justify-center items-center p-6">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p>Loading ...</p>  
      </div>
    )
  };

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (salesToRender.length === 0) {
    return <div>No sales found.</div>;
  }

  const getStatusVariant = (status: Sale['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'unpaid':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {/* <TableHead>Sale ID</TableHead> */}
            <TableHead>Recepit #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>

          </TableRow>
        </TableHeader>
        <TableBody>
          {salesToRender.map((sale, index) => (
            <TableRow key={sale.id} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
              {/* <TableCell>{sale.id}</TableCell> */}
              <TableCell> {sale.id} </TableCell>
              <TableCell className='font-medium py-1'>{sale.customer?.name || 'Cash'}</TableCell>
              <TableCell className="py-1">{format(new Date(sale.createdAt), 'dd-MM-yyyy')}</TableCell>

              <TableCell className="py-1"> {formatCurrency(sale.total)}</TableCell>
              <TableCell className="py-1">
                <Badge variant={getStatusVariant(sale.status)} className='p-1'>
                  {toSentenceCase(sale.status)}
                </Badge>
              </TableCell>
              <TableCell className="py-1">
                  <Button variant="outline" size="sm" asChild className="mr-2">
                    <Link to={`/sales/${sale.id}${isUnpaid ? '?tab=unpaid' : '?tab=recent'}`}>
                    <Eye className='w-4 h-4' />
                      View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handlePrintReceipt(sale)} className="mr-2">
                    <ReceiptText className='w-4 h-4' />
                    Print
                  </Button>
                  {isUnpaid && (
                    sale.status === 'unpaid' ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedSale(sale);
                          handleMakePayment();
                        }}
                        disabled={createPaymentMutation.isPending}
                        className="mr-2"
                      >
                        {createPaymentMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Record Payment
                      </Button>
                    ) : null
                  )}
                </TableCell>
                
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Completion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark the sale for{' '}
              {selectedSale?.customer?.name || 'this customer'} as complete? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={payMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedSale && handleCompleteSale(selectedSale)}
              disabled={payMutation.isPending}
            >
              {payMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                'Complete Sale'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </>
  );
};

export default SalesTable;
