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

   const {user} = useAuth()
   console.log(user)
  const handlePrintReceipt = () => {
    const customer = selectedCustomer ? customers.find((c) => c.id.toString() === selectedCustomer) : null;
    const subtotal = soldCart.reduce((s, it) => s + it.price * it.quantity, 0);
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
            <h1>${businessInfo?.bakeryName || 'Pastry Pros'}</h1>
            ${businessInfo?.address ? `<p>${businessInfo.address}</p>` : ''}
            ${businessInfo?.phone ? `<p>Tel: ${businessInfo.phone}</p>` : ''}
            ${businessInfo?.email ? `<p>${businessInfo.email}</p>` : ''}
          </div>

          <div class="info">
            <p>Sale ID: ${newSale?.id || 'N/A'}</p>
            <p>Customer: ${customer?.name || customerName || 'Cash'}</p>
            <p>Issued By: ${user.name} </p>
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
                ${soldCart.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td class="qty">${item.quantity}</td>
                    <td class="amount">${formatCurrency(item.price * item.quantity).replace("TSH", "")}</td>
                  </tr>
                `).join('')}
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
                ${soldCart.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td class="qty">${item.quantity}</td>
                    <td class="amount">${formatCurrency(item.price * item.quantity).replace("TSH", "")}</td>
                  </tr>
                `).join('')}
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
            <p>Payment: ${paymentMethod === 'credit' ? 'Credit' : 'Cash'}</p>
            ${paymentMethod === 'credit' && creditDueDate ? `<p>Due: ${format(new Date(creditDueDate), 'dd-MM-yyyy')}</p>` : ''}
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
              <Button onClick={() => handlePrintReceipt()}>
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