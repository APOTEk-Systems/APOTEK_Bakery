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
  DollarSign,
  ShoppingCart,
  Calendar,
  Download,
  Eye,
  Receipt
} from "lucide-react";

const Sales = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock sales data
  const salesData = [
    {
      id: "TXN-001",
      date: "2024-01-15",
      time: "14:30",
      customer: "Sarah Johnson",
      items: [
        { name: "Chocolate Croissant", quantity: 2, price: 4.25 },
        { name: "Cappuccino", quantity: 1, price: 3.50 }
      ],
      subtotal: 12.00,
      tax: 0.96,
      total: 12.96,
      paymentMethod: "Credit Card",
      status: "completed"
    },
    {
      id: "TXN-002", 
      date: "2024-01-15",
      time: "15:45",
      customer: "Michael Chen",
      items: [
        { name: "Sourdough Bread", quantity: 1, price: 8.50 },
        { name: "Blueberry Muffin", quantity: 3, price: 3.00 }
      ],
      subtotal: 17.50,
      tax: 1.40,
      total: 18.90,
      paymentMethod: "Cash",
      status: "completed"
    },
    {
      id: "TXN-003",
      date: "2024-01-15", 
      time: "16:20",
      customer: "Emma Davis",
      items: [
        { name: "Red Velvet Cupcake", quantity: 6, price: 3.75 }
      ],
      subtotal: 22.50,
      tax: 1.80,
      total: 24.30,
      paymentMethod: "Credit Card",
      status: "refunded"
    }
  ];

  const todayStats = {
    totalSales: 2456.80,
    transactions: 47,
    averageTicket: 52.27,
    topProduct: "Chocolate Croissant"
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success/10 text-success border-success/20";
      case "refunded": return "bg-destructive/10 text-destructive border-destructive/20";
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      default: return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const filteredSales = salesData.filter(sale => {
    const matchesSearch = sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || sale.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 ml-64 p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Sales</h1>
              <p className="text-muted-foreground">Track daily sales and transactions</p>
            </div>
            <Button className="shadow-warm">
              <Plus className="h-4 w-4 mr-2" />
              New Sale
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Today's Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="shadow-warm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">${todayStats.totalSales.toFixed(2)}</div>
                  <p className="text-xs text-success">+12.5% from yesterday</p>
                </CardContent>
              </Card>

              <Card className="shadow-warm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{todayStats.transactions}</div>
                  <p className="text-xs text-success">+8 from yesterday</p>
                </CardContent>
              </Card>

              <Card className="shadow-warm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Ticket</CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">${todayStats.averageTicket.toFixed(2)}</div>
                  <p className="text-xs text-success">+2.1% from yesterday</p>
                </CardContent>
              </Card>

              <Card className="shadow-warm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Product</CardTitle>
                  <Receipt className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-foreground">{todayStats.topProduct}</div>
                  <p className="text-xs text-muted-foreground">23 sold today</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesData.slice(0, 5).map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Receipt className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{sale.id}</p>
                          <p className="text-sm text-muted-foreground">{sale.customer} • {sale.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">${sale.total.toFixed(2)}</p>
                        <Badge className={getStatusColor(sale.status)}>
                          {sale.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            {/* Filters */}
            <Card className="shadow-warm">
              <CardContent className="pt-6">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Transactions</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by customer or transaction ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
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

            {/* Transactions Table */}
            <Card className="shadow-warm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>All Transactions</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredSales.map((sale) => (
                    <div key={sale.id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Receipt className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{sale.id}</h3>
                            <p className="text-sm text-muted-foreground">{sale.date} at {sale.time}</p>
                            <p className="text-sm text-muted-foreground">Customer: {sale.customer}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">${sale.total.toFixed(2)}</p>
                          <Badge className={getStatusColor(sale.status)}>
                            {sale.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {sale.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm bg-muted/30 p-2 rounded">
                            <span>{item.quantity}x {item.name}</span>
                            <span>${(item.quantity * item.price).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-border">
                        <div className="text-sm text-muted-foreground">
                          Payment: {sale.paymentMethod}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            Receipt
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Sales Reports</CardTitle>
                <p className="text-muted-foreground">Generate detailed sales and performance reports</p>
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
                        <SelectItem value="daily">Daily Sales</SelectItem>
                        <SelectItem value="weekly">Weekly Summary</SelectItem>
                        <SelectItem value="monthly">Monthly Report</SelectItem>
                        <SelectItem value="product">Product Performance</SelectItem>
                        <SelectItem value="customer">Customer Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateRange">Date Range</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
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

export default Sales;