import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Banknote } from "lucide-react";
import { formatCurrency } from "@/lib/funcs";
import { format } from "date-fns";

const SalesSummaryTab = () => {
  const { data: dashboardData, isPending: loading } = useQuery({
    queryKey: ["salesDashboard"],
    queryFn: () => dashboardService.getSalesDashboard(),
  });

  const salesData = dashboardData?.dailySalesList || [];

  const growthPercentage =
    dashboardData?.salesGrowth && dashboardData.salesGrowth.previous !== 0
      ? (
          ((dashboardData.salesGrowth.current -
            dashboardData.salesGrowth.previous) /
            dashboardData.salesGrowth.previous) *
          100
        ).toFixed(2)
      : "0.00";

  const growthNum = parseFloat(growthPercentage) || 0;

  if (loading) {
    return (
      <div className="flex flex-col w-full justify-center items-center p-6">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p>Sales Loading</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Daily Sales
            </CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Math.round(dashboardData?.totalDailySales || 0))}
            </div>
            <p className="text-xs text-muted-foreground">Today's sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sales This Month
            </CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                Math.round(dashboardData?.totalSalesThisMonth || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Growth: {growthPercentage}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Average Daily Sales
            </CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                Math.round(dashboardData?.averageDailySales || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">Average per day</p>
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

              {/* X-Axis (date formatted as dd-MM-yyyy) */}
              <XAxis
                dataKey="date"
                tickFormatter={(date) => format(new Date(date), "dd-MM-yyyy")}
              />

              {/* Y-Axis (formatted with commas) */}
              <YAxis
                tickFormatter={(value) => Number(value).toLocaleString()}
                width={80}
              />

              {/* Tooltip also formatted */}
              <Tooltip
                formatter={(value) => [
                  `${Number(value).toLocaleString()}`,
                  "Total",
                ]}
                labelFormatter={(label) =>
                  format(new Date(label), "dd-MM-yyyy")
                }
              />

              <Bar dataKey="total" fill="#93631f" name="Sales" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesSummaryTab;