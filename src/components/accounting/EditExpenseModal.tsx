import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { expensesService } from "@/services/expenses";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import AddExpenseCategoryModal from "./AddExpenseCategoryModal";

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseUpdated: () => void;
  expense: Expense | null;
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

const EditExpenseModal = ({ isOpen, onClose, onExpenseUpdated, expense }: EditExpenseModalProps) => {
  const [date, setDate] = useState("");
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
    if (expense && isOpen) {
      setDate(new Date(expense.date).toISOString().split('T')[0]);
      setCategory(expense.expenseCategoryId.toString());
      setAmount(expense.amount.toString());
      setNotes(expense.notes || "");
    }
  }, [expense, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!date || !category || !amount || !expense) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const updatedExpense = {
      amount: parseFloat(amount),
      date: new Date(date).toISOString(),
      notes: notes.trim() || null,
      expenseCategoryId: parseInt(category),
    };

    try {
      await expensesService.updateExpense(expense.id.toString(), updatedExpense);
      toast.success("Expense updated successfully!");
      onExpenseUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to update expense:", err);
      toast.error("Failed to update expense.");
      setError("Failed to update expense. Please try again.");
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
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="col-span-3"
              />
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
              {loading ? "Updating..." : "Update Expense"}
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

export default EditExpenseModal;