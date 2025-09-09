import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Clock,
  DollarSign,
  User,
  Calendar
} from "lucide-react";

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const orders = [
    {
      id: "ORD-001",
      customerName: "Sarah Johnson",
      customerEmail: "sarah@email.com",
      items: [
        { name: "Chocolate Croissant", quantity: 2, price: 4.25 },
        { name: "Coffee", quantity: 1, price: 3.50 }
      ],
      total: 12.00,
      status: "pending",
      orderDate: "2024-01-22T09:30:00Z",
      dueDate: "2024-01-22T16:00:00Z",
      notes: "Extra chocolate please"
    },
    {
      id: "ORD-002", 
      customerName: "Mike Chen",
      customerEmail: "mike@email.com",
      items: [
        { name: "Sourdough Bread", quantity: 1, price: 8.50 },
        { name: "Blueberry Muffin", quantity: 3, price: 3.00 }
      ],
      total: 17.50,
      status: "preparing",
      orderDate: "2024-01-22T10:15:00Z",
      dueDate: "2024-01-22T18:00:00Z",
      notes: ""
    },
    {
      id: "ORD-003",
      customerName: "Emma Davis",
      customerEmail: "emma@email.com", 
      items: [
        { name: "Wedding Cake (Custom)", quantity: 1, price: 185.00 }
      ],
      total: 185.00,
      status: "ready",
      orderDate: "2024-01-20T14:00:00Z",
      dueDate: "2024-01-25T12:00:00Z",
      notes: "3-tier vanilla cake with roses"
    },
    {
      id: "ORD-004",
      customerName: "John Smith",
      customerEmail: "john@email.com",
      items: [
        { name: "Red Velvet Cupcake", quantity: 12, price: 3.75 }
      ],
      total: 45.00,
      status: "completed",
      orderDate: "2024-01-21T11:00:00Z",
      dueDate: "2024-01-21T15:00:00Z",
      notes: "For office party"
    }
  ];

  const statuses = ["all", "pending", "preparing", "ready", "completed"];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "secondary";
      case "preparing": return "default";
      case "ready": return "outline";
      case "completed": return "outline";
      default: return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 ml-64 p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Orders</h1>
              <p className="text-muted-foreground">Manage customer orders and track preparation</p>
            </div>
            <Button asChild className="shadow-warm">
              <Link to="/orders/new">
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Link>
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {statuses.map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  onClick={() => setFilterStatus(status)}
                  size="sm"
                >
                  {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="shadow-warm">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">3</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-warm">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">5</p>
                    <p className="text-sm text-muted-foreground">Preparing</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-warm">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">2</p>
                    <p className="text-sm text-muted-foreground">Ready</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-warm">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">$485</p>
                    <p className="text-sm text-muted-foreground">Today's Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="shadow-warm hover:shadow-glow transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{order.id}</h3>
                      <Badge variant={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{order.customerName}</p>
                          <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-foreground">Ordered: {formatDate(order.orderDate)}</p>
                          <p className="text-sm text-muted-foreground">Due: {formatDate(order.dueDate)} at {formatTime(order.dueDate)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-lg font-bold text-foreground">${order.total.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">{order.items.length} item(s)</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Order Items */}
                    <div className="space-y-1 mb-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-foreground">{item.quantity}x {item.name}</span>
                          <span className="text-muted-foreground">${(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    {order.notes && (
                      <p className="text-sm text-muted-foreground italic">Note: {order.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/orders/${order.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/orders/${order.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No orders found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your search or filters" 
                : "Get started by creating your first order"}
            </p>
            <Button asChild>
              <Link to="/orders/new">Create Order</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;