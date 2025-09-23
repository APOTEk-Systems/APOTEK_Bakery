import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, Loader2 } from "lucide-react";

import { purchasesService, type PurchaseOrder } from "@/services/purchases";
import { suppliersService } from "@/services/suppliers";
import { getInventory, type InventoryItem } from "@/services/inventory";
import { formatCurrency } from "@/lib/funcs";
import { format } from 'date-fns';

type Status = PurchaseOrder['status'];

const PurchaseOrderView = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<'approve' | 'cancel' | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const queryClient = useQueryClient();

  const poId = id ? parseInt(id) : 0;

  const poQuery = useQuery({
    queryKey: ['purchaseOrder', poId],
    queryFn: () => purchasesService.getPOById(poId),
    enabled: !!poId,
  });

  const suppliersQuery = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => suppliersService.getAll(),
  });

  const inventoryQuery = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: () => getInventory(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'approved' | 'cancelled' }) => purchasesService.updatePOStatus(id, status),
    onSuccess: (updatedPO) => {
      queryClient.setQueryData(['purchaseOrder', poId], updatedPO);
      toast({ title: "Success", description: `Purchase order ${dialogAction === 'approve' ? 'approved' : 'cancelled'} successfully` });
      setShowDialog(false);
      setDialogAction(null);
    },
    onError: (err) => {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    },
  });

  const po = poQuery.data;
  const suppliers = suppliersQuery.data || [];
  const inventory: InventoryItem[] = inventoryQuery.data || [];
  const loading = poQuery.isLoading || suppliersQuery.isLoading || inventoryQuery.isLoading;
  const error = poQuery.error || suppliersQuery.error || inventoryQuery.error;

  const supplierMap = suppliers.reduce((acc, s) => {
    acc[s.id] = s.name;
    return acc;
  }, {} as Record<number, string>);

  const handleStatusUpdate = (action: 'approve' | 'cancel') => {
    if (!po || !isAdmin) return;
    setIsUpdatingStatus(true);
    updateStatusMutation.mutate({ id: po.id, status: action === 'approve' ? 'approved' : 'cancelled' });
  };

  const getStatusVariant = (status: Status) => {
    switch (status) {
      case "approved":
      case "completed":
        return "default";
      case "pending":
        return "outline";
      case "cancelled":
        return "secondary";
      default:
        return "default";
    }
  };

  const capitalizeStatus = (status: Status) => status.charAt(0).toUpperCase() + status.slice(1);

  if (loading) {
    return (
      <Layout>
        <div className="p-8 h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p>Loading purchase order...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !po) {
    return (
      <Layout>
        <div className="p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Purchase Order Not Found</h1>
            <Link to="/purchases">
              <Button variant="outline" className="mt-4">Back to Purchases</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const totalQty = po.items.reduce((sum, i) => sum + i.quantity, 0);
  const unit = inventory.find(i => i.id === (po.items[0]?.inventoryItemId))?.unit || '';

  const dialogTitle = dialogAction === 'approve' ? 'Approve Purchase Order' : 'Cancel Purchase Order';
  const dialogMessage = dialogAction === 'approve' ? 'Are you sure you want to approve this purchase order?' : 'Are you sure you want to cancel this purchase order? This action cannot be undone.';

  return (
    <>
      <Layout>
        <div className="p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Purchase Order {po.id}</h1>
                <p className="text-muted-foreground mt-1">Order details and items</p>
              </div>
              <Link to="/purchases">
                <Button variant="outline">Back to Purchases</Button>
              </Link>
            </div>

            <Card className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  Order Summary
                  <Badge variant={getStatusVariant(po.status)}>{capitalizeStatus(po.status)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Supplier</p>
                  <p className="text-xl font-semibold">{supplierMap[po.supplierId] || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Order Date</p>
                  <p className="text-xl">{format(new Date(po.createdAt), 'dd-MM-yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Cost</p>
                  <p className="text-2xl font-bold">{formatCurrency(po.totalCost)}</p>
                </div>
                {po.notes && (
                  <div className="col-span-full">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                    <p className="text-lg">{po.notes}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex justify-end gap-2">
                  {po.status === "approved" && (
                    <Button asChild>
                      <Link to={`/purchases/${po.id}/receive`}>
                        <Truck className="mr-2 h-4 w-4" />
                        Receive Goods
                      </Link>
                    </Button>
                  )}
                  {isAdmin && po.status === 'pending' && (
                    <Button onClick={() => { setDialogAction('approve'); setShowDialog(true); }} disabled={isUpdatingStatus || updateStatusMutation.isPending}>
                      {updateStatusMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Approve Order'
                      )}
                    </Button>
                  )}
                  {isAdmin && po.status === 'pending' && (
                    <Button variant="outline" onClick={() => { setDialogAction('cancel'); setShowDialog(true); }} disabled={isUpdatingStatus || updateStatusMutation.isPending}>
                      {updateStatusMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Cancel Order'
                      )}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Items List</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {po.items.map((item, index) => {
                      const invItem = inventory.find(i => i.id === item.inventoryItemId);
                      const itemUnit = invItem?.unit || '';
                      const itemName = invItem?.name || 'Unknown';
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{itemName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{itemUnit}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>{formatCurrency(item.quantity * item.price)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
      <ConfirmationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title={dialogTitle}
        message={dialogMessage}
        onConfirm={() => handleStatusUpdate(dialogAction!)}
        onCancel={() => {
          setShowDialog(false);
          setDialogAction(null);
        }}
        confirmVariant="default"
      />
    </>
  );
};

export default PurchaseOrderView;


