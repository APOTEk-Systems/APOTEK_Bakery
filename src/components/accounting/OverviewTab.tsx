
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calculator,
  Receipt
} from "lucide-react";
import { expensesService, Expense, DailyBreakdown } from "@/services/expenses";
import { accountingService, MonthlySummary } from "@/services/accounting";
import { formatCurrency } from "@/lib/funcs";

// TODO: Define proper types for props
const OverviewTab = ({ getCategoryColor, getStatusColor }: any) => {
  const recentExpensesQuery = useQuery({
    queryKey: ['recentExpenses'],
    queryFn: () => expensesService.getExpenses({}),
    select: (data) => data.dailyBreakdown.slice(0, 5), // Take top 5 recent expenses
  });

  const monthlySummaryQuery = useQuery({
    queryKey: ['monthlySummary'],
    queryFn: () => accountingService.getAccountingSummary(),
  });

  const recentExpenses = recentExpensesQuery.data || [];
  const monthlySummary = monthlySummaryQuery.data;
  const loading = recentExpensesQuery.isLoading || monthlySummaryQuery.isLoading;
  const error = recentExpensesQuery.error || monthlySummaryQuery.error;

  if (loading) {
    return <div className="text-center py-8">Loading overview...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">Error: {error instanceof Error ? error.message : 'Failed to load overview data'}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-warm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(monthlySummary?.monthlyRevenue)}</div>
            <p className="text-xs text-success">
              {monthlySummary?.comparison.lastMonthRevenue !== undefined && monthlySummary.comparison.lastMonthRevenue !== 0
                ? `+${((monthlySummary.monthlyRevenue - monthlySummary.comparison.lastMonthRevenue) / monthlySummary.comparison.lastMonthRevenue * 100).toFixed(1)}% from last month`
                : "N/A from last month"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-warm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(monthlySummary?.monthlyExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              {monthlySummary?.comparison.lastMonthExpenses !== undefined && monthlySummary.comparison.lastMonthExpenses !== 0
                ? `+${((monthlySummary.monthlyExpenses - monthlySummary.comparison.lastMonthExpenses) / monthlySummary.comparison.lastMonthExpenses * 100).toFixed(1)}% from last month`
                : "N/A from last month"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-warm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(monthlySummary?.netProfit)}</div>
            <p className="text-xs text-success">
              {monthlySummary?.comparison.netProfitChange !== undefined && monthlySummary.comparison.netProfitChange !== "N/A"
                ? `${monthlySummary.comparison.netProfitChange} from last month`
                : "N/A from last month"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-warm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Calculator className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{monthlySummary?.profitMargin}</div>
            <p className="text-xs text-success">
              {monthlySummary?.comparison.netProfitChange !== undefined && monthlySummary.comparison.netProfitChange !== "N/A"
                ? `Change: ${monthlySummary.comparison.netProfitChange}`
                : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Recent Expenses */}
      <Card className="shadow-warm">
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {recentExpensesQuery.isLoading ? (
            <div className="text-center">Loading recent expenses...</div>
          ) : recentExpensesQuery.error ? (
            <div className="text-center text-destructive">Error: {recentExpensesQuery.error instanceof Error ? recentExpensesQuery.error.message : 'Failed to load recent expenses'}</div>
          ) : recentExpenses.length === 0 ? (
            <div className="text-center text-muted-foreground">No recent expenses found.</div>
          ) : (
            <div className="space-y-4">
              {recentExpenses.map((expense: any) => (
                <div key={expense.total} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{expense.category}</p>
                      <p className="text-sm text-muted-foreground">{expense.date.split('T')[0]}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{formatCurrency(expense.total) ?? 0}</p>
                    <Badge className={getStatusColor(expense.status)}>
                      {expense.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
