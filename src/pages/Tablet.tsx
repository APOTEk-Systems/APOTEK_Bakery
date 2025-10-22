import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ShoppingCart, Package, Truck, Factory, History, CreditCard, Settings, Plus, Sun, Moon } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

// Mock data for demonstration
const mockSalesHistory = [
  { id: 1, date: "2024-01-15", customer: "John Doe", total: 25000, status: "completed" },
  { id: 2, date: "2024-01-15", customer: "Jane Smith", total: 18000, status: "completed" },
  { id: 3, date: "2024-01-14", customer: "Cash", total: 32000, status: "completed" },
];

const mockInventory = [
  { id: 1, name: "Flour", quantity: 150, unit: "kg", minLevel: 50, type: "raw_material" },
  { id: 2, name: "Sugar", quantity: 80, unit: "kg", minLevel: 30, type: "raw_material" },
  { id: 3, name: "Butter", quantity: 25, unit: "kg", minLevel: 20, type: "raw_material" },
  { id: 4, name: "Cleaning Supplies", quantity: 10, unit: "pcs", minLevel: 5, type: "supplies" },
  { id: 5, name: "Packaging Boxes", quantity: 200, unit: "pcs", minLevel: 50, type: "supplies" },
];

const mockPurchaseOrders = [
  { id: 1, supplier: "ABC Supplies", status: "pending", total: 45000 },
  { id: 2, supplier: "XYZ Foods", status: "approved", total: 28000 },
];

const mockProductionRuns = [
  { id: 1, product: "Chocolate Cake", quantity: 50, status: "in_progress" },
  { id: 2, product: "Vanilla Cupcakes", quantity: 100, status: "completed" },
];

const Tablet = () => {
  const [currentView, setCurrentView] = useState<"login" | "dashboard" | "sales" | "sales-history" | "pos" | "checkout" | "receipt" | "inventory" | "inventory-details" | "inventory-adjustments" | "purchases" | "purchase-orders" | "material-receiving" | "production" | "production-list" | "create-po" | "create-production">("login");
  const [loginStep, setLoginStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [cart, setCart] = useState<Array<{id: number, name: string, price: number, quantity: number}>>([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit">("cash");
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [poItems, setPoItems] = useState<Array<{item: string, quantity: number, unitPrice: number}>>([{item: "", quantity: 0, unitPrice: 0}]);
  const [productionIngredients, setProductionIngredients] = useState<Array<{ingredient: string, quantity: number, unit: string}>>([{ingredient: "", quantity: 0, unit: "kg"}]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('tablet-theme');
    return saved ? JSON.parse(saved) : false;
  });
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('tablet-theme', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogin = () => {
    if (loginStep === "email" && email) {
      setLoginStep("code");
    } else if (loginStep === "code" && code === "1234") {
      setCurrentView("dashboard");
    }
  };

  const addToCart = (product: {id: number, name: string, price: number}) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? {...item, quantity: item.quantity + 1}
            : item
        );
      }
      return [...prev, {...product, quantity: 1}];
    });
  };

  const updateCartQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev => prev.map(item =>
        item.id === id ? {...item, quantity} : item
      ));
    }
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const renderLogin = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Tablet Login</CardTitle>
          <p className="text-gray-600 dark:text-gray-300">Enter your credentials to continue</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {loginStep === "email" ? (
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-white">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="code" className="dark:text-white">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter verification code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={4}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">Demo code: 1234</p>
            </div>
          )}
          <Button onClick={handleLogin} className="w-full" size="lg">
            {loginStep === "email" ? "Send Code" : "Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderDashboard = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Quick Actions</h1>
            <p className="text-gray-600 dark:text-gray-300">Select a module to get started</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="dark:border-gray-600 dark:hover:bg-gray-700"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-400"
            onClick={() => setCurrentView("sales")}
          >
            <CardContent className="p-8 text-center">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-semibold dark:text-white">Sales</h3>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-green-400"
            onClick={() => setCurrentView("inventory")}
          >
            <CardContent className="p-8 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-green-600 dark:text-green-400" />
              <h3 className="text-xl font-semibold dark:text-white">Inventory</h3>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-orange-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-orange-400"
            onClick={() => setCurrentView("purchases")}
          >
            <CardContent className="p-8 text-center">
              <Truck className="h-16 w-16 mx-auto mb-4 text-orange-600 dark:text-orange-400" />
              <h3 className="text-xl font-semibold dark:text-white">Purchases</h3>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-purple-400"
            onClick={() => setCurrentView("production")}
          >
            <CardContent className="p-8 text-center">
              <Factory className="h-16 w-16 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xl font-semibold dark:text-white">Production</h3>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="mr-4 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
          >
            Back to Main App
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setCurrentView("login");
              setLoginStep("email");
              setEmail("");
              setCode("");
            }}
            className="dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSales = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setCurrentView("dashboard")} className="dark:border-gray-600 dark:hover:bg-gray-700">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Sales</h1>
            <p className="text-gray-600 dark:text-gray-300">Choose an action</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700"
            onClick={() => setCurrentView("sales-history")}
          >
            <CardContent className="p-8 text-center">
              <History className="h-16 w-16 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Sales History</h3>
              <p className="text-gray-600 dark:text-gray-300">View completed transactions</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700"
            onClick={() => setCurrentView("pos")}
          >
            <CardContent className="p-8 text-center">
              <CreditCard className="h-16 w-16 mx-auto mb-4 text-green-600 dark:text-green-400" />
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Point of Sale</h3>
              <p className="text-gray-600 dark:text-gray-300">Create new sales transaction</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setCurrentView("dashboard")} className="dark:border-gray-600 dark:hover:bg-gray-700">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Inventory</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage materials and supplies</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700"
            onClick={() => setCurrentView("inventory-details")}
          >
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-green-600 dark:text-green-400" />
              <h3 className="text-xl font-semibold dark:text-white">Details</h3>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700"
            onClick={() => setCurrentView("inventory-adjustments")}
          >
            <CardContent className="p-8 text-center">
              <Settings className="h-12 w-12 mx-auto mb-4 text-orange-600 dark:text-orange-400" />
              <h3 className="text-xl font-semibold dark:text-white">Adjustments</h3>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderPurchases = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setCurrentView("dashboard")} className="dark:border-gray-600 dark:hover:bg-gray-700">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Purchases</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage purchase orders and receiving</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700"
            onClick={() => setCurrentView("purchase-orders")}
          >
            <CardContent className="p-8 text-center">
              <Truck className="h-12 w-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-semibold dark:text-white">Purchase Orders</h3>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700"
            onClick={() => setCurrentView("material-receiving")}
          >
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-green-600 dark:text-green-400" />
              <h3 className="text-xl font-semibold dark:text-white">Material Receiving</h3>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const [inventoryFilterType, setInventoryFilterType] = useState<"all" | "raw_material" | "supplies">("all");

  const renderInventoryDetails = () => {
    const filteredInventory = inventoryFilterType === "all"
      ? mockInventory
      : mockInventory.filter(item => item.type === inventoryFilterType);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setCurrentView("inventory")} className="dark:border-gray-600 dark:hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Inventory Details</h1>
              <p className="text-gray-600 dark:text-gray-300">Current stock levels</p>
            </div>
          </div>

          <div className="mb-6">
            <Label htmlFor="inventory-filter" className="dark:text-white">Filter by Type</Label>
            <select
              id="inventory-filter"
              value={inventoryFilterType}
              onChange={(e) => setInventoryFilterType(e.target.value as "all" | "raw_material" | "supplies")}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Items</option>
              <option value="raw_material">Raw Materials</option>
              <option value="supplies">Supplies</option>
            </select>
          </div>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Stock Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredInventory.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg dark:border-gray-600 dark:bg-gray-700">
                    <div>
                      <h3 className="font-semibold dark:text-white">{item.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Min Level: {item.minLevel} {item.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        item.quantity <= item.minLevel ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                      }`}>
                        {item.quantity} {item.unit}
                      </p>
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.quantity <= item.minLevel ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {item.quantity <= item.minLevel ? 'Low Stock' : 'Good Stock'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderInventoryAdjustments = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setCurrentView("inventory")} className="dark:border-gray-600 dark:hover:bg-gray-700">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Inventory Adjustments</h1>
            <p className="text-gray-600 dark:text-gray-300">Make stock adjustments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Adjustments */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Recent Adjustments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 1, item: "Flour", amount: -5, reason: "Damaged stock", date: "2024-01-15" },
                  { id: 2, item: "Sugar", amount: 10, reason: "New delivery", date: "2024-01-14" },
                ].map((adjustment) => (
                  <div key={adjustment.id} className="flex justify-between items-center p-3 border rounded dark:border-gray-600 dark:bg-gray-700">
                    <div>
                      <p className="font-medium dark:text-white">{adjustment.item}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{adjustment.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        adjustment.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {adjustment.amount > 0 ? '+' : ''}{adjustment.amount}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{adjustment.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* New Adjustment Form */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">New Adjustment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adjustment-item" className="dark:text-white">Item</Label>
                <select id="adjustment-item" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  {mockInventory.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="dark:text-white">Action</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 dark:text-white">
                    <input type="radio" name="action" value="add" defaultChecked />
                    Add
                  </label>
                  <label className="flex items-center gap-2 dark:text-white">
                    <input type="radio" name="action" value="minus" />
                    Minus
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="dark:text-white">Quantity</Label>
                <Input type="number" placeholder="Enter quantity" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adjustment-reason" className="dark:text-white">Reason</Label>
                <select id="adjustment-reason" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option>Damaged stock</option>
                  <option>New delivery</option>
                  <option>Correction</option>
                  <option>Other</option>
                </select>
              </div>

              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Adjustment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderProduction = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setCurrentView("dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Production</h1>
            <p className="text-gray-600">Manage production and batches</p>
          </div>
        </div>

        <div className="text-center">
          <Button
            className="w-full max-w-md mr-4"
            size="lg"
            onClick={() => setCurrentView("production-list")}
          >
            <Factory className="h-5 w-5 mr-2" />
            View Today's Production
          </Button>
          <Button
            className="w-full max-w-md"
            size="lg"
            variant="outline"
            onClick={() => setCurrentView("create-production")}
          >
            <Plus className="h-5 w-5 mr-2" />
            Start New Production
          </Button>
        </div>
      </div>
    </div>
  );

  const [salesHistoryTab, setSalesHistoryTab] = useState("recent");

  const renderSalesHistory = () => {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setCurrentView("sales")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Sales History</h1>
              <p className="text-gray-600">View and manage sales transactions</p>
            </div>
          </div>

          <Tabs value={salesHistoryTab} onValueChange={setSalesHistoryTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recent">Recent Sales</TabsTrigger>
              <TabsTrigger value="unpaid">Outstanding Payments</TabsTrigger>
              <TabsTrigger value="payments">Payment History</TabsTrigger>
            </TabsList>

            <TabsContent value="recent">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockSalesHistory.map((sale) => (
                      <div key={sale.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{sale.customer}</h3>
                          <p className="text-sm text-gray-600">{sale.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            TZS {sale.total.toLocaleString()}
                          </p>
                          <span className={`px-2 py-1 rounded text-xs ${
                            sale.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {sale.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="unpaid">
              <Card>
                <CardHeader>
                  <CardTitle>Outstanding Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockSalesHistory.filter(sale => sale.status === 'pending').map((sale) => (
                      <div key={sale.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{sale.customer}</h3>
                          <p className="text-sm text-gray-600">{sale.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">
                            TZS {sale.total.toLocaleString()}
                          </p>
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                            Outstanding
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockSalesHistory.filter(sale => sale.status === 'completed').map((sale) => (
                      <div key={sale.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{sale.customer}</h3>
                          <p className="text-sm text-gray-600">{sale.date} - Payment received</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            TZS {sale.total.toLocaleString()}
                          </p>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            Paid
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  };

  const renderPOS = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setCurrentView("sales")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Point of Sale</h1>
            <p className="text-gray-600">Create new sales transaction</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Products Section */}
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 1, name: "Chocolate Cake", price: 15000 },
                  { id: 2, name: "Vanilla Cupcake", price: 3000 },
                  { id: 3, name: "Bread Loaf", price: 8000 },
                  { id: 4, name: "Croissant", price: 2500 },
                ].map((product) => (
                  <Card key={product.id} className="p-4 cursor-pointer hover:bg-gray-50">
                    <div className="text-center">
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-lg font-bold text-green-600">
                        TZS {product.price.toLocaleString()}
                      </p>
                      <Button
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => addToCart(product)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cart Section */}
          <Card>
            <CardHeader>
              <CardTitle>Cart ({cart.length} items)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Cart is empty</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          TZS {item.price.toLocaleString()} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>TZS {getTotal().toLocaleString()}</span>
                </div>
                <Button
                  className="w-full mt-4"
                  disabled={cart.length === 0}
                  onClick={() => setCurrentView("checkout")}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderCheckout = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setCurrentView("pos")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
            <p className="text-gray-600">Complete the sale transaction</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">TZS {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>TZS {getTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Payment */}
          <Card>
            <CardHeader>
              <CardTitle>Customer & Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer Name (Optional)</Label>
                <Input
                  id="customer"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={(e) => setPaymentMethod(e.target.value as "cash" | "credit")}
                    />
                    Cash
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      value="credit"
                      checked={paymentMethod === "credit"}
                      onChange={(e) => setPaymentMethod(e.target.value as "cash" | "credit")}
                    />
                    Credit
                  </label>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  // Mock sale completion
                  const sale = {
                    id: Date.now(),
                    customer: customerName || "Cash",
                    items: cart,
                    total: getTotal(),
                    paymentMethod,
                    date: new Date().toISOString(),
                  };
                  setCompletedSale(sale);
                  setCart([]);
                  setCustomerName("");
                  setPaymentMethod("cash");
                  setCurrentView("receipt");
                }}
              >
                Complete Sale
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderReceipt = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sale Receipt</CardTitle>
            <p className="text-gray-600">Receipt #{completedSale?.id}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center border-b pb-4">
              <h3 className="font-semibold text-lg">Golden Crust Bakery</h3>
              <p className="text-sm text-gray-600">123 Baker Street, Pastry City</p>
              <p className="text-sm text-gray-600">{new Date(completedSale?.date).toLocaleDateString()}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{completedSale?.customer}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment:</span>
                <span className="capitalize">{completedSale?.paymentMethod}</span>
              </div>
            </div>

            <div className="border-t border-b py-4">
              <h4 className="font-semibold mb-2">Items:</h4>
              {completedSale?.items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span>TZS {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>TZS {completedSale?.total.toLocaleString()}</span>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">Thank you for your business!</p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.print()}
              >
                Print Receipt
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setCompletedSale(null);
                  setCurrentView("dashboard");
                }}
              >
                New Sale
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPurchaseOrders = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setCurrentView("purchases")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Purchase Orders</h1>
            <p className="text-gray-600">Manage purchase orders</p>
          </div>
        </div>

        <div className="mb-6">
          <Button
            className="w-full"
            size="lg"
            onClick={() => setCurrentView("create-po")}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Purchase Order
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPurchaseOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{order.supplier}</h3>
                    <p className="text-sm text-gray-600">Order #{order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      TZS {order.total.toLocaleString()}
                    </p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMaterialReceiving = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setCurrentView("purchases")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Material Receiving</h1>
            <p className="text-gray-600">View received materials</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 1, supplier: "ABC Supplies", item: "Flour", quantity: 50, unit: "kg", date: "2024-01-15", status: "received" },
                { id: 2, supplier: "XYZ Foods", item: "Sugar", quantity: 25, unit: "kg", date: "2024-01-14", status: "received" },
                { id: 3, supplier: "Fresh Dairy", item: "Butter", quantity: 10, unit: "kg", date: "2024-01-13", status: "pending" },
              ].map((delivery) => (
                <div key={delivery.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{delivery.supplier}</h3>
                    <p className="text-sm text-gray-600">{delivery.item} - {delivery.quantity} {delivery.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{delivery.date}</p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      delivery.status === 'received' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {delivery.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProductionList = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setCurrentView("dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Today's Production</h1>
            <p className="text-gray-600">Production for today</p>
          </div>
        </div>

        <div className="mb-6">
          <Button
            className="w-full"
            size="lg"
            onClick={() => setCurrentView("create-production")}
          >
            <Plus className="h-5 w-5 mr-2" />
            Start New Production
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Today's Production</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProductionRuns.map((run) => (
                <div key={run.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{run.product}</h3>
                    <p className="text-sm text-gray-600">Production #{run.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      Qty: {run.quantity}
                    </p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      run.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {run.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const addPoItem = () => {
    setPoItems([...poItems, {item: "", quantity: 0, unitPrice: 0}]);
  };

  const updatePoItem = (index: number, field: string, value: any) => {
    const updatedItems = [...poItems];
    updatedItems[index] = {...updatedItems[index], [field]: value};
    setPoItems(updatedItems);
  };

  const removePoItem = (index: number) => {
    if (poItems.length > 1) {
      setPoItems(poItems.filter((_, i) => i !== index));
    }
  };

  const renderCreatePO = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setCurrentView("purchase-orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Create Purchase Order</h1>
            <p className="text-gray-600">Create a new purchase order</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplier-select">Supplier</Label>
              <select id="supplier-select" className="w-full p-2 border rounded">
                <option>ABC Supplies</option>
                <option>XYZ Foods</option>
                <option>Fresh Dairy</option>
              </select>
            </div>

            <div className="space-y-4">
              <Label>Items</Label>
              {poItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <select
                      className="w-full p-2 border rounded"
                      value={item.item}
                      onChange={(e) => updatePoItem(index, 'item', e.target.value)}
                    >
                      <option value="">Select item</option>
                      <option>Flour</option>
                      <option>Sugar</option>
                      <option>Butter</option>
                      <option>Cleaning Supplies</option>
                    </select>
                  </div>
                  <Input
                    type="number"
                    placeholder="Qty"
                    className="w-20"
                    value={item.quantity || ''}
                    onChange={(e) => updatePoItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    className="w-24"
                    value={item.unitPrice || ''}
                    onChange={(e) => updatePoItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  />
                  {poItems.length > 1 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removePoItem(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addPoItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>TZS {poItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString()}</span>
              </div>
            </div>

            <Button className="w-full" size="lg">
              Create Purchase Order
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const addProductionIngredient = () => {
    setProductionIngredients([...productionIngredients, {ingredient: "", quantity: 0, unit: "kg"}]);
  };

  const updateProductionIngredient = (index: number, field: string, value: any) => {
    const updatedIngredients = [...productionIngredients];
    updatedIngredients[index] = {...updatedIngredients[index], [field]: value};
    setProductionIngredients(updatedIngredients);
  };

  const removeProductionIngredient = (index: number) => {
    if (productionIngredients.length > 1) {
      setProductionIngredients(productionIngredients.filter((_, i) => i !== index));
    }
  };

  const getRecipeForProduct = (product: string) => {
    const recipes: Record<string, Array<{ingredient: string, quantity: number, unit: string}>> = {
      "Chocolate Cake": [
        {ingredient: "Flour", quantity: 2, unit: "kg"},
        {ingredient: "Sugar", quantity: 1.5, unit: "kg"},
        {ingredient: "Butter", quantity: 0.5, unit: "kg"},
        {ingredient: "Cocoa Powder", quantity: 0.2, unit: "kg"}
      ],
      "Vanilla Cupcake": [
        {ingredient: "Flour", quantity: 1, unit: "kg"},
        {ingredient: "Sugar", quantity: 0.8, unit: "kg"},
        {ingredient: "Butter", quantity: 0.3, unit: "kg"},
        {ingredient: "Vanilla Extract", quantity: 0.05, unit: "kg"}
      ],
      "Bread Loaf": [
        {ingredient: "Flour", quantity: 3, unit: "kg"},
        {ingredient: "Yeast", quantity: 0.1, unit: "kg"},
        {ingredient: "Salt", quantity: 0.05, unit: "kg"}
      ],
      "Croissant": [
        {ingredient: "Flour", quantity: 2.5, unit: "kg"},
        {ingredient: "Butter", quantity: 1, unit: "kg"},
        {ingredient: "Sugar", quantity: 0.3, unit: "kg"}
      ]
    };
    return recipes[product] || [];
  };

  const [selectedProduct, setSelectedProduct] = useState("");

  const handleProductChange = (product: string) => {
    setSelectedProduct(product);
    if (product) {
      const recipe = getRecipeForProduct(product);
      setProductionIngredients(recipe.length > 0 ? recipe : [{ingredient: "", quantity: 0, unit: "kg"}]);
    } else {
      setProductionIngredients([{ingredient: "", quantity: 0, unit: "kg"}]);
    }
  };

  const renderCreateProduction = () => {

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setCurrentView("production-list")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Start Production</h1>
              <p className="text-gray-600">Create a new production</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Production Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product-select">Product</Label>
                <select
                  id="product-select"
                  className="w-full p-2 border rounded"
                  value={selectedProduct}
                  onChange={(e) => handleProductChange(e.target.value)}
                >
                  <option value="">Select product</option>
                  <option>Chocolate Cake</option>
                  <option>Vanilla Cupcake</option>
                  <option>Bread Loaf</option>
                  <option>Croissant</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Quantity to Produce</Label>
                <Input type="number" placeholder="Enter quantity" />
              </div>

            
              <Button className="w-full" size="lg">
                Start Production
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  switch (currentView) {
    case "login":
      return renderLogin();
    case "dashboard":
      return renderDashboard();
    case "sales":
      return renderSales();
    case "sales-history":
      return renderSalesHistory();
    case "pos":
      return renderPOS();
    case "checkout":
      return renderCheckout();
    case "receipt":
      return renderReceipt();
    case "inventory":
      return renderInventory();
    case "inventory-details":
      return renderInventoryDetails();
    case "inventory-adjustments":
      return renderInventoryAdjustments();
    case "purchases":
      return renderPurchases();
    case "purchase-orders":
      return renderPurchaseOrders();
    case "material-receiving":
      return renderMaterialReceiving();
    case "production":
      return renderProductionList();
    case "production-list":
      return renderProductionList();
    case "create-po":
      return renderCreatePO();
    case "create-production":
      return renderCreateProduction();
    default:
      return renderLogin();
  }
};

export default Tablet;