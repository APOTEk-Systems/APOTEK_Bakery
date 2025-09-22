import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell
} from "@/components/ui/table";
import { 
  Search, 
  Filter,
  Download,
  Eye,
  Receipt
} from "lucide-react";
import { expensesService, Expense, ExpensesList, DailyBreakdown } from "@/services/expenses";
import { formatCurrency } from "@/lib/funcs";

interface ExpensesTabProps {
  getCategoryColor: (category: string) => string;
  getStatusColor: (status: string) => string;
}

interface DailyBreakdownItem {
  category: string;
  total: number;
  date: string;
}

interface ExpensesSummary {
  totalExpenses: number;
  dailyBreakdown: DailyBreakdown[];
}

const ExpensesTab = ({ getCategoryColor, getStatusColor }: ExpensesTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const expensesQuery = useQuery({
    queryKey: ['expenses', filterCategory, searchTerm],
    queryFn: () => expensesService.getExpenses({
      category: filterCategory === "all" ? undefined : filterCategory,
      search: searchTerm || undefined,
      date: new Date().toISOString()
    }),
  });

  const expenses = expensesQuery.data?.dailyBreakdown || [];
  const expensesSummary = expensesQuery.data ? {
    totalExpenses: expensesQuery.data.totalExpenses,
    dailyBreakdown: expensesQuery.data.dailyBreakdown
  } : null;

  if (expensesQuery.isLoading) {
    return <div className="text-center py-8">Loading expenses...</div>;
  }

  if (expensesQuery.error) {
    return <div className="text-center py-8 text-destructive">Error: {expensesQuery.error.message}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Expense Filters */}
      <Card className="shadow-warm">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Search Expenses</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by description, vendor, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="gas">Gas</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="salaries">Salaries</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card className="shadow-warm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Expenses</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-muted-foreground">No expenses found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.category}>
                      <TableCell>{expense.date.split('T')[0]}</TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(expense.category.toLowerCase())} variant="outline">
                          {expense.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{`Expenses for ${expense.category}`}</TableCell>
                      <TableCell>${expense.total.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Receipt
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Display total expenses and daily breakdown */}
      {expensesSummary && (
        <Card className="shadow-warm">
          <CardHeader>
            <CardTitle>Expenses Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">Total Expenses: {formatCurrency(expensesSummary.totalExpenses)}</p>
            <h4 className="font-semibold mt-4">Daily Breakdown:</h4>
            <div className="space-y-2 mt-2">
              {expensesSummary.dailyBreakdown.length === 0 ? (
                <p className="text-muted-foreground">No daily breakdown available.</p>
              ) : (
                expensesSummary.dailyBreakdown.map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-1 last:border-b-0">
                    <span className="text-sm">{item.date} - {item.category}</span>
                    <span className="font-medium">${item.total.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExpensesTab;
