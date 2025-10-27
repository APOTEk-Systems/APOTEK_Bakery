import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, AlertTriangle, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/funcs";
import { format } from "date-fns";

const PurchasesSummaryTab = () => {
  const { data: dashboardData, isPending: loading } = useQuery({
    queryKey: ["purchasesDashboard"],
    queryFn: () => dashboardService.getPurchasesDashboard(),
  });

  const purchasesData = dashboardData?.weeklyPurchasesList || [];

  if (loading) {
    return (
      <div className="flex flex-col w-full justify-center items-center p-6">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p>Purchases Loading</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Purchases This Month
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                Math.round(dashboardData?.totalPurchasesThisMonth || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Growth: {dashboardData?.purchaseGrowth ?? 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Purchase Orders
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.pendingPurchaseOrders ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Orders awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Purchase Growth
            </CardTitle>
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
                <TrendingUp className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span
                className={`text-sm ${
                  (dashboardData?.purchaseGrowth ?? 0) > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {(dashboardData?.purchaseGrowth ?? 0) > 0 ? "Up" : "Down"}{" "}
                {Math.abs(dashboardData?.purchaseGrowth ?? 0)}%
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
            <BarChart data={purchasesData} margin={{left:10}}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="weekStart"
                tickFormatter={(weekStart) =>
                  format(new Date(weekStart), "dd-MM-yyyy")
                }
              />
              <YAxis
                tickFormatter={(value) => Number(value).toLocaleString()}
                className="text-sm"
              />
              <Tooltip
                formatter={(value) => [
                  `${Number(value).toLocaleString()}`,
                  "Total",
                ]}
                labelFormatter={(label) =>
                  format(new Date(label), "dd-MM-yyyy")
                }
              />
              <Bar dataKey="total" fill="#ef4444" name="Purchases" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchasesSummaryTab;