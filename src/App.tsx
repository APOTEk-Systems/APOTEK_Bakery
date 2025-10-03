import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";
import { PastryProSpinner } from "./components/ui/PastryProSpinner";
const ProtectedRoute = lazy(() => import("@/components/ProtectedRoute"));
const Index = lazy(() => import("./pages/Index"));
const SaleDetail = lazy(() => import("./pages/SaleDetail"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const ProductForm = lazy(() => import("./pages/ProductForm"));
const ProductionRuns = lazy(() => import("./pages/ProductionRuns"));
const ProductionRunDetail = lazy(() => import("./pages/ProductionRunDetail"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Supplies = lazy(() => import("./pages/Supplies"));
const SuppliesForm = lazy(() => import("./pages/SuppliesForm"));
const InventoryForm = lazy(() => import("./pages/InventoryForm"));
const InventoryAdjustments = lazy(() => import("./pages/InventoryAdjustments"));
const SuppliesAdjustments = lazy(() => import("./pages/SuppliesAdjustments"));
const Customers = lazy(() => import("./pages/Customers"));
const CustomerDetail = lazy(() => import("./pages/CustomerDetail"));
const CustomerForm = lazy(() => import("./pages/CustomerForm"));
const Sales = lazy(() => import("./pages/Sales"));
const NewSale = lazy(() => import("./pages/NewSale"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Purchases = lazy(() => import("./pages/Purchases"));
const PurchaseOrderView = lazy(() => import("./pages/PurchaseOrderView"));
const GoodsReceivingView = lazy(() => import("./pages/GoodsReceivingView"));
const Accounting = lazy(() => import("./pages/Accounting"));
const Reports = lazy(() => import("./pages/Reports"));
const UserRoleManagement = lazy(() => import("./pages/UserRoleManagement"));
const Information = lazy(() => import("./pages/Information"));
const Notifications = lazy(() => import("./pages/Notifications"));
const SystemSettings = lazy(() => import("./pages/SystemSettings"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position={`top-right`} />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PastryProSpinner />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              } />
              <Route path="/products/new" element={
                <ProtectedRoute>
                  <ProductForm />
                </ProtectedRoute>
              } />
              <Route path="/products/:id" element={
                <ProtectedRoute>
                  <ProductDetail />
                </ProtectedRoute>
              } />
              <Route path="/products/:id/edit" element={
                <ProtectedRoute>
                  <ProductForm />
                </ProtectedRoute>
              } />
              <Route path="/materials" element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              } />
              <Route path="/supplies" element={
                <ProtectedRoute>
                  <Supplies />
                </ProtectedRoute>
              } />
              <Route path="/purchases" element={
                <ProtectedRoute>
                  <Purchases />
                </ProtectedRoute>
              } />
              <Route path="/purchases/:id" element={
                <ProtectedRoute>
                  <PurchaseOrderView />
                </ProtectedRoute>
              } />
              <Route path="/purchases/:id/receive" element={
                <ProtectedRoute>
                  <GoodsReceivingView />
                </ProtectedRoute>
              } />
              <Route path="/materials/new" element={
                <ProtectedRoute>
                  <InventoryForm />
                </ProtectedRoute>
              } />
              <Route path="/materials/:id/edit" element={
                <ProtectedRoute>
                  <InventoryForm />
                </ProtectedRoute>
              } />
              <Route path="/materials/adjustments" element={
                <ProtectedRoute>
                  <InventoryAdjustments />
                </ProtectedRoute>
              } />
              <Route path="/supplies/new" element={
                <ProtectedRoute>
                  <SuppliesForm />
                </ProtectedRoute>
              } />
              <Route path="/supplies/:id/edit" element={
                <ProtectedRoute>
                  <SuppliesForm />
                </ProtectedRoute>
              } />
              <Route path="/supplies/adjustments" element={
                <ProtectedRoute>
                  <SuppliesAdjustments />
                </ProtectedRoute>
              } />
              <Route path="/customers" element={
                <ProtectedRoute>
                  <Customers />
                </ProtectedRoute>
              } />
              <Route path="/customers/new" element={
                <ProtectedRoute>
                  <CustomerForm />
                </ProtectedRoute>
              } />
              <Route path="/customers/:id" element={
                <ProtectedRoute>
                  <CustomerDetail />
                </ProtectedRoute>
              } />
              <Route path="/customers/:id/edit" element={
                <ProtectedRoute>
                  <CustomerForm />
                </ProtectedRoute>
              } />
              <Route path="/sales" element={
                <ProtectedRoute>
                  <Sales />
                </ProtectedRoute>
              } />
              <Route path="/sales/new" element={
                <ProtectedRoute>
                  <NewSale />
                </ProtectedRoute>
              } />
              <Route path="/sales/:id" element={
                <ProtectedRoute>
                  <SaleDetail />
                </ProtectedRoute>
              } />
              <Route path="/production-runs" element={
                <ProtectedRoute>
                  <ProductionRuns />
                </ProtectedRoute>
              } />
              <Route path="/production-runs/:id" element={
                <ProtectedRoute>
                  <ProductionRunDetail />
                </ProtectedRoute>
              } />
              <Route path="/accounting" element={
                <ProtectedRoute>
                  <Accounting />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="/user-role-management" element={
                <ProtectedRoute>
                  <UserRoleManagement />
                </ProtectedRoute>
              } />
              <Route path="/information" element={
                <ProtectedRoute>
                  <Information />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />
              <Route path="/system-settings" element={
                <ProtectedRoute>
                  <SystemSettings />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={
                <ProtectedRoute>
                  <NotFound />
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
