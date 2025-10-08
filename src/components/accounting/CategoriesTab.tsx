
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Edit, Trash2, Plus } from "lucide-react";
import { expensesService } from "@/services/expenses";
import { toast } from "sonner";
import AddExpenseCategoryModal from "./AddExpenseCategoryModal";
import EditExpenseCategoryModal from "./EditExpenseCategoryModal";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { toSentenceCase } from "@/lib/funcs";

interface CategoriesTabProps {
  expenseCategories: string[];
  getCategoryColor: (category: string) => string;
}

const CategoriesTab = ({ expenseCategories, getCategoryColor }: CategoriesTabProps) => {
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ id: number; name: string } | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: number; name: string } | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['expenseCategories'],
    queryFn: () => expensesService.getExpenseCategories(),
  });

  const categories = categoriesQuery.data?.data || [];
  const loading = categoriesQuery.isLoading;
  const error = categoriesQuery.error;

  const handleDeleteCategory = (category: { id: number; name: string }) => {
    setCategoryToDelete(category);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await expensesService.deleteExpenseCategory(categoryToDelete.id);
      toast.success("Category deleted successfully!");
      categoriesQuery.refetch();
    } catch (err) {
      toast.error("Failed to delete category.");
    } finally {
      setIsDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleCategoryAdded = () => {
    categoriesQuery.refetch();
  };

  if (loading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">Error: {error instanceof Error ? error.message : 'Failed to load categories'}</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-warm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Expense Categories</CardTitle>
            <Button onClick={() => setIsAddCategoryModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
          <p className="text-muted-foreground">Manage expense categories</p>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-muted-foreground">No categories found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{toSentenceCase(category.name)}</TableCell>
                   
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setSelectedCategory(category); setIsEditCategoryModalOpen(true); }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCategory(category)}
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
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <AddExpenseCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onCategoryAdded={handleCategoryAdded}
      />

      <EditExpenseCategoryModal
        isOpen={isEditCategoryModalOpen}
        onClose={() => { setIsEditCategoryModalOpen(false); setSelectedCategory(null); }}
        onCategoryUpdated={handleCategoryAdded}
        category={selectedCategory}
      />

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Delete Category"
        message={`Are you sure you want to delete the "${categoryToDelete?.name}" category? This action cannot be undone.`}
        onConfirm={confirmDeleteCategory}
      />
    </div>
  );
};

export default CategoriesTab;
