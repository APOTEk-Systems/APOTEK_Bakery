
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart } from "lucide-react";
import { expensesService } from "@/services/expenses";

// TODO: Define proper types for props
const CategoriesTab = ({ expenseCategories, getCategoryColor }: any) => {
  const [summaryByCategory, setSummaryByCategory] = useState<Record<string, number>>({});
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpensesSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const summary = await expensesService.getExpensesSummary();
        setSummaryByCategory(summary.summaryByCategory);
        setTotalExpenses(summary.totalExpenses);
      } catch (err) {
        console.error("Failed to fetch expenses summary:", err);
        setError("Failed to load expenses summary.");
      } finally {
        setLoading(false);
      }
    };

    fetchExpensesSummary();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">Error: {error}</div>;
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
