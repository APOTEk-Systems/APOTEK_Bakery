import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { useQuery } from '@tanstack/react-query';
import {useAuth} from "@/contexts/AuthContext";
import {inventoryService} from "@/services/inventory";
import {dashboardService} from "@/services/dashboard";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Loader2,
  Banknote,
} from "lucide-react";
import { formatCurrency } from "@/lib/funcs";

// Helper function to check permissions
const hasPermission = (user: any, permission: string): boolean => {
  if (!user) return false;
  if (user.permissions?.includes("all")) return true;
  return user.permissions?.includes(permission) || false;
};

const SalesSummaryTab = () => {
  const { data: dashboardData, isPending: loading } = useQuery({
    queryKey: ['salesDashboard'],
    queryFn: () => dashboardService.getSalesDashboard(),
  });

  const salesData = dashboardData?.weeklySalesList || [];

  const growthPercentage = dashboardData?.salesGrowth && dashboardData.salesGrowth.previous !== 0 ?
    (((dashboardData.salesGrowth.current - dashboardData.salesGrowth.previous) / dashboardData.salesGrowth.previous) * 100).toFixed(2) : '0.00';

  const growthNum = parseFloat(growthPercentage) || 0;

  if(loading){
    return(
      <div className="flex flex-col w-full justify-center items-center p-6">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p>Sales Loading</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales This Month</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.totalSalesThisMonth) ?? "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Growth: {growthPercentage}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Sales</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.averageDailySales) ?? "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Average per day</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sales Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {growthPercentage}%
            </div>
            <p className="text-xs text-muted-foreground">
              Current: {formatCurrency(dashboardData?.salesGrowth?.current) ?? "0.00"} | Previous: {formatCurrency(dashboardData?.salesGrowth?.previous) ?? "0.00"}
            </p>
            <div className="flex items-center mt-2">
              {growthNum > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm ${growthNum > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growthNum > 0 ? 'Up' : 'Down'} {Math.abs(growthNum)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Weekly Sales Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="weekStart" />
              <YAxis />
              <Tooltip formatter={(value) => [`${formatCurrency(Number(value))}`, 'Total']} />
              <Bar dataKey="total" fill="#93631f" name="Sales" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

const PurchasesSummaryTab = () => {
  const { data: dashboardData, isPending: loading } = useQuery({
    queryKey: ['purchasesDashboard'],
    queryFn: () => dashboardService.getPurchasesDashboard(),
  });

  const purchasesData = dashboardData?.weeklyPurchasesList || [];

  if(loading){
    return(
      <div className="flex flex-col w-full justify-center items-center p-6">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p>Purchases Loading</p>
      </div>
    )
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases This Month</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.totalPurchasesThisMonth) ?? "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Growth: {dashboardData?.purchaseGrowth ?? 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Purchase Orders</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.pendingPurchaseOrders ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Orders awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Purchase Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.purchaseGrowth ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground">Monthly growth rate</p>
            <div className="flex items-center mt-2">
              {(dashboardData?.purchaseGrowth ?? 0) > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm ${(dashboardData?.purchaseGrowth ?? 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(dashboardData?.purchaseGrowth ?? 0) > 0 ? 'Up' : 'Down'} {Math.abs(dashboardData?.purchaseGrowth ?? 0)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Weekly Purchases Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={purchasesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="weekStart" />
              <YAxis />
              <Tooltip formatter={(value) => [`${formatCurrency(Number(value || 0))}`, 'Total']} />
              <Bar dataKey="total" fill="#ef4444" name="Purchases" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

const InventorySummaryTab = () => {
  const { data: rawMaterials, isPending: rawMaterialsLoading } = useQuery({
    queryKey: ['inventory', 'raw_material'],
    queryFn: () => inventoryService.getInventory({ type: 'raw_material' }),
  });

  const { data: supplies, isPending: suppliesLoading } = useQuery({
    queryKey: ['inventory', 'supplies'],
    queryFn: () => inventoryService.getInventory({ type: 'supplies' }),
  });

  const loading = rawMaterialsLoading || suppliesLoading;

  const getStatus = (currentQuantity: number, minLevel: number) => {
    if (currentQuantity <= minLevel * 0.5) return "critical";
    if (currentQuantity <= minLevel) return "low";
    return "in-stock";
  };

  const getLowStockItems = (items: any[]) => {
    return items.filter(item => {
      const status = getStatus(item.currentQuantity, item.minLevel);
      return status === "critical" || status === "low";
    });
  };

  const lowStockRawMaterials = rawMaterials ? getLowStockItems(rawMaterials) : [];
  const lowStockSupplies = supplies ? getLowStockItems(supplies) : [];


  if(loading){
    return(
      <div className="flex flex-col w-full justify-center items-center p-6">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p>Loading ...</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Inventory Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-4">
          {/* Low Stock Raw Materials */}
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold">Raw Materials</h4>
            {lowStockRawMaterials.length > 0 ? (
              lowStockRawMaterials.map((item: any) => {
                const status = getStatus(item.currentQuantity, item.minLevel);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Current: {item.currentQuantity} | Min: {item.minLevel}
                      </p>
                    </div>
                    <Badge variant={status === "critical" ? "destructive" : "secondary"}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground">No low materials</p>
            )}
          </div>

          {/* Low Stock Supplies */}
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold">Supplies</h4>
            {lowStockSupplies.length > 0 ? (
              lowStockSupplies.map((item: any) => {
                const status = getStatus(item.currentQuantity, item.minLevel);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Current: {item.currentQuantity} | Min: {item.minLevel}
                      </p>
                    </div>
                    <Badge variant={status === "critical" ? "destructive" : "secondary"}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground">No low supplies</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ProductionSummaryTab = () => {
  const { data: productionData, isPending: loading } = useQuery({
    queryKey: ['productionSummary'],
    queryFn: () => dashboardService.getProductionDashboard(),
  });

  if(loading){
    return(
      <div className="flex flex-col w-full justify-center items-center p-6">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p>Loading ...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Daily Production</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productionData?.dailyProduction ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Units produced today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Weekly Production</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productionData?.weeklyProduction ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Units produced this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Weekly Production Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(productionData?.weeklyProductionCost) ?? "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Total cost this week</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AccountingSummaryTab = () => {
  const { data: summary, isPending: loading } = useQuery({
    queryKey: ['accountingSummary'],
    queryFn: () => dashboardService.getAccountingDashboard(),
  });

  if(loading){
    return(
      <div className="flex flex-col w-full justify-center items-center p-6">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p>Loading ...</p>
      </div>
    )
  };

  const currentMonth = summary?.currentMonth;
  const lastMonth = summary?.lastMonth;

  return (
    <div className="space-y-6">
       {/* First row: 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 " />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold ">
              {formatCurrency(currentMonth?.revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last month: {formatCurrency(lastMonth?.revenue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cost of Goods Sold</CardTitle>
            <TrendingDown className="h-4 w-4 " />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold ">
              {formatCurrency(currentMonth?.cogs || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last month: {formatCurrency(lastMonth?.cogs || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Operating Expenses</CardTitle>
            <Banknote className="h-4 w-4 " />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold ">
              {formatCurrency(currentMonth?.operatingExpenses || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last month: {formatCurrency(lastMonth?.operatingExpenses || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Second row: 2 centered cards */}
      <div className="flex justify-center w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-3/4">
          <Card className="">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(currentMonth?.grossProfit || 0) >= 0 ? 'text-blue-600' : ''}`}>
                {formatCurrency(currentMonth?.grossProfit || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Last month: {formatCurrency(lastMonth?.grossProfit || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <Banknote className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(currentMonth?.netProfit || 0) >= 0 ? '' : ''}`}>
                {formatCurrency(currentMonth?.netProfit || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Last month: {formatCurrency(lastMonth?.netProfit || 0)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const {user, isAuthenticated, isLoading: authLoading} = useAuth();


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
  const hasProductionDashboard = hasPermission(user, "view:productionDashboard");
  const hasAccountingDashboard = hasPermission(user, "view:accountingDashboard");

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
