import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  FileText,
} from "lucide-react";
import ExpensesTab from "../components/accounting/ExpensesTab";
import CategoriesTab from "../components/accounting/CategoriesTab";
// import OverviewTab from "../components/accounting/OverviewTab";
// import ReportsTab from "../components/accounting/ReportsTab";
import AddExpenseModal from "../components/accounting/AddExpenseModal";



const expenseCategories = [
  "electricity",
  "gas",
  "water",
  "transportation",
  "salaries",
  "rent",
  "communication",
  "maintenance",
  "Raw Materials",
  "Supplies",
  "Other",
];

const Accounting = () => {
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-success/10 text-success border-success/20";
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      case "overdue": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
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
    return colors[category as keyof typeof colors] || colors["Other"];
  };

  const handleExpenseAdded = () => {
    // Invalidate and refetch expenses queries
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    setIsAddExpenseModalOpen(false);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Accounting</h1>
              <p className="text-muted-foreground">Track expenses and financial performance</p>
            </div>
            <div className="flex gap-2">
              <Button className="shadow-warm" onClick={() => setIsAddExpenseModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="expenses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            {/* <TabsTrigger value="overview">Overview</TabsTrigger> */}
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            {/* <TabsTrigger value="reports">Financial Reports</TabsTrigger> */}
          </TabsList>

          {/* <TabsContent value="overview">
            <OverviewTab
              getStatusColor={getStatusColor}
            />
          </TabsContent> */}

          <TabsContent value="expenses">
            <ExpensesTab
              getCategoryColor={getCategoryColor}
              getStatusColor={getStatusColor}
            />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesTab
              expenseCategories={expenseCategories}
              // expenses={expenses} // Removed as ExpensesTab now manages its own data
              getCategoryColor={getCategoryColor}
            />
          </TabsContent>

          {/* <TabsContent value="reports">
            <ReportsTab />
          </TabsContent> */}
        </Tabs>
      </div>

      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        onExpenseAdded={handleExpenseAdded}
      />
    </Layout>
  );
};

export default Accounting;


