import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calculator,
  PieChart,
  FileText,
  Download,
  Eye,
  CreditCard,
  Receipt
} from "lucide-react";

const Accounting = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Mock financial data
  const monthlyOverview = {
    revenue: 45280.50,
    expenses: 28940.75,
    profit: 16339.75,
    profitMargin: 36.1
  };

  const expenses = [
    {
      id: "EXP-001",
      date: "2024-01-15",
      category: "Ingredients",
      description: "Flour, Sugar, Butter - Weekly Supply",
      vendor: "Premium Ingredients Co.",
      amount: 485.60,
      status: "paid",
      receiptUrl: "#"
    },
    {
      id: "EXP-002",
      date: "2024-01-14", 
      category: "Utilities",
      description: "Electricity Bill - January 2024",
      vendor: "City Power Company",
      amount: 234.50,
      status: "paid",
      receiptUrl: "#"
    },
    {
      id: "EXP-003",
      date: "2024-01-13",
      category: "Equipment",
      description: "Commercial Mixer Repair",
      vendor: "Bakery Equipment Services",
      amount: 320.00,
      status: "pending",
      receiptUrl: "#"
    },
    {
      id: "EXP-004",
      date: "2024-01-12",
      category: "Marketing",
      description: "Social Media Advertising - January",
      vendor: "Digital Marketing Pro",
      amount: 150.00,
      status: "paid",
      receiptUrl: "#"
    },
    {
      id: "EXP-005",
      date: "2024-01-11",
      category: "Rent",
      description: "Shop Rent - January 2024",
      vendor: "Property Management LLC",
      amount: 2800.00,
      status: "paid",
      receiptUrl: "#"
    }
  ];

  const categoryTotals = {
    "Ingredients": 2340.80,
    "Utilities": 456.50,
    "Equipment": 780.00,
    "Marketing": 300.00,
    "Rent": 2800.00,
    "Staff": 8500.00,
    "Insurance": 245.00,
    "Other": 150.45
  };

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
      "Ingredients": "bg-blue-500/10 text-blue-600 border-blue-500/20",
      "Utilities": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", 
      "Equipment": "bg-purple-500/10 text-purple-600 border-purple-500/20",
      "Marketing": "bg-green-500/10 text-green-600 border-green-500/20",
      "Rent": "bg-red-500/10 text-red-600 border-red-500/20",
      "Staff": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      "Insurance": "bg-pink-500/10 text-pink-600 border-pink-500/20",
      "Other": "bg-gray-500/10 text-gray-600 border-gray-500/20"
    };
    return colors[category as keyof typeof colors] || colors["Other"];
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 ml-64 p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Accounting</h1>
              <p className="text-muted-foreground">Track expenses and financial performance</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </Button>
              <Button className="shadow-warm">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="reports">Financial Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="shadow-warm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">${monthlyOverview.revenue.toLocaleString()}</div>
                  <p className="text-xs text-success">+15.2% from last month</p>
                </CardContent>
              </Card>

              <Card className="shadow-warm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">${monthlyOverview.expenses.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+3.1% from last month</p>
                </CardContent>
              </Card>

              <Card className="shadow-warm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">${monthlyOverview.profit.toLocaleString()}</div>
                  <p className="text-xs text-success">+18.7% from last month</p>
                </CardContent>
              </Card>

              <Card className="shadow-warm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                  <Calculator className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{monthlyOverview.profitMargin}%</div>
                  <p className="text-xs text-success">+2.3% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Expense Breakdown Chart */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Expense Breakdown by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(categoryTotals).map(([category, amount]) => (
                    <div key={category} className="text-center p-4 border border-border rounded-lg">
                      <Badge className={getCategoryColor(category)} variant="outline">
                        {category}
                      </Badge>
                      <p className="text-2xl font-bold text-foreground mt-2">${amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">This month</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Receipt className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{expense.description}</p>
                          <p className="text-sm text-muted-foreground">{expense.vendor} • {expense.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">${expense.amount.toFixed(2)}</p>
                        <Badge className={getStatusColor(expense.status)}>
                          {expense.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
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
                        <SelectItem value="Ingredients">Ingredients</SelectItem>
                        <SelectItem value="Utilities">Utilities</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Rent">Rent</SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                        <SelectItem value="Insurance">Insurance</SelectItem>
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
                <div className="space-y-4">
                  {filteredExpenses.map((expense) => (
                    <div key={expense.id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Receipt className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{expense.description}</h3>
                            <p className="text-sm text-muted-foreground">{expense.id} • {expense.date}</p>
                            <p className="text-sm text-muted-foreground">Vendor: {expense.vendor}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">${expense.amount.toFixed(2)}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge className={getCategoryColor(expense.category)} variant="outline">
                              {expense.category}
                            </Badge>
                            <Badge className={getStatusColor(expense.status)}>
                              {expense.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-border">
                        <div className="text-sm text-muted-foreground">
                          Category: {expense.category}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Receipt
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
                <p className="text-muted-foreground">Track spending by category</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(categoryTotals).map(([category, amount]) => (
                    <Card key={category} className="border border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getCategoryColor(category)} variant="outline">
                            {category}
                          </Badge>
                          <PieChart className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-foreground">${amount.toLocaleString()}</div>
                        <p className="text-sm text-muted-foreground">This month</p>
                        <div className="mt-3 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary rounded-full h-2" 
                            style={{ width: `${(amount / Math.max(...Object.values(categoryTotals))) * 100}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <p className="text-muted-foreground">Generate comprehensive financial reports</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reportType">Report Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="profit-loss">Profit & Loss Statement</SelectItem>
                        <SelectItem value="expense-summary">Expense Summary</SelectItem>
                        <SelectItem value="category-breakdown">Category Breakdown</SelectItem>
                        <SelectItem value="cash-flow">Cash Flow Statement</SelectItem>
                        <SelectItem value="tax-report">Tax Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period">Time Period</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="this-month">This Month</SelectItem>
                        <SelectItem value="last-month">Last Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Accounting;