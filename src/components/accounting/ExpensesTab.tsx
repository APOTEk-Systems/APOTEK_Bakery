import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { expensesService } from "@/services/expenses";
import { formatCurrency } from "@/lib/funcs";
import { toast } from "sonner";
import AddExpenseModal from "./AddExpenseModal";
import { DateRangePicker, DateRange } from "@/components/ui/DateRange";

interface ExpensesTabProps {
  getCategoryColor: (category: string) => string;
  getStatusColor: (status: string) => string;
}

interface Expense {
  id: number;
  amount: number;
  date: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdById: number;
  approvedById: number | null;
  updatedById: number | null;
  expenseCategoryId: number;
  expenseCategory: {
    id: number;
    name: string;
  };
}

const ExpensesTab = ({ getCategoryColor, getStatusColor }: ExpensesTabProps) => {
  const [filterCategory, setFilterCategory] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ['expenseCategories'],
    queryFn: () => expensesService.getExpenseCategories(),
  });

  const expensesQuery = useQuery({
    queryKey: ['expenses', filterCategory, dateRange],
    queryFn: () => expensesService.getExpenses({
      categoryId: filterCategory === "all" ? undefined : filterCategory,
      startDate: dateRange?.from ? dateRange.from.toISOString().split('T')[0] : undefined,
      endDate: dateRange?.to ? dateRange.to.toISOString().split('T')[0] : undefined,
    }),
  });

  const categories = categoriesQuery.data?.data || [];
  const expenses = Array.isArray(expensesQuery.data) ? expensesQuery.data : expensesQuery.data?.dailyBreakdown || [];

  if (expensesQuery.isLoading) {
    return <div className="text-center py-8">Loading expenses...</div>;
  }

  if (expensesQuery.error) {
    return <div className="text-center py-8 text-destructive">Error: {expensesQuery.error instanceof Error ? expensesQuery.error.message : 'Failed to load expenses'}</div>;
  }

  const handleDeleteExpense = async (id: number) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await expensesService.deleteExpense(id.toString());
        toast.success("Expense deleted successfully!");
        expensesQuery.refetch();
      } catch (err) {
        toast.error("Failed to delete expense.");
      }
    }
  };

  const handleExpenseAdded = () => {
    // Invalidate and refetch expenses queries
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    setIsAddExpenseModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Expense Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <Label>Date Range</Label>
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

      {/* Expenses List */}
      <Card className="shadow-warm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Expenses</CardTitle>
            <Button className="shadow-warm" onClick={() => setIsAddExpenseModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
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
                    <TableHead>Amount</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{new Date(expense.date).toLocaleDateString('en-GB')}</TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(expense.expenseCategory?.name.toLowerCase() || 'other')} variant="outline">
                          {expense.expenseCategory?.name || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(expense?.amount).replace("TSH", "")}</TableCell>
                      <TableCell>{expense.notes}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
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

      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        onExpenseAdded={handleExpenseAdded}
      />
    </div>
  );
};

export default ExpensesTab;
