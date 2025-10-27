import React from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, Banknote, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/funcs";

const AccountingSummaryTab = () => {
  const { data: summary, isPending: loading } = useQuery({
    queryKey: ["accountingSummary"],
    queryFn: () => dashboardService.getAccountingDashboard(),
  });

  if (loading) {
    return (
      <div className="flex flex-col w-full justify-center items-center p-6">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p>Loading ...</p>
      </div>
    );
  }

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
              {formatCurrency(Math.round(currentMonth?.revenue || 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Last month: {formatCurrency(Math.round(lastMonth?.revenue || 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Cost of Goods Sold
            </CardTitle>
            <TrendingDown className="h-4 w-4 " />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold ">
              {formatCurrency(Math.round(currentMonth?.cogs || 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Last month: {formatCurrency(Math.round(lastMonth?.cogs || 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Operating Expenses
            </CardTitle>
            <Banknote className="h-4 w-4 " />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold ">
              {formatCurrency(Math.round(currentMonth?.operatingExpenses || 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Last month:{" "}
              {formatCurrency(Math.round(lastMonth?.operatingExpenses || 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Second row: 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                (currentMonth?.grossProfit || 0) >= 0
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(Math.round(currentMonth?.grossProfit || 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Last month:{" "}
              {formatCurrency(Math.round(lastMonth?.grossProfit || 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <Banknote className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                (currentMonth?.netProfit || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(Math.round(currentMonth?.netProfit || 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Last month:{" "}
              {formatCurrency(Math.round(lastMonth?.netProfit || 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Outstanding Payments
            </CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(
                Math.round(currentMonth?.outstandingPayments || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Last month:{" "}
              {formatCurrency(Math.round(lastMonth?.outstandingPayments || 0))}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountingSummaryTab;