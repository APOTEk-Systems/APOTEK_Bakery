import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { expensesService } from "@/services/expenses";
import { toast } from "sonner";

interface EditExpenseCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryUpdated: () => void;
  category: { id: number; name: string } | null;
}

const EditExpenseCategoryModal = ({ isOpen, onClose, onCategoryUpdated, category }: EditExpenseCategoryModalProps) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!name.trim()) {
      setError("Please enter a category name.");
      setLoading(false);
      return;
    }

    if (!category) {
      setError("No category selected.");
      setLoading(false);
      return;
    }

    try {
      await expensesService.updateExpenseCategory(category.id, { name: name.trim() });
      toast.success("Expense category updated successfully!");
      onCategoryUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to update expense category:", err);
      toast.error("Failed to update expense category.");
      setError("Failed to update expense category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Expense Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="Enter category name"
              />
            </div>
          </div>
          {error && <p className="text-destructive text-sm mb-4">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditExpenseCategoryModal;