import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import ProductForm from "./pages/ProductForm";
import Inventory from "./pages/Inventory";
import InventoryForm from "./pages/InventoryForm";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import OrderForm from "./pages/OrderForm";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import CustomerForm from "./pages/CustomerForm";
import Sales from "./pages/Sales";
import NewSale from "./pages/NewSale";
import StockRequests from "./pages/StockRequests";
import RequestApprovals from "./pages/RequestApprovals";
import PurchaseOrders from "./pages/PurchaseOrders";
import Accounting from "./pages/Accounting";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/:id/edit" element={<ProductForm />} />
          <Route path="/stock-requests" element={<StockRequests />} />
          <Route path="/request-approvals" element={<RequestApprovals />} />
          <Route path="/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/new" element={<InventoryForm />} />
          <Route path="/inventory/:id/edit" element={<InventoryForm />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/new" element={<OrderForm />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/orders/:id/edit" element={<OrderForm />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/customers/:id/edit" element={<CustomerForm />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales/new" element={<NewSale />} />
          <Route path="/accounting" element={<Accounting />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
