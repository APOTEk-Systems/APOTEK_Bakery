
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart } from "lucide-react";
import { expensesService } from "@/services/expenses";

// TODO: Define proper types for props
const CategoriesTab = ({ expenseCategories, getCategoryColor }: any) => {
  const expensesSummaryQuery = useQuery({
    queryKey: ['expensesSummary'],
    queryFn: () => expensesService.getExpensesSummary(),
  });

  const summaryByCategory = expensesSummaryQuery.data?.summaryByCategory || {};
  const totalExpenses = expensesSummaryQuery.data?.totalExpenses || 0;
  const loading = expensesSummaryQuery.isLoading;
  const error = expensesSummaryQuery.error;

  if (loading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">Error: {error instanceof Error ? error.message : 'Failed to load expenses summary'}</div>;
  }

  return (
    <Card className="shadow-warm">
      <CardHeader>
        <CardTitle>Expense Categories</CardTitle>
        <p className="text-muted-foreground">Track spending by category</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(summaryByCategory).map(([category, total]) => {
            return (
              <Card key={category} className="border border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getCategoryColor(category)} variant="outline">
                      {category}
                    </Badge>
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">${total.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">This month</p>
                  <div className="mt-3 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2"
                      style={{ width: `${(total / totalExpenses) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoriesTab;
