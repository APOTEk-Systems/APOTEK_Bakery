import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import SalesSummaryTab from "./dashboard/SalesSummaryTab";
import PurchasesSummaryTab from "./dashboard/PurchasesSummaryTab";
import InventorySummaryTab from "./dashboard/InventorySummaryTab";
import ProductionSummaryTab from "./dashboard/ProductionSummaryTab";
import AccountingSummaryTab from "./dashboard/AccountingSummaryTab";

// Helper function to check permissions
const hasPermission = (user: any, permission: string): boolean => {
  if (!user) return false;
  if (user.permissions?.includes("all")) return true;
  return user.permissions?.includes(permission) || false;
};

const Dashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        {" "}
        <Loader2 className="mr-2 h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Handled by ProtectedRoute
  }

  const hasAllPermissions = hasPermission(user, "all");
  const hasSalesDashboard = hasPermission(user, "view:salesDashboard");
  const hasPurchasesDashboard = hasPermission(user, "view:purchasesDashboard");
  const hasInventoryDashboard = hasPermission(user, "view:inventoryDashboard");
  const hasProductionDashboard = hasPermission(
    user,
    "view:productionDashboard"
  );
  const hasAccountingDashboard = hasPermission(
    user,
    "view:accountingDashboard"
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="w-full">
            {(hasAllPermissions || hasSalesDashboard) && (
              <TabsTrigger value="sales" className="w-full">
                Sales
              </TabsTrigger>
            )}
            {(hasAllPermissions || hasPurchasesDashboard) && (
              <TabsTrigger value="purchases" className="w-full">
                Purchases
              </TabsTrigger>
            )}
            {(hasAllPermissions || hasInventoryDashboard) && (
              <TabsTrigger value="material" className="w-full">
                Inventory
              </TabsTrigger>
            )}
            {(hasAllPermissions || hasProductionDashboard) && (
              <TabsTrigger value="production" className="w-full">
                Production
              </TabsTrigger>
            )}
            {(hasAllPermissions || hasAccountingDashboard) && (
              <TabsTrigger value="accounting" className="w-full">
                Accounting
              </TabsTrigger>
            )}
          </TabsList>
          {(hasAllPermissions || hasSalesDashboard) && (
            <TabsContent value="sales">
              <SalesSummaryTab />
            </TabsContent>
          )}
          {(hasAllPermissions || hasPurchasesDashboard) && (
            <TabsContent value="purchases">
              <PurchasesSummaryTab />
            </TabsContent>
          )}
          {(hasAllPermissions || hasInventoryDashboard) && (
            <TabsContent value="material">
              <InventorySummaryTab />
            </TabsContent>
          )}
          {(hasAllPermissions || hasProductionDashboard) && (
            <TabsContent value="production">
              <ProductionSummaryTab />
            </TabsContent>
          )}
          {(hasAllPermissions || hasAccountingDashboard) && (
            <TabsContent value="accounting">
              <AccountingSummaryTab />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
