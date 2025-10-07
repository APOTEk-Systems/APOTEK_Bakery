import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Banknote, CreditCard, Receipt, Loader2, UserPlus } from "lucide-react";
import { formatCurrency } from "@/lib/funcs";
import { type Customer } from "@/services/customers";

interface CartItem {
  id: number;
  quantity: number;
}

interface CheckoutProps {
  setCurrentStep: (step: number) => void;
  selectedCustomer: string;
  setSelectedCustomer: (customer: string) => void;
  customers: Customer[];
  paymentMethod: "cash" | "credit" | "";
  setPaymentMethod: (method: "cash" | "credit" | "") => void;
  creditDueDate: string;
  setCreditDueDate: (date: string) => void;
  isNewCustomerOpen: boolean;
  setIsNewCustomerOpen: (open: boolean) => void;
  newCustomerForm: { name: string; email: string; phone: string };
  setNewCustomerForm: (form: { name: string; email: string; phone: string }) => void;
  handleConfirmSale: () => void;
  subtotal: number;
  tax: number;
  total: number;
  cart: CartItem[];
  createSaleMutation: any;
}

const Checkout = ({
  setCurrentStep,
  selectedCustomer,
  setSelectedCustomer,
  customers,
  paymentMethod,
  setPaymentMethod,
  creditDueDate,
  setCreditDueDate,
  isNewCustomerOpen,
  setIsNewCustomerOpen,
  newCustomerForm,
  setNewCustomerForm,
  handleConfirmSale,
  subtotal,
  tax,
  total,
  cart,
  createSaleMutation,
}: CheckoutProps) => {
  return (
    <div className="mx-auto">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => setCurrentStep(1)}
        className="mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Cart
      </Button>

      <div className="space-y-6">
        {/* Customer and Payment Method side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label
                  htmlFor="selectedCustomer"
                  className="text-sm font-medium"
                >
                  Select Customer
                </Label>
                <Select
                  value={selectedCustomer}
                  onValueChange={setSelectedCustomer}
                >
                  <SelectTrigger id="selectedCustomer" defaultValue={`Cash`}>
                    <SelectValue placeholder="Cash" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>


                <div className="mt-3">
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto"
                    onClick={() => setIsNewCustomerOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add New Customer
                  </Button>
                </div>

                {/* If credit is selected, show due date */}
                {paymentMethod === "credit" && (
                  <div className="space-y-2 mt-3">
                    <Label
                      htmlFor="creditDueDate"
                      className="text-sm font-medium"
                    >
                      Credit Due Date
                    </Label>
                    <Input
                      id="creditDueDate"
                      type="date"
                      value={creditDueDate}
                      onChange={(e) => setCreditDueDate(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <Button
                  variant={paymentMethod === "cash" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMethod("cash")}
                  className="w-full justify-start"
                >
                  <Banknote className="h-4 w-4 mr-2" />
                  Cash
                </Button>

                <Button
                  variant={
                    paymentMethod === "credit" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setPaymentMethod("credit")}
                  className="w-full justify-start"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Credit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Totals - Full width below */}
        <Card>
          <CardHeader>
            <CardTitle>Totals</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT:</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <Button
              onClick={handleConfirmSale}
              disabled={cart.length === 0 || createSaleMutation.isPending}
              className="w-full"
              size="lg"
            >
              {createSaleMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
               null
              )}
              {createSaleMutation.isPending
                ? "Processing..."
                : `Complete Sale ${formatCurrency(total)}`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;