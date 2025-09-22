import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Edit, 
  User,
  Phone,
  Mail,
  ShoppingBag,
  DollarSign,
  Calendar,
  Star,
  TrendingUp
} from "lucide-react";

const CustomerDetail = () => {
  const { id } = useParams();
  
  // Mock data - in real app, fetch by ID
  const customer = {
    id: parseInt(id || "1"),
    name: "Sarah Johnson",
    email: "sarah@email.com",
    phone: "(555) 123-4567",
    address: "123 Main St, Anytown, ST 12345",
    totalOrders: 15,
    totalSpent: 285.50,
    averageOrder: 19.03,
    lastOrder: "2024-01-22",
    firstOrder: "2023-06-15",
    status: "active",
    loyaltyPoints: 142,
    favoriteItems: [
      { name: "Chocolate Croissant", orders: 8, lastOrdered: "2024-01-22" },
      { name: "Cappuccino", orders: 12, lastOrdered: "2024-01-22" },
      { name: "Sourdough Bread", orders: 3, lastOrdered: "2024-01-18" }
    ],
    notes: "Prefers extra chocolate on pastries. Always orders cappuccino with croissants.",
    recentOrders: [
      { id: "ORD-025", date: "2024-01-22", total: 12.00, status: "completed", items: "2x Chocolate Croissant, 1x Cappuccino" },
      { id: "ORD-018", date: "2024-01-18", total: 24.50, status: "completed", items: "1x Sourdough, 3x Muffins" },
      { id: "ORD-012", date: "2024-01-15", total: 8.50, status: "completed", items: "1x Sourdough Bread" },
      { id: "ORD-006", date: "2024-01-10", total: 15.75, status: "completed", items: "3x Chocolate Croissant, 1x Coffee" }
    ]
  };

  const getStatusColor = (status: string) => {
    return status === "active" ? "default" : "secondary";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Layout>\r\n      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/customers">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Customers
              </Link>
            </Button>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{customer.name}</h1>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusColor(customer.status)}>
                  {customer.status}
                </Badge>
                <Badge variant="outline">
                  {customer.loyaltyPoints} loyalty points
                </Badge>
              </div>
            </div>
            <Button asChild className="shadow-warm">
              <Link to={`/customers/${customer.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Customer
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a href={`mailto:${customer.email}`} className="text-foreground hover:text-primary">
                        {customer.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <a href={`tel:${customer.phone}`} className="text-foreground hover:text-primary">
                        {customer.phone}
                      </a>
                    </div>
                  </div>
                </div>
                {customer.address && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Address</p>
                    <p className="text-foreground">{customer.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Favorite Items */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Favorite Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customer.favoriteItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Last ordered: {formatDate(item.lastOrdered)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{item.orders}</p>
                        <p className="text-sm text-muted-foreground">orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customer.recentOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <Link 
                            to={`/orders/${order.id}`}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {order.id}
                          </Link>
                          <Badge variant="outline">{order.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{order.items}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(order.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">${order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/orders">View All Orders</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Customer Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{customer.totalOrders}</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">${customer.totalSpent.toFixed(0)}</p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Average Order</span>
                    <span className="font-medium text-foreground">${customer.averageOrder.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Loyalty Points</span>
                    <span className="font-medium text-foreground">{customer.loyaltyPoints}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-medium text-foreground">{formatDate(customer.firstOrder)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Last Order</span>
                    <span className="font-medium text-foreground">{formatDate(customer.lastOrder)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {customer.notes && (
              <Card className="shadow-warm">
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">{customer.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="shadow-warm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link to="/orders/new">Create New Order</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`mailto:${customer.email}`}>Send Email</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`tel:${customer.phone}`}>Call Customer</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>\r\n    </Layout>
  );
};

export default CustomerDetail;


