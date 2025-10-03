import Layout from "../components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExpensesTab from "../components/accounting/ExpensesTab";
import CategoriesTab from "../components/accounting/CategoriesTab";
// import OverviewTab from "../components/accounting/OverviewTab";
// import ReportsTab from "../components/accounting/ReportsTab";



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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-success/10 text-success border-success/20";
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      case "overdue": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const getCategoryColor = (category: string) => {
    // Fallback colors for legacy hardcoded categories
    const legacyColors: Record<string, string> = {
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

    // Check if it's a legacy category
    if (legacyColors[category]) {
      return legacyColors[category];
    }

    // Generate dynamic color based on category name hash
    const hash = category.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    // Predefined color palette for consistent, accessible colors
    const colorPalette = [
      "bg-blue-500/10 text-blue-600 border-blue-500/20",
      "bg-green-500/10 text-green-600 border-green-500/20",
      "bg-purple-500/10 text-purple-600 border-purple-500/20",
      "bg-pink-500/10 text-pink-600 border-pink-500/20",
      "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      "bg-red-500/10 text-red-600 border-red-500/20",
      "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      "bg-teal-500/10 text-teal-600 border-teal-500/20",
      "bg-orange-500/10 text-orange-600 border-orange-500/20",
      "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
      "bg-lime-500/10 text-lime-600 border-lime-500/20",
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      "bg-violet-500/10 text-violet-600 border-violet-500/20",
      "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20",
      "bg-rose-500/10 text-rose-600 border-rose-500/20",
      "bg-sky-500/10 text-sky-600 border-sky-500/20",
      "bg-amber-500/10 text-amber-600 border-amber-500/20",
      "bg-slate-500/10 text-slate-600 border-slate-500/20",
      "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
      "bg-neutral-500/10 text-neutral-600 border-neutral-500/20"
    ];

    // Use absolute value of hash to get consistent color for same category
    const colorIndex = Math.abs(hash) % colorPalette.length;
    return colorPalette[colorIndex];
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Accounting</h1>
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
    </Layout>
  );
};

export default Accounting;


