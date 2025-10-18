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
import { formatCurrency } from '@/lib/funcs';
import { format } from 'date-fns';
import ReceiptPreview from './ReceiptPreview';
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
  const [printSale, setPrintSale] = useState<Sale | null>(null);
  const [previewFormat, setPreviewFormat] = useState<'a5' | 'thermal' | null>(null);
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

  const handlePrintReceipt = () => {
    if (!printSale) return;
    const products = productsQuery.data || [];
    const customer = printSale.customer;
    const subtotal = printSale.items.reduce((s, it) => s + it.price * it.quantity, 0);
    const tax = 0; // Assuming no tax for now
    const total = subtotal + tax;

    // Generate clean HTML for printing
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body {
              font-family: monospace;
              font-size: 10px;
              line-height: 1.2;
              margin: 10px 0;
              max-width: ${previewFormat === 'a5' ? '210mm' : '48mm'};
              padding: 0;
            }
            .header {
              text-align: center;
              margin-bottom: 10px;
            }
            .header h1 {
              font-size: 14px;
              font-weight: bold;
              margin: 0 0 5px 0;
            }
            .header p {
              margin: 2px 0;
              font-size: 10px;
            }
            .info {
              margin-bottom: 10px;
            }
            .info p {
              margin: 2px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
            }
            th, td {
              text-align: left;
              padding: 2px 0;
            }
            .qty, .amount {
              text-align: right;
            }
            .thermal-header {
              border-bottom: 1px solid #000;
              margin-bottom: 5px;
            }
            .separator {
              border-bottom: 1px solid #000;
              margin: 5px 0;
            }
            .totals {
              margin-bottom: 10px;
            }
            .totals div {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
            }
            .footer {
              text-align: center;
              border-top: 1px solid #000;
              padding-top: 5px;
              margin-top: 10px;
            }
            .footer p {
              margin: 2px 0;
              font-size: 10px;
            }
            @media print {
              body { margin: 20px 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${settingsQuery.data?.information?.bakeryName || 'Pastry Pros'}</h1>
            ${settingsQuery.data?.information?.address ? `<p>${settingsQuery.data.information.address}</p>` : ''}
            ${settingsQuery.data?.information?.phone ? `<p>Tel: ${settingsQuery.data.information.phone}</p>` : ''}
            ${settingsQuery.data?.information?.email ? `<p>${settingsQuery.data.information.email}</p>` : ''}
          </div>

          <div class="info">
            <p>Sale ID: ${printSale.id}</p>
            <p>Customer: ${customer?.name || 'Cash'}</p>
            <p>Issued By: ${user?.name || ''} </p>
            <p>Date: ${format(new Date(), "dd-MM-yyyy HH:mm")}</p>
          </div>

          ${previewFormat === 'a5' ?
            `<table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="qty">Qty</th>
                  <th class="amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${printSale.items.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  return `
                    <tr>
                      <td>${product?.name || 'Unknown'}</td>
                      <td class="qty">${item.quantity}</td>
                      <td class="amount">${formatCurrency(item.price * item.quantity).replace("TSH", "")}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>` :
            `<table>
              <thead>
                <tr class="thermal-header">
                  <th>Item</th>
                  <th class="qty">Qty</th>
                  <th class="amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${printSale.items.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  return `
                    <tr>
                      <td>${product?.name || 'Unknown'}</td>
                      <td class="qty">${item.quantity}</td>
                      <td class="amount">${formatCurrency(item.price * item.quantity).replace("TSH", "")}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>`
          }

          <div class="separator"></div>

          <div class="totals">
            <div>
              <span>Subtotal:</span>
              <span>${formatCurrency(subtotal)}</span>
            </div>
            <div>
              <span>VAT:</span>
              <span>${formatCurrency(tax)}</span>
            </div>
            <div style="font-weight: bold;">
              <span>Total:</span>
              <span>${formatCurrency(total)}</span>
            </div>
          </div>

          <div style="margin-bottom: 10px;">
            <p>Payment: ${printSale.isCredit ? 'Credit' : 'Cash'}</p>
            ${printSale.isCredit && printSale.creditDueDate ? `<p>Due: ${format(new Date(printSale.creditDueDate), 'dd-MM-yyyy')}</p>` : ''}
          </div>

          <div class="footer">
            <p>Thank you for shopping with us!</p>
            <p>Enjoy!</p>
          </div>
        </body>
      </html>
    `;

    // Open print window and write the HTML
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printHTML);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
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
                <TableCell className='font-medium py-1'>{sale.customer?.name || 'Cash'}</TableCell>
                <TableCell className="py-1">{format(new Date(sale.createdAt), 'dd-MM-yyyy')}</TableCell>
               
                <TableCell className="py-1"> {formatCurrency(sale.total)}</TableCell>
                <TableCell className="py-1">
                  <Badge variant={getStatusVariant(sale.status)}>
                    {sale.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="py-1">
                  <Button variant="outline" size="sm" asChild className="mr-2">
                    <Link to={`/sales/${sale.id}${isUnpaid ? '?tab=unpaid' : '?tab=recent'}`}>
                    <Eye className='w-4 h-4' />
                      View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setPrintSale(sale); setPreviewFormat('thermal'); }} className="mr-2">
                    <ReceiptText className='w-4 h-4' />
                    Print
                  </Button>
                  {isUnpaid && (
                    sale.status === 'unpaid' ? (
                      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedSale(sale);
                              setIsPaymentDialogOpen(true);
                            }}
                            disabled={createPaymentMutation.isPending}
                            className="mr-2"
                          >
                            {createPaymentMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
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

      {/* Print Receipt Dialog */}
      <Dialog open={!!printSale} onOpenChange={() => setPrintSale(null)}>
        <DialogContent className={previewFormat ? 'max-w-4xl' : ''}>
          <DialogHeader>
            <DialogTitle>Receipt Preview ({previewFormat?.toUpperCase()})</DialogTitle>
          </DialogHeader>
          {printSale && previewFormat && (
            <ReceiptPreview
              receiptFormat={previewFormat}
              sale={printSale}
              cart={printSale.items.map(item => {
                const product = productsQuery.data?.find(p => p.id === item.productId);
                return { id: item.productId, name: product?.name || 'Unknown', price: item.price, quantity: item.quantity };
              })}
              customer={printSale.customer}
              customerName={printSale.customer ? undefined : 'Cash'}
              paymentMethod={printSale.isCredit ? 'credit' : 'cash'}
              creditDueDate={printSale.creditDueDate || ''}
              total={printSale.total}
              subtotal={printSale.total / 1.0}
              tax={0}
              businessInfo={settingsQuery.data?.information}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewFormat('a5')}>
              A5 Paper
            </Button>
            <Button variant="outline" onClick={() => setPreviewFormat('thermal')}>
              Thermal Paper
            </Button>
            <Button variant="outline" onClick={() => setPrintSale(null)}>
              Close
            </Button>
            <Button onClick={handlePrintReceipt}>
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SalesTable;
