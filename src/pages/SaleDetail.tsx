import {useParams, Link} from "react-router-dom";
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

const SaleDetail = () => {
  const {id} = useParams<{id: string}>();
  const saleId = parseInt(id || "0");
  const queryClient = useQueryClient();
  const {toast} = useToast();
  const [isConfirmOpen, setConfirmOpen] = useState(false);

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
          <main className="flex-1 ml-64 p-6 flex items-center justify-center">
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

  return (
    <Layout>
      {" "}
      <div className="p-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/sales?tab=unpaid">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Unpaid Sales
            </Link>
          </Button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Sale #{sale.id}
              </h1>
              <p className="text-muted-foreground">Sale details and items</p>
            </div>
            {sale.status === "unpaid" && (
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={payMutation.isPending}
              >
                {payMutation.isPending ? "Completing..." : "Complete Sale"}
              </Button>
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
                    className="w-24"
                  >
                    {sale.status.toUpperCase()}
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
                {/* <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Is Credit
                  </Label>
                  <p className="font-medium">{sale.isCredit ? "Yes" : "No"}</p>
                </div> */}
              </div>

              {sale.customer && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Customer
                  </Label>
                  <div className="space-y-1">
                    <p className="font-medium">{sale.customer.name}</p>
                    {/* {sale.customer.email && (
                      <p className="text-sm text-muted-foreground">
                        {sale.customer.email}
                      </p>
                    )} */}
                    {/* {sale.customer.phone && (
                      <p className="text-sm text-muted-foreground">
                        {sale.customer.phone}
                      </p>
                    )} */}
                  </div>
                </div>
              )}

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
                  <span>Total:</span>
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
              <p className="text-sm text-muted-foreground">
                {sale.items.length} items
              </p>
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
