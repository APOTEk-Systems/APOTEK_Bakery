
import { useState, useEffect } from "react";
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

// TODO: Define proper types for props
const OverviewTab = ({ getCategoryColor, getStatusColor }: any) => {
  const [recentExpenses, setRecentExpenses] = useState<DailyBreakdown[]>([]);
  const [loadingRecentExpenses, setLoadingRecentExpenses] = useState(true);
  const [errorRecentExpenses, setErrorRecentExpenses] = useState<string | null>(null);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [loadingMonthlySummary, setLoadingMonthlySummary] = useState(true);
  const [errorMonthlySummary, setErrorMonthlySummary] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentExpenses = async () => {
      setLoadingRecentExpenses(true);
      setErrorRecentExpenses(null);
      try {
        const fetchedExpenses = await expensesService.getExpenses({}); // Fetch all expenses for recent display
        setRecentExpenses(fetchedExpenses.dailyBreakdown.slice(0, 5)); // Take top 5 recent expenses
      } catch (err) {
        console.error("Failed to fetch recent expenses:", err);
        setErrorRecentExpenses("Failed to load recent expenses.");
      } finally {
        setLoadingRecentExpenses(false);
      }
    };

    const fetchMonthlySummary = async () => {
      setLoadingMonthlySummary(true);
      setErrorMonthlySummary(null);
      try {
        const summary = await accountingService.getAccountingSummary ();
        setMonthlySummary(summary);
      } catch (err) {
        console.error("Failed to fetch monthly summary:", err);
        setErrorMonthlySummary("Failed to load monthly summary.");
      } finally {
        setLoadingMonthlySummary(false);
      }
    };

    fetchRecentExpenses();
    fetchMonthlySummary();
  }, []);

  if (loadingMonthlySummary || loadingRecentExpenses) {
    return <div className="text-center py-8">Loading overview...</div>;
  }

  if (errorMonthlySummary) {
    return <div className="text-center py-8 text-destructive">Error: {errorMonthlySummary}</div>;
  }

  if (errorRecentExpenses) {
    return <div className="text-center py-8 text-destructive">Error: {errorRecentExpenses}</div>;
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
            <div className="text-2xl font-bold text-foreground">${monthlySummary?.monthlyRevenue.toLocaleString()}</div>
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
            <div className="text-2xl font-bold text-foreground">${monthlySummary?.monthlyExpenses.toLocaleString()}</div>
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
            <div className="text-2xl font-bold text-foreground">${monthlySummary?.netProfit.toLocaleString()}</div>
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
          {loadingRecentExpenses ? (
            <div className="text-center">Loading recent expenses...</div>
          ) : errorRecentExpenses ? (
            <div className="text-center text-destructive">Error: {errorRecentExpenses}</div>
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
                    <p className="font-medium text-foreground">${expense.total?.toFixed(2) ?? 0}</p>
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
