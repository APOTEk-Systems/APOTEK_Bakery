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
  User,
  Phone,
  Mail,
  ShoppingBag,
  DollarSign
} from "lucide-react";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const customers = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@email.com",
      phone: "(555) 123-4567",
      totalOrders: 15,
      totalSpent: 285.50,
      lastOrder: "2024-01-22",
      status: "active",
      favoriteItems: ["Chocolate Croissant", "Cappuccino"],
      notes: "Prefers extra chocolate on pastries"
    },
    {
      id: 2,
      name: "Mike Chen",
      email: "mike@email.com", 
      phone: "(555) 234-5678",
      totalOrders: 8,
      totalSpent: 156.75,
      lastOrder: "2024-01-20",
      status: "active",
      favoriteItems: ["Sourdough Bread", "Blueberry Muffin"],
      notes: "Regular weekly bread order"
    },
    {
      id: 3,
      name: "Emma Davis",
      email: "emma@email.com",
      phone: "(555) 345-6789", 
      totalOrders: 3,
      totalSpent: 425.00,
      lastOrder: "2024-01-18",
      status: "active",
      favoriteItems: ["Custom Cakes"],
      notes: "Special occasion cakes only"
    },
    {
      id: 4,
      name: "John Smith",
      email: "john@email.com",
      phone: "(555) 456-7890",
      totalOrders: 22,
      totalSpent: 378.25,
      lastOrder: "2024-01-15",
      status: "inactive",
      favoriteItems: ["Red Velvet Cupcake", "Coffee"],
      notes: "Office catering orders"
    }
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    return status === "active" ? "default" : "secondary";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 ml-64 p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Customers</h1>
              <p className="text-muted-foreground">Manage your customer relationships</p>
            </div>
            <Button asChild className="shadow-warm">
              <Link to="/customers/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Link>
            </Button>
          </div>

          {/* Search */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="shadow-warm">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">48</p>
                    <p className="text-sm text-muted-foreground">Total Customers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-warm">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">42</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-warm">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">12.5</p>
                    <p className="text-sm text-muted-foreground">Avg Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-warm">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">$245</p>
                    <p className="text-sm text-muted-foreground">Avg Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Customers List */}
        <Card className="shadow-warm">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{customer.name}</h3>
                          <Badge variant={getStatusColor(customer.status)}>
                            {customer.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-center">
                        <div>
                          <p className="text-lg font-bold text-foreground">{customer.totalOrders}</p>
                          <p className="text-xs text-muted-foreground">Orders</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-foreground">${customer.totalSpent.toFixed(0)}</p>
                          <p className="text-xs text-muted-foreground">Total Spent</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Last: {formatDate(customer.lastOrder)}</p>
                          <div className="flex gap-1 mt-1">
                            {customer.favoriteItems.slice(0, 2).map((item, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {item.split(' ')[0]}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/customers/${customer.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/customers/${customer.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  
                  {customer.notes && (
                    <div className="mt-2 ml-16">
                      <p className="text-xs text-muted-foreground italic">"{customer.notes}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No customers found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? "Try adjusting your search" 
                : "Get started by adding your first customer"}
            </p>
            <Button asChild>
              <Link to="/customers/new">Add Customer</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Customers;