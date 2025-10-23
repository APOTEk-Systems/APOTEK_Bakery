import React, { useState } from "react";
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
  ChevronDown,
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

  const salesData = dashboardData?.dailySalesList || [];

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Daily Sales</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.totalDailySales) ?? "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Today's sales</p>
          </CardContent>
        </Card>
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
          <CardTitle>Daily Sales Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
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
  const [expandedCard, setExpandedCard] = useState<string>('lowStock');
  const { data: inventoryData, isPending: loading } = useQuery({
    queryKey: ['inventoryDashboard'],
    queryFn: () => dashboardService.getInventoryDashboard(),
  });

  if(loading){
    return(
      <div className="flex flex-col w-full justify-center items-center p-6">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p>Loading ...</p>
      </div>
    )
  }

  const toggleCard = (cardKey: string) => {
    setExpandedCard(expandedCard === cardKey ? '' : cardKey);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {inventoryData?.lowStock && inventoryData.lowStock.count > 0 && (
          <Card
            className={`cursor-pointer transition-colors ${expandedCard === 'lowStock' ? 'ring-2 ring-orange-500' : 'hover:bg-muted/50'}`}
            onClick={() => toggleCard('lowStock')}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryData.lowStock.count}</div>
              <p className="text-xs text-muted-foreground">Items below minimum</p>
            </CardContent>
          </Card>
        )}

        {inventoryData?.outOfStock && inventoryData.outOfStock.count > 0 && (
          <Card
            className={`cursor-pointer transition-colors ${expandedCard === 'outOfStock' ? 'ring-2 ring-red-500' : 'hover:bg-muted/50'}`}
            onClick={() => toggleCard('outOfStock')}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryData.outOfStock.count}</div>
              <p className="text-xs text-muted-foreground">Items at zero stock</p>
            </CardContent>
          </Card>
        )}

        {inventoryData?.materialsUsed && inventoryData.materialsUsed.count > 0 && (
          <Card
            className={`cursor-pointer transition-colors ${expandedCard === 'materialsUsed' ? 'ring-2 ring-blue-500' : 'hover:bg-muted/50'}`}
            onClick={() => toggleCard('materialsUsed')}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Materials Used</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryData.materialsUsed.count}</div>
              <p className="text-xs text-muted-foreground">Production records</p>
            </CardContent>
          </Card>
        )}

        {inventoryData?.topSellingProducts && inventoryData.topSellingProducts.count > 0 && (
          <Card
            className={`cursor-pointer transition-colors ${expandedCard === 'topSellingProducts' ? 'ring-2 ring-green-500' : 'hover:bg-muted/50'}`}
            onClick={() => toggleCard('topSellingProducts')}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Top Products</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryData.topSellingProducts.count}</div>
              <p className="text-xs text-muted-foreground">Best selling items</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tables Section */}
      {expandedCard === 'lowStock' && inventoryData?.lowStock && (
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Current</th>
                    <th className="text-left p-2">Min Level</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.lowStock.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2 capitalize">{item.type}</td>
                      <td className="p-2">{item.currentQuantity}</td>
                      <td className="p-2">{item.minLevel}</td>
                      <td className="p-2">
                        <Badge variant="secondary">Low</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {expandedCard === 'outOfStock' && inventoryData?.outOfStock && (
        <Card>
          <CardHeader>
            <CardTitle>Out of Stock Items Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Current</th>
                    <th className="text-left p-2">Min Level</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.outOfStock.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2 capitalize">{item.type}</td>
                      <td className="p-2">{item.currentQuantity}</td>
                      <td className="p-2">{item.minLevel}</td>
                      <td className="p-2">
                        <Badge variant="destructive">Out of Stock</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {expandedCard === 'materialsUsed' && inventoryData?.materialsUsed && (
        <Card>
          <CardHeader>
            <CardTitle>Materials Used Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Material</th>
                    <th className="text-left p-2">Amount Deducted</th>
                    <th className="text-left p-2">Unit</th>
                    <th className="text-left p-2">Product</th>
                    <th className="text-left p-2">Quantity Produced</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.materialsUsed.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{item.materialName}</td>
                      <td className="p-2">{item.amountDeducted}</td>
                      <td className="p-2">{item.unit}</td>
                      <td className="p-2">{item.productName}</td>
                      <td className="p-2">{item.quantityProduced}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {expandedCard === 'topSellingProducts' && inventoryData?.topSellingProducts && (
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Product</th>
                    <th className="text-left p-2">Total Quantity Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.topSellingProducts.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{item.productName}</td>
                      <td className="p-2">{item.totalQuantitySold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const ProductionSummaryTab = () => {
  const [expandedCard, setExpandedCard] = useState<string>('weeklyIngredientUsage');
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

  const toggleCard = (cardKey: string) => {
    setExpandedCard(expandedCard === cardKey ? '' : cardKey);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {productionData?.weeklyIngredientUsage && productionData.weeklyIngredientUsage.count > 0 && (
          <Card
            className={`cursor-pointer transition-colors ${expandedCard === 'weeklyIngredientUsage' ? 'ring-2 ring-blue-500' : 'hover:bg-muted/50'}`}
            onClick={() => toggleCard('weeklyIngredientUsage')}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ingredient Usage</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productionData.weeklyIngredientUsage.count}</div>
              <p className="text-xs text-muted-foreground">Ingredients tracked</p>
            </CardContent>
          </Card>
        )}

        {productionData?.dailyProduction && productionData.dailyProduction.count > 0 && (
          <Card
            className={`cursor-pointer transition-colors ${expandedCard === 'dailyProduction' ? 'ring-2 ring-green-500' : 'hover:bg-muted/50'}`}
            onClick={() => toggleCard('dailyProduction')}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Daily Production</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productionData.dailyProduction.count}</div>
              <p className="text-xs text-muted-foreground">Products made today</p>
            </CardContent>
          </Card>
        )}

        {productionData?.productionVsSales && productionData.productionVsSales.count > 0 && (
          <Card
            className={`cursor-pointer transition-colors ${expandedCard === 'productionVsSales' ? 'ring-2 ring-purple-500' : 'hover:bg-muted/50'}`}
            onClick={() => toggleCard('productionVsSales')}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Production vs Sales</CardTitle>
              <Banknote className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productionData.productionVsSales.count}</div>
              <p className="text-xs text-muted-foreground">Comparison metrics</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tables Section */}
      {expandedCard === 'weeklyIngredientUsage' && productionData?.weeklyIngredientUsage && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Ingredient Usage Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Ingredient</th>
                    <th className="text-left p-2">Quantity Used</th>
                  </tr>
                </thead>
                <tbody>
                  {productionData.weeklyIngredientUsage.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">{item.quantity.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {expandedCard === 'dailyProduction' && productionData?.dailyProduction && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Production Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Product</th>
                    <th className="text-left p-2">Quantity Produced</th>
                  </tr>
                </thead>
                <tbody>
                  {productionData.dailyProduction.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{item.productName}</td>
                      <td className="p-2">{item.quantityProduced}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {expandedCard === 'productionVsSales' && productionData?.productionVsSales && (
        <Card>
          <CardHeader>
            <CardTitle>Production vs Sales Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Product</th>
                    <th className="text-left p-2">Produced</th>
                    <th className="text-left p-2">Sold</th>
                    <th className="text-left p-2">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {productionData.productionVsSales.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{item.productName}</td>
                      <td className="p-2">{item.produced}</td>
                      <td className="p-2">{item.sold}</td>
                      <td className="p-2">{item.difference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
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
