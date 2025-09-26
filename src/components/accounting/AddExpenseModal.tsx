
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

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseAdded: () => void;
}

const AddExpenseModal = ({ isOpen, onClose, onExpenseAdded }: AddExpenseModalProps) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!date || !category || !amount) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const newExpense = {
      amount: parseFloat(amount),
      date: new Date(date).toISOString(),
      notes: notes.trim() || null,
      expenseCategoryId: parseInt(category),
    };

    try {
      await expensesService.createExpense(newExpense);
      toast.success("Expense added successfully!");
      onExpenseAdded();
      onClose();
      // Reset form
      setDate(new Date().toISOString().split('T')[0]);
      setCategory("");
      setAmount("");
      setNotes("");
    } catch (err) {
      console.error("Failed to add expense:", err);
      toast.error("Failed to add expense.");
      setError("Failed to add expense. Please try again.");
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
          <DialogTitle>Add New Expense</DialogTitle>
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
              {loading ? "Adding..." : "Add Expense"}
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

export default AddExpenseModal;
