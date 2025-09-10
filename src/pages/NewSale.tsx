import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  Plus,
  Minus,
  Search,
  CreditCard,
  Banknote,
  Smartphone,
  Receipt,
  Trash2,
  User,
  ShoppingCart
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
}

interface CartItem extends Product {
  quantity: number;
}

const NewSale = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [amountReceived, setAmountReceived] = useState("");

  // Mock bakery products
  const products: Product[] = [
    { id: "1", name: "Chocolate Croissant", price: 4.25, category: "pastries" },
    { id: "2", name: "Sourdough Bread", price: 8.50, category: "breads" },
    { id: "3", name: "Blueberry Muffin", price: 3.00, category: "muffins" },
    { id: "4", name: "Cappuccino", price: 3.50, category: "beverages" },
    { id: "5", name: "Red Velvet Cupcake", price: 3.75, category: "cupcakes" },
    { id: "6", name: "Baguette", price: 5.50, category: "breads" },
    { id: "7", name: "Espresso", price: 2.50, category: "beverages" },
    { id: "8", name: "Danish Pastry", price: 3.25, category: "pastries" },
    { id: "9", name: "Chocolate Chip Muffin", price: 3.00, category: "muffins" },
    { id: "10", name: "Vanilla Cupcake", price: 3.50, category: "cupcakes" },
    { id: "11", name: "Croissant", price: 2.75, category: "pastries" },
    { id: "12", name: "Latte", price: 4.00, category: "beverages" }
  ];

  const categories = ["all", "breads", "pastries", "muffins", "cupcakes", "beverages"];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== id));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;
  const change = amountReceived ? parseFloat(amountReceived) - total : 0;

  const handleCompleteSale = () => {
    // Mock sale completion
    alert("Sale completed successfully!");
    setCart([]);
    setPaymentMethod("");
    setCustomerName("");
    setAmountReceived("");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 ml-64 p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/sales">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sales
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">New Sale</h1>
              <p className="text-muted-foreground">Point of Sale System</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filter */}
            <Card className="shadow-warm">
              <CardContent className="pt-6">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Products</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="breads">Breads</SelectItem>
                        <SelectItem value="pastries">Pastries</SelectItem>
                        <SelectItem value="muffins">Muffins</SelectItem>
                        <SelectItem value="cupcakes">Cupcakes</SelectItem>
                        <SelectItem value="beverages">Beverages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border border-border rounded-lg p-3 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => addToCart(product)}
                    >
                      <div className="w-full h-20 bg-muted/30 rounded-lg mb-2 flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-sm text-foreground mb-1">{product.name}</h3>
                      <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {product.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart and Checkout Section */}
          <div className="space-y-6">
            {/* Cart */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Cart is empty</p>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 border border-border rounded">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(item.id)}
                            className="h-6 w-6 p-0 text-destructive"
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

            {/* Customer Info */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Customer name..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Payment */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Button
                      variant={paymentMethod === "cash" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("cash")}
                      className="flex-col h-16"
                    >
                      <Banknote className="h-5 w-5 mb-1" />
                      <span className="text-xs">Cash</span>
                    </Button>
                    <Button
                      variant={paymentMethod === "card" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("card")}
                      className="flex-col h-16"
                    >
                      <CreditCard className="h-5 w-5 mb-1" />
                      <span className="text-xs">Card</span>
                    </Button>
                    <Button
                      variant={paymentMethod === "mobile" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("mobile")}
                      className="flex-col h-16"
                    >
                      <Smartphone className="h-5 w-5 mb-1" />
                      <span className="text-xs">Mobile</span>
                    </Button>
                  </div>
                </div>

                {paymentMethod === "cash" && (
                  <div>
                    <Label htmlFor="amount">Amount Received</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                    />
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (8%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  {paymentMethod === "cash" && amountReceived && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Change:</span>
                      <span>${Math.max(0, change).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full shadow-warm"
                  disabled={cart.length === 0 || !paymentMethod || (paymentMethod === "cash" && parseFloat(amountReceived) < total)}
                  onClick={handleCompleteSale}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Complete Sale
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewSale;