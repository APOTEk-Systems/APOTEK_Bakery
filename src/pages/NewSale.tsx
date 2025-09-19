import {useState} from "react";
import {Link} from "react-router-dom";
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import Navigation from "@/components/Navigation";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Separator} from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {useToast} from "@/hooks/use-toast";
import {
  ArrowLeft,
  Plus,
  Minus,
  Search,
  CreditCard,
  Banknote,
  Receipt,
  Trash2,
  UserPlus,
  Loader2,
  ShoppingCart,
} from "lucide-react";

import {getProducts, type Product} from "@/services/products";
import {customersService, type Customer} from "@/services/customers";
import {salesService, type SaleItem} from "@/services/sales";
import { formatCurrency } from "@/lib/funcs";

interface CartItem extends Product {
  quantity: number;
}

const NewSale = () => {
  // basic data
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  // payment/customer controls
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit" | "">(
    "cash"
  );
  const [selectedCustomer, setSelectedCustomer] = useState<string>(""); // optional customer id
  const [customerName, setCustomerName] = useState<string>(""); // free-text name for walk-ins
  const [creditDueDate, setCreditDueDate] = useState<string>(""); // yyyy-mm-dd or empty

  // UI state
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const {toast} = useToast();

  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const customersQuery = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersService.getAll(),
  });

  const loading = productsQuery.isLoading || customersQuery.isLoading;
  const error = productsQuery.error || customersQuery.error;

  const products = productsQuery.data || [];
  const customers = customersQuery.data || [];

  const createCustomerMutation = useMutation({
    mutationFn: (data: any) => customersService.create(data),
    onSuccess: (newCustomer) => {
      queryClient.setQueryData(['customers'], (old: Customer[] | undefined) => [...(old || []), newCustomer]);
      setSelectedCustomer(newCustomer.id.toString());
      toast({
        title: "Customer Added",
        description: "New customer created successfully",
      });
      setIsNewCustomerOpen(false);
      setNewCustomerForm({name: "", email: "", phone: ""});
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: "Failed to create customer",
        variant: "destructive",
      });
    },
  });

  const createSaleMutation = useMutation({
    mutationFn: (saleData: any) => salesService.createSale(saleData),
    onSuccess: (newSale) => {
      queryClient.invalidateQueries({ queryKey: ['recentSales'] });
      queryClient.invalidateQueries({ queryKey: ['unpaidSales'] });
      toast({
        title: "Success",
        description: `Sale ${newSale?.id ?? ""} created successfully`,
      });
      setCart([]);
      setSelectedCustomer("");
      setCustomerName("");
      setPaymentMethod("");
      setCreditDueDate("");
      setShowConfirmDialog(false);
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: "Failed to create sale",
        variant: "destructive",
      });
    },
  });

  // product helpers
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) {
        return prev.map((i) =>
          i.id === product.id ? {...i, quantity: i.quantity + 1} : i
        );
      }
      return [...prev, {...product, quantity: 1}];
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));
    } else {
      setCart((prev) => prev.map((i) => (i.id === id ? {...i, quantity} : i)));
    }
  };

  const removeFromCart = (id: number) =>
    setCart((prev) => prev.filter((i) => i.id !== id));

  // totals
  const subtotal = cart.reduce((s, it) => s + it.price * it.quantity, 0);
  const tax = subtotal * 0 //For Now will be set later;
  const total = subtotal + tax;

  // validate & open confirm
  const handleConfirmSale = () => {
    if (cart.length === 0) {
      toast({
        title: "Invalid Sale",
        description: "Add items to cart",
        variant: "destructive",
      });
      return;
    }
    if (!["cash", "credit"].includes(paymentMethod)) {
      toast({
        title: "Payment Method",
        description: "Select a payment method: Cash or Credit",
        variant: "destructive",
      });
      return;
    }
   if (paymentMethod === "credit") {
 // Find selected customer
 const customer = customers.find((c) => c.id.toString() === selectedCustomer);

 // Check for valid customer
 if (!customer) {
   toast({
     title: "Credit Sale",
     description: "Credit sales must be linked to a valid customer",
     variant: "destructive",
   });
   return;
 }

 // Check for due date
 if (!creditDueDate) {
   toast({
     title: "Credit Sale",
     description: "Credit sale should have a due date",
     variant: "destructive",
   });
   return;
 }

 // Check credit limit
 const totalCreditAfterSale = total + (customer.currentCredit || 0);
 if (totalCreditAfterSale > (customer.creditLimit || 0)) {
   toast({
     title: "Credit Sale",
     description: `This sale exceeds ${customer.name}'s credit limit`,
     variant: "destructive",
   });
   return;
 }
}


    setShowConfirmDialog(true);
  };

  // complete sale
  const handleCompleteSale = () => {
    const items: SaleItem[] = cart.map(
      (it) =>
        ({
          productId: it.id,
          quantity: it.quantity,
          // some services expect `price` or `unitPrice` — earlier examples used `price`
          price: it.price,
        } as unknown as SaleItem)
    );

    const saleData: any = {
      items,
      total,
      isCredit: paymentMethod === "credit",
      creditDueDate:
        paymentMethod === "credit" && creditDueDate
          ? new Date(creditDueDate).toISOString()
          : null,
    };

    if (selectedCustomer) saleData.customerId = parseInt(selectedCustomer);
    if (!selectedCustomer && customerName.trim())
      saleData.notes = customerName;

    createSaleMutation.mutate(saleData);
  };

  // create customer
  const handleAddNewCustomer = () => {
    if (!newCustomerForm.name.trim()) return;
    createCustomerMutation.mutate({
      name: newCustomerForm.name,
      email: newCustomerForm.email || undefined,
      phone: newCustomerForm.phone || undefined,
      status: "active",
      creditLimit:0,
      currentCredit:0,
      loyaltyPoints: 0,
      preferredContact: "both",
      isCredit: true,
    });
  };

  // loading / error UIs
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Navigation />
        <main className="flex-1 ml-64 p-6 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex">
        <Navigation />
        <main className="flex-1 ml-64 p-6">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <p className="text-destructive">{error instanceof Error ? error.message : 'Failed to fetch data'}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background flex">
        <Navigation />
        <main className="flex-1 ml-64 p-6">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">New Sale</h1>
                
              </div>
            </div>
          </div>

          {/* layout: products + cart/checkout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products list */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Products
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-muted-foreground">
                        No products found. Try adjusting your search.
                      </div>
                    ) : (
                      filteredProducts.map((product) => (
                        <Card
                          key={product.id}
                          className="p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="text-center space-y-2">
                            <h3 className="font-medium text-sm">
                              {product.name}
                            </h3>
                            <p className="text-xl font-bold text-primary">
                              {formatCurrency(product.price)}
                            </p>
                            <p className="text-gray-500 text-sm">
                              Stock: {product.quantity}{" "}
                            </p>
                            <Button
                              onClick={() => addToCart(product)}
                              disabled={product.quantity === 0}
                              className="w-full"
                              size="sm"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cart and checkout */}
            <div className="space-y-6">
              {/* Cart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Cart ({cart.reduce((s, i) => s + i.quantity, 0)} items)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Cart is empty
                      </p>
                    ) : (
                      cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(item.price)} each
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(item.id, item.quantity - 1);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>

                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(item.id, item.quantity + 1);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromCart(item.id);
                              }}
                              className="h-6 w-6 p-0 ml-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

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
                      Select Customer (optional)
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
                      <Label
                        htmlFor="customerName"
                        className="text-sm font-medium"
                      >
                        Or enter name for walk-in
                      </Label>
                      <Input
                        id="customerName"
                        placeholder="Enter customer name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>

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
                          Credit Due Date (optional)
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

              {/* Totals */}
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
                      <span>Vat:</span>
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
                      <Receipt className="h-4 w-4 mr-2" />
                    )}
                    {createSaleMutation.isPending
                      ? "Processing..."
                      : `Complete Sale ${formatCurrency(total)}`}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Confirm Sale Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Sale</DialogTitle>
            <DialogDescription>
              Are you sure you want to complete this sale?
            </DialogDescription>
          </DialogHeader>

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
                    ? new Date(creditDueDate).toLocaleDateString()
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
                  : ""}
                .
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

          <DialogFooter className="gap-2">
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Customer Dialog */}
      <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Enter customer details for quick addition.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newCustomerName">Name *</Label>
              <Input
                id="newCustomerName"
                placeholder="Customer name"
                value={newCustomerForm.name}
                onChange={(e) =>
                  setNewCustomerForm({...newCustomerForm, name: e.target.value})
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newCustomerEmail">Email (optional)</Label>
              <Input
                id="newCustomerEmail"
                type="email"
                placeholder="customer@example.com"
                value={newCustomerForm.email}
                onChange={(e) =>
                  setNewCustomerForm({
                    ...newCustomerForm,
                    email: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newCustomerPhone">Phone (optional)</Label>
              <Input
                id="newCustomerPhone"
                placeholder="Phone number"
                value={newCustomerForm.phone}
                onChange={(e) =>
                  setNewCustomerForm({
                    ...newCustomerForm,
                    phone: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsNewCustomerOpen(false);
                setNewCustomerForm({name: "", email: "", phone: ""});
              }}
              disabled={createCustomerMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNewCustomer}
              disabled={createCustomerMutation.isPending || !newCustomerForm.name.trim()}
            >
              {createCustomerMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewSale;
