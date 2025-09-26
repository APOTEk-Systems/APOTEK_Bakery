import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Receipt } from "lucide-react";
import { format } from 'date-fns';
import { formatCurrency } from "@/lib/funcs";
import { type Customer } from "@/services/customers";
import ReceiptPreview from "./ReceiptPreview";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface ConfirmSaleDialogProps {
  showConfirmDialog: boolean;
  setShowConfirmDialog: (show: boolean) => void;
  saleCompleted: boolean;
  previewFormat: 'a5' | 'thermal' | null;
  setPreviewFormat: (format: 'a5' | 'thermal' | null) => void;
  total: number;
  paymentMethod: string;
  creditDueDate: string;
  selectedCustomer: string;
  customers: Customer[];
  customerName: string;
  soldCart: CartItem[];
  newSale: any;
  handleCompleteSale: () => void;
  createSaleMutation: any;
  businessInfo?: {
    bakeryName: string;
    address: string;
    phone: string;
    email: string;
  };
}

const ConfirmSaleDialog = ({
  showConfirmDialog,
  setShowConfirmDialog,
  saleCompleted,
  previewFormat,
  setPreviewFormat,
  total,
  paymentMethod,
  creditDueDate,
  selectedCustomer,
  customers,
  customerName,
  soldCart,
  newSale,
  handleCompleteSale,
  createSaleMutation,
  businessInfo,
}: ConfirmSaleDialogProps) => {
  return (
    <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
      <DialogContent className={previewFormat ? 'max-w-4xl' : ''}>
        <DialogHeader>
          <DialogTitle>
            {saleCompleted ? (previewFormat ? `Receipt Preview (${previewFormat.toUpperCase()})` : "Sale Completed") : "Confirm Sale"}
          </DialogTitle>
          <DialogDescription>
            {saleCompleted ? (previewFormat ? "Review the receipt before printing." : "Sale created successfully. Choose a receipt format to preview.") : "Are you sure you want to complete this sale?"}
          </DialogDescription>
        </DialogHeader>

        {!saleCompleted ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-semibold">{formatCurrency(total)}</span>
            </div>

            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="font-semibold">
                {paymentMethod === "credit" ? "Credit" : "Cash"}
              </span>
            </div>

            {paymentMethod === "credit" && (
              <div className="flex justify-between">
                <span>Credit Due Date:</span>
                <span className="font-semibold">
                  {creditDueDate
                    ? format(new Date(creditDueDate), 'dd-MM-yyyy')
                    : "Not set"}
                </span>
              </div>
            )}

            {selectedCustomer && (
              <div className="text-sm text-muted-foreground">
                For:{" "}
                {customers.find((c) => c.id.toString() === selectedCustomer)
                  ?.name ?? "Selected customer"}
              </div>
            )}

            {!selectedCustomer && customerName && (
              <div className="text-sm text-muted-foreground">
                Walk-in name: {customerName}
              </div>
            )}

            {paymentMethod === "credit" && (
              <div className="text-sm text-muted-foreground">
                This sale will be recorded as credit
                {selectedCustomer
                  ? ` for ${
                      customers.find(
                        (c) => c.id.toString() === selectedCustomer
                      )?.name
                    }`
                  : ""}.
              </div>
            )}

            {/* ❌ Error when trying credit without a customer */}
            {paymentMethod === "credit" &&
              !customers.some((c) => c.id.toString() === selectedCustomer) && (
                <p className="text-sm text-red-500 font-medium">
                  Error: Credit sales must be linked to a valid customer.
                </p>
              )}
          </div>
        ) : previewFormat ? (
          <ReceiptPreview
            receiptFormat={previewFormat}
            sale={newSale}
            cart={soldCart}
            customer={selectedCustomer ? customers.find((c) => c.id.toString() === selectedCustomer) : null}
            paymentMethod={paymentMethod}
            creditDueDate={creditDueDate}
            total={soldCart.reduce((s, it) => s + it.price * it.quantity, 0) + (soldCart.reduce((s, it) => s + it.price * it.quantity, 0) * 0)}
            subtotal={soldCart.reduce((s, it) => s + it.price * it.quantity, 0)}
            tax={soldCart.reduce((s, it) => s + it.price * it.quantity, 0) * 0}
            businessInfo={businessInfo}
          />
        ) : (
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold">Choose Receipt Format</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setPreviewFormat('a5')} variant="outline">
                A5 Paper
              </Button>
              <Button onClick={() => setPreviewFormat('thermal')} variant="outline">
                Thermal Paper
              </Button>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {!saleCompleted ? (
            <>
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                disabled={createSaleMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCompleteSale}
                disabled={
                  createSaleMutation.isPending ||
                  (paymentMethod === "credit" && !selectedCustomer)
                }
              >
                {createSaleMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Receipt className="h-4 w-4 mr-2" />
                )}
                {createSaleMutation.isPending ? "Processing..." : "Confirm Sale"}
              </Button>
            </>
          ) : previewFormat ? (
            <>
              <Button
                variant="outline"
                onClick={() => setPreviewFormat(null)}
              >
                Back
              </Button>
              <Button onClick={() => window.print()}>
                Print Receipt
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setShowConfirmDialog(false)}
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmSaleDialog;