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
import { useAuth } from "@/contexts/AuthContext";
import { settingsService } from "@/services/settings";
import { useQuery } from "@tanstack/react-query";

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
  soldCustomer: Customer | null;
  soldCustomerName: string;
  newSale: any;
  handleCompleteSale: () => void;
  createSaleMutation: any;
  onResetSale?: () => void;
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
  soldCustomer,
  soldCustomerName,
  newSale,
  handleCompleteSale,
  createSaleMutation,
  onResetSale,
  businessInfo,
}: ConfirmSaleDialogProps) => {

   const {user} = useAuth()
  // console.log(newSale.sale.id)


   const settingsQuery = useQuery({
     queryKey: ['settings'],
     queryFn: () => settingsService.getAll(),
   });

   const settings = settingsQuery.data;
   const receiptSize = settings?.configuration?.receiptSize || 'a5';

   // Map receiptSize to receiptFormat for preview
   const getReceiptFormat = (size: string): 'a5' | 'thermal' => {
     if (size.startsWith('thermal')) return 'thermal';
     return 'a5'; // a4 and a5 both use a5 format for preview
   };

   // Get max width for print based on receiptSize
   const getPrintMaxWidth = (size: string): string => {
     switch (size) {
       case 'a5': return '210mm';
       case 'a4': return '297mm';
       case 'thermal-80mm': return '80mm';
       case 'thermal-58mm': return '58mm';
       default: return '48mm';
     }
   };

   const receiptFormat = getReceiptFormat(receiptSize);
   const printMaxWidth = getPrintMaxWidth(receiptSize);
  const handleCloseDialog = () => {
    setShowConfirmDialog(false);
    // Reset sale state when dialog closes after completion
    if (saleCompleted && onResetSale) {
      onResetSale();
    }
  };

  const handlePrintReceipt = async () => {
    try {
      console.log('🧾 Print Receipt button clicked');
      const subtotal = soldCart.reduce((s, it) => s + it.price * it.quantity, 0);
      const tax = 0; // Assuming no tax for now
      const total = subtotal + tax;

      const receiptData = {
        sale: newSale?.sale,
        cart: soldCart,
        customer: soldCustomer,
        customerName: soldCustomerName,
        paymentMethod: paymentMethod,
        creditDueDate: creditDueDate,
        total: total,
        subtotal: subtotal,
        tax: tax,
        businessInfo: businessInfo,
        user: user,
      };

      console.log('📋 Receipt data prepared:', receiptData);

      const { reportsService } = await import('@/services/reports');
      console.log('📦 Reports service imported');

      const pdfBlob = await reportsService.exportReceipt(receiptData, receiptFormat);
      console.log('📄 PDF generated successfully');

      // Open PDF in new tab instead of downloading
      const { previewBlob } = await import('@/hooks/useReportMutations');
      console.log('🔗 Preview function imported');

      previewBlob(pdfBlob, `Receipt-${newSale?.sale?.id || 'N/A'}.pdf`);
      console.log('✅ PDF opened in new tab');
    } catch (error) {
      console.error('❌ Error generating receipt:', error);
      alert('Error generating receipt: ' + error.message);
    }
  };
  return (
    <Dialog open={showConfirmDialog} onOpenChange={handleCloseDialog}>
      <DialogContent className={previewFormat ? 'max-w-4xl' : ''}>
        <DialogHeader>
          <DialogTitle>
            {saleCompleted ? (previewFormat ? `Receipt Preview (${receiptSize.toUpperCase()})` : "Sale Completed") : "Confirm Sale"}
          </DialogTitle>
          <DialogDescription>
            {saleCompleted ? (previewFormat ? "Review the receipt before printing." : "Sale created successfully.") : "Are you sure you want to complete this sale?"}
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
            receiptFormat={receiptFormat}
            sale={newSale?.sale}
            cart={soldCart}
            customer={soldCustomer}
            customerName={soldCustomerName}
            paymentMethod={paymentMethod}
            creditDueDate={creditDueDate}
            total={soldCart.reduce((s, it) => s + it.price * it.quantity, 0) + (soldCart.reduce((s, it) => s + it.price * it.quantity, 0) * 0)}
            subtotal={soldCart.reduce((s, it) => s + it.price * it.quantity, 0)}
            tax={soldCart.reduce((s, it) => s + it.price * it.quantity, 0) * 0}
            businessInfo={businessInfo}
          />
        ) : (
          <div className="text-center space-y-4">
            <Button onClick={handlePrintReceipt} disabled={!saleCompleted || !newSale}>
              Print Receipt
            </Button>
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
                  null
                )}
                {createSaleMutation.isPending ? "Processing..." : "Confirm Sale"}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleCloseDialog}
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