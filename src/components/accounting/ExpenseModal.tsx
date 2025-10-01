import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { expensesService } from "@/services/expenses";
import { toast } from "sonner";
import { Plus, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import AddExpenseCategoryModal from "./AddExpenseCategoryModal";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseSaved: () => void;
  expense?: Expense | null;
  mode: 'add' | 'edit';
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

const ExpenseModal = ({ isOpen, onClose, onExpenseSaved, expense, mode }: ExpenseModalProps) => {
  const [date, setDate] = useState<Date | undefined>(mode === 'add' ? new Date() : undefined);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: ['expenseCategories'],
    queryFn: () => expensesService.getExpenseCategories(),
    enabled: isOpen,
  });

  const categories = categoriesQuery.data?.data || [];

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].id.toString());
    }
  }, [categories, category]);

  useEffect(() => {
    if (expense && mode === 'edit' && isOpen) {
      setDate(new Date(expense.date));
      setCategory(expense.expenseCategoryId.toString());
      setAmount(expense.amount.toString());
      setNotes(expense.notes || "");
    } else if (mode === 'add' && isOpen) {
      setDate(new Date());
      setCategory(categories.length > 0 ? categories[0].id.toString() : "");
      setAmount("");
      setNotes("");
    }
  }, [expense, mode, isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!date || !category || !amount) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const expenseData = {
      amount: parseFloat(amount),
      date: date.toISOString(),
      notes: notes.trim() || null,
      expenseCategoryId: parseInt(category),
    };

    try {
      if (mode === 'add') {
        await expensesService.createExpense(expenseData);
        toast.success("Expense added successfully!");
      } else if (mode === 'edit' && expense) {
        await expensesService.updateExpense(expense.id.toString(), expenseData);
        toast.success("Expense updated successfully!");
      }
      onExpenseSaved();
      onClose();
    } catch (err) {
      console.error(`Failed to ${mode} expense:`, err);
      toast.error(`Failed to ${mode} expense.`);
      setError(`Failed to ${mode} expense. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryAdded = () => {
    // Refresh categories after adding a new one
    categoriesQuery.refetch();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Expense' : 'Edit Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`col-span-3 justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd-MM-yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <div className="col-span-3 flex gap-2">
                <Select value={category} onValueChange={setCategory} disabled={categoriesQuery.isLoading}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={categoriesQuery.isLoading ? "Loading..." : "Select a category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="px-3"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
                placeholder="Brief description of the expense"
              />
            </div>
          </div>
          {error && <p className="text-destructive text-sm mb-4">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (mode === 'add' ? "Adding..." : "Updating...") : (mode === 'add' ? "Add Expense" : "Update Expense")}
            </Button>
          </DialogFooter>
        </form>

        <AddExpenseCategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onCategoryAdded={handleCategoryAdded}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseModal;