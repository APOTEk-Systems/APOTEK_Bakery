import Layout from "../components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExpensesTab from "../components/accounting/ExpensesTab";
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from "@/services/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/funcs";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Loader2,
} from "lucide-react";
// import OverviewTab from "../components/accounting/OverviewTab";
// import ReportsTab from "../components/accounting/ReportsTab";



const ProfitLossTab = () => {
  const { data: profitLossData, isPending: loading } = useQuery({
    queryKey: ['profitLossReport'],
    queryFn: () => dashboardService.getProfitLossReport(),
  });

  if (loading) {
    return (
      <div className="flex flex-col w-full justify-center items-center p-6">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p>Loading Profit & Loss Report...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(Math.round(profitLossData?.revenue || 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cost of Goods Sold</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(Math.round(profitLossData?.cogs || 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(profitLossData?.grossProfit || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(Math.round(profitLossData?.grossProfit || 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(profitLossData?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.round(profitLossData?.netProfit || 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Operating Expenses: {formatCurrency(Math.round(profitLossData?.operatingExpenses || 0))}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const CashFlowTab = () => {
  const { data: cashFlowData, isPending: loading } = useQuery({
    queryKey: ['cashFlowReport'],
    queryFn: () => dashboardService.getCashFlowReport(),
  });

  if (loading) {
    return (
      <div className="flex flex-col w-full justify-center items-center p-6">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p>Loading Cash Flow Report...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Cash Inflows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">From Cash Sales</span>
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(Math.round(cashFlowData?.cashInflows?.fromCashSales || 0))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">From Credit Payments</span>
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(Math.round(cashFlowData?.cashInflows?.fromCreditPayments || 0))}
              </span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Inflows</span>
                <span className="text-xl text-foreground">
                  {formatCurrency(Math.round(cashFlowData?.cashInflows?.total || 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Cash Outflows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">For Expenses</span>
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(Math.round(cashFlowData?.cashOutflows?.forExpenses || 0))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">For Purchases</span>
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(Math.round(cashFlowData?.cashOutflows?.forPurchases || 0))}
              </span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Outflows</span>
                <span className="text-xl text-foreground">
                  {formatCurrency(Math.round(cashFlowData?.cashOutflows?.total || 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Net Cash Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {formatCurrency(Math.round(cashFlowData?.netCashFlow || 0))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {(cashFlowData?.netCashFlow || 0) >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const Accounting = () => {

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-success/10 text-success border-success/20";
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      case "overdue": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const getCategoryColor = (category: string) => {
    // Fallback colors for legacy hardcoded categories
    const legacyColors: Record<string, string> = {
      "electricity": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      "gas": "bg-gray-500/10 text-gray-600 border-gray-500/20",
      "water": "bg-blue-500/10 text-blue-600 border-blue-500/20",
      "transportation": "bg-purple-500/10 text-purple-600 border-purple-500/20",
      "salaries": "bg-pink-500/10 text-pink-600 border-pink-500/20",
      "rent": "bg-red-500/10 text-red-600 border-red-500/20",
      "communication": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      "maintenance": "bg-green-500/10 text-green-600 border-green-500/20",
      "Raw Materials": "bg-orange-500/10 text-orange-600 border-orange-500/20",
      "Supplies": "bg-teal-500/10 text-teal-600 border-teal-500/20",
      "Other": "bg-muted/10 text-muted-foreground border-muted/20"
    };

    // Check if it's a legacy category
    if (legacyColors[category]) {
      return legacyColors[category];
    }

    // Generate dynamic color based on category name hash
    const hash = category.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    // Predefined color palette for consistent, accessible colors
    const colorPalette = [
      "bg-blue-500/10 text-blue-600 border-blue-500/20",
      "bg-green-500/10 text-green-600 border-green-500/20",
      "bg-purple-500/10 text-purple-600 border-purple-500/20",
      "bg-pink-500/10 text-pink-600 border-pink-500/20",
      "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      "bg-red-500/10 text-red-600 border-red-500/20",
      "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      "bg-teal-500/10 text-teal-600 border-teal-500/20",
      "bg-orange-500/10 text-orange-600 border-orange-500/20",
      "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
      "bg-lime-500/10 text-lime-600 border-lime-500/20",
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      "bg-violet-500/10 text-violet-600 border-violet-500/20",
      "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20",
      "bg-rose-500/10 text-rose-600 border-rose-500/20",
      "bg-sky-500/10 text-sky-600 border-sky-500/20",
      "bg-amber-500/10 text-amber-600 border-amber-500/20",
      "bg-slate-500/10 text-slate-600 border-slate-500/20",
      "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
      "bg-neutral-500/10 text-neutral-600 border-neutral-500/20"
    ];

    // Use absolute value of hash to get consistent color for same category
    const colorIndex = Math.abs(hash) % colorPalette.length;
    return colorPalette[colorIndex];
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Accounting</h1>
            </div>
          </div>
        </div>

        <Tabs defaultValue="expenses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
            <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses">
            <ExpensesTab
              getCategoryColor={getCategoryColor}
              getStatusColor={getStatusColor}
            />
          </TabsContent>

          <TabsContent value="profit-loss">
            <ProfitLossTab />
          </TabsContent>

          <TabsContent value="cash-flow">
            <CashFlowTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Accounting;


