import {useState} from "react";
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import Layout from "../components/Layout";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {useToast} from "@/hooks/use-toast";
import {Loader2} from "lucide-react";
import {getProducts, type Product} from "@/services/products";
import {customersService, type Customer} from "@/services/customers";
import {salesService, type SaleItem} from "@/services/sales";
import {settingsService, type SettingsData} from "@/services/settings";
import ProductsList from "../components/sales/ProductsList";
import Cart from "../components/sales/Cart";
import Checkout from "../components/sales/Checkout";
import ConfirmSaleDialog from "../components/sales/ConfirmSaleDialog";
import NewCustomerDialog from "../components/sales/NewCustomerDialog";

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
  const [currentStep, setCurrentStep] = useState(1);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [soldCart, setSoldCart] = useState<CartItem[]>([]);
  const [saleCompleted, setSaleCompleted] = useState(false);
  const [newSale, setNewSale] = useState<any>(null);
  const [previewFormat, setPreviewFormat] = useState<'a5' | 'thermal' | null>(null);

  const resetSaleState = () => {
    setShowConfirmDialog(false);
    setSoldCart([]);
    setSaleCompleted(false);
    setNewSale(null);
    setPreviewFormat(null);
    setCurrentStep(1);
    setSearchTerm("");
    setCart([]);
    setPaymentMethod("cash");
    setSelectedCustomer("");
    setCustomerName("");
    setCreditDueDate("");
    setIsNewCustomerOpen(false);
    setNewCustomerForm({name: "", email: "", phone: ""});
  };

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

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getAll(),
  });

  const loading = productsQuery.isLoading || customersQuery.isLoading || settingsQuery.isLoading;
  const error = productsQuery.error || customersQuery.error || settingsQuery.error;

  const products = productsQuery.data || [];
  const customers = customersQuery.data || [];
  const settings = settingsQuery.data;

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
        description: `Sale created successfully`,
      });
      setSoldCart(cart);
      setCart([]);
      setSelectedCustomer("");
      setCustomerName("");
      setPaymentMethod("");
      setCreditDueDate("");
      setSaleCompleted(true);
      setNewSale(newSale);
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
    setSaleCompleted(false);
    setNewSale(null);
    setPreviewFormat(null);
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
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p>Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <p className="text-destructive">{error instanceof Error ? error.message : 'Failed to fetch data'}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Layout>
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">New Sale</h1>
                
              </div>
            </div>
          </div>

          {currentStep === 1 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ProductsList
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filteredProducts={filteredProducts}
                addToCart={addToCart}
              />
              <Cart
                cart={cart}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                setCurrentStep={setCurrentStep}
              />
            </div>
          ) : (
            <Checkout
              setCurrentStep={setCurrentStep}
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
              customers={customers}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              creditDueDate={creditDueDate}
              setCreditDueDate={setCreditDueDate}
              isNewCustomerOpen={isNewCustomerOpen}
              setIsNewCustomerOpen={setIsNewCustomerOpen}
              newCustomerForm={newCustomerForm}
              setNewCustomerForm={setNewCustomerForm}
              handleConfirmSale={handleConfirmSale}
              subtotal={subtotal}
              tax={tax}
              total={total}
              cart={cart}
              createSaleMutation={createSaleMutation}
            />
          )}
        </div>
      </Layout>

      <ConfirmSaleDialog
        showConfirmDialog={showConfirmDialog}
        setShowConfirmDialog={setShowConfirmDialog}
        saleCompleted={saleCompleted}
        previewFormat={previewFormat}
        setPreviewFormat={setPreviewFormat}
        total={total}
        paymentMethod={paymentMethod}
        creditDueDate={creditDueDate}
        selectedCustomer={selectedCustomer}
        customers={customers}
        customerName={customerName}
        soldCart={soldCart}
        newSale={newSale}
        handleCompleteSale={handleCompleteSale}
        createSaleMutation={createSaleMutation}
        onResetSale={resetSaleState}
        businessInfo={settings?.information}
      />

      <NewCustomerDialog
        isNewCustomerOpen={isNewCustomerOpen}
        setIsNewCustomerOpen={setIsNewCustomerOpen}
        newCustomerForm={newCustomerForm}
        setNewCustomerForm={setNewCustomerForm}
        handleAddNewCustomer={handleAddNewCustomer}
        createCustomerMutation={createCustomerMutation}
      />
    </>
  );
};

export default NewSale;


