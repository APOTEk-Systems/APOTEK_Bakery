import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Truck, Loader2, CheckCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { purchasesService, type PurchaseOrder, type GoodsReceipt, type GoodsReceiptItem } from "@/services/purchases";
import { suppliersService } from "@/services/suppliers";
import { getInventory } from "@/services/inventory";
import type { InventoryItem } from "@/services/inventory";
import { formatCurrency } from "@/lib/funcs";
import { format } from 'date-fns';

const GoodsReceivingView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [receiveNotes, setReceiveNotes] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [receiveForm, setReceiveForm] = useState<GoodsReceiptItem[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Fetch PO data
  const poQuery = useQuery({
    queryKey: ['purchaseOrder', id],
    queryFn: () => purchasesService.getPOById(parseInt(id!)),
    enabled: !!id,
  });

  // Fetch suppliers
  const suppliersQuery = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => suppliersService.getAll(),
  });

  // Fetch inventory
  const inventoryQuery = useQuery({
    queryKey: ['inventory'],
    queryFn: () => getInventory(),
  });

  const po = poQuery.data;
  const suppliers = suppliersQuery.data || [];
  const inventory = inventoryQuery.data || [];

  const supplierMap = suppliers.reduce((acc, s) => {
    acc[s.id] = s.name;
    return acc;
  }, {} as Record<number, string>);

  const loading = poQuery.isLoading || suppliersQuery.isLoading || inventoryQuery.isLoading;
  const error = poQuery.error || suppliersQuery.error || inventoryQuery.error;

  // Check if goods are already received
  const hasReceipt = po && po.goodsReceipts && po.goodsReceipts.length > 0;

  useEffect(() => {
    if (po && po.status === "approved" && !hasReceipt) {
      const initialForm = po.items.map(item => ({
        inventoryItemId: item.inventoryItemId,
        receivedQuantity: item.quantity,
        cost: item.price
      }));
      setReceiveForm(initialForm);
    }
  }, [po, hasReceipt]);

  if (loading) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
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
            <h1 className="text-2xl font-bold">
              {error ? "Error Loading Purchase Order" : "Purchase Order Not Found"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {error ? "Failed to load purchase order data" : "The requested purchase order could not be found"}
            </p>
            <Link to="/purchases?tab=goods-receiving">
              <Button variant="outline" className="mt-4">Back to Materials Received</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const totalQty = po.items.reduce((sum, i) => sum + i.quantity, 0);
  const unit = inventory.find(i => i.id === (po.items[0]?.inventoryItemId))?.unit || '';

  const receiptStatus = hasReceipt ? po.goodsReceipts[0].status : null;

  const handleSubmitReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true)
    if (!po) return;
    try {
      const newReceipt = await purchasesService.createReceipt({
        purchaseOrderId: po.id,
        items: receiveForm,
        notes: receiveNotes.trim() || undefined
      });
      toast({ title: "Goods Received", description: `Receipt ${newReceipt.id} created for PO ${po.id}` });
      setReceiveNotes("");
      setIsConfirmDialogOpen(false);
      navigate(`/purchases/${po.id}`);
    } catch (error) {
      toast({ title: "Error", description: "Failed to receive goods", variant: "destructive" });
    } finally{
      setSubmitLoading(false)
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "pending": return "outline";
      default: return "default";
    }
  };

  const capitalizeStatus = (status: string) => status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Layout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {hasReceipt ? 'Goods Receipt' : 'Purchase Order #'} {po.id}
              </h1>
              {/* <p className="text-muted-foreground mt-1">
                {hasReceipt ? 'View received goods' : 'Mark delivery as completed'}
              </p> */}
            </div>
            <Button asChild variant="outline">
              <Link to="/purchases?tab=goods-receiving">Back to Materials Received</Link>
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                {po.status === "completed" ? "Material Received Summary" : "Material Receiving Summary"}
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusVariant(po.status)}>{capitalizeStatus(po.status)}</Badge>
                  {po.status === "approved" && !hasReceipt && (
                    <Button size="sm" onClick={() => setIsConfirmDialogOpen(true)} disabled={submitLoading}>
                      <Truck className="h-4 w-4 mr-1" />
                      Receive
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>
              {po.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-lg">{po.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Received Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">

                Ordered Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Ordered Quantity</TableHead>
                    <TableHead>Received Quantity</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {po.items.map((item, index) => {
                    const inventoryItem = inventory.find(i => i.id === item.inventoryItemId);
                    const formItem = receiveForm[index];
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {inventoryItem?.name || 'Unknown Item'}
                        </TableCell>
                        <TableCell>
                          {item.quantity} {inventoryItem?.unit || 'units'}
                        </TableCell>
                        <TableCell>
                          {formItem?.receivedQuantity || item.quantity} {inventoryItem?.unit || 'units'}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(formItem?.cost || item.price)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency((formItem?.receivedQuantity || item.quantity) * (formItem?.cost || item.price))}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>
      </div>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Goods Receipt</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to mark all goods as received for this purchase order?</p>
          <div>
            <Label htmlFor="receiveNotes">Delivery Notes (optional)</Label>
            <Textarea
              id="receiveNotes"
              value={receiveNotes}
              onChange={(e) => setReceiveNotes(e.target.value)}
              placeholder="Add any delivery notes..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitReceive} disabled={submitLoading}>
              {submitLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Layout>
  );
};

export default GoodsReceivingView;


