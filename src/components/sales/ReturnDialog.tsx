import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, RotateCcw } from "lucide-react";
import { Sale } from "@/services/sales";
import { settingsService } from "@/services/settings";
import { salesAdjustmentsService, CreateSalesAdjustmentData } from "@/services/salesAdjustments";
import { formatCurrency } from "@/lib/funcs";
import { Separator } from "@radix-ui/react-select";

interface ReturnItem {
  productId: number;
  productName: string;
  originalQuantity: number;
  returnQuantity: number;
  unitPrice: number;
}

interface ReturnDialogProps {
  sale: Sale;
  onReturnCreated?: () => void;
}

const ReturnDialog = ({ sale, onReturnCreated }: ReturnDialogProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [returnItems, setReturnItems] = useState<ReturnItem[]>(
    sale.items.map(item => ({
      productId: item.productId,
      productName: item.name || "Unknown Product",
      originalQuantity: item.quantity,
      returnQuantity: 0,
      unitPrice: item.price,
    }))
  );
  
  const queryClient = useQueryClient();
  const { toast } = useToast();


  // Create return mutation - this would integrate with the sales adjustments API
  const createReturnMutation = useMutation({
    mutationFn: (returnData: CreateSalesAdjustmentData) => {
      return salesAdjustmentsService.create(returnData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Return request created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["sale", sale.id] });
      queryClient.invalidateQueries({ queryKey: ["sales-adjustments"] });
      handleClose();
      onReturnCreated?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to create return request",
        variant: "destructive",
      });
    },
  });

  const handleReturnQuantityChange = (productId: number, newQuantity: number) => {
    const item = returnItems.find(item => item.productId === productId);
    if (!item) return;

    // Validate that return quantity doesn't exceed original quantity
    if (newQuantity > item.originalQuantity) {
      toast({
        title: "Invalid Quantity",
        description: "Return quantity cannot exceed original quantity",
        variant: "destructive",
      });
      return;
    }

    setReturnItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, returnQuantity: newQuantity }
          : item
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one item has a return quantity > 0
    const itemsWithReturns = returnItems.filter(item => item.returnQuantity > 0);
    if (itemsWithReturns.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one item to return",
        variant: "destructive",
      });
      return;
    }

    if (!reason) {
      toast({
        title: "Validation Error", 
        description: "Please select a reason for the return",
        variant: "destructive",
      });
      return;
    }

    // Prepare return data
    const returnData: CreateSalesAdjustmentData = {
      saleId: sale.id,
      reason,
      items: itemsWithReturns.map(item => ({
        productId: item.productId,
        quantity: item.returnQuantity, // Negative quantity indicates return
        price: item.unitPrice,
        notes: `Return of ${item.returnQuantity} units`,
      })),
    };

    createReturnMutation.mutate(returnData);
  };

  const handleClose = () => {
    setOpen(false);
    setReason("");
    setReturnItems(
      sale.items.map(item => ({
        productId: item.productId,
        productName: item.name || "Unknown Product",
        originalQuantity: item.quantity,
        returnQuantity: 0,
        unitPrice: item.price,
      }))
    );
  };

  const totalReturnValue = returnItems
    .filter(item => item.returnQuantity > 0)
    .reduce((sum, item) => sum + (item.returnQuantity * item.unitPrice), 0);

  const hasValidReturn = returnItems.some(item => item.returnQuantity > 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          Return
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Process Return - Sale #{sale.id}</DialogTitle>
          <DialogDescription>
            Select items to return and provide a reason for the return.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sale Items Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Items to Return</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Sold Qty</TableHead>
                  <TableHead className="text-center">Return Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Return Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returnItems.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell className="font-medium p-2">
                      {item.productName}
                    </TableCell>
                    <TableCell className="text-center p-2">
                      {item.originalQuantity}
                    </TableCell>
                    <TableCell className="text-center p-2">
                      <Input
                        type="number"
                        min="0"
                        max={item.originalQuantity}
                        value={item.returnQuantity === 0 ? "" : item.returnQuantity.toString()}
                        onChange={(e) =>
                          handleReturnQuantityChange(
                            item.productId,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20 text-center"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.returnQuantity > 0
                        ? formatCurrency(item.returnQuantity * item.unitPrice)
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Return Summary */}
          {hasValidReturn && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Return Value:</span>
                <span className="text-lg font-bold text-destructive">
                  {formatCurrency(totalReturnValue)}
                </span>
              </div>
            </div>
          )}

          {/* Return Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Return</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for return..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createReturnMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createReturnMutation.isPending || !hasValidReturn || !reason}
              variant={hasValidReturn ? "destructive" : "outline"}
            >
              {createReturnMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Return...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Process Return
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnDialog;