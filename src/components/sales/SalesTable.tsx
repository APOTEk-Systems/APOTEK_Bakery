import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Sale } from '@/services/sales';
import { salesService } from '@/services/sales';
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
import { Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/funcs';
import { format } from 'date-fns';

interface SalesTableProps {
  sales: Sale[];
  loading: boolean;
  error: string | null;
  isUnpaid?: boolean;
}

const SalesTable: React.FC<SalesTableProps> = ({ sales, loading, error, isUnpaid = false }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const { toast } = useToast();

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

  const handleCompleteSale = (sale: Sale) => {
    if (!sale.id) return;
    payMutation.mutate(sale.id);
    setOpen(false);
    setSelectedSale(null);
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
      <div className="rounded-md border">
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
              <TableRow key={sale.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                {/* <TableCell>{sale.id}</TableCell> */}
                <TableCell> {sale.id} </TableCell>
                <TableCell className="py-1">{format(new Date(sale.createdAt), 'dd-MM-yyyy')}</TableCell>
                <TableCell className='font-medium py-1'>{sale.customer?.name || 'Cash'}</TableCell>
                <TableCell className="py-1"> {formatCurrency(sale.total)}</TableCell>
                <TableCell className="py-1">
                  <Badge variant={getStatusVariant(sale.status)}>
                    {sale.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="py-1">
                  <Button variant="outline" size="sm" asChild className="mr-2">
                    <Link to={`/sales/${sale.id}`}>
                    <Eye className='w-4 h-4' />
                      View
                    </Link>
                  </Button>
                  {isUnpaid && (
                    sale.status === 'unpaid' ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedSale(sale);
                          setOpen(true);
                        }}
                        disabled={payMutation.isPending}
                        className="mr-2"
                      >
                        {payMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Pay
                      </Button>
                    ) : null
                  )}
                </TableCell>
                
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
