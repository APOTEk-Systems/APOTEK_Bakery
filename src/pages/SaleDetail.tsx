import {useParams, Link, useLocation} from "react-router-dom";
import {useState} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useQuery} from "@tanstack/react-query";
import Layout from "../components/Layout";
import {Button} from "@/components/ui/button";
import {ConfirmationDialog} from "@/components/ConfirmationDialog";
import {useToast} from "@/hooks/use-toast";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {ArrowLeft} from "lucide-react";
import {salesService, Sale} from "../services/sales";
import {Label} from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {formatCurrency} from "../lib/funcs";
import { format } from 'date-fns';
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const SaleDetail = () => {
  const {id} = useParams<{id: string}>();
  const location = useLocation();
  const saleId = parseInt(id || "0");
  const queryClient = useQueryClient();
  const {toast} = useToast();
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Determine back navigation based on referrer
  const getBackLink = () => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab === 'recent') {
      return { to: '/sales?tab=recent', label: 'Back to Recent Sales' };
    } else if (tab === 'unpaid') {
      return { to: '/sales?tab=unpaid', label: 'Back to Unpaid Sales' };
    }
    return { to: '/sales', label: 'Back to Sales' };
  };

  const backLink = getBackLink();

  const payMutation = useMutation({
    mutationFn: (saleId: number) => salesService.paySale(saleId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["sale", saleId]});
      toast({
        title: "Success",
        description: "Sale marked as complete.",
      });
      setConfirmOpen(false);
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: (err as Error).message || "Failed to complete sale.",
      });
      setConfirmOpen(false);
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
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] });
      queryClient.invalidateQueries({ queryKey: ['unpaidSales'] });
      queryClient.invalidateQueries({ queryKey: ['outstanding-payments'] });
      queryClient.invalidateQueries({ queryKey: ['recentSales'] });
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

  const {
    data: sale,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sale", saleId],
    queryFn: () => salesService.getSaleById(saleId),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-screen bg-background">
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">
                Loading sale details...
              </p>
            </div>
          </main>
        </div>
      </Layout>
    );
  }

  if (error || !sale) {
    return (
      <Layout>
        <div className="flex min-h-screen bg-background">
          <main className="flex-1 ml-64 p-6 flex items-center justify-center">
            <Card className="max-w-md w-full">
              <CardContent className="p-6 text-center">
                <p className="text-destructive mb-4">
                  Sale not found or error loading details.
                </p>
                <Button asChild>
                  <Link to="/sales">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sales
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </Layout>
    );
  }

  const getStatusVariant = (status: Sale["status"]) => {
    switch (status) {
      case "completed":
        return "default";
      case "unpaid":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleCompleteSale = () => {
    payMutation.mutate(saleId);
  };

  const handleMakePayment = () => {
    if (!sale || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Payment amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (amount > (sale.outstandingBalance || 0)) {
      toast({
        title: "Invalid Amount",
        description: "Payment amount cannot exceed outstanding balance",
        variant: "destructive",
      });
      return;
    }

    createPaymentMutation.mutate({ saleId: sale.id, amount });
  };

  return (
    <Layout>
      {" "}
      <div className="p-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to={backLink.to}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backLink.label}
            </Link>
          </Button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Sale #{sale.id}
              </h1>
            </div>
            {sale.status === "unpaid" && sale.outstandingBalance && sale.outstandingBalance > 0 && (
              <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => setIsPaymentDialogOpen(true)}
                    disabled={createPaymentMutation.isPending}
                  >
                    {createPaymentMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Pay
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Pay</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex justify-between items-center py-2 border-b">
                        <Label className="text-sm font-medium">Receipt #</Label>
                        <p className="text-lg font-semibold">{sale.id}</p>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <Label className="text-sm font-medium">Outstanding Balance</Label>
                        <p className="text-lg font-semibold text-destructive">
                          {formatCurrency(sale.outstandingBalance || 0)}
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
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleMakePayment}>
                        Pay
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          {/* Main Sale Info */}
          <Card className="lg:col-span-2 mb-4">
            <CardHeader>
              <CardTitle>Sale Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Date
                  </Label>
                  <p className="font-medium">
                    {format(new Date(sale.createdAt), 'dd-MM-yyyy')}
                  </p>
                </div>
                <div className="flex flex-col">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Status
                  </Label>
                  <Badge
                    variant={getStatusVariant(sale.status)}
                    className="w-fit"
                  >
                    {sale.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Payment Method
                  </Label>
                  <p className="font-medium">{sale.isCredit ? "Credit" : "Cash"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Customer
                  </Label>
                  <p className="font-medium">{sale.customer?.name ? sale.customer.name: "CASH"}</p>
                </div>
              </div>

           

              {sale.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Notes
                  </Label>
                  <p className="text-sm">{sale.notes}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Amount:</span>
                  <span>{formatCurrency(sale.total)}</span>
                </div>
                {sale.tax > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>Tax:</span>
                    <span>{formatCurrency(sale.tax)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle>Items Sold</CardTitle>
             
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.items.map((item, index) => (
                    <TableRow
                      key={item.id || index}
                      className={
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      }
                    >
                      <TableCell className="font-medium">
                        {item.name || "N/A"}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.price)}</TableCell>
                      <TableCell>
                        {formatCurrency(item.quantity * item.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <ConfirmationDialog
          open={isConfirmOpen}
          onOpenChange={setConfirmOpen}
          title="Complete Sale"
          message={`Are you sure you want to mark sale #${sale.id} as complete? This action cannot be undone.`}
          onConfirm={handleCompleteSale}
        />
      </div>{" "}
    </Layout>
  );
};

export default SaleDetail;
